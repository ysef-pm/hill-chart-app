# User Data Isolation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make each user see only their own pins on the Hill chart instead of seeing all users' pins.

**Architecture:** Add a `where('uid', '==', user.uid)` filter to the Firestore query so only the current user's pins are fetched. Deploy updated Firestore security rules to enforce this server-side as defense in depth.

**Tech Stack:** React, Firebase Firestore, Firebase Auth

**Design Document:** `docs/plans/2025-11-22-user-data-isolation-design.md`

---

## Task 1: Add `where` to Firestore Import

**Files:**
- Modify: `src/components/HillChartApp.jsx:5-13`

**Step 1: Add `where` to the firebase/firestore import**

Open `src/components/HillChartApp.jsx` and find lines 5-13:

```javascript
import {
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    doc,
    query,
    serverTimestamp
} from 'firebase/firestore';
```

Change to:

```javascript
import {
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
```

**Step 2: Verify the app still compiles**

Run: `npm run dev`

Expected: App starts without import errors

**Step 3: Commit**

```bash
git add src/components/HillChartApp.jsx
git commit -m "chore: add where import from firebase/firestore"
```

---

## Task 2: Filter Pins Query by User UID

**Files:**
- Modify: `src/components/HillChartApp.jsx:427`

**Step 1: Update the Firestore query to filter by user.uid**

Find line 427 in `src/components/HillChartApp.jsx`:

```javascript
const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'pins'));
```

Change to:

```javascript
const q = query(
    collection(db, 'artifacts', appId, 'public', 'data', 'pins'),
    where('uid', '==', user.uid)
);
```

**Step 2: Verify the app compiles and runs**

Run: `npm run dev`

Expected: App starts without errors. If you're logged in, you should now only see your own pins (or no pins if you haven't created any yet).

**Step 3: Commit**

```bash
git add src/components/HillChartApp.jsx
git commit -m "feat: filter pins by user uid for data isolation"
```

---

## Task 3: Manual Testing - Verify User Isolation

**Prerequisites:** You need two different Google accounts to test properly.

**Step 1: Test as User A**

1. Open the app at `http://localhost:5173` (or your dev URL)
2. Log in with Google Account A
3. Create a new pin on the Hill chart with some text like "User A test pin"
4. Verify the pin appears on the chart

**Step 2: Test as User B**

1. Log out (click the logout button)
2. Log in with a different Google Account B
3. Verify you do NOT see "User A test pin"
4. Create a new pin with text "User B test pin"
5. Verify only "User B test pin" appears

**Step 3: Verify User A still only sees their pins**

1. Log out
2. Log back in as User A
3. Verify you see "User A test pin" but NOT "User B test pin"

**Expected Result:** Each user only sees their own pins.

---

## Task 4: Deploy Firestore Security Rules

**Note:** This task requires access to the Firebase Console. It cannot be done via code alone.

**Step 1: Open Firebase Console**

1. Go to https://console.firebase.google.com/
2. Select your project (the one matching `VITE_FIREBASE_PROJECT_ID`)
3. Navigate to: Firestore Database > Rules tab

**Step 2: Update the security rules**

Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/pins/{pinId} {
      // Users can only read their own pins
      allow read: if request.auth != null &&
                    resource.data.uid == request.auth.uid;

      // Users can create pins (uid must match their auth)
      allow create: if request.auth != null &&
                      request.resource.data.uid == request.auth.uid;

      // Users can only update/delete their own pins
      allow update, delete: if request.auth != null &&
                              resource.data.uid == request.auth.uid;
    }
  }
}
```

**Step 3: Publish the rules**

Click the "Publish" button in Firebase Console.

**Step 4: Test that rules are enforced**

1. Go back to the app
2. Verify you can still see your own pins
3. Verify you can still create new pins
4. Verify you can still delete your own pins

**Expected Result:** App works normally for the logged-in user's own pins.

---

## Task 5: Update README with Security Rules

**Files:**
- Modify: `README.md`

**Step 1: Find the Firestore Security Rules section in README.md**

Search for "Firestore Security Rules" in README.md

**Step 2: Update the rules in the README to match the new rules**

Replace the old rules section with the new rules from Task 4, Step 2.

This ensures future developers know the correct security rules to deploy.

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update Firestore security rules for user data isolation"
```

---

## Task 6: Final Verification and Cleanup

**Step 1: Run a full test cycle**

1. Log in as User A, create a pin, verify it appears
2. Log out, log in as User B, verify User A's pin is NOT visible
3. Create a pin as User B, verify it appears
4. Log out, log in as User A, verify only User A's pin is visible
5. Delete User A's pin, verify it's removed

**Step 2: Check for console errors**

Open browser DevTools (F12) > Console tab

Expected: No Firestore permission errors or other errors

**Step 3: Create final commit if any cleanup was needed**

```bash
git add -A
git commit -m "feat: complete user data isolation implementation"
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/HillChartApp.jsx:5-13` | Add `where` to imports |
| `src/components/HillChartApp.jsx:427` | Add `where('uid', '==', user.uid)` to query |
| Firebase Console > Firestore Rules | Deploy user-scoped security rules |
| `README.md` | Update security rules documentation |

## Success Criteria

- [ ] User A logs in and sees only their pins
- [ ] User B logs in and sees only their pins
- [ ] Creating a pin as User A is not visible to User B
- [ ] Security rules deployed and enforced
- [ ] README updated with correct security rules
- [ ] All changes committed to git
