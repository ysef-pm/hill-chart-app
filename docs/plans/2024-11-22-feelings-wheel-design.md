# Feelings Wheel Implementation Design

## Overview

A collaborative feelings wheel tool for team retrospectives. Users create/join rooms, place pins on a 3-level emotion wheel, and the host reveals everyone's feelings simultaneously.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Real-time sync | Firebase Realtime Database | Built-in presence, optimized for sync |
| Name source | Auto from Google sign-in | Reduces friction, already authenticated |
| Avatar | Default with edit option | Auto-assign initials + random color, editable |
| Reveal control | Host only | Facilitator controls retro flow |
| Architecture | Modular components | 8-10 files, organized, maintainable |

## Component Structure

```
src/components/FeelingsWheel/
├── FeelingsWheelApp.jsx      # Main container, state management
├── JoinRoomModal.jsx         # Create/join room with code
├── AvatarSetupModal.jsx      # Avatar style + color picker
├── Wheel.jsx                 # 3-level SVG wheel
├── YourFeelingCard.jsx       # Shows user's placed emotion
├── ParticipantsPanel.jsx     # Slide-out participant list
├── TeamFeelingsTable.jsx     # Table modal after reveal
├── RoomInfoBar.jsx           # Bottom bar with room info
└── hooks/
    └── useFeelingsRoom.js    # Firebase Realtime DB operations
```

## Firebase Data Model

**Realtime Database structure:**

```
feelingsRooms/
  {roomCode}/                    # e.g., "ABC123"
    createdAt: timestamp
    hostId: "user_uid"           # Only host can reveal
    isRevealed: false
    participants/
      {userId}/                  # Firebase Auth UID
        name: "John Doe"         # From Google sign-in
        avatarStyle: "initials"  # or "cat", "dog", etc.
        avatarColor: "#4C6EF5"
        feeling: null            # or { primary, secondary, tertiary }
        feelingPlacedAt: null
        isOnline: true
        joinedAt: timestamp
```

## 3-Level Feelings Wheel Data

```javascript
const FEELINGS_WHEEL = {
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
```

## Wheel Interaction Flow

1. **Initial state** → Show all 7 primary emotions (center ring)
2. **Click primary** → Wheel expands to show secondary emotions for that slice
3. **Click secondary** → Expands to show tertiary emotions
4. **Click tertiary** → Places pin with full path: "Happy → Peaceful → Thankful"

**Data stored per user:**
```javascript
feeling: {
  primary: "Happy",
  secondary: "Peaceful",
  tertiary: "Thankful"
}
```

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back    Feelings Wheel              [👥 3 Participants]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌───────────────┐                        │
│                    │   3-LEVEL     │                        │
│                    │    WHEEL      │                        │
│                    │    (SVG)      │                        │
│                    └───────────────┘                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Your Feeling                                          │  │
│  │ [😊] John Doe • Happy → Peaceful → Thankful    [🗑️]  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│              [ 👁️ Reveal All Feelings ]  (host only)       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Room: ABC123                          2/3 pins placed │  │
│  │ [😊]● [🐱]● [🐕]○                      📋 Copy Code   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Control States

| State | Reveal Button | What User Sees |
|-------|---------------|----------------|
| No pin placed | Disabled | Empty "Your Feeling" card |
| Pin placed, not revealed | Enabled (host) / "Waiting for host" (others) | Own feeling only |
| Revealed | "Hide All" + "Show Table" + "Reset" | All feelings on wheel |

## Modals

### Join/Create Room Modal
- Room code input with "Generate" button
- "Join Room" button
- Shown on first load

### Avatar Setup Modal
- Name auto-filled from Google (read-only display)
- Avatar style grid: Initials, Cat, Dog, Rabbit, Fish, Bird, Mouse, Bug, Octocat
- Color palette: 9 colors
- Live preview of avatar
- "Join Session" button

### Team Feelings Table Modal (after reveal)
- Table columns: Participant, Feeling Path, Timestamp
- Shows full emotion path for each user

## User Flow

```
Launcher → Click "Feelings Wheel"
    ↓
FeelingsWheelApp mounts
    ↓
JoinRoomModal (create or join with code)
    ↓
AvatarSetupModal (name auto-filled, pick style/color)
    ↓
Main Wheel View (drill into wheel to place pin)
    ↓
Wait for host to reveal (or reveal if you're host)
    ↓
See everyone's feelings on wheel + optional table view
```

## Integration Points

### Launcher.jsx Changes
- Remove "Coming Soon" badge
- Remove disabled/opacity styles
- Add `onClick={() => onSelectApp('feelings-wheel')}`

### App.jsx Changes
```jsx
case 'feelings-wheel':
  return <FeelingsWheelApp user={user} onBack={() => setSelectedApp(null)} />;
```

### Firebase Setup
- Enable Realtime Database in Firebase console
- Add security rules for feelingsRooms path

## Hook: useFeelingsRoom.js

**Exposed functions:**
- `createRoom()` - generates 6-char code, sets current user as host
- `joinRoom(code)` - adds user to participants
- `updateAvatar(style, color)` - updates user's avatar
- `placeFeeling(primary, secondary, tertiary)` - sets user's feeling
- `removeFeeling()` - clears user's feeling
- `revealAll()` - only works if current user is host
- `hideAll()` - host only
- `resetAll()` - host only, clears all feelings
- Real-time listener for room state changes
- Presence tracking with `onDisconnect()`

## Color Palette

### Primary Emotion Colors
```css
--happy: #F9E076;
--surprised: #C9A0D6;
--bad: #B8A9C9;
--fearful: #96C9A8;
--angry: #F4A9A0;
--disgusted: #A8A8A8;
--sad: #8BBBD9;
```

### Avatar Colors
```css
--avatar-red: #FF6B6B;
--avatar-orange: #FFA94D;
--avatar-yellow: #FFE066;
--avatar-lime: #A9E34B;
--avatar-green: #51CF66;
--avatar-cyan: #22D3EE;
--avatar-blue: #4C6EF5;
--avatar-purple: #9775FA;
--avatar-pink: #F472B6;
```
