// src/components/KudosBoard/constants.js

// Kudos categories with icons and colors
export const KUDOS_CATEGORIES = {
  helped: { label: 'Helped Me', icon: '🙌', color: 'blue', bgClass: 'bg-blue-100', textClass: 'text-blue-700', borderClass: 'border-blue-200' },
  shipped: { label: 'Shipped It', icon: '🚀', color: 'green', bgClass: 'bg-green-100', textClass: 'text-green-700', borderClass: 'border-green-200' },
  idea: { label: 'Great Idea', icon: '💡', color: 'purple', bgClass: 'bg-purple-100', textClass: 'text-purple-700', borderClass: 'border-purple-200' },
  above: { label: 'Went Above', icon: '🎯', color: 'orange', bgClass: 'bg-orange-100', textClass: 'text-orange-700', borderClass: 'border-orange-200' },
  team: { label: 'Team Player', icon: '🤝', color: 'teal', bgClass: 'bg-teal-100', textClass: 'text-teal-700', borderClass: 'border-teal-200' },
};

// Reaction emojis
export const REACTIONS = ['👏', '🎉', '❤️', '🔥'];

// Spotlight duration (7 days in ms)
export const SPOTLIGHT_DURATION = 7 * 24 * 60 * 60 * 1000;

// Generate team invite code
export const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'KUDOS-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate team ID (shorter, URL-safe)
export const generateTeamId = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// Message length constraints
export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 280;
export const TITLE_MAX_LENGTH = 60;
