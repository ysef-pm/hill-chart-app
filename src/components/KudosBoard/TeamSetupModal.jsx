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
