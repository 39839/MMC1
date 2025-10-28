(() => {
    const statusBanner = document.getElementById('entry-status');
    const contentShell = document.getElementById('entry-shell');
    const titleEl = document.getElementById('entry-title');
    const badgeEl = document.getElementById('entry-category');
    const readTimeEl = document.getElementById('entry-readtime');
    const dateEl = document.getElementById('entry-date');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    const authorNameHeroEl = document.getElementById('entry-author');
    const authorTitleHeroEl = document.getElementById('entry-author-title');
    const authorInitialsHeroEl = document.getElementById('entry-author-initials');
    const heroImgEl = document.getElementById('entry-hero-img');
    const highlightEl = document.getElementById('entry-highlight');
    const contentEl = document.getElementById('entry-content');
    const shareFacebookBtn = document.getElementById('share-facebook-btn');
    const shareTwitterBtn = document.getElementById('share-twitter-btn');
    const shareEmailBtn = document.getElementById('share-email-btn');
    const authorBioNameEl = document.getElementById('author-bio-name');
    const authorBioTitleEl = document.getElementById('author-bio-title');
    const authorBioDescriptionEl = document.getElementById('author-bio-description');
    const authorBioAvatarEl = document.getElementById('author-bio-avatar');
    const relatedSection = document.getElementById('related-posts-section');
    const relatedGrid = document.getElementById('related-posts');
    const metaDescriptionTag = document.querySelector('meta[name="description"]');

    const categoryMeta = {
        'primary-care': {
            label: 'Primary Care',
            heroClass: 'bg-white/20 text-white border border-white/25',
            cardClass: 'bg-brand-blue/10 text-brand-blue'
        },
        'dermatology': {
            label: 'Dermatology',
            heroClass: 'bg-pink-500/20 text-white border border-white/20',
            cardClass: 'bg-pink-100 text-pink-600'
        },
        'occupational': {
            label: 'Occupational Health',
            heroClass: 'bg-emerald-400/20 text-white border border-white/20',
            cardClass: 'bg-deep-blue/10 text-deep-blue'
        },
        'acupuncture': {
            label: 'Acupuncture',
            heroClass: 'bg-amber-400/25 text-white border border-white/20',
            cardClass: 'bg-emerald-100 text-emerald-700'
        },
        'wellness': {
            label: 'Wellness',
            heroClass: 'bg-brand-orange/30 text-white border border-white/20',
            cardClass: 'bg-yellow-100 text-yellow-700'
        },
        'sports-medicine': {
            label: 'Sports Medicine',
            heroClass: 'bg-sky-400/20 text-white border border-white/20',
            cardClass: 'bg-orange-100 text-brand-orange'
        },
        default: {
            label: 'Clinic Updates',
            heroClass: 'bg-white/20 text-white border border-white/25',
            cardClass: 'bg-brand-blue/10 text-brand-blue'
        }
    };

    const formatDate = (input) => {
        if (!input) return '';
        if (typeof input === 'string') {
            return new Date(input).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
        }
        if (input instanceof Date) {
            return input.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
        }
        if (input.toDate) {
            return input.toDate().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
        }
        return '';
    };

    const truncate = (value, length) => {
        if (!value) return '';
        return value.length > length ? `${value.slice(0, length)}…` : value;
    };

    const escapeHtml = (value = '') => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return value.replace(/[&<>"']/g, char => map[char]);
    };

    const setStatus = (message, tone = 'info') => {
        if (!statusBanner) return;
        statusBanner.textContent = message;
        statusBanner.dataset.tone = tone;
        statusBanner.classList.remove('hidden');
    };

    const clearStatus = () => {
        if (!statusBanner) return;
        statusBanner.textContent = '';
        statusBanner.classList.add('hidden');
        delete statusBanner.dataset.tone;
    };

    const lazyImport = (src) => new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });

    const updateMetaTags = (post) => {
        const title = post.title ? `${post.title} | Montgomery Medical Clinic Blog` : 'Story | Montgomery Medical Clinic Blog';
        document.title = title;
        const description = post.summary || post.excerpt || 'Expert insights from the Montgomery Medical Clinic care team.';
        metaDescriptionTag?.setAttribute('content', description);
    };

    const decorateLinks = (root) => {
        root.querySelectorAll('a').forEach(link => {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.classList.add('text-brand-blue', 'font-semibold', 'underline', 'underline-offset-4');
        });
        root.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.loading = 'lazy';
            }
            img.classList.add('mx-auto');
        });
    };

    const computeInitials = (source) => {
        if (!source) return 'MMC';
        const parts = source.split(' ').filter(Boolean);
        if (!parts.length) return 'MMC';
        const initials = parts.map(part => part[0]).join('');
        return initials.slice(0, 3).toUpperCase();
    };

    const openShareWindow = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
    };

    const createRelatedCard = (post, index) => {
        const category = categoryMeta[post.category] || categoryMeta.default;
        const title = escapeHtml(post.title || 'Clinic Update');
        const summary = escapeHtml(post.summary || post.excerpt || 'Read the latest insight from our care team.');

        const card = document.createElement('a');
        card.href = `blog-entry.html?slug=${encodeURIComponent(post.slug)}`;
        card.className = 'block p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-brand-blue transition-all';
        card.setAttribute('data-aos', 'fade-up');
        if (typeof index === 'number') {
            card.setAttribute('data-aos-delay', String(Math.min(index * 80, 200)));
        }

        card.innerHTML = `
            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${category.cardClass}">
                ${category.label}
            </span>
            <h4 class="text-lg font-bold text-dark-gray mb-2">${title}</h4>
            <p class="text-medium-gray text-sm">${summary}</p>
        `;

        return card;
    };

    const createViewAllCard = () => {
        const link = document.createElement('a');
        link.href = 'blog.html';
        link.className = 'block p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-brand-blue transition-all';
        link.setAttribute('data-aos', 'fade-up');
        link.setAttribute('data-aos-delay', '240');
        link.innerHTML = `
            <span class="inline-block px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full uppercase tracking-wider mb-3">Blog</span>
            <h4 class="text-lg font-bold text-dark-gray mb-2">View All Blog Posts</h4>
            <p class="text-medium-gray text-sm">Explore more health tips and medical insights from our expert team.</p>
        `;
        return link;
    };

    const loadRelatedPosts = async (db, currentSlug, currentCategory) => {
        if (!relatedSection || !relatedGrid) return;
        try {
            const snapshot = await db.collection('posts')
                .orderBy('createdAt', 'desc')
                .limit(12)
                .get();

            const posts = snapshot.docs
                .map(doc => ({ slug: doc.id, ...doc.data() }))
                .filter(post => post.slug !== currentSlug && (post.status || 'draft') === 'published');

            relatedGrid.innerHTML = '';

            const prioritized = [
                ...posts.filter(post => post.category === currentCategory),
                ...posts.filter(post => post.category !== currentCategory)
            ];

            const selection = prioritized.slice(0, 2);
            selection.forEach((post, index) => {
                relatedGrid.appendChild(createRelatedCard(post, index));
            });

            relatedGrid.appendChild(createViewAllCard());
            relatedSection.classList.remove('hidden');
        } catch (error) {
            console.warn('Unable to load related posts', error);
        }
    };

    const renderPost = (post, db) => {
        const category = categoryMeta[post.category] || categoryMeta.default;
        const readTime = post.readTime || '5 min read';
        const date = formatDate(post.publishedAt || post.createdAt);
        const authorName = post.authorName || 'Montgomery Medical Clinic';
        const authorTitle = post.authorCredentials || post.authorTitle || '';
        const heroImg = post.heroImage || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80';
        const summary = post.summary || '';
        const authorBio = post.authorBio || post.authorDescription || '';

        titleEl.textContent = post.title || 'Untitled Story';
        badgeEl.textContent = category.label;
        badgeEl.className = `inline-block px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-6 ${category.heroClass}`;
        readTimeEl.textContent = readTime;
        dateEl.textContent = date || 'Updated recently';
        authorNameHeroEl.textContent = authorName;
        authorInitialsHeroEl.textContent = computeInitials(post.authorInitials || authorName);

        if (authorTitle) {
            authorTitleHeroEl.textContent = authorTitle;
            authorTitleHeroEl.classList.remove('hidden');
        } else {
            authorTitleHeroEl.textContent = '';
            authorTitleHeroEl.classList.add('hidden');
        }

        if (heroImgEl) {
            heroImgEl.style.opacity = '0';
            heroImgEl.style.transform = 'scale(1.03)';
            heroImgEl.onload = () => {
                heroImgEl.style.opacity = '1';
                heroImgEl.style.transform = 'scale(1)';
            };
            heroImgEl.onerror = () => {
                heroImgEl.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80';
                heroImgEl.style.opacity = '1';
                heroImgEl.style.transform = 'scale(1)';
            };
            heroImgEl.src = heroImg;
            heroImgEl.alt = post.title || 'Clinic blog feature image';
        }

        if (summary && highlightEl) {
            highlightEl.textContent = summary;
            highlightEl.classList.remove('hidden');
        } else if (highlightEl) {
            highlightEl.textContent = '';
            highlightEl.classList.add('hidden');
        }

        breadcrumbCurrent.textContent = truncate(post.title || 'Story', 42);

        contentEl.innerHTML = post.content || '<p>This story is coming soon. Check back shortly!</p>';
        decorateLinks(contentEl);

        if (authorBioNameEl) {
            authorBioNameEl.textContent = authorName;
        }
        if (authorBioTitleEl) {
            authorBioTitleEl.textContent = authorTitle || 'Montgomery Medical Clinic Care Team';
        }
        if (authorBioDescriptionEl) {
            authorBioDescriptionEl.textContent = authorBio || 'Articles published through the Montgomery Blog Studio are written or reviewed by our medical professionals to deliver accurate, compassionate guidance for our community.';
        }
        if (authorBioAvatarEl) {
            authorBioAvatarEl.textContent = computeInitials(post.authorInitials || authorName);
        }

        updateMetaTags(post);

        const currentUrl = window.location.href;

        if (shareFacebookBtn) {
            shareFacebookBtn.onclick = () => {
                openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`);
            };
        }

        if (shareTwitterBtn) {
            shareTwitterBtn.onclick = () => {
                const text = encodeURIComponent(post.title || 'Montgomery Medical Clinic Blog');
                openShareWindow(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${text}`);
            };
        }

        if (shareEmailBtn) {
            shareEmailBtn.onclick = () => {
                const subject = encodeURIComponent(post.title || 'Montgomery Medical Clinic Blog');
                const body = encodeURIComponent(`${summary ? summary + '\n\n' : ''}${currentUrl}`);
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
            };
        }

        clearStatus();
        contentShell.classList.remove('hidden');

        if (window.AOS) {
            window.AOS.init({ duration: 800, once: true });
            setTimeout(() => window.AOS.refreshHard(), 400);
        }

        if (db) {
            loadRelatedPosts(db, post.slug, post.category);
        }
    };

    const loadPost = async (slug) => {
        if (!window.firebaseConfig) {
            setStatus('Dynamic stories require Firebase configuration. Add your credentials in js/firebase-config.js.', 'error');
            return;
        }

        const hasPlaceholder = Object.values(window.firebaseConfig)
            .some(value => typeof value === 'string' && value.startsWith('YOUR_'));
        if (hasPlaceholder) {
            setStatus('Finish wiring Firebase credentials to load employee-authored posts.', 'error');
            return;
        }

        try {
            await lazyImport('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
            await lazyImport('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js');

            const app = firebase.apps && firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(window.firebaseConfig);
            const db = firebase.firestore(app);

            const doc = await db.collection('posts').doc(slug).get();
            if (!doc.exists) {
                setStatus('We could not find that story. Double-check the link or pick another article from the blog.', 'error');
                return;
            }
            const data = doc.data();
            if ((data.status || 'draft') !== 'published') {
                setStatus('This story is still in draft mode. Ask the author to publish when ready.', 'info');
                return;
            }

            renderPost({ slug, ...data }, db);
        } catch (error) {
            console.error('Failed to load blog entry', error);
            setStatus('Something went wrong while loading this story. Please refresh or contact an administrator.', 'error');
        }
    };

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) {
        setStatus('Missing article reference. Return to the blog and pick a story to read.', 'error');
        return;
    }

    loadPost(slug);
})();
