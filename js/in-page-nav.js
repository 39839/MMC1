document.addEventListener('DOMContentLoaded', () => {
    const navTargets = Array.from(document.querySelectorAll('[data-page-nav]')).filter((el) => el.id);

    if (!navTargets.length) {
        return;
    }

    const nav = document.createElement('nav');
    nav.id = 'page-nav';
    nav.className = 'hidden lg:hidden fixed top-1/2 z-50 opacity-0 pointer-events-none transition-opacity duration-300';

    const list = document.createElement('ul');
    list.className = 'page-nav-list space-y-1';

    navTargets.forEach((target) => {
        const label =
            target.dataset.pageNavTitle ||
            target.getAttribute('data-page-nav-title') ||
            target.getAttribute('aria-label') ||
            (target.querySelector('h1, h2, h3, h4') ? target.querySelector('h1, h2, h3, h4').textContent.trim() : target.id.replace(/-/g, ' '));

        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${target.id}`;
        link.className = 'nav-link group flex items-center rounded-lg transition-all duration-300';

        const indicator = document.createElement('span');
        indicator.className = 'nav-indicator';

        const text = document.createElement('span');
        text.className = 'nav-text font-medium text-medium-gray group-hover:text-brand-blue transition-colors duration-300';
        text.textContent = label;

        link.appendChild(indicator);
        link.appendChild(text);
        listItem.appendChild(link);
        list.appendChild(listItem);
    });

    const navInner = document.createElement('div');
    navInner.className = 'page-nav-inner';
    navInner.setAttribute('aria-hidden', 'false');
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.id = 'page-nav-toggle';
    toggleButton.setAttribute('aria-label', 'Collapse in-page navigation');
    toggleButton.setAttribute('aria-expanded', 'true');

    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'toggle-icon';
    toggleIcon.setAttribute('aria-hidden', 'true');
    toggleIcon.textContent = '›';

    toggleButton.appendChild(toggleIcon);

    navInner.appendChild(list);

    nav.appendChild(navInner);
    nav.appendChild(toggleButton);

    document.body.appendChild(nav);

    const pageNav = nav;
    const navLinks = Array.from(pageNav.querySelectorAll('.nav-link'));

    if (!navLinks.length) {
        pageNav.remove();
        return;
    }

    const headerSection = document.querySelector('.page-header');
    const stopSections = (() => {
        const footerStops = Array.from(document.querySelectorAll('[data-page-nav-stop="footer"]'));
        if (footerStops.length) {
            return footerStops;
        }
        const fallbackFooter = document.getElementById('footer-placeholder');
        return fallbackFooter ? [fallbackFooter] : [];
    })();
    const firstTarget = navTargets[0];

    let canShowNav = false;
    let stopVisible = false;
    let isCollapsed = false;
    let navIsVisible = false;

    const updateLinkAccessibility = () => {
        const shouldEnable = navIsVisible && !isCollapsed;
        navInner.setAttribute('aria-hidden', String(!shouldEnable));
        navLinks.forEach((link) => {
            link.tabIndex = shouldEnable ? 0 : -1;
        });
    };

    const setCollapsed = (state) => {
        isCollapsed = state;
        pageNav.classList.toggle('collapsed', isCollapsed);
        toggleButton.setAttribute('aria-expanded', String(!isCollapsed));
        toggleButton.setAttribute('aria-label', isCollapsed ? 'Expand in-page navigation' : 'Collapse in-page navigation');
        updateLinkAccessibility();
    };

    setCollapsed(false);

    toggleButton.addEventListener('click', () => {
        setCollapsed(!isCollapsed);
    });

    const updateNavVisibility = () => {
        const isLargeScreen = window.matchMedia('(min-width: 1024px)').matches;
        navIsVisible = canShowNav && !stopVisible && isLargeScreen;

        if (navIsVisible) {
            pageNav.classList.remove('hidden');
            pageNav.classList.add('visible');
            pageNav.classList.remove('lg:hidden');
            pageNav.classList.add('lg:block');
        } else {
            pageNav.classList.remove('visible');
            pageNav.classList.add('hidden');
            pageNav.classList.add('lg:hidden');
            pageNav.classList.remove('lg:block');
        }

        updateLinkAccessibility();
    };

    if (headerSection) {
        let headerTrigger = 0;

        const recalcTrigger = () => {
            headerTrigger = Math.max(headerSection.offsetHeight - 90, 0);
        };

        const handleHeaderScroll = () => {
            canShowNav = window.scrollY >= headerTrigger;
            updateNavVisibility();
        };

        recalcTrigger();

        window.addEventListener('resize', () => {
            recalcTrigger();
            handleHeaderScroll();
        });

        window.addEventListener('scroll', handleHeaderScroll, { passive: true });
        handleHeaderScroll();
    } else if (firstTarget) {
        let fallbackTrigger = Math.max(firstTarget.offsetTop - 60, 0);

        const recalcFallbackTrigger = () => {
            fallbackTrigger = Math.max(firstTarget.offsetTop - 60, 0);
        };

        const handleScroll = () => {
            canShowNav = window.scrollY >= fallbackTrigger;
            updateNavVisibility();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', () => {
            recalcFallbackTrigger();
            handleScroll();
        });

        handleScroll();
    }

    // Enhanced footer detection - hide nav when footer reaches 50% of viewport
    if (stopSections.length) {
        const stopVisibility = new Map(stopSections.map((section) => [section, false]));

        const stopObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // Check if footer has reached 50% of the viewport
                    const footerTop = entry.target.getBoundingClientRect().top;
                    const viewportHeight = window.innerHeight;
                    const footerAt50Percent = footerTop <= viewportHeight * 0.5;
                    
                    stopVisibility.set(entry.target, footerAt50Percent);
                });

                stopVisible = Array.from(stopVisibility.values()).some(Boolean);
                updateNavVisibility();
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            }
        );

        stopSections.forEach((section) => stopObserver.observe(section));
    }

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach((link) => link.classList.remove('active'));

                const activeLink = pageNav.querySelector(`a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    navTargets.forEach((target) => observer.observe(target));

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const dest = document.getElementById(targetId);

            if (!dest) {
                return;
            }

            const yOffset = -100;
            const y = dest.getBoundingClientRect().top + window.pageYOffset + yOffset;

            window.scrollTo({
                top: y,
                behavior: 'smooth',
            });

            // Enhanced accordion handling - open the accordion if it exists
            if (dest.hasAttribute('data-page-nav-accordion')) {
                setTimeout(() => {
                    const accordionContent = document.getElementById(targetId + '-content');
                    const accordionHeader = dest.querySelector('.accordion-header');
                    const accordionIcon = accordionHeader ? accordionHeader.querySelector('.accordion-icon') : null;
                    
                    if (accordionContent && accordionHeader) {
                        // Close all other accordions first
                        document.querySelectorAll('.accordion-content').forEach(item => {
                            if (item.id !== targetId + '-content') {
                                item.classList.remove('active');
                            }
                        });
                        
                        document.querySelectorAll('.accordion-icon').forEach(item => {
                            if (item !== accordionIcon) {
                                item.classList.remove('active');
                            }
                        });
                        
                        // Open the target accordion
                        accordionContent.classList.add('active');
                        if (accordionIcon) {
                            accordionIcon.classList.add('active');
                        }
                    }
                }, 600);
            }
        });
    });

    const firstLink = navLinks[0];
    if (firstLink) {
        firstLink.classList.add('active');
    }
});
