// src/components/KudosBoard/KudosCard.jsx

import React, { useState } from 'react';
import { KUDOS_CATEGORIES, REACTIONS } from './constants';

const KudosCard = ({ kudo, currentUserId, onReact }) => {
  const [expanded, setExpanded] = useState(false);
  const category = kudo.category ? KUDOS_CATEGORIES[kudo.category] : null;
  const isCelebration = kudo.type === 'celebration';

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const truncateMessage = (text, maxLength = 140) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const recipientNames = kudo.recipients?.map((r) => r.displayName).join(', ') || '';
  const showExpand = kudo.message.length > 140;

  return (
    <div
      className={`
        glass-card p-4 transition-shadow hover:shadow-lg
        ${isCelebration ? 'border-amber-500/30 bg-amber-500/5' : ''}
      `}
    >
      {/* Category Badge */}
      {category && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)]`}>
          <span>{category.icon}</span>
          <span className="text-[var(--color-text-secondary)]">{category.label}</span>
        </div>
      )}

      {/* Celebration Title */}
      {isCelebration && kudo.title && (
        <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
          <span>🎉</span>
          {kudo.title}
        </h3>
      )}

      {/* Recipients */}
      {recipientNames && (
        <div className="text-sm text-[var(--color-text-secondary)] mb-2">
          <span className="font-medium">{recipientNames}</span>
        </div>
      )}

      {/* Message */}
      <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-3">
        {expanded ? kudo.message : truncateMessage(kudo.message)}
        {showExpand && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-rose-400 hover:text-rose-300 ml-1 font-medium"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span>From {kudo.from?.displayName || 'Anonymous'}</span>
        <span>{formatDate(kudo.createdAt)}</span>
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
        {REACTIONS.map((emoji) => {
          const reactions = kudo.reactions?.[emoji] || [];
          const hasReacted = reactions.includes(currentUserId);
          const count = reactions.length;

          return (
            <button
              key={emoji}
              onClick={() => onReact(kudo.id, emoji)}
              className={`
                px-2 py-1 rounded-full text-sm transition-colors flex items-center gap-1
                ${hasReacted
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]'
                }
              `}
            >
              <span>{emoji}</span>
              {count > 0 && <span className="text-xs">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default KudosCard;
