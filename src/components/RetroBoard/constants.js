// src/components/RetroBoard/constants.js

export const RETRO_SECTIONS = [
  {
    id: 'sweet-fruits',
    title: 'Sweet Fruits',
    subtitle: 'What went well?',
    icon: '🍎',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    headerBg: 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10',
    accentColor: '#10b981',
  },
  {
    id: 'awesome-peeps',
    title: 'Awesome Peeps',
    subtitle: 'Shout out a teammate',
    icon: '⭐',
    color: 'amber',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    headerBg: 'bg-gradient-to-r from-amber-500/20 to-amber-600/10',
    accentColor: '#f59e0b',
    hasShoutout: true,
  },
  {
    id: 'pirates',
    title: 'Pirates on Shore',
    subtitle: 'What could improve?',
    icon: '🏴‍☠️',
    color: 'rose',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-400',
    headerBg: 'bg-gradient-to-r from-rose-500/20 to-rose-600/10',
    accentColor: '#f43f5e',
  },
  {
    id: 'bottle',
    title: 'Message in Bottle',
    subtitle: 'Action points',
    icon: '🍾',
    color: 'sky',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    textColor: 'text-sky-400',
    headerBg: 'bg-gradient-to-r from-sky-500/20 to-sky-600/10',
    accentColor: '#0ea5e9',
    canExport: true,
  },
];

export const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const AVATAR_COLORS = [
  '#FF6B6B', '#FFA94D', '#FFE066', '#A9E34B', '#51CF66',
  '#22D3EE', '#4C6EF5', '#9775FA', '#F472B6',
];

export const getRandomColor = () => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};
