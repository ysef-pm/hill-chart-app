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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-elevated w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {mode === 'choice' && 'Get Started'}
            {mode === 'create' && 'Create Team'}
            {mode === 'join' && 'Join Team'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors"
          >
            <X size={20} className="text-[var(--color-text-tertiary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {mode === 'choice' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full p-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-left transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">Create a Team</h3>
                    <p className="text-sm text-[var(--color-text-tertiary)]">Start fresh and invite your teammates</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode('join')}
                className="w-full p-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border-subtle)] rounded-xl text-left transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserPlus size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">Join a Team</h3>
                    <p className="text-sm text-[var(--color-text-tertiary)]">Enter an invite code to join</p>
                  </div>
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
                  className="w-full px-4 py-3 bg-[var(--color-surface-1)] border border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMode('choice')}
                  className="flex-1 px-4 py-3 border border-[var(--color-border-default)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-surface-2)] font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading || !teamName.trim()}
                  className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g., KUDOS-ABC123"
                  className="w-full px-4 py-3 bg-[var(--color-surface-1)] border border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono text-center text-lg tracking-wider text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMode('choice')}
                  className="flex-1 px-4 py-3 border border-[var(--color-border-default)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-surface-2)] font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleJoin}
                  disabled={loading || !inviteCode.trim()}
                  className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
