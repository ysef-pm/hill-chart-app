# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server at http://localhost:5173

# Build & Preview
npm run build        # Production build to dist/
npm run preview      # Preview production build locally

# Linting
npm run lint         # Run ESLint
```

## Architecture

React + Vite application using Firebase for authentication and real-time data, with Tailwind CSS for styling.

### App Flow
```
App.jsx (auth router)
├── Login.jsx        # Google OAuth login screen
├── Launcher.jsx     # Tool selection dashboard (post-login)
└── HillChartApp.jsx # Main hill chart application
```

### Firebase Integration (`src/firebase.js`)
- **Auth**: Google OAuth via `signInWithPopup`
- **Firestore**: Real-time sync using `onSnapshot` for pins
- **Data path**: `artifacts/hill-chart-app/public/data/pins`

### Key Components in HillChartApp.jsx
- **HillChart**: SVG-based interactive hill visualization. Pins positioned on sine curve (`Math.sin`). Left half (x < 50) = "Figuring it out", right half = "Getting it done"
- **PinModal**: Form for adding status updates with project name, author, emoji sentiment, and status text
- **ReportModal**: AI-generated project status reports via Gemini API

### AI Integration
Uses Google Gemini API (`gemini-2.0-flash-exp`) for:
- Suggesting next steps based on current status and hill position
- Generating comprehensive project status reports

### Environment Variables (VITE_ prefix required)
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_GEMINI_API_KEY
```

## Code Patterns

- Components use functional React with hooks
- Tailwind CSS for all styling (no separate CSS files except index.css for Tailwind imports)
- Icons from lucide-react
- Screenshot export uses html2canvas
- ESLint configured to allow unused variables starting with uppercase or underscore
