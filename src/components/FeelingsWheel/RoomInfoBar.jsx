// src/components/FeelingsWheel/RoomInfoBar.jsx

import React from 'react';
import { Copy, Check } from 'lucide-react';
import Avatar from './Avatar';

const RoomInfoBar = ({ roomCode, participants }) => {
  const [copied, setCopied] = React.useState(false);

  const participantList = Object.entries(participants || {});
  const pinsPlaced = participantList.filter(([, p]) => p.feeling).length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Room</p>
            <p className="font-mono font-bold text-[var(--color-text-primary)]">{roomCode}</p>
          </div>

          <div className="flex -space-x-2">
            {participantList.slice(0, 5).map(([id, participant]) => (
              <Avatar
                key={id}
                name={participant.name}
                style={participant.avatarStyle}
                color={participant.avatarColor}
                size="sm"
                showOnline
                isOnline={participant.isOnline}
              />
            ))}
            {participantList.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-xs font-medium text-[var(--color-text-secondary)] border-2 border-[var(--color-bg-primary)]">
                +{participantList.length - 5}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-sm text-[var(--color-text-tertiary)]">
            {pinsPlaced}/{participantList.length} pins placed
          </p>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] text-sm font-medium rounded-lg transition-colors border border-[var(--color-border-subtle)]"
          >
            {copied ? <Check size={16} className="text-[var(--color-accent)]" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomInfoBar;
