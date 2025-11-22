# Retro Board & Habit Tracker Design

**Date:** 2025-11-22
**Status:** Approved

## Overview

Two new tools for the dev communication suite:
1. **Retro Board** - Team retrospective with 4 sections, room-based collaboration
2. **Habit Tracker** - Persistent team habits with daily check-offs

These tools integrate: action items from retros can be exported as trackable habits.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Flow type | Async (all sections open) | People add items at their own pace |
| Visibility | Hidden until reveal | Prevents groupthink, honest feedback |
| Visual style | Simple themed | Themed headers/icons, clean post-it layout |
| Architecture | Two separate tools | Simpler, more modular |
| Database | Hybrid | RTDB for retro rooms, Firestore for habits |
| Habit scope | Personal + team view | Individual accountability with team visibility |

---

## Retro Board

### User Flow

1. User clicks "Retro Board" in Launcher
2. Modal: "Create Room" or "Join Room"
3. **Create:** Enter retro name, pick avatar → generates 6-char code
4. **Join:** Enter code, pick avatar → joins existing room
5. Main board with 4 columns, add items to any section
6. Before reveal: Only see YOUR items (placeholders show "X items hidden")
7. Host clicks "Reveal" → all items visible with author names

### Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│ [←] Sprint 23 Retro          Room: ABC123  [👥] [Reveal]│
├─────────────┬─────────────┬─────────────┬───────────────┤
│ 🍎 Sweet    │ ⭐ Awesome  │ 🏴‍☠️ Pirates  │ 🍾 Message   │
│ Fruits      │ Peeps       │ on Shore    │ in Bottle    │
│ What went   │ Shoutouts   │ What could  │ Action       │
│ well?       │             │ improve?    │ points       │
│             │             │             │               │
│ [+ Add]     │ [+ Add]     │ [+ Add]     │ [+ Add]      │
│             │             │             │               │
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │ ┌───────────┐│
│ │ Note    │ │ │ @Name   │ │ │ Note    │ │ │ Action    ││
│ │ - Author│ │ │ for X   │ │ │ - Author│ │ │ [→ Habit] ││
│ └─────────┘ │ └─────────┘ │ └─────────┘ │ └───────────┘│
└─────────────┴─────────────┴─────────────┴───────────────┘
```

### Data Model (Realtime Database)

**Path:** `retroRooms/{roomCode}`

```javascript
{
  name: "Sprint 23 Retro",
  createdAt: timestamp,
  hostId: "uid123",
  isRevealed: false,

  participants: {
    "uid123": {
      name: "Alex",
      avatarStyle: "cat",
      avatarColor: "#4CAF50",
      isOnline: true,
      joinedAt: timestamp
    }
  },

  items: {
    "itemId1": {
      section: "sweet-fruits",  // | "awesome-peeps" | "pirates" | "bottle"
      text: "Great team collaboration on the API refactor",
      authorId: "uid123",
      authorName: "Alex",
      createdAt: timestamp,
      shoutoutTo: null,         // Only for "awesome-peeps"
    }
  }
}
```

### Sections

| Section | Key | Icon | Purpose | Special Fields |
|---------|-----|------|---------|----------------|
| Sweet Fruits | `sweet-fruits` | 🍎 | What went well | - |
| Awesome Peeps | `awesome-peeps` | ⭐ | Teammate shoutouts | `shoutoutTo: string` |
| Pirates on Shore | `pirates` | 🏴‍☠️ | What could improve | - |
| Message in Bottle | `bottle` | 🍾 | Action points | "→ Habit" export button |

---

## Habit Tracker

### User Flow

1. User clicks "Habit Tracker" in Launcher
2. If no team: "Create Team" → enter name → generates team ID
3. If has team: Goes straight to tracker
4. View habits grid with days of week
5. Check off habits daily
6. Toggle between "My View" and "Team View"

### Screen Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ [←] Team Habits                    [Team: Grub Squad] [+ Habit]  │
├──────────────────────────────────────────────────────────────────┤
│                    │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │   │
├──────────────────────────────────────────────────────────────────┤
│ 📋 Post standup    │ ✓  │ ✓  │  ○  │  ○  │  ○  │  -  │  -  │   │
│    by 10:30am      │ You │ You │     │     │     │     │     │   │
├──────────────────────────────────────────────────────────────────┤
│ 🔍 Review PRs      │ ✓  │  ○  │ ✓  │  ○  │  ○  │  -  │  -  │   │
│    same day        │Alex │     │Sarah│     │     │     │     │   │
└──────────────────────────────────────────────────────────────────┘
         [My View]  [Team View]
```

### Views

- **My View:** Only YOUR checkmarks, clean personal accountability
- **Team View:** Shows who checked what (names under checkmarks)

### Data Model (Firestore)

**Team document:** `teams/{teamId}`

```javascript
{
  name: "Grub Squad",
  createdAt: timestamp,
  createdBy: "uid123",
  memberIds: ["uid123", "uid456", "uid789"],
}
```

**Habits subcollection:** `teams/{teamId}/habits/{habitId}`

```javascript
{
  text: "Post standup by 10:30am",
  emoji: "📋",
  createdAt: timestamp,
  createdBy: "uid123",
  sourceRetro: "ABC123",      // Optional - links to retro room
  activeDays: [1,2,3,4,5],    // Mon-Fri (0=Sun, 6=Sat)
  isArchived: false,
}
```

**Checks subcollection:** `teams/{teamId}/habits/{habitId}/checks/{checkId}`

```javascript
{
  date: "2025-11-22",         // ISO date string
  checkedBy: "uid123",
  checkedByName: "Alex",
  checkedAt: timestamp,
}
```

**User profile:** `users/{uid}`

```javascript
{
  teamId: "teamId123",
  displayName: "Alex",
}
```

---

## Integration: Retro → Habit Export

### Flow

1. After reveal, "Message in Bottle" items show "→ Habit" button
2. Click opens confirmation modal with:
   - Pre-filled text from action item
   - Emoji picker
   - Day selection (defaults to Mon-Fri)
   - Team selector (or create team prompt)
3. On create:
   - Writes to Firestore `teams/{teamId}/habits`
   - Sets `sourceRetro: roomCode`
   - Shows success toast with link to Habit Tracker

### Edge Cases

- **No team:** Prompt to create/join team first
- **Duplicate text:** Warn but allow (different context)
- **Retro deleted:** Habit persists (orphaned sourceRetro is fine)

---

## File Structure

```
src/components/
├── RetroBoard/
│   ├── index.js
│   ├── RetroBoardApp.jsx       # Main orchestrator
│   ├── JoinRoomModal.jsx       # Create/join room
│   ├── RetroColumn.jsx         # Single column component
│   ├── RetroItem.jsx           # Single post-it note
│   ├── AddItemModal.jsx        # Add item form
│   ├── ExportHabitModal.jsx    # Export to habit tracker
│   ├── ParticipantsPanel.jsx   # Slide-out panel
│   ├── constants.js            # Section definitions
│   └── hooks/
│       └── useRetroRoom.js     # Room logic (adapted from FeelingsWheel)
│
├── HabitTracker/
│   ├── index.js
│   ├── HabitTrackerApp.jsx     # Main orchestrator
│   ├── TeamSetupModal.jsx      # Create/join team
│   ├── HabitRow.jsx            # Single habit row
│   ├── AddHabitModal.jsx       # Add habit form
│   ├── WeekHeader.jsx          # Days of week header
│   ├── constants.js            # Day definitions, emojis
│   └── hooks/
│       └── useTeamHabits.js    # Firestore logic
```

---

## Implementation Order

1. **Retro Board (MVP)**
   - Room creation/joining (adapt useFeelingsRoom)
   - 4-column layout
   - Add items to sections
   - Reveal mechanism
   - Participants panel

2. **Habit Tracker (MVP)**
   - Team creation
   - Add habits
   - Week grid display
   - Check off habits
   - My View / Team View toggle

3. **Integration**
   - Export action items to habits
   - Source retro link

4. **Polish**
   - Launcher cards
   - Empty states
   - Loading states
   - Error handling
