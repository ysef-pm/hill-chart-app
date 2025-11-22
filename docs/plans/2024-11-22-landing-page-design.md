# Dev Com Tools - Landing Page Design & Implementation Plan

**Date:** 2024-11-22
**Status:** Ready for Implementation
**Reference:** Inspired by [EasyRetro.io](https://easyretro.io/)

---

## Overview

Create a marketing landing page for Dev Com Tools - a suite of communication tools for Product Managers to better communicate with their development teams.

### Key Details

| Attribute | Value |
|-----------|-------|
| **Product Name** | Dev Com Tools |
| **Tagline** | "Communicate Well With Your Devs" |
| **Target Audience** | Product Managers |
| **Brand Tone** | Fun & friendly (like EasyRetro, Slack) |
| **Pricing** | No pricing page yet - "Get Started Free" CTA |

### Tools in the Suite (4 total)

| Tool | Icon | Color | Description |
|------|------|-------|-------------|
| Hill Chart | 📈 | Blue | Track project progress from uncertainty to execution |
| Feelings Wheel | 😊 | Purple | Share how your team is feeling in standups |
| Retro Board | 📋 | Green | Run fun sprint retrospectives together |
| Habit Tracker | ✅ | Orange/Amber | Build good habits as a team |

---

## Architecture

### Routing Structure

```
/ (root)           → Landing.jsx (public)
/features          → Features.jsx (public, future)
/about             → About.jsx (public, future)
/pricing           → Pricing.jsx (public, future)
/login             → Login.jsx (public)
/app               → Launcher.jsx (authenticated)
/app/hill-chart    → HillChartApp.jsx (authenticated)
/app/feelings      → FeelingsWheelApp.jsx (authenticated)
/app/retro         → RetroBoardApp.jsx (authenticated)
/app/habits        → HabitTrackerApp.jsx (authenticated)
```

### File Structure

```
src/
├── App.jsx                      # Main router (update for new routes)
├── pages/
│   └── Landing.jsx              # Main marketing landing page
├── components/
│   ├── landing/
│   │   ├── Header.jsx           # Sticky nav: logo, links, Login/Register
│   │   ├── Hero.jsx             # Headline + CTA + illustration area
│   │   ├── TrustLogos.jsx       # "Trusted by teams everywhere"
│   │   ├── ToolsShowcase.jsx    # 4 tool cards with descriptions
│   │   ├── HowItWorks.jsx       # 3-step getting started
│   │   ├── Testimonials.jsx     # PM quotes (placeholder)
│   │   ├── CTABanner.jsx        # Blue gradient final CTA
│   │   └── Footer.jsx           # Links, copyright
│   ├── HillChartApp.jsx         # Existing
│   ├── FeelingsWheel/           # Existing
│   ├── RetroBoard/              # Existing
│   ├── HabitTracker/            # Existing (or to be added)
│   ├── Launcher.jsx             # Existing (update to add all 4 tools)
│   └── Login.jsx                # Existing
```

---

## Section Specifications

### 1. Header (Header.jsx)

**Behavior:** Sticky on scroll, white background with subtle shadow

**Layout:**
```
[Logo] Dev Com Tools    Features  About  Pricing    [Login] [Get Started Free]
```

**Specifications:**
- Logo: Text "Dev Com Tools" with small grid/tools icon
- Nav links: Features, About, Pricing (can be placeholder hrefs initially)
- Login: Text link, slate color
- Get Started: Blue filled button (`bg-blue-600 hover:bg-blue-700`)
- Mobile: Hamburger menu with slide-out drawer

**Tailwind classes reference:**
```jsx
// Container
"fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50"

// Nav link
"text-slate-600 hover:text-slate-900 font-medium"

// CTA button
"bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold"
```

---

### 2. Hero Section (Hero.jsx)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Communicate Well                   ┌─────────────────┐    │
│   With Your Devs 💬                  │                 │    │
│                                      │  [Illustration] │    │
│   Simple tools for product managers  │  Team around    │    │
│   to track progress, build good      │  a hill chart   │    │
│   habits, and keep your dev team     │  with emojis    │    │
│   connected.                         │                 │    │
│                                      └─────────────────┘    │
│   [Get Started for Free]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Content:**
- **Headline:** "Communicate Well With Your Devs 💬"
- **Subheadline:** "Simple tools for product managers to track progress, build good habits, and keep your dev team connected."
- **CTA Button:** "Get Started for Free" → links to /login or /register
- **Illustration:** Right side (can use placeholder SVG or illustration)

**Tailwind classes reference:**
```jsx
// Section
"min-h-[80vh] flex items-center bg-slate-50 pt-20"

// Headline
"text-5xl md:text-6xl font-bold text-slate-900 leading-tight"

// Subheadline
"text-xl text-slate-600 mt-6 max-w-lg"

// CTA
"mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
```

---

### 3. Trust Logos Section (TrustLogos.jsx)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│           Trusted by development teams everywhere           │
│                                                             │
│     [Logo]    [Logo]    [Logo]    [Logo]    [Logo]         │
└─────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Gray background (`bg-slate-100`)
- Logos in grayscale, opacity 50-70%
- Can use placeholder generic company icons initially
- Or skip this section entirely until real logos available

---

### 4. Tools Showcase Section (ToolsShowcase.jsx)

**Layout:**
```
┌───────────────────────────────────────────────────────────────────┐
│                       What's Inside?                              │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  📈      │  │  😊      │  │  📋      │  │  ✅      │          │
│  │  Hill    │  │  Feelings│  │  Retro   │  │  Habit   │          │
│  │  Chart   │  │  Wheel   │  │  Board   │  │  Tracker │          │
│  │          │  │          │  │          │  │          │          │
│  │ Track    │  │ Share    │  │ Run fun  │  │ Build    │          │
│  │ project  │  │ how your │  │ sprint   │  │ good     │          │
│  │ progress │  │ team is  │  │ retros   │  │ habits   │          │
│  │ visually │  │ feeling  │  │ together │  │ as a team│          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Tool Card Data:**
```javascript
const tools = [
  {
    id: 'hill-chart',
    name: 'Hill Chart',
    icon: 'TrendingUp', // from lucide-react
    color: 'blue',
    description: 'Track project progress from uncertainty to execution with visual hill charts.',
  },
  {
    id: 'feelings-wheel',
    name: 'Feelings Wheel',
    icon: 'Smile', // from lucide-react
    color: 'purple',
    description: 'Share how your team is feeling during standups and retrospectives.',
  },
  {
    id: 'retro-board',
    name: 'Retro Board',
    icon: 'ClipboardList', // from lucide-react
    color: 'green',
    description: 'Run fun and productive sprint retrospectives with your team.',
  },
  {
    id: 'habit-tracker',
    name: 'Habit Tracker',
    icon: 'CheckSquare', // from lucide-react
    color: 'amber',
    description: 'Build good habits as a team and track your progress together.',
  },
];
```

**Card styling:**
```jsx
// Card container
"bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-{color}-200 transition-all"

// Icon container (varies by color)
"w-14 h-14 bg-{color}-100 text-{color}-600 rounded-xl flex items-center justify-center mb-4"

// Title
"text-xl font-bold text-slate-900 mb-2"

// Description
"text-slate-500 text-sm leading-relaxed"
```

---

### 5. How It Works Section (HowItWorks.jsx)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                      How It Works                           │
│                                                             │
│      ①                   ②                   ③             │
│   Sign up free       Pick a tool        Share with         │
│                                          your team          │
│   Create your        Choose from        Invite your devs   │
│   account in         Hill Chart,        and start          │
│   seconds with       Feelings Wheel,    improving          │
│   Google login       Retro Board, or    communication      │
│                      Habit Tracker      today              │
└─────────────────────────────────────────────────────────────┘
```

**Steps data:**
```javascript
const steps = [
  {
    number: '1',
    title: 'Sign up free',
    description: 'Create your account in seconds with Google login.',
  },
  {
    number: '2',
    title: 'Pick a tool',
    description: 'Choose from Hill Chart, Feelings Wheel, Retro Board, or Habit Tracker.',
  },
  {
    number: '3',
    title: 'Share with your team',
    description: 'Invite your devs and start improving communication today.',
  },
];
```

---

### 6. Testimonials Section (Testimonials.jsx)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                   What PMs Are Saying                       │
│                                                             │
│  ┌───────────────────┐  ┌───────────────────┐              │
│  │ "Finally a tool   │  │ "The Feelings     │              │
│  │  that helps me    │  │  Wheel changed    │              │
│  │  understand where │  │  our standups     │              │
│  │  projects really  │  │  completely."     │              │
│  │  stand."          │  │                   │              │
│  │                   │  │  — Sarah K.       │              │
│  │  — Mike T.        │  │    PM @ TechCo    │              │
│  │    Product Lead   │  │                   │              │
│  └───────────────────┘  └───────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

**Note:** Use placeholder testimonials initially. Can be updated with real quotes later.

---

### 7. CTA Banner Section (CTABanner.jsx)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░ BLUE GRADIENT BACKGROUND ░░░░░░░░░░░░░░░ │
│                                                             │
│       Ready to communicate better with your devs?           │
│                                                             │
│                  [Get Started for Free]                     │
│                                                             │
│            No credit card required • Free forever           │
└─────────────────────────────────────────────────────────────┘
```

**Styling:**
```jsx
// Section
"bg-gradient-to-r from-blue-600 to-blue-700 py-20 text-center"

// Headline
"text-3xl md:text-4xl font-bold text-white mb-8"

// Button (white on blue)
"bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 rounded-full text-lg font-semibold shadow-lg"

// Subtext
"text-blue-100 mt-6 text-sm"
```

---

### 8. Footer Section (Footer.jsx)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Dev Com Tools                                       │
│                                                             │
│  Tools              Resources         Legal                 │
│  • Hill Chart       • Blog            • Privacy Policy      │
│  • Feelings Wheel   • Help Center     • Terms of Service    │
│  • Retro Board      • Contact                               │
│  • Habit Tracker                                            │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  © 2024 Dev Com Tools. Made with 💙 for PMs everywhere.    │
└─────────────────────────────────────────────────────────────┘
```

**Styling:**
```jsx
// Container
"bg-slate-900 text-slate-300 py-16"

// Column header
"text-white font-semibold mb-4"

// Links
"text-slate-400 hover:text-white transition-colors"

// Copyright
"text-slate-500 text-sm"
```

---

## Implementation Tasks

### Phase 1: Setup & Structure

1. **Install React Router** (if not already installed)
   ```bash
   npm install react-router-dom
   ```

2. **Create file structure**
   - Create `src/pages/` directory
   - Create `src/components/landing/` directory

3. **Update App.jsx** with React Router
   - Public routes: `/`, `/login`
   - Protected routes: `/app/*`

### Phase 2: Landing Page Components

4. **Create Header.jsx**
   - Sticky navigation
   - Mobile hamburger menu
   - Login/Register buttons

5. **Create Hero.jsx**
   - Two-column layout (text left, illustration right)
   - Main CTA button

6. **Create TrustLogos.jsx** (optional initially)
   - Placeholder logos or skip

7. **Create ToolsShowcase.jsx**
   - 4-column grid of tool cards
   - Responsive (2 cols on tablet, 1 on mobile)

8. **Create HowItWorks.jsx**
   - 3-step horizontal layout
   - Numbers with descriptions

9. **Create Testimonials.jsx**
   - 2-column testimonial cards
   - Placeholder quotes

10. **Create CTABanner.jsx**
    - Blue gradient background
    - Final CTA button

11. **Create Footer.jsx**
    - Multi-column links
    - Copyright

### Phase 3: Assembly & Integration

12. **Create Landing.jsx**
    - Compose all landing components
    - Proper section spacing

13. **Update Launcher.jsx**
    - Add Habit Tracker card (if not present)
    - Ensure all 4 tools are shown

14. **Test routing**
    - Unauthenticated → Landing page
    - Login → Redirect to /app
    - /app → Launcher with tools

### Phase 4: Polish

15. **Add animations**
    - Fade-in on scroll (optional)
    - Hover effects on cards

16. **Mobile responsiveness**
    - Test all breakpoints
    - Mobile menu functionality

17. **SEO basics**
    - Page title
    - Meta description

---

## Design Tokens

### Colors

```javascript
const colors = {
  primary: {
    50: '#eff6ff',   // bg-blue-50
    100: '#dbeafe',  // bg-blue-100
    600: '#2563eb',  // bg-blue-600
    700: '#1d4ed8',  // bg-blue-700
  },
  tools: {
    hillChart: 'blue',
    feelingsWheel: 'purple',
    retroBoard: 'green',
    habitTracker: 'amber',
  },
};
```

### Typography

```javascript
const typography = {
  hero: 'text-5xl md:text-6xl font-bold',
  sectionTitle: 'text-3xl md:text-4xl font-bold',
  cardTitle: 'text-xl font-bold',
  body: 'text-base text-slate-600',
  small: 'text-sm text-slate-500',
};
```

### Spacing

```javascript
const spacing = {
  section: 'py-20 md:py-28',
  container: 'max-w-6xl mx-auto px-6',
};
```

---

## Reference Screenshot

See `/Users/youssefhounat/code/.playwright-mcp/easyretro-landing-1.png` for EasyRetro design reference.

---

## Notes for Implementing Agent

1. **Use existing patterns** from the codebase (Tailwind, lucide-react icons)
2. **Don't over-engineer** - simple components, no complex state
3. **Placeholder content is fine** - testimonials, logos can be generic
4. **Focus on structure first** - styling can be refined later
5. **Test on mobile** - responsive design is important
