// src/components/PomodoroTimer/constants.js

export const AVATAR_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#14B8A6', // teal
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
];

export const DEFAULT_WORK_DURATION = 25 * 60 * 1000; // 25 minutes in ms
export const DEFAULT_BREAK_DURATION = 5 * 60 * 1000; // 5 minutes in ms

export const TIMER_MODES = {
  TEAM: 'team',
  INDIVIDUAL: 'individual',
};

export const TIMER_TYPES = {
  WORK: 'work',
  BREAK: 'break',
};

export const USER_STATUS = {
  FOCUSING: 'focusing',
  BREAK: 'break',
  IDLE: 'idle',
};

export const GROWTH_STAGES = [
  { stage: 0, name: 'seed', icon: '🌱', description: 'Just planted' },
  { stage: 1, name: 'sprout', icon: '🌿', description: 'Growing' },
  { stage: 2, name: 'flower', icon: '🌼', description: 'Flowering' },
  { stage: 3, name: 'green', icon: '🟢', description: 'Almost ready' },
  { stage: 4, name: 'ripe', icon: '🍅', description: 'Harvested!' },
];

export const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const getRandomColor = () => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatTime = (ms) => {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
