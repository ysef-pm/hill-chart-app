// src/components/FeelingsWheel/hooks/useFeelingsRoom.js

import { useState, useEffect, useCallback } from 'react';
import { ref, set, get, onValue, onDisconnect, serverTimestamp } from 'firebase/database';
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

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
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

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
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

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
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
