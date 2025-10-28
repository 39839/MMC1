(() => {
    try {
        const placeholder = document.getElementById('header-placeholder');
        if (!placeholder || placeholder.dataset.mmcHeaderInserted === 'true') {
            return;
        }

        const script = document.currentScript || document.querySelector('script[src*="critical-header.js"]');
        let basePath = '';

        if (script && script.src) {
            try {
                const scriptUrl = new URL(script.src, window.location.href);
                const baseUrl = new URL('..', scriptUrl);
                const href = baseUrl.href;
                basePath = href.endsWith('/') ? href : href + '/';
            } catch (error) {
                console.warn('MMC critical header: unable to resolve base path from script.', error);
            }
        }

        if (!basePath) {
            try {
                const pathName = window.location.pathname;
                const pathSegments = pathName.split('/').filter(Boolean);
                const inBlogPosts = pathSegments.includes('blog-posts');
                const inPages = pathSegments.includes('pages');
                const depth = inBlogPosts ? 2 : (inPages ? 1 : 0);
                const relativeFallback = depth > 0 ? '../'.repeat(depth) : '';
                const fallbackUrl = new URL(relativeFallback || './', window.location.href);
                const href = fallbackUrl.href;
                basePath = href.endsWith('/') ? href : href + '/';
            } catch (error) {
                console.warn('MMC critical header: falling back to root.', error);
                basePath = '/';
            }
        }

        const request = new XMLHttpRequest();
        request.open('GET', basePath + 'includes/header.html', false);
        request.send(null);

        if (request.status >= 200 && request.status < 300) {
            placeholder.innerHTML = request.responseText;
            placeholder.dataset.mmcHeaderInserted = 'true';
            placeholder.dataset.mmcHeaderBasePath = basePath;

            const logoImg = placeholder.querySelector('.logo-img');
            if (logoImg) {
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
        } else {
            console.error('Critical header load failed with status:', request.status);
        }
    } catch (error) {
        console.error('Critical header load error:', error);
    }
})();
