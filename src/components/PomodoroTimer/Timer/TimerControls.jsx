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
      <div className="text-center text-slate-500 text-sm py-4">
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
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
        >
          <Play size={20} />
          Start Focus
        </button>
      ) : isPaused ? (
        <button
          onClick={onResume}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
        >
          <Play size={20} />
          Resume
        </button>
      ) : isRunning ? (
        <button
          onClick={onPause}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
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
          className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
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
          className="flex items-center gap-2 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium disabled:opacity-50 transition-colors"
        >
          <RotateCcw size={20} />
        </button>
      )}
    </div>
  );
};

export default TimerControls;
