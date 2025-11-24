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
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100
                   hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
      >
        {mode === TIMER_MODES.TEAM ? (
          <>
            <Users size={16} className="text-emerald-600" />
            <span className="text-sm font-medium">Team Timer</span>
          </>
        ) : (
          <>
            <User size={16} className="text-sky-600" />
            <span className="text-sm font-medium">Individual</span>
          </>
        )}
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-20">
          <button
            onClick={() => handleSelect(TIMER_MODES.TEAM)}
            className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-slate-50 ${
              mode === TIMER_MODES.TEAM ? 'bg-slate-50' : ''
            }`}
          >
            <Users size={16} className="text-emerald-600" />
            <span className="text-sm">Team Timer</span>
          </button>
          <button
            onClick={() => handleSelect(TIMER_MODES.INDIVIDUAL)}
            className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-slate-50 ${
              mode === TIMER_MODES.INDIVIDUAL ? 'bg-slate-50' : ''
            }`}
          >
            <User size={16} className="text-sky-600" />
            <span className="text-sm">Individual</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TimerModeToggle;
