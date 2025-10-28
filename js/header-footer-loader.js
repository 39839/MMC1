const MMC_SCRIPT_BASE_HREF = (() => {
    try {
        const script = document.currentScript || document.querySelector('script[src*="header-footer-loader.js"]');
        if (script && script.src) {
            const scriptUrl = new URL(script.src, window.location.href);
            const baseUrl = new URL('..', scriptUrl);
            const href = baseUrl.href;
            return href.endsWith('/') ? href : href + '/';
        }
    } catch (error) {
        console.warn('MMC header loader: unable to derive script base URL.', error);
    }

    try {
        const origin = window.location.origin || '';
        const pathname = window.location.pathname || '/';
        const normalizedPath = pathname.endsWith('/') ? pathname : pathname.slice(0, pathname.lastIndexOf('/') + 1);
        return `${origin}${normalizedPath}`;
    } catch (error) {
        console.warn('MMC header loader: falling back to root.', error);
        return '/';
    }
})();

function resolveBasePath(explicitBase) {
    if (explicitBase && explicitBase.trim()) {
        try {
            const absoluteUrl = new URL(explicitBase, window.location.href);
            const href = absoluteUrl.href;
            return href.endsWith('/') ? href : href + '/';
        } catch (error) {
            console.warn('MMC header loader: invalid explicit base path provided.', error);
        }
    }
    return MMC_SCRIPT_BASE_HREF;
}

let contactBarResizeObserver = null;
let resizeListenerAttached = false;
let resizeDebounceTimer = null;

function initHeaderFooter() {
    const pathName = window.location.pathname;
    const pathSegments = pathName.split('/').filter(Boolean);
    const currentFile = pathSegments[pathSegments.length - 1] || 'index.html';
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    const isHomePage = currentFile === 'index.html';
    const explicitBase = (headerPlaceholder && typeof headerPlaceholder.dataset.mmcHeaderBasePath === 'string')
        ? headerPlaceholder.dataset.mmcHeaderBasePath
        : '';
    const basePath = resolveBasePath(explicitBase);

    if (headerPlaceholder) {
        headerPlaceholder.dataset.mmcHeaderBasePath = basePath;
    }

    const headerAlreadyInjected = !!(headerPlaceholder &&
        headerPlaceholder.dataset.mmcHeaderInserted === 'true' &&
        headerPlaceholder.childElementCount > 0);

    const headerPromise = (!headerPlaceholder || headerAlreadyInjected)
        ? Promise.resolve()
        : fetch(basePath + 'includes/header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
                headerPlaceholder.dataset.mmcHeaderInserted = 'true';
            })
            .catch(error => {
                console.error('Error loading header:', error);
            });

    Promise.resolve(headerPromise).then(() => {
        if (!headerPlaceholder) {
            return;
        }

        updateHeaderLinks(basePath, isHomePage);
        initializeMobileMenu();
        initializeServicesDropdown();
        initializeContactModal();
        updateContactBarOffset();
        observeContactBarHeight();

        if (!resizeListenerAttached) {
            window.addEventListener('resize', handleWindowResize);
            window.addEventListener('orientationchange', handleWindowResize);
            window.addEventListener('load', updateContactBarOffset);
            resizeListenerAttached = true;
        }

        document.dispatchEvent(new CustomEvent('mmc:header-ready', {
            detail: {
                basePath,
                isHomePage
            }
        }));
    });

    if (footerPlaceholder) {
        fetch(basePath + 'includes/footer.html')
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
                updateFooterLinks(basePath);
            })
            .catch(error => console.error('Error loading footer:', error));
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderFooter, { once: true });
} else {
    initHeaderFooter();
}

// Update all header links based on current page location
function updateHeaderLinks(basePath, isHomePage) {
    // Update logo
    const logoLink = document.querySelector('.logo-link');
    const logoImg = document.querySelector('.logo-img');
    if (logoLink && logoImg) {
        logoLink.href = basePath + 'index.html';
        const logoWebp = basePath + 'images/Logo-fast.webp';
        const logoFallback = basePath + 'images/Logo.png';

        if (!logoImg.dataset.mmcLogoFallbackBound) {
            logoImg.addEventListener('error', function handleLogoError() {
                if (logoImg.dataset.mmcLogoFallbackUsed === 'true') {
                    return;
                }
                logoImg.dataset.mmcLogoFallbackUsed = 'true';
                logoImg.src = logoFallback;
            });
            logoImg.dataset.mmcLogoFallbackBound = 'true';
        }

        logoImg.src = logoWebp;
        logoImg.setAttribute('loading', 'eager');
        logoImg.setAttribute('decoding', 'sync');
        logoImg.setAttribute('fetchpriority', 'high');
        logoImg.width = 360;
        logoImg.height = 100;
    }
    
    // Define page mappings
    const pages = {
        'nav-home': 'index.html',
        'nav-urgent': 'pages/urgent-primary-care.html',
        'nav-sports': 'pages/sports-medicine.html',
        'nav-derma': 'pages/dermatology.html',
        'nav-acupuncture': 'pages/five-elements-acupuncture.html',
        'nav-wellness': 'pages/nutrition-wellness.html',
        'nav-occupational': 'pages/occupational-health.html',
        'nav-blog': 'pages/blog.html',
        'nav-about': 'pages/about.html',
        'nav-insurance': 'pages/insurance.html'
    };
    
    // Update desktop navigation links
    Object.keys(pages).forEach(className => {
        const link = document.querySelector('.' + className);
        if (link) {
            link.href = basePath + pages[className];
        }
    });
    
    // Update mobile navigation links
    Object.keys(pages).forEach(className => {
        const mobileLink = document.querySelector('.mobile-' + className);
        if (mobileLink) {
            mobileLink.href = basePath + pages[className];
        }
    });
    
    // Set active class based on current page
    setActiveNavLink();
}

// Update all footer links
function updateFooterLinks(basePath) {
    // Update footer logo
    const footerLogo = document.querySelector('.footer-logo');
    if (footerLogo) {
        const logoWebp = basePath + 'images/Logo-fast.webp';
        const logoFallback = basePath + 'images/Logo.png';

        if (!footerLogo.dataset.mmcLogoFallbackBound) {
            footerLogo.addEventListener('error', () => {
                if (footerLogo.dataset.mmcLogoFallbackUsed === 'true') {
                    return;
                }
                footerLogo.dataset.mmcLogoFallbackUsed = 'true';
                footerLogo.src = logoFallback;
            });
            footerLogo.dataset.mmcLogoFallbackBound = 'true';
        }

        footerLogo.src = logoWebp;
        footerLogo.setAttribute('loading', 'lazy');
        footerLogo.decoding = 'async';
    }
    
    // Define page mappings for footer
    const footerPages = {
        'footer-nav-urgent': 'pages/urgent-primary-care.html',
        'footer-nav-sports': 'pages/sports-medicine.html',
        'footer-nav-derma': 'pages/dermatology.html',
        'footer-nav-wellness': 'pages/nutrition-wellness.html',
        'footer-nav-occupational': 'pages/occupational-health.html',
        'footer-nav-careers': 'pages/careers.html'
    };
    
    // Update footer navigation links
    Object.keys(footerPages).forEach(className => {
        const link = document.querySelector('.' + className);
        if (link) {
            link.href = basePath + footerPages[className];
        }
    });
}

// Set active class on current page navigation link
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Remove all active classes first
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Map current page to navigation class
    const pageToNavClass = {
        'index.html': 'nav-home',
        'urgent-primary-care.html': 'nav-urgent',
        'sports-medicine.html': 'nav-sports',
        'dermatology.html': 'nav-derma',
        'five-elements-acupuncture.html': 'nav-acupuncture',
        'nutrition-wellness.html': 'nav-wellness',
        'occupational-health.html': 'nav-occupational',
        'blog.html': 'nav-blog',
        'about.html': 'nav-about',
        'insurance.html': 'nav-insurance'
    };
    
    let navClass = pageToNavClass[currentPage];
    if (!navClass) {
        const fullPath = window.location.pathname;
        if (fullPath.includes('/blog-posts/')) {
            navClass = 'nav-blog';
        }
    }
    if (navClass) {
        const activeLink = document.querySelector('.' + navClass);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
}

// Initialize mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.setAttribute('aria-controls', 'mobile-menu');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.dataset.mmcMobileMenuFallback = 'true';

        if (!mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
        mobileMenu.classList.remove('is-open');

        const fallbackToggle = () => {
            if (mobileMenuBtn.dataset.mmcMobileMenuEnhanced === 'true') {
                return;
            }

            const willOpen = mobileMenu.classList.contains('hidden');
            if (willOpen) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('is-open');
                document.body.classList.add('mobile-menu-open');
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
                mobileMenuBtn.classList.add('active');
            } else {
                mobileMenu.classList.remove('is-open');
                mobileMenu.classList.add('hidden');
                document.body.classList.remove('mobile-menu-open');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.classList.remove('active');
            }
        };

        const fallbackClose = () => {
            if (mobileMenuBtn.dataset.mmcMobileMenuEnhanced === 'true') {
                return;
            }

            mobileMenu.classList.remove('is-open');
            mobileMenu.classList.add('hidden');
            document.body.classList.remove('mobile-menu-open');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.classList.remove('active');
        };

        const handleDocumentClick = (event) => {
            if (mobileMenuBtn.dataset.mmcMobileMenuEnhanced === 'true') {
                return;
            }

            if (mobileMenu.classList.contains('hidden')) {
                return;
            }

            if (mobileMenu.contains(event.target) || mobileMenuBtn.contains(event.target)) {
                return;
            }

            fallbackClose();
        };

        const handleResize = () => {
            if (mobileMenuBtn.dataset.mmcMobileMenuEnhanced === 'true') {
                return;
            }

            if (window.innerWidth >= 1024) {
                fallbackClose();
            }
        };

        document.addEventListener('click', handleDocumentClick);
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        // Store references so enhanced scripts can remove if needed
        mobileMenuBtn.__mmcFallbackToggle__ = fallbackToggle;
        mobileMenu.__mmcFallbackClose__ = fallbackClose;
        mobileMenu.__mmcFallbackDocumentHandler__ = handleDocumentClick;
        mobileMenu.__mmcFallbackResizeHandler__ = handleResize;

        mobileMenuBtn.addEventListener('click', fallbackToggle);
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', fallbackClose);
        });
    }
}

        // Initialize services dropdown functionality
        function initializeServicesDropdown() {
            const servicesButton = document.getElementById('services-button');
            const servicesDropdown = document.getElementById('services-dropdown');
            const servicesArrow = document.getElementById('services-arrow');
            const dropdownWrapper = document.querySelector('.services-dropdown-wrapper');
            
            if (!servicesButton || !servicesDropdown || !dropdownWrapper) {
                console.warn('Dropdown elements not found, retrying in 100ms...');
                setTimeout(initializeServicesDropdown, 100);
                return;
            }
            
            let isOpen = false;
            let hoverTimeout = null;
            
            // Function to show dropdown
            function showDropdown() {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
                servicesDropdown.classList.add('active');
                if (servicesArrow) {
                    servicesArrow.classList.add('rotate-180');
                }
                isOpen = true;
            }
            
            const HOVER_HIDE_DELAY = 350;

            // Function to hide dropdown
            function hideDropdown(options = {}) {
                const { immediate = false } = options;
                clearTimeout(hoverTimeout);
                hoverTimeout = null;

                if (immediate || window.innerWidth <= 1024) {
                    servicesDropdown.classList.remove('active');
                    if (servicesArrow) {
                        servicesArrow.classList.remove('rotate-180');
                    }
                    isOpen = false;
                    hoverTimeout = null;
                    return;
                }

                hoverTimeout = setTimeout(() => {
                    servicesDropdown.classList.remove('active');
                    if (servicesArrow) {
                        servicesArrow.classList.remove('rotate-180');
                    }
                    isOpen = false;
                    hoverTimeout = null;
                }, HOVER_HIDE_DELAY);
            }
            
            // Desktop hover events
            dropdownWrapper.addEventListener('mouseenter', function() {
                if (window.innerWidth > 1024) {
                    showDropdown();
                }
            });
            
            dropdownWrapper.addEventListener('mouseleave', function() {
                if (window.innerWidth > 1024) {
                    hideDropdown();
                }
            });
            
            // Keep dropdown open when hovering over it
            servicesDropdown.addEventListener('mouseenter', function() {
                if (window.innerWidth > 1024) {
                    clearTimeout(hoverTimeout);
                }
            });
            
            servicesDropdown.addEventListener('mouseleave', function() {
                if (window.innerWidth > 1024) {
                    hideDropdown();
                }
            });
            
            // Mobile/tablet click events
            servicesButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (window.innerWidth <= 1024) {
                    if (isOpen) {
                        hideDropdown({ immediate: true });
                    } else {
                        showDropdown();
                    }
                }
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!dropdownWrapper.contains(e.target) && !servicesDropdown.contains(e.target)) {
                    if (isOpen) {
                        servicesDropdown.classList.remove('active');
                        if (servicesArrow) {
                            servicesArrow.classList.remove('rotate-180');
                        }
                        isOpen = false;
                    }
                }
            });
            
            // Close on Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && isOpen) {
                    servicesDropdown.classList.remove('active');
                    if (servicesArrow) {
                        servicesArrow.classList.remove('rotate-180');
                    }
                    isOpen = false;
                }
            });
            
            // Handle window resize
            window.addEventListener('resize', function() {
                if (window.innerWidth > 1024 && isOpen) {
                    // On desktop, rely on CSS hover states
                    servicesDropdown.classList.remove('active');
                    if (servicesArrow) {
                        servicesArrow.classList.remove('rotate-180');
                    }
                    isOpen = false;
                }
            });
            
            console.log('Services dropdown initialized successfully');
        }

function initializeContactModal() {
    const modal = document.getElementById('contact-modal');
    const contactTriggers = document.querySelectorAll('[data-contact-trigger]');

    if (!modal || contactTriggers.length === 0) {
        return;
    }

    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }

    if (modal.dataset.modalInitialized === 'true') {
        return;
    }

    modal.dataset.modalInitialized = 'true';

    const closeButton = modal.querySelector('[data-contact-close]');
    const contactOptions = modal.querySelectorAll('[data-contact-option]');
    const body = document.body;
    const mobileMenu = document.getElementById('mobile-menu');
    let lastFocusedElement = null;

    function openModal(event) {
        event.preventDefault();
        lastFocusedElement = document.activeElement;
        modal.classList.add('active');
        body.classList.add('modal-open');

        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }

        const focusTarget = closeButton || modal.querySelector('[data-contact-option]');
        if (focusTarget && typeof focusTarget.focus === 'function') {
            focusTarget.focus();
        }
    }

    function closeModal() {
        if (!modal.classList.contains('active')) {
            return;
        }

        modal.classList.remove('active');
        body.classList.remove('modal-open');

        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
    }

    contactTriggers.forEach(trigger => {
        trigger.addEventListener('click', openModal);
    });

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

    contactOptions.forEach(option => {
        option.addEventListener('click', closeModal);
    });
}

function updateContactBarOffset() {
    const topContactBar = document.querySelector('.top-contact-bar');
    const root = document.documentElement;

    if (topContactBar) {
        const height = topContactBar.offsetHeight;
        root.style.setProperty('--top-contact-bar-height', `${height}px`);
    } else {
        root.style.removeProperty('--top-contact-bar-height');
    }
}

function observeContactBarHeight() {
    if (typeof ResizeObserver === 'undefined') {
        return;
    }

    const topContactBar = document.querySelector('.top-contact-bar');
    if (!topContactBar) {
        return;
    }

    if (contactBarResizeObserver) {
        contactBarResizeObserver.disconnect();
    }

    contactBarResizeObserver = new ResizeObserver(() => {
        updateContactBarOffset();
    });

    contactBarResizeObserver.observe(topContactBar);
}

function handleWindowResize() {
    if (resizeDebounceTimer) {
        clearTimeout(resizeDebounceTimer);
    }

    resizeDebounceTimer = setTimeout(() => {
        updateContactBarOffset();
    }, 150);
}
