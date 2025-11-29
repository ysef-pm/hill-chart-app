// src/components/PomodoroTimer/Timer/TimerControls.jsx

import React from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';

const TimerControls = ({
  timer,
  isHost,
  timerMode,
  onStart,
  onPause,
  onResume,
  onReset,
  onStartBreak,
  disabled
}) => {
  const isRunning = timer && !timer.isPaused && timer.endTime;
  const isPaused = timer?.isPaused;
  const isComplete = timer && !timer.isPaused && !timer.endTime && timer.type;
  const canControl = timerMode === 'individual' || isHost;

  if (!canControl) {
    return (
      <div className="text-center text-[var(--color-text-muted)] text-sm py-4">
        Waiting for host to control the timer...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Main action button */}
      {!timer || isComplete ? (
        <button
          onClick={() => onStart('work')}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors shadow-lg shadow-red-500/20"
        >
          <Play size={20} />
          Start Focus
        </button>
      ) : isPaused ? (
        <button
          onClick={onResume}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors shadow-lg shadow-red-500/20"
        >
          <Play size={20} />
          Resume
        </button>
      ) : isRunning ? (
        <button
          onClick={onPause}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors shadow-lg shadow-amber-500/20"
        >
          <Pause size={20} />
          Pause
        </button>
      ) : null}

      {/* Break button (show after work session completes) */}
      {isComplete && timer?.type === 'work' && (
        <button
          onClick={() => onStartBreak()}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors shadow-lg shadow-green-500/20"
        >
          <Coffee size={20} />
          Start Break
        </button>
      )}

      {/* Reset button */}
      {timer && (
        <button
          onClick={onReset}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] rounded-xl font-medium disabled:opacity-50 transition-colors border border-[var(--color-border-subtle)]"
        >
          <RotateCcw size={20} />
        </button>
      )}
    </div>
  );
};

export default TimerControls;
