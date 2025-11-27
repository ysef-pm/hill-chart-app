// src/components/FeelingsWheel/RoomInfoBar.jsx

import React from 'react';
import { Copy, Check } from 'lucide-react';
import Avatar from './Avatar';

const RoomInfoBar = ({ roomCode, participants }) => {
  const [copied, setCopied] = React.useState(false);

  const participantList = Object.entries(participants || {});
  const pinsPlaced = participantList.filter(([, p]) => p.feeling).length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Room</p>
            <p className="font-mono font-bold text-slate-900">{roomCode}</p>
          </div>

          <div className="flex -space-x-2">
            {participantList.slice(0, 5).map(([id, participant]) => (
              <Avatar
                key={id}
                name={participant.name}
                style={participant.avatarStyle}
                color={participant.avatarColor}
                size="sm"
                showOnline
                isOnline={participant.isOnline}
              />
            ))}
            {participantList.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                +{participantList.length - 5}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-500">
            {pinsPlaced}/{participantList.length} pins placed
          </p>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomInfoBar;
