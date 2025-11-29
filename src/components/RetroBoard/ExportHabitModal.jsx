// src/components/RetroBoard/ExportHabitModal.jsx

import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
// Firebase imports removed - not needed in this component
import { HABIT_EMOJIS, DAYS_OF_WEEK, DEFAULT_ACTIVE_DAYS } from '../HabitTracker/constants';
import { useTeamHabits } from '../HabitTracker/hooks/useTeamHabits';

const ExportHabitModal = ({ isOpen, onClose, item, roomCode, user }) => {
  const [text, setText] = useState('');
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0]);
  const [activeDays, setActiveDays] = useState(DEFAULT_ACTIVE_DAYS);
  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [teamName, setTeamName] = useState('');

  const { teamId, team, addHabit, createTeam, loading } = useTeamHabits(user);

  useEffect(() => {
    if (item) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(item.text);
    }
  }, [item]);

  useEffect(() => {
    if (!teamId && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowTeamSetup(true);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowTeamSetup(false);
    }
  }, [teamId, isOpen]);

  if (!isOpen || !item) return null;

  const handleCreateTeam = async () => {
    const code = await createTeam(teamName);
    if (code) {
      setShowTeamSetup(false);
    }
  };

  const handleExport = async () => {
    if (!text.trim() || !teamId) return;

    const habitId = await addHabit(text.trim(), emoji, activeDays, roomCode);
    if (habitId) {
      onClose();
    }
  };

  const toggleDay = (dayId) => {
    setActiveDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId].sort()
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-elevated max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)] bg-sky-500/10">
          <div className="flex items-center gap-2">
            <ArrowRight size={20} className="text-sky-400" />
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Create Habit from Action</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-surface-2)] rounded-full">
            <X size={20} className="text-[var(--color-text-tertiary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {showTeamSetup ? (
            <div className="space-y-4">
              <p className="text-[var(--color-text-secondary)] text-sm">
                You need to be part of a team to track habits. Create one now:
              </p>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., My Team"
                  className="w-full px-4 py-2 border border-[var(--color-border-default)] bg-[var(--color-surface-1)] rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
                />
              </div>
              <button
                onClick={handleCreateTeam}
                disabled={loading || !teamName.trim()}
                className="w-full px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 disabled:opacity-50 shadow-lg shadow-sky-500/20"
              >
                {loading ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-[var(--color-surface-1)] rounded-lg border border-[var(--color-border-subtle)]">
                <p className="text-sm text-[var(--color-text-secondary)]">Exporting to: <strong className="text-[var(--color-text-primary)]">{team?.name}</strong></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Habit Description
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--color-border-default)] bg-[var(--color-surface-1)] rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Emoji
                </label>
                <div className="flex gap-2 flex-wrap">
                  {HABIT_EMOJIS.slice(0, 8).map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`w-9 h-9 text-lg rounded-lg flex items-center justify-center transition-all ${
                        emoji === e
                          ? 'bg-sky-500/20 ring-2 ring-sky-500 scale-110'
                          : 'bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)]'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Track on
                </label>
                <div className="flex gap-1">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                        activeDays.includes(day.id)
                          ? 'bg-sky-500 text-white'
                          : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)]'
                      }`}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-[var(--color-border-default)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-surface-2)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={!text.trim()}
                  className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 disabled:opacity-50 shadow-lg shadow-sky-500/20"
                >
                  Create Habit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportHabitModal;
