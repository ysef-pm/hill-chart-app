// src/components/FeelingsWheel/constants.js

export const FEELINGS_WHEEL = {
  Happy: {
    color: '#F9E076',
    secondary: {
      Playful: ['Aroused', 'Cheeky'],
      Content: ['Free', 'Joyful'],
      Interested: ['Curious', 'Inquisitive'],
      Proud: ['Successful', 'Confident'],
      Accepted: ['Respected', 'Valued'],
      Powerful: ['Courageous', 'Creative'],
      Peaceful: ['Loving', 'Thankful'],
      Trusting: ['Sensitive', 'Intimate'],
      Optimistic: ['Hopeful', 'Inspired'],
    }
  },
  Surprised: {
    color: '#C9A0D6',
    secondary: {
      Excited: ['Energetic', 'Eager'],
      Amazed: ['Awe', 'Astonished'],
      Confused: ['Perplexed', 'Disillusioned'],
      Startled: ['Dismayed', 'Shocked'],
    }
  },
  Bad: {
    color: '#B8A9C9',
    secondary: {
      Tired: ['Sleepy', 'Unfocused'],
      Stressed: ['Overwhelmed', 'Out of control'],
      Busy: ['Rushed', 'Pressured'],
      Bored: ['Apathetic', 'Indifferent'],
    }
  },
  Fearful: {
    color: '#96C9A8',
    secondary: {
      Scared: ['Helpless', 'Frightened'],
      Anxious: ['Overwhelmed', 'Worried'],
      Insecure: ['Inadequate', 'Inferior'],
      Weak: ['Worthless', 'Insignificant'],
      Rejected: ['Excluded', 'Persecuted'],
      Threatened: ['Nervous', 'Exposed'],
    }
  },
  Angry: {
    color: '#F4A9A0',
    secondary: {
      'Let down': ['Betrayed', 'Resentful'],
      Humiliated: ['Disrespected', 'Ridiculed'],
      Bitter: ['Indignant', 'Violated'],
      Mad: ['Furious', 'Jealous'],
      Aggressive: ['Provoked', 'Hostile'],
      Frustrated: ['Infuriated', 'Annoyed'],
      Distant: ['Withdrawn', 'Numb'],
      Critical: ['Skeptical', 'Dismissive'],
    }
  },
  Disgusted: {
    color: '#A8A8A8',
    secondary: {
      Disapproving: ['Judgmental', 'Embarrassed'],
      Disappointed: ['Appalled', 'Revolted'],
      Awful: ['Nauseated', 'Detestable'],
      Repelled: ['Horrified', 'Hesitant'],
    }
  },
  Sad: {
    color: '#8BBBD9',
    secondary: {
      Hurt: ['Embarrassed', 'Disappointed'],
      Depressed: ['Inferior', 'Empty'],
      Guilty: ['Remorseful', 'Ashamed'],
      Despair: ['Powerless', 'Grief'],
      Vulnerable: ['Fragile', 'Victimized'],
      Lonely: ['Abandoned', 'Isolated'],
    }
  },
};

export const AVATAR_STYLES = [
  { id: 'initials', label: 'Initials', icon: null },
  { id: 'cat', label: 'Cat', icon: '🐱' },
  { id: 'dog', label: 'Dog', icon: '🐕' },
  { id: 'rabbit', label: 'Rabbit', icon: '🐰' },
  { id: 'fish', label: 'Fish', icon: '🐟' },
  { id: 'bird', label: 'Bird', icon: '🐦' },
  { id: 'mouse', label: 'Mouse', icon: '🐭' },
  { id: 'bug', label: 'Bug', icon: '🐛' },
  { id: 'octocat', label: 'Octocat', icon: '🐙' },
];

export const AVATAR_COLORS = [
  { id: 'red', color: '#FF6B6B' },
  { id: 'orange', color: '#FFA94D' },
  { id: 'yellow', color: '#FFE066' },
  { id: 'lime', color: '#A9E34B' },
  { id: 'green', color: '#51CF66' },
  { id: 'cyan', color: '#22D3EE' },
  { id: 'blue', color: '#4C6EF5' },
  { id: 'purple', color: '#9775FA' },
  { id: 'pink', color: '#F472B6' },
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

export const getRandomColor = () => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)].color;
};
