// Global variables to store data
let commentaryData = null;
let currentParshaRef = null;
let allParshas = [];
let currentParshaIndex = -1;
let weeklyParshaRef = null;
let weeklyParshaIndex = -1;

// API configuration
const SEFARIA_API_BASE = 'https://www.sefaria.org/api';
const ENGLISH_VERSION = 'The Contemporary Torah, Jewish Publication Society, 2006';
const HEBREW_VERSION = 'Miqra_according_to_the_Masorah';

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Torah Study Website...');
    
    try {
        // Load local commentary data
        await loadCommentaryData();
        
        // Fetch Sefaria calendar and parsha list
        await loadParshasList();
        
        // Set up event listeners
        setupEventListeners();
        
        // Load the current week's parsha
        if (currentParshaRef) {
            await loadParsha(currentParshaRef);
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize the application. Please refresh the page.');
    }
});

/**
 * Load and parse the local data.json file
 */
async function loadCommentaryData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load commentary data');
        }
        commentaryData = await response.json();
        console.log('Commentary data loaded successfully');
    } catch (error) {
        console.error('Error loading commentary data:', error);
        // Continue without commentary data - the site will still show Torah text
        commentaryData = { parshas: [] };
    }
}

/**
 * Fetch the list of parshas from Sefaria API
 */
async function loadParshasList() {
    try {
        // For simplicity, we'll use the Torah portions from Genesis (Bereshit)
        // You can expand this to include all books of the Torah
        const genesisPortions = [
            { name: 'Bereshit', reference: 'Genesis 1:1-6:8' },
            { name: 'Noach', reference: 'Genesis 6:9-11:32' },
            { name: 'Lech-Lecha', reference: 'Genesis 12:1-17:27' },
            { name: 'Vayera', reference: 'Genesis 18:1-22:24' },
            { name: 'Chayei Sara', reference: 'Genesis 23:1-25:18' },
            { name: 'Toldot', reference: 'Genesis 25:19-28:9' },
            { name: 'Vayetzei', reference: 'Genesis 28:10-32:3' },
            { name: 'Vayishlach', reference: 'Genesis 32:4-36:43' },
            { name: 'Vayeshev', reference: 'Genesis 37:1-40:23' },
            { name: 'Miketz', reference: 'Genesis 41:1-44:17' },
            { name: 'Vayigash', reference: 'Genesis 44:18-47:27' },
            { name: 'Vayechi', reference: 'Genesis 47:28-50:26' }
        ];
        
        allParshas = genesisPortions;
        
        // Try to get current week's parsha from Sefaria calendar
        try {
            const calendarResponse = await fetch(`${SEFARIA_API_BASE}/calendars`);
            if (calendarResponse.ok) {
                const calendarData = await calendarResponse.json();
                if (calendarData.calendar_items) {
                    const parashatHashavua = calendarData.calendar_items.find(
                        item => item.title && item.title.en === 'Parashat Hashavua'
                    );
                    if (parashatHashavua && parashatHashavua.displayValue) {
                        const currentParshaName = parashatHashavua.displayValue.en;
                        // Find matching parsha in our list
                        const matchingParsha = allParshas.find(p => 
                            p.name.toLowerCase() === currentParshaName.toLowerCase() ||
                            currentParshaName.toLowerCase().includes(p.name.toLowerCase())
                        );
                        if (matchingParsha) {
                            currentParshaRef = matchingParsha.reference;
                            currentParshaIndex = allParshas.indexOf(matchingParsha);
                        }
                    }
                }
            }
        } catch (calendarError) {
            console.warn('Could not fetch current parsha from calendar:', calendarError);
        }
        
        // Default to first parsha if no current parsha found
        if (!currentParshaRef && allParshas.length > 0) {
            currentParshaRef = allParshas[0].reference;
            currentParshaIndex = 0;
        }

        weeklyParshaRef = currentParshaRef;
        weeklyParshaIndex = currentParshaIndex;
        
        // Populate the dropdown
        populateParshaSelector();
        
    } catch (error) {
        console.error('Error loading parshas list:', error);
        throw error;
    }
}

/**
 * Populate the parsha selector dropdown
 */
function populateParshaSelector() {
    const selector = document.getElementById('parsha-selector');
    if (!selector) return;
    selector.innerHTML = '';
    
    allParshas.forEach((parsha, index) => {
        const option = document.createElement('option');
        option.value = parsha.reference;
        option.textContent = `${parsha.name} (${parsha.reference})`;
        if (parsha.reference === currentParshaRef) {
            option.selected = true;
            currentParshaIndex = index;
        }
        selector.appendChild(option);
    });
    
    updateNavigationButtons();
}

/**
 * Set up event listeners for user interactions
 */
function setupEventListeners() {
    // Parsha selector dropdown
    const selector = document.getElementById('parsha-selector');
    selector.addEventListener('change', (e) => {
        const selectedRef = e.target.value;
        currentParshaIndex = allParshas.findIndex(p => p.reference === selectedRef);
        loadParsha(selectedRef);
        updateNavigationButtons();
    });

    // Weekly parsha buttons
    const goToWeeklyButton = document.getElementById('go-to-weekly');
    if (goToWeeklyButton) {
        goToWeeklyButton.addEventListener('click', returnToWeeklyParsha);
    }

    const homeBrandingButton = document.getElementById('home-branding');
    if (homeBrandingButton) {
        homeBrandingButton.addEventListener('click', returnToWeeklyParsha);
    }
    
    // Previous button
    document.getElementById('prev-parsha').addEventListener('click', () => {
        if (currentParshaIndex > 0) {
            currentParshaIndex--;
            const prevParsha = allParshas[currentParshaIndex];
            document.getElementById('parsha-selector').value = prevParsha.reference;
            loadParsha(prevParsha.reference);
            updateNavigationButtons();
        }
    });
    
    // Next button
    document.getElementById('next-parsha').addEventListener('click', () => {
        if (currentParshaIndex < allParshas.length - 1) {
            currentParshaIndex++;
            const nextParsha = allParshas[currentParshaIndex];
            document.getElementById('parsha-selector').value = nextParsha.reference;
            loadParsha(nextParsha.reference);
            updateNavigationButtons();
        }
    });
    
    // Close panel button
    document.getElementById('close-panel-button').addEventListener('click', () => {
        hideInfoPanel();
    });
    
    // Close panel when clicking outside
    document.getElementById('info-panel').addEventListener('click', (e) => {
        if (e.target.id === 'info-panel') {
            hideInfoPanel();
        }
    });
    
    // Use event delegation for verse and keyword clicks
    document.getElementById('parsha-text').addEventListener('click', handleTextClick);
}

/**
 * Update the state of navigation buttons
 */
function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-parsha');
    const nextButton = document.getElementById('next-parsha');
    
    prevButton.disabled = currentParshaIndex <= 0;
    nextButton.disabled = currentParshaIndex >= allParshas.length - 1;
}

/**
 * Load and display a specific parsha
 */
async function loadParsha(parshaRef) {
    console.log('Loading parsha:', parshaRef);
    
    currentParshaRef = parshaRef;
    // Show loading state
    showLoading();
    hideError();
    
    try {
        // Construct API URL with version parameters
        const apiUrl = `${SEFARIA_API_BASE}/texts/${encodeURIComponent(parshaRef)}?context=0&commentary=0`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Parsha data received:', data);
        
        // Render the parsha text
        renderParsha(data, parshaRef);
        
        // Highlight if this is the current week's parsha
        highlightCurrentParsha(parshaRef);
        
    } catch (error) {
        console.error('Error loading parsha:', error);
        showError('Failed to load the Torah text. Please try again later.');
    } finally {
        hideLoading();
    }
}

/**
 * Render the parsha text on the page
 */
function renderParsha(data, parshaRef) {
    const titleElement = document.getElementById('parsha-title');
    const referenceElement = document.getElementById('parsha-reference');
    const textContainer = document.getElementById('parsha-text');
    
    // Set title and reference
    titleElement.textContent = data.book || 'Torah Portion';
    referenceElement.textContent = parshaRef;
    
    // Clear previous content
    textContainer.innerHTML = '';
    
    // Get text arrays
    const englishText = Array.isArray(data.text) ? data.text : [data.text];
    const hebrewText = Array.isArray(data.he) ? data.he : [data.he];
    
    // Check if we have multi-chapter structure (nested arrays)
    const isMultiChapter = Array.isArray(englishText[0]);
    
    if (isMultiChapter) {
        // Parse the reference to get starting chapter and verse
        const refMatch = parshaRef.match(/(\d+):(\d+)/);
        let currentChapter = refMatch ? parseInt(refMatch[1]) : data.sections[0];
        let currentVerse = refMatch ? parseInt(refMatch[2]) : 1;
        
        // Iterate through each chapter
        englishText.forEach((chapterVerses, chapterIndex) => {
            const hebrewChapterVerses = hebrewText[chapterIndex] || [];
            
            // Render each verse in the chapter
            chapterVerses.forEach((verseText, verseIndex) => {
                if (!verseText || verseText.trim() === '') {
                    currentVerse++;
                    return;
                }
                
                const hebrewVerseText = hebrewChapterVerses[verseIndex] || '';
                const verseRef = `${data.book} ${currentChapter}:${currentVerse}`;
                
                // Create verse container
                const verseContainer = createVerseElement(verseText, hebrewVerseText, verseRef, currentVerse);
                textContainer.appendChild(verseContainer);
                
                currentVerse++;
            });
            
            // Move to next chapter
            currentChapter++;
            currentVerse = 1;
        });
    } else {
        // Single chapter - use the original simple approach
        const startVerse = getStartingVerse(parshaRef);
        const chapter = data.sections[0];
        
        englishText.forEach((verseText, index) => {
            if (!verseText || verseText.trim() === '') return;
            
            const hebrewVerseText = hebrewText[index] || '';
            const verseNumber = startVerse + index;
            const verseRef = `${data.book} ${chapter}:${verseNumber}`;
            
            // Create verse container
            const verseContainer = createVerseElement(verseText, hebrewVerseText, verseRef, verseNumber);
            textContainer.appendChild(verseContainer);
        });
    }
}

/**
 * Extract starting verse number from reference
 */
function getStartingVerse(reference) {
    const match = reference.match(/:(\d+)/);
    return match ? parseInt(match[1]) : 1;
}

/**
 * Create a verse element with English and Hebrew text
 */
function createVerseElement(englishText, hebrewText, verseRef, verseNumber) {
    const container = document.createElement('div');
    container.className = 'verse-container';
    container.dataset.ref = verseRef;
    
    // Check if this verse has commentary
    const hasCommentary = checkForCommentary(verseRef);
    if (hasCommentary) {
        container.classList.add('has-commentary');
        container.title = 'Click to view commentary';
    }
    
    // Verse number
    const verseNumSpan = document.createElement('span');
    verseNumSpan.className = 'verse-number';
    verseNumSpan.textContent = `${verseNumber}.`;
    
    // English text
    const englishDiv = document.createElement('div');
    englishDiv.className = 'english-text';
    englishDiv.appendChild(verseNumSpan);
    
    // Process English text for keywords
    const processedEnglish = processKeywords(englishText, verseRef);
    englishDiv.innerHTML += processedEnglish;
    
    // Hebrew text
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
 * Check if a verse has commentary in data.json
 */
function checkForCommentary(verseRef) {
    if (!commentaryData || !commentaryData.parshas) return false;
    
    for (const parsha of commentaryData.parshas) {
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
 * Process text to wrap keywords with spans
 */
function processKeywords(text, verseRef) {
    if (!commentaryData || !commentaryData.parshas) return text;
    
    // Find keywords for this verse
    let keywords = [];
    for (const parsha of commentaryData.parshas) {
        if (parsha.verses) {
            const verse = parsha.verses.find(v => v.ref === verseRef);
            if (verse && verse.keywords) {
                keywords = verse.keywords;
                break;
            }
        }
    }
    
    if (keywords.length === 0) return text;
    
    // Replace keywords with spans (case-insensitive)
    let processedText = text;
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword.word})\\b`, 'gi');
        processedText = processedText.replace(regex, 
            `<span class="keyword" data-definition="${escapeHtml(keyword.definition)}">$1</span>`
        );
    });
    
    return processedText;
}

/**
 * Handle clicks on verses and keywords
 */
function handleTextClick(e) {
    // Check if clicked on a keyword
    if (e.target.classList.contains('keyword')) {
        const definition = e.target.dataset.definition;
        showKeywordDefinition(e.target.textContent, definition);
        return;
    }
    
    // Check if clicked on a verse with commentary
    const verseContainer = e.target.closest('.verse-container.has-commentary');
    if (verseContainer) {
        const verseRef = verseContainer.dataset.ref;
        showCommentary(verseRef);
    }
}

/**
 * Show keyword definition in the info panel
 */
function showKeywordDefinition(word, definition) {
    const infoContent = document.getElementById('info-content');
    infoContent.innerHTML = `
        <div class="definition-container">
            <div class="definition-word">${escapeHtml(word)}</div>
            <div class="definition-text">${escapeHtml(definition)}</div>
        </div>
    `;
    showInfoPanel();
}

/**
 * Show commentary for a verse in the info panel
 */
function showCommentary(verseRef) {
    if (!commentaryData || !commentaryData.parshas) return;
    
    // Find commentary for this verse
    let commentaries = [];
    for (const parsha of commentaryData.parshas) {
        if (parsha.verses) {
            const verse = parsha.verses.find(v => v.ref === verseRef);
            if (verse && verse.commentary) {
                commentaries = verse.commentary;
                break;
            }
        }
    }
    
    if (commentaries.length === 0) return;
    
    // Build commentary HTML
    const infoContent = document.getElementById('info-content');
    let html = `<h4 class="text-lg font-bold mb-4 text-gray-700">${escapeHtml(verseRef)}</h4>`;
    
    commentaries.forEach(commentary => {
        html += `
            <div class="commentary-item">
                <div class="commentary-source">${escapeHtml(commentary.source)}</div>
                <div class="commentary-text">${escapeHtml(commentary.explanation)}</div>
            </div>
        `;
    });
    
    infoContent.innerHTML = html;
    showInfoPanel();
}

/**
 * Highlight the current week's parsha
 */
function highlightCurrentParsha(parshaRef) {
    const contentArea = document.getElementById('content-area');
    if (weeklyParshaRef && parshaRef === weeklyParshaRef) {
        contentArea.classList.add('current-parsha-highlight');
    } else {
        contentArea.classList.remove('current-parsha-highlight');
    }
}

/**
 * Return to the weekly (landing) parsha view
 */
function returnToWeeklyParsha() {
    if (!weeklyParshaRef) {
        console.warn('Weekly parsha is not available yet.');
        return;
    }

    const selector = document.getElementById('parsha-selector');
    if (selector) {
        selector.value = weeklyParshaRef;
    }

    if (weeklyParshaIndex >= 0) {
        currentParshaIndex = weeklyParshaIndex;
    } else {
        currentParshaIndex = allParshas.findIndex(p => p.reference === weeklyParshaRef);
    }

    loadParsha(weeklyParshaRef);
    updateNavigationButtons();
}

/**
 * Show the info panel
 */
function showInfoPanel() {
    document.getElementById('info-panel').classList.remove('hidden');
}

/**
 * Hide the info panel
 */
function hideInfoPanel() {
    document.getElementById('info-panel').classList.add('hidden');
}

/**
 * Show loading state
 */
function showLoading() {
    document.getElementById('loading-message').classList.remove('hidden');
    document.getElementById('parsha-text').innerHTML = '';
}

/**
 * Hide loading state
 */
function hideLoading() {
    document.getElementById('loading-message').classList.add('hidden');
}

/**
 * Show error message
 */
function showError(message) {
    const errorElement = document.getElementById('error-message');
    document.getElementById('error-text').textContent = message;
    errorElement.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    document.getElementById('error-message').classList.add('hidden');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
