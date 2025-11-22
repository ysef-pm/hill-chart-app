// src/components/RetroBoard/RetroColumn.jsx

import React from 'react';
import { Plus, EyeOff } from 'lucide-react';
import RetroItem from './RetroItem';

const RetroColumn = ({
  section,
  items,
  hiddenCount,
  isRevealed,
  currentUserId,
  isHost,
  onAddClick,
  onDeleteItem,
  onExportToHabit,
}) => {
  return (
    <div className={`flex flex-col rounded-xl border-2 ${section.borderColor} overflow-hidden h-full`}>
      {/* Column header */}
      <div className={`p-4 ${section.bgColor}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{section.icon}</span>
          <div>
            <h3 className={`font-bold ${section.textColor}`}>{section.title}</h3>
            <p className="text-xs text-slate-500">{section.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto bg-white min-h-[200px]">
        {items.map((item) => (
          <RetroItem
            key={item.id}
            item={item}
            section={section}
            isOwn={item.authorId === currentUserId}
            isRevealed={isRevealed}
            canDelete={item.authorId === currentUserId || isHost}
            onDelete={onDeleteItem}
            onExportToHabit={section.canExport ? onExportToHabit : null}
          />
        ))}

        {/* Hidden items indicator */}
        {hiddenCount > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 bg-slate-100 rounded-lg text-slate-500">
            <EyeOff size={16} />
            <span className="text-sm">{hiddenCount} hidden item{hiddenCount > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && hiddenCount === 0 && (
          <div className="flex items-center justify-center p-6 text-slate-400 text-sm">
            No items yet
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={onAddClick}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-dashed ${section.borderColor} ${section.textColor} hover:${section.bgColor} transition-colors`}
        >
          <Plus size={18} />
          <span className="font-medium">Add</span>
        </button>
      </div>
    </div>
  );
};

export default RetroColumn;
