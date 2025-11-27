# Complete Firestore Rules

Copy everything between the triple backticks below:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isTeamMember(teamId) {
      let team = get(/databases/$(database)/documents/teams/$(teamId));
      return isAuthenticated() && team != null && request.auth.uid in team.data.memberIds;
    }

    function isJoiningTeam() {
      return isAuthenticated() &&
             request.auth.uid in request.resource.data.memberIds &&
             !(request.auth.uid in resource.data.memberIds);
    }

    function isKudosTeamMember(teamId) {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/kudosTeams/$(teamId)/members/$(request.auth.uid));
    }

    match /artifacts/{appId}/public/data/pins/{pinId} {
      allow read: if isAuthenticated() && resource.data.uid == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.uid == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.uid == request.auth.uid;
    }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }

    match /teams/{teamId} {
      allow create: if isAuthenticated();
      allow read: if isAuthenticated();
      allow update: if isTeamMember(teamId) || isJoiningTeam();
      allow delete: if isTeamMember(teamId);

      match /habits/{habitId} {
        allow read, write: if isTeamMember(teamId);

        match /checks/{checkId} {
          allow read, write: if isTeamMember(teamId);
        }
      }
    }

    match /kudosUsers/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }

    match /kudosTeams/{teamId} {
      allow read: if isAuthenticated();

      match /info/{docId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update: if isKudosTeamMember(teamId);
      }

      match /members/{memberId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated() && request.auth.uid == memberId;
        allow update: if isAuthenticated() && request.auth.uid == memberId;
        allow delete: if isAuthenticated() && request.auth.uid == memberId;
      }

      match /kudos/{kudoId} {
        allow read: if isKudosTeamMember(teamId);
        allow create: if isKudosTeamMember(teamId);
        allow update: if isKudosTeamMember(teamId);
      }
    }
  }
}
```
