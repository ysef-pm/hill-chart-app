# Feelings Wheel App - Technical Specification

## Overview

**Name:** Feelings Mapify
**Purpose:** A collaborative retro tool that allows team members to express their emotions during retrospectives by placing pins on a feelings wheel.
**Tagline:** "Place your pin on the feelings wheel to show how you're feeling during the retro."

## User Flow

### 1. Room Creation/Joining

```
Landing Page → Join a Room Modal
```

**Join a Room Modal:**
- **Room Code Input:** Text field with placeholder "Enter room code (e.g. ABC123)"
- **Generate Button:** Creates a random 6-character alphanumeric room code
- **Join Room Button:** Joins the room with the entered/generated code
- **Helper text:** "Share this code with your team members so they can join the same room."

### 2. User Setup (Join the Feelings Room Modal)

After joining a room, users must set up their profile:

**Fields:**
- **Your Name:** Text input (displayed to other participants)
- **Avatar Style:** Selection grid with options:
  - Initials (default, shows first letters of name)
  - Cat, Dog, Rabbit, Fish, Bird, Mouse, Bug, Octocat (emoji icons)
- **Avatar Color:** Color palette with 9 options:
  - Red (#FF6B6B), Orange (#FFA94D), Yellow (#FFE066)
  - Lime (#A9E34B), Green (#51CF66), Cyan (#22D3EE)
  - Blue (#4C6EF5), Purple (#9775FA), Pink (#F472B6)

**Submit:** "Join Room" button

### 3. Main Feelings Wheel View

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  Feelings Mapify                    [Participants]│
│  Place your pin on the feelings wheel...          │
│                                                   │
│              ┌─────────────────┐                  │
│              │                 │                  │
│              │   ┌─────────┐   │                  │
│              │   │ WHEEL   │   │                  │
│              │   │ (SVG)   │   │                  │
│              │   └─────────┘   │                  │
│              │                 │                  │
│              └─────────────────┘                  │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │ Your Emotions                               │  │
│  │ [Avatar] Name - Emotion    [Delete]         │  │
│  │ Hover over emotions to explore...           │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│            [ Reveal All Feelings ]                │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │ Room: XXXXXX               X pins placed    │  │
│  │ [Avatar] User 1 ●  [Avatar] User 2 ●        │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│           Feelings Mapify • Retro Tool            │
└──────────────────────────────────────────────────┘
```

## Feelings Wheel Component

### Structure

The wheel is an SVG-based circular visualization with:

**6 Primary Emotion Segments:**
| Position | Emotion | Color | Hex Code |
|----------|---------|-------|----------|
| Top-right | Happy | Yellow | #FFDE7D |
| Right | Sad | Light Blue | #9ADCFF |
| Bottom-right | Peaceful | Mint Green | #B8E0D2 |
| Bottom-left | Angry | Coral/Pink | #FF9B9B |
| Left | Fearful | Purple | #D8B9FF |
| Top-left | Surprised | Orange | #FFC46B |

**Sub-emotions (when segment is clicked/expanded):**
- Each primary emotion expands to show 6-8 secondary emotions
- Secondary emotions use lighter shades of the primary color
- Example: Happy expands to show sub-emotions in #FFE991 and #FFF49D

### Interaction Behavior

1. **Hover:** Shows emotion label (e.g., "Surprised") on the segment
2. **Click on Primary:**
   - Selects that emotion
   - Places a pin for the user
   - Shows toast: "You're feeling [Emotion]!"
   - Updates "Your Emotions" section
3. **Wheel Expansion:** Clicking expands the segment to show sub-emotions
4. **Pin Placement:** Only one pin per user allowed

## UI Components

### Header
- **Title:** "Feelings Mapify" (bold, dark)
- **Subtitle:** "Place your pin on the feelings wheel to show how you're feeling during the retro."
- **Participants Button:** Shows count (e.g., "1 Participant")

### Your Emotions Section
**Card containing:**
- Title: "Your Emotions"
- Placed emotion chip: [Avatar] Name - Emotion [Delete button]
- Helper text: "Hover over emotions to explore, click to select a primary emotion"
- Delete button (trash icon) to remove your pin

### Room Info Bar
**Bottom card showing:**
- Room code: "Room: XXXXXX"
- Pin count: "X pins placed"
- Participant avatars with online indicators (green dot)

### Control Buttons

**Before Reveal:**
- `Reveal All Feelings` - Primary button (disabled until at least 1 pin placed)

**After Reveal:**
- `Hide All Feelings` - Toggle to hide
- `Show Table` / `Hide Table` - Toggle table view
- `Reset All` - Clear all pins and start fresh

### Participants Panel (Slide-out)
**Triggered by clicking "X Participants" button:**
- Header: "Room: XXXXXX"
- Participant count: "Participants: X"
- Your info: "[Avatar] Your Name (You)" with "Edit Avatar" button
- Divider: "All Participants"
- List of participants with status: "[Avatar] Name - Placed pin" or "Waiting..."
- Close button (X)

### Team Feelings Table Modal
**Triggered by "Show Table" button:**
- Header: "Team Feelings" with close (X) button
- Table columns:
  | Participant | Emotion | Category | Timestamp |
  |-------------|---------|----------|-----------|
  | [Avatar] Name | [Color dot] Emotion | Primary/Secondary | Nov 22, 03:03 PM |
- Footer: "Feelings mapped for room XXXXXX"

## Toast Notifications

**Success toasts (appear top-center):**
- "Created and joined new room: XXXXXX"
- "Welcome, [Name]!"
- "You're feeling [Emotion]!"
- "All feelings have been revealed"

## State Management

### Room State
```typescript
interface Room {
  code: string;           // 6-char alphanumeric
  participants: Participant[];
  isRevealed: boolean;
  createdAt: Date;
}
```

### Participant State
```typescript
interface Participant {
  id: string;
  name: string;
  avatar: {
    style: 'initials' | 'cat' | 'dog' | 'rabbit' | 'fish' | 'bird' | 'mouse' | 'bug' | 'octocat';
    color: string;        // Hex color
  };
  emotion?: {
    primary: string;      // e.g., "Sad"
    secondary?: string;   // Optional sub-emotion
    placedAt: Date;
  };
  isOnline: boolean;
}
```

### UI State
```typescript
interface UIState {
  isRevealed: boolean;
  isTableVisible: boolean;
  isParticipantsPanelOpen: boolean;
  hoveredEmotion: string | null;
  expandedSegment: string | null;
}
```

## Technical Implementation Notes

### SVG Wheel
- Wheel is ~500x500px SVG
- Segments are `<path>` elements with fill colors
- Positioned in center of a large circular white container (~600px)
- Uses polar coordinates for segment positioning

### Real-time Sync
- Room state should sync in real-time (WebSocket or polling)
- Participants see each other's online status
- Pin placements visible to all after reveal

### Responsive Considerations
- Wheel scales within container
- Mobile: Consider touch-friendly segment sizes
- Participants panel: Full-screen on mobile

## Color Palette

### Primary Colors
```css
--happy: #FFDE7D;
--sad: #9ADCFF;
--peaceful: #B8E0D2;
--angry: #FF9B9B;
--fearful: #D8B9FF;
--surprised: #FFC46B;
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

### UI Colors
```css
--background: #F1F5F9;      /* Light blue-gray */
--card-bg: #FFFFFF;
--text-primary: #1E293B;
--text-secondary: #64748B;
--primary-button: #475569;
--primary-button-disabled: #94A3B8;
```

## Accessibility

- Wheel segments should have ARIA labels for screen readers
- Color + text labels for emotions (not color alone)
- Keyboard navigation for segment selection
- Focus indicators on interactive elements

## Future Considerations

1. **Export functionality:** Export team feelings as image/PDF
2. **Historical view:** View past retro feelings
3. **Anonymous mode:** Hide names until reveal
4. **Reactions:** Let users react to others' emotions
5. **Facilitator controls:** Special permissions for retro lead

---

## Integration with Dev Com Tools Codebase

### File Structure

Create the following files to integrate with the existing codebase:

```
src/
├── components/
│   ├── Launcher.jsx           # UPDATE: Enable feelings wheel button
│   ├── FeelingsWheel/
│   │   ├── FeelingsWheelApp.jsx    # Main container component
│   │   ├── Wheel.jsx               # SVG wheel visualization
│   │   ├── RoomJoinModal.jsx       # Initial room code modal
│   │   ├── UserSetupModal.jsx      # Name/avatar setup modal
│   │   ├── YourEmotions.jsx        # User's placed emotions card
│   │   ├── ParticipantsPanel.jsx   # Side panel for participants
│   │   ├── TeamFeelingsTable.jsx   # Table modal component
│   │   ├── RoomInfoBar.jsx         # Bottom room info bar
│   │   └── Avatar.jsx              # Reusable avatar component
│   └── ...
├── firebase.js                # Firebase config (already exists)
└── App.jsx                    # UPDATE: Add feelings-wheel route
```

### Launcher Integration

Update `src/components/Launcher.jsx`:
- Change the Feelings Wheel card from disabled placeholder to active button
- Add `onClick={() => onSelectApp('feelings-wheel')}` handler
- Remove "Coming Soon" badge and opacity styles

### App.jsx Integration

Add case in the app selection switch:
```jsx
case 'feelings-wheel':
  return <FeelingsWheelApp user={user} onBack={() => setSelectedApp(null)} />;
```

### Firebase Collections

Create the following Firestore collections:

```
feelingsRooms/
  {roomCode}/
    createdAt: Timestamp
    isRevealed: boolean
    participants/
      {participantId}/
        name: string
        avatarStyle: string
        avatarColor: string
        emotion: string | null
        placedAt: Timestamp | null
        isOnline: boolean
        joinedAt: Timestamp
```

### Authentication Integration

- Use existing Firebase auth from `src/firebase.js`
- User's `uid` becomes participant ID
- `displayName` can pre-fill the name field

### Styling Approach

Follow existing patterns:
- Use Tailwind CSS classes (already configured)
- Match slate color scheme from `Launcher.jsx`
- Use rounded corners (`rounded-2xl`, `rounded-xl`)
- Shadow styles: `shadow-sm`, `hover:shadow-xl`

### Dependencies to Add

```bash
npm install lucide-react  # Already in project - use for icons
```

No additional dependencies required - leverage existing:
- React (UI)
- Firebase/Firestore (real-time sync)
- Tailwind CSS (styling)
- lucide-react (icons)
