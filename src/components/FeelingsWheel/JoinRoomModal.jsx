// src/components/FeelingsWheel/JoinRoomModal.jsx

import React, { useState } from 'react';
import { X, Shuffle } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Join a Feelings Room</h2>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
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
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest font-mono"
              />
              <button
                onClick={handleGenerate}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                title="Generate random code"
              >
                <Shuffle size={20} />
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <p className="text-slate-500 text-sm">
            Share this code with your team members so they can join the same room.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleJoin}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Join Room
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors"
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
