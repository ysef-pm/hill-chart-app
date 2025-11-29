// src/components/KudosBoard/TeamHeader.jsx

import React, { useState } from 'react';
import { Copy, Check, Heart, Sparkles, LogOut } from 'lucide-react';

const TeamHeader = ({
  team,
  members,
  onGiveKudos,
  onAddCelebration,
  onLeaveTeam,
}) => {
  const [copied, setCopied] = useState(false);

  const memberList = Object.values(members).filter((m) => !m.leftAt);
  const avatarColors = ['bg-rose-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400', 'bg-teal-400'];

  const handleCopyCode = () => {
    if (team?.inviteCode) {
      navigator.clipboard.writeText(team.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Team info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Heart size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{team?.name || 'Kudos Board'}</h1>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            >
              <span className="font-mono">{team?.inviteCode}</span>
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Center: Member avatars */}
        <div className="flex items-center -space-x-2">
          {memberList.slice(0, 5).map((member, i) => (
            <div
              key={member.uid}
              className={`w-8 h-8 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold border-2 border-[var(--color-bg-primary)]`}
              title={member.displayName}
            >
              {member.displayName?.charAt(0)?.toUpperCase() || '?'}
            </div>
          ))}
          {memberList.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-secondary)] text-xs font-bold border-2 border-[var(--color-bg-primary)]">
              +{memberList.length - 5}
            </div>
          )}
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onGiveKudos}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-medium transition-colors flex items-center gap-2 shadow-lg shadow-rose-500/20"
          >
            <Heart size={16} />
            Give Kudos
          </button>
          <button
            onClick={onAddCelebration}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Sparkles size={16} />
            Celebrate
          </button>
          <button
            onClick={onLeaveTeam}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] rounded-lg transition-colors"
            title="Leave team"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamHeader;
