# Firebase Setup Guide for Torah Study Portal

## Overview
This guide covers the authentication, database structure, and security rules needed for the Torah Study Portal with email-based sign-in and verse bookmarking features.

---

## 1. Authentication Setup

### Email/Password Authentication (Already Enabled)
1. Go to Firebase Console → Project Settings → Authentication
2. Sign-in method: Ensure **Email/Password** is enabled
3. Allow users to sign up with email and password (enabled by default)

### Test User Accounts
The following emails should have accounts created:

```
- naama.bendor1@gmail.com (Naama Ben-Dor)
- loripreci@gwmail.gwu.edu (Lori Preci)
- loripreci03@gmail.com (Lori Preci - Alternative)
- lpreci1@jh.edu (Lori Preci - Alternative 2)
- aidan.schurr@gwmail.gwu.edu (Aidan Schurr)
- aidanitaischurr@gmail.com (Aidan Schurr - Alternative)
- erezroy8@gmail.com (Erez Yarden)
- stoneda4@gmail.com (Daniel Stone)
- sas562@georgetown.edu (Stephanie Solomon)
- avauditsky@gmail.com (Ava Uditsky)
```

**To create test accounts:**
1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter email and temporary password
4. Users can reset password on first login

---

## 2. Firestore Collections Structure

### Collection: `comments`
**Purpose**: Store verse discussions and comments

**Document ID**: Auto-generated

**Fields**:
```
{
  "verseRef": "Genesis 1:1",           // Verse reference (string)
  "text": "Great observation...",       // Comment text (string)
  "userId": "user123abc",              // Firebase auth UID (string)
  "username": "Naama",                 // Display name (string)
  "timestamp": {timestamp}             // When created (timestamp)
}
```

---

### Collection: `reactions`
**Purpose**: Store user reactions (emphasize & heart) to verses

**Document ID**: `{verseRef_encoded}__{userId}__{reactionType}`
Example: `Genesis%201%3A1__user123abc__emphasize`

**Fields**:
```
{
  "verseRef": "Genesis 1:1",           // Verse reference (string)
  "userId": "user123abc",              // Firebase auth UID (string)
  "reactionType": "heart",             // "heart" or "emphasize" (string)
  "timestamp": {timestamp}             // When created (timestamp)
}
```

---

### Collection: `bookmarks` ⭐ NEW
**Purpose**: Store user's saved/bookmarked verses

**Document ID**: `{userId}__{verseRef_encoded}`
Example: `user123abc__Genesis%201%3A1`

**Fields**:
```
{
  "verseRef": "Genesis 1:1",           // Verse reference (string)
  "userId": "user123abc",              // Firebase auth UID (string)
  "timestamp": {timestamp}             // When bookmarked (timestamp)
}
```

---

## 3. Firestore Security Rules

Replace your current Firestore security rules with this complete set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function: Check if user ID matches request user
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // COMMENTS Collection
    match /comments/{document=**} {
      // Anyone can read comments
      allow read: if isAuthenticated();

      // Only authenticated users can create comments
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.text is string &&
                       request.resource.data.text.size() > 0 &&
                       request.resource.data.text.size() <= 1000 &&
                       request.resource.data.username is string &&
                       request.resource.data.username.size() > 0 &&
                       request.resource.data.username.size() <= 50 &&
                       request.resource.data.verseRef is string &&
                       request.resource.data.timestamp is timestamp;

      // Users can only delete their own comments
      allow delete: if isAuthenticated() &&
                       isOwner(resource.data.userId);

      // Deny updates (optional: allow username/text updates if needed)
      allow update: if false;
    }

    // REACTIONS Collection
    match /reactions/{document=**} {
      // Anyone can read reactions
      allow read: if isAuthenticated();

      // Only authenticated users can create reactions
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.reactionType in ['heart', 'emphasize'] &&
                       request.resource.data.verseRef is string &&
                       request.resource.data.timestamp is timestamp;

      // Users can only delete their own reactions
      allow delete: if isAuthenticated() &&
                       isOwner(resource.data.userId);

      // No updates allowed
      allow update: if false;
    }

    // BOOKMARKS Collection ⭐ NEW
    match /bookmarks/{document=**} {
      // Users can only read their own bookmarks
      allow read: if isAuthenticated() &&
                     resource.data.userId == request.auth.uid;

      // Only authenticated users can create bookmarks
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.verseRef is string &&
                       request.resource.data.timestamp is timestamp;

      // Users can only delete their own bookmarks
      allow delete: if isAuthenticated() &&
                       isOwner(resource.data.userId);

      // No updates allowed
      allow update: if false;
    }

    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 4. How to Apply Security Rules

1. Go to **Firebase Console** → Your Project
2. Click on **Firestore Database** (left sidebar)
3. Click on the **Rules** tab at the top
4. Replace all existing rules with the above code
5. Click **Publish**

---

## 5. Web App Configuration

The app is already configured in `js/firebase.js` with:
- Email/password sign-in
- Firestore database integration
- Comment submission
- Reaction tracking (emphasize & heart)
- Bookmark management ⭐ NEW

---

## 6. Email Verification (Optional but Recommended)

To add email verification for security:

1. Go to **Firebase Console** → **Authentication** → **Templates**
2. Customize the "Email verification" template if desired
3. In production, enable "Email verification" in the Authentication settings

---

## 7. User Data Migration (If Needed)

If you had previous anonymous user data:
- Comments will remain (they have `userId` field)
- You may want to run a Cloud Function to migrate old data
- New bookmarks/reactions will only work with authenticated users

---

## 8. Testing the Setup

### Test Sign-in Flow:
1. Open the app
2. Login modal should appear
3. Sign in with any created test email
4. Header buttons (My Bookmarks, Sign Out) should appear
5. You should be able to bookmark verses

### Test Bookmarking:
1. Click bookmark icon on any verse
2. Go to "My Bookmarks" to see saved verses
3. Sign out and back in with same account
4. Bookmarks should persist

### Test Security:
1. Try to view another user's bookmarks (should fail)
2. Try to delete another user's comments (should fail)
3. These should return permission errors

---

## 9. Troubleshooting

### Login modal doesn't appear:
- Check browser console for errors
- Ensure `initAuth()` is called in `main.js`

### Bookmarks not saving:
- Check Firestore Rules (publish them again)
- Check browser console for Firebase errors
- Ensure user is authenticated (`getCurrentUserId()` returns a value)

### Bookmarks visible to other users:
- Check security rules - `bookmarks` collection should only be readable by owner
- Rule must have: `resource.data.userId == request.auth.uid`

---

## 10. Future Enhancements

Consider adding:
- Email verification before full access
- Backup/export bookmarks functionality
- Sharing bookmarks with friends
- Cloud Functions for cleanup/moderation
- Analytics (what verses are most bookmarked)

---

**Document Version**: 1.0
**Last Updated**: November 2024
**Firebase SDK**: 10.7.1
