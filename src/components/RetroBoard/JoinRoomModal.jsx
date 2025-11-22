// src/components/RetroBoard/JoinRoomModal.jsx

import React, { useState } from 'react';
import { X, Users, Plus } from 'lucide-react';
import { AVATAR_COLORS, getInitials } from './constants';

const JoinRoomModal = ({ isOpen, onClose, onCreateRoom, onJoinRoom, user, loading }) => {
  const [mode, setMode] = useState('choose'); // 'choose' | 'create' | 'join'
  const [retroName, setRetroName] = useState('');
  const [userName, setUserName] = useState(user?.displayName || '');
  const [roomCode, setRoomCode] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    const code = await onCreateRoom(retroName, userName, selectedColor);
    if (code) {
      onClose();
    }
  };

  const handleJoin = async () => {
    const success = await onJoinRoom(roomCode.toUpperCase(), userName, selectedColor);
    if (success) {
      onClose();
    }
  };

  const resetAndClose = () => {
    setMode('choose');
    setRetroName('');
    setRoomCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'choose' && 'Retro Board'}
            {mode === 'create' && 'Create Retro'}
            {mode === 'join' && 'Join Retro'}
          </h2>
          <button onClick={resetAndClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'choose' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 rounded-xl flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Plus size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Create New Retro</p>
                  <p className="text-sm text-slate-500">Start a new retrospective session</p>
                </div>
              </button>

              <button
                onClick={() => setMode('join')}
                className="w-full p-4 bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 rounded-xl flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Join Existing Retro</p>
                  <p className="text-sm text-slate-500">Enter a room code to join</p>
                </div>
              </button>
            </div>
          )}

          {(mode === 'create' || mode === 'join') && (
            <div className="space-y-4">
              {mode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Retro Name
                  </label>
                  <input
                    type="text"
                    value={retroName}
                    onChange={(e) => setRetroName(e.target.value)}
                    placeholder="e.g., Sprint 23 Retro"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              )}

              {mode === 'join' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="e.g., ABC123"
                    maxLength={6}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 uppercase tracking-widest text-center text-xl font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="How should we call you?"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pick Your Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
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

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setMode('choose')}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={mode === 'create' ? handleCreate : handleJoin}
                  disabled={loading || (mode === 'join' && roomCode.length !== 6)}
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-medium disabled:opacity-50 ${
                    mode === 'create'
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
