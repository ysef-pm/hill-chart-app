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
    console.log('[useRetroRoom] createRoom called with:', { retroName, userName, avatarColor, user: user?.uid });
    if (!user) {
      console.log('[useRetroRoom] No user, returning null');
      return null;
    }
    setLoading(true);
    setError(null);

    try {
      const code = generateRoomCode();
      console.log('[useRetroRoom] Generated room code:', code);
      const roomRef = ref(rtdb, `retroRooms/${code}`);

      console.log('[useRetroRoom] Attempting to create room in Firebase...');
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

      console.log('[useRetroRoom] Room created successfully in Firebase');
      setRoomCode(code);
      setLoading(false);
      console.log('[useRetroRoom] Returning code:', code);
      return code;
    } catch (err) {
      console.error('[useRetroRoom] Error creating room:', err);
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
