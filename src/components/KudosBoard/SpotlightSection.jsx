// src/components/KudosBoard/SpotlightSection.jsx

import React, { useEffect, useState } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import KudosCard from './KudosCard';

// Generate confetti positions outside component to avoid purity issues
const generateConfetti = () => {
  return [...Array(20)].map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random(),
    emoji: ['🎉', '✨', '🎊', '⭐'][Math.floor(Math.random() * 4)],
  }));
};

const SpotlightSection = ({ celebrations, currentUserId, members, onReact }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [confettiItems] = useState(() => generateConfetti());

  // Show confetti on first view
  useEffect(() => {
    if (celebrations.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [celebrations.length]);

  if (celebrations.length === 0) return null;

  const canScrollLeft = scrollIndex > 0;
  const canScrollRight = scrollIndex < celebrations.length - 1;

  return (
    <div className="relative mb-8">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiItems.map((item) => (
            <div
              key={item.id}
              className="absolute animate-confetti"
              style={{
                left: `${item.left}%`,
                animationDelay: `${item.delay}s`,
                animationDuration: `${item.duration}s`,
              }}
            >
              {item.emoji}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-amber-500" />
        <h2 className="text-lg font-bold text-slate-900">Spotlight</h2>
        <span className="text-sm text-slate-500">({celebrations.length} active)</span>
      </div>

      {/* Carousel */}
      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => setScrollIndex((i) => i - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 gap-4"
            style={{ transform: `translateX(-${scrollIndex * 100}%)` }}
          >
            {celebrations.map((celebration) => (
              <div key={celebration.id} className="min-w-full md:min-w-[48%] lg:min-w-[32%]">
                <KudosCard
                  kudo={celebration}
                  currentUserId={currentUserId}
                  members={members}
                  onReact={onReact}
                />
              </div>
            ))}
          </div>
        </div>

        {canScrollRight && (
          <button
            onClick={() => setScrollIndex((i) => i + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SpotlightSection;
