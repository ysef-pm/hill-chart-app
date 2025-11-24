// src/components/PomodoroTimer/Garden/TomatoPlant.jsx

import React from 'react';
import { GROWTH_STAGES } from '../constants';

const TomatoPlant = ({ task }) => {
  const stage = GROWTH_STAGES[4]; // Completed = fully grown

  return (
    <div className="group relative">
      <div className="w-10 h-10 bg-white rounded-lg border-2 border-amber-200
                      flex items-center justify-center text-xl
                      hover:scale-110 transition-transform cursor-pointer
                      shadow-sm hover:shadow-md">
        {stage.icon}
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                      bg-slate-800 text-white text-xs rounded px-2 py-1
                      opacity-0 group-hover:opacity-100 transition-opacity
                      whitespace-nowrap pointer-events-none z-10">
        {task.text}
      </div>
    </div>
  );
};

export default TomatoPlant;
