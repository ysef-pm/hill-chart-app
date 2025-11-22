# Remove AI Features & Add Analytics Tracking

## Summary

Remove the exposed Gemini API key and disable AI-powered features ("Suggest Next Steps" and "Generate Report"), replacing them with "Coming Soon" modals that track user interest via Firestore counters.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Analytics storage | Firestore | Already set up, no new infrastructure |
| Tracking granularity | Simple counters | Minimal data, answers "how much interest?" |
| Coming soon UI | Modal popup | Consistent with existing app design |
| API code cleanup | Comment out logic, delete key references | Preserve logic for future, remove security risk |
| Firestore structure | Single document with counters | Simple reads, atomic increments |

## Data Model

**Firestore path:** `artifacts/hill-chart-app/public/data/analytics/feature-interest`

```javascript
{
  suggestNextSteps: number,  // increment on click
  generateReport: number,    // increment on click
  lastUpdated: timestamp
}
```

## Components

### trackFeatureInterest helper

```javascript
import { doc, updateDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';

const trackFeatureInterest = async (featureName) => {
  const analyticsRef = doc(db, 'artifacts', appId, 'public', 'data', 'analytics', 'feature-interest');
  try {
    await updateDoc(analyticsRef, {
      [featureName]: increment(1),
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    // Document may not exist yet, create it
    if (error.code === 'not-found') {
      await setDoc(analyticsRef, {
        [featureName]: 1,
        lastUpdated: serverTimestamp()
      });
    }
  }
};
```

### ComingSoonModal component

Reusable modal that:
1. Displays "Coming Soon" message with feature description
2. Tracks the click via `trackFeatureInterest` on open
3. Provides close button

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/HillChartApp.jsx` | Add ComingSoonModal, add trackFeatureInterest, comment out callGemini, remove apiKey const, wire up new modal |
| `.env.example` | Remove VITE_GEMINI_API_KEY |
| `README.md` | Remove Gemini API setup instructions |

## Feature Mapping

| Original Feature | Location | New Behavior |
|-----------------|----------|--------------|
| "Suggest Next Steps" button | PinModal | Opens ComingSoonModal, tracks `suggestNextSteps` |
| "Generate Report" button | Header | Opens ComingSoonModal, tracks `generateReport` |
