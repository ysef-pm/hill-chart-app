# Remove AI Features & Add Analytics - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove exposed Gemini API key, replace AI features with "Coming Soon" modals that track user interest in Firestore.

**Architecture:** Add a reusable ComingSoonModal component and trackFeatureInterest helper function. Wire existing AI buttons to show modal and increment Firestore counters. Comment out (don't delete) the AI logic for future re-enabling.

**Tech Stack:** React, Firebase Firestore, Tailwind CSS

---

## Task 1: Add Analytics Helper Function

**Files:**
- Modify: `/Users/youssefhounat/code/hill-chart-app/src/components/HillChartApp.jsx`

**Step 1: Add Firestore imports for analytics**

At line 5, add `setDoc` to the existing imports:

```jsx
import {
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    doc,
    query,
    serverTimestamp,
    updateDoc,
    increment,
    setDoc
} from 'firebase/firestore';
```

**Step 2: Add trackFeatureInterest function**

After line 18 (after `const appId = 'hill-chart-app';`), add:

```jsx
// --- Analytics Helper ---
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

**Step 3: Verify no syntax errors**

Run: `npm run dev`
Expected: App compiles without errors

**Step 4: Commit**

```bash
git add src/components/HillChartApp.jsx
git commit -m "feat: add trackFeatureInterest analytics helper"
```

---

## Task 2: Create ComingSoonModal Component

**Files:**
- Modify: `/Users/youssefhounat/code/hill-chart-app/src/components/HillChartApp.jsx`

**Step 1: Add ComingSoonModal component**

After the `ReportModal` component (around line 408), add:

```jsx
const ComingSoonModal = ({ isOpen, onClose, featureName, featureTitle, featureDescription }) => {
    useEffect(() => {
        if (isOpen && featureName) {
            trackFeatureInterest(featureName);
        }
    }, [isOpen, featureName]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 p-6 m-4 text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{featureTitle || 'Coming Soon'}</h3>
                <p className="text-slate-500 mb-6 leading-relaxed">{featureDescription}</p>
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                >
                    Got it
                </button>
            </div>
        </div>
    );
};
```

**Step 2: Verify no syntax errors**

Run: `npm run dev`
Expected: App compiles without errors

**Step 3: Commit**

```bash
git add src/components/HillChartApp.jsx
git commit -m "feat: add ComingSoonModal component"
```

---

## Task 3: Comment Out Gemini API Code

**Files:**
- Modify: `/Users/youssefhounat/code/hill-chart-app/src/components/HillChartApp.jsx`

**Step 1: Delete the API key constant**

Find and DELETE this line (around line 16):
```jsx
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

**Step 2: Comment out callGemini function**

Find the `callGemini` function (lines 21-58) and wrap it in a comment block:

```jsx
// --- AI Helper Functions (disabled - re-enable when backend proxy is ready) ---
/*
const callGemini = async (prompt) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: prompt }] }]
    };

    const makeRequest = async (retryCount = 0) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (retryCount < 5) {
                    const delay = Math.pow(2, retryCount) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return makeRequest(retryCount + 1);
                }
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
        } catch (error) {
            if (retryCount < 5) {
                const delay = Math.pow(2, retryCount) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return makeRequest(retryCount + 1);
            }
            console.error("Gemini API failed:", error);
            return "Sorry, I couldn't generate a response at this time.";
        }
    };

    return makeRequest();
};
*/
```

**Step 3: Verify no syntax errors**

Run: `npm run dev`
Expected: App compiles without errors

**Step 4: Commit**

```bash
git add src/components/HillChartApp.jsx
git commit -m "chore: comment out Gemini API code, remove API key reference"
```

---

## Task 4: Wire Up ComingSoonModal for "Suggest Next Steps"

**Files:**
- Modify: `/Users/youssefhounat/code/hill-chart-app/src/components/HillChartApp.jsx`

**Step 1: Add state for ComingSoon modal in PinModal**

In the `PinModal` component, find the state declarations (around line 204-207). Add a new state:

```jsx
const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
```

**Step 2: Replace handleSuggest function**

Find the `handleSuggest` function in PinModal (around line 222-238) and replace it entirely:

```jsx
const handleSuggest = () => {
    setIsComingSoonOpen(true);
};
```

**Step 3: Add ComingSoonModal inside PinModal return**

Inside PinModal's return statement, just before the closing `</div>` of the outer modal container (before line 326), add:

```jsx
<ComingSoonModal
    isOpen={isComingSoonOpen}
    onClose={() => setIsComingSoonOpen(false)}
    featureName="suggestNextSteps"
    featureTitle="AI Suggestions Coming Soon"
    featureDescription="We're working on AI-powered next step suggestions. This feature will help you figure out what to do next based on your current progress."
/>
```

**Step 4: Remove isSuggesting state and related UI**

Find and remove the `isSuggesting` state declaration:
```jsx
const [isSuggesting, setIsSuggesting] = useState(false);
```

Update the Suggest button (around line 296-301) to remove the loading state:
```jsx
<button
    onClick={handleSuggest}
    disabled={!text.trim()}
    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 disabled:opacity-50 font-medium transition-colors"
>
    <Sparkles size={12} />
    Suggest Next Steps
</button>
```

**Step 5: Verify the feature works**

Run: `npm run dev`
- Open the app in browser
- Click on the hill to add a pin
- Type some text in the status field
- Click "Suggest Next Steps"
Expected: ComingSoonModal appears with "AI Suggestions Coming Soon" message

**Step 6: Commit**

```bash
git add src/components/HillChartApp.jsx
git commit -m "feat: replace Suggest Next Steps with Coming Soon modal"
```

---

## Task 5: Wire Up ComingSoonModal for "Generate Report"

**Files:**
- Modify: `/Users/youssefhounat/code/hill-chart-app/src/components/HillChartApp.jsx`

**Step 1: Add state for report ComingSoon modal in HillChartApp**

In the `HillChartApp` component, find the state declarations (around line 411-420). Add:

```jsx
const [isReportComingSoonOpen, setIsReportComingSoonOpen] = useState(false);
```

**Step 2: Update Generate Report button**

Find the "Generate Report" button in the header (around line 594-600). Change `onClick` from `setIsReportOpen(true)` to:

```jsx
<button
    onClick={() => setIsReportComingSoonOpen(true)}
    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all"
>
    <Sparkles size={16} />
    Generate Report
</button>
```

**Step 3: Add ComingSoonModal for reports**

Inside HillChartApp's return, after the existing `ReportModal` usage (around line 788), add:

```jsx
<ComingSoonModal
    isOpen={isReportComingSoonOpen}
    onClose={() => setIsReportComingSoonOpen(false)}
    featureName="generateReport"
    featureTitle="AI Reports Coming Soon"
    featureDescription="We're working on AI-powered status reports. This feature will automatically generate comprehensive project summaries based on your hill chart progress."
/>
```

**Step 4: Verify the feature works**

Run: `npm run dev`
- Open the app in browser
- Click "Generate Report" button in the header
Expected: ComingSoonModal appears with "AI Reports Coming Soon" message

**Step 5: Commit**

```bash
git add src/components/HillChartApp.jsx
git commit -m "feat: replace Generate Report with Coming Soon modal"
```

---

## Task 6: Clean Up Unused Code

**Files:**
- Modify: `/Users/youssefhounat/code/hill-chart-app/src/components/HillChartApp.jsx`

**Step 1: Comment out ReportModal component**

Find the entire `ReportModal` component (around lines 329-408) and comment it out:

```jsx
// --- ReportModal (disabled - re-enable when AI features are ready) ---
/*
const ReportModal = ({ isOpen, onClose, pins }) => {
    // ... entire component
};
*/
```

**Step 2: Remove unused isReportOpen state**

Find and remove:
```jsx
const [isReportOpen, setIsReportOpen] = useState(false);
```

**Step 3: Remove unused ReportModal usage**

Find and remove:
```jsx
<ReportModal
    isOpen={isReportOpen}
    onClose={() => setIsReportOpen(false)}
    pins={pins}
/>
```

**Step 4: Run lint to check for issues**

Run: `npm run lint`
Expected: No errors (warnings about unused imports are OK)

**Step 5: Commit**

```bash
git add src/components/HillChartApp.jsx
git commit -m "chore: comment out unused ReportModal component"
```

---

## Task 7: Remove API Key from Environment Files

**Files:**
- Modify: `/Users/youssefhounat/code/hill-chart-app/.env.example` (if exists)
- Modify: `/Users/youssefhounat/code/hill-chart-app/README.md`

**Step 1: Check if .env.example exists and remove Gemini key**

Run: `ls -la /Users/youssefhounat/code/hill-chart-app/.env*`

If `.env.example` exists, remove the line:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Step 2: Update README.md**

Remove references to Gemini API key setup. Find and remove:
- Section "### 4. Get Your Gemini API Key" (lines 61-66)
- The `VITE_GEMINI_API_KEY` line from the environment variables example (line 83)
- Any troubleshooting related to Gemini (lines 233-235)
- "Gemini AI" from Technologies Used section (line 252)

**Step 3: Commit**

```bash
git add .env.example README.md
git commit -m "docs: remove Gemini API key references from env and readme"
```

---

## Task 8: Verify Complete Implementation

**Step 1: Run the app**

Run: `npm run dev`

**Step 2: Test Suggest Next Steps**

- Click on hill to add pin
- Enter project name, your name, and status text
- Click "Suggest Next Steps"
- Verify: ComingSoonModal appears

**Step 3: Test Generate Report**

- Click "Generate Report" button in header
- Verify: ComingSoonModal appears

**Step 4: Verify analytics in Firestore**

- Go to Firebase Console > Firestore
- Navigate to: `artifacts/hill-chart-app/public/data/analytics/feature-interest`
- Verify: Document exists with `suggestNextSteps` and `generateReport` counters

**Step 5: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete AI feature replacement with Coming Soon modals and analytics"
```

---

## Summary of Changes

| File | Changes |
|------|---------|
| `src/components/HillChartApp.jsx` | Added trackFeatureInterest, ComingSoonModal, commented out callGemini and ReportModal, wired new modals |
| `.env.example` | Removed VITE_GEMINI_API_KEY |
| `README.md` | Removed Gemini setup instructions |
