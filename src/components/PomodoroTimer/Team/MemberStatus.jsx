// src/components/PomodoroTimer/Team/MemberStatus.jsx

import React from 'react';
import { getInitials, USER_STATUS } from '../constants';

const MemberStatus = ({ participant }) => {
  const statusStyles = {
    [USER_STATUS.FOCUSING]: 'ring-red-500',
    [USER_STATUS.BREAK]: 'ring-green-500',
    [USER_STATUS.IDLE]: 'ring-slate-300',
  };

  const statusDotStyles = {
    [USER_STATUS.FOCUSING]: 'bg-red-500',
    [USER_STATUS.BREAK]: 'bg-green-500',
    [USER_STATUS.IDLE]: 'bg-slate-300',
  };

  const ringClass = statusStyles[participant.status] || statusStyles[USER_STATUS.IDLE];
  const dotClass = statusDotStyles[participant.status] || statusDotStyles[USER_STATUS.IDLE];

  return (
    <div className="relative group">
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center
                    text-white text-xs font-bold ring-2 ring-offset-2 ${ringClass}
                    ${!participant.isOnline ? 'opacity-50' : ''}`}
        style={{ backgroundColor: participant.avatarColor }}
      >
        {getInitials(participant.name)}
      </div>

      {/* Status dot */}
      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full
                       border-2 border-white ${dotClass}`}
      />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                      bg-slate-800 text-white text-xs rounded px-2 py-1
                      opacity-0 group-hover:opacity-100 whitespace-nowrap
                      pointer-events-none z-10 transition-opacity">
        {participant.name} - {participant.status || 'idle'}
        {!participant.isOnline && ' (offline)'}
      </div>
    </div>
  );
};

export default MemberStatus;
