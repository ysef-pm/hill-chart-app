// src/components/FeelingsWheel/TeamFeelingsTable.jsx

import React from 'react';
import { X } from 'lucide-react';
import Avatar from './Avatar';
import { FEELINGS_WHEEL } from './constants';

const TeamFeelingsTable = ({ isOpen, onClose, roomCode, participants }) => {
  if (!isOpen) return null;

  const participantsWithFeelings = Object.entries(participants || {})
    .filter(([_, p]) => p.feeling)
    .sort((a, b) => (b[1].feelingPlacedAt || 0) - (a[1].feelingPlacedAt || 0));

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Team Feelings</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {participantsWithFeelings.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No feelings placed yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Participant</th>
                  <th className="pb-3 font-medium">Feeling</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participantsWithFeelings.map(([id, participant]) => (
                  <tr key={id}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={participant.name}
                          style={participant.avatarStyle}
                          color={participant.avatarColor}
                          size="sm"
                        />
                        <span className="font-medium text-slate-900">
                          {participant.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: FEELINGS_WHEEL[participant.feeling.primary]?.color,
                          }}
                        />
                        <span className="text-slate-600">
                          {participant.feeling.primary} → {participant.feeling.secondary} → {participant.feeling.tertiary}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-500 text-sm">
                      {formatTime(participant.feelingPlacedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 text-center text-sm text-slate-500">
          Feelings mapped for room {roomCode}
        </div>
      </div>
    </div>
  );
};

export default TeamFeelingsTable;
