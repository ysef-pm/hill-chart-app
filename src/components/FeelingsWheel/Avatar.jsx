// src/components/FeelingsWheel/Avatar.jsx

import React from 'react';
import { getInitials, AVATAR_STYLES } from './constants';

const Avatar = ({ name, style = 'initials', color = '#4C6EF5', size = 'md', showOnline = false, isOnline = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const avatarStyle = AVATAR_STYLES.find(s => s.id === style);
  const displayContent = style === 'initials'
    ? getInitials(name)
    : avatarStyle?.icon || getInitials(name);

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white`}
        style={{ backgroundColor: color }}
      >
        {displayContent}
      </div>
      {showOnline && (
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
