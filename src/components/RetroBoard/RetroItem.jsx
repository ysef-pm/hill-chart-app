// src/components/RetroBoard/RetroItem.jsx

import React from 'react';
import { Trash2, ArrowRight } from 'lucide-react';
import { getInitials } from './constants';

const RetroItem = ({
  item,
  section,
  isOwn,
  isRevealed,
  canDelete,
  onDelete,
  onExportToHabit
}) => {
  return (
    <div
      className={`p-3 rounded-lg border-2 ${section.bgColor} ${section.borderColor} relative group`}
    >
      {/* Author badge */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: item.avatarColor || '#64748b' }}
        >
          {getInitials(item.authorName)}
        </div>
        <span className="text-xs font-medium text-slate-600">
          {isOwn ? 'You' : item.authorName}
        </span>
      </div>

      {/* Shoutout badge for awesome-peeps */}
      {item.shoutoutTo && (
        <div className="mb-2 px-2 py-1 bg-amber-200 rounded-full inline-block">
          <span className="text-xs font-bold text-amber-800">@{item.shoutoutTo}</span>
        </div>
      )}

      {/* Item text */}
      <p className="text-sm text-slate-700">{item.text}</p>

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Export to habit button (only for bottle section after reveal) */}
        {section.canExport && isRevealed && onExportToHabit && (
          <button
            onClick={() => onExportToHabit(item)}
            className="p-1.5 bg-sky-500 text-white rounded-md hover:bg-sky-600"
            title="Export to Habit Tracker"
          >
            <ArrowRight size={14} />
          </button>
        )}

        {/* Delete button */}
        {canDelete && (
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default RetroItem;
