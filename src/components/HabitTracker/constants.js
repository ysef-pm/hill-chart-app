// src/components/HabitTracker/constants.js

export const DAYS_OF_WEEK = [
  { id: 0, short: 'Sun', full: 'Sunday' },
  { id: 1, short: 'Mon', full: 'Monday' },
  { id: 2, short: 'Tue', full: 'Tuesday' },
  { id: 3, short: 'Wed', full: 'Wednesday' },
  { id: 4, short: 'Thu', full: 'Thursday' },
  { id: 5, short: 'Fri', full: 'Friday' },
  { id: 6, short: 'Sat', full: 'Saturday' },
];

export const DEFAULT_ACTIVE_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri

export const HABIT_EMOJIS = [
  '📋', '📝', '✅', '🔔', '💬', '📊', '🎯', '⭐',
  '🚀', '💡', '🔍', '📧', '📞', '🤝', '📅', '⏰',
];

export const generateTeamCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Get the start of the current week (Monday)
export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get array of dates for current week
export const getWeekDates = (weekStart = getWeekStart()) => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
};

// Format date for display
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.getDate();
};
