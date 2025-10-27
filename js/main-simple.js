// Montgomery Medical Clinic - Enhanced Main JavaScript with Perfect Dropdown

let headerEnhancementsInitialized = false;

function initHeaderEnhancements() {
    if (headerEnhancementsInitialized) {
        return;
    }

    const servicesButton = document.getElementById('services-button');
    const servicesDropdown = document.getElementById('services-dropdown');
    const mobileMenuButton = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const header = document.querySelector('header');

    if (!servicesButton || !servicesDropdown || !mobileMenuButton || !mobileMenu || !header) {
        return;
    }

    headerEnhancementsInitialized = true;

    let isDropdownOpen = false;
    let closeTimer = null;
    const dropdownWrapper = servicesButton.closest('.services-dropdown-wrapper');

    // Position dropdown using fixed positioning for consistency
    function positionDropdown() {
        const buttonRect = servicesButton.getBoundingClientRect();
        const dropdownWidth = servicesDropdown.offsetWidth || 360;
        
        // Calculate center position
        const buttonCenter = buttonRect.left + (buttonRect.width / 2);
        
        // Calculate dropdown left position (centered under button)
        let dropdownLeft = buttonCenter - (dropdownWidth / 2);
        
        // Ensure dropdown doesn't go off screen
        const minLeft = 16; // 16px padding from edge
        const maxLeft = window.innerWidth - dropdownWidth - 16;
        dropdownLeft = Math.max(minLeft, Math.min(dropdownLeft, maxLeft));
        
        // Position directly below button
        const dropdownTop = buttonRect.bottom + 8;
        
        // Apply positioning
        servicesDropdown.style.left = `${dropdownLeft}px`;
        servicesDropdown.style.top = `${dropdownTop}px`;
        
        // Center the arrow under the button
        const arrowOffset = buttonCenter - dropdownLeft;
        servicesDropdown.style.setProperty('--arrow-offset', `${arrowOffset}px`);
    }

    function showDropdown() {
        clearTimeout(closeTimer);
        
        // Position first
        positionDropdown();
        
        // Show dropdown
        servicesDropdown.classList.add('show');
        servicesDropdown.style.display = 'block';
        
        // Force reflow for smooth transition
        servicesDropdown.offsetHeight;
        
        servicesDropdown.style.opacity = '1';
        servicesDropdown.style.visibility = 'visible';
        servicesDropdown.style.pointerEvents = 'auto';
        
        isDropdownOpen = true;
    }

    function hideDropdown() {
        servicesDropdown.classList.remove('show');
        servicesDropdown.style.opacity = '0';
        servicesDropdown.style.visibility = 'hidden';
        servicesDropdown.style.pointerEvents = 'none';
        
        closeTimer = setTimeout(() => {
            if (!isDropdownOpen) {
                servicesDropdown.style.display = 'none';
            }
        }, 300);
        
        isDropdownOpen = false;
    }

    // Desktop: Show on hover
    if (dropdownWrapper) {
        dropdownWrapper.addEventListener('mouseenter', () => {
            if (window.innerWidth >= 1280) {
                showDropdown();
            }
        });

        dropdownWrapper.addEventListener('mouseleave', (event) => {
            if (window.innerWidth >= 1280) {
                const related = event.relatedTarget;
                if (!servicesDropdown.contains(related)) {
                    hideDropdown();
                }
            }
        });
    }

    // Keep dropdown open when hovering over it
    servicesDropdown.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 1280) {
            clearTimeout(closeTimer);
            isDropdownOpen = true;
        }
    });

    servicesDropdown.addEventListener('mouseleave', (event) => {
        if (window.innerWidth >= 1280) {
            const related = event.relatedTarget;
            if (!dropdownWrapper.contains(related)) {
                hideDropdown();
            }
        }
    });

    // Mobile: Toggle on click
    servicesButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        if (window.innerWidth < 1280) {
            if (isDropdownOpen) {
                hideDropdown();
            } else {
                showDropdown();
            }
        }
    });

    // Close on click outside
    document.addEventListener('click', (event) => {
        if (isDropdownOpen && 
            !servicesButton.contains(event.target) && 
            !servicesDropdown.contains(event.target)) {
            hideDropdown();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isDropdownOpen) {
            hideDropdown();
        }
    });

    // Reposition on scroll and resize
    let repositionTimer;
    function handleRepositioning() {
        if (isDropdownOpen) {
            clearTimeout(repositionTimer);
            repositionTimer = setTimeout(positionDropdown, 10);
        }
    }
    
    window.addEventListener('scroll', handleRepositioning, { passive: true });
    window.addEventListener('resize', handleRepositioning);

    // Mobile menu functionality
    if (typeof mobileMenuButton.__mmcFallbackToggle__ === 'function') {
        mobileMenuButton.removeEventListener('click', mobileMenuButton.__mmcFallbackToggle__);
        mobileMenuButton.__mmcFallbackToggle__ = null;
    }

    if (typeof mobileMenu.__mmcFallbackClose__ === 'function') {
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.removeEventListener('click', mobileMenu.__mmcFallbackClose__);
        });
        mobileMenu.__mmcFallbackClose__ = null;
    }

    if (typeof mobileMenu.__mmcFallbackDocumentHandler__ === 'function') {
        document.removeEventListener('click', mobileMenu.__mmcFallbackDocumentHandler__);
        mobileMenu.__mmcFallbackDocumentHandler__ = null;
    }

    if (typeof mobileMenu.__mmcFallbackResizeHandler__ === 'function') {
        window.removeEventListener('resize', mobileMenu.__mmcFallbackResizeHandler__);
        window.removeEventListener('orientationchange', mobileMenu.__mmcFallbackResizeHandler__);
        mobileMenu.__mmcFallbackResizeHandler__ = null;
    }

    mobileMenuButton.dataset.mmcMobileMenuEnhanced = 'true';
    mobileMenuButton.setAttribute('aria-controls', 'mobile-menu');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    mobileMenuButton.classList.remove('active');
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('is-open');

    const iconPath = mobileMenuButton.querySelector('svg path');

    const updateMenuVisualState = (isOpen) => {
        mobileMenuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.classList.toggle('mobile-menu-open', isOpen);
        mobileMenuButton.classList.toggle('active', isOpen);
        mobileMenu.classList.toggle('is-open', isOpen);

        if (iconPath) {
            iconPath.setAttribute(
                'd',
                isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'
            );
        }
    };

    const openMobileMenu = () => {
        mobileMenu.classList.remove('hidden');
        updateMenuVisualState(true);
    };

    const closeMobileMenu = () => {
        mobileMenu.classList.add('hidden');
        updateMenuVisualState(false);
    };

    mobileMenuButton.addEventListener('click', () => {
        if (mobileMenu.classList.contains('hidden')) {
            openMobileMenu();
        } else {
            closeMobileMenu();
        }
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    document.addEventListener('click', (event) => {
        if (mobileMenu.classList.contains('hidden')) {
            return;
        }

        if (mobileMenu.contains(event.target) || mobileMenuButton.contains(event.target)) {
            return;
        }

        closeMobileMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            closeMobileMenu();
        }
    });

    const handleViewportChange = () => {
        if (window.innerWidth >= 1280 && !mobileMenu.classList.contains('hidden')) {
            closeMobileMenu();
        }
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);

    // Header shadow on scroll
    function updateHeaderShadow() {
        if (window.pageYOffset > 100) {
            header.classList.add('shadow-lg');
        } else {
            header.classList.remove('shadow-lg');
        }
    }

    window.addEventListener('scroll', updateHeaderShadow);
    updateHeaderShadow();
}

// Initialize everything on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('MMC Website Loaded');
    
    // Initialize contact modal
    initContactModal();
    
    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        setTimeout(() => {
            AOS.init({
                duration: 800,
                once: true,
                offset: 100,
                easing: 'ease-in-out'
            });
        }, 150);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (event) {
            const href = this.getAttribute('href');
            if (href && href !== '#' && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    event.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Initialize header enhancements
    initHeaderEnhancements();

    // Start slideshow if function exists
    if (typeof showSlides === 'function') {
        showSlides();
    }
});

// Re-initialize on header load
document.addEventListener('mmc:header-ready', initHeaderEnhancements);

// Contact Modal Functionality
function initContactModal() {
    const modal = document.getElementById('contact-modal');
    const triggers = document.querySelectorAll('[data-contact-trigger]');
    const closeButtons = document.querySelectorAll('[data-contact-close]');
    
    if (!modal) return;
    
    // Open modal
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Initialize contact modal
document.addEventListener('DOMContentLoaded', initContactModal);
document.addEventListener('mmc:header-ready', initContactModal);

// Debug function for testing
window.testDropdown = function() {
    const dropdown = document.getElementById('services-dropdown');
    if (dropdown) {
        console.log('Testing dropdown visibility...');
        dropdown.classList.add('show');
        dropdown.style.display = 'block';
        dropdown.style.opacity = '1';
        dropdown.style.visibility = 'visible';
        dropdown.style.pointerEvents = 'auto';
        console.log('Dropdown should now be visible');
        
        const links = dropdown.querySelectorAll('.dropdown-link');
        console.log(`Found ${links.length} dropdown links:`);
        links.forEach(link => console.log('- ' + link.textContent.trim()));
    } else {
        console.error('Dropdown element not found!');
    }
};
