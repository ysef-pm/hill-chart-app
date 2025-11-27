# Kudos Board Implementation Plan

**Date:** 2025-11-27
**Branch:** feature/kudos-board
**Worktree:** .worktrees/kudos-board

## Goal

Implement a team recognition tool for async appreciation and celebration moments. Features a "Wall + Spotlight" architecture with a scrolling wall of kudos cards and a hero spotlight section for celebrations.

## Architecture

```
src/components/KudosBoard/
├── index.js                    # Barrel export
├── constants.js                # Categories, colors, helpers
├── hooks/
│   └── useKudosTeam.js         # Team CRUD + kudos CRUD + reactions
├── KudosBoardApp.jsx           # Main orchestrator
├── TeamSetupModal.jsx          # Create/join team flow
├── TeamHeader.jsx              # Team info bar with action buttons
├── SpotlightSection.jsx        # Celebrations carousel
├── KudosWall.jsx               # Masonry grid of kudos
├── KudosCard.jsx               # Individual kudo with reactions
├── GiveKudosModal.jsx          # Create kudos flow
└── AddCelebrationModal.jsx     # Create celebration flow
```

## Tech Stack

- React functional components with hooks
- Firebase Firestore (persistent teams, following Habit Tracker pattern)
- Tailwind CSS for styling
- Lucide React for icons

## Data Model

```
artifacts/kudos-board/teams/{teamId}/
  ├── info: { name, createdAt, createdBy, inviteCode }
  ├── members/{uid}: { displayName, photoURL, joinedAt, role }
  └── kudos/{kudoId}: { type, category, title, message, recipients, from, reactions, createdAt, spotlightUntil }
```

---

## Phase 1: Foundation (Constants + Hook + Team Setup)

### Task 1.1: Create constants.js

**File:** `src/components/KudosBoard/constants.js`

```javascript
// src/components/KudosBoard/constants.js

// Kudos categories with icons and colors
export const KUDOS_CATEGORIES = {
  helped: { label: 'Helped Me', icon: '🙌', color: 'blue', bgClass: 'bg-blue-100', textClass: 'text-blue-700', borderClass: 'border-blue-200' },
  shipped: { label: 'Shipped It', icon: '🚀', color: 'green', bgClass: 'bg-green-100', textClass: 'text-green-700', borderClass: 'border-green-200' },
  idea: { label: 'Great Idea', icon: '💡', color: 'purple', bgClass: 'bg-purple-100', textClass: 'text-purple-700', borderClass: 'border-purple-200' },
  above: { label: 'Went Above', icon: '🎯', color: 'orange', bgClass: 'bg-orange-100', textClass: 'text-orange-700', borderClass: 'border-orange-200' },
  team: { label: 'Team Player', icon: '🤝', color: 'teal', bgClass: 'bg-teal-100', textClass: 'text-teal-700', borderClass: 'border-teal-200' },
};

// Reaction emojis
export const REACTIONS = ['👏', '🎉', '❤️', '🔥'];

// Spotlight duration (7 days in ms)
export const SPOTLIGHT_DURATION = 7 * 24 * 60 * 60 * 1000;

// Generate team invite code
export const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'KUDOS-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate team ID (shorter, URL-safe)
export const generateTeamId = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// Message length constraints
export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 280;
export const TITLE_MAX_LENGTH = 60;
```

**Test:** Import in a test file and verify `generateInviteCode()` produces valid format.

---

### Task 1.2: Create useKudosTeam hook

**File:** `src/components/KudosBoard/hooks/useKudosTeam.js`

```javascript
// src/components/KudosBoard/hooks/useKudosTeam.js

import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteField,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { generateInviteCode, generateTeamId, SPOTLIGHT_DURATION } from '../constants';

export const useKudosTeam = (user) => {
  const [teamId, setTeamId] = useState(null);
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState({});
  const [kudos, setKudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's team on mount
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadUserTeam = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'kudosUsers', user.uid));
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

  // Subscribe to team info
  useEffect(() => {
    if (!teamId) return;

    const infoRef = doc(db, 'kudosTeams', teamId, 'info', 'main');
    const unsubInfo = onSnapshot(infoRef, (snapshot) => {
      if (snapshot.exists()) {
        setTeam({ id: teamId, ...snapshot.data() });
      }
    });

    return () => unsubInfo();
  }, [teamId]);

  // Subscribe to team members
  useEffect(() => {
    if (!teamId) return;

    const membersRef = collection(db, 'kudosTeams', teamId, 'members');
    const unsubMembers = onSnapshot(membersRef, (snapshot) => {
      const memberData = {};
      snapshot.docs.forEach((doc) => {
        memberData[doc.id] = { uid: doc.id, ...doc.data() };
      });
      setMembers(memberData);
    });

    return () => unsubMembers();
  }, [teamId]);

  // Subscribe to kudos (newest first)
  useEffect(() => {
    if (!teamId) return;

    const kudosRef = collection(db, 'kudosTeams', teamId, 'kudos');
    const q = query(kudosRef, orderBy('createdAt', 'desc'));

    const unsubKudos = onSnapshot(q, (snapshot) => {
      const kudosList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setKudos(kudosList);
    });

    return () => unsubKudos();
  }, [teamId]);

  // Create a new team
  const createTeam = useCallback(async (teamName) => {
    if (!user) return null;
    setLoading(true);
    setError(null);

    try {
      const newTeamId = generateTeamId();
      const inviteCode = generateInviteCode();

      // Create team info document
      await setDoc(doc(db, 'kudosTeams', newTeamId, 'info', 'main'), {
        name: teamName || 'My Team',
        createdAt: serverTimestamp(),
        createdBy: { uid: user.uid, displayName: user.displayName || 'Anonymous' },
        inviteCode,
      });

      // Add creator as admin member
      await setDoc(doc(db, 'kudosTeams', newTeamId, 'members', user.uid), {
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || null,
        joinedAt: serverTimestamp(),
        role: 'admin',
      });

      // Save team reference to user
      await setDoc(doc(db, 'kudosUsers', user.uid), {
        teamId: newTeamId,
      }, { merge: true });

      setTeamId(newTeamId);
      setLoading(false);
      return newTeamId;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, [user]);

  // Join existing team by invite code
  const joinTeam = useCallback(async (inviteCode) => {
    if (!user || !inviteCode) return false;
    setLoading(true);
    setError(null);

    try {
      // Find team by invite code
      const teamsSnapshot = await getDocs(collection(db, 'kudosTeams'));
      let foundTeamId = null;

      for (const teamDoc of teamsSnapshot.docs) {
        const infoDoc = await getDoc(doc(db, 'kudosTeams', teamDoc.id, 'info', 'main'));
        if (infoDoc.exists() && infoDoc.data().inviteCode === inviteCode.toUpperCase()) {
          foundTeamId = teamDoc.id;
          break;
        }
      }

      if (!foundTeamId) {
        setError('Team not found. Check your invite code.');
        setLoading(false);
        return false;
      }

      // Add user as member
      await setDoc(doc(db, 'kudosTeams', foundTeamId, 'members', user.uid), {
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || null,
        joinedAt: serverTimestamp(),
        role: 'member',
      });

      // Save team reference to user
      await setDoc(doc(db, 'kudosUsers', user.uid), {
        teamId: foundTeamId,
      }, { merge: true });

      setTeamId(foundTeamId);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  }, [user]);

  // Leave team
  const leaveTeam = useCallback(async () => {
    if (!user?.uid || !teamId) return;

    try {
      // Remove user from members (but don't delete their kudos)
      await updateDoc(doc(db, 'kudosTeams', teamId, 'members', user.uid), {
        leftAt: serverTimestamp(),
      });

      // Clear user's team reference
      await updateDoc(doc(db, 'kudosUsers', user.uid), {
        teamId: deleteField(),
      });

      setTeamId(null);
      setTeam(null);
      setMembers({});
      setKudos([]);
    } catch (err) {
      setError(err.message);
    }
  }, [user?.uid, teamId]);

  // Give kudos
  const giveKudos = useCallback(async ({ category, message, recipientIds }) => {
    if (!teamId || !user?.uid || !message || recipientIds.length === 0) return null;

    // Prevent self-kudos
    if (recipientIds.includes(user.uid)) {
      setError("You can't give kudos to yourself");
      return null;
    }

    try {
      const recipients = recipientIds.map((uid) => ({
        uid,
        displayName: members[uid]?.displayName || 'Unknown',
      }));

      const kudosRef = collection(db, 'kudosTeams', teamId, 'kudos');
      const docRef = await addDoc(kudosRef, {
        type: 'kudos',
        category,
        title: null,
        message,
        recipients,
        from: { uid: user.uid, displayName: user.displayName || 'Anonymous' },
        reactions: {},
        createdAt: serverTimestamp(),
        spotlightUntil: null,
      });

      return docRef.id;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [teamId, user, members]);

  // Add celebration
  const addCelebration = useCallback(async ({ title, message, taggedUserIds = [] }) => {
    if (!teamId || !user?.uid || !title || !message) return null;

    try {
      const recipients = taggedUserIds.map((uid) => ({
        uid,
        displayName: members[uid]?.displayName || 'Unknown',
      }));

      const spotlightUntil = new Date(Date.now() + SPOTLIGHT_DURATION);

      const kudosRef = collection(db, 'kudosTeams', teamId, 'kudos');
      const docRef = await addDoc(kudosRef, {
        type: 'celebration',
        category: null,
        title,
        message,
        recipients,
        from: { uid: user.uid, displayName: user.displayName || 'Anonymous' },
        reactions: {},
        createdAt: serverTimestamp(),
        spotlightUntil,
      });

      return docRef.id;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [teamId, user, members]);

  // Toggle reaction
  const toggleReaction = useCallback(async (kudoId, emoji) => {
    if (!teamId || !user?.uid) return;

    try {
      const kudoRef = doc(db, 'kudosTeams', teamId, 'kudos', kudoId);
      const kudoDoc = await getDoc(kudoRef);

      if (!kudoDoc.exists()) return;

      const currentReactions = kudoDoc.data().reactions || {};
      const emojiReactions = currentReactions[emoji] || [];

      let newEmojiReactions;
      if (emojiReactions.includes(user.uid)) {
        newEmojiReactions = emojiReactions.filter((uid) => uid !== user.uid);
      } else {
        newEmojiReactions = [...emojiReactions, user.uid];
      }

      await updateDoc(kudoRef, {
        [`reactions.${emoji}`]: newEmojiReactions,
      });
    } catch (err) {
      setError(err.message);
    }
  }, [teamId, user?.uid]);

  // Computed: active celebrations (in spotlight)
  const activeCelebrations = kudos.filter(
    (k) => k.type === 'celebration' && k.spotlightUntil && new Date(k.spotlightUntil.toDate()) > new Date()
  );

  // Computed: wall items (all kudos + expired celebrations)
  const wallKudos = kudos.filter(
    (k) => k.type === 'kudos' || !k.spotlightUntil || new Date(k.spotlightUntil.toDate()) <= new Date()
  );

  // Check if current user is admin
  const isAdmin = members[user?.uid]?.role === 'admin';

  return {
    teamId,
    team,
    members,
    kudos,
    activeCelebrations,
    wallKudos,
    loading,
    error,
    isAdmin,
    createTeam,
    joinTeam,
    leaveTeam,
    giveKudos,
    addCelebration,
    toggleReaction,
  };
};
```

**Test:** Create a team, verify it appears in Firestore. Join with invite code from another account.

---

### Task 1.3: Create TeamSetupModal

**File:** `src/components/KudosBoard/TeamSetupModal.jsx`

```javascript
// src/components/KudosBoard/TeamSetupModal.jsx

import React, { useState } from 'react';
import { X, Users, UserPlus, Loader2 } from 'lucide-react';

const TeamSetupModal = ({ isOpen, onClose, onCreateTeam, onJoinTeam, loading, error }) => {
  const [mode, setMode] = useState('choice'); // 'choice' | 'create' | 'join'
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleCreate = async () => {
    const result = await onCreateTeam(teamName);
    if (result) {
      setTeamName('');
      setMode('choice');
    }
  };

  const handleJoin = async () => {
    const result = await onJoinTeam(inviteCode);
    if (result) {
      setInviteCode('');
      setMode('choice');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'choice' && 'Get Started'}
            {mode === 'create' && 'Create Team'}
            {mode === 'join' && 'Join Team'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {mode === 'choice' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full p-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-left transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users size={24} className="text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Create a Team</h3>
                    <p className="text-sm text-slate-500">Start fresh and invite your teammates</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode('join')}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserPlus size={24} className="text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Join a Team</h3>
                    <p className="text-sm text-slate-500">Enter an invite code to join</p>
                  </div>
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMode('choice')}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading || !teamName.trim()}
                  className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  Create Team
                </button>
              </div>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g., KUDOS-ABC123"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none font-mono text-center text-lg tracking-wider"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMode('choice')}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleJoin}
                  disabled={loading || !inviteCode.trim()}
                  className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  Join Team
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

---

## Phase 2: UI Components (Cards, Wall, Header)

### Task 2.1: Create KudosCard

**File:** `src/components/KudosBoard/KudosCard.jsx`

```javascript
// src/components/KudosBoard/KudosCard.jsx

import React, { useState } from 'react';
import { KUDOS_CATEGORIES, REACTIONS } from './constants';

const KudosCard = ({ kudo, currentUserId, members, onReact }) => {
  const [expanded, setExpanded] = useState(false);
  const category = kudo.category ? KUDOS_CATEGORIES[kudo.category] : null;
  const isCelebration = kudo.type === 'celebration';

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const truncateMessage = (text, maxLength = 140) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const recipientNames = kudo.recipients?.map((r) => r.displayName).join(', ') || '';
  const showExpand = kudo.message.length > 140;

  return (
    <div
      className={`
        bg-white rounded-xl border p-4 transition-shadow hover:shadow-md
        ${isCelebration ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white' : 'border-slate-200'}
      `}
    >
      {/* Category Badge */}
      {category && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${category.bgClass} ${category.textClass}`}>
          <span>{category.icon}</span>
          <span>{category.label}</span>
        </div>
      )}

      {/* Celebration Title */}
      {isCelebration && kudo.title && (
        <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
          <span>🎉</span>
          {kudo.title}
        </h3>
      )}

      {/* Recipients */}
      {recipientNames && (
        <div className="text-sm text-slate-600 mb-2">
          <span className="font-medium">{recipientNames}</span>
        </div>
      )}

      {/* Message */}
      <p className="text-slate-700 text-sm leading-relaxed mb-3">
        {expanded ? kudo.message : truncateMessage(kudo.message)}
        {showExpand && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-rose-600 hover:text-rose-700 ml-1 font-medium"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>From {kudo.from?.displayName || 'Anonymous'}</span>
        <span>{formatDate(kudo.createdAt)}</span>
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        {REACTIONS.map((emoji) => {
          const reactions = kudo.reactions?.[emoji] || [];
          const hasReacted = reactions.includes(currentUserId);
          const count = reactions.length;

          return (
            <button
              key={emoji}
              onClick={() => onReact(kudo.id, emoji)}
              className={`
                px-2 py-1 rounded-full text-sm transition-colors flex items-center gap-1
                ${hasReacted
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }
              `}
            >
              <span>{emoji}</span>
              {count > 0 && <span className="text-xs">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default KudosCard;
```

---

### Task 2.2: Create KudosWall

**File:** `src/components/KudosBoard/KudosWall.jsx`

```javascript
// src/components/KudosBoard/KudosWall.jsx

import React from 'react';
import { Heart } from 'lucide-react';
import KudosCard from './KudosCard';

const KudosWall = ({ kudos, currentUserId, members, onReact }) => {
  if (kudos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart size={32} className="text-rose-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No kudos yet!</h3>
        <p className="text-slate-500">Be the first to appreciate a teammate.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kudos.map((kudo) => (
        <KudosCard
          key={kudo.id}
          kudo={kudo}
          currentUserId={currentUserId}
          members={members}
          onReact={onReact}
        />
      ))}
    </div>
  );
};

export default KudosWall;
```

---

### Task 2.3: Create SpotlightSection

**File:** `src/components/KudosBoard/SpotlightSection.jsx`

```javascript
// src/components/KudosBoard/SpotlightSection.jsx

import React, { useEffect, useState } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import KudosCard from './KudosCard';

const SpotlightSection = ({ celebrations, currentUserId, members, onReact }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);

  // Show confetti on first view
  useEffect(() => {
    if (celebrations.length > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [celebrations.length]);

  if (celebrations.length === 0) return null;

  const canScrollLeft = scrollIndex > 0;
  const canScrollRight = scrollIndex < celebrations.length - 1;

  return (
    <div className="relative mb-8">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            >
              {['🎉', '✨', '🎊', '⭐'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-amber-500" />
        <h2 className="text-lg font-bold text-slate-900">Spotlight</h2>
        <span className="text-sm text-slate-500">({celebrations.length} active)</span>
      </div>

      {/* Carousel */}
      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => setScrollIndex((i) => i - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 gap-4"
            style={{ transform: `translateX(-${scrollIndex * 100}%)` }}
          >
            {celebrations.map((celebration) => (
              <div key={celebration.id} className="min-w-full md:min-w-[48%] lg:min-w-[32%]">
                <KudosCard
                  kudo={celebration}
                  currentUserId={currentUserId}
                  members={members}
                  onReact={onReact}
                />
              </div>
            ))}
          </div>
        </div>

        {canScrollRight && (
          <button
            onClick={() => setScrollIndex((i) => i + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SpotlightSection;
```

**Add confetti animation to `index.css`:**

```css
@keyframes confetti {
  0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
}
.animate-confetti {
  animation: confetti linear forwards;
}
```

---

### Task 2.4: Create TeamHeader

**File:** `src/components/KudosBoard/TeamHeader.jsx`

```javascript
// src/components/KudosBoard/TeamHeader.jsx

import React, { useState } from 'react';
import { Copy, Check, Heart, Sparkles, LogOut, Settings } from 'lucide-react';

const TeamHeader = ({
  team,
  members,
  currentUserId,
  isAdmin,
  onGiveKudos,
  onAddCelebration,
  onLeaveTeam,
}) => {
  const [copied, setCopied] = useState(false);

  const memberList = Object.values(members).filter((m) => !m.leftAt);
  const avatarColors = ['bg-rose-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400', 'bg-teal-400'];

  const handleCopyCode = () => {
    if (team?.inviteCode) {
      navigator.clipboard.writeText(team.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Team info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
            <Heart size={24} className="text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{team?.name || 'Kudos Board'}</h1>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
            >
              <span className="font-mono">{team?.inviteCode}</span>
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Center: Member avatars */}
        <div className="flex items-center -space-x-2">
          {memberList.slice(0, 5).map((member, i) => (
            <div
              key={member.uid}
              className={`w-8 h-8 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold border-2 border-white`}
              title={member.displayName}
            >
              {member.displayName?.charAt(0)?.toUpperCase() || '?'}
            </div>
          ))}
          {memberList.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold border-2 border-white">
              +{memberList.length - 5}
            </div>
          )}
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onGiveKudos}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium transition-colors flex items-center gap-2"
          >
            <Heart size={16} />
            Give Kudos
          </button>
          <button
            onClick={onAddCelebration}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium transition-colors flex items-center gap-2"
          >
            <Sparkles size={16} />
            Celebrate
          </button>
          <button
            onClick={onLeaveTeam}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Leave team"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamHeader;
```

---

## Phase 3: Modals for Creating Kudos/Celebrations

### Task 3.1: Create GiveKudosModal

**File:** `src/components/KudosBoard/GiveKudosModal.jsx`

```javascript
// src/components/KudosBoard/GiveKudosModal.jsx

import React, { useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { KUDOS_CATEGORIES, MESSAGE_MIN_LENGTH, MESSAGE_MAX_LENGTH } from './constants';

const GiveKudosModal = ({ isOpen, onClose, members, currentUserId, onSubmit, loading }) => {
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState('');

  const memberList = Object.values(members).filter((m) => m.uid !== currentUserId && !m.leftAt);
  const isValid = selectedRecipients.length > 0 && selectedCategory && message.length >= MESSAGE_MIN_LENGTH;

  const handleSubmit = async () => {
    if (!isValid) return;

    const success = await onSubmit({
      category: selectedCategory,
      message,
      recipientIds: selectedRecipients,
    });

    if (success) {
      setSelectedRecipients([]);
      setSelectedCategory(null);
      setMessage('');
      onClose();
    }
  };

  const toggleRecipient = (uid) => {
    setSelectedRecipients((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-900">Give Kudos</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Select Recipients */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Who deserves kudos?
            </label>
            <div className="flex flex-wrap gap-2">
              {memberList.map((member) => {
                const isSelected = selectedRecipients.includes(member.uid);
                return (
                  <button
                    key={member.uid}
                    onClick={() => toggleRecipient(member.uid)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5
                      ${isSelected
                        ? 'bg-rose-100 text-rose-700 border-2 border-rose-300'
                        : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                      }
                    `}
                  >
                    {isSelected && <Check size={14} />}
                    {member.displayName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Pick Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              What kind of kudos?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(KUDOS_CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`
                    p-3 rounded-xl text-left transition-all
                    ${selectedCategory === key
                      ? `${cat.bgClass} ${cat.borderClass} border-2`
                      : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                    }
                  `}
                >
                  <div className="text-xl mb-1">{cat.icon}</div>
                  <div className={`text-sm font-medium ${selectedCategory === key ? cat.textClass : 'text-slate-700'}`}>
                    {cat.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Write Message */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
              placeholder="Tell them why they're awesome..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{message.length < MESSAGE_MIN_LENGTH ? `At least ${MESSAGE_MIN_LENGTH} characters` : ''}</span>
              <span>{message.length}/{MESSAGE_MAX_LENGTH}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 sticky bottom-0 bg-white">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Send Kudos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiveKudosModal;
```

---

### Task 3.2: Create AddCelebrationModal

**File:** `src/components/KudosBoard/AddCelebrationModal.jsx`

```javascript
// src/components/KudosBoard/AddCelebrationModal.jsx

import React, { useState } from 'react';
import { X, Loader2, Check, Sparkles } from 'lucide-react';
import { TITLE_MAX_LENGTH, MESSAGE_MAX_LENGTH } from './constants';

const AddCelebrationModal = ({ isOpen, onClose, members, currentUserId, onSubmit, loading }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);

  const memberList = Object.values(members).filter((m) => !m.leftAt);
  const isValid = title.trim().length > 0 && message.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;

    const success = await onSubmit({
      title,
      message,
      taggedUserIds: taggedUsers,
    });

    if (success) {
      setTitle('');
      setMessage('');
      setTaggedUsers([]);
      onClose();
    }
  };

  const toggleTagged = (uid) => {
    setTaggedUsers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Sparkles size={24} className="text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900">Add Celebration</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Celebration Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH))}
              placeholder='e.g., "v2.0 Launch! 🎉"'
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
            <div className="text-xs text-slate-500 text-right mt-1">
              {title.length}/{TITLE_MAX_LENGTH}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
              placeholder="Tell everyone about this win..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
            />
            <div className="text-xs text-slate-500 text-right mt-1">
              {message.length}/{MESSAGE_MAX_LENGTH}
            </div>
          </div>

          {/* Tag People (Optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tag people (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {memberList.map((member) => {
                const isTagged = taggedUsers.includes(member.uid);
                return (
                  <button
                    key={member.uid}
                    onClick={() => toggleTagged(member.uid)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5
                      ${isTagged
                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                        : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                      }
                    `}
                  >
                    {isTagged && <Check size={14} />}
                    {member.displayName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 sticky bottom-0 bg-white">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Celebrate!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCelebrationModal;
```

---

## Phase 4: Main App + Integration

### Task 4.1: Create KudosBoardApp

**File:** `src/components/KudosBoard/KudosBoardApp.jsx`

```javascript
// src/components/KudosBoard/KudosBoardApp.jsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useKudosTeam } from './hooks/useKudosTeam';
import TeamSetupModal from './TeamSetupModal';
import TeamHeader from './TeamHeader';
import SpotlightSection from './SpotlightSection';
import KudosWall from './KudosWall';
import GiveKudosModal from './GiveKudosModal';
import AddCelebrationModal from './AddCelebrationModal';

const KudosBoardApp = ({ user, onBack }) => {
  const {
    teamId,
    team,
    members,
    activeCelebrations,
    wallKudos,
    loading,
    error,
    isAdmin,
    createTeam,
    joinTeam,
    leaveTeam,
    giveKudos,
    addCelebration,
    toggleReaction,
  } = useKudosTeam(user);

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showKudosModal, setShowKudosModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  // Show setup modal if no team
  useEffect(() => {
    if (!loading && !teamId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSetupModal(true);
    }
  }, [loading, teamId]);

  // Close setup modal when team is joined
  useEffect(() => {
    if (teamId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSetupModal(false);
    }
  }, [teamId]);

  const handleBack = () => {
    if (teamId) {
      // Just go back to launcher, don't leave team
      onBack();
    } else {
      onBack();
    }
  };

  const handleLeaveTeam = async () => {
    if (window.confirm('Are you sure you want to leave this team? Your kudos will remain visible.')) {
      await leaveTeam();
      setShowSetupModal(true);
    }
  };

  const handleGiveKudos = async (data) => {
    const result = await giveKudos(data);
    return !!result;
  };

  const handleAddCelebration = async (data) => {
    const result = await addCelebration(data);
    return !!result;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 size={48} className="text-rose-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">❤️</span>
            <span className="font-bold text-slate-900">Kudos Board</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto p-4">
        {teamId ? (
          <>
            <TeamHeader
              team={team}
              members={members}
              currentUserId={user?.uid}
              isAdmin={isAdmin}
              onGiveKudos={() => setShowKudosModal(true)}
              onAddCelebration={() => setShowCelebrationModal(true)}
              onLeaveTeam={handleLeaveTeam}
            />

            <SpotlightSection
              celebrations={activeCelebrations}
              currentUserId={user?.uid}
              members={members}
              onReact={toggleReaction}
            />

            <KudosWall
              kudos={wallKudos}
              currentUserId={user?.uid}
              members={members}
              onReact={toggleReaction}
            />
          </>
        ) : (
          <div className="text-center py-16 text-slate-500">
            Create or join a team to get started
          </div>
        )}
      </main>

      {/* Modals */}
      <TeamSetupModal
        isOpen={showSetupModal}
        onClose={() => teamId ? setShowSetupModal(false) : onBack()}
        onCreateTeam={createTeam}
        onJoinTeam={joinTeam}
        loading={loading}
        error={error}
      />

      <GiveKudosModal
        isOpen={showKudosModal}
        onClose={() => setShowKudosModal(false)}
        members={members}
        currentUserId={user?.uid}
        onSubmit={handleGiveKudos}
        loading={loading}
      />

      <AddCelebrationModal
        isOpen={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
        members={members}
        currentUserId={user?.uid}
        onSubmit={handleAddCelebration}
        loading={loading}
      />
    </div>
  );
};

export default KudosBoardApp;
```

---

### Task 4.2: Create barrel export

**File:** `src/components/KudosBoard/index.js`

```javascript
// src/components/KudosBoard/index.js

export { default as KudosBoardApp } from './KudosBoardApp';
export { useKudosTeam } from './hooks/useKudosTeam';
```

---

### Task 4.3: Update Dashboard.jsx

**File:** `src/pages/Dashboard.jsx`

Add import and route for KudosBoard:

```javascript
// Add import at top
import { KudosBoardApp } from '../components/KudosBoard';

// Add route condition (after habit-tracker block)
if (currentApp === 'kudos-board') {
    return <KudosBoardApp user={user} onBack={() => setCurrentApp(null)} />;
}
```

---

### Task 4.4: Update Launcher.jsx

**File:** `src/components/Launcher.jsx`

Change the "Coming Soon" Kudos Board card to an active button:

```javascript
// Replace lines 131-149 with:
{/* Kudos Board Card */}
<button
    onClick={() => onSelectApp('kudos-board')}
    className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-rose-200 transition-all text-left relative overflow-hidden"
>
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Heart size={120} className="text-rose-600" />
    </div>

    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Heart size={24} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">Kudos Board</h3>
    <p className="text-slate-500 text-sm leading-relaxed">
        Celebrate wins and give shoutouts to teammates for great work.
    </p>
</button>
```

---

### Task 4.5: Add confetti animation to index.css

**File:** `src/index.css`

Add at the end:

```css
/* Confetti animation for celebrations */
@keyframes confetti {
  0% {
    transform: translateY(-10px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(400px) rotate(720deg);
    opacity: 0;
  }
}

.animate-confetti {
  animation: confetti linear forwards;
}
```

---

## Phase 5: Firestore Rules

### Task 5.1: Update firestore.rules

Add rules for Kudos Board collections:

```javascript
// In firestore.rules, add these rules inside the rules_version = '2' block:

// Kudos Board - User team preferences
match /kudosUsers/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Kudos Board - Teams
match /kudosTeams/{teamId} {
  // Anyone can read team existence for joining
  allow read: if request.auth != null;

  // Team info subcollection
  match /info/{docId} {
    allow read: if request.auth != null;
    allow create: if request.auth != null;
    allow update: if request.auth != null &&
      exists(/databases/$(database)/documents/kudosTeams/$(teamId)/members/$(request.auth.uid));
  }

  // Members subcollection
  match /members/{memberId} {
    allow read: if request.auth != null;
    allow create: if request.auth != null && request.auth.uid == memberId;
    allow update: if request.auth != null && request.auth.uid == memberId;
    allow delete: if request.auth != null && request.auth.uid == memberId;
  }

  // Kudos subcollection
  match /kudos/{kudoId} {
    allow read: if request.auth != null &&
      exists(/databases/$(database)/documents/kudosTeams/$(teamId)/members/$(request.auth.uid));
    allow create: if request.auth != null &&
      exists(/databases/$(database)/documents/kudosTeams/$(teamId)/members/$(request.auth.uid));
    allow update: if request.auth != null &&
      exists(/databases/$(database)/documents/kudosTeams/$(teamId)/members/$(request.auth.uid));
  }
}
```

---

## Testing Checklist

1. [ ] Create a new team → verify invite code is generated
2. [ ] Join team with invite code → verify member is added
3. [ ] Give kudos to teammate → verify card appears on wall
4. [ ] Cannot give kudos to self → verify error message
5. [ ] Add celebration → verify it appears in spotlight with confetti
6. [ ] React to kudos → verify reaction count updates
7. [ ] Leave team → verify user is removed from members
8. [ ] Celebration expires after 7 days → verify it moves to wall
9. [ ] Empty state shows when no kudos exist
10. [ ] Mobile responsive layout works

---

## File Creation Order

1. `src/components/KudosBoard/constants.js`
2. `src/components/KudosBoard/hooks/useKudosTeam.js`
3. `src/components/KudosBoard/TeamSetupModal.jsx`
4. `src/components/KudosBoard/KudosCard.jsx`
5. `src/components/KudosBoard/KudosWall.jsx`
6. `src/components/KudosBoard/SpotlightSection.jsx`
7. `src/components/KudosBoard/TeamHeader.jsx`
8. `src/components/KudosBoard/GiveKudosModal.jsx`
9. `src/components/KudosBoard/AddCelebrationModal.jsx`
10. `src/components/KudosBoard/KudosBoardApp.jsx`
11. `src/components/KudosBoard/index.js`
12. Update `src/pages/Dashboard.jsx`
13. Update `src/components/Launcher.jsx`
14. Update `src/index.css`
15. Update `firestore.rules`
