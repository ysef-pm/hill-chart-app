# Kudos Board Design

**Date:** 2025-11-27
**Status:** Approved

## Overview

A team recognition tool for async appreciation and celebration moments. Features a "Wall + Spotlight" architecture with a scrolling wall of kudos cards and a hero spotlight section for celebrations.

## Key Decisions

| Aspect | Decision |
|--------|----------|
| Use case | Async appreciation + celebration moments |
| Format | Prompted categories (pick type, add details) |
| Visibility | Public wall (immediate, full transparency) |
| Teams | Persistent (create once, history persists over time) |
| Celebrations | Special occasion posts with fanfare (confetti, spotlight) |
| Architecture | Wall + Spotlight (visual hierarchy) |

## Layout & Visual Design

### Header Zone
- Team name + member avatars
- "Give Kudos" button (primary action)
- "Add Celebration" button (secondary, more prominent styling)

### Spotlight Section (top)
- Hero cards for active celebrations (last 7 days)
- Larger format with confetti animation on first view
- Shows: title, description, who posted, emoji reactions, date
- Horizontally scrollable if multiple active celebrations
- Hidden when no active celebrations

### Wall Section (below)
- Vertical masonry/card grid of kudos
- Each card shows: category badge, recipient, message, from, reactions, timestamp
- Color-coded by category
- Infinite scroll with newest first

### Empty State
- Friendly illustration
- "No kudos yet! Be the first to appreciate a teammate."

## Kudos Categories

| Category | Icon | Color | Use for |
|----------|------|-------|---------|
| Helped Me | 🙌 | Blue | When someone unblocked you or assisted |
| Shipped It | 🚀 | Green | Celebrating a launch or completion |
| Great Idea | 💡 | Purple | Recognizing creative thinking |
| Went Above | 🎯 | Orange | Extra effort beyond expectations |
| Team Player | 🤝 | Teal | Collaboration and support |

## User Flows

### Give Kudos Flow
1. Click "Give Kudos" → Modal opens
2. Select recipient(s) from team members (multi-select)
3. Pick a category from the 5 options
4. Write your message (required, 10-280 chars)
5. Preview card → Submit
6. Kudos appears on wall with subtle animation

### Celebration Flow
1. Click "Add Celebration" → Different modal
2. Add a title (e.g., "v2.0 Launch! 🎉")
3. Write description (longer text allowed)
4. Tag related people (optional)
5. Submit → Appears in Spotlight with confetti burst
6. Celebrations auto-archive from spotlight after 7 days (still visible in wall)

### Team Setup Flow
- **Create team**: Pick name → get invite code (e.g., `KUDOS-XYZ789`)
- **Join team**: Enter invite code → added as member
- **Leave team**: Self-service, keeps kudos history
- **Admin powers**: Can regenerate invite code, remove members

## Data Model (Firebase)

```
artifacts/kudos-board/teams/{teamId}/
  ├── info/
  │   ├── name: "Grub Squad"
  │   ├── createdAt: timestamp
  │   ├── createdBy: {uid, displayName}
  │   └── inviteCode: "KUDOS-ABC123"
  │
  ├── members/{uid}/
  │   ├── displayName: "Youssef"
  │   ├── photoURL: "..."
  │   ├── joinedAt: timestamp
  │   └── role: "admin" | "member"
  │
  ├── kudos/{kudoId}/
  │   ├── type: "kudos" | "celebration"
  │   ├── category: "helped" | "shipped" | "idea" | "above" | "team"
  │   ├── title: null | "v2.0 Launch!" (celebrations only)
  │   ├── message: "Thanks for helping debug..."
  │   ├── recipients: [{uid, displayName}]
  │   ├── from: {uid, displayName}
  │   ├── reactions: {emoji: [uid, uid, ...]}
  │   ├── createdAt: timestamp
  │   └── spotlightUntil: null | timestamp (celebrations)
```

## Reactions

Quick emoji responses (fixed set, one-tap to toggle):
- 👏 🎉 ❤️ 🔥
- Shows count + who reacted on hover

## Component Structure

```
KudosBoardApp.jsx
├── TeamHeader.jsx          (team name, avatars, action buttons)
├── SpotlightSection.jsx    (celebration cards carousel)
├── KudosWall.jsx           (masonry grid of kudos)
│   └── KudosCard.jsx       (individual kudo with reactions)
├── GiveKudosModal.jsx      (category picker, recipient, message)
├── AddCelebrationModal.jsx (title, description, tags)
└── TeamSetupModal.jsx      (create/join team flow)
```

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No celebrations active | Spotlight section hidden, wall takes full space |
| User not in a team yet | Show TeamSetupModal (create or join) |
| Give kudos to yourself | Blocked - "You can't give kudos to yourself" |
| Empty wall | Friendly empty state with CTA |
| Long message | Truncate with "Show more" on card |
| Member leaves team | Their kudos remain, name shows "(left team)" |

## Future Enhancements (out of scope)

- Weekly email digest of kudos received
- Export kudos for performance reviews
- Slack/Teams notifications

## Implementation Notes

- Follows existing patterns from Habit Tracker (persistent teams)
- Uses same Firebase project and auth
- Firestore rules need to be updated (merge with existing rules file)
