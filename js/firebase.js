// Firebase Module - Initialize Firebase services
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
    setDoc,
    increment,
    orderBy,
    limit
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getDisplayNameFromEmail } from './name-utils.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3KsU8fdztSCQ5b7sgMUWWbDDJVrQ0ymU",
  authDomain: "dvartorah-d1fad.firebaseapp.com",
  projectId: "dvartorah-d1fad",
  storageBucket: "dvartorah-d1fad.appspot.com",
  messagingSenderId: "368154467911",
  appId: "1:368154467911:web:7af511f96100559a7e9b62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence to LOCAL so user stays logged in even after browser closes
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Persistence enabled - users will stay logged in');
  })
  .catch((error) => {
    console.error('Persistence setup error:', error);
  });

// Current user state
let currentUser = null;

// Initialize authentication with listener
function initAuth(onAuthReady) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      console.log('User authenticated:', user.email);
      hideLoginModal();
      if (onAuthReady) onAuthReady(user);
    } else {
      currentUser = null;
      console.log('No user authenticated');
      showLoginModal();
      if (onAuthReady) onAuthReady(null);
    }
  });
}

// Sign in with email and password
async function signInWithEmail(email, password) {
  try {
    // Normalize email while leaving password case intact
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const result = await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
    currentUser = result.user;
    return result.user;
  } catch (error) {
    console.error('Sign-in error:', error);
    throw error;
  }
}

// Create account with email and password
async function createAccountWithEmail(email, password) {
  try {
    // Normalize email while leaving password case intact
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const result = await createUserWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
    currentUser = result.user;
    return result.user;
  } catch (error) {
    console.error('Account creation error:', error);
    throw error;
  }
}

// Sign out current user
async function signOutUser() {
  try {
    await signOut(auth);
    currentUser = null;
    console.log('User signed out');
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

// Get current user ID
function getCurrentUserId() {
  return currentUser ? currentUser.uid : null;
}

// Get current user email
function getCurrentUserEmail() {
  return currentUser ? currentUser.email : null;
}

// Show login modal (to be implemented in UI)
function showLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

// Hide login modal (to be implemented in UI)
function hideLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Submit a comment to Firestore with username
async function submitComment(verseRef, text, userId, username) {
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  if (!text || text.trim().length === 0) {
    throw new Error('Comment text is empty');
  }

  if (!username || username.trim().length === 0) {
    throw new Error('Username is required');
  }

  if (username.trim().length > 50) {
    throw new Error('Username must be 50 characters or less');
  }

  try {
    const commentData = {
      verseRef: verseRef,
      text: text.trim(),
      userId: userId,
      username: username.trim(),
      timestamp: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'comments'), commentData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

// Listen for comments on a specific verse
let currentCommentsUnsubscribe = null;

function listenForComments(verseRef, callback) {
  // Stop previous listener if exists
  if (currentCommentsUnsubscribe) {
    currentCommentsUnsubscribe();
    currentCommentsUnsubscribe = null;
  }

  try {
    // SIMPLIFIED QUERY - No orderBy to avoid needing an index
    // We'll sort in JavaScript instead
    const commentsQuery = query(
      collection(db, 'comments'),
      where('verseRef', '==', verseRef)
      // orderBy removed temporarily - will sort in code
    );

    currentCommentsUnsubscribe = onSnapshot(commentsQuery, 
      (querySnapshot) => {
        const comments = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          comments.push({
            id: doc.id,
            verseRef: data.verseRef,
            text: data.text,
            userId: data.userId,
            username: data.username || 'Anonymous',
            timestamp: data.timestamp
          });
        });
        
        // Sort by timestamp in JavaScript (newest first)
        comments.sort((a, b) => {
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;
          return b.timestamp.toMillis() - a.timestamp.toMillis();
        });
        
        callback(comments);
      },
      (error) => {
        console.error('Error listening to comments:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error setting up comment listener:', error);
    callback([]);
  }
}

// Stop listening for comments
function stopListeningForComments() {
  if (currentCommentsUnsubscribe) {
    currentCommentsUnsubscribe();
    currentCommentsUnsubscribe = null;
  }
}

// ========================================
// REACTION FUNCTIONS (Emphasize & Heart)
// ========================================

// Submit or toggle a reaction (emphasize or heart)
async function submitReaction(verseRef, reactionType, userId) {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!['emphasize', 'heart'].includes(reactionType)) {
    throw new Error('Invalid reaction type');
  }

  try {
    const reactionKey = `${encodeURIComponent(verseRef)}__${userId}__${reactionType}`;
    const reactionDocRef = doc(db, 'reactions', reactionKey);

    const existingDoc = await getDoc(reactionDocRef);

    if (existingDoc.exists()) {
      await deleteDoc(reactionDocRef);
      return { action: 'removed', reactionType };
    }

    const reactionData = {
      verseRef: verseRef,
      userId: userId,
      reactionType: reactionType,
      timestamp: serverTimestamp()
    };

    await setDoc(reactionDocRef, reactionData);
    return { action: 'added', reactionType, id: reactionKey };
  } catch (error) {
    console.error('Error submitting reaction:', error);
    throw error;
  }
}

// Get reaction counts for multiple verses
async function getReactionCounts(verseRefs) {
  const counts = {};

  // Initialize counts for all verses
  verseRefs.forEach(ref => {
    counts[ref] = { emphasize: 0, heart: 0 };
  });

  try {
    // Query all reactions for these verses
    const reactionsQuery = query(
      collection(db, 'reactions'),
      where('verseRef', 'in', verseRefs.slice(0, 30)) // Firestore 'in' limit is 30
    );

    const querySnapshot = await getDocs(reactionsQuery);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const verseRef = data.verseRef;
      const reactionType = data.reactionType;

      if (counts[verseRef]) {
        counts[verseRef][reactionType] = (counts[verseRef][reactionType] || 0) + 1;
      }
    });

    return counts;
  } catch (error) {
    console.error('Error getting reaction counts:', error);
    return counts;
  }
}

// Get user's reactions for specific verses
async function getUserReactions(userId, verseRefs) {
  const userReactions = {};

  if (!userId || !verseRefs || verseRefs.length === 0) {
    return userReactions;
  }

  try {
    const reactionsQuery = query(
      collection(db, 'reactions'),
      where('userId', '==', userId),
      where('verseRef', 'in', verseRefs.slice(0, 30))
    );

    const querySnapshot = await getDocs(reactionsQuery);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const verseRef = data.verseRef;
      const reactionType = data.reactionType;

      if (!userReactions[verseRef]) {
        userReactions[verseRef] = [];
      }
      userReactions[verseRef].push(reactionType);
    });

    return userReactions;
  } catch (error) {
    console.error('Error getting user reactions:', error);
    return userReactions;
  }
}

// Get reaction counts for a specific book range (for parsha loading)
async function getReactionCountsForBook(bookName) {
  const counts = {};

  try {
    const startRef = `${bookName} `;
    const endRef = `${bookName}~`;

    const reactionsQuery = query(
      collection(db, 'reactions'),
      where('verseRef', '>=', startRef),
      where('verseRef', '<=', endRef)
    );

    const querySnapshot = await getDocs(reactionsQuery);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const verseRef = data.verseRef;
      const reactionType = data.reactionType;

      if (!counts[verseRef]) {
        counts[verseRef] = { emphasize: 0, heart: 0 };
      }
      counts[verseRef][reactionType] = (counts[verseRef][reactionType] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Error getting reaction counts for book:', error);
    return counts;
  }
}

// ========================================
// BOOKMARK COUNTING FUNCTIONS
// ========================================

async function getBookmarkCountsForBook(bookName) {
  const counts = {};

  try {
    const startRef = `${bookName} `;
    const endRef = `${bookName}~`;

    const bookmarksQuery = query(
      collection(db, 'bookmarkCounts'),
      where('verseRef', '>=', startRef),
      where('verseRef', '<=', endRef)
    );

    const querySnapshot = await getDocs(bookmarksQuery);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const verseRef = data.verseRef;

      const value = typeof data.count === 'number' ? data.count : 0;
      counts[verseRef] = Math.max(0, value);
    });

    return counts;
  } catch (error) {
    console.error('Error getting bookmark counts for book:', error);
    return counts;
  }
}

async function getBookmarkCountsForVerses(verseRefs) {
  const counts = {};

  if (!Array.isArray(verseRefs) || verseRefs.length === 0) {
    return counts;
  }

  try {
    const maxBatchSize = 10; // Firestore 'in' clause limit

    for (let i = 0; i < verseRefs.length; i += maxBatchSize) {
      const batch = verseRefs.slice(i, i + maxBatchSize);
      const bookmarksQuery = query(
        collection(db, 'bookmarkCounts'),
        where('verseRef', 'in', batch)
      );

      const querySnapshot = await getDocs(bookmarksQuery);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const verseRef = data.verseRef;
        const value = typeof data.count === 'number' ? data.count : 0;
        counts[verseRef] = Math.max(0, value);
      });
    }

    return counts;
  } catch (error) {
    console.error('Error getting bookmark counts for verses:', error);
    return counts;
  }
}

// ========================================
// BOOKMARKING FUNCTIONS
// ========================================

// Add a bookmark for a verse
async function addBookmark(verseRef, userId, options = {}) {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!verseRef || verseRef.trim().length === 0) {
    throw new Error('Verse reference is required');
  }

  try {
    const bookmarkKey = `${userId}__${encodeURIComponent(verseRef)}`;
    const bookmarkDocRef = doc(db, 'bookmarks', bookmarkKey);

    const bookmarkData = {
      verseRef: verseRef,
      userId: userId,
      timestamp: serverTimestamp()
    };

    if (options.verseText && typeof options.verseText === 'string') {
      bookmarkData.verseText = options.verseText.trim();
    }

    await setDoc(bookmarkDocRef, bookmarkData);

    const statsDocRef = doc(db, 'bookmarkCounts', encodeURIComponent(verseRef));
    await setDoc(
      statsDocRef,
      {
        verseRef: verseRef,
        count: increment(1),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    return { action: 'added', verseRef, id: bookmarkKey };
  } catch (error) {
    console.error('Error adding bookmark:', error);
    throw error;
  }
}

// Remove a bookmark
async function removeBookmark(verseRef, userId) {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const bookmarkKey = `${userId}__${encodeURIComponent(verseRef)}`;
    const bookmarkDocRef = doc(db, 'bookmarks', bookmarkKey);
    await deleteDoc(bookmarkDocRef);

    const statsDocRef = doc(db, 'bookmarkCounts', encodeURIComponent(verseRef));
    const statsSnapshot = await getDoc(statsDocRef);
    if (statsSnapshot.exists()) {
      await setDoc(
        statsDocRef,
        {
          verseRef: verseRef,
          count: increment(-1),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    }
    return { action: 'removed', verseRef };
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
}

// Check if a verse is bookmarked by user
async function isVerseBookmarked(verseRef, userId) {
  if (!userId) {
    return false;
  }

  try {
    const bookmarkKey = `${userId}__${encodeURIComponent(verseRef)}`;
    const bookmarkDocRef = doc(db, 'bookmarks', bookmarkKey);
    const docSnap = await getDoc(bookmarkDocRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return false;
  }
}

// Get all bookmarks for a user
async function getUserBookmarks(userId) {
  if (!userId) {
    return [];
  }

  try {
    const bookmarksQuery = query(
      collection(db, 'bookmarks'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(bookmarksQuery);
    const bookmarks = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookmarks.push({
        id: doc.id,
        verseRef: data.verseRef,
        userId: data.userId,
        timestamp: data.timestamp,
        verseText: data.verseText || null
      });
    });

    // Sort by timestamp (newest first)
    bookmarks.sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return b.timestamp.toMillis() - a.timestamp.toMillis();
    });

    return bookmarks;
  } catch (error) {
    console.error('Error getting user bookmarks:', error);
    return [];
  }
}

// Get user bookmarks for specific verses (for UI state)
async function getUserBookmarksForVerses(userId, verseRefs) {
  const userBookmarks = {};

  if (!userId || !verseRefs || verseRefs.length === 0) {
    return userBookmarks;
  }

  try {
    const bookmarksQuery = query(
      collection(db, 'bookmarks'),
      where('userId', '==', userId),
      where('verseRef', 'in', verseRefs.slice(0, 30))
    );

    const querySnapshot = await getDocs(bookmarksQuery);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      userBookmarks[data.verseRef] = true;
    });

    return userBookmarks;
  } catch (error) {
    console.error('Error getting user bookmarks for verses:', error);
    return userBookmarks;
  }
}

// Send password reset email
async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
}

// ========================================
// USER TRACKING FUNCTIONS (Login & Online Status)
// ========================================

// Record user login time and update online status
async function recordUserLogin(userId, email) {
  if (!userId || !email) {
    console.error('Cannot record login: missing userId or email');
    return null;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const username = getDisplayNameFromEmail(email);

    const userData = {
      userId: userId,
      email: email,
      username: username,
      lastLogin: serverTimestamp(),
      isOnline: true,
      lastSeen: serverTimestamp()
    };

    await setDoc(userDocRef, userData, { merge: true });
    console.log(`User login recorded for ${email}`);
    return userData;
  } catch (error) {
    console.error('Error recording user login:', error);
    throw error;
  }
}

// Update user's online status (call this periodically while user is active)
async function updateUserPresence(userId) {
  if (!userId) {
    return null;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        isOnline: true,
        lastSeen: serverTimestamp()
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating user presence:', error);
  }
}

// Mark user as offline
async function markUserOffline(userId) {
  if (!userId) {
    return null;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        isOnline: false,
        lastSeen: serverTimestamp()
      },
      { merge: true }
    );
    console.log('User marked as offline');
  } catch (error) {
    console.error('Error marking user offline:', error);
  }
}

// Get all online users
async function getOnlineUsers() {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('isOnline', '==', true)
    );

    const querySnapshot = await getDocs(usersQuery);
    const onlineUsers = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      onlineUsers.push({
        userId: data.userId,
        email: data.email,
        username: data.username || getDisplayNameFromEmail(data.email),
        lastSeen: data.lastSeen
      });
    });

    return onlineUsers;
  } catch (error) {
    console.error('Error getting online users:', error);
    return [];
  }
}

// Get all users sorted by last login (most recent first)
async function getUsersSortedByLogin(limitCount = 10) {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('lastLogin', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(usersQuery);
    const users = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        userId: data.userId,
        email: data.email,
        username: data.username || getDisplayNameFromEmail(data.email),
        lastLogin: data.lastLogin,
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen
      });
    });

    return users;
  } catch (error) {
    console.error('Error getting users by login:', error);
    return [];
  }
}

// Get a specific user's info (for displaying their status)
async function getUserInfo(userId) {
  if (!userId) {
    return null;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        userId: data.userId,
        email: data.email,
        username: data.username || getDisplayNameFromEmail(data.email),
        lastLogin: data.lastLogin,
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

// Listen for online users in real-time
let onlineUsersUnsubscribe = null;

function listenForOnlineUsers(callback) {
  // Stop previous listener if exists
  if (onlineUsersUnsubscribe) {
    onlineUsersUnsubscribe();
    onlineUsersUnsubscribe = null;
  }

  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('isOnline', '==', true)
    );

    onlineUsersUnsubscribe = onSnapshot(usersQuery,
      (querySnapshot) => {
        const onlineUsers = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          onlineUsers.push({
            userId: data.userId,
            email: data.email,
            username: data.username || getDisplayNameFromEmail(data.email),
            lastSeen: data.lastSeen
          });
        });

        callback(onlineUsers);
      },
      (error) => {
        console.error('Error listening to online users:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error setting up online users listener:', error);
    callback([]);
  }
}

// Stop listening for online users
function stopListeningForOnlineUsers() {
  if (onlineUsersUnsubscribe) {
    onlineUsersUnsubscribe();
    onlineUsersUnsubscribe = null;
  }
}

// Format time difference for display (e.g., "10 minutes ago")
function formatTimeAgo(timestamp) {
  if (!timestamp) {
    return 'never';
  }

  const now = new Date();
  const loginTime = new Date(timestamp.toMillis ? timestamp.toMillis() : timestamp);
  const diffMs = now - loginTime;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return loginTime.toLocaleDateString();
  }
}

export {
  auth,
  db,
  initAuth,
  getCurrentUserId,
  getCurrentUserEmail,
  signInWithEmail,
  createAccountWithEmail,
  signOutUser,
  hideLoginModal,
  sendPasswordReset,
  submitComment,
  listenForComments,
  stopListeningForComments,
  submitReaction,
  getReactionCounts,
  getUserReactions,
  getReactionCountsForBook,
  getBookmarkCountsForBook,
  getBookmarkCountsForVerses,
  addBookmark,
  removeBookmark,
  isVerseBookmarked,
  getUserBookmarks,
  getUserBookmarksForVerses,
  recordUserLogin,
  updateUserPresence,
  markUserOffline,
  getOnlineUsers,
  getUsersSortedByLogin,
  getUserInfo,
  listenForOnlineUsers,
  stopListeningForOnlineUsers,
  formatTimeAgo
};
