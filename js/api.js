// API Service Module
import { API_CONFIG } from './config.js';

/**
 * Fetch current week's parsha from Sefaria calendar
 */
export async function fetchCurrentParsha() {
    try {
        const response = await fetch(`${API_CONFIG.SEFARIA_BASE}/calendars`);
        if (!response.ok) return null;
        
        const data = await response.json();
        if (data.calendar_items) {
            const parashatHashavua = data.calendar_items.find(
                item => item.title && item.title.en === 'Parashat Hashavua'
            );
            if (parashatHashavua && parashatHashavua.displayValue) {
                return parashatHashavua.displayValue.en;
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Fetch Torah text for a specific parsha reference using v3 API
 */
export async function fetchParshaText(parshaRef) {
    try {
        // Use v3 API endpoint with text_only format to strip all annotations
        const apiUrl = `${API_CONFIG.SEFARIA_BASE}/v3/texts/${encodeURIComponent(parshaRef)}?version=english&version=hebrew&return_format=text_only`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform v3 response to expected format
        return transformV3Response(data);
    } catch (error) {
        console.error('Error in fetchParshaText:', error);
        // Fallback to v1 API if v3 fails
        return fetchParshaTextV1(parshaRef);
    }
}

/**
 * Fallback to v1 API if v3 fails
 */
async function fetchParshaTextV1(parshaRef) {
    const apiUrl = `${API_CONFIG.SEFARIA_BASE}/texts/${encodeURIComponent(parshaRef)}?context=0&commentary=0`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Clean the v1 API response text as well
    if (data.text) {
        data.text = cleanTextArray(data.text);
    }
    
    return data;
}

/**
 * Minimal text cleanup (safety layer)
 * Since we're using return_format=text_only, most cleaning is done by Sefaria
 * This just handles any edge cases or HTML entities that might remain
 */
function cleanSefariaAnnotations(text) {
    if (!text || typeof text !== 'string') return text;
    
    let cleaned = text;
    
    // Decode any HTML entities that might remain
    const temp = document.createElement('textarea');
    temp.innerHTML = cleaned;
    cleaned = temp.value;
    
    // Remove any stray HTML tags (shouldn't be any with text_only, but just in case)
    cleaned = cleaned.replace(/<[^>]+>/g, '');
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
}

/**
 * Recursively clean text arrays
 */
function cleanTextArray(textArray) {
    if (!Array.isArray(textArray)) {
        return cleanSefariaAnnotations(textArray);
    }
    
    return textArray.map(item => {
        if (Array.isArray(item)) {
            return cleanTextArray(item);
        }
        return cleanSefariaAnnotations(item);
    });
}

/**
 * Transform v3 API response to expected format
 */
function transformV3Response(v3Data) {
    // v3 API returns versions array with text and language info
    const englishVersion = v3Data.versions?.find(v => 
        v.languageFamilyName === 'english' || v.language === 'en'
    );
    const hebrewVersion = v3Data.versions?.find(v => 
        v.languageFamilyName === 'hebrew' || v.language === 'he'
    );
    
    // If no versions found, try to use the data directly
    const rawEnglishText = englishVersion?.text || v3Data.text || [];
    const hebrewText = hebrewVersion?.text || v3Data.he || [];
    
    // Clean the English text of all Sefaria annotations
    const englishText = cleanTextArray(rawEnglishText);
    
    return {
        book: v3Data.indexTitle || v3Data.title || 'Torah',
        sections: v3Data.sections || [1],
        text: englishText,
        he: hebrewText,
        ref: v3Data.ref,
        heRef: v3Data.heRef,
        indexTitle: v3Data.indexTitle,
        sectionRef: v3Data.sectionRef
    };
}

/**
 * Load local commentary data from data.json
 */
export async function loadCommentaryData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load commentary data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading commentary data:', error);
        return { parshas: [] };
    }
}
