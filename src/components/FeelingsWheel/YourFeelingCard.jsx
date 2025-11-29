// src/components/FeelingsWheel/YourFeelingCard.jsx

import React from 'react';
import { Trash2 } from 'lucide-react';
import Avatar from './Avatar';

const YourFeelingCard = ({ participant, onRemove }) => {
  const feeling = participant?.feeling;

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-3">Your Feeling</h3>

      {feeling ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              name={participant.name}
              style={participant.avatarStyle}
              color={participant.avatarColor}
              size="md"
            />
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">{participant.name}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {feeling.primary} → {feeling.secondary} → {feeling.tertiary}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-2 text-[var(--color-text-tertiary)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ) : (
        <p className="text-[var(--color-text-muted)] text-sm">
          Click on the wheel to place your feeling
        </p>
      )}
    </div>
  );
};

export default YourFeelingCard;
