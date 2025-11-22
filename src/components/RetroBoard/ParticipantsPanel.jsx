// src/components/RetroBoard/ParticipantsPanel.jsx

import React from 'react';
import { X, Crown, Circle } from 'lucide-react';
import { getInitials } from './constants';

const ParticipantsPanel = ({ isOpen, onClose, participants, hostId }) => {
  if (!isOpen) return null;

  const participantList = Object.entries(participants).map(([id, p]) => ({
    id,
    ...p,
    isHost: id === hostId,
  }));

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h2 className="font-bold text-slate-900">Participants ({participantList.length})</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
          <X size={20} className="text-slate-500" />
        </button>
      </div>

      {/* Participants list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {participantList.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold relative"
              style={{ backgroundColor: p.avatarColor || '#64748b' }}
            >
              {getInitials(p.name)}
              {/* Online indicator */}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  p.isOnline ? 'bg-green-500' : 'bg-slate-300'
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-900">{p.name}</span>
                {p.isHost && (
                  <Crown size={14} className="text-amber-500" />
                )}
              </div>
              <span className="text-xs text-slate-500">
                {p.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsPanel;
