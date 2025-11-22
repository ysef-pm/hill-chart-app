// src/components/FeelingsWheel/ParticipantsPanel.jsx

import React from 'react';
import { X, Check, Clock } from 'lucide-react';
import Avatar from './Avatar';

const ParticipantsPanel = ({ isOpen, onClose, roomCode, participants, currentUserId }) => {
  if (!isOpen) return null;

  const participantList = Object.entries(participants || {});

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-900">Room: {roomCode}</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-slate-500">Participants: {participantList.length}</p>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
            All Participants
          </h3>

          <div className="space-y-3">
            {participantList.map(([id, participant]) => (
              <div
                key={id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={participant.name}
                    style={participant.avatarStyle}
                    color={participant.avatarColor}
                    size="md"
                    showOnline
                    isOnline={participant.isOnline}
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      {participant.name}
                      {id === currentUserId && (
                        <span className="text-slate-400 font-normal"> (You)</span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500">
                      {participant.feeling ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Check size={14} /> Placed pin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock size={14} /> Waiting...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ParticipantsPanel;
