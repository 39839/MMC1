# Torah Study Portal: Email Auth & Bookmarking Implementation Guide

## What Has Been Implemented

Your Torah Study Portal now has two major new features:

### 1. Email/Password Authentication
- Users can sign in with their email and password
- New users can create accounts
- Sign-out functionality
- Login modal appears when no user is authenticated

### 2. Verse Bookmarking
- Users can save/bookmark verses they find meaningful
- View all their saved bookmarks in one place
- Click to jump directly to bookmarked verses
- All bookmarks are private to each user

---

## Quick Setup Steps (5 minutes)

### Step 1: Apply Firestore Security Rules

1. Go to **Firebase Console** → https://console.firebase.google.com/
2. Select your project (dvartorah-d1fad)
3. Go to **Firestore Database** (left sidebar)
4. Click on **Rules** tab at the top
5. **Delete all existing rules** and replace with the complete rules from `FIREBASE_SETUP_GUIDE.md`
6. Click **Publish**

**The rules ensure:**
- Users can only see their own bookmarks
- Comments are public but tied to users
- Each user's data is protected

### Step 2: Create Test User Accounts

In Firebase Console:

1. Go to **Authentication** (left sidebar)
2. Click **Users** tab
3. Click **Add user** button
4. Enter each email and a temporary password:

```
naama.bendor1@gmail.com
loripreci@gwmail.gwu.edu
loripreci03@gmail.com
lpreci1@jh.edu
aidan.schurr@gwmail.gwu.edu
aidanitaischurr@gmail.com
erezroy8@gmail.com
stoneda4@gmail.com
sas562@georgetown.edu
avauditsky@gmail.com
```

Each user will be able to reset their password on first login.

### Step 3: Test the App

1. Open the app in browser
2. Login modal should appear automatically
3. Try these test flows:

**Flow A: Create New Account**
```
- Click "Create Account"
- Enter any email + password (min 6 chars)
- Click "Create Account"
- You'll be logged in automatically
```

**Flow B: Sign In**
```
- Enter the email of a test account you created
- Enter password
- Click "Sign In"
```

**Flow C: Bookmark a Verse**
```
- Sign in with test account
- (Bookmark buttons will appear when feature is complete)
- Click bookmark icon on any verse
- Click "My Bookmarks" button to view saved verses
```

---

## Code Changes Made

### 1. Firebase Authentication (`js/firebase.js`)

**New Functions:**
- `signInWithEmail(email, password)` - Sign in with credentials
- `createAccountWithEmail(email, password)` - Create new account
- `signOutUser()` - Sign out current user
- `getCurrentUserEmail()` - Get logged-in user's email
- `hideLoginModal()` - Hide login modal from code
- `showLoginModal()` - Show login modal (called when no user)

**Modified Functions:**
- `initAuth()` - Now uses email auth instead of anonymous
- Shows login modal when no user is authenticated

### 2. Bookmarking Functions (`js/firebase.js`)

**New Functions:**
- `addBookmark(verseRef, userId)` - Save a verse
- `removeBookmark(verseRef, userId)` - Remove bookmark
- `isVerseBookmarked(verseRef, userId)` - Check if verse is bookmarked
- `getUserBookmarks(userId)` - Get all user's bookmarks
- `getUserBookmarksForVerses(userId, verseRefs)` - Get bookmarks for specific verses

### 3. Login UI (`index.html`)

**New Modal:**
- Login modal with email/password inputs
- Sign In button
- Create Account button
- Error message display
- Help text explaining the feature

**New Header Buttons:**
- "My Bookmarks" button (bookmark icon) - View all saved verses
- "Sign Out" button (exit icon) - Sign out user

### 4. Login Logic (`js/main.js`)

**New Functions:**
- `setupLoginListeners()` - Attach login modal events
- `showLoginError(element, message)` - Display error messages
- `openBookmarksPanel()` - Show user's bookmarks
- `loadVerseFromBookmark(verseRef)` - Jump to bookmarked verse

### 5. Firebase Security Rules (`FIREBASE_SETUP_GUIDE.md`)

**New Rules:**
- `bookmarks` collection with privacy rules
- Users can only read/write their own bookmarks
- Comments remain public but tied to users
- Reactions remain tied to users

---

## User Flow Diagram

```
App Loads
    ↓
Auth State Checked
    ↓
User Logged In?
    ├─ YES → Show "My Bookmarks" & "Sign Out" buttons
    │           ↓
    │       User Studies Verses
    │           ↓
    │       Click Bookmark Icon (COMING SOON)
    │           ↓
    │       Verse Saved to Firebase
    │           ↓
    │       Click "My Bookmarks"
    │           ↓
    │       See All Bookmarks
    │           ↓
    │       Click Bookmark → Jump to Verse
    │
    └─ NO → Show Login Modal
                ↓
            Sign In OR Create Account
                ↓
                (redirects to "YES" path above)
```

---

## Still To Do: Add Bookmark Buttons to Verses

The bookmarking backend is complete, but verse UI buttons still need to be added.

### Where to Add Bookmark Buttons

In `js/main.js`, find the `createVerseElement()` function or where verse elements are created.

Add a bookmark button alongside the Emphasize and Heart buttons:

```html
<button class="bookmark-btn" data-verse="Genesis 1:1" title="Bookmark this verse">
    <svg class="w-5 h-5" ...><!-- bookmark icon --></svg>
</button>
```

Then add click handler:

```javascript
bookmarkBtn.addEventListener('click', async () => {
    const userId = getCurrentUserId();
    if (!userId) {
        showError('Please sign in to bookmark verses');
        return;
    }

    const isBookmarked = await isVerseBookmarked(verseRef, userId);

    if (isBookmarked) {
        await removeBookmark(verseRef, userId);
        bookmarkBtn.classList.remove('active');
    } else {
        await addBookmark(verseRef, userId);
        bookmarkBtn.classList.add('active');
    }
});
```

---

## Firestore Database Structure

### Collection: `bookmarks`

```
bookmarks/
├── user123abc__Genesis%201%3A1
│   ├── verseRef: "Genesis 1:1"
│   ├── userId: "user123abc"
│   └── timestamp: 2024-11-03T15:30:00.000Z
│
├── user123abc__Genesis%201%3A2
│   ├── verseRef: "Genesis 1:2"
│   ├── userId: "user123abc"
│   └── timestamp: 2024-11-03T15:25:00.000Z
│
└── user456def__Genesis%202%3A1
    ├── verseRef: "Genesis 2:1"
    ├── userId: "user456def"
    └── timestamp: 2024-11-03T14:00:00.000Z
```

**Document ID Format:** `{userId}__{verseRef_encoded}`
- Example: `user123abc__Genesis%201%3A1`
- This makes it easy to check if a specific user bookmarked a specific verse

---

## Security Features

### What Users Can See

✅ **Can:**
- Read public comments on all verses
- Read reaction counts (how many hearts/emphasizes per verse)
- See their own bookmarks only
- See their own reactions

❌ **Cannot:**
- See other users' bookmarks (security rules prevent this)
- Delete other users' comments or reactions
- Edit other users' data

### Privacy Rules (in Firestore)

```javascript
// Bookmarks can only be read by the owner
allow read: if isAuthenticated() &&
               resource.data.userId == request.auth.uid;

// Bookmarks can only be deleted by the owner
allow delete: if isAuthenticated() &&
                 isOwner(resource.data.userId);
```

---

## Testing Checklist

- [ ] Login modal appears on app load
- [ ] Can create account with new email
- [ ] Can sign in with test account email
- [ ] "My Bookmarks" and "Sign Out" buttons appear when logged in
- [ ] Can click "My Bookmarks" to see empty list (no bookmarks yet)
- [ ] Password field shows dots (masked)
- [ ] Error messages appear for wrong password
- [ ] Can sign out and see login modal again
- [ ] Bookmarks persist after sign out/sign in (once bookmark UI is added)
- [ ] Bookmarks are private per user

---

## Troubleshooting

### Login Modal Doesn't Appear
**Problem:** You sign in, modal disappears, but buttons don't show
**Fix:**
1. Check browser console for errors
2. Check Firebase Authentication is enabled
3. Verify `initAuth()` is called in `main.js`

### Can't Create Account
**Problem:** "Email already in use" error
**Solution:** Use a different email or reset password for existing account

### Bookmarks Not Saving (When Feature Complete)
**Problem:** Click bookmark, but it's not saved
**Fix:**
1. Check Firestore Rules have been published (see Step 1)
2. Check browser console for security errors
3. Ensure user is authenticated

### Can See Other Users' Bookmarks
**Problem:** Viewing another user's bookmarks
**Fix:**
- Firestore rules must restrict to owner only
- Re-check rules were published correctly
- Rules in **Rules** tab (not in code)

---

## Future Enhancements

1. **Email Verification**
   - Require users to verify email before full access
   - Add in Firebase Authentication settings

2. **Bookmark Sharing**
   - Allow users to share bookmark lists with friends
   - Create "Collections" of bookmarks

3. **Export Bookmarks**
   - Download bookmarks as PDF or CSV
   - Share reading progress with group

4. **Study Plans**
   - Create guided reading plans
   - Track daily study streaks

5. **Collaborative Features**
   - Shared study sessions
   - Group discussions on bookmarked verses

---

## File References

- **Login/Auth Code:** `js/firebase.js` (lines 59-119)
- **Bookmark Functions:** `js/firebase.js` (lines 362-494)
- **Login UI:** `index.html` (lines 12-75)
- **Login Handlers:** `js/main.js` (lines 288-405)
- **Bookmarks Panel:** `js/main.js` (lines 1234-1299)
- **Security Rules:** `FIREBASE_SETUP_GUIDE.md`

---

## Quick Reference: Available Functions

### In `firebase.js` (Import these in your code)

```javascript
// Authentication
signInWithEmail(email, password)
createAccountWithEmail(email, password)
signOutUser()
getCurrentUserId()
getCurrentUserEmail()
hideLoginModal()

// Bookmarking
addBookmark(verseRef, userId)
removeBookmark(verseRef, userId)
isVerseBookmarked(verseRef, userId)
getUserBookmarks(userId)
getUserBookmarksForVerses(userId, verseRefs)
```

### In `main.js` (Available globally)

```javascript
openBookmarksPanel()          // Show bookmarks modal
loadVerseFromBookmark(verse)  // Jump to bookmarked verse
setupLoginListeners()         // Called during init
```

---

## Contact & Support

If you encounter issues:

1. Check browser console for error messages (F12)
2. Verify all files were updated
3. Ensure Firestore Rules were published
4. Check Firebase project has email auth enabled
5. Try signing out and back in

---

**Status:** Email auth ✅ | Bookmarking backend ✅ | Bookmark UI buttons ⏳

**Last Updated:** November 2024
**Version:** 1.0
