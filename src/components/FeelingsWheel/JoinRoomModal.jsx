// src/components/FeelingsWheel/JoinRoomModal.jsx

import React, { useState } from 'react';
import { X, Shuffle, Smile } from 'lucide-react';
import { generateRoomCode } from './constants';

const JoinRoomModal = ({ onCreateRoom, onJoinRoom, onClose }) => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = () => {
    setRoomCode(generateRoomCode());
    setError('');
  };

  const handleJoin = () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    if (roomCode.trim().length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }
    onJoinRoom(roomCode.trim().toUpperCase());
  };

  const handleCreate = () => {
    const code = roomCode.trim() || generateRoomCode();
    onCreateRoom(code.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card-elevated w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Smile size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Join a Feelings Room</h2>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-lg transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Room Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter code (e.g. ABC123)"
                maxLength={6}
                className="flex-1 px-4 py-3 bg-[var(--color-surface-1)] border border-[var(--color-border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-center text-lg tracking-widest font-mono text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
              />
              <button
                onClick={handleGenerate}
                className="px-4 py-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] rounded-xl transition-colors border border-[var(--color-border-subtle)]"
                title="Generate random code"
              >
                <Shuffle size={20} />
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          <p className="text-[var(--color-text-tertiary)] text-sm">
            Share this code with your team members so they can join the same room.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleJoin}
              className="flex-1 px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-xl transition-colors"
            >
              Join Room
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-6 py-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] font-medium rounded-xl transition-colors border border-[var(--color-border-default)]"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomModal;
