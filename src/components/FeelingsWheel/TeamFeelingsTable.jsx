// src/components/FeelingsWheel/TeamFeelingsTable.jsx

import React from 'react';
import { X } from 'lucide-react';
import Avatar from './Avatar';
import { FEELINGS_WHEEL } from './constants';

const TeamFeelingsTable = ({ isOpen, onClose, roomCode, participants }) => {
  if (!isOpen) return null;

  const participantsWithFeelings = Object.entries(participants || {})
    .filter(([, p]) => p.feeling)
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card-elevated w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Team Feelings</h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {participantsWithFeelings.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)] py-8">No feelings placed yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[var(--color-text-tertiary)] border-b border-[var(--color-border-subtle)]">
                  <th className="pb-3 font-medium">Participant</th>
                  <th className="pb-3 font-medium">Feeling</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
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
                        <span className="font-medium text-[var(--color-text-primary)]">
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
                        <span className="text-[var(--color-text-secondary)] font-medium">
                          {participant.feeling.tertiary}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-[var(--color-text-tertiary)] text-sm">
                      {formatTime(participant.feelingPlacedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-[var(--color-border-subtle)] text-center text-sm text-[var(--color-text-muted)]">
          Feelings mapped for room {roomCode}
        </div>
      </div>
    </div>
  );
};

export default TeamFeelingsTable;
