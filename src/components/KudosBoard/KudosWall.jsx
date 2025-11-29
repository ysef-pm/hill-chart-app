// src/components/KudosBoard/KudosWall.jsx

import React from 'react';
import { Heart } from 'lucide-react';
import KudosCard from './KudosCard';

const KudosWall = ({ kudos, currentUserId, members, onReact }) => {
  if (kudos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
          <Heart size={32} className="text-rose-400" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">No kudos yet!</h3>
        <p className="text-[var(--color-text-muted)]">Be the first to appreciate a teammate.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kudos.map((kudo) => (
        <KudosCard
          key={kudo.id}
          kudo={kudo}
          currentUserId={currentUserId}
          members={members}
          onReact={onReact}
        />
      ))}
    </div>
  );
};

export default KudosWall;
