// src/components/PomodoroTimer/Garden/HarvestAnimation.jsx

import React, { useEffect } from 'react';

const HarvestAnimation = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div className="text-6xl animate-bounce">
        🍅
      </div>
    </div>
  );
};

export default HarvestAnimation;
