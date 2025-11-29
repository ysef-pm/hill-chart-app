// src/components/PomodoroTimer/Team/TimerModeToggle.jsx

import React, { useState } from 'react';
import { Users, User, ChevronDown } from 'lucide-react';
import { TIMER_MODES } from '../constants';

const TimerModeToggle = ({ mode, onToggle, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (newMode) => {
    if (newMode !== mode) {
      onToggle(newMode);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface-2)]
                   hover:bg-[var(--color-surface-3)] rounded-lg transition-colors disabled:opacity-50 border border-[var(--color-border-subtle)]"
      >
        {mode === TIMER_MODES.TEAM ? (
          <>
            <Users size={16} className="text-emerald-400" />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Team Timer</span>
          </>
        ) : (
          <>
            <User size={16} className="text-sky-400" />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Individual</span>
          </>
        )}
        <ChevronDown size={14} className="text-[var(--color-text-muted)]" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 glass-card-elevated rounded-lg overflow-hidden z-20">
          <button
            onClick={() => handleSelect(TIMER_MODES.TEAM)}
            className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-[var(--color-surface-2)] transition-colors ${
              mode === TIMER_MODES.TEAM ? 'bg-[var(--color-surface-2)]' : ''
            }`}
          >
            <Users size={16} className="text-emerald-400" />
            <span className="text-sm text-[var(--color-text-primary)]">Team Timer</span>
          </button>
          <button
            onClick={() => handleSelect(TIMER_MODES.INDIVIDUAL)}
            className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-[var(--color-surface-2)] transition-colors ${
              mode === TIMER_MODES.INDIVIDUAL ? 'bg-[var(--color-surface-2)]' : ''
            }`}
          >
            <User size={16} className="text-sky-400" />
            <span className="text-sm text-[var(--color-text-primary)]">Individual</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TimerModeToggle;
