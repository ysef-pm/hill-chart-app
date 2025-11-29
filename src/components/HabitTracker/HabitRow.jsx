// src/components/HabitTracker/HabitRow.jsx

import React from 'react';
import { Trash2, Check, Minus } from 'lucide-react';

const HabitRow = ({
  habit,
  weekDates,
  activeDays,
  isCheckedByUser,
  getCheckersForDate,
  onToggleCheck,
  onArchive,
  showTeamView,
}) => {
  return (
    <tr className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-1)] group">
      {/* Habit info */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{habit.emoji}</span>
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">{habit.text}</p>
            {habit.sourceRetro && (
              <p className="text-xs text-[var(--color-text-muted)]">from retro</p>
            )}
          </div>
        </div>
      </td>

      {/* Day checkboxes */}
      {weekDates.map((date) => {
        const dayNum = new Date(date).getDay();
        const isActive = activeDays.includes(dayNum);
        const isChecked = isCheckedByUser(habit.id, date);
        const checkers = getCheckersForDate(habit.id, date);

        if (!isActive) {
          return (
            <td key={date} className="py-3 px-2 text-center">
              <div className="w-8 h-8 mx-auto flex items-center justify-center text-[var(--color-text-muted)]">
                <Minus size={16} />
              </div>
            </td>
          );
        }

        return (
          <td key={date} className="py-3 px-2 text-center">
            <button
              onClick={() => onToggleCheck(habit.id, date)}
              className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center transition-all ${
                isChecked
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)]'
              }`}
            >
              {isChecked && <Check size={16} />}
            </button>

            {/* Team view: show who checked */}
            {showTeamView && checkers.length > 0 && (
              <div className="mt-1 text-xs text-[var(--color-text-muted)] truncate max-w-[60px] mx-auto">
                {checkers.map((c) => c.checkedByName.split(' ')[0]).join(', ')}
              </div>
            )}
          </td>
        );
      })}

      {/* Actions */}
      <td className="py-3 px-2">
        <button
          onClick={() => onArchive(habit.id)}
          className="p-2 text-[var(--color-text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Archive habit"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};

export default HabitRow;
