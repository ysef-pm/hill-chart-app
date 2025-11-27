// src/components/PomodoroTimer/hooks/usePomodoroRoom.js

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ref, set, get, push, update, onValue, onDisconnect, serverTimestamp, remove, runTransaction } from 'firebase/database';
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

  // Compute current user from participants
  const currentUser = useMemo(() => {
    return user?.uid ? participants[user.uid] : null;
  }, [user?.uid, participants]);

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

    try {
      const taskRef = ref(rtdb, `pomodoroRooms/${roomCode}/tasks/${taskId}`);
      const newCompleted = !task.completed;

      await update(taskRef, {
        completed: newCompleted,
        completedAt: newCompleted ? serverTimestamp() : null,
      });

      // Update garden stats using transaction to prevent race conditions
      if (newCompleted) {
        const completedTasksRef = ref(rtdb, `pomodoroRooms/${roomCode}/garden/completedTasks`);
        await runTransaction(completedTasksRef, (currentCount) => {
          return (currentCount || 0) + 1;
        });

        const lastHarvestRef = ref(rtdb, `pomodoroRooms/${roomCode}/garden/lastHarvest`);
        await set(lastHarvestRef, serverTimestamp());
      }
    } catch (err) {
      console.error('Error toggling task:', err);
      setError(err.message);
    }
  }, [roomCode, tasks]);

  const deleteTask = useCallback(async (taskId) => {
    if (!roomCode || !taskId) return;

    const taskRef = ref(rtdb, `pomodoroRooms/${roomCode}/tasks/${taskId}`);
    await remove(taskRef);
  }, [roomCode]);

  // Timer management
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const startTimer = useCallback(async (type = 'work', customDuration = null) => {
    if (!roomCode || !user?.uid) return;

    try {
      const duration = customDuration || (type === 'work' ? DEFAULT_WORK_DURATION : DEFAULT_BREAK_DURATION);
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
    } catch (err) {
      console.error('Error starting timer:', err);
      setError(err.message);
    }
  }, [roomCode, user?.uid, room?.timerMode, isHost]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const pauseTimer = useCallback(async () => {
    if (!roomCode || !user?.uid) return;

    try {
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
    } catch (err) {
      console.error('Error pausing timer:', err);
      setError(err.message);
    }
  }, [roomCode, user?.uid, room, currentUser, isHost]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const resumeTimer = useCallback(async () => {
    if (!roomCode || !user?.uid) return;

    try {
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
    } catch (err) {
      console.error('Error resuming timer:', err);
      setError(err.message);
    }
  }, [roomCode, user?.uid, room, currentUser, isHost]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const resetTimer = useCallback(async () => {
    if (!roomCode || !user?.uid) return;

    try {
      if (room?.timerMode === TIMER_MODES.TEAM && isHost) {
        const timerRef = ref(rtdb, `pomodoroRooms/${roomCode}/teamTimer`);
        await set(timerRef, null);
      } else {
        const personalTimerRef = ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/personalTimer`);
        await set(personalTimerRef, null);

        const statusRef = ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/status`);
        await set(statusRef, USER_STATUS.IDLE);
      }
    } catch (err) {
      console.error('Error resetting timer:', err);
      setError(err.message);
    }
  }, [roomCode, user?.uid, room?.timerMode, isHost]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const completePomodoro = useCallback(async () => {
    if (!roomCode || !user?.uid) return;

    try {
      // Increment room pomodoro count using transaction to prevent race conditions
      const gardenRef = ref(rtdb, `pomodoroRooms/${roomCode}/garden/totalPomodoros`);
      await runTransaction(gardenRef, (currentCount) => {
        return (currentCount || 0) + 1;
      });

      // Increment user's daily count using transaction to prevent race conditions
      const statsRef = ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/stats/pomodorosToday`);
      await runTransaction(statsRef, (currentCount) => {
        return (currentCount || 0) + 1;
      });

      // Set status to idle
      const statusRef = ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/status`);
      await set(statusRef, USER_STATUS.IDLE);
    } catch (err) {
      console.error('Error completing pomodoro:', err);
      setError(err.message);
    }
  }, [roomCode, user?.uid]);

  const setTimerMode = useCallback(async (mode) => {
    if (!roomCode || !isHost) return;

    const modeRef = ref(rtdb, `pomodoroRooms/${roomCode}/timerMode`);
    await set(modeRef, mode);

    // Reset team timer when switching modes
    const timerRef = ref(rtdb, `pomodoroRooms/${roomCode}/teamTimer`);
    await set(timerRef, null);
  }, [roomCode, isHost]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const updateSettings = useCallback(async (newSettings) => {
    if (!roomCode || !user?.uid) return;

    const settingsRef = ref(rtdb, `pomodoroRooms/${roomCode}/participants/${user.uid}/settings`);
    await update(settingsRef, newSettings);
  }, [roomCode, user?.uid]);

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
};
