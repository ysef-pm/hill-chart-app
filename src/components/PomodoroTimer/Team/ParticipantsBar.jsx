// src/components/PomodoroTimer/Team/ParticipantsBar.jsx

import React from 'react';
import { Users, User } from 'lucide-react';
import MemberStatus from './MemberStatus';
import TimerModeToggle from './TimerModeToggle';
import { TIMER_MODES } from '../constants';

const ParticipantsBar = ({ participants, timerMode, isHost, onToggleMode, disabled }) => {
  const participantArray = Object.entries(participants || {}).map(([uid, p]) => ({ uid, ...p }));
  const onlineCount = participantArray.filter(p => p.isOnline).length;

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-3 border border-slate-200">
      {/* Timer mode toggle (host only) */}
      {isHost ? (
        <TimerModeToggle mode={timerMode} onToggle={onToggleMode} disabled={disabled} />
      ) : (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          {timerMode === TIMER_MODES.TEAM ? <Users size={16} /> : <User size={16} />}
          <span>{timerMode === TIMER_MODES.TEAM ? 'Team Timer' : 'Individual'}</span>
        </div>
      )}

      {/* Participant avatars */}
      <div className="flex -space-x-2 ml-auto">
        {participantArray.slice(0, 8).map((p) => (
          <MemberStatus key={p.uid} participant={p} />
        ))}
        {participantArray.length > 8 && (
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
            +{participantArray.length - 8}
          </div>
        )}
      </div>

      <span className="text-sm text-slate-500">{onlineCount} online</span>
    </div>
  );
};

export default ParticipantsBar;
