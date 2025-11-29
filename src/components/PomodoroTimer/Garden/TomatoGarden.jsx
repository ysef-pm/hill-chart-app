// src/components/PomodoroTimer/Garden/TomatoGarden.jsx

import React, { useState, useEffect, useRef } from 'react';
import TomatoPlant from './TomatoPlant';
import HarvestAnimation from './HarvestAnimation';

const TomatoGarden = ({ tasks, garden }) => {
  const [showHarvest, setShowHarvest] = useState(false);
  const prevCompletedCountRef = useRef(0);

  const completedTasks = Object.entries(tasks || {})
    .filter(([, task]) => task.completed)
    .map(([id, task]) => ({ id, ...task }))
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  // Show harvest animation when a new task is completed
  useEffect(() => {
    if (completedTasks.length > prevCompletedCountRef.current && prevCompletedCountRef.current > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowHarvest(true);
    }
    prevCompletedCountRef.current = completedTasks.length;
  }, [completedTasks.length]);

  return (
    <div className="glass-card bg-amber-500/5 border border-amber-500/30 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🍅</span>
        <h3 className="font-semibold text-amber-400">Harvest Garden</h3>
        <span className="ml-auto text-sm text-amber-500/70">
          {garden.totalPomodoros} pomodoros
        </span>
      </div>

      {/* Garden plot */}
      {completedTasks.length === 0 ? (
        <p className="text-amber-500/70 text-sm text-center py-4">
          Complete tasks to grow your garden!
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {completedTasks.map((task) => (
            <TomatoPlant key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-3 pt-3 border-t border-amber-500/20 text-xs text-amber-500/70">
        {garden.completedTasks} tasks harvested
      </div>

      {/* Harvest animation */}
      {showHarvest && (
        <HarvestAnimation onComplete={() => setShowHarvest(false)} />
      )}
    </div>
  );
};

export default TomatoGarden;
