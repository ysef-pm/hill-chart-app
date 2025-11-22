# User Data Isolation Design

**Date**: 2025-11-22
**Status**: Approved
**Author**: Claude (via brainstorming session)

## Problem Statement

Currently, all authenticated users see the same pins on the Hill chart. When User A logs in, they see User B's pins and vice versa. Each user should only see their own pins.

## Goals

1. **Immediate**: Users only see their own pins after logging in
2. **Future**: Support team-based visibility where teammates see each other's pins

## Current Architecture

| Component | Current State |
|-----------|--------------|
| Auth | Firebase Google Auth - `user.uid` available |
| Storage | Firestore at `artifacts/hill-chart-app/public/data/pins/` |
| Query | Fetches ALL pins without user filtering |
| Pin Model | Has `uid` field but unused for filtering |

**Root cause**: `HillChartApp.jsx:427` queries all pins without a `where('uid', '==', user.uid)` clause.

## Chosen Approach

**Frontend Filter + Firestore Security Rules** (Defense in depth)

- Add `where()` clause to frontend query
- Update Firestore security rules to enforce server-side

## Design Details

### 1. Frontend Query Changes

**File**: `src/components/HillChartApp.jsx`

**Current** (line ~427):
```javascript
const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'pins'));
```

**New**:
```javascript
import { query, collection, where } from 'firebase/firestore';

const q = query(
  collection(db, 'artifacts', appId, 'public', 'data', 'pins'),
  where('uid', '==', user.uid)
);
```

### 2. Firestore Security Rules

**Deploy to**: Firebase Console > Firestore > Rules

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

### 3. Future Team Support Architecture

When teams are needed, extend the model:

**Teams collection**:
```javascript
teams/{teamId}: {
  name: "Engineering",
  members: ["uid1", "uid2", "uid3"],
  createdBy: "uid1"
}
```

**Pin model extension**:
```javascript
{
  uid: "user123",           // Creator
  teamId: "team456",        // Team this pin belongs to (optional)
  text: "...",
  // ... other fields
}
```

**Future query**:
```javascript
// Users with a team see team pins
const q = query(..., where('teamId', '==', userTeamId));

// Users without a team see only their pins (current behavior)
const q = query(..., where('uid', '==', user.uid));
```

**Future security rules**:
```javascript
allow read: if request.auth != null && (
  resource.data.uid == request.auth.uid ||
  get(/databases/$(database)/documents/teams/$(resource.data.teamId))
    .data.members.hasAny([request.auth.uid])
);
```

## Implementation Tasks

1. Update Firestore query in `HillChartApp.jsx` to filter by `user.uid`
2. Ensure `where` is imported from `firebase/firestore`
3. Deploy new Firestore security rules via Firebase Console
4. Test: Create pins as User A, verify User B cannot see them
5. Test: Verify User A can still create, view, and delete their own pins

## Migration Notes

- No data migration needed (database is empty)
- Existing pin creation already attaches `user.uid`
- Delete operations work automatically (users only see their own pins)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Firestore index required | Firestore prompts with link if needed |
| Rules deployment forgotten | Document in README, add to deploy checklist |
| Future team migration | Current design doesn't block team extension |

## Success Criteria

- [ ] User A logs in and sees only their pins
- [ ] User B logs in and sees only their pins
- [ ] Creating a pin as User A is not visible to User B
- [ ] Security rules reject unauthorized read attempts
