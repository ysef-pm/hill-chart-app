// src/components/RetroBoard/JoinRoomModal.jsx

import React, { useState } from 'react';
import { X, Users, Plus, MessageSquare } from 'lucide-react';
import { AVATAR_COLORS, getInitials } from './constants';

const JoinRoomModal = ({ isOpen, onClose, onCreateRoom, onJoinRoom, user, loading, error }) => {
  const [mode, setMode] = useState('choose'); // 'choose' | 'create' | 'join'
  const [retroName, setRetroName] = useState('');
  const [userName, setUserName] = useState(user?.displayName || '');
  const [roomCode, setRoomCode] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    console.log('[JoinRoomModal] handleCreate called with:', { retroName, userName, selectedColor });
    await onCreateRoom(retroName, userName, selectedColor);
    // Don't call onClose() here - let the useEffect in RetroBoardApp close the modal
  };

  const handleJoin = async () => {
    await onJoinRoom(roomCode.toUpperCase(), userName, selectedColor);
    // Don't call onClose() here - let the useEffect in RetroBoardApp close the modal
  };

  const resetAndClose = () => {
    setMode('choose');
    setRetroName('');
    setRoomCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-elevated max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {mode === 'choose' && 'Retro Board'}
              {mode === 'create' && 'Create Retro'}
              {mode === 'join' && 'Join Retro'}
            </h2>
          </div>
          <button onClick={resetAndClose} className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors">
            <X size={20} className="text-[var(--color-text-tertiary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'choose' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                  <Plus size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[var(--color-text-primary)]">Create New Retro</p>
                  <p className="text-sm text-[var(--color-text-tertiary)]">Start a new retrospective session</p>
                </div>
              </button>

              <button
                onClick={() => setMode('join')}
                className="w-full p-4 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[var(--color-text-primary)]">Join Existing Retro</p>
                  <p className="text-sm text-[var(--color-text-tertiary)]">Enter a room code to join</p>
                </div>
              </button>
            </div>
          )}

          {(mode === 'create' || mode === 'join') && (
            <div className="space-y-4">
              {mode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    Retro Name
                  </label>
                  <input
                    type="text"
                    value={retroName}
                    onChange={(e) => setRetroName(e.target.value)}
                    placeholder="e.g., Sprint 23 Retro"
                    className="w-full px-4 py-2 bg-[var(--color-surface-1)] border border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
                  />
                </div>
              )}

              {mode === 'join' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="e.g., ABC123"
                    maxLength={6}
                    className="w-full px-4 py-2 bg-[var(--color-surface-1)] border border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent uppercase tracking-widest text-center text-xl font-mono text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="How should we call you?"
                  className="w-full px-4 py-2 bg-[var(--color-surface-1)] border border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Pick Your Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-offset-[var(--color-bg-primary)] ring-[var(--color-accent)] scale-110' : ''
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

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setMode('choose')}
                  className="flex-1 px-4 py-2 border border-[var(--color-border-default)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={mode === 'create' ? handleCreate : handleJoin}
                  disabled={loading || (mode === 'join' && roomCode.length !== 6)}
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-medium disabled:opacity-50 transition-colors ${mode === 'create'
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
