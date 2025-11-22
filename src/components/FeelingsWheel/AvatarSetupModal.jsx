// src/components/FeelingsWheel/AvatarSetupModal.jsx

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import Avatar from './Avatar';
import { AVATAR_STYLES, AVATAR_COLORS, getInitials, getRandomColor } from './constants';

const AvatarSetupModal = ({ user, onComplete, initialColor }) => {
  const name = user?.displayName || 'Anonymous';
  const [avatarStyle, setAvatarStyle] = useState('initials');
  const [avatarColor, setAvatarColor] = useState(initialColor || getRandomColor());

  const handleComplete = () => {
    onComplete(name, avatarStyle, avatarColor);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Customize Your Avatar</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="flex flex-col items-center gap-3">
            <Avatar name={name} style={avatarStyle} color={avatarColor} size="xl" />
            <p className="text-slate-600 font-medium">{name}</p>
          </div>

          {/* Avatar Style */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Avatar Style
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setAvatarStyle(style.id)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    avatarStyle === style.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-xl">
                      {style.icon || getInitials(name)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Avatar Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_COLORS.map((colorOption) => (
                <button
                  key={colorOption.id}
                  onClick={() => setAvatarColor(colorOption.color)}
                  className={`w-full aspect-square rounded-xl transition-all flex items-center justify-center ${
                    avatarColor === colorOption.color
                      ? 'ring-2 ring-offset-2 ring-blue-500'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: colorOption.color }}
                >
                  {avatarColor === colorOption.color && (
                    <Check size={20} className="text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            Join Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSetupModal;
