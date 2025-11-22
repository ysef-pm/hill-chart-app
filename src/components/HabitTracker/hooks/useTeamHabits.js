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
    console.log('[useTeamHabits] createTeam called with:', teamName);
    if (!user) {
      console.log('[useTeamHabits] No user, returning null');
      return null;
    }
    setLoading(true);
    setError(null);

    try {
      const code = generateTeamCode();
      console.log('[useTeamHabits] Generated team code:', code);
      const teamRef = doc(db, 'teams', code);

      console.log('[useTeamHabits] Creating team document...');
      await setDoc(teamRef, {
        name: teamName || 'My Team',
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        memberIds: [user.uid],
      });

      console.log('[useTeamHabits] Updating user document...');
      // Update user's teamId
      await setDoc(doc(db, 'users', user.uid), {
        teamId: code,
        displayName: user.displayName || 'Anonymous',
      }, { merge: true });

      console.log('[useTeamHabits] Team created successfully');
      setTeamId(code);
      setLoading(false);
      return code;
    } catch (err) {
      console.error('[useTeamHabits] Error creating team:', err);
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
    console.log('[useTeamHabits] leaveTeam called for user:', user?.uid);
    if (!user?.uid) {
      console.log('[useTeamHabits] No user, returning');
      return;
    }

    try {
      console.log('[useTeamHabits] Updating user document to remove teamId...');
      await updateDoc(doc(db, 'users', user.uid), { teamId: null });
      console.log('[useTeamHabits] User document updated, resetting local state...');
      setTeamId(null);
      setTeam(null);
      setHabits([]);
      setChecks({});
      console.log('[useTeamHabits] Local state reset');
    } catch (err) {
      console.error('[useTeamHabits] Error leaving team:', err);
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
