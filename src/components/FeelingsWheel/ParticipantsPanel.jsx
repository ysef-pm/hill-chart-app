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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm glass-card-elevated shadow-2xl z-50 overflow-y-auto border-l border-[var(--color-border-subtle)]">
        <div className="p-6 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Room: {roomCode}</h2>
            <button
              onClick={onClose}
              className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-[var(--color-text-secondary)]">Participants: {participantList.length}</p>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
            All Participants
          </h3>

          <div className="space-y-3">
            {participantList.map(([id, participant]) => (
              <div
                key={id}
                className="flex items-center justify-between p-3 bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-border-subtle)]"
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
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {participant.name}
                      {id === currentUserId && (
                        <span className="text-[var(--color-text-muted)] font-normal"> (You)</span>
                      )}
                    </p>
                    <p className="text-sm">
                      {participant.feeling ? (
                        <span className="flex items-center gap-1 text-[var(--color-accent)]">
                          <Check size={14} /> Placed pin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
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
