# Tomato Task Garden Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a collaborative Pomodoro timer with shared tasks and garden gamification, following the RetroBoard room-joining pattern.

**Architecture:** Server-authoritative timer using Firebase RTDB for real-time sync. Hybrid timer mode (team/individual). Shared task list with tomato garden visualization for completed tasks.

**Tech Stack:** React, Firebase Realtime Database, Tailwind CSS, lucide-react icons

---

## Task 1: Create Base File Structure

**Files:**
- Create: `src/components/PomodoroTimer/index.js`
- Create: `src/components/PomodoroTimer/constants.js`

**Step 1: Create the export barrel**

```javascript
// src/components/PomodoroTimer/index.js

export { default as PomodoroApp } from './PomodoroApp';
```

**Step 2: Create constants file with room code generator and colors**

```javascript
// src/components/PomodoroTimer/constants.js

export const AVATAR_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#14B8A6', // teal
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
];

export const DEFAULT_WORK_DURATION = 25 * 60 * 1000; // 25 minutes in ms
export const DEFAULT_BREAK_DURATION = 5 * 60 * 1000; // 5 minutes in ms

export const TIMER_MODES = {
  TEAM: 'team',
  INDIVIDUAL: 'individual',
};

export const TIMER_TYPES = {
  WORK: 'work',
  BREAK: 'break',
};

export const USER_STATUS = {
  FOCUSING: 'focusing',
  BREAK: 'break',
  IDLE: 'idle',
};

export const GROWTH_STAGES = [
  { stage: 0, name: 'seed', icon: '🌱', description: 'Just planted' },
  { stage: 1, name: 'sprout', icon: '🌿', description: 'Growing' },
  { stage: 2, name: 'flower', icon: '🌼', description: 'Flowering' },
  { stage: 3, name: 'green', icon: '🟢', description: 'Almost ready' },
  { stage: 4, name: 'ripe', icon: '🍅', description: 'Harvested!' },
];

export const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const getRandomColor = () => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatTime = (ms) => {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
```

**Step 3: Verify files exist**

Run: `ls src/components/PomodoroTimer/`
Expected: `constants.js  index.js`

**Step 4: Commit**

```bash
git add src/components/PomodoroTimer/
git commit -m "feat(pomodoro): add base file structure and constants"
```

---

## Task 2: Create usePomodoroRoom Hook

**Files:**
- Create: `src/components/PomodoroTimer/hooks/usePomodoroRoom.js`

**Step 1: Create the hook with room management**

```javascript
// src/components/PomodoroTimer/hooks/usePomodoroRoom.js

import { useState, useEffect, useCallback } from 'react';
import { ref, set, get, push, update, onValue, onDisconnect, serverTimestamp, remove } from 'firebase/database';
import { rtdb } from '../../../firebase';
import { generateRoomCode, getRandomColor, DEFAULT_WORK_DURATION, DEFAULT_BREAK_DURATION, TIMER_MODES, USER_STATUS } from '../constants';

export const usePomodoroRoom = (user) => {
  const [roomCode, setRoomCode] = useState(null);
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState({});
  const [tasks, setTasks] = useState({});
  const [garden, setGarden] = useState({ totalPomodoros: 0, completedTasks: 0 });
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listen to room changes
  useEffect(() => {
    if (!roomCode) return;

    const roomRef = ref(rtdb, `pomodoroRooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRoom({
          name: data.name,
          createdAt: data.createdAt,
          hostId: data.hostId,
          timerMode: data.timerMode || TIMER_MODES.TEAM,
          teamTimer: data.teamTimer || null,
        });
        setParticipants(data.participants || {});
        setTasks(data.tasks || {});
        setGarden(data.garden || { totalPomodoros: 0, completedTasks: 0 });
        setIsHost(data.hostId === user?.uid);
      } else {
        setRoom(null);
        setParticipants({});
        setTasks({});
        setGarden({ totalPomodoros: 0, completedTasks: 0 });
        setError('Room not found');
      }
    });

    return () => unsubscribe();
  }, [roomCode, user?.uid]);

  // Set up presence
  useEffect(() => {
    if (!roomCode || !user?.uid) return;

    const presenceRef = ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/isOnline`);
    set(presenceRef, true);
    onDisconnect(presenceRef).set(false);

    return () => {
      set(presenceRef, false);
    };
  }, [roomCode, user?.uid]);

  const createRoom = useCallback(async (roomName, userName, avatarColor) => {
    if (!user) return null;
    setLoading(true);
    setError(null);

    try {
      const code = generateRoomCode();
      const roomRef = ref(rtdb, `pomodoroRooms/${code}`);

      await set(roomRef, {
        name: roomName || 'Focus Session',
        createdAt: serverTimestamp(),
        hostId: user.uid,
        timerMode: TIMER_MODES.TEAM,
        teamTimer: null,
        participants: {
          [user.uid]: {
            name: userName || user.displayName || 'Anonymous',
            avatarColor: avatarColor || getRandomColor(),
            isOnline: true,
            joinedAt: serverTimestamp(),
            status: USER_STATUS.IDLE,
            personalTimer: null,
            settings: {
              soundEnabled: true,
              notificationsEnabled: false,
            },
            stats: {
              pomodorosToday: 0,
            },
          },
        },
        tasks: {},
        garden: {
          totalPomodoros: 0,
          completedTasks: 0,
          lastHarvest: null,
        },
      });

      setRoomCode(code);
      setLoading(false);
      return code;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, [user]);

  const joinRoom = useCallback(async (code, userName, avatarColor) => {
    if (!user || !code) return false;
    setLoading(true);
    setError(null);

    try {
      const roomRef = ref(rtdb, `pomodoroRooms/${code}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setError('Room not found');
        setLoading(false);
        return false;
      }

      const userRef = ref(rtdb, `pomodoroRooms/${code}/participants/${user.uid}`);
      await set(userRef, {
        name: userName || user.displayName || 'Anonymous',
        avatarColor: avatarColor || getRandomColor(),
        isOnline: true,
        joinedAt: serverTimestamp(),
        status: USER_STATUS.IDLE,
        personalTimer: null,
        settings: {
          soundEnabled: true,
          notificationsEnabled: false,
        },
        stats: {
          pomodorosToday: 0,
        },
      });

      setRoomCode(code);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  }, [user]);

  const leaveRoom = useCallback(() => {
    setRoomCode(null);
    setRoom(null);
    setParticipants({});
    setTasks({});
    setGarden({ totalPomodoros: 0, completedTasks: 0 });
    setIsHost(false);
  }, []);

  // Task management
  const addTask = useCallback(async (text) => {
    if (!roomCode || !user?.uid || !text.trim()) return null;

    const tasksRef = ref(rtdb, `pomodoroRooms/${roomCode}/tasks`);
    const newTaskRef = push(tasksRef);

    await set(newTaskRef, {
      text: text.trim(),
      completed: false,
      completedAt: null,
      authorId: user.uid,
      authorName: participants[user.uid]?.name || user.displayName || 'Anonymous',
      createdAt: serverTimestamp(),
    });

    return newTaskRef.key;
  }, [roomCode, user, participants]);

  const toggleTask = useCallback(async (taskId) => {
    if (!roomCode || !taskId) return;

    const task = tasks[taskId];
    if (!task) return;

    const taskRef = ref(rtdb, `pomodoroRooms/${roomCode}/tasks/${taskId}`);
    const newCompleted = !task.completed;

    await update(taskRef, {
      completed: newCompleted,
      completedAt: newCompleted ? serverTimestamp() : null,
    });

    // Update garden stats
    if (newCompleted) {
      const gardenRef = ref(rtdb, `pomodoroRooms/${roomCode}/garden`);
      await update(gardenRef, {
        completedTasks: (garden.completedTasks || 0) + 1,
        lastHarvest: serverTimestamp(),
      });
    }
  }, [roomCode, tasks, garden]);

  const deleteTask = useCallback(async (taskId) => {
    if (!roomCode || !taskId) return;

    const taskRef = ref(rtdb, `pomodoroRooms/${roomCode}/tasks/${taskId}`);
    await remove(taskRef);
  }, [roomCode]);

  const currentUser = user?.uid ? participants[user.uid] : null;

  return {
    roomCode,
    room,
    participants,
    tasks,
    garden,
    currentUser,
    isHost,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    addTask,
    toggleTask,
    deleteTask,
  };
};
```

**Step 2: Verify file exists**

Run: `ls src/components/PomodoroTimer/hooks/`
Expected: `usePomodoroRoom.js`

**Step 3: Commit**

```bash
git add src/components/PomodoroTimer/hooks/
git commit -m "feat(pomodoro): add usePomodoroRoom hook with room and task management"
```

---

## Task 3: Add Timer Functions to Hook

**Files:**
- Modify: `src/components/PomodoroTimer/hooks/usePomodoroRoom.js`

**Step 1: Add timer control functions to the hook**

Add these functions inside `usePomodoroRoom` before the return statement:

```javascript
  // Timer management
  const startTimer = useCallback(async (type = 'work') => {
    if (!roomCode || !user?.uid) return;

    const duration = type === 'work' ? DEFAULT_WORK_DURATION : DEFAULT_BREAK_DURATION;
    const endTime = Date.now() + duration;

    if (room?.timerMode === TIMER_MODES.TEAM && isHost) {
      const timerRef = ref(rtdb, `pomodoroRooms/${roomCode}/teamTimer`);
      await set(timerRef, {
        endTime,
        isPaused: false,
        pausedRemaining: null,
        type,
        duration,
      });
    } else {
      const personalTimerRef = ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/personalTimer`);
      await set(personalTimerRef, {
        endTime,
        isPaused: false,
        pausedRemaining: null,
        type,
        duration,
      });

      const statusRef = ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/status`);
      await set(statusRef, type === 'work' ? USER_STATUS.FOCUSING : USER_STATUS.BREAK);
    }
  }, [roomCode, user?.uid, room?.timerMode, isHost]);

  const pauseTimer = useCallback(async () => {
    if (!roomCode || !user?.uid) return;

    const timer = room?.timerMode === TIMER_MODES.TEAM ? room?.teamTimer : currentUser?.personalTimer;
    if (!timer || timer.isPaused) return;

    const remaining = timer.endTime - Date.now();
    const timerRef = room?.timerMode === TIMER_MODES.TEAM && isHost
      ? ref(rtdb, `pomodoroRooms/${roomCode}/teamTimer`)
      : ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/personalTimer`);

    await update(timerRef, {
      isPaused: true,
      pausedRemaining: remaining,
      endTime: null,
    });
  }, [roomCode, user?.uid, room, currentUser, isHost]);

  const resumeTimer = useCallback(async () => {
    if (!roomCode || !user?.uid) return;

    const timer = room?.timerMode === TIMER_MODES.TEAM ? room?.teamTimer : currentUser?.personalTimer;
    if (!timer || !timer.isPaused) return;

    const newEndTime = Date.now() + timer.pausedRemaining;
    const timerRef = room?.timerMode === TIMER_MODES.TEAM && isHost
      ? ref(rtdb, `pomodoroRooms/${roomCode}/teamTimer`)
      : ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/personalTimer`);

    await update(timerRef, {
      isPaused: false,
      pausedRemaining: null,
      endTime: newEndTime,
    });
  }, [roomCode, user?.uid, room, currentUser, isHost]);

  const resetTimer = useCallback(async () => {
    if (!roomCode || !user?.uid) return;

    if (room?.timerMode === TIMER_MODES.TEAM && isHost) {
      const timerRef = ref(rtdb, `pomodoroRooms/${roomCode}/teamTimer`);
      await set(timerRef, null);
    } else {
      const personalTimerRef = ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/personalTimer`);
      await set(personalTimerRef, null);

      const statusRef = ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/status`);
      await set(statusRef, USER_STATUS.IDLE);
    }
  }, [roomCode, user?.uid, room?.timerMode, isHost]);

  const completePomodoro = useCallback(async () => {
    if (!roomCode || !user?.uid) return;

    // Increment room pomodoro count
    const gardenRef = ref(rtdb, `pomodoroRooms/${roomCode}/garden/totalPomodoros`);
    const gardenSnap = await get(gardenRef);
    await set(gardenRef, (gardenSnap.val() || 0) + 1);

    // Increment user's daily count
    const statsRef = ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/stats/pomodorosToday`);
    const statsSnap = await get(statsRef);
    await set(statsRef, (statsSnap.val() || 0) + 1);

    // Set status to idle
    const statusRef = ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/status`);
    await set(statusRef, USER_STATUS.IDLE);
  }, [roomCode, user?.uid]);

  const setTimerMode = useCallback(async (mode) => {
    if (!roomCode || !isHost) return;

    const modeRef = ref(rtdb, `pomodoroRooms/${roomCode}/timerMode`);
    await set(modeRef, mode);

    // Reset team timer when switching modes
    const timerRef = ref(rtdb, `pomodoroRooms/${roomCode}/teamTimer`);
    await set(timerRef, null);
  }, [roomCode, isHost]);

  const updateSettings = useCallback(async (newSettings) => {
    if (!roomCode || !user?.uid) return;

    const settingsRef = ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/settings`);
    await update(settingsRef, newSettings);
  }, [roomCode, user?.uid]);
```

**Step 2: Update the return statement to include new functions**

Replace the return statement with:

```javascript
  return {
    roomCode,
    room,
    participants,
    tasks,
    garden,
    currentUser,
    isHost,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    addTask,
    toggleTask,
    deleteTask,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    completePomodoro,
    setTimerMode,
    updateSettings,
  };
```

**Step 3: Commit**

```bash
git add src/components/PomodoroTimer/hooks/usePomodoroRoom.js
git commit -m "feat(pomodoro): add timer control functions to hook"
```

---

## Task 4: Create JoinRoomModal Component

**Files:**
- Create: `src/components/PomodoroTimer/JoinRoomModal.jsx`

**Step 1: Create the modal component**

```jsx
// src/components/PomodoroTimer/JoinRoomModal.jsx

import React, { useState } from 'react';
import { X, Users, Plus, Timer } from 'lucide-react';
import { AVATAR_COLORS, getInitials } from './constants';

const JoinRoomModal = ({ isOpen, onClose, onCreateRoom, onJoinRoom, user, loading, error }) => {
  const [mode, setMode] = useState('choose');
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState(user?.displayName || '');
  const [roomCode, setRoomCode] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    await onCreateRoom(roomName, userName, selectedColor);
  };

  const handleJoin = async () => {
    await onJoinRoom(roomCode.toUpperCase(), userName, selectedColor);
  };

  const resetAndClose = () => {
    setMode('choose');
    setRoomName('');
    setRoomCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍅</span>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'choose' && 'Tomato Task Garden'}
              {mode === 'create' && 'Create Focus Room'}
              {mode === 'join' && 'Join Focus Room'}
            </h2>
          </div>
          <button onClick={resetAndClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'choose' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 text-center mb-4">
                Grow productivity one tomato at a time
              </p>

              <button
                onClick={() => setMode('create')}
                className="w-full p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <Plus size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Create Focus Room</p>
                  <p className="text-sm text-slate-500">Start a new pomodoro session</p>
                </div>
              </button>

              <button
                onClick={() => setMode('join')}
                className="w-full p-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 rounded-xl flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Join Existing Room</p>
                  <p className="text-sm text-slate-500">Enter a room code to join</p>
                </div>
              </button>
            </div>
          )}

          {(mode === 'create' || mode === 'join') && (
            <div className="space-y-4">
              {mode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g., Sprint Focus Session"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              )}

              {mode === 'join' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="e.g., ABC123"
                    maxLength={6}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 uppercase tracking-widest text-center text-xl font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="How should we call you?"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pick Your Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <span className="text-white font-bold text-xs">
                          {getInitials(userName || 'You')}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setMode('choose')}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={mode === 'create' ? handleCreate : handleJoin}
                  disabled={loading || (mode === 'join' && roomCode.length !== 6)}
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-medium disabled:opacity-50 ${
                    mode === 'create'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {loading ? 'Loading...' : mode === 'create' ? 'Create Room' : 'Join Room'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinRoomModal;
```

**Step 2: Commit**

```bash
git add src/components/PomodoroTimer/JoinRoomModal.jsx
git commit -m "feat(pomodoro): add JoinRoomModal component"
```

---

## Task 5: Create Timer Components

**Files:**
- Create: `src/components/PomodoroTimer/Timer/TimerDisplay.jsx`
- Create: `src/components/PomodoroTimer/Timer/TimerControls.jsx`
- Create: `src/components/PomodoroTimer/Timer/DurationSliders.jsx`

**Step 1: Create TimerDisplay with circular progress**

```jsx
// src/components/PomodoroTimer/Timer/TimerDisplay.jsx

import React, { useState, useEffect } from 'react';
import { formatTime } from '../constants';

const TimerDisplay = ({ timer, timerMode }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (!timer) {
      setTimeRemaining(null);
      return;
    }

    if (timer.isPaused) {
      setTimeRemaining(timer.pausedRemaining);
      return;
    }

    if (!timer.endTime) {
      setTimeRemaining(timer.duration || null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = timer.endTime - Date.now();
      if (remaining <= 0) {
        setTimeRemaining(0);
        clearInterval(interval);
      } else {
        setTimeRemaining(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [timer?.endTime, timer?.isPaused, timer?.pausedRemaining, timer?.duration]);

  const duration = timer?.duration || 25 * 60 * 1000;
  const progress = timeRemaining !== null ? (timeRemaining / duration) * 100 : 100;
  const isRunning = timer && !timer.isPaused && timer.endTime;
  const isWork = timer?.type === 'work';

  // SVG circle properties
  const size = 240;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Timer mode indicator */}
      <div className="mb-2 text-sm text-slate-500">
        {timerMode === 'team' ? 'Team Timer' : 'Personal Timer'}
      </div>

      {/* Circular timer */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isWork ? '#EF4444' : '#22C55E'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-200 ${isRunning ? 'opacity-100' : 'opacity-70'}`}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-slate-900 font-mono">
            {formatTime(timeRemaining ?? duration)}
          </span>
          <span className={`text-sm font-medium mt-1 ${isWork ? 'text-red-500' : 'text-green-500'}`}>
            {timer ? (isWork ? 'Focus Session' : 'Break Time') : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
```

**Step 2: Create TimerControls**

```jsx
// src/components/PomodoroTimer/Timer/TimerControls.jsx

import React from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';

const TimerControls = ({
  timer,
  isHost,
  timerMode,
  onStart,
  onPause,
  onResume,
  onReset,
  onStartBreak,
  disabled
}) => {
  const isRunning = timer && !timer.isPaused && timer.endTime;
  const isPaused = timer?.isPaused;
  const isComplete = timer && !timer.isPaused && !timer.endTime && timer.type;
  const canControl = timerMode === 'individual' || isHost;

  if (!canControl) {
    return (
      <div className="text-center text-slate-500 text-sm py-4">
        Waiting for host to control the timer...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Main action button */}
      {!timer || isComplete ? (
        <button
          onClick={() => onStart('work')}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
        >
          <Play size={20} />
          Start Focus
        </button>
      ) : isPaused ? (
        <button
          onClick={onResume}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
        >
          <Play size={20} />
          Resume
        </button>
      ) : isRunning ? (
        <button
          onClick={onPause}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
        >
          <Pause size={20} />
          Pause
        </button>
      ) : null}

      {/* Break button (show after work session completes) */}
      {isComplete && timer?.type === 'work' && (
        <button
          onClick={() => onStartBreak()}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
        >
          <Coffee size={20} />
          Start Break
        </button>
      )}

      {/* Reset button */}
      {timer && (
        <button
          onClick={onReset}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium disabled:opacity-50 transition-colors"
        >
          <RotateCcw size={20} />
        </button>
      )}
    </div>
  );
};

export default TimerControls;
```

**Step 3: Create DurationSliders**

```jsx
// src/components/PomodoroTimer/Timer/DurationSliders.jsx

import React from 'react';
import { Timer, Coffee } from 'lucide-react';

const DurationSliders = ({
  workDuration,
  breakDuration,
  onWorkChange,
  onBreakChange,
  disabled
}) => {
  // Convert ms to minutes for display
  const workMinutes = Math.round(workDuration / 60000);
  const breakMinutes = Math.round(breakDuration / 60000);

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
      {/* Work duration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <span className="text-lg">🍅</span>
            Work
          </div>
          <span className="text-sm font-mono text-slate-600">{workMinutes} min</span>
        </div>
        <input
          type="range"
          min={5}
          max={60}
          step={5}
          value={workMinutes}
          onChange={(e) => onWorkChange(parseInt(e.target.value) * 60000)}
          disabled={disabled}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Break duration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <span className="text-lg">✓</span>
            Break
          </div>
          <span className="text-sm font-mono text-slate-600">{breakMinutes} min</span>
        </div>
        <input
          type="range"
          min={1}
          max={30}
          step={1}
          value={breakMinutes}
          onChange={(e) => onBreakChange(parseInt(e.target.value) * 60000)}
          disabled={disabled}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

export default DurationSliders;
```

**Step 4: Commit**

```bash
git add src/components/PomodoroTimer/Timer/
git commit -m "feat(pomodoro): add timer display, controls, and duration sliders"
```

---

## Task 6: Create Task Components

**Files:**
- Create: `src/components/PomodoroTimer/Tasks/TaskList.jsx`
- Create: `src/components/PomodoroTimer/Tasks/TaskItem.jsx`
- Create: `src/components/PomodoroTimer/Tasks/AddTaskInput.jsx`

**Step 1: Create TaskItem**

```jsx
// src/components/PomodoroTimer/Tasks/TaskItem.jsx

import React from 'react';
import { Trash2, Check } from 'lucide-react';

const TaskItem = ({ task, onToggle, onDelete }) => {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
      task.completed ? 'bg-green-50' : 'bg-white border border-slate-200'
    }`}>
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.completed
            ? 'bg-green-500 border-green-500'
            : 'border-slate-300 hover:border-green-400'
        }`}
      >
        {task.completed && <Check size={14} className="text-white" />}
      </button>

      {/* Task text */}
      <span className={`flex-1 text-sm ${
        task.completed ? 'text-green-700 line-through' : 'text-slate-700'
      }`}>
        {task.text}
      </span>

      {/* Author */}
      <span className="text-xs text-slate-400">
        {task.authorName}
      </span>

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default TaskItem;
```

**Step 2: Create AddTaskInput**

```jsx
// src/components/PomodoroTimer/Tasks/AddTaskInput.jsx

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const AddTaskInput = ({ onAdd, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onAdd(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new task..."
        disabled={disabled}
        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 transition-colors"
      >
        <Plus size={20} />
      </button>
    </form>
  );
};

export default AddTaskInput;
```

**Step 3: Create TaskList**

```jsx
// src/components/PomodoroTimer/Tasks/TaskList.jsx

import React from 'react';
import TaskItem from './TaskItem';
import AddTaskInput from './AddTaskInput';

const TaskList = ({ tasks, onAdd, onToggle, onDelete }) => {
  const taskArray = Object.entries(tasks || {}).map(([id, task]) => ({ id, ...task }));
  const incompleteTasks = taskArray.filter(t => !t.completed);
  const completedTasks = taskArray.filter(t => t.completed);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl">📝</span>
        <h3 className="font-bold text-slate-900">Task Garden</h3>
      </div>

      {/* Add task input */}
      <AddTaskInput onAdd={onAdd} />

      {/* Incomplete tasks */}
      <div className="space-y-2">
        {incompleteTasks.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No tasks yet. Add a task to get started!
          </p>
        ) : (
          incompleteTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => onToggle(task.id)}
              onDelete={() => onDelete(task.id)}
            />
          ))
        )}
      </div>

      {/* Completed tasks count */}
      {completedTasks.length > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <p className="text-sm text-green-600 font-medium">
            ✓ {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} completed
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
```

**Step 4: Commit**

```bash
git add src/components/PomodoroTimer/Tasks/
git commit -m "feat(pomodoro): add task list, item, and input components"
```

---

## Task 7: Create Garden Components

**Files:**
- Create: `src/components/PomodoroTimer/Garden/TomatoGarden.jsx`
- Create: `src/components/PomodoroTimer/Garden/TomatoPlant.jsx`
- Create: `src/components/PomodoroTimer/Garden/HarvestAnimation.jsx`

**Step 1: Create TomatoPlant**

```jsx
// src/components/PomodoroTimer/Garden/TomatoPlant.jsx

import React from 'react';
import { GROWTH_STAGES } from '../constants';

const TomatoPlant = ({ task }) => {
  const stage = GROWTH_STAGES[4]; // Completed = fully grown

  return (
    <div className="group relative">
      <div className="w-10 h-10 bg-white rounded-lg border-2 border-amber-200
                      flex items-center justify-center text-xl
                      hover:scale-110 transition-transform cursor-pointer
                      shadow-sm hover:shadow-md">
        {stage.icon}
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                      bg-slate-800 text-white text-xs rounded px-2 py-1
                      opacity-0 group-hover:opacity-100 transition-opacity
                      whitespace-nowrap pointer-events-none z-10">
        {task.text}
      </div>
    </div>
  );
};

export default TomatoPlant;
```

**Step 2: Create HarvestAnimation**

```jsx
// src/components/PomodoroTimer/Garden/HarvestAnimation.jsx

import React, { useEffect } from 'react';

const HarvestAnimation = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div className="text-6xl animate-bounce">
        🍅
      </div>
    </div>
  );
};

export default HarvestAnimation;
```

**Step 3: Create TomatoGarden**

```jsx
// src/components/PomodoroTimer/Garden/TomatoGarden.jsx

import React, { useState, useEffect } from 'react';
import TomatoPlant from './TomatoPlant';
import HarvestAnimation from './HarvestAnimation';

const TomatoGarden = ({ tasks, garden }) => {
  const [showHarvest, setShowHarvest] = useState(false);
  const [prevCompletedCount, setPrevCompletedCount] = useState(0);

  const completedTasks = Object.entries(tasks || {})
    .filter(([_, task]) => task.completed)
    .map(([id, task]) => ({ id, ...task }))
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  // Show harvest animation when a new task is completed
  useEffect(() => {
    if (completedTasks.length > prevCompletedCount && prevCompletedCount > 0) {
      setShowHarvest(true);
    }
    setPrevCompletedCount(completedTasks.length);
  }, [completedTasks.length, prevCompletedCount]);

  return (
    <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🍅</span>
        <h3 className="font-bold text-amber-800">Harvest Garden</h3>
        <span className="ml-auto text-sm text-amber-600">
          {garden.totalPomodoros} pomodoros
        </span>
      </div>

      {/* Garden plot */}
      {completedTasks.length === 0 ? (
        <p className="text-amber-600 text-sm text-center py-4">
          Complete tasks to grow your garden!
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {completedTasks.map((task) => (
            <TomatoPlant key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-amber-600">
        {garden.completedTasks} tasks harvested
      </div>

      {/* Harvest animation */}
      {showHarvest && (
        <HarvestAnimation onComplete={() => setShowHarvest(false)} />
      )}
    </div>
  );
};

export default TomatoGarden;
```

**Step 4: Commit**

```bash
git add src/components/PomodoroTimer/Garden/
git commit -m "feat(pomodoro): add garden visualization components"
```

---

## Task 8: Create Team Components

**Files:**
- Create: `src/components/PomodoroTimer/Team/MemberStatus.jsx`
- Create: `src/components/PomodoroTimer/Team/TimerModeToggle.jsx`
- Create: `src/components/PomodoroTimer/Team/ParticipantsBar.jsx`

**Step 1: Create MemberStatus**

```jsx
// src/components/PomodoroTimer/Team/MemberStatus.jsx

import React from 'react';
import { getInitials, USER_STATUS } from '../constants';

const MemberStatus = ({ participant }) => {
  const statusStyles = {
    [USER_STATUS.FOCUSING]: 'ring-red-500',
    [USER_STATUS.BREAK]: 'ring-green-500',
    [USER_STATUS.IDLE]: 'ring-slate-300',
  };

  const statusDotStyles = {
    [USER_STATUS.FOCUSING]: 'bg-red-500',
    [USER_STATUS.BREAK]: 'bg-green-500',
    [USER_STATUS.IDLE]: 'bg-slate-300',
  };

  const ringClass = statusStyles[participant.status] || statusStyles[USER_STATUS.IDLE];
  const dotClass = statusDotStyles[participant.status] || statusDotStyles[USER_STATUS.IDLE];

  return (
    <div className="relative group">
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center
                    text-white text-xs font-bold ring-2 ring-offset-2 ${ringClass}
                    ${!participant.isOnline ? 'opacity-50' : ''}`}
        style={{ backgroundColor: participant.avatarColor }}
      >
        {getInitials(participant.name)}
      </div>

      {/* Status dot */}
      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full
                       border-2 border-white ${dotClass}`}
      />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                      bg-slate-800 text-white text-xs rounded px-2 py-1
                      opacity-0 group-hover:opacity-100 whitespace-nowrap
                      pointer-events-none z-10 transition-opacity">
        {participant.name} - {participant.status || 'idle'}
        {!participant.isOnline && ' (offline)'}
      </div>
    </div>
  );
};

export default MemberStatus;
```

**Step 2: Create TimerModeToggle**

```jsx
// src/components/PomodoroTimer/Team/TimerModeToggle.jsx

import React, { useState } from 'react';
import { Users, User, ChevronDown } from 'lucide-react';
import { TIMER_MODES } from '../constants';

const TimerModeToggle = ({ mode, onToggle, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (newMode) => {
    if (newMode !== mode) {
      onToggle(newMode);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100
                   hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
      >
        {mode === TIMER_MODES.TEAM ? (
          <>
            <Users size={16} className="text-emerald-600" />
            <span className="text-sm font-medium">Team Timer</span>
          </>
        ) : (
          <>
            <User size={16} className="text-sky-600" />
            <span className="text-sm font-medium">Individual</span>
          </>
        )}
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-20">
          <button
            onClick={() => handleSelect(TIMER_MODES.TEAM)}
            className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-slate-50 ${
              mode === TIMER_MODES.TEAM ? 'bg-slate-50' : ''
            }`}
          >
            <Users size={16} className="text-emerald-600" />
            <span className="text-sm">Team Timer</span>
          </button>
          <button
            onClick={() => handleSelect(TIMER_MODES.INDIVIDUAL)}
            className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-slate-50 ${
              mode === TIMER_MODES.INDIVIDUAL ? 'bg-slate-50' : ''
            }`}
          >
            <User size={16} className="text-sky-600" />
            <span className="text-sm">Individual</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TimerModeToggle;
```

**Step 3: Create ParticipantsBar**

```jsx
// src/components/PomodoroTimer/Team/ParticipantsBar.jsx

import React from 'react';
import { Users, User } from 'lucide-react';
import MemberStatus from './MemberStatus';
import TimerModeToggle from './TimerModeToggle';
import { TIMER_MODES } from '../constants';

const ParticipantsBar = ({ participants, timerMode, isHost, onToggleMode, disabled }) => {
  const participantArray = Object.entries(participants || {}).map(([uid, p]) => ({ uid, ...p }));
  const onlineCount = participantArray.filter(p => p.isOnline).length;

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-3 border border-slate-200">
      {/* Timer mode toggle (host only) */}
      {isHost ? (
        <TimerModeToggle mode={timerMode} onToggle={onToggleMode} disabled={disabled} />
      ) : (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          {timerMode === TIMER_MODES.TEAM ? <Users size={16} /> : <User size={16} />}
          <span>{timerMode === TIMER_MODES.TEAM ? 'Team Timer' : 'Individual'}</span>
        </div>
      )}

      {/* Participant avatars */}
      <div className="flex -space-x-2 ml-auto">
        {participantArray.slice(0, 8).map((p) => (
          <MemberStatus key={p.uid} participant={p} />
        ))}
        {participantArray.length > 8 && (
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
            +{participantArray.length - 8}
          </div>
        )}
      </div>

      <span className="text-sm text-slate-500">{onlineCount} online</span>
    </div>
  );
};

export default ParticipantsBar;
```

**Step 4: Commit**

```bash
git add src/components/PomodoroTimer/Team/
git commit -m "feat(pomodoro): add team components (participants bar, status, mode toggle)"
```

---

## Task 9: Create Settings Component

**Files:**
- Create: `src/components/PomodoroTimer/Settings/NotificationSettings.jsx`

**Step 1: Create NotificationSettings**

```jsx
// src/components/PomodoroTimer/Settings/NotificationSettings.jsx

import React from 'react';
import { Volume2, Bell, VolumeX, BellOff } from 'lucide-react';

const NotificationSettings = ({ settings, onUpdate, disabled }) => {
  const requestNotificationPermission = async () => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onUpdate({ notificationsEnabled: true });
      }
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      onUpdate({ notificationsEnabled: true });
    }
  };

  const handleNotificationToggle = (enabled) => {
    if (enabled) {
      requestNotificationPermission();
    } else {
      onUpdate({ notificationsEnabled: false });
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
        <span>⚙️</span>
        Notifications
      </h3>

      <div className="space-y-3">
        {/* Sound toggle */}
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            {settings?.soundEnabled ? (
              <Volume2 size={18} className="text-slate-500" />
            ) : (
              <VolumeX size={18} className="text-slate-400" />
            )}
            <span className="text-sm text-slate-700">Play sound</span>
          </div>
          <input
            type="checkbox"
            checked={settings?.soundEnabled || false}
            onChange={(e) => onUpdate({ soundEnabled: e.target.checked })}
            disabled={disabled}
            className="w-5 h-5 rounded accent-red-500 cursor-pointer disabled:cursor-not-allowed"
          />
        </label>

        {/* Browser notification toggle */}
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            {settings?.notificationsEnabled ? (
              <Bell size={18} className="text-slate-500" />
            ) : (
              <BellOff size={18} className="text-slate-400" />
            )}
            <span className="text-sm text-slate-700">Browser alerts</span>
          </div>
          <input
            type="checkbox"
            checked={settings?.notificationsEnabled || false}
            onChange={(e) => handleNotificationToggle(e.target.checked)}
            disabled={disabled}
            className="w-5 h-5 rounded accent-red-500 cursor-pointer disabled:cursor-not-allowed"
          />
        </label>
      </div>
    </div>
  );
};

export default NotificationSettings;
```

**Step 2: Commit**

```bash
git add src/components/PomodoroTimer/Settings/
git commit -m "feat(pomodoro): add notification settings component"
```

---

## Task 10: Create Main PomodoroApp Component

**Files:**
- Create: `src/components/PomodoroTimer/PomodoroApp.jsx`

**Step 1: Create the main app component**

```jsx
// src/components/PomodoroTimer/PomodoroApp.jsx

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { usePomodoroRoom } from './hooks/usePomodoroRoom';
import { DEFAULT_WORK_DURATION, DEFAULT_BREAK_DURATION, TIMER_MODES } from './constants';
import JoinRoomModal from './JoinRoomModal';
import TimerDisplay from './Timer/TimerDisplay';
import TimerControls from './Timer/TimerControls';
import DurationSliders from './Timer/DurationSliders';
import TaskList from './Tasks/TaskList';
import TomatoGarden from './Garden/TomatoGarden';
import ParticipantsBar from './Team/ParticipantsBar';
import NotificationSettings from './Settings/NotificationSettings';

// Notification sound (simple beep using Web Audio API)
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;

    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 200);
  } catch (e) {
    console.warn('Could not play notification sound:', e);
  }
};

const PomodoroApp = ({ user, onBack }) => {
  const {
    roomCode,
    room,
    participants,
    tasks,
    garden,
    currentUser,
    isHost,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    addTask,
    toggleTask,
    deleteTask,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    completePomodoro,
    setTimerMode,
    updateSettings,
  } = usePomodoroRoom(user);

  const [showJoinModal, setShowJoinModal] = useState(true);
  const [copied, setCopied] = useState(false);
  const [workDuration, setWorkDuration] = useState(DEFAULT_WORK_DURATION);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_DURATION);
  const prevTimerRef = useRef(null);

  // Get current timer based on mode
  const currentTimer = room?.timerMode === TIMER_MODES.TEAM
    ? room?.teamTimer
    : currentUser?.personalTimer;

  // Close modal when room is joined
  useEffect(() => {
    if (roomCode) {
      setShowJoinModal(false);
    }
  }, [roomCode]);

  // Handle timer completion
  useEffect(() => {
    if (!currentTimer) {
      prevTimerRef.current = null;
      return;
    }

    const wasRunning = prevTimerRef.current?.endTime && !prevTimerRef.current?.isPaused;
    const isNowComplete = !currentTimer.endTime && !currentTimer.isPaused && currentTimer.type;

    if (wasRunning && isNowComplete) {
      // Timer just completed
      if (currentUser?.settings?.soundEnabled) {
        playNotificationSound();
      }

      if (currentUser?.settings?.notificationsEnabled &&
          typeof Notification !== 'undefined' &&
          Notification.permission === 'granted') {
        new Notification('Pomodoro Complete!', {
          body: currentTimer.type === 'work' ? 'Time for a break!' : 'Ready to focus?',
          icon: '/tomato-icon.png',
        });
      }

      if (currentTimer.type === 'work') {
        completePomodoro();
      }
    }

    prevTimerRef.current = currentTimer;
  }, [currentTimer, currentUser?.settings, completePomodoro]);

  // Check if timer just hit zero
  useEffect(() => {
    if (!currentTimer?.endTime || currentTimer?.isPaused) return;

    const checkCompletion = () => {
      const remaining = currentTimer.endTime - Date.now();
      if (remaining <= 0) {
        // Timer completed - reset it
        resetTimer();
      }
    };

    const interval = setInterval(checkCompletion, 100);
    return () => clearInterval(interval);
  }, [currentTimer?.endTime, currentTimer?.isPaused, resetTimer]);

  const handleBack = () => {
    if (roomCode) {
      leaveRoom();
      setShowJoinModal(true);
    } else {
      onBack();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartBreak = () => {
    startTimer('break');
  };

  const isTimerRunning = currentTimer && !currentTimer.isPaused && currentTimer.endTime;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍅</span>
              <div>
                <h1 className="font-bold text-slate-900">
                  {room?.name || 'Tomato Task Garden'}
                </h1>
                {roomCode && (
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                  >
                    <span className="font-mono">{roomCode}</span>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      {roomCode ? (
        <main className="max-w-6xl mx-auto p-4">
          {/* Participants bar */}
          <div className="mb-4">
            <ParticipantsBar
              participants={participants}
              timerMode={room?.timerMode || TIMER_MODES.TEAM}
              isHost={isHost}
              onToggleMode={setTimerMode}
              disabled={isTimerRunning}
            />
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column - Timer */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <TimerDisplay
                  timer={currentTimer}
                  timerMode={room?.timerMode}
                />

                <div className="mt-6">
                  <TimerControls
                    timer={currentTimer}
                    isHost={isHost}
                    timerMode={room?.timerMode}
                    onStart={startTimer}
                    onPause={pauseTimer}
                    onResume={resumeTimer}
                    onReset={resetTimer}
                    onStartBreak={handleStartBreak}
                    disabled={loading}
                  />
                </div>

                <div className="mt-6">
                  <DurationSliders
                    workDuration={workDuration}
                    breakDuration={breakDuration}
                    onWorkChange={setWorkDuration}
                    onBreakChange={setBreakDuration}
                    disabled={isTimerRunning}
                  />
                </div>

                <div className="mt-4">
                  <NotificationSettings
                    settings={currentUser?.settings}
                    onUpdate={updateSettings}
                    disabled={loading}
                  />
                </div>

                {/* Pomodoro counter */}
                <div className="mt-4 text-center text-sm text-slate-500">
                  <span className="text-lg">🍅</span> {currentUser?.stats?.pomodorosToday || 0} pomodoros today
                </div>
              </div>
            </div>

            {/* Right column - Tasks & Garden */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <TaskList
                  tasks={tasks}
                  onAdd={addTask}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              </div>

              <TomatoGarden tasks={tasks} garden={garden} />
            </div>
          </div>
        </main>
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center text-slate-500">
            <span className="text-4xl">🍅</span>
            <p className="mt-2">Create or join a room to get started</p>
          </div>
        </div>
      )}

      {/* Join modal */}
      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => roomCode ? setShowJoinModal(false) : onBack()}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        user={user}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default PomodoroApp;
```

**Step 2: Update the export barrel**

```javascript
// src/components/PomodoroTimer/index.js

export { default as PomodoroApp } from './PomodoroApp';
```

**Step 3: Commit**

```bash
git add src/components/PomodoroTimer/
git commit -m "feat(pomodoro): add main PomodoroApp component"
```

---

## Task 11: Add Launcher Card

**Files:**
- Modify: `src/components/Launcher.jsx`

**Step 1: Read current Launcher.jsx to understand structure**

Run: `head -100 src/components/Launcher.jsx`

**Step 2: Add Pomodoro Timer card to the tools array**

Add after the existing tool cards (look for the array of tool objects):

```jsx
{
  id: 'pomodoro',
  name: 'Pomodoro Timer',
  description: 'Collaborative focus timer with task garden',
  icon: '🍅',
  color: 'bg-red-500',
  component: 'PomodoroApp',
}
```

**Step 3: Import and render PomodoroApp**

Add import at top:
```jsx
import { PomodoroApp } from './PomodoroTimer';
```

Add case in the component render logic (where other tools are rendered):
```jsx
{activeTool === 'pomodoro' && (
  <PomodoroApp user={user} onBack={() => setActiveTool(null)} />
)}
```

**Step 4: Commit**

```bash
git add src/components/Launcher.jsx
git commit -m "feat(launcher): add Pomodoro Timer card"
```

---

## Task 12: Update Firebase RTDB Rules

**Manual Step - Firebase Console**

1. Go to Firebase Console → Your Project → Realtime Database → Rules

2. Add the `pomodoroRooms` rules alongside existing `retroRooms`:

```json
{
  "rules": {
    "retroRooms": {
      "$roomCode": {
        ".read": "auth != null",
        ".write": "auth != null && (!data.exists() || data.child('participants').child(auth.uid).exists() || newData.child('participants').child(auth.uid).exists())",
        "participants": {
          "$uid": {
            ".write": "auth != null && auth.uid === $uid"
          }
        },
        "items": {
          "$itemId": {
            ".write": "auth != null && root.child('retroRooms').child($roomCode).child('participants').child(auth.uid).exists()"
          }
        },
        "isRevealed": {
          ".write": "auth != null && data.parent().child('hostId').val() === auth.uid"
        }
      }
    },
    "pomodoroRooms": {
      "$roomCode": {
        ".read": "auth != null",
        ".write": "auth != null && (!data.exists() || data.child('participants').child(auth.uid).exists() || newData.child('participants').child(auth.uid).exists())",
        "name": {
          ".validate": "newData.isString() && newData.val().length <= 100"
        },
        "hostId": {
          ".validate": "newData.isString()"
        },
        "timerMode": {
          ".validate": "newData.val() === 'team' || newData.val() === 'individual'"
        },
        "teamTimer": {
          ".write": "auth != null && data.parent().child('hostId').val() === auth.uid",
          ".validate": "!newData.exists() || newData.hasChildren(['type', 'duration'])"
        },
        "participants": {
          "$uid": {
            ".write": "auth != null && auth.uid === $uid",
            ".validate": "newData.hasChildren(['name', 'avatarColor', 'isOnline'])"
          }
        },
        "tasks": {
          "$taskId": {
            ".write": "auth != null && root.child('pomodoroRooms').child($roomCode).child('participants').child(auth.uid).exists()",
            ".validate": "newData.hasChildren(['text', 'completed', 'authorId', 'createdAt'])"
          }
        },
        "garden": {
          ".write": "auth != null && root.child('pomodoroRooms').child($roomCode).child('participants').child(auth.uid).exists()"
        }
      }
    }
  }
}
```

3. Click "Publish"

---

## Task 13: Test the Feature

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test flow**

1. Login with Google
2. Click "Pomodoro Timer" card in Launcher
3. Create a new room with a name
4. Verify room code is generated
5. Start a timer
6. Add some tasks
7. Complete a task - verify tomato appears in garden
8. Test pause/resume
9. Open in second browser/incognito - join with room code
10. Verify real-time sync between participants

**Step 3: Run linting**

Run: `npm run lint`
Fix any errors that appear.

**Step 4: Final commit**

```bash
git add .
git commit -m "feat(pomodoro): complete Tomato Task Garden implementation"
```

---

## Summary

This implementation plan creates a collaborative Pomodoro timer with:

- **Room system** matching RetroBoard pattern (6-char codes, real-time sync)
- **Hybrid timer mode** (team or individual)
- **Server-authoritative timer** for accurate sync
- **Shared task list** with add/complete/delete
- **Garden visualization** with tomato plants for completed tasks
- **Team presence** showing who's focusing/on break
- **Configurable notifications** (sound + browser)

Total tasks: 13
Estimated commits: 12
