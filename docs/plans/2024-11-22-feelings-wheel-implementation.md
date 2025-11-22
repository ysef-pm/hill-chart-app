# Feelings Wheel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a collaborative 3-level feelings wheel for team retrospectives, integrated into the Dev Com Tools launcher.

**Architecture:** Firebase Realtime Database for real-time sync, modular React components, host-controlled reveal mechanism. Users authenticate via existing Google sign-in, create/join rooms with codes, and place pins on a 3-level emotion wheel.

**Tech Stack:** React, Firebase Realtime Database, Tailwind CSS, Lucide React icons

---

## Task 1: Firebase Realtime Database Setup

**Files:**
- Modify: `src/firebase.js`

**Step 1: Add Realtime Database import and export**

Open `src/firebase.js` and add the Realtime Database:

```javascript
// Add to existing imports
import { getDatabase } from 'firebase/database';

// Add after existing exports (after auth, db exports)
export const rtdb = getDatabase(app);
```

**Step 2: Verify the app still runs**

Run: `npm run dev`
Expected: App loads without errors, existing functionality works

**Step 3: Commit**

```bash
git add src/firebase.js
git commit -m "feat: add Firebase Realtime Database export"
```

---

## Task 2: Create Feelings Wheel Data Constants

**Files:**
- Create: `src/components/FeelingsWheel/constants.js`

**Step 1: Create the constants file with full wheel data**

```javascript
// src/components/FeelingsWheel/constants.js

export const FEELINGS_WHEEL = {
  Happy: {
    color: '#F9E076',
    secondary: {
      Playful: ['Aroused', 'Cheeky'],
      Content: ['Free', 'Joyful'],
      Interested: ['Curious', 'Inquisitive'],
      Proud: ['Successful', 'Confident'],
      Accepted: ['Respected', 'Valued'],
      Powerful: ['Courageous', 'Creative'],
      Peaceful: ['Loving', 'Thankful'],
      Trusting: ['Sensitive', 'Intimate'],
      Optimistic: ['Hopeful', 'Inspired'],
    }
  },
  Surprised: {
    color: '#C9A0D6',
    secondary: {
      Excited: ['Energetic', 'Eager'],
      Amazed: ['Awe', 'Astonished'],
      Confused: ['Perplexed', 'Disillusioned'],
      Startled: ['Dismayed', 'Shocked'],
    }
  },
  Bad: {
    color: '#B8A9C9',
    secondary: {
      Tired: ['Sleepy', 'Unfocused'],
      Stressed: ['Overwhelmed', 'Out of control'],
      Busy: ['Rushed', 'Pressured'],
      Bored: ['Apathetic', 'Indifferent'],
    }
  },
  Fearful: {
    color: '#96C9A8',
    secondary: {
      Scared: ['Helpless', 'Frightened'],
      Anxious: ['Overwhelmed', 'Worried'],
      Insecure: ['Inadequate', 'Inferior'],
      Weak: ['Worthless', 'Insignificant'],
      Rejected: ['Excluded', 'Persecuted'],
      Threatened: ['Nervous', 'Exposed'],
    }
  },
  Angry: {
    color: '#F4A9A0',
    secondary: {
      'Let down': ['Betrayed', 'Resentful'],
      Humiliated: ['Disrespected', 'Ridiculed'],
      Bitter: ['Indignant', 'Violated'],
      Mad: ['Furious', 'Jealous'],
      Aggressive: ['Provoked', 'Hostile'],
      Frustrated: ['Infuriated', 'Annoyed'],
      Distant: ['Withdrawn', 'Numb'],
      Critical: ['Skeptical', 'Dismissive'],
    }
  },
  Disgusted: {
    color: '#A8A8A8',
    secondary: {
      Disapproving: ['Judgmental', 'Embarrassed'],
      Disappointed: ['Appalled', 'Revolted'],
      Awful: ['Nauseated', 'Detestable'],
      Repelled: ['Horrified', 'Hesitant'],
    }
  },
  Sad: {
    color: '#8BBBD9',
    secondary: {
      Hurt: ['Embarrassed', 'Disappointed'],
      Depressed: ['Inferior', 'Empty'],
      Guilty: ['Remorseful', 'Ashamed'],
      Despair: ['Powerless', 'Grief'],
      Vulnerable: ['Fragile', 'Victimized'],
      Lonely: ['Abandoned', 'Isolated'],
    }
  },
};

export const AVATAR_STYLES = [
  { id: 'initials', label: 'Initials', icon: null },
  { id: 'cat', label: 'Cat', icon: '🐱' },
  { id: 'dog', label: 'Dog', icon: '🐕' },
  { id: 'rabbit', label: 'Rabbit', icon: '🐰' },
  { id: 'fish', label: 'Fish', icon: '🐟' },
  { id: 'bird', label: 'Bird', icon: '🐦' },
  { id: 'mouse', label: 'Mouse', icon: '🐭' },
  { id: 'bug', label: 'Bug', icon: '🐛' },
  { id: 'octocat', label: 'Octocat', icon: '🐙' },
];

export const AVATAR_COLORS = [
  { id: 'red', color: '#FF6B6B' },
  { id: 'orange', color: '#FFA94D' },
  { id: 'yellow', color: '#FFE066' },
  { id: 'lime', color: '#A9E34B' },
  { id: 'green', color: '#51CF66' },
  { id: 'cyan', color: '#22D3EE' },
  { id: 'blue', color: '#4C6EF5' },
  { id: 'purple', color: '#9775FA' },
  { id: 'pink', color: '#F472B6' },
];

export const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getRandomColor = () => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)].color;
};
```

**Step 2: Commit**

```bash
git add src/components/FeelingsWheel/constants.js
git commit -m "feat: add feelings wheel constants and helper functions"
```

---

## Task 3: Create useFeelingsRoom Hook

**Files:**
- Create: `src/components/FeelingsWheel/hooks/useFeelingsRoom.js`

**Step 1: Create the Firebase hook**

```javascript
// src/components/FeelingsWheel/hooks/useFeelingsRoom.js

import { useState, useEffect, useCallback } from 'react';
import { ref, set, get, onValue, onDisconnect, serverTimestamp, remove } from 'firebase/database';
import { rtdb } from '../../../firebase';
import { generateRoomCode, getRandomColor } from '../constants';

export const useFeelingsRoom = (user) => {
  const [roomCode, setRoomCode] = useState(null);
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState({});
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listen to room changes
  useEffect(() => {
    if (!roomCode) return;

    const roomRef = ref(rtdb, `feelingsRooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRoom({
          createdAt: data.createdAt,
          hostId: data.hostId,
          isRevealed: data.isRevealed || false,
        });
        setParticipants(data.participants || {});
        setIsHost(data.hostId === user?.uid);
      } else {
        setRoom(null);
        setParticipants({});
        setError('Room not found');
      }
    });

    return () => unsubscribe();
  }, [roomCode, user?.uid]);

  // Set up presence
  useEffect(() => {
    if (!roomCode || !user?.uid) return;

    const userRef = ref(rtdb, `feelingsRooms/${roomCode}/participants/${user.uid}`);
    const presenceRef = ref(rtdb, `feelingsRooms/${roomCode}/participants/${user.uid}/isOnline`);

    // Set online status
    set(presenceRef, true);

    // Set up disconnect handler
    onDisconnect(presenceRef).set(false);

    return () => {
      set(presenceRef, false);
    };
  }, [roomCode, user?.uid]);

  const createRoom = useCallback(async (name, avatarStyle, avatarColor) => {
    if (!user) return null;
    setLoading(true);
    setError(null);

    try {
      const code = generateRoomCode();
      const roomRef = ref(rtdb, `feelingsRooms/${code}`);

      await set(roomRef, {
        createdAt: serverTimestamp(),
        hostId: user.uid,
        isRevealed: false,
        participants: {
          [user.uid]: {
            name: name || user.displayName || 'Anonymous',
            avatarStyle: avatarStyle || 'initials',
            avatarColor: avatarColor || getRandomColor(),
            feeling: null,
            feelingPlacedAt: null,
            isOnline: true,
            joinedAt: serverTimestamp(),
          }
        }
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

  const joinRoom = useCallback(async (code, name, avatarStyle, avatarColor) => {
    if (!user || !code) return false;
    setLoading(true);
    setError(null);

    try {
      const roomRef = ref(rtdb, `feelingsRooms/${code}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setError('Room not found');
        setLoading(false);
        return false;
      }

      const userRef = ref(rtdb, `feelingsRooms/${code}/participants/${user.uid}`);
      await set(userRef, {
        name: name || user.displayName || 'Anonymous',
        avatarStyle: avatarStyle || 'initials',
        avatarColor: avatarColor || getRandomColor(),
        feeling: null,
        feelingPlacedAt: null,
        isOnline: true,
        joinedAt: serverTimestamp(),
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

  const updateAvatar = useCallback(async (avatarStyle, avatarColor) => {
    if (!roomCode || !user?.uid) return;

    const updates = {};
    if (avatarStyle) updates.avatarStyle = avatarStyle;
    if (avatarColor) updates.avatarColor = avatarColor;

    const userRef = ref(rtdb, `feelingsRooms/${roomCode}/participants/${user.uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      await set(userRef, { ...snapshot.val(), ...updates });
    }
  }, [roomCode, user?.uid]);

  const placeFeeling = useCallback(async (primary, secondary, tertiary) => {
    if (!roomCode || !user?.uid) return;

    const userRef = ref(rtdb, `feelingsRooms/${roomCode}/participants/${user.uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      await set(userRef, {
        ...snapshot.val(),
        feeling: { primary, secondary, tertiary },
        feelingPlacedAt: serverTimestamp(),
      });
    }
  }, [roomCode, user?.uid]);

  const removeFeeling = useCallback(async () => {
    if (!roomCode || !user?.uid) return;

    const userRef = ref(rtdb, `feelingsRooms/${roomCode}/participants/${user.uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      await set(userRef, {
        ...snapshot.val(),
        feeling: null,
        feelingPlacedAt: null,
      });
    }
  }, [roomCode, user?.uid]);

  const revealAll = useCallback(async () => {
    if (!roomCode || !isHost) return;
    const revealRef = ref(rtdb, `feelingsRooms/${roomCode}/isRevealed`);
    await set(revealRef, true);
  }, [roomCode, isHost]);

  const hideAll = useCallback(async () => {
    if (!roomCode || !isHost) return;
    const revealRef = ref(rtdb, `feelingsRooms/${roomCode}/isRevealed`);
    await set(revealRef, false);
  }, [roomCode, isHost]);

  const resetAll = useCallback(async () => {
    if (!roomCode || !isHost) return;

    // Clear all feelings but keep participants
    const participantsRef = ref(rtdb, `feelingsRooms/${roomCode}/participants`);
    const snapshot = await get(participantsRef);
    if (snapshot.exists()) {
      const updated = {};
      Object.entries(snapshot.val()).forEach(([id, participant]) => {
        updated[id] = {
          ...participant,
          feeling: null,
          feelingPlacedAt: null,
        };
      });
      await set(participantsRef, updated);
    }

    // Hide reveal
    const revealRef = ref(rtdb, `feelingsRooms/${roomCode}/isRevealed`);
    await set(revealRef, false);
  }, [roomCode, isHost]);

  const leaveRoom = useCallback(() => {
    setRoomCode(null);
    setRoom(null);
    setParticipants({});
    setIsHost(false);
  }, []);

  const currentUser = user?.uid ? participants[user.uid] : null;

  return {
    roomCode,
    room,
    participants,
    currentUser,
    isHost,
    loading,
    error,
    createRoom,
    joinRoom,
    updateAvatar,
    placeFeeling,
    removeFeeling,
    revealAll,
    hideAll,
    resetAll,
    leaveRoom,
  };
};
```

**Step 2: Commit**

```bash
git add src/components/FeelingsWheel/hooks/useFeelingsRoom.js
git commit -m "feat: add useFeelingsRoom hook for Firebase operations"
```

---

## Task 4: Create Avatar Component

**Files:**
- Create: `src/components/FeelingsWheel/Avatar.jsx`

**Step 1: Create the Avatar component**

```jsx
// src/components/FeelingsWheel/Avatar.jsx

import React from 'react';
import { getInitials, AVATAR_STYLES } from './constants';

const Avatar = ({ name, style = 'initials', color = '#4C6EF5', size = 'md', showOnline = false, isOnline = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const avatarStyle = AVATAR_STYLES.find(s => s.id === style);
  const displayContent = style === 'initials'
    ? getInitials(name)
    : avatarStyle?.icon || getInitials(name);

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white`}
        style={{ backgroundColor: color }}
      >
        {displayContent}
      </div>
      {showOnline && (
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
```

**Step 2: Commit**

```bash
git add src/components/FeelingsWheel/Avatar.jsx
git commit -m "feat: add Avatar component"
```

---

## Task 5: Create JoinRoomModal Component

**Files:**
- Create: `src/components/FeelingsWheel/JoinRoomModal.jsx`

**Step 1: Create the modal component**

```jsx
// src/components/FeelingsWheel/JoinRoomModal.jsx

import React, { useState } from 'react';
import { X, Shuffle } from 'lucide-react';
import { generateRoomCode } from './constants';

const JoinRoomModal = ({ onCreateRoom, onJoinRoom, onClose }) => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = () => {
    setRoomCode(generateRoomCode());
    setError('');
  };

  const handleJoin = () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    if (roomCode.trim().length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }
    onJoinRoom(roomCode.trim().toUpperCase());
  };

  const handleCreate = () => {
    const code = roomCode.trim() || generateRoomCode();
    onCreateRoom(code.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Join a Feelings Room</h2>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Room Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter code (e.g. ABC123)"
                maxLength={6}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest font-mono"
              />
              <button
                onClick={handleGenerate}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                title="Generate random code"
              >
                <Shuffle size={20} />
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <p className="text-slate-500 text-sm">
            Share this code with your team members so they can join the same room.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleJoin}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Join Room
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomModal;
```

**Step 2: Commit**

```bash
git add src/components/FeelingsWheel/JoinRoomModal.jsx
git commit -m "feat: add JoinRoomModal component"
```

---

## Task 6: Create AvatarSetupModal Component

**Files:**
- Create: `src/components/FeelingsWheel/AvatarSetupModal.jsx`

**Step 1: Create the modal component**

```jsx
// src/components/FeelingsWheel/AvatarSetupModal.jsx

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import Avatar from './Avatar';
import { AVATAR_STYLES, AVATAR_COLORS, getInitials, getRandomColor } from './constants';

const AvatarSetupModal = ({ user, onComplete, initialColor }) => {
  const name = user?.displayName || 'Anonymous';
  const [avatarStyle, setAvatarStyle] = useState('initials');
  const [avatarColor, setAvatarColor] = useState(initialColor || getRandomColor());

  const handleComplete = () => {
    onComplete(name, avatarStyle, avatarColor);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Customize Your Avatar</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="flex flex-col items-center gap-3">
            <Avatar name={name} style={avatarStyle} color={avatarColor} size="xl" />
            <p className="text-slate-600 font-medium">{name}</p>
          </div>

          {/* Avatar Style */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Avatar Style
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setAvatarStyle(style.id)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    avatarStyle === style.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-xl">
                      {style.icon || getInitials(name)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Avatar Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_COLORS.map((colorOption) => (
                <button
                  key={colorOption.id}
                  onClick={() => setAvatarColor(colorOption.color)}
                  className={`w-full aspect-square rounded-xl transition-all flex items-center justify-center ${
                    avatarColor === colorOption.color
                      ? 'ring-2 ring-offset-2 ring-blue-500'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: colorOption.color }}
                >
                  {avatarColor === colorOption.color && (
                    <Check size={20} className="text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            Join Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSetupModal;
```

**Step 2: Commit**

```bash
git add src/components/FeelingsWheel/AvatarSetupModal.jsx
git commit -m "feat: add AvatarSetupModal component"
```

---

## Task 7: Create Wheel Component (SVG)

**Files:**
- Create: `src/components/FeelingsWheel/Wheel.jsx`

**Step 1: Create the 3-level wheel SVG component**

```jsx
// src/components/FeelingsWheel/Wheel.jsx

import React, { useState, useMemo } from 'react';
import { FEELINGS_WHEEL } from './constants';

const Wheel = ({ onSelectFeeling, disabled = false }) => {
  const [selectedPrimary, setSelectedPrimary] = useState(null);
  const [selectedSecondary, setSelectedSecondary] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const primaryEmotions = Object.keys(FEELINGS_WHEEL);
  const centerX = 250;
  const centerY = 250;

  // Calculate path for a pie segment
  const createPieSegment = (startAngle, endAngle, innerRadius, outerRadius) => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + innerRadius * Math.cos(startAngleRad);
    const y1 = centerY + innerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(startAngleRad);
    const y2 = centerY + outerRadius * Math.sin(startAngleRad);
    const x3 = centerX + outerRadius * Math.cos(endAngleRad);
    const y3 = centerY + outerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(endAngleRad);
    const y4 = centerY + innerRadius * Math.sin(endAngleRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1} Z`;
  };

  // Lighten color for secondary/tertiary
  const lightenColor = (color, amount) => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + amount);
    const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const handlePrimaryClick = (emotion) => {
    if (disabled) return;
    if (selectedPrimary === emotion) {
      setSelectedPrimary(null);
      setSelectedSecondary(null);
    } else {
      setSelectedPrimary(emotion);
      setSelectedSecondary(null);
    }
  };

  const handleSecondaryClick = (emotion) => {
    if (disabled) return;
    if (selectedSecondary === emotion) {
      setSelectedSecondary(null);
    } else {
      setSelectedSecondary(emotion);
    }
  };

  const handleTertiaryClick = (tertiary) => {
    if (disabled) return;
    onSelectFeeling(selectedPrimary, selectedSecondary, tertiary);
    setSelectedPrimary(null);
    setSelectedSecondary(null);
  };

  // Build segments
  const segments = useMemo(() => {
    const result = [];
    const primaryAngle = 360 / primaryEmotions.length;

    primaryEmotions.forEach((primary, i) => {
      const startAngle = i * primaryAngle;
      const endAngle = (i + 1) * primaryAngle;
      const data = FEELINGS_WHEEL[primary];

      // Primary segment (inner ring)
      result.push({
        type: 'primary',
        emotion: primary,
        path: createPieSegment(startAngle, endAngle, 60, 120),
        color: data.color,
        startAngle,
        endAngle,
      });

      // Secondary segments (middle ring) - only if this primary is selected
      if (selectedPrimary === primary) {
        const secondaryEmotions = Object.keys(data.secondary);
        const secondaryAngle = (endAngle - startAngle) / secondaryEmotions.length;

        secondaryEmotions.forEach((secondary, j) => {
          const secStart = startAngle + j * secondaryAngle;
          const secEnd = startAngle + (j + 1) * secondaryAngle;

          result.push({
            type: 'secondary',
            emotion: secondary,
            primary,
            path: createPieSegment(secStart, secEnd, 125, 180),
            color: lightenColor(data.color, 30),
            startAngle: secStart,
            endAngle: secEnd,
          });

          // Tertiary segments (outer ring) - only if this secondary is selected
          if (selectedSecondary === secondary) {
            const tertiaryEmotions = data.secondary[secondary];
            const tertiaryAngle = (secEnd - secStart) / tertiaryEmotions.length;

            tertiaryEmotions.forEach((tertiary, k) => {
              const terStart = secStart + k * tertiaryAngle;
              const terEnd = secStart + (k + 1) * tertiaryAngle;

              result.push({
                type: 'tertiary',
                emotion: tertiary,
                primary,
                secondary,
                path: createPieSegment(terStart, terEnd, 185, 240),
                color: lightenColor(data.color, 60),
                startAngle: terStart,
                endAngle: terEnd,
              });
            });
          }
        });
      }
    });

    return result;
  }, [selectedPrimary, selectedSecondary]);

  return (
    <div className="relative">
      <svg viewBox="0 0 500 500" className="w-full max-w-lg mx-auto">
        {segments.map((segment, i) => (
          <path
            key={`${segment.type}-${segment.emotion}-${i}`}
            d={segment.path}
            fill={segment.color}
            stroke="white"
            strokeWidth="2"
            className={`transition-all duration-200 ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
            } ${hoveredSegment === `${segment.type}-${segment.emotion}` ? 'opacity-80' : ''}`}
            onMouseEnter={() => setHoveredSegment(`${segment.type}-${segment.emotion}`)}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => {
              if (segment.type === 'primary') handlePrimaryClick(segment.emotion);
              else if (segment.type === 'secondary') handleSecondaryClick(segment.emotion);
              else if (segment.type === 'tertiary') handleTertiaryClick(segment.emotion);
            }}
          />
        ))}

        {/* Center label */}
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-medium fill-slate-600 pointer-events-none"
        >
          {hoveredSegment ? hoveredSegment.split('-')[1] : 'How are you feeling?'}
        </text>
      </svg>

      {/* Breadcrumb */}
      {(selectedPrimary || selectedSecondary) && (
        <div className="text-center mt-4 text-sm text-slate-600">
          {selectedPrimary && <span className="font-medium">{selectedPrimary}</span>}
          {selectedSecondary && <span> → <span className="font-medium">{selectedSecondary}</span></span>}
          {selectedSecondary && <span className="text-slate-400"> → Select tertiary</span>}
          {selectedPrimary && !selectedSecondary && <span className="text-slate-400"> → Select secondary</span>}
        </div>
      )}
    </div>
  );
};

export default Wheel;
```

**Step 2: Commit**

```bash
git add src/components/FeelingsWheel/Wheel.jsx
git commit -m "feat: add 3-level Wheel SVG component"
```

---

## Task 8: Create YourFeelingCard Component

**Files:**
- Create: `src/components/FeelingsWheel/YourFeelingCard.jsx`

**Step 1: Create the component**

```jsx
// src/components/FeelingsWheel/YourFeelingCard.jsx

import React from 'react';
import { Trash2 } from 'lucide-react';
import Avatar from './Avatar';

const YourFeelingCard = ({ participant, onRemove }) => {
  const feeling = participant?.feeling;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <h3 className="text-sm font-medium text-slate-500 mb-3">Your Feeling</h3>

      {feeling ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              name={participant.name}
              style={participant.avatarStyle}
              color={participant.avatarColor}
              size="md"
            />
            <div>
              <p className="font-medium text-slate-900">{participant.name}</p>
              <p className="text-sm text-slate-600">
                {feeling.primary} → {feeling.secondary} → {feeling.tertiary}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ) : (
        <p className="text-slate-400 text-sm">
          Click on the wheel to place your feeling
        </p>
      )}
    </div>
  );
};

export default YourFeelingCard;
```

**Step 2: Commit**

```bash
git add src/components/FeelingsWheel/YourFeelingCard.jsx
git commit -m "feat: add YourFeelingCard component"
```

---

## Task 9: Create RoomInfoBar Component

**Files:**
- Create: `src/components/FeelingsWheel/RoomInfoBar.jsx`

**Step 1: Create the component**

```jsx
// src/components/FeelingsWheel/RoomInfoBar.jsx

import React from 'react';
import { Copy, Check } from 'lucide-react';
import Avatar from './Avatar';

const RoomInfoBar = ({ roomCode, participants, currentUserId }) => {
  const [copied, setCopied] = React.useState(false);

  const participantList = Object.entries(participants || {});
  const pinsPlaced = participantList.filter(([_, p]) => p.feeling).length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Room</p>
            <p className="font-mono font-bold text-slate-900">{roomCode}</p>
          </div>

          <div className="flex -space-x-2">
            {participantList.slice(0, 5).map(([id, participant]) => (
              <Avatar
                key={id}
                name={participant.name}
                style={participant.avatarStyle}
                color={participant.avatarColor}
                size="sm"
                showOnline
                isOnline={participant.isOnline}
              />
            ))}
            {participantList.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                +{participantList.length - 5}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-500">
            {pinsPlaced}/{participantList.length} pins placed
          </p>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomInfoBar;
```

**Step 2: Commit**

```bash
git add src/components/FeelingsWheel/RoomInfoBar.jsx
git commit -m "feat: add RoomInfoBar component"
```

---

## Task 10: Create ParticipantsPanel Component

**Files:**
- Create: `src/components/FeelingsWheel/ParticipantsPanel.jsx`

**Step 1: Create the component**

```jsx
// src/components/FeelingsWheel/ParticipantsPanel.jsx

import React from 'react';
import { X, Check, Clock } from 'lucide-react';
import Avatar from './Avatar';

const ParticipantsPanel = ({ isOpen, onClose, roomCode, participants, currentUserId }) => {
  if (!isOpen) return null;

  const participantList = Object.entries(participants || {});

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-900">Room: {roomCode}</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-slate-500">Participants: {participantList.length}</p>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
            All Participants
          </h3>

          <div className="space-y-3">
            {participantList.map(([id, participant]) => (
              <div
                key={id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={participant.name}
                    style={participant.avatarStyle}
                    color={participant.avatarColor}
                    size="md"
                    showOnline
                    isOnline={participant.isOnline}
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      {participant.name}
                      {id === currentUserId && (
                        <span className="text-slate-400 font-normal"> (You)</span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500">
                      {participant.feeling ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Check size={14} /> Placed pin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock size={14} /> Waiting...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ParticipantsPanel;
```

**Step 2: Commit**

```bash
git add src/components/FeelingsWheel/ParticipantsPanel.jsx
git commit -m "feat: add ParticipantsPanel component"
```

---

## Task 11: Create TeamFeelingsTable Component

**Files:**
- Create: `src/components/FeelingsWheel/TeamFeelingsTable.jsx`

**Step 1: Create the component**

```jsx
// src/components/FeelingsWheel/TeamFeelingsTable.jsx

import React from 'react';
import { X } from 'lucide-react';
import Avatar from './Avatar';
import { FEELINGS_WHEEL } from './constants';

const TeamFeelingsTable = ({ isOpen, onClose, roomCode, participants }) => {
  if (!isOpen) return null;

  const participantsWithFeelings = Object.entries(participants || {})
    .filter(([_, p]) => p.feeling)
    .sort((a, b) => (b[1].feelingPlacedAt || 0) - (a[1].feelingPlacedAt || 0));

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Team Feelings</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {participantsWithFeelings.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No feelings placed yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Participant</th>
                  <th className="pb-3 font-medium">Feeling</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participantsWithFeelings.map(([id, participant]) => (
                  <tr key={id}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={participant.name}
                          style={participant.avatarStyle}
                          color={participant.avatarColor}
                          size="sm"
                        />
                        <span className="font-medium text-slate-900">
                          {participant.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: FEELINGS_WHEEL[participant.feeling.primary]?.color,
                          }}
                        />
                        <span className="text-slate-600">
                          {participant.feeling.primary} → {participant.feeling.secondary} → {participant.feeling.tertiary}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-500 text-sm">
                      {formatTime(participant.feelingPlacedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 text-center text-sm text-slate-500">
          Feelings mapped for room {roomCode}
        </div>
      </div>
    </div>
  );
};

export default TeamFeelingsTable;
```

**Step 2: Commit**

```bash
git add src/components/FeelingsWheel/TeamFeelingsTable.jsx
git commit -m "feat: add TeamFeelingsTable component"
```

---

## Task 12: Create Main FeelingsWheelApp Component

**Files:**
- Create: `src/components/FeelingsWheel/FeelingsWheelApp.jsx`

**Step 1: Create the main container component**

```jsx
// src/components/FeelingsWheel/FeelingsWheelApp.jsx

import React, { useState } from 'react';
import { ArrowLeft, Users, Eye, EyeOff, Table, RotateCcw } from 'lucide-react';
import { useFeelingsRoom } from './hooks/useFeelingsRoom';
import { getRandomColor } from './constants';
import JoinRoomModal from './JoinRoomModal';
import AvatarSetupModal from './AvatarSetupModal';
import Wheel from './Wheel';
import YourFeelingCard from './YourFeelingCard';
import RoomInfoBar from './RoomInfoBar';
import ParticipantsPanel from './ParticipantsPanel';
import TeamFeelingsTable from './TeamFeelingsTable';

const FeelingsWheelApp = ({ user, onBack }) => {
  const [showAvatarSetup, setShowAvatarSetup] = useState(false);
  const [pendingRoomAction, setPendingRoomAction] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [initialColor] = useState(getRandomColor());

  const {
    roomCode,
    room,
    participants,
    currentUser,
    isHost,
    loading,
    error,
    createRoom,
    joinRoom,
    placeFeeling,
    removeFeeling,
    revealAll,
    hideAll,
    resetAll,
    leaveRoom,
  } = useFeelingsRoom(user);

  const handleCreateRoom = (code) => {
    setPendingRoomAction({ type: 'create', code });
    setShowAvatarSetup(true);
  };

  const handleJoinRoom = (code) => {
    setPendingRoomAction({ type: 'join', code });
    setShowAvatarSetup(true);
  };

  const handleAvatarComplete = async (name, avatarStyle, avatarColor) => {
    if (pendingRoomAction?.type === 'create') {
      await createRoom(name, avatarStyle, avatarColor);
    } else if (pendingRoomAction?.type === 'join') {
      await joinRoom(pendingRoomAction.code, name, avatarStyle, avatarColor);
    }
    setShowAvatarSetup(false);
    setPendingRoomAction(null);
  };

  const handleSelectFeeling = (primary, secondary, tertiary) => {
    placeFeeling(primary, secondary, tertiary);
  };

  const handleBack = () => {
    if (roomCode) {
      leaveRoom();
    } else {
      onBack();
    }
  };

  const participantCount = Object.keys(participants).length;
  const isRevealed = room?.isRevealed;

  // Show join modal if not in a room
  if (!roomCode && !showAvatarSetup) {
    return (
      <>
        <JoinRoomModal
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onClose={onBack}
        />
      </>
    );
  }

  // Show avatar setup
  if (showAvatarSetup) {
    return (
      <AvatarSetupModal
        user={user}
        onComplete={handleAvatarComplete}
        initialColor={initialColor}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Feelings Wheel</h1>
              <p className="text-sm text-slate-500">Place your pin to share how you're feeling</p>
            </div>
          </div>

          <button
            onClick={() => setShowParticipants(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
          >
            <Users size={18} />
            {participantCount} Participant{participantCount !== 1 ? 's' : ''}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Wheel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <Wheel
            onSelectFeeling={handleSelectFeeling}
            disabled={!!currentUser?.feeling}
          />
        </div>

        {/* Your Feeling Card */}
        <YourFeelingCard
          participant={currentUser}
          onRemove={removeFeeling}
        />

        {/* Control Buttons */}
        <div className="flex flex-col items-center gap-3">
          {isHost ? (
            <>
              {!isRevealed ? (
                <button
                  onClick={revealAll}
                  disabled={!Object.values(participants).some(p => p.feeling)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                >
                  <Eye size={20} />
                  Reveal All Feelings
                </button>
              ) : (
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={hideAll}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    <EyeOff size={18} />
                    Hide All
                  </button>
                  <button
                    onClick={() => setShowTable(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    <Table size={18} />
                    Show Table
                  </button>
                  <button
                    onClick={resetAll}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors"
                  >
                    <RotateCcw size={18} />
                    Reset All
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-500 text-sm">
              {isRevealed ? 'Feelings have been revealed!' : 'Waiting for host to reveal feelings...'}
            </p>
          )}
        </div>

        {/* Room Info Bar */}
        <RoomInfoBar
          roomCode={roomCode}
          participants={participants}
          currentUserId={user?.uid}
        />

        {error && (
          <p className="text-center text-red-500 text-sm">{error}</p>
        )}
      </main>

      {/* Participants Panel */}
      <ParticipantsPanel
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        roomCode={roomCode}
        participants={participants}
        currentUserId={user?.uid}
      />

      {/* Team Feelings Table */}
      <TeamFeelingsTable
        isOpen={showTable}
        onClose={() => setShowTable(false)}
        roomCode={roomCode}
        participants={participants}
      />
    </div>
  );
};

export default FeelingsWheelApp;
```

**Step 2: Commit**

```bash
git add src/components/FeelingsWheel/FeelingsWheelApp.jsx
git commit -m "feat: add main FeelingsWheelApp container component"
```

---

## Task 13: Create Index Export File

**Files:**
- Create: `src/components/FeelingsWheel/index.js`

**Step 1: Create the index export**

```javascript
// src/components/FeelingsWheel/index.js

export { default as FeelingsWheelApp } from './FeelingsWheelApp';
export { default as Wheel } from './Wheel';
export { default as Avatar } from './Avatar';
export * from './constants';
```

**Step 2: Commit**

```bash
git add src/components/FeelingsWheel/index.js
git commit -m "feat: add FeelingsWheel index exports"
```

---

## Task 14: Update App.jsx to Include Feelings Wheel Route

**Files:**
- Modify: `src/App.jsx`

**Step 1: Read current App.jsx**

Run: `cat src/App.jsx` to see current structure

**Step 2: Add import and route**

Add import at top:
```javascript
import { FeelingsWheelApp } from './components/FeelingsWheel';
```

Add case in the switch/conditional where `selectedApp` is handled:
```javascript
case 'feelings-wheel':
  return <FeelingsWheelApp user={user} onBack={() => setSelectedApp(null)} />;
```

**Step 3: Verify the app compiles**

Run: `npm run dev`
Expected: No errors

**Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add feelings-wheel route to App.jsx"
```

---

## Task 15: Update Launcher to Enable Feelings Wheel

**Files:**
- Modify: `src/components/Launcher.jsx`

**Step 1: Update the Feelings Wheel card**

Replace the disabled/coming soon card with an active button:

```jsx
{/* Feelings Wheel Card */}
<button
    onClick={() => onSelectApp('feelings-wheel')}
    className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-purple-200 transition-all text-left relative overflow-hidden"
>
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Smile size={120} className="text-purple-600" />
    </div>

    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Smile size={24} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">Feelings Wheel</h3>
    <p className="text-slate-500 text-sm leading-relaxed">
        Share how you're feeling during standups and retrospectives with your team.
    </p>
</button>
```

**Step 2: Verify the launcher shows the active button**

Run: `npm run dev`
Navigate to launcher and verify Feelings Wheel is clickable

**Step 3: Commit**

```bash
git add src/components/Launcher.jsx
git commit -m "feat: enable Feelings Wheel in Launcher"
```

---

## Task 16: End-to-End Test

**Step 1: Start the dev server**

Run: `npm run dev`

**Step 2: Manual testing checklist**

- [ ] Login with Google
- [ ] Click Feelings Wheel in Launcher
- [ ] Create a new room (generates code)
- [ ] Customize avatar (style + color)
- [ ] Click through wheel: Primary → Secondary → Tertiary
- [ ] See feeling in "Your Feeling" card
- [ ] Delete feeling and re-place
- [ ] Click "Reveal All Feelings" (as host)
- [ ] Open Participants panel
- [ ] Open Team Feelings table
- [ ] Test "Hide All" and "Reset All"
- [ ] Copy room code and join from incognito window
- [ ] Verify real-time sync between participants

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Feelings Wheel implementation"
```

---

## Summary

Total tasks: 16
Estimated time: 2-3 hours

Files created:
- `src/components/FeelingsWheel/constants.js`
- `src/components/FeelingsWheel/hooks/useFeelingsRoom.js`
- `src/components/FeelingsWheel/Avatar.jsx`
- `src/components/FeelingsWheel/JoinRoomModal.jsx`
- `src/components/FeelingsWheel/AvatarSetupModal.jsx`
- `src/components/FeelingsWheel/Wheel.jsx`
- `src/components/FeelingsWheel/YourFeelingCard.jsx`
- `src/components/FeelingsWheel/RoomInfoBar.jsx`
- `src/components/FeelingsWheel/ParticipantsPanel.jsx`
- `src/components/FeelingsWheel/TeamFeelingsTable.jsx`
- `src/components/FeelingsWheel/FeelingsWheelApp.jsx`
- `src/components/FeelingsWheel/index.js`

Files modified:
- `src/firebase.js`
- `src/App.jsx`
- `src/components/Launcher.jsx`
