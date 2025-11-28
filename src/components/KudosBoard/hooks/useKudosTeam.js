// src/components/KudosBoard/hooks/useKudosTeam.js

import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  collection,
  collectionGroup,
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
  Timestamp,
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

      // Create team document at root level (for querying by inviteCode)
      await setDoc(doc(db, 'kudosTeams', newTeamId), {
        inviteCode,
        createdAt: serverTimestamp(),
      });

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
      // Find team by invite code using query
      const teamsRef = collection(db, 'kudosTeams');
      const q = query(teamsRef, where('inviteCode', '==', inviteCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Team not found. Check your invite code.');
        setLoading(false);
        return false;
      }

      const foundTeamId = querySnapshot.docs[0].id;

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
  }, [user, teamId]);

  // Give kudos
  const giveKudos = useCallback(async ({ category, message, recipientIds, customRecipientNames = [] }) => {
    if (!teamId || !user?.uid || !message) return null;

    // Must have at least one recipient (member or custom)
    if (recipientIds.length === 0 && customRecipientNames.length === 0) return null;

    // Prevent self-kudos
    if (recipientIds.includes(user.uid)) {
      setError("You can't give kudos to yourself");
      return null;
    }

    try {
      // Combine member recipients and custom name recipients
      const memberRecipients = recipientIds.map((uid) => ({
        uid,
        displayName: members[uid]?.displayName || 'Unknown',
      }));
      const customRecipients = customRecipientNames.map((name) => ({
        uid: null,
        displayName: name,
      }));
      const recipients = [...memberRecipients, ...customRecipients];

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

      const spotlightUntil = Timestamp.fromMillis(Date.now() + SPOTLIGHT_DURATION);

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
  }, [teamId, user]);

  // Computed: active celebrations (in spotlight)
  const activeCelebrations = kudos.filter((k) => {
    if (k.type !== 'celebration' || !k.spotlightUntil) return false;
    const until = k.spotlightUntil.toDate ? k.spotlightUntil.toDate() : new Date(k.spotlightUntil);
    return until > new Date();
  });

  // Computed: wall items (all kudos + expired celebrations)
  const wallKudos = kudos.filter((k) => {
    if (k.type === 'kudos') return true;
    if (!k.spotlightUntil) return true;
    const until = k.spotlightUntil.toDate ? k.spotlightUntil.toDate() : new Date(k.spotlightUntil);
    return until <= new Date();
  });

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
