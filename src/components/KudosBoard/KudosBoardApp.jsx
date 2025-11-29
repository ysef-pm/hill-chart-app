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
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <Loader2 size={48} className="text-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Header */}
      <header className="glass-card border-b border-[var(--color-border-subtle)] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-[var(--color-text-tertiary)]" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <span className="text-xl">❤️</span>
            </div>
            <span className="font-semibold text-[var(--color-text-primary)]">Kudos Board</span>
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
          <div className="text-center py-16 text-[var(--color-text-muted)]">
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
