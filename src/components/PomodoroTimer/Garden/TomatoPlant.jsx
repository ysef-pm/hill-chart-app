// src/components/PomodoroTimer/Garden/TomatoPlant.jsx

import React from 'react';
import { GROWTH_STAGES } from '../constants';

const TomatoPlant = ({ task }) => {
  const stage = GROWTH_STAGES[4]; // Completed = fully grown

  return (
    <div className="group relative">
      <div className="w-10 h-10 bg-[var(--color-surface-2)] rounded-lg border border-amber-500/30
                      flex items-center justify-center text-xl
                      hover:scale-110 transition-transform cursor-pointer
                      hover:border-amber-500/50">
        {stage.icon}
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                      bg-[var(--color-surface-3)] text-[var(--color-text-primary)] text-xs rounded px-2 py-1
                      opacity-0 group-hover:opacity-100 transition-opacity
                      whitespace-nowrap pointer-events-none z-10 border border-[var(--color-border-subtle)]">
        {task.text}
      </div>
    </div>
  );
};

export default TomatoPlant;
