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
        bg-white rounded-xl border p-4 transition-shadow hover:shadow-md
        ${isCelebration ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white' : 'border-slate-200'}
      `}
    >
      {/* Category Badge */}
      {category && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${category.bgClass} ${category.textClass}`}>
          <span>{category.icon}</span>
          <span>{category.label}</span>
        </div>
      )}

      {/* Celebration Title */}
      {isCelebration && kudo.title && (
        <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
          <span>🎉</span>
          {kudo.title}
        </h3>
      )}

      {/* Recipients */}
      {recipientNames && (
        <div className="text-sm text-slate-600 mb-2">
          <span className="font-medium">{recipientNames}</span>
        </div>
      )}

      {/* Message */}
      <p className="text-slate-700 text-sm leading-relaxed mb-3">
        {expanded ? kudo.message : truncateMessage(kudo.message)}
        {showExpand && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-rose-600 hover:text-rose-700 ml-1 font-medium"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>From {kudo.from?.displayName || 'Anonymous'}</span>
        <span>{formatDate(kudo.createdAt)}</span>
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
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
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
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
