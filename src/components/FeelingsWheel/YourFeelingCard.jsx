// src/components/FeelingsWheel/YourFeelingCard.jsx

import React from 'react';
import { Trash2 } from 'lucide-react';
import Avatar from './Avatar';

const YourFeelingCard = ({ participant, onRemove }) => {
  const feeling = participant?.feeling;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <h3 className="text-sm font-medium text-slate-500 mb-3">Your Feeling</h3>

      {feeling ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              name={participant.name}
              style={participant.avatarStyle}
              color={participant.avatarColor}
              size="md"
            />
            <div>
              <p className="font-medium text-slate-900">{participant.name}</p>
              <p className="text-sm text-slate-600">
                {feeling.primary} → {feeling.secondary} → {feeling.tertiary}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ) : (
        <p className="text-slate-400 text-sm">
          Click on the wheel to place your feeling
        </p>
      )}
    </div>
  );
};

export default YourFeelingCard;
