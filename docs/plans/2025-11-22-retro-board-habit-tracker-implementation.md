# Retro Board & Habit Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a team retrospective board with 4 sections and a habit tracker that integrates with action items from retros.

**Architecture:** Two separate tools sharing Firebase infrastructure. Retro Board uses Realtime Database for live collaboration (adapting FeelingsWheel patterns). Habit Tracker uses Firestore for persistent team data. Both integrate through an export flow.

**Tech Stack:** React 19, Firebase (Auth, RTDB, Firestore), Tailwind CSS, lucide-react

---

## Part 1: Retro Board

### Task 1: Create RetroBoard constants

**Files:**
- Create: `src/components/RetroBoard/constants.js`

**Step 1: Create the constants file**

```javascript
// src/components/RetroBoard/constants.js

export const RETRO_SECTIONS = [
  {
    id: 'sweet-fruits',
    title: 'Sweet Fruits',
    subtitle: 'What went well?',
    icon: '🍎',
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
  },
  {
    id: 'awesome-peeps',
    title: 'Awesome Peeps',
    subtitle: 'Shout out a teammate',
    icon: '⭐',
    color: 'amber',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    hasShoutout: true,
  },
  {
    id: 'pirates',
    title: 'Pirates on Shore',
    subtitle: 'What could improve?',
    icon: '🏴‍☠️',
    color: 'rose',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
  },
  {
    id: 'bottle',
    title: 'Message in Bottle',
    subtitle: 'Action points',
    icon: '🍾',
    color: 'sky',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-700',
    canExport: true,
  },
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

export const AVATAR_COLORS = [
  '#FF6B6B', '#FFA94D', '#FFE066', '#A9E34B', '#51CF66',
  '#22D3EE', '#4C6EF5', '#9775FA', '#F472B6',
];

export const getRandomColor = () => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};
```

**Step 2: Commit**

```bash
git add src/components/RetroBoard/constants.js
git commit -m "feat(retro): add constants for sections and utilities"
```

---

### Task 2: Create useRetroRoom hook

**Files:**
- Create: `src/components/RetroBoard/hooks/useRetroRoom.js`

**Step 1: Create the hook file**

```javascript
// src/components/RetroBoard/hooks/useRetroRoom.js

import { useState, useEffect, useCallback } from 'react';
import { ref, set, get, push, onValue, onDisconnect, serverTimestamp, remove } from 'firebase/database';
import { rtdb } from '../../../firebase';
import { generateRoomCode, getRandomColor } from '../constants';

export const useRetroRoom = (user) => {
  const [roomCode, setRoomCode] = useState(null);
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState({});
  const [items, setItems] = useState({});
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listen to room changes
  useEffect(() => {
    if (!roomCode) return;

    const roomRef = ref(rtdb, `retroRooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRoom({
          name: data.name,
          createdAt: data.createdAt,
          hostId: data.hostId,
          isRevealed: data.isRevealed || false,
        });
        setParticipants(data.participants || {});
        setItems(data.items || {});
        setIsHost(data.hostId === user?.uid);
      } else {
        setRoom(null);
        setParticipants({});
        setItems({});
        setError('Room not found');
      }
    });

    return () => unsubscribe();
  }, [roomCode, user?.uid]);

  // Set up presence
  useEffect(() => {
    if (!roomCode || !user?.uid) return;

    const presenceRef = ref(rtdb, `retroRooms/${roomCode}/participants/${user.uid}/isOnline`);
    set(presenceRef, true);
    onDisconnect(presenceRef).set(false);

    return () => {
      set(presenceRef, false);
    };
  }, [roomCode, user?.uid]);

  const createRoom = useCallback(async (retroName, userName, avatarColor) => {
    if (!user) return null;
    setLoading(true);
    setError(null);

    try {
      const code = generateRoomCode();
      const roomRef = ref(rtdb, `retroRooms/${code}`);

      await set(roomRef, {
        name: retroName || 'Team Retro',
        createdAt: serverTimestamp(),
        hostId: user.uid,
        isRevealed: false,
        participants: {
          [user.uid]: {
            name: userName || user.displayName || 'Anonymous',
            avatarColor: avatarColor || getRandomColor(),
            isOnline: true,
            joinedAt: serverTimestamp(),
          }
        },
        items: {},
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
      const roomRef = ref(rtdb, `retroRooms/${code}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setError('Room not found');
        setLoading(false);
        return false;
      }

      const userRef = ref(rtdb, `retroRooms/${code}/participants/${user.uid}`);
      await set(userRef, {
        name: userName || user.displayName || 'Anonymous',
        avatarColor: avatarColor || getRandomColor(),
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

  const addItem = useCallback(async (section, text, shoutoutTo = null) => {
    if (!roomCode || !user?.uid) return null;

    const itemsRef = ref(rtdb, `retroRooms/${roomCode}/items`);
    const newItemRef = push(itemsRef);

    const item = {
      section,
      text,
      authorId: user.uid,
      authorName: participants[user.uid]?.name || user.displayName || 'Anonymous',
      createdAt: serverTimestamp(),
    };

    if (shoutoutTo) {
      item.shoutoutTo = shoutoutTo;
    }

    await set(newItemRef, item);
    return newItemRef.key;
  }, [roomCode, user, participants]);

  const removeItem = useCallback(async (itemId) => {
    if (!roomCode || !user?.uid) return;

    const item = items[itemId];
    if (!item) return;

    // Only author or host can delete
    if (item.authorId !== user.uid && !isHost) return;

    const itemRef = ref(rtdb, `retroRooms/${roomCode}/items/${itemId}`);
    await remove(itemRef);
  }, [roomCode, user?.uid, items, isHost]);

  const revealAll = useCallback(async () => {
    if (!roomCode || !isHost) return;
    const revealRef = ref(rtdb, `retroRooms/${roomCode}/isRevealed`);
    await set(revealRef, true);
  }, [roomCode, isHost]);

  const hideAll = useCallback(async () => {
    if (!roomCode || !isHost) return;
    const revealRef = ref(rtdb, `retroRooms/${roomCode}/isRevealed`);
    await set(revealRef, false);
  }, [roomCode, isHost]);

  const leaveRoom = useCallback(() => {
    setRoomCode(null);
    setRoom(null);
    setParticipants({});
    setItems({});
    setIsHost(false);
  }, []);

  const currentUser = user?.uid ? participants[user.uid] : null;

  // Filter items by visibility
  const getVisibleItems = useCallback((sectionId) => {
    return Object.entries(items)
      .filter(([_, item]) => item.section === sectionId)
      .filter(([_, item]) => room?.isRevealed || item.authorId === user?.uid)
      .map(([id, item]) => ({ id, ...item }));
  }, [items, room?.isRevealed, user?.uid]);

  // Count hidden items per section
  const getHiddenCount = useCallback((sectionId) => {
    if (room?.isRevealed) return 0;
    return Object.values(items)
      .filter(item => item.section === sectionId && item.authorId !== user?.uid)
      .length;
  }, [items, room?.isRevealed, user?.uid]);

  return {
    roomCode,
    room,
    participants,
    items,
    currentUser,
    isHost,
    loading,
    error,
    createRoom,
    joinRoom,
    addItem,
    removeItem,
    revealAll,
    hideAll,
    leaveRoom,
    getVisibleItems,
    getHiddenCount,
  };
};
```

**Step 2: Commit**

```bash
git add src/components/RetroBoard/hooks/useRetroRoom.js
git commit -m "feat(retro): add useRetroRoom hook for room management"
```

---

### Task 3: Create JoinRoomModal component

**Files:**
- Create: `src/components/RetroBoard/JoinRoomModal.jsx`

**Step 1: Create the modal component**

```jsx
// src/components/RetroBoard/JoinRoomModal.jsx

import React, { useState } from 'react';
import { X, Users, Plus } from 'lucide-react';
import { AVATAR_COLORS, getInitials } from './constants';

const JoinRoomModal = ({ isOpen, onClose, onCreateRoom, onJoinRoom, user, loading }) => {
  const [mode, setMode] = useState('choose'); // 'choose' | 'create' | 'join'
  const [retroName, setRetroName] = useState('');
  const [userName, setUserName] = useState(user?.displayName || '');
  const [roomCode, setRoomCode] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    const code = await onCreateRoom(retroName, userName, selectedColor);
    if (code) {
      onClose();
    }
  };

  const handleJoin = async () => {
    const success = await onJoinRoom(roomCode.toUpperCase(), userName, selectedColor);
    if (success) {
      onClose();
    }
  };

  const resetAndClose = () => {
    setMode('choose');
    setRetroName('');
    setRoomCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'choose' && 'Retro Board'}
            {mode === 'create' && 'Create Retro'}
            {mode === 'join' && 'Join Retro'}
          </h2>
          <button onClick={resetAndClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'choose' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 rounded-xl flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Plus size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Create New Retro</p>
                  <p className="text-sm text-slate-500">Start a new retrospective session</p>
                </div>
              </button>

              <button
                onClick={() => setMode('join')}
                className="w-full p-4 bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 rounded-xl flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Join Existing Retro</p>
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
                    Retro Name
                  </label>
                  <input
                    type="text"
                    value={retroName}
                    onChange={(e) => setRetroName(e.target.value)}
                    placeholder="e.g., Sprint 23 Retro"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 uppercase tracking-widest text-center text-xl font-mono"
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
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-sky-500 hover:bg-sky-600'
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
git add src/components/RetroBoard/JoinRoomModal.jsx
git commit -m "feat(retro): add JoinRoomModal for create/join flow"
```

---

### Task 4: Create RetroItem component

**Files:**
- Create: `src/components/RetroBoard/RetroItem.jsx`

**Step 1: Create the item component**

```jsx
// src/components/RetroBoard/RetroItem.jsx

import React from 'react';
import { Trash2, ArrowRight } from 'lucide-react';
import { getInitials } from './constants';

const RetroItem = ({
  item,
  section,
  isOwn,
  isRevealed,
  canDelete,
  onDelete,
  onExportToHabit
}) => {
  return (
    <div
      className={`p-3 rounded-lg border-2 ${section.bgColor} ${section.borderColor} relative group`}
    >
      {/* Author badge */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: item.avatarColor || '#64748b' }}
        >
          {getInitials(item.authorName)}
        </div>
        <span className="text-xs font-medium text-slate-600">
          {isOwn ? 'You' : item.authorName}
        </span>
      </div>

      {/* Shoutout badge for awesome-peeps */}
      {item.shoutoutTo && (
        <div className="mb-2 px-2 py-1 bg-amber-200 rounded-full inline-block">
          <span className="text-xs font-bold text-amber-800">@{item.shoutoutTo}</span>
        </div>
      )}

      {/* Item text */}
      <p className="text-sm text-slate-700">{item.text}</p>

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Export to habit button (only for bottle section after reveal) */}
        {section.canExport && isRevealed && onExportToHabit && (
          <button
            onClick={() => onExportToHabit(item)}
            className="p-1.5 bg-sky-500 text-white rounded-md hover:bg-sky-600"
            title="Export to Habit Tracker"
          >
            <ArrowRight size={14} />
          </button>
        )}

        {/* Delete button */}
        {canDelete && (
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default RetroItem;
```

**Step 2: Commit**

```bash
git add src/components/RetroBoard/RetroItem.jsx
git commit -m "feat(retro): add RetroItem component for post-it notes"
```

---

### Task 5: Create AddItemModal component

**Files:**
- Create: `src/components/RetroBoard/AddItemModal.jsx`

**Step 1: Create the modal component**

```jsx
// src/components/RetroBoard/AddItemModal.jsx

import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddItemModal = ({ isOpen, onClose, onAdd, section, participants, currentUserId }) => {
  const [text, setText] = useState('');
  const [shoutoutTo, setShoutoutTo] = useState('');

  if (!isOpen || !section) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAdd(section.id, text.trim(), section.hasShoutout ? shoutoutTo : null);
    setText('');
    setShoutoutTo('');
    onClose();
  };

  // Get list of other participants for shoutout dropdown
  const otherParticipants = Object.entries(participants || {})
    .filter(([id]) => id !== currentUserId)
    .map(([id, p]) => ({ id, name: p.name }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 ${section.bgColor}`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{section.icon}</span>
            <h2 className={`text-lg font-bold ${section.textColor}`}>{section.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {section.hasShoutout && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Who are you shouting out?
              </label>
              <select
                value={shoutoutTo}
                onChange={(e) => setShoutoutTo(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Select a teammate...</option>
                {otherParticipants.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
                <option value="__custom__">Someone else...</option>
              </select>
              {shoutoutTo === '__custom__' && (
                <input
                  type="text"
                  placeholder="Enter their name"
                  onChange={(e) => setShoutoutTo(e.target.value)}
                  className="w-full mt-2 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {section.hasShoutout ? 'What did they do?' : section.subtitle}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                section.hasShoutout
                  ? "Describe what they did that was awesome..."
                  : `Add your ${section.title.toLowerCase()}...`
              }
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim() || (section.hasShoutout && !shoutoutTo)}
              className={`flex-1 px-4 py-2 text-white rounded-lg font-medium disabled:opacity-50 bg-slate-800 hover:bg-slate-900`}
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
```

**Step 2: Commit**

```bash
git add src/components/RetroBoard/AddItemModal.jsx
git commit -m "feat(retro): add AddItemModal for creating items"
```

---

### Task 6: Create RetroColumn component

**Files:**
- Create: `src/components/RetroBoard/RetroColumn.jsx`

**Step 1: Create the column component**

```jsx
// src/components/RetroBoard/RetroColumn.jsx

import React from 'react';
import { Plus, EyeOff } from 'lucide-react';
import RetroItem from './RetroItem';

const RetroColumn = ({
  section,
  items,
  hiddenCount,
  isRevealed,
  currentUserId,
  isHost,
  onAddClick,
  onDeleteItem,
  onExportToHabit,
}) => {
  return (
    <div className={`flex flex-col rounded-xl border-2 ${section.borderColor} overflow-hidden h-full`}>
      {/* Column header */}
      <div className={`p-4 ${section.bgColor}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{section.icon}</span>
          <div>
            <h3 className={`font-bold ${section.textColor}`}>{section.title}</h3>
            <p className="text-xs text-slate-500">{section.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto bg-white min-h-[200px]">
        {items.map((item) => (
          <RetroItem
            key={item.id}
            item={item}
            section={section}
            isOwn={item.authorId === currentUserId}
            isRevealed={isRevealed}
            canDelete={item.authorId === currentUserId || isHost}
            onDelete={onDeleteItem}
            onExportToHabit={section.canExport ? onExportToHabit : null}
          />
        ))}

        {/* Hidden items indicator */}
        {hiddenCount > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 bg-slate-100 rounded-lg text-slate-500">
            <EyeOff size={16} />
            <span className="text-sm">{hiddenCount} hidden item{hiddenCount > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && hiddenCount === 0 && (
          <div className="flex items-center justify-center p-6 text-slate-400 text-sm">
            No items yet
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={onAddClick}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-dashed ${section.borderColor} ${section.textColor} hover:${section.bgColor} transition-colors`}
        >
          <Plus size={18} />
          <span className="font-medium">Add</span>
        </button>
      </div>
    </div>
  );
};

export default RetroColumn;
```

**Step 2: Commit**

```bash
git add src/components/RetroBoard/RetroColumn.jsx
git commit -m "feat(retro): add RetroColumn component"
```

---

### Task 7: Create ParticipantsPanel component

**Files:**
- Create: `src/components/RetroBoard/ParticipantsPanel.jsx`

**Step 1: Create the panel component**

```jsx
// src/components/RetroBoard/ParticipantsPanel.jsx

import React from 'react';
import { X, Crown, Circle } from 'lucide-react';
import { getInitials } from './constants';

const ParticipantsPanel = ({ isOpen, onClose, participants, hostId }) => {
  if (!isOpen) return null;

  const participantList = Object.entries(participants).map(([id, p]) => ({
    id,
    ...p,
    isHost: id === hostId,
  }));

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h2 className="font-bold text-slate-900">Participants ({participantList.length})</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
          <X size={20} className="text-slate-500" />
        </button>
      </div>

      {/* Participants list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {participantList.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold relative"
              style={{ backgroundColor: p.avatarColor || '#64748b' }}
            >
              {getInitials(p.name)}
              {/* Online indicator */}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  p.isOnline ? 'bg-green-500' : 'bg-slate-300'
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-900">{p.name}</span>
                {p.isHost && (
                  <Crown size={14} className="text-amber-500" />
                )}
              </div>
              <span className="text-xs text-slate-500">
                {p.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsPanel;
```

**Step 2: Commit**

```bash
git add src/components/RetroBoard/ParticipantsPanel.jsx
git commit -m "feat(retro): add ParticipantsPanel component"
```

---

### Task 8: Create RetroBoardApp main component

**Files:**
- Create: `src/components/RetroBoard/RetroBoardApp.jsx`

**Step 1: Create the main app component**

```jsx
// src/components/RetroBoard/RetroBoardApp.jsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useRetroRoom } from './hooks/useRetroRoom';
import { RETRO_SECTIONS } from './constants';
import JoinRoomModal from './JoinRoomModal';
import RetroColumn from './RetroColumn';
import AddItemModal from './AddItemModal';
import ParticipantsPanel from './ParticipantsPanel';

const RetroBoardApp = ({ user, onBack }) => {
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
    addItem,
    removeItem,
    revealAll,
    hideAll,
    leaveRoom,
    getVisibleItems,
    getHiddenCount,
  } = useRetroRoom(user);

  const [showJoinModal, setShowJoinModal] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [copied, setCopied] = useState(false);

  // Show join modal if not in a room
  useEffect(() => {
    if (roomCode) {
      setShowJoinModal(false);
    }
  }, [roomCode]);

  const handleBack = () => {
    if (roomCode) {
      leaveRoom();
      setShowJoinModal(true);
    } else {
      onBack();
    }
  };

  const handleAddClick = (section) => {
    setActiveSection(section);
    setShowAddModal(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show error toast
  useEffect(() => {
    if (error) {
      // You could add a toast notification here
      console.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="font-bold text-slate-900">
                {room?.name || 'Retro Board'}
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

          {roomCode && (
            <div className="flex items-center gap-2">
              {/* Reveal/Hide button (host only) */}
              {isHost && (
                <button
                  onClick={room?.isRevealed ? hideAll : revealAll}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    room?.isRevealed
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                >
                  {room?.isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
                  {room?.isRevealed ? 'Hide All' : 'Reveal All'}
                </button>
              )}

              {/* Participants button */}
              <button
                onClick={() => setShowParticipants(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                <Users size={18} />
                <span>{Object.keys(participants).length}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      {roomCode ? (
        <main className="max-w-7xl mx-auto p-4">
          {/* Reveal status banner */}
          {!room?.isRevealed && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800">
              <EyeOff size={18} />
              <span className="text-sm">
                Items are hidden. {isHost ? 'Click "Reveal All" when ready.' : 'Waiting for host to reveal.'}
              </span>
            </div>
          )}

          {/* Columns grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {RETRO_SECTIONS.map((section) => (
              <RetroColumn
                key={section.id}
                section={section}
                items={getVisibleItems(section.id)}
                hiddenCount={getHiddenCount(section.id)}
                isRevealed={room?.isRevealed || false}
                currentUserId={user?.uid}
                isHost={isHost}
                onAddClick={() => handleAddClick(section)}
                onDeleteItem={removeItem}
                onExportToHabit={(item) => {
                  // TODO: Implement export to habit tracker
                  console.log('Export to habit:', item);
                }}
              />
            ))}
          </div>
        </main>
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center text-slate-500">
            <p>Create or join a retro to get started</p>
          </div>
        </div>
      )}

      {/* Modals */}
      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => roomCode ? setShowJoinModal(false) : onBack()}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        user={user}
        loading={loading}
      />

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addItem}
        section={activeSection}
        participants={participants}
        currentUserId={user?.uid}
      />

      <ParticipantsPanel
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        participants={participants}
        hostId={room?.hostId}
      />
    </div>
  );
};

export default RetroBoardApp;
```

**Step 2: Commit**

```bash
git add src/components/RetroBoard/RetroBoardApp.jsx
git commit -m "feat(retro): add RetroBoardApp main component"
```

---

### Task 9: Create RetroBoard index exports

**Files:**
- Create: `src/components/RetroBoard/index.js`

**Step 1: Create the barrel export file**

```javascript
// src/components/RetroBoard/index.js

export { default as RetroBoardApp } from './RetroBoardApp';
export { useRetroRoom } from './hooks/useRetroRoom';
export * from './constants';
```

**Step 2: Commit**

```bash
git add src/components/RetroBoard/index.js
git commit -m "feat(retro): add index exports"
```

---

### Task 10: Add Retro Board to Launcher

**Files:**
- Modify: `src/components/Launcher.jsx`

**Step 1: Update Launcher to include Retro Board card**

Add import and card after the Feelings Wheel card:

```jsx
// In imports, add:
import { LogOut, TrendingUp, Smile, MessageSquare } from 'lucide-react';

// After the Feelings Wheel button (around line 67), add:

                    {/* Retro Board Card */}
                    <button
                        onClick={() => onSelectApp('retro-board')}
                        className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-200 transition-all text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MessageSquare size={120} className="text-emerald-600" />
                        </div>

                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MessageSquare size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Retro Board</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Run team retrospectives with sweet fruits, awesome peeps, pirates, and action items.
                        </p>
                    </button>
```

**Step 2: Commit**

```bash
git add src/components/Launcher.jsx
git commit -m "feat(retro): add Retro Board card to Launcher"
```

---

### Task 11: Add Retro Board route to App.jsx

**Files:**
- Modify: `src/App.jsx`

**Step 1: Add import and route case**

Add import at top:

```jsx
import { RetroBoardApp } from './components/RetroBoard';
```

Add route case (after feelings-wheel case):

```jsx
  if (currentApp === 'retro-board') {
    return <RetroBoardApp user={user} onBack={() => setCurrentApp(null)} />;
  }
```

**Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat(retro): add Retro Board route to App"
```

---

### Task 12: Test Retro Board manually

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Manual testing checklist**

- [ ] Open http://localhost:5173
- [ ] Log in with Google
- [ ] Click "Retro Board" in Launcher
- [ ] Create a new retro room
- [ ] Copy room code
- [ ] Add items to each of the 4 sections
- [ ] Open in incognito, join with room code
- [ ] Verify items are hidden until host reveals
- [ ] Click "Reveal All" as host
- [ ] Verify all items appear with author names
- [ ] Test delete functionality
- [ ] Test participants panel

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix(retro): address issues from manual testing"
```

---

## Part 2: Habit Tracker

### Task 13: Create HabitTracker constants

**Files:**
- Create: `src/components/HabitTracker/constants.js`

**Step 1: Create the constants file**

```javascript
// src/components/HabitTracker/constants.js

export const DAYS_OF_WEEK = [
  { id: 0, short: 'Sun', full: 'Sunday' },
  { id: 1, short: 'Mon', full: 'Monday' },
  { id: 2, short: 'Tue', full: 'Tuesday' },
  { id: 3, short: 'Wed', full: 'Wednesday' },
  { id: 4, short: 'Thu', full: 'Thursday' },
  { id: 5, short: 'Fri', full: 'Friday' },
  { id: 6, short: 'Sat', full: 'Saturday' },
];

export const DEFAULT_ACTIVE_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri

export const HABIT_EMOJIS = [
  '📋', '📝', '✅', '🔔', '💬', '📊', '🎯', '⭐',
  '🚀', '💡', '🔍', '📧', '📞', '🤝', '📅', '⏰',
];

export const generateTeamCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Get the start of the current week (Monday)
export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get array of dates for current week
export const getWeekDates = (weekStart = getWeekStart()) => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
};

// Format date for display
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.getDate();
};
```

**Step 2: Commit**

```bash
git add src/components/HabitTracker/constants.js
git commit -m "feat(habits): add constants for days and utilities"
```

---

### Task 14: Create useTeamHabits hook

**Files:**
- Create: `src/components/HabitTracker/hooks/useTeamHabits.js`

**Step 1: Create the hook file**

```javascript
// src/components/HabitTracker/hooks/useTeamHabits.js

import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { generateTeamCode, DEFAULT_ACTIVE_DAYS } from '../constants';

export const useTeamHabits = (user) => {
  const [teamId, setTeamId] = useState(null);
  const [team, setTeam] = useState(null);
  const [habits, setHabits] = useState([]);
  const [checks, setChecks] = useState({}); // { habitId: { date: [userId, ...] } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's team on mount
  useEffect(() => {
    if (!user?.uid) return;

    const loadUserTeam = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().teamId) {
          setTeamId(userDoc.data().teamId);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadUserTeam();
  }, [user?.uid]);

  // Subscribe to team data
  useEffect(() => {
    if (!teamId) return;

    const teamRef = doc(db, 'teams', teamId);
    const unsubTeam = onSnapshot(teamRef, (snapshot) => {
      if (snapshot.exists()) {
        setTeam({ id: snapshot.id, ...snapshot.data() });
      }
    });

    return () => unsubTeam();
  }, [teamId]);

  // Subscribe to habits
  useEffect(() => {
    if (!teamId) return;

    const habitsRef = collection(db, 'teams', teamId, 'habits');
    const q = query(habitsRef, where('isArchived', '==', false));

    const unsubHabits = onSnapshot(q, (snapshot) => {
      const habitsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHabits(habitsList);
    });

    return () => unsubHabits();
  }, [teamId]);

  // Subscribe to checks for all habits
  useEffect(() => {
    if (!teamId || habits.length === 0) return;

    const unsubscribers = habits.map((habit) => {
      const checksRef = collection(db, 'teams', teamId, 'habits', habit.id, 'checks');
      return onSnapshot(checksRef, (snapshot) => {
        const habitChecks = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          habitChecks[data.date] = habitChecks[data.date] || [];
          habitChecks[data.date].push({
            id: doc.id,
            ...data,
          });
        });
        setChecks((prev) => ({ ...prev, [habit.id]: habitChecks }));
      });
    });

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [teamId, habits.length]);

  const createTeam = useCallback(async (teamName) => {
    if (!user) return null;
    setLoading(true);
    setError(null);

    try {
      const code = generateTeamCode();
      const teamRef = doc(db, 'teams', code);

      await setDoc(teamRef, {
        name: teamName || 'My Team',
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        memberIds: [user.uid],
      });

      // Update user's teamId
      await setDoc(doc(db, 'users', user.uid), {
        teamId: code,
        displayName: user.displayName || 'Anonymous',
      }, { merge: true });

      setTeamId(code);
      setLoading(false);
      return code;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, [user]);

  const joinTeam = useCallback(async (code) => {
    if (!user || !code) return false;
    setLoading(true);
    setError(null);

    try {
      const teamRef = doc(db, 'teams', code);
      const teamDoc = await getDoc(teamRef);

      if (!teamDoc.exists()) {
        setError('Team not found');
        setLoading(false);
        return false;
      }

      // Add user to team members
      await updateDoc(teamRef, {
        memberIds: arrayUnion(user.uid),
      });

      // Update user's teamId
      await setDoc(doc(db, 'users', user.uid), {
        teamId: code,
        displayName: user.displayName || 'Anonymous',
      }, { merge: true });

      setTeamId(code);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  }, [user]);

  const addHabit = useCallback(async (text, emoji, activeDays = DEFAULT_ACTIVE_DAYS, sourceRetro = null) => {
    if (!teamId || !user?.uid) return null;

    try {
      const habitsRef = collection(db, 'teams', teamId, 'habits');
      const docRef = await addDoc(habitsRef, {
        text,
        emoji: emoji || '📋',
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        activeDays,
        sourceRetro,
        isArchived: false,
      });
      return docRef.id;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [teamId, user?.uid]);

  const archiveHabit = useCallback(async (habitId) => {
    if (!teamId) return;

    try {
      const habitRef = doc(db, 'teams', teamId, 'habits', habitId);
      await updateDoc(habitRef, { isArchived: true });
    } catch (err) {
      setError(err.message);
    }
  }, [teamId]);

  const toggleCheck = useCallback(async (habitId, date) => {
    if (!teamId || !user?.uid) return;

    try {
      const checksRef = collection(db, 'teams', teamId, 'habits', habitId, 'checks');
      const existingChecks = checks[habitId]?.[date] || [];
      const userCheck = existingChecks.find((c) => c.checkedBy === user.uid);

      if (userCheck) {
        // Remove check
        await deleteDoc(doc(checksRef, userCheck.id));
      } else {
        // Add check
        await addDoc(checksRef, {
          date,
          checkedBy: user.uid,
          checkedByName: user.displayName || 'Anonymous',
          checkedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      setError(err.message);
    }
  }, [teamId, user, checks]);

  const isCheckedByUser = useCallback((habitId, date) => {
    const dateChecks = checks[habitId]?.[date] || [];
    return dateChecks.some((c) => c.checkedBy === user?.uid);
  }, [checks, user?.uid]);

  const getCheckersForDate = useCallback((habitId, date) => {
    return checks[habitId]?.[date] || [];
  }, [checks]);

  const leaveTeam = useCallback(async () => {
    if (!user?.uid) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), { teamId: null });
      setTeamId(null);
      setTeam(null);
      setHabits([]);
      setChecks({});
    } catch (err) {
      setError(err.message);
    }
  }, [user?.uid]);

  return {
    teamId,
    team,
    habits,
    loading,
    error,
    createTeam,
    joinTeam,
    addHabit,
    archiveHabit,
    toggleCheck,
    isCheckedByUser,
    getCheckersForDate,
    leaveTeam,
  };
};
```

**Step 2: Commit**

```bash
git add src/components/HabitTracker/hooks/useTeamHabits.js
git commit -m "feat(habits): add useTeamHabits hook for Firestore"
```

---

### Task 15: Create TeamSetupModal component

**Files:**
- Create: `src/components/HabitTracker/TeamSetupModal.jsx`

**Step 1: Create the modal component**

```jsx
// src/components/HabitTracker/TeamSetupModal.jsx

import React, { useState } from 'react';
import { X, Users, Plus } from 'lucide-react';

const TeamSetupModal = ({ isOpen, onClose, onCreateTeam, onJoinTeam, loading }) => {
  const [mode, setMode] = useState('choose'); // 'choose' | 'create' | 'join'
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');

  if (!isOpen) return null;

  const handleCreate = async () => {
    const code = await onCreateTeam(teamName);
    if (code) {
      onClose();
    }
  };

  const handleJoin = async () => {
    const success = await onJoinTeam(teamCode.toUpperCase());
    if (success) {
      onClose();
    }
  };

  const resetAndClose = () => {
    setMode('choose');
    setTeamName('');
    setTeamCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'choose' && 'Join a Team'}
            {mode === 'create' && 'Create Team'}
            {mode === 'join' && 'Join Team'}
          </h2>
          <button onClick={resetAndClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'choose' && (
            <div className="space-y-4">
              <p className="text-slate-600 text-sm mb-4">
                Habit Tracker works with teams. Create a new team or join an existing one.
              </p>

              <button
                onClick={() => setMode('create')}
                className="w-full p-4 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 rounded-xl flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Plus size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Create New Team</p>
                  <p className="text-sm text-slate-500">Start tracking habits with your team</p>
                </div>
              </button>

              <button
                onClick={() => setMode('join')}
                className="w-full p-4 bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 rounded-xl flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Join Existing Team</p>
                  <p className="text-sm text-slate-500">Enter a team code to join</p>
                </div>
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Grub Squad"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setMode('choose')}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading || !teamName.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Team Code
                </label>
                <input
                  type="text"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABCD1234"
                  maxLength={8}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 uppercase tracking-widest text-center text-xl font-mono"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setMode('choose')}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={handleJoin}
                  disabled={loading || teamCode.length !== 8}
                  className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join Team'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSetupModal;
```

**Step 2: Commit**

```bash
git add src/components/HabitTracker/TeamSetupModal.jsx
git commit -m "feat(habits): add TeamSetupModal component"
```

---

### Task 16: Create AddHabitModal component

**Files:**
- Create: `src/components/HabitTracker/AddHabitModal.jsx`

**Step 1: Create the modal component**

```jsx
// src/components/HabitTracker/AddHabitModal.jsx

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { HABIT_EMOJIS, DAYS_OF_WEEK, DEFAULT_ACTIVE_DAYS } from './constants';

const AddHabitModal = ({ isOpen, onClose, onAdd, initialText = '', sourceRetro = null }) => {
  const [text, setText] = useState(initialText);
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0]);
  const [activeDays, setActiveDays] = useState(DEFAULT_ACTIVE_DAYS);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAdd(text.trim(), emoji, activeDays, sourceRetro);
    setText('');
    setEmoji(HABIT_EMOJIS[0]);
    setActiveDays(DEFAULT_ACTIVE_DAYS);
    onClose();
  };

  const toggleDay = (dayId) => {
    setActiveDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId].sort()
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {sourceRetro ? 'Create Habit from Action' : 'Add New Habit'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {sourceRetro && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-sm text-sky-700">
              Importing from retro: {sourceRetro}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Habit Description
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., Post standup by 10:30am"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Emoji
            </label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center transition-all ${
                    emoji === e
                      ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Track on these days
            </label>
            <div className="flex gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeDays.includes(day.id)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim() || activeDays.length === 0}
              className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50"
            >
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;
```

**Step 2: Commit**

```bash
git add src/components/HabitTracker/AddHabitModal.jsx
git commit -m "feat(habits): add AddHabitModal component"
```

---

### Task 17: Create HabitRow component

**Files:**
- Create: `src/components/HabitTracker/HabitRow.jsx`

**Step 1: Create the row component**

```jsx
// src/components/HabitTracker/HabitRow.jsx

import React from 'react';
import { Trash2, Check, Minus } from 'lucide-react';

const HabitRow = ({
  habit,
  weekDates,
  activeDays,
  isCheckedByUser,
  getCheckersForDate,
  onToggleCheck,
  onArchive,
  showTeamView,
}) => {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 group">
      {/* Habit info */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{habit.emoji}</span>
          <div>
            <p className="font-medium text-slate-900">{habit.text}</p>
            {habit.sourceRetro && (
              <p className="text-xs text-slate-400">from retro</p>
            )}
          </div>
        </div>
      </td>

      {/* Day checkboxes */}
      {weekDates.map((date, index) => {
        const dayNum = new Date(date).getDay();
        const isActive = activeDays.includes(dayNum);
        const isChecked = isCheckedByUser(habit.id, date);
        const checkers = getCheckersForDate(habit.id, date);

        if (!isActive) {
          return (
            <td key={date} className="py-3 px-2 text-center">
              <div className="w-8 h-8 mx-auto flex items-center justify-center text-slate-300">
                <Minus size={16} />
              </div>
            </td>
          );
        }

        return (
          <td key={date} className="py-3 px-2 text-center">
            <button
              onClick={() => onToggleCheck(habit.id, date)}
              className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center transition-all ${
                isChecked
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-400'
              }`}
            >
              {isChecked && <Check size={16} />}
            </button>

            {/* Team view: show who checked */}
            {showTeamView && checkers.length > 0 && (
              <div className="mt-1 text-xs text-slate-500 truncate max-w-[60px] mx-auto">
                {checkers.map((c) => c.checkedByName.split(' ')[0]).join(', ')}
              </div>
            )}
          </td>
        );
      })}

      {/* Actions */}
      <td className="py-3 px-2">
        <button
          onClick={() => onArchive(habit.id)}
          className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Archive habit"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};

export default HabitRow;
```

**Step 2: Commit**

```bash
git add src/components/HabitTracker/HabitRow.jsx
git commit -m "feat(habits): add HabitRow component"
```

---

### Task 18: Create HabitTrackerApp main component

**Files:**
- Create: `src/components/HabitTracker/HabitTrackerApp.jsx`

**Step 1: Create the main app component**

```jsx
// src/components/HabitTracker/HabitTrackerApp.jsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Users, User, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTeamHabits } from './hooks/useTeamHabits';
import { DAYS_OF_WEEK, getWeekStart, getWeekDates, formatDate } from './constants';
import TeamSetupModal from './TeamSetupModal';
import AddHabitModal from './AddHabitModal';
import HabitRow from './HabitRow';

const HabitTrackerApp = ({ user, onBack }) => {
  const {
    teamId,
    team,
    habits,
    loading,
    error,
    createTeam,
    joinTeam,
    addHabit,
    archiveHabit,
    toggleCheck,
    isCheckedByUser,
    getCheckersForDate,
  } = useTeamHabits(user);

  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showTeamView, setShowTeamView] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [copied, setCopied] = useState(false);

  // Calculate current week dates
  const baseWeekStart = getWeekStart();
  const weekStart = new Date(baseWeekStart);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(weekStart);

  // Show setup modal if no team
  useEffect(() => {
    if (!loading && !teamId) {
      setShowTeamSetup(true);
    }
  }, [loading, teamId]);

  const handleCopyCode = () => {
    if (teamId) {
      navigator.clipboard.writeText(teamId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isCurrentWeek = weekOffset === 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="font-bold text-slate-900">Habit Tracker</h1>
              {team && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                >
                  <span>{team.name}</span>
                  <span className="font-mono text-xs">({teamId})</span>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              )}
            </div>
          </div>

          {teamId && (
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setShowTeamView(false)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    !showTeamView ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                  }`}
                >
                  <User size={16} />
                  My View
                </button>
                <button
                  onClick={() => setShowTeamView(true)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    showTeamView ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                  }`}
                >
                  <Users size={16} />
                  Team
                </button>
              </div>

              {/* Add habit button */}
              <button
                onClick={() => setShowAddHabit(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600"
              >
                <Plus size={18} />
                Add Habit
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      {teamId ? (
        <main className="max-w-6xl mx-auto p-4">
          {/* Week navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-2 hover:bg-white rounded-lg"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>

            <div className="text-center">
              <p className="text-sm text-slate-500">
                {isCurrentWeek ? 'This Week' : `Week of ${weekDates[0]}`}
              </p>
            </div>

            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              disabled={isCurrentWeek}
              className="p-2 hover:bg-white rounded-lg disabled:opacity-30"
            >
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Habits table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 w-1/3">
                    Habit
                  </th>
                  {weekDates.map((date, index) => {
                    const dayNum = new Date(date).getDay();
                    const day = DAYS_OF_WEEK.find((d) => d.id === dayNum);
                    const isToday = date === new Date().toISOString().split('T')[0];

                    return (
                      <th
                        key={date}
                        className={`py-3 px-2 text-center text-sm font-medium w-[60px] ${
                          isToday ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'
                        }`}
                      >
                        <div>{day?.short}</div>
                        <div className="text-xs font-normal">{formatDate(date)}</div>
                      </th>
                    );
                  })}
                  <th className="py-3 px-2 w-[50px]"></th>
                </tr>
              </thead>
              <tbody>
                {habits.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      No habits yet. Click "Add Habit" to get started!
                    </td>
                  </tr>
                ) : (
                  habits.map((habit) => (
                    <HabitRow
                      key={habit.id}
                      habit={habit}
                      weekDates={weekDates}
                      activeDays={habit.activeDays || [1, 2, 3, 4, 5]}
                      isCheckedByUser={isCheckedByUser}
                      getCheckersForDate={getCheckersForDate}
                      onToggleCheck={toggleCheck}
                      onArchive={archiveHabit}
                      showTeamView={showTeamView}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center text-slate-500">
            <p>Create or join a team to start tracking habits</p>
            <button
              onClick={() => setShowTeamSetup(true)}
              className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <TeamSetupModal
        isOpen={showTeamSetup}
        onClose={() => teamId && setShowTeamSetup(false)}
        onCreateTeam={createTeam}
        onJoinTeam={joinTeam}
        loading={loading}
      />

      <AddHabitModal
        isOpen={showAddHabit}
        onClose={() => setShowAddHabit(false)}
        onAdd={addHabit}
      />
    </div>
  );
};

export default HabitTrackerApp;
```

**Step 2: Commit**

```bash
git add src/components/HabitTracker/HabitTrackerApp.jsx
git commit -m "feat(habits): add HabitTrackerApp main component"
```

---

### Task 19: Create HabitTracker index exports

**Files:**
- Create: `src/components/HabitTracker/index.js`

**Step 1: Create the barrel export file**

```javascript
// src/components/HabitTracker/index.js

export { default as HabitTrackerApp } from './HabitTrackerApp';
export { useTeamHabits } from './hooks/useTeamHabits';
export * from './constants';
```

**Step 2: Commit**

```bash
git add src/components/HabitTracker/index.js
git commit -m "feat(habits): add index exports"
```

---

### Task 20: Add Habit Tracker to Launcher

**Files:**
- Modify: `src/components/Launcher.jsx`

**Step 1: Add Habit Tracker card after Retro Board**

Add to imports:

```jsx
import { LogOut, TrendingUp, Smile, MessageSquare, CheckSquare } from 'lucide-react';
```

Add card after Retro Board card:

```jsx
                    {/* Habit Tracker Card */}
                    <button
                        onClick={() => onSelectApp('habit-tracker')}
                        className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckSquare size={120} className="text-indigo-600" />
                        </div>

                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <CheckSquare size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Habit Tracker</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Track team habits and routines. See who's building good practices.
                        </p>
                    </button>
```

**Step 2: Commit**

```bash
git add src/components/Launcher.jsx
git commit -m "feat(habits): add Habit Tracker card to Launcher"
```

---

### Task 21: Add Habit Tracker route to App.jsx

**Files:**
- Modify: `src/App.jsx`

**Step 1: Add import and route case**

Add import:

```jsx
import { HabitTrackerApp } from './components/HabitTracker';
```

Add route case (after retro-board case):

```jsx
  if (currentApp === 'habit-tracker') {
    return <HabitTrackerApp user={user} onBack={() => setCurrentApp(null)} />;
  }
```

**Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat(habits): add Habit Tracker route to App"
```

---

### Task 22: Test Habit Tracker manually

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Manual testing checklist**

- [ ] Open http://localhost:5173
- [ ] Log in with Google
- [ ] Click "Habit Tracker" in Launcher
- [ ] Create a new team
- [ ] Copy team code
- [ ] Add a habit
- [ ] Check off today's habit
- [ ] Toggle to Team View
- [ ] Open in incognito, join with team code
- [ ] Verify both users see the same habits
- [ ] Verify checks show up in Team View
- [ ] Navigate to previous weeks

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix(habits): address issues from manual testing"
```

---

## Part 3: Integration

### Task 23: Add ExportHabitModal to RetroBoard

**Files:**
- Create: `src/components/RetroBoard/ExportHabitModal.jsx`

**Step 1: Create the export modal**

```jsx
// src/components/RetroBoard/ExportHabitModal.jsx

import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { HABIT_EMOJIS, DAYS_OF_WEEK, DEFAULT_ACTIVE_DAYS } from '../HabitTracker/constants';
import { useTeamHabits } from '../HabitTracker/hooks/useTeamHabits';

const ExportHabitModal = ({ isOpen, onClose, item, roomCode, user }) => {
  const [text, setText] = useState('');
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0]);
  const [activeDays, setActiveDays] = useState(DEFAULT_ACTIVE_DAYS);
  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [teamName, setTeamName] = useState('');

  const { teamId, team, addHabit, createTeam, loading } = useTeamHabits(user);

  useEffect(() => {
    if (item) {
      setText(item.text);
    }
  }, [item]);

  useEffect(() => {
    if (!teamId && isOpen) {
      setShowTeamSetup(true);
    } else {
      setShowTeamSetup(false);
    }
  }, [teamId, isOpen]);

  if (!isOpen || !item) return null;

  const handleCreateTeam = async () => {
    const code = await createTeam(teamName);
    if (code) {
      setShowTeamSetup(false);
    }
  };

  const handleExport = async () => {
    if (!text.trim() || !teamId) return;

    const habitId = await addHabit(text.trim(), emoji, activeDays, roomCode);
    if (habitId) {
      onClose();
    }
  };

  const toggleDay = (dayId) => {
    setActiveDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId].sort()
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-sky-50">
          <div className="flex items-center gap-2">
            <ArrowRight size={20} className="text-sky-600" />
            <h2 className="text-lg font-bold text-sky-900">Create Habit from Action</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {showTeamSetup ? (
            <div className="space-y-4">
              <p className="text-slate-600 text-sm">
                You need to be part of a team to track habits. Create one now:
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., My Team"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <button
                onClick={handleCreateTeam}
                disabled={loading || !teamName.trim()}
                className="w-full px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600">Exporting to: <strong>{team?.name}</strong></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Habit Description
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Emoji
                </label>
                <div className="flex gap-2 flex-wrap">
                  {HABIT_EMOJIS.slice(0, 8).map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`w-9 h-9 text-lg rounded-lg flex items-center justify-center transition-all ${
                        emoji === e
                          ? 'bg-sky-100 ring-2 ring-sky-500 scale-110'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Track on
                </label>
                <div className="flex gap-1">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                        activeDays.includes(day.id)
                          ? 'bg-sky-500 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={!text.trim()}
                  className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 disabled:opacity-50"
                >
                  Create Habit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportHabitModal;
```

**Step 2: Commit**

```bash
git add src/components/RetroBoard/ExportHabitModal.jsx
git commit -m "feat(retro): add ExportHabitModal for habit integration"
```

---

### Task 24: Wire up ExportHabitModal in RetroBoardApp

**Files:**
- Modify: `src/components/RetroBoard/RetroBoardApp.jsx`

**Step 1: Add import and state**

Add import:

```jsx
import ExportHabitModal from './ExportHabitModal';
```

Add state (after `activeSection` state):

```jsx
const [exportItem, setExportItem] = useState(null);
```

**Step 2: Update export handler**

Replace the TODO comment in `onExportToHabit`:

```jsx
onExportToHabit={(item) => setExportItem(item)}
```

**Step 3: Add modal to render**

After `ParticipantsPanel`, add:

```jsx
      <ExportHabitModal
        isOpen={!!exportItem}
        onClose={() => setExportItem(null)}
        item={exportItem}
        roomCode={roomCode}
        user={user}
      />
```

**Step 4: Commit**

```bash
git add src/components/RetroBoard/RetroBoardApp.jsx
git commit -m "feat(retro): wire up export to habit functionality"
```

---

### Task 25: Final integration test

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: End-to-end test checklist**

- [ ] Create a retro room
- [ ] Add an action item to "Message in Bottle"
- [ ] Reveal all items
- [ ] Click the arrow button on the action item
- [ ] Create a team (if needed) or export to existing team
- [ ] Go to Habit Tracker
- [ ] Verify the habit appears with "(from retro)" tag
- [ ] Check off the habit

**Step 3: Run build to ensure no errors**

```bash
npm run build
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete retro board and habit tracker integration"
```

---

## Summary

This plan builds:

1. **Retro Board** - Room-based retrospective with 4 themed sections
2. **Habit Tracker** - Team-based habit tracking with weekly view
3. **Integration** - Export action items from retros to trackable habits

Total tasks: 25
Estimated implementation: Following TDD and bite-sized commits
