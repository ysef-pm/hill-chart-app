# Tomato Task Garden - Pomodoro Timer Design

**Date:** 2025-11-24
**Status:** Approved

## Overview

**Tomato Task Garden** is a collaborative Pomodoro timer that combines time management with task tracking. Uses a "garden" metaphor where completed tasks grow tomatoes, gamifying productivity.

**Tagline:** "Grow productivity one tomato at a time"

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Timer sync | Hybrid (team + individual) | Flexibility for different work styles |
| Task sharing | Shared task list | Collaboration-focused, simpler model |
| Gamification | Full garden visualization | Delightful, motivating UX |
| Notifications | Configurable per user | Respects different work environments |
| Break handling | Manual start | User controls their rhythm |
| Architecture | Server-authoritative timer | Accurate sync across devices |
| Database | Firebase RTDB | Matches RetroBoard pattern, real-time sync |

---

## User Flow

### Room Creation/Joining

1. User clicks "Pomodoro Timer" in Launcher
2. Modal: "Create Room" or "Join Room"
3. **Create:** Enter room name, pick avatar/color → generates 6-char code
4. **Join:** Enter code, pick avatar/color → joins existing room
5. Main timer view with tasks and garden

### Pomodoro Session

1. User/host sets work/break duration (sliders)
2. Clicks "Start" → timer counts down
3. Timer shows remaining time for all participants
4. When complete: notification (if enabled), pomodoro count increments
5. User clicks "Start Break" when ready
6. Repeat

### Task Management

1. User types task in input field
2. Presses Enter or clicks "+" → task appears in shared list
3. Clicks checkbox when done → task moves to garden
4. Tomato grows in garden visualization

---

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [←] Tomato Task Garden          [ROOM123] 📋    👤👤👤 3 online │
├─────────────────────────────────────────────────────────────────┤
│  [🔄 Team Timer ▾]                                              │
├───────────────────────────────┬─────────────────────────────────┤
│                               │                                 │
│      ┌─────────────┐          │   📝 Task Garden                │
│      │             │          │   ┌─────────────────────────┐   │
│      │   25:00     │          │   │ [ ] Complete API docs   │   │
│      │   ●━━━━━━○  │          │   │ [ ] Review PR #123      │   │
│      │             │          │   │ [✓] Setup Firebase      │   │
│      └─────────────┘          │   └─────────────────────────┘   │
│                               │   [+ Add a new task...]         │
│   [▶ Start]  [↺ Reset]        │                                 │
│                               │   🍅 Completed (3)              │
│   🍅 Work: 25 min  ━━━●━━     │   ┌─────────────────────────┐   │
│   ✓  Break: 5 min  ━●━━━     │   │ 🍅 🍅 🍅                │   │
│                               │   └─────────────────────────┘   │
│   ⚙️ Notifications            │                                 │
│   🔊 Sound      [✓]           │   📊 Today: 3 pomodoros         │
│   🔔 Alerts     [✓]           │                                 │
│                               │                                 │
└───────────────────────────────┴─────────────────────────────────┘
```

**Responsive behavior:**
- Desktop: Two-column layout (timer left, tasks right)
- Mobile: Single column, timer on top, tasks below

---

## Data Model (Firebase Realtime Database)

**Path:** `pomodoroRooms/{roomCode}`

```javascript
{
  // Room metadata
  name: "Sprint Focus Session",
  hostId: "user_uid",
  createdAt: serverTimestamp(),

  // Timer mode: team (synced) or individual (personal timers)
  timerMode: "team" | "individual",

  // Team timer (when timerMode === "team")
  teamTimer: {
    endTime: 1700000000000,      // Timestamp when timer ends
    isPaused: false,
    pausedRemaining: null,       // ms remaining when paused
    type: "work" | "break",
    duration: 1500000            // 25 min in ms
  },

  // Participants
  participants: {
    "user_uid": {
      name: "Alice",
      avatarColor: "#EF4444",
      isOnline: true,
      joinedAt: serverTimestamp(),
      status: "focusing" | "break" | "idle",

      // Personal timer (when timerMode === "individual")
      personalTimer: {
        endTime: 1700000000000,
        isPaused: false,
        pausedRemaining: null,
        type: "work" | "break",
        duration: 1500000
      },

      // User preferences (persisted per-room)
      settings: {
        soundEnabled: true,
        notificationsEnabled: true
      },

      // Daily stats
      stats: {
        pomodorosToday: 3
      }
    }
  },

  // Shared task list
  tasks: {
    "taskId": {
      text: "Complete API integration",
      completed: false,
      completedAt: null,
      authorId: "user_uid",
      authorName: "Alice",
      createdAt: serverTimestamp()
    }
  },

  // Garden stats (room-level)
  garden: {
    totalPomodoros: 12,
    completedTasks: 8,
    lastHarvest: serverTimestamp()
  }
}
```

---

## Firebase Realtime Database Rules

**IMPORTANT:** Add these rules to your existing RTDB rules in Firebase Console.

Go to: Firebase Console → Your Project → Realtime Database → Rules

Merge the following `pomodoroRooms` section with your existing rules:

```json
{
  "rules": {
    "retroRooms": {
      "$roomCode": {
        ".read": "auth != null",
        ".write": "auth != null && (!data.exists() || data.child('participants').child(auth.uid).exists() || newData.child('participants').child(auth.uid).exists())",
        "participants": {
          "$uid": {
            ".write": "auth != null && auth.uid === $uid"
          }
        },
        "items": {
          "$itemId": {
            ".write": "auth != null && root.child('retroRooms').child($roomCode).child('participants').child(auth.uid).exists()"
          }
        },
        "isRevealed": {
          ".write": "auth != null && data.parent().child('hostId').val() === auth.uid"
        }
      }
    },

    "pomodoroRooms": {
      "$roomCode": {
        ".read": "auth != null",
        ".write": "auth != null && (!data.exists() || data.child('participants').child(auth.uid).exists() || newData.child('participants').child(auth.uid).exists())",

        "name": {
          ".validate": "newData.isString() && newData.val().length <= 100"
        },

        "hostId": {
          ".validate": "newData.isString()"
        },

        "timerMode": {
          ".validate": "newData.val() === 'team' || newData.val() === 'individual'"
        },

        "teamTimer": {
          ".write": "auth != null && data.parent().child('hostId').val() === auth.uid",
          ".validate": "newData.hasChildren(['type', 'duration'])"
        },

        "participants": {
          "$uid": {
            ".write": "auth != null && auth.uid === $uid",
            ".validate": "newData.hasChildren(['name', 'avatarColor', 'isOnline'])",

            "personalTimer": {
              ".validate": "!newData.exists() || newData.hasChildren(['type', 'duration'])"
            },

            "settings": {
              ".validate": "!newData.exists() || newData.hasChildren(['soundEnabled', 'notificationsEnabled'])"
            },

            "status": {
              ".validate": "newData.val() === 'focusing' || newData.val() === 'break' || newData.val() === 'idle'"
            }
          }
        },

        "tasks": {
          "$taskId": {
            ".write": "auth != null && root.child('pomodoroRooms').child($roomCode).child('participants').child(auth.uid).exists()",
            ".validate": "newData.hasChildren(['text', 'completed', 'authorId', 'createdAt'])",

            "text": {
              ".validate": "newData.isString() && newData.val().length <= 500"
            },

            "completed": {
              ".validate": "newData.isBoolean()"
            }
          }
        },

        "garden": {
          ".write": "auth != null && root.child('pomodoroRooms').child($roomCode).child('participants').child(auth.uid).exists()",
          ".validate": "newData.hasChildren(['totalPomodoros', 'completedTasks'])"
        }
      }
    }
  }
}
```

**How to deploy:**
1. Go to Firebase Console → Realtime Database → Rules
2. Copy the JSON above
3. Merge with any existing rules (preserve `retroRooms` if present)
4. Click "Publish"

---

## File Structure

```
src/components/PomodoroTimer/
├── index.js                    # Export barrel
├── PomodoroApp.jsx             # Main app container
├── JoinRoomModal.jsx           # Create/Join room (same pattern as RetroBoard)
├── constants.js                # Colors, defaults, room code generator
│
├── hooks/
│   └── usePomodoroRoom.js      # Room state + Firebase sync
│
├── Timer/
│   ├── TimerDisplay.jsx        # Circular progress ring + time display
│   ├── TimerControls.jsx       # Start/Pause/Reset buttons
│   └── DurationSliders.jsx     # Work/Break duration settings
│
├── Tasks/
│   ├── TaskList.jsx            # Shared task list container
│   ├── TaskItem.jsx            # Individual task with checkbox
│   └── AddTaskInput.jsx        # Input field + add button
│
├── Garden/
│   ├── TomatoGarden.jsx        # Main garden visualization
│   ├── TomatoPlant.jsx         # Individual tomato plant/growth stages
│   └── HarvestAnimation.jsx    # Animation when task completes
│
├── Team/
│   ├── ParticipantsBar.jsx     # Show who's in the room + their status
│   ├── TimerModeToggle.jsx     # Switch between team/individual mode
│   └── MemberStatus.jsx        # Individual member's focus status
│
└── Settings/
    └── NotificationSettings.jsx # Sound + browser notification toggles
```

---

## Component Details

### Timer Logic (Server-Authoritative)

**Starting a timer:**
```javascript
const startTimer = async (type = 'work') => {
  const duration = type === 'work' ? workDuration : breakDuration;
  const endTime = Date.now() + duration;

  if (timerMode === 'team' && isHost) {
    await set(ref(rtdb, `pomodoroRooms/${roomCode}/teamTimer`), {
      endTime,
      isPaused: false,
      pausedRemaining: null,
      type,
      duration
    });
  } else {
    await set(ref(rtdb, `pomodoroRooms/${roomCode}/participants/${uid}/personalTimer`), {
      endTime, isPaused: false, pausedRemaining: null, type, duration
    });
    await set(ref(rtdb, `pomodoroRooms/${roomCode}/participants/${uid}/status`),
      type === 'work' ? 'focusing' : 'break');
  }
};
```

**Client-side countdown:**
```javascript
useEffect(() => {
  if (!timer?.endTime || timer?.isPaused) return;

  const interval = setInterval(() => {
    const remaining = timer.endTime - Date.now();
    if (remaining <= 0) {
      handleTimerComplete();
      clearInterval(interval);
    } else {
      setTimeRemaining(remaining);
    }
  }, 100);

  return () => clearInterval(interval);
}, [timer?.endTime, timer?.isPaused]);
```

**Pausing/Resuming:**
```javascript
const pauseTimer = async () => {
  const remaining = timer.endTime - Date.now();
  await update(timerRef, {
    isPaused: true,
    pausedRemaining: remaining,
    endTime: null
  });
};

const resumeTimer = async () => {
  const newEndTime = Date.now() + timer.pausedRemaining;
  await update(timerRef, {
    isPaused: false,
    pausedRemaining: null,
    endTime: newEndTime
  });
};
```

### Garden Visualization

**Growth stages:**
```javascript
const GROWTH_STAGES = [
  { stage: 0, name: 'seed', icon: '🌱' },
  { stage: 1, name: 'sprout', icon: '🌿' },
  { stage: 2, name: 'flower', icon: '🌼' },
  { stage: 3, name: 'green', icon: '🟢' },
  { stage: 4, name: 'ripe', icon: '🍅' },
];
```

Each completed task = one fully grown tomato (🍅) in the garden.
Hover over tomato to see the task name.

### Team Member Status

**Status indicators:**
- 🔴 Red ring = focusing (in work session)
- 🟢 Green ring = on break
- ⚪ Gray ring = idle

### Notifications

**Sound:** Play audio file when timer completes (if enabled)
**Browser:** Use Notification API (requires permission)

```javascript
if (settings.notificationsEnabled && Notification.permission === 'granted') {
  new Notification('Pomodoro Complete!', {
    body: timer.type === 'work' ? 'Time for a break!' : 'Ready to focus?',
    icon: '/tomato-icon.png'
  });
}
```

---

## Implementation Order

1. **Core Room System**
   - `usePomodoroRoom` hook (adapt from `useRetroRoom`)
   - `JoinRoomModal` (reuse RetroBoard pattern)
   - Room creation/joining
   - Presence tracking

2. **Timer MVP**
   - `TimerDisplay` with circular progress
   - `TimerControls` (start/pause/reset)
   - Server-authoritative timer state
   - Team timer mode only (simpler first)

3. **Task System**
   - `TaskList` and `TaskItem`
   - Add/complete/delete tasks
   - Real-time sync

4. **Garden Visualization**
   - `TomatoGarden` component
   - Completed tasks display
   - Harvest animation

5. **Individual Timer Mode**
   - Personal timer per participant
   - Mode toggle (host only)
   - Status indicators

6. **Notifications & Settings**
   - Sound on completion
   - Browser notifications
   - User preference persistence

7. **Polish**
   - Duration sliders
   - Responsive layout
   - Launcher card
   - Empty states

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Browser tab inactive | Timer continues (server time-based) |
| Page refresh | Timer state restored from Firebase |
| Host leaves | Room persists, others can still use individual mode |
| Invalid room code | Show error message |
| Timer drift | Recalculates from server endTime on each render |
| Multiple devices | Same user joins twice = same participant entry |

---

## Future Considerations

- Long break after 4 pomodoros (automatic prompt)
- Statistics dashboard (daily/weekly charts)
- Keyboard shortcuts (Space to start/pause)
- Dark mode
- PWA/mobile support
- Team leaderboard
