// src/components/HabitTracker/HabitTrackerApp.jsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Users, User, Copy, Check, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useTeamHabits } from './hooks/useTeamHabits';
import { DAYS_OF_WEEK, getWeekStart, getWeekDates, formatDate } from './constants';
import TeamSetupModal from './TeamSetupModal';
import AddHabitModal from './AddHabitModal';
import HabitRow from './HabitRow';

const HabitTrackerApp = ({ user, onBack }) => {
  const {
    teamId,
    team,
    habits,
    loading,
    error,
    createTeam,
    joinTeam,
    addHabit,
    archiveHabit,
    toggleCheck,
    isCheckedByUser,
    getCheckersForDate,
    leaveTeam,
  } = useTeamHabits(user);

  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showTeamView, setShowTeamView] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [copied, setCopied] = useState(false);

  // Calculate current week dates
  const baseWeekStart = getWeekStart();
  const weekStart = new Date(baseWeekStart);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(weekStart);

  // Show setup modal if no team, close it if team exists
  useEffect(() => {
    console.log('[HabitTrackerApp] useEffect check:', { loading, teamId, showTeamSetup });
    if (!loading) {
      const shouldShow = !teamId;
      if (showTeamSetup !== shouldShow) {
        console.log('[HabitTrackerApp] Updating showTeamSetup to:', shouldShow);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowTeamSetup(shouldShow);
      }
    }
  }, [loading, teamId, showTeamSetup]);

  const handleCopyCode = () => {
    if (teamId) {
      navigator.clipboard.writeText(teamId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isCurrentWeek = weekOffset === 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="text-[var(--color-text-muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Header */}
      <header className="glass-card border-b border-[var(--color-border-subtle)] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-[var(--color-surface-2)] rounded-full"
            >
              <ArrowLeft size={20} className="text-[var(--color-text-tertiary)]" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-xl">📋</span>
              </div>
              <div>
                <h1 className="font-bold text-[var(--color-text-primary)]">Habit Tracker</h1>
                {team && (
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                  >
                    <span>{team.name}</span>
                    <span className="font-mono text-xs">({teamId})</span>
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {teamId && (
            <div className="flex items-center gap-2">
              {/* Leave Team Button */}
              <button
                onClick={() => {
                  console.log('[HabitTrackerApp] Leave Team button clicked');
                  if (window.confirm('Are you sure you want to leave this team?')) {
                    console.log('[HabitTrackerApp] Calling leaveTeam...');
                    console.log('[HabitTrackerApp] Calling leaveTeam...');
                    leaveTeam().then(() => console.log('[HabitTrackerApp] leaveTeam completed'));
                  }
                }}
                className="p-2 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Leave Team"
              >
                <LogOut size={20} />
              </button>

              {/* View toggle */}
              <div className="flex bg-[var(--color-surface-1)] rounded-lg p-1 border border-[var(--color-border-subtle)]">
                <button
                  onClick={() => setShowTeamView(false)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!showTeamView ? 'bg-[var(--color-surface-3)] shadow-sm text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'
                    }`}
                >
                  <User size={16} />
                  My View
                </button>
                <button
                  onClick={() => setShowTeamView(true)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${showTeamView ? 'bg-[var(--color-surface-3)] shadow-sm text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'
                    }`}
                >
                  <Users size={16} />
                  Team
                </button>
              </div>

              {/* Add habit button */}
              <button
                onClick={() => setShowAddHabit(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
              >
                <Plus size={18} />
                Add Habit
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      {teamId ? (
        <main className="max-w-6xl mx-auto p-4">
          {/* Week navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border-subtle)]"
            >
              <ChevronLeft size={20} className="text-[var(--color-text-secondary)]" />
            </button>

            <div className="text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                {isCurrentWeek ? 'This Week' : `Week of ${weekDates[0]}`}
              </p>
            </div>

            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              disabled={isCurrentWeek}
              className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg disabled:opacity-30 border border-[var(--color-border-subtle)]"
            >
              <ChevronRight size={20} className="text-[var(--color-text-secondary)]" />
            </button>
          </div>

          {/* Habits table */}
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-surface-1)] border-b border-[var(--color-border-subtle)]">
                  <th className="py-3 px-4 text-left text-sm font-medium text-[var(--color-text-secondary)] w-1/3">
                    Habit
                  </th>
                  {weekDates.map((date) => {
                    const dayNum = new Date(date).getDay();
                    const day = DAYS_OF_WEEK.find((d) => d.id === dayNum);
                    const isToday = date === new Date().toISOString().split('T')[0];

                    return (
                      <th
                        key={date}
                        className={`py-3 px-2 text-center text-sm font-medium w-[60px] ${isToday ? 'text-indigo-400 bg-indigo-500/10' : 'text-[var(--color-text-secondary)]'
                          }`}
                      >
                        <div>{day?.short}</div>
                        <div className="text-xs font-normal">{formatDate(date)}</div>
                      </th>
                    );
                  })}
                  <th className="py-3 px-2 w-[50px]"></th>
                </tr>
              </thead>
              <tbody>
                {habits.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[var(--color-text-muted)]">
                      No habits yet. Click "Add Habit" to get started!
                    </td>
                  </tr>
                ) : (
                  habits.map((habit) => (
                    <HabitRow
                      key={habit.id}
                      habit={habit}
                      weekDates={weekDates}
                      activeDays={habit.activeDays || [1, 2, 3, 4, 5]}
                      isCheckedByUser={isCheckedByUser}
                      getCheckersForDate={getCheckersForDate}
                      onToggleCheck={toggleCheck}
                      onArchive={archiveHabit}
                      showTeamView={showTeamView}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center text-[var(--color-text-muted)]">
            <p>Create or join a team to start tracking habits</p>
            <button
              onClick={() => setShowTeamSetup(true)}
              className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <TeamSetupModal
        isOpen={showTeamSetup}
        onClose={() => setShowTeamSetup(false)}
        onCreateTeam={createTeam}
        onJoinTeam={joinTeam}
        loading={loading}
        error={error}
        onClearError={() => {
          // We can't directly clear the error in useTeamHabits, but we can work around it
          // by triggering a state change that clears errors on next operation
        }}
      />

      <AddHabitModal
        isOpen={showAddHabit}
        onClose={() => setShowAddHabit(false)}
        onAdd={addHabit}
      />
    </div>
  );
};

export default HabitTrackerApp;
