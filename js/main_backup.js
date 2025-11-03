// Main Application Entry Point
import { TORAH_PARSHAS } from './config.js';
import { fetchCurrentParsha, fetchParshaText, loadCommentaryData } from './api.js';
import { state, setState } from './state.js';
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
    showKeywordDefinition,
    showCommentary,
    // Comment panel functions
    openCommentsPanel,
    closeCommentsPanel,
    displayComments,
    updateCommentInputState,
    showCommentStatus,
    saveUsername,
    getSavedUsername,
    updateUsernameDisplay
} from './ui.js';

// Import Firebase functions
import {
    initAuth,
    getCurrentUserId,
    submitComment,
    listenForComments,
    stopListeningForComments
} from './firebase.js';

/**
 * Initialize the application
 */
async function init() {
    console.log('Initializing Torah Study Website...');
    
    try {
        // Initialize Firebase Authentication
        initAuth((user) => {
            console.log('Firebase auth ready, user:', user.uid);
            updateCommentInputState(true);
        });
        
        // Load commentary data
        const commentaryData = await loadCommentaryData();
        setState({ commentaryData });
        
        // Set all parshas
        setState({ allParshas: TORAH_PARSHAS });
        
        // Get current week's parsha
        const currentParshaName = await fetchCurrentParsha();
        
        // Find matching parsha
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
        
        // Default to first parsha if no current found
        if (!state.currentParshaRef && TORAH_PARSHAS.length > 0) {
            setState({
                currentParshaRef: TORAH_PARSHAS[0].reference,
                currentParshaIndex: 0
            });
        }
        
        // Populate UI
        populateParshaSelector();
        updateNavigationButtons();
        
        // Set up event listeners
        setupEventListeners();
        
        // Load initial parsha
        if (state.currentParshaRef) {
            await loadParsha(state.currentParshaRef);
        }
        
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize the application. Please refresh the page.');
    }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Parsha selector
    document.getElementById('parsha-selector').addEventListener('change', async (e) => {
        const selectedRef = e.target.value;
        const index = state.allParshas.findIndex(p => p.reference === selectedRef);
        setState({ currentParshaIndex: index });
        await loadParsha(selectedRef);
        updateNavigationButtons();
    });
    
    // Previous button
    document.getElementById('prev-parsha').addEventListener('click', async () => {
        if (state.currentParshaIndex > 0) {
            const newIndex = state.currentParshaIndex - 1;
            setState({ currentParshaIndex: newIndex });
            const prevParsha = state.allParshas[newIndex];
            document.getElementById('parsha-selector').value = prevParsha.reference;
            await loadParsha(prevParsha.reference);
            updateNavigationButtons();
        }
    });
    
    // Next button
    document.getElementById('next-parsha').addEventListener('click', async () => {
        if (state.currentParshaIndex < state.allParshas.length - 1) {
            const newIndex = state.currentParshaIndex + 1;
            setState({ currentParshaIndex: newIndex });
            const nextParsha = state.allParshas[newIndex];
            document.getElementById('parsha-selector').value = nextParsha.reference;
            await loadParsha(nextParsha.reference);
            updateNavigationButtons();
        }
    });
    
    // Go to weekly parsha button
    const weeklyButton = document.getElementById('go-to-weekly');
    if (weeklyButton) {
        weeklyButton.addEventListener('click', async () => {
            if (state.currentParshaRef) {
                const index = state.allParshas.findIndex(p => p.reference === state.currentParshaRef);
                setState({ currentParshaIndex: index });
                document.getElementById('parsha-selector').value = state.currentParshaRef;
                await loadParsha(state.currentParshaRef);
                updateNavigationButtons();
                
                // Scroll to top smoothly
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    // Close info panel button
    document.getElementById('close-panel-button').addEventListener('click', hideInfoPanel);
    
    // Close info panel when clicking outside
    document.getElementById('info-panel').addEventListener('click', (e) => {
        if (e.target.id === 'info-panel') {
            hideInfoPanel();
        }
    });
    
    // Delegate verse and keyword clicks (including comment buttons)
    document.getElementById('parsha-text').addEventListener('click', handleTextClick);
    
    // Comment panel controls
    setupCommentPanelListeners();
    
    // Username save button
    setupUsernameListener();
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Escape key closes panels
        if (e.key === 'Escape') {
            hideInfoPanel();
            closeCommentsPanel(stopListeningForComments);
        }
        
        // Arrow keys for navigation (when not typing)
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'TEXTAREA') {
            if (e.key === 'ArrowLeft' && state.currentParshaIndex > 0) {
                document.getElementById('prev-parsha').click();
            } else if (e.key === 'ArrowRight' && state.currentParshaIndex < state.allParshas.length - 1) {
                document.getElementById('next-parsha').click();
            }
        }
    });
}

/**
 * Setup username save listener
 */
function setupUsernameListener() {
    const saveButton = document.getElementById('save-username-btn');
    const usernameInput = document.getElementById('username-input');
    
    if (saveButton && usernameInput) {
        saveButton.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            
            if (!username) {
                showCommentStatus('Please enter a name', true);
                return;
            }
            
            if (username.length > 50) {
                showCommentStatus('Name must be 50 characters or less', true);
                return;
            }
            
            if (saveUsername(username)) {
                usernameInput.value = '';
                showCommentStatus('Name saved successfully!', false);
            } else {
                showCommentStatus('Failed to save name', true);
            }
        });
        
        // Allow Enter key to save
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveButton.click();
            }
        });
    }
}

/**
 * Setup comment panel event listeners
 */
function setupCommentPanelListeners() {
    // Close comment panel button
    document.getElementById('close-comment-panel').addEventListener('click', () => {
        closeCommentsPanel(stopListeningForComments);
    });
    
    // Close comment panel when clicking overlay
    document.getElementById('comment-overlay').addEventListener('click', () => {
        closeCommentsPanel(stopListeningForComments);
    });
    
    // Submit comment button
    document.getElementById('submit-comment-btn').addEventListener('click', handleCommentSubmit);
    
    // Submit on Enter (Ctrl+Enter or Cmd+Enter)
    document.getElementById('comment-input').addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleCommentSubmit();
        }
    });
}

/**
 * Handle comment submission
 */
async function handleCommentSubmit() {
    const commentInput = document.getElementById('comment-input');
    const verseRefInput = document.getElementById('current-comment-verse-ref');
    const submitButton = document.getElementById('submit-comment-btn');
    
    const text = commentInput.value.trim();
    const verseRef = verseRefInput.value;
    const userId = getCurrentUserId();
    const username = getSavedUsername();
    
    // Validation
    if (!userId) {
        showCommentStatus('Please wait, connecting...', true);
        return;
    }
    
    if (!username) {
        showCommentStatus('Please set your name first', true);
        // Show username setup if hidden
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
    
    // Disable button while submitting
    submitButton.disabled = true;
    commentInput.disabled = true;
    showCommentStatus('Submitting...', false);
    
    try {
        await submitComment(verseRef, text, userId, username);
        commentInput.value = '';
        showCommentStatus('Comment added!', false);
        console.log('Comment submitted successfully');
    } catch (error) {
        console.error('Error submitting comment:', error);
        showCommentStatus('Error submitting comment. Please try again.', true);
    } finally {
        // Re-enable controls
        submitButton.disabled = false;
        commentInput.disabled = false;
    }
}

/**
 * Load and display a parsha
 */
async function loadParsha(parshaRef) {
    console.log('Loading parsha:', parshaRef);
    
    showLoading();
    hideError();
    
    try {
        const data = await fetchParshaText(parshaRef);
        console.log('Parsha data received:', data);
        
        renderParsha(data, parshaRef);
        highlightCurrentParsha(parshaRef);
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error loading parsha:', error);
        showError('Failed to load the Torah text. Please try again later.');
    } finally {
        hideLoading();
    }
}

/**
 * Render parsha text
 */
function renderParsha(data, parshaRef) {
    const textContainer = document.getElementById('parsha-text');
    
    // Update header
    updateParshaHeader(data.book || 'Torah Portion', parshaRef);
    
    // Clear previous content
    textContainer.innerHTML = '';
    
    // Get text arrays
    const englishText = Array.isArray(data.text) ? data.text : [data.text];
    const hebrewText = Array.isArray(data.he) ? data.he : [data.he];
    
    // Flatten nested arrays
    const flatEnglish = flattenTextArray(englishText);
    const flatHebrew = flattenTextArray(hebrewText);
    
    // Get starting verse
    const startVerse = getStartingVerse(parshaRef);
    
    // Render each verse
    flatEnglish.forEach((verseText, index) => {
        if (!verseText || verseText.trim() === '') return;
        
        const hebrewVerseText = flatHebrew[index] || '';
        const verseNumber = startVerse + index;
        const verseRef = `${data.book} ${data.sections[0]}:${verseNumber}`;
        
        const verseElement = createVerseElement(verseText, hebrewVerseText, verseRef, verseNumber);
        textContainer.appendChild(verseElement);
    });
}

/**
 * Flatten nested text arrays
 */
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

/**
 * Extract starting verse number
 */
function getStartingVerse(reference) {
    const match = reference.match(/:(\d+)/);
    return match ? parseInt(match[1]) : 1;
}

/**
 * Create verse element
 */
function createVerseElement(englishText, hebrewText, verseRef, verseNumber) {
    const container = document.createElement('div');
    container.className = 'verse-container';
    container.dataset.ref = verseRef;
    
    // Check for commentary
    const hasCommentary = checkForCommentary(verseRef);
    if (hasCommentary) {
        container.classList.add('has-commentary');
        container.title = 'Click to view commentary';
    }
    
    // English section
    const englishDiv = document.createElement('div');
    englishDiv.className = 'english-text';
    
    const verseNumSpan = document.createElement('span');
    verseNumSpan.className = 'verse-number';
    verseNumSpan.textContent = `${verseNumber}.`;
    englishDiv.appendChild(verseNumSpan);
    
    // Process keywords
    const processedEnglish = processKeywords(englishText, verseRef);
    englishDiv.innerHTML += processedEnglish;
    
    // Add "Discuss" button
    const discussBtn = document.createElement('button');
    discussBtn.className = 'show-comments-btn';
    discussBtn.dataset.verseRef = verseRef;
    discussBtn.textContent = 'Discuss';
    englishDiv.appendChild(discussBtn);
    
    // Hebrew section
    const hebrewDiv = document.createElement('div');
    hebrewDiv.className = 'hebrew-text';
    hebrewDiv.setAttribute('lang', 'he');
    hebrewDiv.setAttribute('dir', 'rtl');
    hebrewDiv.textContent = hebrewText;
    
    container.appendChild(englishDiv);
    container.appendChild(hebrewDiv);
    
    return container;
}

/**
 * Check if verse has commentary
 */
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

/**
 * Process keywords in text
 */
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

/**
 * Handle clicks on text
 */
function handleTextClick(e) {
    // Discuss button click
    if (e.target.classList.contains('show-comments-btn')) {
        e.stopPropagation();
        const verseRef = e.target.dataset.verseRef;
        openCommentsPanel(verseRef, (ref) => {
            listenForComments(ref, displayComments);
        });
        return;
    }
    
    // Keyword click
    if (e.target.classList.contains('keyword')) {
        const definition = e.target.dataset.definition;
        showKeywordDefinition(e.target.textContent, definition);
        return;
    }
    
    // Verse click
    const verseContainer = e.target.closest('.verse-container.has-commentary');
    if (verseContainer) {
        const verseRef = verseContainer.dataset.ref;
        const commentaries = getCommentariesForVerse(verseRef);
        showCommentary(verseRef, commentaries);
    }
}

/**
 * Get commentaries for a verse
 */
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

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Escape regex special characters
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
