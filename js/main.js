// Main Application Entry Point - QUERY FIX FOR COMMENT BADGES + GENERAL PARSHA CHAT
import { TORAH_PARSHAS } from './config.js';
import { fetchCurrentParsha, fetchParshaText, loadCommentaryData } from './api.js';
import { state, setState } from './state.js';
import { getDisplayNameFromEmail } from './name-utils.js';
import {
    showLoading,
    hideLoading,
    showError,
    hideError,
    updateParshaHeader,
    highlightCurrentParsha,
    updateNavigationButtons,
    populateParshaSelector,
    hideInfoPanel,
    showInfoPanel,
    showKeywordDefinition,
    showCommentary,
    openCommentsPanel,
    closeCommentsPanel,
    displayComments,
    updateCommentInputState,
    showCommentStatus,
    getSavedUsername,
    updateUsernameDisplay,
    setCurrentUserEmail,
    displayOnlineUsers,
    hideOnlineUsers,
    displayRecentLogins,
    hideRecentLogins,
    displayLastLogin,
    hideLastLogin
} from './ui.js';

import {
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
    db,
    submitReaction,
    getUserReactions,
    getReactionCountsForBook,
    getBookmarkCountsForBook,
    getBookmarkCountsForVerses,
    addBookmark,
    removeBookmark,
    isVerseBookmarked,
    getUserBookmarks,
    recordUserLogin,
    updateUserPresence,
    markUserOffline,
    listenForOnlineUsers,
    stopListeningForOnlineUsers,
    getUserInfo,
    getUsersSortedByLogin
} from './firebase.js';

import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let verseCommentCounts = {};
let verseReactionCounts = {};
let userReactions = {};
let isAuthReady = false;
let bookmarkedVerses = new Set();
let verseBookmarkCounts = {};
const verseDisplayTexts = {};

// User presence tracking
let lastUserId = null;
let presenceIntervalId = null;
const PRESENCE_UPDATE_INTERVAL = 30000; // Update every 30 seconds
let currentUserProfile = null;
const RECENT_LOGINS_REFRESH_INTERVAL = 60000;
let recentLoginsRefreshIntervalId = null;

function escapeForAttributeSelector(value) {
    if (typeof value !== 'string') {
        return '';
    }
    if (window.CSS && typeof window.CSS.escape === 'function') {
        return window.CSS.escape(value);
    }
    return value.replace(/["\\]/g, '\\$&');
}

function findVerseElement(verseRef) {
    if (!verseRef) {
        return null;
    }
    const escaped = escapeForAttributeSelector(verseRef);
    return document.querySelector(`[data-ref="${escaped}"]`);
}

function getVerseTextSnippet(verseRef) {
    if (!verseRef) {
        return '';
    }

    if (verseDisplayTexts[verseRef] && verseDisplayTexts[verseRef].english) {
        return verseDisplayTexts[verseRef].english;
    }

    const verseElement = findVerseElement(verseRef);
    if (verseElement) {
        const englishElement = verseElement.querySelector('.english-text');
        if (englishElement) {
            const text = englishElement.textContent.trim();
            verseDisplayTexts[verseRef] = { english: text };
            return text;
        }
    }

    return '';
}

function parseVerseReference(verseRef) {
    if (!verseRef || typeof verseRef !== 'string') {
        return null;
    }

    const match = verseRef.trim().match(/^([A-Za-z]+)\s+(\d+):(\d+)$/);
    if (!match) {
        return null;
    }

    return {
        bookName: match[1],
        chapter: parseInt(match[2], 10),
        verse: parseInt(match[3], 10)
    };
}

function isVerseWithinParshaRange(verseDetails, parshaRange) {
    if (!verseDetails || !parshaRange) {
        return false;
    }

    if (verseDetails.bookName !== parshaRange.bookName) {
        return false;
    }

    const startChapter = parshaRange.startChapter;
    const startVerse = parshaRange.startVerse;
    const endChapter = parshaRange.endChapter ?? parshaRange.startChapter;
    const endVerse = parshaRange.endVerse ?? parshaRange.startVerse;

    if (verseDetails.chapter < startChapter || verseDetails.chapter > endChapter) {
        return false;
    }

    if (verseDetails.chapter === startChapter && verseDetails.verse < startVerse) {
        return false;
    }

    if (verseDetails.chapter === endChapter && verseDetails.verse > endVerse) {
        return false;
    }

    return true;
}

function findParshaForVerse(verseRef) {
    const verseDetails = parseVerseReference(verseRef);
    if (!verseDetails || !Array.isArray(state.allParshas)) {
        return null;
    }

    for (const parsha of state.allParshas) {
        const range = parseParshaReference(parsha.reference);
        if (isVerseWithinParshaRange(verseDetails, range)) {
            return parsha;
        }
    }

    return state.allParshas.find((parsha) => parsha.reference.startsWith(`${verseDetails.bookName} `)) || null;
}

function highlightVerseAndScroll(verseRef, attempt = 0) {
    const target = findVerseElement(verseRef);
    if (!target) {
        if (attempt < 12) {
            setTimeout(() => highlightVerseAndScroll(verseRef, attempt + 1), 120);
        }
        return;
    }

    document.querySelectorAll('.bookmark-highlight').forEach((el) => {
        el.classList.remove('bookmark-highlight');
    });

    target.classList.add('bookmark-highlight');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
        target.classList.remove('bookmark-highlight');
    }, 2600);
}

async function init() {
    try {
        // Wait for the first authentication state result before continuing
        await new Promise((resolve) => {
            let initialResolved = false;
            initAuth(async (user) => {
                isAuthReady = true;
                await handleAuthStateChange(user);
                if (!initialResolved) {
                    initialResolved = true;
                    resolve();
                }
            });
        });
        
        const commentaryData = await loadCommentaryData();
        setState({ commentaryData });
        setState({ allParshas: TORAH_PARSHAS });
        
        const currentParshaName = await fetchCurrentParsha();
        
        if (currentParshaName) {
            const matchingParsha = TORAH_PARSHAS.find(p => 
                p.name.toLowerCase() === currentParshaName.toLowerCase() ||
                currentParshaName.toLowerCase().includes(p.name.toLowerCase())
            );
            
            if (matchingParsha) {
                setState({
                    currentParshaRef: matchingParsha.reference,
                    currentParshaIndex: TORAH_PARSHAS.indexOf(matchingParsha)
                });
            }
        }
        
        if (!state.currentParshaRef && TORAH_PARSHAS.length > 0) {
            setState({
                currentParshaRef: TORAH_PARSHAS[0].reference,
                currentParshaIndex: 0
            });
        }
        
        populateParshaSelector();
        updateNavigationButtons();
        setupEventListeners();
        
        if (state.currentParshaRef) {
            await loadParsha(state.currentParshaRef);
        }
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showError('Failed to initialize the application. Please refresh the page.');
    }
}

function setupEventListeners() {
    // Add change listener to ALL parsha selector elements (desktop and mobile)
    document.querySelectorAll('select#parsha-selector').forEach((selector) => {
        selector.addEventListener('change', async (e) => {
            const selectedRef = e.target.value;
            const index = state.allParshas.findIndex(p => p.reference === selectedRef);
            setState({ currentParshaIndex: index });
            await loadParsha(selectedRef);
            updateNavigationButtons();
            // Update the selected value in ALL select elements to keep them in sync
            document.querySelectorAll('select#parsha-selector').forEach((s) => {
                s.value = selectedRef;
            });
        });
    });
    
    document.getElementById('prev-parsha').addEventListener('click', async () => {
        if (state.currentParshaIndex > 0) {
            const newIndex = state.currentParshaIndex - 1;
            setState({ currentParshaIndex: newIndex });
            const prevParsha = state.allParshas[newIndex];
            // Update ALL select elements to keep them in sync
            document.querySelectorAll('select#parsha-selector').forEach((s) => {
                s.value = prevParsha.reference;
            });
            await loadParsha(prevParsha.reference);
            updateNavigationButtons();
        }
    });

    document.getElementById('next-parsha').addEventListener('click', async () => {
        if (state.currentParshaIndex < state.allParshas.length - 1) {
            const newIndex = state.currentParshaIndex + 1;
            setState({ currentParshaIndex: newIndex });
            const nextParsha = state.allParshas[newIndex];
            // Update ALL select elements to keep them in sync
            document.querySelectorAll('select#parsha-selector').forEach((s) => {
                s.value = nextParsha.reference;
            });
            await loadParsha(nextParsha.reference);
            updateNavigationButtons();
        }
    });
    
    const weeklyButton = document.getElementById('go-to-weekly');
    if (weeklyButton) {
        weeklyButton.addEventListener('click', async () => {
            if (state.currentParshaRef) {
                const index = state.allParshas.findIndex(p => p.reference === state.currentParshaRef);
                setState({ currentParshaIndex: index });
                // Update ALL select elements to keep them in sync
                document.querySelectorAll('select#parsha-selector').forEach((s) => {
                    s.value = state.currentParshaRef;
                });
                await loadParsha(state.currentParshaRef);
                updateNavigationButtons();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    const significanceButton = document.getElementById('show-significance');
    if (significanceButton) {
        significanceButton.addEventListener('click', openParshaSignificanceModal);
    }

    // Significance Button (Mobile)
    const significanceButtonMobile = document.getElementById('show-significance-mobile');
    if (significanceButtonMobile) {
        significanceButtonMobile.addEventListener('click', openParshaSignificanceModal);
    }

    // General Parsha Chat Button (Desktop)
    const parshaChatButton = document.getElementById('general-parsha-chat');
    if (parshaChatButton) {
        parshaChatButton.addEventListener('click', () => {
            const parshaRef = state.currentParshaRef || 'Genesis 1:1';
            const parshaName = state.allParshas[state.currentParshaIndex]?.name || 'Torah Portion';
            const generalChatRef = `PARSHA:${parshaRef}`;
            openCommentsPanel(generalChatRef, (ref) => {
                listenForComments(ref, displayComments);
            }, parshaName);
        });
    }

    // General Parsha Chat Button (Mobile)
    const parshaChatButtonMobile = document.getElementById('general-parsha-chat-mobile');
    if (parshaChatButtonMobile) {
        parshaChatButtonMobile.addEventListener('click', () => {
            const parshaRef = state.currentParshaRef || 'Genesis 1:1';
            const parshaName = state.allParshas[state.currentParshaIndex]?.name || 'Torah Portion';
            const generalChatRef = `PARSHA:${parshaRef}`;
            openCommentsPanel(generalChatRef, (ref) => {
                listenForComments(ref, displayComments);
            }, parshaName);
        });
    }
    
    document.getElementById('close-panel-button').addEventListener('click', hideInfoPanel);
    
    document.getElementById('info-panel').addEventListener('click', (e) => {
        if (e.target.id === 'info-panel') {
            hideInfoPanel();
        }
    });
    
    document.getElementById('parsha-text').addEventListener('click', handleTextClick);
    
    setupCommentPanelListeners();
    setupLoginListeners();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideInfoPanel();
            closeCommentsPanel(stopListeningForComments);
        }
        
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'TEXTAREA') {
            if (e.key === 'ArrowLeft' && state.currentParshaIndex > 0) {
                document.getElementById('prev-parsha').click();
            } else if (e.key === 'ArrowRight' && state.currentParshaIndex < state.allParshas.length - 1) {
                document.getElementById('next-parsha').click();
            }
        }
    });
}

function setupCommentPanelListeners() {
    document.getElementById('close-comment-panel').addEventListener('click', () => {
        closeCommentsPanel(stopListeningForComments);
    });
    
    document.getElementById('comment-overlay').addEventListener('click', () => {
        closeCommentsPanel(stopListeningForComments);
    });
    
    document.getElementById('submit-comment-btn').addEventListener('click', handleCommentSubmit);
    
    document.getElementById('comment-input').addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaCmd) && e.key === 'Enter') {
            handleCommentSubmit();
        }
    });
}

function setupLoginListeners() {
    const loginBtn = document.getElementById('login-btn');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');
    const myBookmarksBtn = document.getElementById('my-bookmarks-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Password reset modal elements
    const forgotPasswordBtn = document.getElementById('forgot-password-btn');
    const resetPasswordModal = document.getElementById('reset-password-modal');
    const resetEmail = document.getElementById('reset-email');
    const sendResetBtn = document.getElementById('send-reset-btn');
    const backToLoginBtn = document.getElementById('back-to-login-btn');
    const resetError = document.getElementById('reset-error');
    const resetSuccess = document.getElementById('reset-success');

    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const email = loginEmail.value.trim();
            const password = loginPassword.value.trim();

            if (!email || !password) {
                showLoginError(loginError, 'Please enter email and password');
                return;
            }

            try {
                loginBtn.disabled = true;
                loginBtn.textContent = 'Signing In...';

                await signInWithEmail(email, password);
                hideLoginModal();
                loginEmail.value = '';
                loginPassword.value = '';
                loginError.classList.add('hidden');
            } catch (error) {
                console.error('Sign-in error:', error);
                let errorMessage = 'Sign-in failed. Check your credentials.';
                if (error.code === 'auth/user-not-found') {
                    errorMessage = 'No account found with this email. Click "Create Account" to sign up.';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Incorrect password. Please try again.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Please enter a valid email address.';
                }
                showLoginError(loginError, errorMessage);
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Sign In';
            }
        });

        // Enter key to sign in
        [loginEmail, loginPassword].forEach(field => {
            field.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    loginBtn.click();
                }
            });
        });
    }

    // Forgot Password Button
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', () => {
            // Reset the password reset form
            resetEmail.value = '';
            resetError.classList.add('hidden');
            resetSuccess.classList.add('hidden');
            resetPasswordModal.classList.remove('hidden');
        });
    }

    // Send Reset Email Button
    if (sendResetBtn) {
        sendResetBtn.addEventListener('click', async () => {
            const email = resetEmail.value.trim();

            if (!email) {
                resetError.textContent = 'Please enter your email address';
                resetError.classList.remove('hidden');
                resetSuccess.classList.add('hidden');
                return;
            }

            try {
                sendResetBtn.disabled = true;
                sendResetBtn.textContent = 'Sending...';

                const result = await sendPasswordReset(email);

                if (result.success) {
                    resetSuccess.textContent = 'Password reset email sent! Check your inbox.';
                    resetSuccess.classList.remove('hidden');
                    resetError.classList.add('hidden');
                    resetEmail.value = '';
                } else {
                    resetError.textContent = result.error || 'Failed to send reset email';
                    resetError.classList.remove('hidden');
                    resetSuccess.classList.add('hidden');
                }
            } catch (error) {
                console.error('Error sending password reset:', error);
                resetError.textContent = 'Error sending reset email. Please try again.';
                resetError.classList.remove('hidden');
                resetSuccess.classList.add('hidden');
            } finally {
                sendResetBtn.disabled = false;
                sendResetBtn.textContent = 'Send Reset Email';
            }
        });
    }

    // Back to Login Button
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            resetPasswordModal.classList.add('hidden');
            resetEmail.value = '';
            resetError.classList.add('hidden');
            resetSuccess.classList.add('hidden');
        });
    }

    // Enter key to send reset email
    if (resetEmail) {
        resetEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && sendResetBtn) {
                sendResetBtn.click();
            }
        });
    }

    if (myBookmarksBtn) {
        myBookmarksBtn.addEventListener('click', openBookmarksPanel);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOutUser();
                closeCommentsPanel(stopListeningForComments);
                hideInfoPanel();
            } catch (error) {
                console.error('Sign-out error:', error);
            }
        });
    }
}

function showLoginError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
}

async function handleCommentSubmit() {
    const commentInput = document.getElementById('comment-input');
    const verseRefInput = document.getElementById('current-comment-verse-ref');
    const submitButton = document.getElementById('submit-comment-btn');

    const text = commentInput.value.trim();
    const verseRef = verseRefInput.value;
    const userId = getCurrentUserId();
    const username = getSavedUsername();

    if (!userId) {
        showCommentStatus('Please wait, connecting...', true);
        return;
    }

    if (!username) {
        showCommentStatus('Please set your name first', true);
        document.getElementById('username-setup').classList.remove('hidden');
        return;
    }

    if (!text) {
        showCommentStatus('Please enter a comment', true);
        return;
    }

    if (!verseRef) {
        showCommentStatus('Error: No verse selected', true);
        return;
    }

    submitButton.disabled = true;
    commentInput.disabled = true;
    showCommentStatus('Submitting...', false);

    try {
        await submitComment(verseRef, text, userId, username);
        commentInput.value = '';
        showCommentStatus('Comment added!', false);

        await updateCommentCount(verseRef);

    } catch (error) {
        console.error('Error submitting comment:', error);
        showCommentStatus('Error submitting comment. Please try again.', true);
    } finally {
        submitButton.disabled = false;
        commentInput.disabled = false;
    }
}

async function loadCommentCounts(parshaRef) {
    if (!isAuthReady) {
        return;
    }
    
    const { bookName, startChapter, startVerse, endChapter, endVerse } = parseParshaReference(parshaRef);
    
    // Query full book range (lexicographic safe) and filter to parsha client-side
    const startRef = `${bookName} `;
    const endRef = `${bookName}~`;
    
    try {
        const commentsQuery = query(
            collection(db, 'comments'),
            where('verseRef', '>=', startRef),
            where('verseRef', '<=', endRef)
        );
        const querySnapshot = await getDocs(commentsQuery);
        const counts = {};
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const verseRef = data.verseRef;
            
            // Additional client-side filtering to ensure verse is in our exact range
            const match = verseRef.match(/^(\w+)\s+(\d+):(\d+)$/);
            if (match) {
                const [, book, chapter, verse] = match;
                const chapterNum = parseInt(chapter);
                const verseNum = parseInt(verse);
                
                // Check if this verse is within our parsha range
                if (book === bookName) {
                    let isInRange = false;
                    
                    if (!endChapter) {
                        // Single chapter parsha
                        isInRange = chapterNum === startChapter;
                    } else {
                        // Multi-chapter parsha
                        if (chapterNum > startChapter && chapterNum < endChapter) {
                            // Middle chapters - include all verses
                            isInRange = true;
                        } else if (chapterNum === startChapter && verseNum >= startVerse) {
                            // First chapter - only verses >= startVerse
                            isInRange = true;
                        } else if (chapterNum === endChapter && verseNum <= endVerse) {
                            // Last chapter - only verses <= endVerse
                            isInRange = true;
                        }
                    }
                    
                    if (isInRange) {
                        counts[verseRef] = (counts[verseRef] || 0) + 1;
                    }
                }
            }
        });
        
        verseCommentCounts = counts;
        
        // Use requestAnimationFrame for better DOM sync
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                updateAllCommentBadges();
            });
        });
        
    } catch (error) {
        console.error('❌ Error loading comment counts:', error);
        console.error('❌ Error details:', error.message);
        if (error.code) {
            console.error('❌ Error code:', error.code);
        }
    }
}

async function updateCommentCount(verseRef) {
    try {
        const commentsQuery = query(
            collection(db, 'comments'),
            where('verseRef', '==', verseRef)
        );

        const querySnapshot = await getDocs(commentsQuery);
        verseCommentCounts[verseRef] = querySnapshot.size;

        const verseContainer = document.querySelector(`[data-ref="${verseRef}"]`);
        if (verseContainer) {
            updateCommentBadge(verseContainer, verseRef);
        }

    } catch (error) {
        console.error('Error updating comment count:', error);
    }
}

// ========================================
// BOOKMARK COUNTING FUNCTIONS
// ========================================

async function loadBookmarkCounts(parshaRef) {
    const { bookName } = parseParshaReference(parshaRef);

    try {
        const counts = await getBookmarkCountsForBook(bookName);

        // Remove stale counts for this book before merging
        Object.keys(verseBookmarkCounts).forEach((ref) => {
            if (ref.startsWith(`${bookName} `)) {
                delete verseBookmarkCounts[ref];
            }
        });

        Object.entries(counts).forEach(([ref, value]) => {
            verseBookmarkCounts[ref] = Math.max(0, value || 0);
        });

        applyBookmarkStateToVisibleVerses();
    } catch (error) {
        console.error('Error loading bookmark counts:', error);
    }
}

// ========================================
// REACTION FUNCTIONS
// ========================================

async function loadReactionCounts(parshaRef) {
    if (!isAuthReady) {
        return;
    }

    const { bookName } = parseParshaReference(parshaRef);

    try {
        // Load all reaction counts for this book
        verseReactionCounts = await getReactionCountsForBook(bookName);

        // Load current user's reactions
        const userId = getCurrentUserId();
        if (userId) {
            const allVerseRefs = Object.keys(verseReactionCounts);

            // Process in batches of 30 (Firestore 'in' query limit)
            for (let i = 0; i < allVerseRefs.length; i += 30) {
                const batch = allVerseRefs.slice(i, i + 30);
                const batchUserReactions = await getUserReactions(userId, batch);
                userReactions = { ...userReactions, ...batchUserReactions };
            }
        }

        // Update all verse UI with reactions
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                updateAllReactionUI();
            });
        });

    } catch (error) {
        console.error('Error loading reaction counts:', error);
    }
}

async function handleReactionClick(verseRef, reactionType) {
    const userId = getCurrentUserId();

    if (!userId) {
        alert('Please wait, connecting...');
        return;
    }

    try {
        const result = await submitReaction(verseRef, reactionType, userId);

        // Update local state
        if (!verseReactionCounts[verseRef]) {
            verseReactionCounts[verseRef] = { emphasize: 0, heart: 0 };
        }

        if (!userReactions[verseRef]) {
            userReactions[verseRef] = [];
        }

        if (result.action === 'added') {
            verseReactionCounts[verseRef][reactionType]++;
            userReactions[verseRef].push(reactionType);
        } else {
            verseReactionCounts[verseRef][reactionType] = Math.max(0, verseReactionCounts[verseRef][reactionType] - 1);
            userReactions[verseRef] = userReactions[verseRef].filter(r => r !== reactionType);
        }

        // Update UI for this verse
        const verseContainer = document.querySelector(`[data-ref="${verseRef}"]`);
        if (verseContainer) {
            updateVerseReactionUI(verseContainer, verseRef);
        }

    } catch (error) {
        console.error('Error submitting reaction:', error);
        alert('Error submitting reaction. Please try again.');
    }
}

async function handleAuthStateChange(user) {
    updateCommentInputState(Boolean(user));

    if (user) {
        // Set the user's email so display name can be extracted from it
        setCurrentUserEmail(user.email);
        updateUsernameDisplay();
        await refreshBookmarkedVerses();

        let userProfile = null;

        // Record user login activity
        try {
            await recordUserLogin(user.uid, user.email);
        } catch (error) {
            console.error('Error recording login:', error);
        }

        // Fetch the latest user profile (captures Firestore timestamps)
        try {
            userProfile = await getUserInfo(user.uid);
        } catch (error) {
            console.error('Error loading user profile:', error);
        }

        currentUserProfile = userProfile;

        // Reflect latest login status in UI
        updateCurrentUserStatusDisplay(userProfile, user.email);

        // Set up presence tracking
        startPresenceTracking(user.uid);

        // Re-fetch shortly after login so server timestamps resolve
        setTimeout(() => {
            refreshCurrentUserProfile();
        }, 2000);

        startRecentLoginsPolling();
    } else {
        setCurrentUserEmail(null);
        updateUsernameDisplay();
        bookmarkedVerses.clear();
        clearBookmarkUIState();
        currentUserProfile = null;

        // Mark user as offline
        if (lastUserId) {
            try {
                await markUserOffline(lastUserId);
            } catch (error) {
                console.error('Error marking offline:', error);
            }
        }

        // Stop presence tracking
        stopPresenceTracking();
    }
}

async function refreshBookmarkedVerses(options = {}) {
    const userId = getCurrentUserId();

    if (!userId) {
        bookmarkedVerses.clear();
        clearBookmarkUIState();
        return options.returnList ? [] : undefined;
    }

    try {
        const bookmarks = await getUserBookmarks(userId);
        bookmarkedVerses = new Set(bookmarks.map((bookmark) => bookmark.verseRef));

        bookmarks.forEach((bookmark) => {
            if (bookmark.verseText && (!verseDisplayTexts[bookmark.verseRef] || !verseDisplayTexts[bookmark.verseRef].english)) {
                verseDisplayTexts[bookmark.verseRef] = {
                    english: bookmark.verseText
                };
            }
        });

        if (bookmarks.length > 0) {
            const uniqueRefs = Array.from(new Set(bookmarks.map((bookmark) => bookmark.verseRef)));
            const bookmarkCounts = await getBookmarkCountsForVerses(uniqueRefs);
            Object.entries(bookmarkCounts).forEach(([ref, value]) => {
                verseBookmarkCounts[ref] = Math.max(0, value || 0);
            });
        }

        applyBookmarkStateToVisibleVerses();
        return options.returnList ? bookmarks : undefined;
    } catch (error) {
        console.error('Error refreshing bookmarks:', error);
        if (options.returnList) {
            throw error;
        }
        return undefined;
    }
}

function applyBookmarkStateToVisibleVerses() {
    const buttons = document.querySelectorAll('.bookmark-btn');
    buttons.forEach((btn) => {
        const verseRef = btn.getAttribute('data-verse-ref');
        const isActive = verseRef && bookmarkedVerses.has(verseRef);
        const baseCount = verseRef ? (verseBookmarkCounts[verseRef] || 0) : 0;
        const displayCount = Math.max(baseCount, isActive ? 1 : 0);
        btn.classList.toggle('active', Boolean(isActive));
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        const countSpan = btn.querySelector('.bookmark-count');
        if (countSpan) {
            countSpan.textContent = displayCount > 0 ? displayCount : '';
            countSpan.style.display = displayCount > 0 ? 'inline-flex' : 'none';
        }
        if (verseRef) {
            const countText = displayCount > 0
                ? `${displayCount} ${displayCount === 1 ? 'person has' : 'people have'} bookmarked this verse`
                : 'No bookmarks yet';
            btn.setAttribute(
                'title',
                isActive ? `Remove bookmark • ${countText}` : `Bookmark this verse • ${countText}`
            );
            btn.setAttribute(
                'aria-label',
                `${isActive ? 'Remove your bookmark.' : 'Bookmark this verse.'} ${countText}.`
            );
        }
    });
}

function clearBookmarkUIState() {
    applyBookmarkStateToVisibleVerses();
}

async function handleBookmarkClick(verseRef, bookmarkBtn) {
    const userId = getCurrentUserId();

    if (!userId) {
        alert('Please sign in to bookmark verses');
        return;
    }

    try {
        const isBookmarked = bookmarkedVerses.has(verseRef)
            ? true
            : await isVerseBookmarked(verseRef, userId);

        if (isBookmarked) {
            // Remove bookmark
            await removeBookmark(verseRef, userId);
            bookmarkBtn.classList.remove('active');
            bookmarkBtn.setAttribute('aria-pressed', 'false');
            bookmarkedVerses.delete(verseRef);
            if (verseBookmarkCounts[verseRef]) {
                verseBookmarkCounts[verseRef] = Math.max(0, verseBookmarkCounts[verseRef] - 1);
            }
        } else {
            // Add bookmark
            const verseText = getVerseTextSnippet(verseRef);
            await addBookmark(verseRef, userId, { verseText });
            bookmarkBtn.classList.add('active');
            bookmarkBtn.setAttribute('aria-pressed', 'true');
            bookmarkedVerses.add(verseRef);
            verseBookmarkCounts[verseRef] = (verseBookmarkCounts[verseRef] || 0) + 1;
        }

        // Ensure all instances stay in sync (e.g., if verse appears twice)
        applyBookmarkStateToVisibleVerses();

    } catch (error) {
        console.error('Error toggling bookmark:', error);
        alert('Error saving bookmark. Please try again.');
    }
}

function updateAllReactionUI() {
    const containers = document.querySelectorAll('.verse-container');

    containers.forEach(container => {
        const verseRef = container.dataset.ref;
        if (verseRef) {
            updateVerseReactionUI(container, verseRef);
        }
    });
}

function updateVerseReactionUI(container, verseRef) {
    if (!container) return;

    const counts = verseReactionCounts[verseRef] || { emphasize: 0, heart: 0 };
    const userReacted = userReactions[verseRef] || [];

    // Update data attributes for CSS styling
    container.setAttribute('data-emphasize', counts.emphasize);
    container.setAttribute('data-heart', counts.heart);

    // Update button states and counts
    const emphasizeBtn = container.querySelector('.emphasize-btn');
    const heartBtn = container.querySelector('.heart-btn');

    if (emphasizeBtn) {
        const countSpan = emphasizeBtn.querySelector('.reaction-count');
        if (countSpan) {
            countSpan.textContent = counts.emphasize || '';
        }

        if (userReacted.includes('emphasize')) {
            emphasizeBtn.classList.add('active');
        } else {
            emphasizeBtn.classList.remove('active');
        }
    }

    if (heartBtn) {
        const countSpan = heartBtn.querySelector('.reaction-count');
        if (countSpan) {
            countSpan.textContent = counts.heart || '';
        }

        if (userReacted.includes('heart')) {
            heartBtn.classList.add('active');
        } else {
            heartBtn.classList.remove('active');
        }
    }
}

function updateCommentBadge(container, verseRef) {
    if (!container) {
        return;
    }
    
    const indicatorsSection = container.querySelector('.verse-indicators');
    if (!indicatorsSection) {
        return;
    }
    
    const count = verseCommentCounts[verseRef] || 0;
    let badge = indicatorsSection.querySelector('.comment-count-badge');
    
    if (!badge) {
        badge = document.createElement('div');
        badge.className = 'comment-count-badge';
        badge.dataset.verseRef = verseRef;
        indicatorsSection.appendChild(badge);
    }
    
    if (count > 0) {
        badge.textContent = `${count} ${count === 1 ? 'comment' : 'comments'}`;
        badge.style.display = 'inline-flex';
        badge.style.visibility = 'visible';
        badge.style.opacity = '1';
    } else {
        badge.style.display = 'none';
    }
}

function updateAllCommentBadges() {
    const containers = document.querySelectorAll('.verse-container');
    
    let visibleCount = 0;
    containers.forEach(container => {
        const verseRef = container.dataset.ref;
        if (verseRef) {
            updateCommentBadge(container, verseRef);
            if (verseCommentCounts[verseRef] > 0) {
                visibleCount++;
            }
        }
    });
}

async function loadParsha(parshaRef) {
    showLoading();
    hideError();

    try {
        const data = await fetchParshaText(parshaRef);

        renderParsha(data, parshaRef);
        highlightCurrentParsha(parshaRef);

        // Load both comments and reactions
        await Promise.all([
            loadCommentCounts(parshaRef),
            loadReactionCounts(parshaRef),
            loadBookmarkCounts(parshaRef)
        ]);

        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error('❌ Error loading parsha:', error);
        showError('Failed to load the Torah text. Please try again later.');
    } finally {
        hideLoading();
    }
}

function parseParshaReference(parshaRef) {
    const match = parshaRef.match(/^(\w+)\s+(\d+):(\d+)(?:-(\d+):(\d+))?$/);

    if (!match) {
        const simpleMatch = parshaRef.match(/^(\w+)\s+(\d+):(\d+)$/);
        if (simpleMatch) {
            return {
                bookName: simpleMatch[1],
                startChapter: parseInt(simpleMatch[2]),
                startVerse: parseInt(simpleMatch[3]),
                endChapter: null,
                endVerse: null
            };
        }
        return { bookName: 'Torah', startChapter: 1, startVerse: 1, endChapter: null, endVerse: null };
    }
    
    return {
        bookName: match[1],
        startChapter: parseInt(match[2]),
        startVerse: parseInt(match[3]),
        endChapter: match[4] ? parseInt(match[4]) : null,
        endVerse: match[5] ? parseInt(match[5]) : null
    };
}

function openParshaSignificanceModal() {
    const significance = state.currentParshaSignificance;
    if (!significance) return;

    const parshaName = state.currentParshaSignificanceName || state.allParshas[state.currentParshaIndex]?.name || 'Torah Portion';
    const infoContent = document.getElementById('info-content');
    infoContent.innerHTML = `
        <div class="text-xl font-bold mb-3 text-blue-900">${escapeHtml(parshaName)} — Significance</div>
        <div class="text-gray-800 leading-relaxed">${formatText(significance)}</div>
    `;
    showInfoPanel();
}

function renderParsha(data, parshaRef) {
    const textContainer = document.getElementById('parsha-text');
    
    updateParshaHeader(data.book || 'Torah Portion', parshaRef);
    textContainer.innerHTML = '';

    let significanceText = null;
    let significanceParshaName = null;
    try {
        const currentParsha = state.allParshas.find(p => p.reference === parshaRef);
        if (currentParsha && state.commentaryData && Array.isArray(state.commentaryData.parshas)) {
            const parshaEntry = state.commentaryData.parshas.find(p => p.name === currentParsha.name);
            if (parshaEntry && parshaEntry.significance) {
                significanceText = parshaEntry.significance;
                significanceParshaName = currentParsha.name;
                // Significance will only display in modal when button is clicked
            }
        }
    } catch (e) {
        console.warn('Unable to render significance for parsha:', e);
    }

    setState({
        currentParshaSignificance: significanceText,
        currentParshaSignificanceName: significanceParshaName
    });

    // Update both desktop and mobile significance buttons
    const significanceButton = document.getElementById('show-significance');
    if (significanceButton) {
        const enabled = Boolean(significanceText);
        significanceButton.disabled = !enabled;
        significanceButton.classList.toggle('opacity-40', !enabled);
        significanceButton.classList.toggle('cursor-not-allowed', !enabled);
        significanceButton.classList.toggle('pointer-events-none', !enabled);
    }

    const significanceButtonMobile = document.getElementById('show-significance-mobile');
    if (significanceButtonMobile) {
        const enabled = Boolean(significanceText);
        significanceButtonMobile.disabled = !enabled;
        significanceButtonMobile.classList.toggle('opacity-40', !enabled);
        significanceButtonMobile.classList.toggle('cursor-not-allowed', !enabled);
        significanceButtonMobile.classList.toggle('pointer-events-none', !enabled);
    }
    
    const englishText = Array.isArray(data.text) ? data.text : [data.text];
    const hebrewText = Array.isArray(data.he) ? data.he : [data.he];
    
    const { bookName, startChapter, startVerse, endChapter, endVerse } = parseParshaReference(parshaRef);
    
    if (Array.isArray(englishText[0])) {
        let currentChapterNumber = startChapter;
        let isFirstChapter = true;
        
        englishText.forEach((chapterVerses, chapterIndex) => {
            if (!Array.isArray(chapterVerses)) {
                chapterVerses = [chapterVerses];
            }
            
            const hebrewChapterVerses = Array.isArray(hebrewText[chapterIndex]) ? 
                hebrewText[chapterIndex] : [hebrewText[chapterIndex] || ''];
            
            const isStartChapter = currentChapterNumber === startChapter;
            const isEndChapter = endChapter ? currentChapterNumber === endChapter : false;
            const chapterStartVerse = isStartChapter ? startVerse : 1;
            const chapterEndVerse = isEndChapter ? endVerse : null;
            
            if (!isFirstChapter) {
                const chapterHeader = document.createElement('div');
                chapterHeader.className = 'chapter-header';
                chapterHeader.textContent = `${bookName} Chapter ${currentChapterNumber}`;
                textContainer.appendChild(chapterHeader);
            }
            isFirstChapter = false;
            
            for (let localIndex = 0; localIndex < chapterVerses.length; localIndex++) {
                const verseText = chapterVerses[localIndex];
                if (!verseText || verseText.trim() === '') continue;
                
                const verseNumber = chapterStartVerse + localIndex;
                
                if (chapterEndVerse && verseNumber > chapterEndVerse) {
                    break;
                }
                
                const hebrewVerseText = hebrewChapterVerses[localIndex] || '';
                const verseRef = `${bookName} ${currentChapterNumber}:${verseNumber}`;
                
                const verseElement = createVerseElement(verseText, hebrewVerseText, verseRef, verseNumber);
                textContainer.appendChild(verseElement);
            }
            
            currentChapterNumber++;
        });
    } else {
        const flatEnglish = flattenTextArray(englishText);
        const flatHebrew = flattenTextArray(hebrewText);
        
        flatEnglish.forEach((verseText, index) => {
            if (!verseText || verseText.trim() === '') return;
            
            const hebrewVerseText = flatHebrew[index] || '';
            const verseNumber = startVerse + index;
            const verseRef = `${bookName} ${startChapter}:${verseNumber}`;
            
            const verseElement = createVerseElement(verseText, hebrewVerseText, verseRef, verseNumber);
            textContainer.appendChild(verseElement);
        });
    }

    applyBookmarkStateToVisibleVerses();
}

function createVerseElement(englishText, hebrewText, verseRef, verseNumber) {
    const container = document.createElement('div');
    container.className = 'verse-container';
    container.dataset.ref = verseRef;
    
    const hasCommentary = checkForCommentary(verseRef);
    const hasKeywords = checkForKeywords(verseRef);
    
    if (hasCommentary || hasKeywords) {
        container.classList.add('has-content');
        if (hasCommentary) container.classList.add('has-commentary');
        if (hasKeywords) container.classList.add('has-keywords');
    }
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'verse-content-wrapper';
    
    const verseNumSpan = document.createElement('div');
    verseNumSpan.className = 'verse-number';
    verseNumSpan.textContent = verseNumber;
    contentWrapper.appendChild(verseNumSpan);
    
    const textContainer = document.createElement('div');
    textContainer.className = 'verse-text-container';
    
    const hebrewDiv = document.createElement('div');
    hebrewDiv.className = 'hebrew-text';
    hebrewDiv.setAttribute('lang', 'he');
    hebrewDiv.setAttribute('dir', 'rtl');
    hebrewDiv.innerHTML = hebrewText;
    
    const englishDiv = document.createElement('div');
    englishDiv.className = 'english-text';
    const cleanedEnglish = cleanSefariaAnnotationsFromText(englishText);
    const processedEnglish = processKeywords(cleanedEnglish, verseRef);
    englishDiv.innerHTML = processedEnglish;
    verseDisplayTexts[verseRef] = {
        english: cleanedEnglish.trim()
    };
    
    textContainer.appendChild(hebrewDiv);
    textContainer.appendChild(englishDiv);
    contentWrapper.appendChild(textContainer);
    
    container.appendChild(contentWrapper);
    
    const indicatorsSection = document.createElement('div');
    indicatorsSection.className = 'verse-indicators';
    
    if (hasCommentary) {
        const commentaryIndicator = document.createElement('div');
        commentaryIndicator.className = 'content-indicator commentary-indicator';
        commentaryIndicator.textContent = 'Commentary Available';
        commentaryIndicator.title = 'Click to view commentary';
        indicatorsSection.appendChild(commentaryIndicator);
    }
    
    if (hasKeywords) {
        const keywordIndicator = document.createElement('div');
        keywordIndicator.className = 'content-indicator keyword-indicator';
        keywordIndicator.textContent = 'Definitions Available';
        keywordIndicator.title = 'Click highlighted words for definitions';
        indicatorsSection.appendChild(keywordIndicator);
    }
    
    // Create badge element (will be updated by loadCommentCounts)
    const commentBadge = document.createElement('div');
    commentBadge.className = 'comment-count-badge';
    commentBadge.style.display = 'none';
    commentBadge.dataset.verseRef = verseRef;
    indicatorsSection.appendChild(commentBadge);

    container.appendChild(indicatorsSection);

    // Add reaction buttons section
    const reactionsSection = document.createElement('div');
    reactionsSection.className = 'verse-reactions';

    // Emphasize button
    const emphasizeBtn = document.createElement('button');
    emphasizeBtn.className = 'reaction-btn emphasize-btn';
    emphasizeBtn.setAttribute('aria-label', 'Emphasize this verse');
    emphasizeBtn.innerHTML = `
        <span class="reaction-icon emphasize-icon"></span>
        <span class="reaction-count"></span>
    `;
    emphasizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleReactionClick(verseRef, 'emphasize');
    });

    // Heart button
    const heartBtn = document.createElement('button');
    heartBtn.className = 'reaction-btn heart-btn';
    heartBtn.setAttribute('aria-label', 'Heart this verse');
    heartBtn.innerHTML = `
        <span class="reaction-icon heart-icon"></span>
        <span class="reaction-count"></span>
    `;
    heartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleReactionClick(verseRef, 'heart');
    });

    // Bookmark button
    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.type = 'button';
    bookmarkBtn.className = 'reaction-btn bookmark-btn';
    bookmarkBtn.setAttribute('aria-label', 'Bookmark this verse');
    bookmarkBtn.setAttribute('data-verse-ref', verseRef);
    bookmarkBtn.setAttribute('aria-pressed', 'false');
    bookmarkBtn.setAttribute('title', 'Bookmark this verse');
    bookmarkBtn.innerHTML = `
        <svg class="bookmark-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" fill="currentColor"></path>
        </svg>
        <span class="bookmark-count"></span>
    `;
    bookmarkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleBookmarkClick(verseRef, bookmarkBtn);
    });

    reactionsSection.appendChild(emphasizeBtn);
    reactionsSection.appendChild(heartBtn);
    reactionsSection.appendChild(bookmarkBtn);
    container.appendChild(reactionsSection);

    // Store bookmark button reference for later updates
    container.dataset.bookmarkBtn = true;

    return container;
}

function cleanSefariaAnnotationsFromText(text) {
    if (!text || typeof text !== 'string') return text;
    
    let cleaned = text;
    
    const temp = document.createElement('textarea');
    temp.innerHTML = cleaned;
    cleaned = temp.value;
    
    cleaned = cleaned.replace(/<[^>]+>/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
}

function checkForKeywords(verseRef) {
    if (!state.commentaryData || !state.commentaryData.parshas) return false;
    
    for (const parsha of state.commentaryData.parshas) {
        if (parsha.verses) {
            const verse = parsha.verses.find(v => v.ref === verseRef);
            if (verse && verse.keywords && verse.keywords.length > 0) {
                return true;
            }
        }
    }
    return false;
}

function flattenTextArray(arr) {
    const result = [];
    arr.forEach(item => {
        if (Array.isArray(item)) {
            result.push(...item);
        } else {
            result.push(item);
        }
    });
    return result;
}

function checkForCommentary(verseRef) {
    if (!state.commentaryData || !state.commentaryData.parshas) return false;
    
    for (const parsha of state.commentaryData.parshas) {
        if (parsha.verses) {
            const verse = parsha.verses.find(v => v.ref === verseRef);
            if (verse && verse.commentary && verse.commentary.length > 0) {
                return true;
            }
        }
    }
    return false;
}

function processKeywords(text, verseRef) {
    if (!state.commentaryData || !state.commentaryData.parshas) return text;
    
    let keywords = [];
    for (const parsha of state.commentaryData.parshas) {
        if (parsha.verses) {
            const verse = parsha.verses.find(v => v.ref === verseRef);
            if (verse && verse.keywords) {
                keywords = verse.keywords;
                break;
            }
        }
    }
    
    if (keywords.length === 0) return text;
    
    let processedText = text;
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${escapeRegex(keyword.word)})\\b`, 'gi');
        processedText = processedText.replace(regex, 
            `<span class="keyword" data-definition="${escapeHtml(keyword.definition)}">$1</span>`
        );
    });
    
    return processedText;
}

function handleTextClick(e) {
    if (e.target.classList.contains('keyword')) {
        e.stopPropagation();
        e.preventDefault();
        const definition = e.target.dataset.definition;
        const word = e.target.textContent;
        showKeywordDefinition(word, definition);
        return;
    }
    
    if (e.target.closest('.keyword-indicator')) {
        e.stopPropagation();
        const verseContainer = e.target.closest('.verse-container');
        if (verseContainer) {
            const verseRef = verseContainer.dataset.ref;
            const keywords = getKeywordsForVerse(verseRef);
            showAllDefinitions(verseRef, keywords);
        }
        return;
    }
    
    if (e.target.closest('.commentary-indicator')) {
        e.stopPropagation();
        const verseContainer = e.target.closest('.verse-container');
        if (verseContainer) {
            const verseRef = verseContainer.dataset.ref;
            const commentaries = getCommentariesForVerse(verseRef);
            showCommentary(verseRef, commentaries);
        }
        return;
    }
    
    if (e.target.closest('.comment-count-badge')) {
        e.stopPropagation();
        const verseContainer = e.target.closest('.verse-container');
        if (verseContainer) {
            const verseRef = verseContainer.dataset.ref;
            openCommentsPanel(verseRef, (ref) => {
                listenForComments(ref, displayComments);
            });
        }
        return;
    }

    if (e.target.classList.contains('verse-indicators')) {
        return;
    }

    const verseContainer = e.target.closest('.verse-container');
    if (verseContainer && !e.target.closest('.verse-indicators')) {
        const verseRef = verseContainer.dataset.ref;
        openCommentsPanel(verseRef, (ref) => {
            listenForComments(ref, displayComments);
        });
    }
}

function getCommentariesForVerse(verseRef) {
    if (!state.commentaryData || !state.commentaryData.parshas) return [];
    
    for (const parsha of state.commentaryData.parshas) {
        if (parsha.verses) {
            const verse = parsha.verses.find(v => v.ref === verseRef);
            if (verse && verse.commentary) {
                return verse.commentary;
            }
        }
    }
    return [];
}

function getKeywordsForVerse(verseRef) {
    if (!state.commentaryData || !state.commentaryData.parshas) return [];
    
    for (const parsha of state.commentaryData.parshas) {
        if (parsha.verses) {
            const verse = parsha.verses.find(v => v.ref === verseRef);
            if (verse && verse.keywords) {
                return verse.keywords;
            }
        }
    }
    return [];
}

function showAllDefinitions(verseRef, keywords) {
    if (!keywords || keywords.length === 0) return;
    
    const infoContent = document.getElementById('info-content');
    let html = `<h4 class="text-lg font-bold mb-4 text-blue-900 border-b-2 border-blue-200 pb-2">Definitions for ${escapeHtml(verseRef)}</h4>`;
    
    keywords.forEach(keyword => {
        html += `
            <div class="definition-container mb-4">
                <div class="definition-word">${escapeHtml(keyword.word)}</div>
                <div class="definition-text">${formatText(keyword.definition)}</div>
            </div>
        `;
    });
    
    infoContent.innerHTML = html;
    showInfoPanel();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatText(text) {
    if (!text) return '';

    let escaped = escapeHtml(text);

    // Make specific section headers bold
    escaped = escaped.replace(/Parsha Summary:/g, '<strong>Parsha Summary:</strong>');
    escaped = escaped.replace(/Significance &amp; Takeaway:/g, '<strong>Significance &amp; Takeaway:</strong>');

    // Handle both ** and * for bold (markdown style)
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');

    // Handle line breaks
    escaped = escaped.replace(/\n\n/g, '</p><p class="mt-4">');
    escaped = '<p>' + escaped + '</p>';

    return escaped;
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function openBookmarksPanel() {
    const userId = getCurrentUserId();
    if (!userId) {
        showError('Please sign in to view bookmarks');
        return;
    }

    try {
        const bookmarks = await refreshBookmarkedVerses({ returnList: true });

        let html = `
            <div class="bookmarks-container">
                <h3 class="text-2xl font-bold mb-4 text-blue-900">My Bookmarks</h3>
        `;

        if (bookmarks.length === 0) {
            html += `
                <div class="text-center py-8">
                    <p class="text-gray-500">No bookmarks yet.</p>
                    <p class="text-sm text-gray-400 mt-2">Click the bookmark icon on any verse to save it!</p>
                </div>
            `;
        } else {
            html += `<div class="bookmarks-list">`;
            bookmarks.forEach(bookmark => {
                const verseRef = bookmark.verseRef;
                const escapedRef = escapeHtml(verseRef);
                const verseText = getVerseTextSnippet(verseRef) || bookmark.verseText || '';
                const displayText = verseText
                    ? escapeHtml(verseText)
                    : 'Verse text will load when opened.';
                const count = Math.max(verseBookmarkCounts[verseRef] || 0, 1);
                const countLabel = count === 1 ? 'Saved by 1 reader' : `Saved by ${count} readers`;
                let savedDateLabel = 'Date unavailable';
                if (bookmark.timestamp && typeof bookmark.timestamp.toDate === 'function') {
                    savedDateLabel = bookmark.timestamp.toDate().toLocaleDateString();
                }

                html += `
                    <button type="button" class="bookmark-item" data-verse-ref="${escapedRef}" onclick="loadVerseFromBookmark('${escapedRef}')">
                        <div class="bookmark-item-header">
                            <span class="bookmark-item-ref">${escapedRef}</span>
                            <span class="bookmark-item-count">${escapeHtml(countLabel)}</span>
                        </div>
                        <div class="bookmark-item-text">${displayText}</div>
                        <div class="bookmark-item-meta">
                            <span class="bookmark-item-date">Saved ${escapeHtml(savedDateLabel)}</span>
                        </div>
                    </button>
                `;
            });
            html += `</div>`;
        }

        html += `</div>`;

        const infoContent = document.getElementById('info-content');
        infoContent.innerHTML = html;
        showInfoPanel();

    } catch (error) {
        console.error('Error loading bookmarks:', error);
        showError('Failed to load bookmarks');
    }
}

// Make this available globally for onclick
window.loadVerseFromBookmark = async function(verseRef) {
    if (!verseRef) {
        return;
    }

    hideInfoPanel();

    const parsha = findParshaForVerse(verseRef);

    if (!parsha) {
        showError('Unable to locate that verse. Please select the book manually.');
        return;
    }

    const parshaIndex = state.allParshas.indexOf(parsha);
    const needsLoad = state.currentParshaRef !== parsha.reference;

    setState({
        currentParshaIndex: parshaIndex,
        currentParshaRef: parsha.reference
    });

    document.querySelectorAll('select#parsha-selector').forEach((s) => {
        s.value = parsha.reference;
    });

    if (needsLoad) {
        await loadParsha(parsha.reference);
    }

    updateNavigationButtons();

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            highlightVerseAndScroll(verseRef);
        });
    });
};

// ========================================
// PRESENCE TRACKING FUNCTIONS
// ========================================

// Start tracking user presence (updates every 30 seconds)
function startPresenceTracking(userId) {
    lastUserId = userId;

    // Clear existing interval if any
    if (presenceIntervalId) {
        clearInterval(presenceIntervalId);
    }

    // Update presence immediately
    updateUserPresence(userId).catch(error => console.error('Error updating presence:', error));

    // Then update every 30 seconds
    presenceIntervalId = setInterval(() => {
        if (getCurrentUserId() === userId) {
            updateUserPresence(userId).catch(error => console.error('Error updating presence:', error));
        }
    }, PRESENCE_UPDATE_INTERVAL);

    // Set up listener for online users
    listenForOnlineUsers((onlineUsers) => {
        displayOnlineUsers(onlineUsers);
    });
}

function updateCurrentUserStatusDisplay(userProfile, fallbackEmail) {
    const defaultName = getSavedUsername();
    const fallbackName = defaultName !== 'Anonymous'
        ? defaultName
        : (fallbackEmail ? getDisplayNameFromEmail(fallbackEmail) : 'Friend');
    let displayName = userProfile?.username;
    if (!displayName || (typeof displayName === 'string' && displayName.includes('@'))) {
        displayName = userProfile?.email ? getDisplayNameFromEmail(userProfile.email) : fallbackName;
    }
    displayName = displayName || fallbackName;
    const loginTime = userProfile?.lastLogin || userProfile?.lastSeen || new Date();

    displayLastLogin(displayName, loginTime);
}

async function refreshCurrentUserProfile() {
    const userId = getCurrentUserId();
    if (!userId) {
        return;
    }

    try {
        const profile = await getUserInfo(userId);
        if (profile) {
            currentUserProfile = profile;
            updateCurrentUserStatusDisplay(profile, getCurrentUserEmail());
        }
    } catch (error) {
        console.error('Error refreshing current user profile:', error);
    }
}

async function refreshRecentLogins() {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
        hideRecentLogins();
        return;
    }

    try {
        const users = await getUsersSortedByLogin(8);
        if (!Array.isArray(users) || users.length === 0) {
            hideRecentLogins();
            return;
        }

        const seenKeys = new Set();
        const uniqueUsers = [];

        users.forEach((user) => {
            if (!user) {
                return;
            }
            const key = user.userId || user.email;
            if (!key || seenKeys.has(key)) {
                return;
            }
            seenKeys.add(key);
            uniqueUsers.push(user);
        });

        const candidates = uniqueUsers.filter((user) => user.userId !== currentUserId);
        const prioritizedUsers = (candidates.length > 0 ? candidates : uniqueUsers)
            .filter((user) => user.lastLogin || user.lastSeen)
            .slice(0, 4);

        if (prioritizedUsers.length === 0) {
            hideRecentLogins();
            return;
        }

        displayRecentLogins(prioritizedUsers);
    } catch (error) {
        console.error('Error loading recent logins:', error);
        hideRecentLogins();
    }
}

function startRecentLoginsPolling() {
    stopRecentLoginsPolling();
    refreshRecentLogins();
    recentLoginsRefreshIntervalId = setInterval(() => {
        refreshRecentLogins();
    }, RECENT_LOGINS_REFRESH_INTERVAL);
}

function stopRecentLoginsPolling() {
    if (recentLoginsRefreshIntervalId) {
        clearInterval(recentLoginsRefreshIntervalId);
        recentLoginsRefreshIntervalId = null;
    }
    hideRecentLogins();
}

// Stop tracking user presence
function stopPresenceTracking() {
    if (presenceIntervalId) {
        clearInterval(presenceIntervalId);
        presenceIntervalId = null;
    }

    stopListeningForOnlineUsers();
    hideOnlineUsers();
    hideLastLogin();
    stopRecentLoginsPolling();
}

document.addEventListener('DOMContentLoaded', init);
