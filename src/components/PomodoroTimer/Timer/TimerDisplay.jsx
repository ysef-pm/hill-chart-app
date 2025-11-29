// src/components/PomodoroTimer/Timer/TimerDisplay.jsx

import React, { useState, useEffect } from 'react';
import { formatTime } from '../constants';

const TimerDisplay = ({ timer, timerMode }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (!timer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeRemaining(null);
      return;
    }

    if (timer.isPaused) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeRemaining(timer.pausedRemaining);
      return;
    }

    if (!timer.endTime) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeRemaining(timer.duration || null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = timer.endTime - Date.now();
      if (remaining <= 0) {
        setTimeRemaining(0);
        clearInterval(interval);
      } else {
        setTimeRemaining(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [timer?.endTime, timer?.isPaused, timer?.pausedRemaining, timer?.duration]);

  const duration = timer?.duration || 25 * 60 * 1000;
  const progress = timeRemaining !== null ? (timeRemaining / duration) * 100 : 100;
  const isRunning = timer && !timer.isPaused && timer.endTime;
  // Default to work/red color when no timer (Ready state), since next action starts a focus session
  const isWork = !timer || timer.type === 'work';

  // SVG circle properties
  const size = 240;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Timer mode indicator */}
      <div className="mb-2 text-sm text-[var(--color-text-muted)]">
        {timerMode === 'team' ? 'Team Timer' : 'Personal Timer'}
      </div>

      {/* Circular timer */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isWork ? '#EF4444' : '#22C55E'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-200 ${isRunning ? 'opacity-100' : 'opacity-70'}`}
            style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-[var(--color-text-primary)] font-mono">
            {formatTime(timeRemaining ?? duration)}
          </span>
          <span className={`text-sm font-medium mt-1 ${isWork ? 'text-red-400' : 'text-green-400'}`}>
            {timer ? (isWork ? 'Focus Session' : 'Break Time') : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
