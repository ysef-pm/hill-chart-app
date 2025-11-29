// src/components/HabitTracker/TeamSetupModal.jsx

import React, { useState } from 'react';
import { X, Users, Plus } from 'lucide-react';

const TeamSetupModal = ({ isOpen, onClose, onCreateTeam, onJoinTeam, loading, error, onClearError }) => {
  const [mode, setMode] = useState('choose'); // 'choose' | 'create' | 'join'
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');

  if (!isOpen) return null;

  const handleCreate = async () => {
    console.log('[TeamSetupModal] handleCreate called with:', teamName);
    await onCreateTeam(teamName);
    // Don't call onClose() here - let the parent close it when teamId updates
  };

  console.log('[TeamSetupModal] Render:', { isOpen, mode, teamName, teamCode });

  const handleJoin = async () => {
    console.log('[TeamSetupModal] handleJoin called with code:', teamCode);
    await onJoinTeam(teamCode.toUpperCase());
    console.log('[TeamSetupModal] onJoinTeam completed');
    // Don't call onClose() here - let the parent close it when teamId updates
  };

  const resetAndClose = () => {
    setMode('choose');
    setTeamName('');
    setTeamCode('');
    if (onClearError) onClearError();
    onClose();
  };

  // Clear error when switching modes
  const handleModeChange = (newMode) => {
    if (onClearError) onClearError();
    setMode(newMode);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-elevated max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {mode === 'choose' && 'Join a Team'}
            {mode === 'create' && 'Create Team'}
            {mode === 'join' && 'Join Team'}
          </h2>
          <button onClick={resetAndClose} className="p-2 hover:bg-[var(--color-surface-2)] rounded-full">
            <X size={20} className="text-[var(--color-text-tertiary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'choose' && (
            <div className="space-y-4">
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                Habit Tracker works with teams. Create a new team or join an existing one.
              </p>

              <button
                onClick={() => handleModeChange('create')}
                className="w-full p-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Plus size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-[var(--color-text-primary)]">Create New Team</p>
                  <p className="text-sm text-[var(--color-text-tertiary)]">Start tracking habits with your team</p>
                </div>
              </button>

              <button
                onClick={() => handleModeChange('join')}
                className="w-full p-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border-subtle)] rounded-xl flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-sky-500/20">
                  <Users size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-[var(--color-text-primary)]">Join Existing Team</p>
                  <p className="text-sm text-[var(--color-text-tertiary)]">Enter a team code to join</p>
                </div>
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Grub Squad"
                  className="w-full px-4 py-2 border border-[var(--color-border-default)] bg-[var(--color-surface-1)] rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handleModeChange('choose')}
                  className="flex-1 px-4 py-2 border border-[var(--color-border-default)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-surface-2)]"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading || !teamName.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                >
                  {loading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Team Code
                </label>
                <input
                  type="text"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABCD1234"
                  maxLength={8}
                  className="w-full px-4 py-2 border border-[var(--color-border-default)] bg-[var(--color-surface-1)] rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent uppercase tracking-widest text-center text-xl font-mono outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handleModeChange('choose')}
                  className="flex-1 px-4 py-2 border border-[var(--color-border-default)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-surface-2)]"
                >
                  Back
                </button>
                <button
                  onClick={handleJoin}
                  disabled={loading || teamCode.length !== 8}
                  className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 disabled:opacity-50 shadow-lg shadow-sky-500/20"
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
