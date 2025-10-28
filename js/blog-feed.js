(() => {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid) return;

    const statusCard = document.getElementById('dynamic-feed-status');

    const setStatus = (message, tone = 'info') => {
        if (!statusCard) return;
        statusCard.textContent = message;
        statusCard.dataset.tone = tone;
        statusCard.classList.remove('hidden');
    };

    const clearStatus = () => {
        if (!statusCard) return;
        statusCard.textContent = '';
        statusCard.classList.add('hidden');
        delete statusCard.dataset.tone;
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

    const categoryMeta = {
        'primary-care': { label: 'Primary Care', badgeClass: 'bg-brand-blue/10 text-brand-blue' },
        'dermatology': { label: 'Dermatology', badgeClass: 'bg-pink-100 text-pink-600' },
        'occupational': { label: 'Occupational Health', badgeClass: 'bg-deep-blue/10 text-deep-blue' },
        'acupuncture': { label: 'Acupuncture', badgeClass: 'bg-emerald-100 text-emerald-700' },
        'wellness': { label: 'Wellness', badgeClass: 'bg-yellow-100 text-yellow-700' },
        'sports-medicine': { label: 'Sports Medicine', badgeClass: 'bg-orange-100 text-brand-orange' },
        default: { label: 'Clinic Updates', badgeClass: 'bg-brand-blue/10 text-brand-blue' }
    };

    const formatDate = (input) => {
        if (!input) return '';
        if (typeof input === 'string') {
            return new Date(input).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        }
        if (input instanceof Date) {
            return input.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        }
        if (input.toDate) {
            return input.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return '';
    };

    const sanitize = (value) => {
        const template = document.createElement('div');
        template.textContent = value || '';
        return template.innerHTML;
    };

    const createCard = (post, index) => {
        const category = categoryMeta[post.category] || categoryMeta.default;
        const article = document.createElement('article');
        article.className = 'blog-card bg-white rounded-2xl shadow-md overflow-hidden';
        article.dataset.category = post.category || 'primary-care';
        article.dataset.id = post.slug;
        article.setAttribute('data-aos', 'fade-up');
        if (index) {
            article.setAttribute('data-aos-delay', String(Math.min(index * 60, 240)));
        }

        const heroImage = post.heroImage || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80';
        const readTime = post.readTime || '4 min read';
        const authorInitials = sanitize(post.authorInitials || (post.authorName ? post.authorName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase() : 'MM'));
        const authorName = sanitize(post.authorName || 'Montgomery Medical Clinic');
        const summary = sanitize(post.summary || '');
        const date = formatDate(post.publishedAt || post.createdAt);
        const cardLink = `blog-entry.html?slug=${encodeURIComponent(post.slug)}`;

        article.innerHTML = `
            <a href="${cardLink}" class="block">
                <div class="blog-image-container aspect-video">
                    <img src="${heroImage}" alt="${sanitize(post.title)}" class="blog-image w-full h-full object-cover" loading="lazy">
                </div>
                <div class="p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="department-badge inline-block px-3 py-1 ${category.badgeClass} text-xs font-bold rounded-full uppercase tracking-wider">${category.label}</span>
                        <span class="text-sm text-medium-gray">${readTime}</span>
                    </div>
                    <h3 class="text-xl font-bold text-dark-gray mb-3 leading-tight hover:text-brand-blue transition-colors">
                        ${sanitize(post.title)}
                    </h3>
                    <p class="text-medium-gray text-sm leading-relaxed mb-4">
                        ${summary || 'Tap to read the latest from our care team.'}
                    </p>
                    <div class="flex items-center gap-3 text-sm">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-light-blue flex items-center justify-center text-white font-bold text-xs">
                                ${authorInitials}
                            </div>
                            <span class="font-semibold text-dark-gray">${authorName}</span>
                        </div>
                        <span class="text-medium-gray">•</span>
                        <span class="text-medium-gray">${date}</span>
                    </div>
                </div>
            </a>
        `;

        return article;
    };

    const renderPosts = (posts) => {
        if (!posts.length) return;
        const fragment = document.createDocumentFragment();
        posts.forEach((post, index) => {
            fragment.appendChild(createCard(post, index));
        });
        blogGrid.prepend(fragment);
        document.dispatchEvent(new CustomEvent('blog-posts-updated'));
    };

    const fetchPosts = async () => {
        if (!window.firebaseConfig) {
            setStatus('Dynamic feed disabled. Add Firebase credentials in js/firebase-config.js to unlock live posts.', 'info');
            return;
        }
        const hasPlaceholder = Object.values(window.firebaseConfig)
            .some(value => typeof value === 'string' && value.startsWith('YOUR_'));
        if (hasPlaceholder) {
            setStatus('Dynamic feed awaiting Firebase configuration. Update js/firebase-config.js to show employee posts.', 'info');
            return;
        }

        try {
            await lazyImport('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
            await lazyImport('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js');

            const app = firebase.apps && firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(window.firebaseConfig);
            const db = firebase.firestore(app);

            clearStatus();
            const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').limit(50).get();
            const posts = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(post => (post.status || 'draft') === 'published' && post.slug);

            renderPosts(posts);
        } catch (error) {
            console.error('Failed to load dynamic posts', error);
            setStatus('Live posts are temporarily unavailable. Please retry later or check Firestore rules.', 'error');
        }
    };

    fetchPosts();
})();
