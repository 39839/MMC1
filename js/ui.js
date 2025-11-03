// UI Module - Handles all DOM manipulation - NO EMOJIS
import { state } from './state.js';
import { getDisplayNameFromEmail } from './name-utils.js';

/**
 * Show loading state
 */
export function showLoading() {
    document.getElementById('loading-message').classList.remove('hidden');
    document.getElementById('parsha-text').innerHTML = '';
}

/**
 * Hide loading state
 */
export function hideLoading() {
    document.getElementById('loading-message').classList.add('hidden');
}

/**
 * Show error message
 */
export function showError(message) {
    const errorElement = document.getElementById('error-message');
    document.getElementById('error-text').textContent = message;
    errorElement.classList.remove('hidden');
}

/**
 * Hide error message
 */
export function hideError() {
    document.getElementById('error-message').classList.add('hidden');
}

/**
 * Update parsha header
 */
export function updateParshaHeader(title, reference) {
    document.getElementById('parsha-title').textContent = title;
    document.getElementById('parsha-reference').textContent = reference;
}

/**
 * Highlight current week's parsha
 */
export function highlightCurrentParsha(parshaRef) {
    const contentArea = document.getElementById('content-area');
    if (parshaRef === state.currentParshaRef) {
        contentArea.classList.add('current-parsha-highlight');
    } else {
        contentArea.classList.remove('current-parsha-highlight');
    }
}

/**
 * Update navigation buttons state
 */
export function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-parsha');
    const nextButton = document.getElementById('next-parsha');
    
    prevButton.disabled = state.currentParshaIndex <= 0;
    nextButton.disabled = state.currentParshaIndex >= state.allParshas.length - 1;
}

/**
 * Populate parsha selector dropdown
 */
export function populateParshaSelector() {
    // Get ALL select elements with id 'parsha-selector' (desktop and mobile)
    const selectors = document.querySelectorAll('select#parsha-selector');

    // Populate each select element with all parshas
    selectors.forEach((selector) => {
        selector.innerHTML = '';

        state.allParshas.forEach((parsha, index) => {
            const option = document.createElement('option');
            option.value = parsha.reference;
            option.textContent = `${parsha.name} (${parsha.reference})`;
            if (parsha.reference === state.currentParshaRef) {
                option.selected = true;
            }
            selector.appendChild(option);
        });
    });
}

/**
 * Show info panel (modal)
 */
export function showInfoPanel() {
    document.getElementById('info-panel').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Hide info panel (modal)
 */
export function hideInfoPanel() {
    document.getElementById('info-panel').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

/**
 * Display keyword definition in info panel - NO EMOJIS
 */
export function showKeywordDefinition(word, definition) {
    const infoContent = document.getElementById('info-content');
    infoContent.innerHTML = `
        <div class="definition-container">
            <div class="definition-word">${escapeHtml(word)}</div>
            <div class="definition-text">${formatText(definition)}</div>
        </div>
    `;
    showInfoPanel();
}

/**
 * Display commentary in info panel - NO EMOJIS
 */
export function showCommentary(verseRef, commentaries) {
    if (!commentaries || commentaries.length === 0) return;
    
    const infoContent = document.getElementById('info-content');
    let html = `<h4 class="text-lg font-bold mb-4 text-blue-900 border-b-2 border-blue-200 pb-2">${escapeHtml(verseRef)}</h4>`;
    
    commentaries.forEach(commentary => {
        html += `
            <div class="commentary-item">
                <div class="commentary-source">${escapeHtml(commentary.source)}</div>
                <div class="commentary-text">${formatText(commentary.explanation)}</div>
            </div>
        `;
    });
    
    infoContent.innerHTML = html;
    showInfoPanel();
}

// ========================================
// COMMENT PANEL FUNCTIONS
// ========================================

/**
 * Open comments panel for a specific verse or general parsha chat
 */
export function openCommentsPanel(verseRef, onOpen, customTitle = null) {
    const panel = document.getElementById('comment-panel');
    const overlay = document.getElementById('comment-overlay');
    const titleElement = document.getElementById('comment-panel-title');
    const verseRefInput = document.getElementById('current-comment-verse-ref');
    const commentsList = document.getElementById('comments-list');
    
    // Store verse reference
    verseRefInput.value = verseRef;
    
    // Update title - use custom title for general chat, or verse reference otherwise
    if (customTitle) {
        titleElement.textContent = `General Discussion: ${customTitle}`;
    } else {
        titleElement.textContent = `Discussion: ${verseRef}`;
    }
    
    // Update placeholder text based on type of chat
    const commentInput = document.getElementById('comment-input');
    if (verseRef.startsWith('PARSHA:')) {
        commentInput.placeholder = 'Share your thoughts about this parsha...';
    } else {
        commentInput.placeholder = 'Share your insights on this verse...';
    }
    
    // Show loading state
    commentsList.innerHTML = '<div class="loading-comments">Loading comments...</div>';
    
    // Show panel and overlay
    overlay.classList.remove('hidden');
    panel.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Check and display username status
    updateUsernameDisplay();
    
    // Restore any persistent comment status messages
    restoreCommentStatus();
    
    // Call the onOpen callback to start listening for comments
    if (onOpen) {
        onOpen(verseRef);
    }
}

/**
 * Close comments panel
 */
export function closeCommentsPanel(onClose) {
    const panel = document.getElementById('comment-panel');
    const overlay = document.getElementById('comment-overlay');
    
    // Hide panel and overlay
    panel.classList.remove('active');
    overlay.classList.add('hidden');
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
    
    // Clear input but DON'T clear the status message (it should persist)
    document.getElementById('comment-input').value = '';
    
    // Call the onClose callback to stop listening
    if (onClose) {
        onClose();
    }
}

/**
 * Display comments in the panel with username
 */
export function displayComments(commentsArray) {
    const commentsList = document.getElementById('comments-list');

    if (!commentsList) {
        console.error('comments-list element not found!');
        return;
    }

    if (!commentsArray || commentsArray.length === 0) {
        commentsList.innerHTML = `
            <div class="no-comments">
                <p>No comments yet.</p>
                <p class="text-sm">Be the first to share your insights!</p>
            </div>
        `;
        return;
    }

    let html = '';
    commentsArray.forEach(comment => {
        const displayName = comment.username || 'Anonymous';
        const timestamp = formatTimestamp(comment.timestamp);

        html += `
            <div class="comment-item">
                <div class="comment-meta">
                    <span class="comment-user">${escapeHtml(displayName)}</span>
                    <span class="comment-time">${escapeHtml(timestamp)}</span>
                </div>
                <div class="comment-text">${escapeHtml(comment.text)}</div>
            </div>
        `;
    });

    commentsList.innerHTML = html;
}

/**
 * Update comment input state based on authentication
 */
export function updateCommentInputState(isLoggedIn) {
    const commentInput = document.getElementById('comment-input');
    const submitButton = document.getElementById('submit-comment-btn');
    
    if (isLoggedIn) {
        commentInput.disabled = false;
        submitButton.disabled = false;
        commentInput.placeholder = 'Share your insights on this verse...';
    } else {
        commentInput.disabled = true;
        submitButton.disabled = true;
        commentInput.placeholder = 'Connecting...';
    }
}

// Name extraction handled in shared name-utils module

/**
 * Update name display in comment panel based on current user email
 */
export function updateUsernameDisplay() {
    const nameDisplay = document.getElementById('name-display');
    const currentUsernameSpan = document.getElementById('current-username');

    // Get the current user's email from localStorage (set during authentication)
    const userEmail = localStorage.getItem('currentUserEmail');

    if (userEmail) {
        // Show name display
        nameDisplay.classList.remove('hidden');
        const displayName = getDisplayNameFromEmail(userEmail);
        currentUsernameSpan.textContent = displayName;
    } else {
        // Hide name display if no email
        nameDisplay.classList.add('hidden');
    }
}

/**
 * Set current user email (called during authentication)
 */
export function setCurrentUserEmail(email) {
    if (email) {
        localStorage.setItem('currentUserEmail', email);
    } else {
        localStorage.removeItem('currentUserEmail');
    }
    updateUsernameDisplay();
}

/**
 * Get display name from email
 */
export function getSavedUsername() {
    const userEmail = localStorage.getItem('currentUserEmail');
    return userEmail ? getDisplayNameFromEmail(userEmail) : 'Anonymous';
}

/**
 * Deprecated - for backward compatibility
 * Use getSavedUsername() instead
 */
export function saveUsername(email) {
    if (email) {
        setCurrentUserEmail(email);
        return true;
    }
    return false;
}

/**
 * Show comment status message - PERSISTENT (stores in sessionStorage)
 */
export function showCommentStatus(message, isError = false) {
    const statusElement = document.getElementById('comment-status');
    statusElement.textContent = message;
    statusElement.className = 'comment-status ' + (isError ? 'error' : 'success');
    
    // Store success messages in sessionStorage so they persist across refreshes
    if (!isError) {
        sessionStorage.setItem('torahStudyCommentStatus', JSON.stringify({
            message: message,
            timestamp: Date.now()
        }));
    }
    
    // Only clear error messages after 5 seconds
    if (isError) {
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'comment-status';
        }, 5000);
    }
}

/**
 * Clear comment status message
 */
export function clearCommentStatus() {
    const statusElement = document.getElementById('comment-status');
    statusElement.textContent = '';
    statusElement.className = 'comment-status';
    sessionStorage.removeItem('torahStudyCommentStatus');
}

/**
 * Restore comment status from sessionStorage (call on panel open)
 */
export function restoreCommentStatus() {
    const stored = sessionStorage.getItem('torahStudyCommentStatus');
    if (stored) {
        try {
            const { message, timestamp } = JSON.parse(stored);
            // Only show if less than 5 minutes old
            if (Date.now() - timestamp < 5 * 60 * 1000) {
                const statusElement = document.getElementById('comment-status');
                statusElement.textContent = message;
                statusElement.className = 'comment-status success';
            } else {
                sessionStorage.removeItem('torahStudyCommentStatus');
            }
        } catch (e) {
            console.error('Error restoring comment status:', e);
        }
    }
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp) {
    if (!timestamp || !timestamp.toDate) {
        return 'Just now';
    }
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format text with basic markdown-style formatting
 * Converts *text* to <strong>text</strong> for bold
 * While still escaping dangerous HTML
 * FIXED: Now properly removes asterisks and applies bold formatting
 */
function formatText(text) {
    if (!text) return '';

    // First escape all HTML to prevent XSS
    let escaped = escapeHtml(text);

    // Then apply safe formatting:
    // Convert *text* to <strong>text</strong> for bold
    // Use non-greedy match and replace the entire pattern including asterisks
    escaped = escaped.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');

    return escaped;
}

// ========================================
// USER STATUS DISPLAY FUNCTIONS (HEADER BAR)
// ========================================

let lastLoginIntervalId = null;
let lastLoginTimestamp = null;
let recentLoginsIntervalId = null;
let recentLoginEntries = [];

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONLINE_STALE_THRESHOLD_MS = 2 * 60 * 1000;

const BADGE_STATUS_CLASSES = ['status-badge--green', 'status-badge--yellow', 'status-badge--gray'];
const DOT_STATUS_CLASSES = ['status-dot--green', 'status-dot--yellow', 'status-dot--gray'];
const TEXT_STATUS_CLASSES = ['status-text--green', 'status-text--yellow', 'status-text--gray'];

function updateCommunityStatusLayout() {
    const statusBar = document.getElementById('community-status-bar');
    if (!statusBar) {
        return;
    }

    const sections = [
        document.getElementById('header-online-section'),
        document.getElementById('header-last-login-section'),
        document.getElementById('header-your-status')
    ];

    const visibleSections = [];

    sections.forEach((section) => {
        if (!section) {
            return;
        }
        section.classList.remove('status-section--with-divider');
        if (!section.classList.contains('hidden')) {
            visibleSections.push(section);
        }
    });

    visibleSections.forEach((section, index) => {
        if (index > 0) {
            section.classList.add('status-section--with-divider');
        }
    });

    if (visibleSections.length === 0) {
        statusBar.classList.add('hidden');
    } else {
        statusBar.classList.remove('hidden');
    }
}

function convertToDate(timestamp) {
    if (!timestamp) {
        return null;
    }

    if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
    }

    if (typeof timestamp.toMillis === 'function') {
        return new Date(timestamp.toMillis());
    }

    return new Date(timestamp);
}

function formatRelativeTime(timestamp) {
    const date = convertToDate(timestamp);
    if (!date) {
        return 'just now';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 45) {
        return 'just now';
    }
    if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString();
}

function getStatusAppearance(timestamp) {
    const date = convertToDate(timestamp);

    if (!date) {
        return {
            tone: 'gray',
            badgeClass: 'status-badge--gray',
            dotClass: 'status-dot--gray',
            textClass: 'status-text--gray',
            relative: 'No recent activity',
            date: null
        };
    }

    const diff = Date.now() - date.getTime();
    let tone = 'gray';

    if (diff <= THIRTY_MINUTES_MS) {
        tone = 'green';
    } else if (diff <= ONE_DAY_MS) {
        tone = 'yellow';
    }

    return {
        tone,
        badgeClass: `status-badge--${tone}`,
        dotClass: `status-dot--${tone}`,
        textClass: `status-text--${tone}`,
        relative: formatRelativeTime(timestamp),
        date
    };
}

function buildStatusTooltip(prefix, appearance, timestamp) {
    if (!appearance || !appearance.date) {
        return `${prefix}: No recent activity yet`;
    }

    const relativeText = appearance.relative || formatRelativeTime(timestamp);
    return `${prefix}: ${appearance.date.toLocaleString()} (${relativeText})`;
}

function applyStatusClasses(element, classPool, newClass) {
    if (!element) {
        return;
    }

    if (Array.isArray(classPool) && classPool.length > 0) {
        element.classList.remove(...classPool);
    }

    if (newClass) {
        element.classList.add(newClass);
    }
}

function resolveDisplayName(user) {
    if (!user) {
        return 'Friend';
    }

    const candidate = user.username;
    if (candidate && typeof candidate === 'string' && !candidate.includes('@')) {
        return candidate;
    }

    if (user.email) {
        return getDisplayNameFromEmail(user.email);
    }

    return 'Friend';
}

function isUserActive(user) {
    if (!user) {
        return false;
    }

    const timestamp = user.lastSeen || user.lastLogin;
    const date = convertToDate(timestamp);

    if (!date) {
        return false;
    }

    return (Date.now() - date.getTime()) <= ONLINE_STALE_THRESHOLD_MS;
}

/**
 * Display currently online users in header status bar
 */
export function displayOnlineUsers(onlineUsers = []) {
    const onlineSection = document.getElementById('header-online-section');
    const usersList = document.getElementById('header-online-users-list');

    if (!onlineSection || !usersList) {
        return;
    }

    const activeUsers = Array.isArray(onlineUsers)
        ? onlineUsers.filter((user) => isUserActive(user))
        : [];

    if (activeUsers.length === 0) {
        hideOnlineUsers();
        return;
    }

    usersList.innerHTML = '';

    activeUsers.forEach((user) => {
        const timestamp = user.lastSeen || user.lastLogin;
        const appearance = getStatusAppearance(timestamp);
        const badge = document.createElement('span');
        badge.classList.add('status-badge', appearance.badgeClass);

        const tooltip = buildStatusTooltip('Last seen', appearance, timestamp);
        badge.setAttribute('aria-label', tooltip);
        badge.classList.add('status-tooltip');
        badge.dataset.tooltip = tooltip;

        const dot = document.createElement('span');
        dot.classList.add('status-dot', appearance.dotClass);
        if (appearance.tone === 'green') {
            dot.classList.add('status-dot--pulse');
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = resolveDisplayName(user);

        badge.appendChild(dot);
        badge.appendChild(nameSpan);

        usersList.appendChild(badge);
    });

    onlineSection.classList.remove('hidden');
    updateCommunityStatusLayout();
}

/**
 * Hide online users display
 */
export function hideOnlineUsers() {
    const onlineSection = document.getElementById('header-online-section');
    const usersList = document.getElementById('header-online-users-list');

    if (!onlineSection) {
        return;
    }

    if (usersList) {
        usersList.innerHTML = '';
    }

    onlineSection.classList.add('hidden');
    onlineSection.classList.remove('status-section--with-divider');
    updateCommunityStatusLayout();
}

/**
 * Display recent logins in header status bar
 */
export function displayRecentLogins(recentUsers = []) {
    const lastLoginSection = document.getElementById('header-last-login-section');
    const list = document.getElementById('header-last-login-list');

    if (!lastLoginSection || !list) {
        return;
    }

    const safeUsers = Array.isArray(recentUsers) ? recentUsers : [];

    if (safeUsers.length === 0) {
        hideRecentLogins();
        return;
    }

    list.innerHTML = '';
    recentLoginEntries = [];

    safeUsers.forEach((user) => {
        const timestamp = user.lastLogin || user.lastSeen;
        const appearance = getStatusAppearance(timestamp);

        const badge = document.createElement('span');
        badge.classList.add('status-badge', appearance.badgeClass);

        const tooltip = buildStatusTooltip('Last logged on', appearance, timestamp);
        badge.setAttribute('aria-label', tooltip);
        badge.classList.add('status-tooltip');
        badge.dataset.tooltip = tooltip;

        const dot = document.createElement('span');
        dot.classList.add('status-dot', appearance.dotClass);
        if (appearance.tone === 'green') {
            dot.classList.add('status-dot--pulse');
        }
        badge.appendChild(dot);

        const nameSpan = document.createElement('span');
        nameSpan.textContent = resolveDisplayName(user);
        badge.appendChild(nameSpan);

        const timeSpan = document.createElement('span');
        timeSpan.classList.add('status-time', appearance.textClass);
        timeSpan.textContent = appearance.date ? appearance.relative : 'No recent activity';
        badge.appendChild(timeSpan);

        list.appendChild(badge);

        recentLoginEntries.push({
            badge,
            dot,
            timeEl: timeSpan,
            timestamp,
            prefix: 'Last logged on'
        });
    });

    if (recentLoginsIntervalId) {
        clearInterval(recentLoginsIntervalId);
    }

    recentLoginsIntervalId = setInterval(() => {
        updateRecentLoginTimes();
    }, 60000);

    lastLoginSection.classList.remove('hidden');
    updateCommunityStatusLayout();
}

function updateRecentLoginTimes() {
    if (!recentLoginEntries.length) {
        return;
    }

    recentLoginEntries.forEach((entry) => {
        if (!entry || !entry.timeEl) {
            return;
        }
        const appearance = getStatusAppearance(entry.timestamp);
        entry.timeEl.textContent = appearance.date ? appearance.relative : 'No recent activity';

        applyStatusClasses(entry.badge, BADGE_STATUS_CLASSES, appearance.badgeClass);
        applyStatusClasses(entry.dot, DOT_STATUS_CLASSES, appearance.dotClass);
        applyStatusClasses(entry.timeEl, TEXT_STATUS_CLASSES, appearance.textClass);

        if (appearance.tone === 'green') {
            entry.dot.classList.add('status-dot--pulse');
        } else {
            entry.dot.classList.remove('status-dot--pulse');
        }

        const tooltip = buildStatusTooltip(entry.prefix || 'Last logged on', appearance, entry.timestamp);
        entry.badge.setAttribute('aria-label', tooltip);
        entry.badge.dataset.tooltip = tooltip;
    });
}

/**
 * Hide recent logins section
 */
export function hideRecentLogins() {
    const lastLoginSection = document.getElementById('header-last-login-section');
    const list = document.getElementById('header-last-login-list');

    if (list) {
        list.innerHTML = '';
    }

    if (recentLoginsIntervalId) {
        clearInterval(recentLoginsIntervalId);
        recentLoginsIntervalId = null;
    }

    recentLoginEntries = [];

    if (!lastLoginSection) {
        return;
    }

    lastLoginSection.classList.add('hidden');
    lastLoginSection.classList.remove('status-section--with-divider');
    updateCommunityStatusLayout();
}

/**
 * Display user's last login time in header status bar
 */
export function displayLastLogin(username, loginTime) {
    const yourStatusSection = document.getElementById('header-your-status');
    const usernameEl = document.getElementById('header-your-username');
    const timeElement = document.getElementById('header-your-login-time');

    if (!yourStatusSection || !usernameEl || !timeElement) {
        return;
    }

    if (!username || !loginTime) {
        hideLastLogin();
        return;
    }

    usernameEl.textContent = username;
    lastLoginTimestamp = loginTime;

    const appearance = getStatusAppearance(loginTime);
    timeElement.textContent = appearance.date ? appearance.relative : 'No recent activity';
    applyStatusClasses(timeElement, TEXT_STATUS_CLASSES, appearance.textClass);

    const tooltip = buildStatusTooltip('You last logged on', appearance, loginTime);
    yourStatusSection.setAttribute('aria-label', tooltip);
    yourStatusSection.classList.add('status-tooltip');
    yourStatusSection.dataset.tooltip = tooltip;

    if (lastLoginIntervalId) {
        clearInterval(lastLoginIntervalId);
    }

    lastLoginIntervalId = setInterval(updateLoginTimeDisplay, 60000);

    yourStatusSection.classList.remove('hidden');
    updateCommunityStatusLayout();
}

function updateLoginTimeDisplay() {
    const timeAgoElement = document.getElementById('header-your-login-time');
    const statusSection = document.getElementById('header-your-status');

    if (!timeAgoElement || !lastLoginTimestamp) {
        return;
    }

    const appearance = getStatusAppearance(lastLoginTimestamp);
    timeAgoElement.textContent = appearance.date ? appearance.relative : 'No recent activity';
    applyStatusClasses(timeAgoElement, TEXT_STATUS_CLASSES, appearance.textClass);

    if (statusSection) {
        const tooltip = buildStatusTooltip('You last logged on', appearance, lastLoginTimestamp);
        statusSection.setAttribute('aria-label', tooltip);
        statusSection.dataset.tooltip = tooltip;
    }
}

/**
 * Hide last login display
 */
export function hideLastLogin() {
    const yourStatusSection = document.getElementById('header-your-status');
    const timeElement = document.getElementById('header-your-login-time');

    if (yourStatusSection) {
        yourStatusSection.classList.add('hidden');
        yourStatusSection.classList.remove('status-section--with-divider');
        yourStatusSection.removeAttribute('aria-label');
        delete yourStatusSection.dataset.tooltip;
    }

    if (timeElement) {
        applyStatusClasses(timeElement, TEXT_STATUS_CLASSES, null);
        timeElement.textContent = 'just now';
    }

    if (lastLoginIntervalId) {
        clearInterval(lastLoginIntervalId);
        lastLoginIntervalId = null;
    }

    lastLoginTimestamp = null;
    updateCommunityStatusLayout();
}
