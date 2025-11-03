/**
 * Text Size Control Widget - Subtle Version
 * Allows users to adjust Torah verse text size only
 */

(function() {
    'use strict';

    // Configuration
    const TEXT_SIZES = {
        SMALL: 'torah-text-size-small',
        MEDIUM: 'torah-text-size-medium',
        LARGE: 'torah-text-size-large',
        XLARGE: 'torah-text-size-xlarge'
    };

    const SIZE_LABELS = {
        [TEXT_SIZES.SMALL]: 'Small',
        [TEXT_SIZES.MEDIUM]: 'Default',
        [TEXT_SIZES.LARGE]: 'Large',
        [TEXT_SIZES.XLARGE]: 'Extra'
    };

    const DEFAULT_SIZE = TEXT_SIZES.MEDIUM;
    const STORAGE_KEY = 'preferredTorahTextSize';

    let controlElement = null;
    let toggleButton = null;
    let menuElement = null;

    /**
     * Initialize the text size control widget
     */
    function init() {
        const torahText = document.getElementById('parsha-text');

        // Only render the control when Torah text is present on the page
        if (!torahText) {
            return;
        }

        // Prevent duplicate widgets
        if (document.querySelector('.text-size-control')) {
            return;
        }

        // Create and inject the widget HTML
        controlElement = createWidget();
        if (!controlElement) {
            return;
        }

        toggleButton = controlElement.querySelector('.text-size-toggle');
        menuElement = controlElement.querySelector('.text-size-menu');

        // Load saved preference
        loadSavedPreference();

        // Set up event listeners
        setupEventListeners();
    }

    /**
     * Create the text size control widget HTML
     */
    function createWidget() {
        const widget = document.createElement('div');
        widget.className = 'text-size-control';
        widget.setAttribute('role', 'region');
        widget.setAttribute('aria-label', 'Torah text size controls');
        widget.innerHTML = `
            <button type="button" class="text-size-toggle" aria-haspopup="true" aria-expanded="false" aria-label="Adjust Torah text size">
                <span class="text-size-icon" aria-hidden="true">
                    <span>A</span>
                    <span>A</span>
                </span>
                <span class="text-size-toggle-label">Text Size</span>
                <svg class="text-size-caret" viewBox="0 0 12 8" aria-hidden="true" focusable="false">
                    <path d="M10.59.59 6 5.17 1.41.59 0 2l6 6 6-6z" fill="currentColor"></path>
                </svg>
            </button>
            <div class="text-size-menu" role="menu">
                <button type="button" class="text-size-btn" data-size="${TEXT_SIZES.SMALL}" role="menuitemradio" aria-checked="false" aria-label="Set Torah text to small">
                    <span>Small</span>
                    <span class="text-size-option-note" aria-hidden="true">Aa</span>
                </button>
                <button type="button" class="text-size-btn active" data-size="${TEXT_SIZES.MEDIUM}" role="menuitemradio" aria-checked="true" aria-label="Set Torah text to default size">
                    <span>Default</span>
                    <span class="text-size-option-note" aria-hidden="true">Aa</span>
                </button>
                <button type="button" class="text-size-btn" data-size="${TEXT_SIZES.LARGE}" role="menuitemradio" aria-checked="false" aria-label="Set Torah text to large">
                    <span>Large</span>
                    <span class="text-size-option-note" aria-hidden="true">Aa</span>
                </button>
                <button type="button" class="text-size-btn" data-size="${TEXT_SIZES.XLARGE}" role="menuitemradio" aria-checked="false" aria-label="Set Torah text to extra large">
                    <span>Extra</span>
                    <span class="text-size-option-note" aria-hidden="true">Aa</span>
                </button>
            </div>
        `;

        // Try desktop header actions first
        const quickActions = document.getElementById('header-actions');
        if (quickActions) {
            quickActions.appendChild(widget);
            return widget;
        }

        const navActions = document.getElementById('nav-header-actions');
        if (navActions) {
            navActions.appendChild(widget);
            return widget;
        }

        // Try mobile header actions
        const mobileActions = document.getElementById('header-actions-mobile');
        if (mobileActions) {
            mobileActions.appendChild(widget);
            return widget;
        }

        // Fallback to nav container
        const navContainer = document.querySelector('nav .container');
        if (navContainer) {
            const wrapper = document.createElement('div');
            wrapper.className = 'text-size-control-fallback';
            wrapper.appendChild(widget);
            navContainer.appendChild(wrapper);
            return widget;
        }

        // Last resort: insert at body
        document.body.insertAdjacentElement('afterbegin', widget);
        return widget;
    }

    /**
     * Set up event listeners for the buttons
     */
    function setupEventListeners() {
        if (!controlElement) return;

        const buttons = controlElement.querySelectorAll('.text-size-btn');

        buttons.forEach(button => {
            button.addEventListener('click', function() {
                const size = this.getAttribute('data-size');
                setTextSize(size);
                closeMenu();
            });
        });

        if (toggleButton) {
            toggleButton.addEventListener('click', toggleMenu);
        }

        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('keydown', handleKeydown);
    }

    /**
     * Set the text size
     * @param {string} size - The size class to apply
     */
    function setTextSize(size) {
        if (!Object.values(TEXT_SIZES).includes(size)) {
            return;
        }

        // Remove all size classes
        Object.values(TEXT_SIZES).forEach(sizeClass => {
            document.body.classList.remove(sizeClass);
        });

        // Add the selected size class
        document.body.classList.add(size);

        // Update button states
        updateButtonStates(size);

        // Save preference
        savePreference(size);
    }

    /**
     * Update the active state of buttons
     * @param {string} activeSize - The currently active size
     */
    function updateButtonStates(activeSize) {
        if (!controlElement) return;

        const buttons = controlElement.querySelectorAll('.text-size-btn');

        buttons.forEach(button => {
            const buttonSize = button.getAttribute('data-size');

            if (buttonSize === activeSize) {
                button.classList.add('active');
                button.setAttribute('aria-checked', 'true');
            } else {
                button.classList.remove('active');
                button.setAttribute('aria-checked', 'false');
            }
        });

        updateToggleAssistiveText(activeSize);
    }

    /**
     * Save the user's preference to localStorage
     * @param {string} size - The size to save
     */
    function savePreference(size) {
        try {
            localStorage.setItem(STORAGE_KEY, size);
        } catch (e) {
            console.warn('Could not save text size preference:', e);
        }
    }

    /**
     * Load the saved preference from localStorage
     */
    function loadSavedPreference() {
        try {
            const savedSize = localStorage.getItem(STORAGE_KEY);

            if (savedSize && Object.values(TEXT_SIZES).includes(savedSize)) {
                setTextSize(savedSize);
            } else {
                setTextSize(DEFAULT_SIZE);
            }
        } catch (e) {
            console.warn('Could not load text size preference:', e);
            setTextSize(DEFAULT_SIZE);
        }
    }

    /**
     * Toggle the visibility of the menu
     */
    function toggleMenu() {
        if (!controlElement || !toggleButton) return;

        const isOpen = controlElement.classList.toggle('open');
        toggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

        if (isOpen && menuElement) {
            const activeButton = menuElement.querySelector('.text-size-btn.active');
            if (activeButton) {
                activeButton.focus();
            }
        }
    }

    /**
     * Close the menu
     */
    function closeMenu() {
        if (!controlElement || !toggleButton) return;

        if (!controlElement.classList.contains('open')) {
            return;
        }

        controlElement.classList.remove('open');
        toggleButton.setAttribute('aria-expanded', 'false');
    }

    /**
     * Update the toggle button's accessible description
     * @param {string} activeSize
     */
    function updateToggleAssistiveText(activeSize) {
        if (!toggleButton) return;

        const label = SIZE_LABELS[activeSize] || SIZE_LABELS[DEFAULT_SIZE];
        toggleButton.setAttribute('aria-label', `Adjust Torah text size (current: ${label})`);
        toggleButton.setAttribute('title', `Torah text size: ${label}`);
    }

    /**
     * Close the menu when clicking outside of the control
     * @param {MouseEvent} event
     */
    function handleDocumentClick(event) {
        if (!controlElement) return;

        if (controlElement.contains(event.target)) {
            return;
        }

        closeMenu();
    }

    /**
     * Handle global keyboard shortcuts (escape to close)
     * @param {KeyboardEvent} event
     */
    function handleKeydown(event) {
        if (event.key === 'Escape') {
            closeMenu();
            toggleButton && toggleButton.focus();
        }
    }

    /**
     * Clean up event listeners on page unload (defensive)
     */
    window.addEventListener('beforeunload', () => {
        document.removeEventListener('click', handleDocumentClick);
        document.removeEventListener('keydown', handleKeydown);
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
