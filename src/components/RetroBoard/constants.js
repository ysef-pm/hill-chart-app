// src/components/RetroBoard/constants.js

export const RETRO_SECTIONS = [
  {
    id: 'sweet-fruits',
    title: 'Sweet Fruits',
    subtitle: 'What went well?',
    icon: '🍎',
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
  },
  {
    id: 'awesome-peeps',
    title: 'Awesome Peeps',
    subtitle: 'Shout out a teammate',
    icon: '⭐',
    color: 'amber',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    hasShoutout: true,
  },
  {
    id: 'pirates',
    title: 'Pirates on Shore',
    subtitle: 'What could improve?',
    icon: '🏴‍☠️',
    color: 'rose',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
  },
  {
    id: 'bottle',
    title: 'Message in Bottle',
    subtitle: 'Action points',
    icon: '🍾',
    color: 'sky',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-700',
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
