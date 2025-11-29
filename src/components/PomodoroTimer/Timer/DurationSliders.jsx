// src/components/PomodoroTimer/Timer/DurationSliders.jsx

import React from 'react';

const DurationSliders = ({
  workDuration,
  breakDuration,
  onWorkChange,
  onBreakChange,
  disabled
}) => {
  // Convert ms to minutes for display
  const workMinutes = Math.round(workDuration / 60000);
  const breakMinutes = Math.round(breakDuration / 60000);

  return (
    <div className="space-y-4 p-4 bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-border-subtle)]">
      {/* Work duration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
            <span className="text-lg">🍅</span>
            Work
          </div>
          <span className="text-sm font-mono text-red-400">{workMinutes} min</span>
        </div>
        <input
          type="range"
          min={5}
          max={60}
          step={5}
          value={workMinutes}
          onChange={(e) => onWorkChange(parseInt(e.target.value) * 60000)}
          disabled={disabled}
          aria-label="Work duration in minutes"
          className="w-full h-2 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Break duration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
            <span className="text-lg">☕</span>
            Break
          </div>
          <span className="text-sm font-mono text-green-400">{breakMinutes} min</span>
        </div>
        <input
          type="range"
          min={1}
          max={30}
          step={1}
          value={breakMinutes}
          onChange={(e) => onBreakChange(parseInt(e.target.value) * 60000)}
          disabled={disabled}
          aria-label="Break duration in minutes"
          className="w-full h-2 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

export default DurationSliders;
