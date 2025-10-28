(() => {
    const loginSection = document.getElementById('admin-login');
    const editorSection = document.getElementById('admin-editor');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const postForm = document.getElementById('post-form');
    const statusBanner = document.getElementById('admin-status');
    const submitBtn = document.getElementById('submit-post-btn');
    const loginBtn = document.getElementById('login-btn');
    const autoslugToggle = document.getElementById('autoslug-toggle');
    const slugInput = document.getElementById('post-slug');
    const titleInput = document.getElementById('post-title');
    const formResetBtn = document.getElementById('reset-form-btn');
    const lastSavedBadge = document.getElementById('last-saved-badge');
    const authorTitleInput = document.getElementById('post-author-title');
    const authorBioInput = document.getElementById('post-author-bio');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const myPostsSection = document.getElementById('my-posts');
    const myPostsList = document.getElementById('my-posts-list');
    const myPostsEmpty = document.getElementById('my-posts-empty');
    const myPostsCount = document.getElementById('my-posts-count');
    const autoslugLabel = autoslugToggle?.closest('label');
    const defaultMyPostsEmptyText = myPostsEmpty?.textContent || '';

    let quill;
    let db;
    let auth;
    let autoslug = true;
    let autosaveTimeout;
    let currentEditingSlug = null;
    const postCache = new Map();

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

    const escapeHtml = (value = '') => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return String(value).replace(/[&<>"']/g, char => map[char]);
    };

    const departmentMeta = {
        'primary-care': { label: 'Primary Care', badgeClass: 'bg-brand-blue/10 text-brand-blue' },
        'dermatology': { label: 'Dermatology', badgeClass: 'bg-yellow-100 text-yellow-700' },
        'occupational': { label: 'Occupational Health', badgeClass: 'bg-deep-blue/10 text-deep-blue' },
        'acupuncture': { label: 'Acupuncture', badgeClass: 'bg-green-100 text-green-700' },
        'wellness': { label: 'Wellness', badgeClass: 'bg-yellow-100 text-yellow-700' },
        'sports-medicine': { label: 'Sports Medicine', badgeClass: 'bg-light-blue/10 text-light-blue' },
        default: { label: 'Clinic Updates', badgeClass: 'bg-brand-blue/10 text-brand-blue' }
    };

    const statusMeta = {
        published: {
            label: 'Published',
            badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        },
        draft: {
            label: 'Draft',
            badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200'
        }
    };

    const formatDisplayDate = (input) => {
        if (!input) return '';
        let date;
        if (input instanceof Date) {
            date = input;
        } else if (typeof input === 'string' || typeof input === 'number') {
            date = new Date(input);
        } else if (input.toDate) {
            date = input.toDate();
        }
        if (!date || Number.isNaN(date.getTime())) {
            return '';
        }
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const toDateInputValue = (input) => {
        if (!input) return '';
        let date;
        if (input instanceof Date) {
            date = input;
        } else if (typeof input === 'string' || typeof input === 'number') {
            const parsed = new Date(input);
            if (!Number.isNaN(parsed.getTime())) {
                date = parsed;
            }
        } else if (input.toDate) {
            date = input.toDate();
        }
        if (!date || Number.isNaN(date.getTime())) {
            return '';
        }
        return date.toISOString().split('T')[0];
    };

    const getTimestampValue = (value) => {
        if (!value) return 0;
        if (value instanceof Date) return value.getTime();
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
        }
        if (value.toDate) return value.toDate().getTime();
        return 0;
    };

    const createMyPostCard = (post) => {
        const category = departmentMeta[post.category] || departmentMeta.default;
        const statusKey = (post.status || 'draft').toLowerCase();
        const statusInfo = statusMeta[statusKey] || statusMeta.draft;
        const publishDate = formatDisplayDate(post.publishedAt || post.createdAt);
        const metaBits = [];
        if (publishDate) metaBits.push(publishDate);
        if (post.readTime) metaBits.push(post.readTime);
        if (post.featured) metaBits.push('Featured');
        const metaLine = metaBits.join(' • ');

        const card = document.createElement('article');
        card.className = 'border border-slate-200 rounded-xl px-5 py-4 hover:border-brand-blue transition-colors';
        card.innerHTML = `
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="space-y-2">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${category.badgeClass}">${category.label}</span>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${statusInfo.badgeClass}">${statusInfo.label}</span>
                    </div>
                    <h3 class="text-lg font-semibold text-dark-gray">${escapeHtml(post.title || 'Untitled Story')}</h3>
                    <p class="my-post-meta text-sm text-medium-gray">${escapeHtml(metaLine)}</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button type="button" data-action="edit" data-slug="${post.slug}" class="inline-flex items-center gap-2 rounded-lg border border-brand-blue/60 text-brand-blue px-4 py-2 text-sm font-semibold hover:bg-brand-blue hover:text-white transition-colors">
                        Edit
                    </button>
                    <button type="button" data-action="delete" data-slug="${post.slug}" class="inline-flex items-center gap-2 rounded-lg border border-rose-200 text-rose-600 px-4 py-2 text-sm font-semibold hover:bg-rose-50 transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        `;
        if (!metaLine) {
            card.querySelector('.my-post-meta')?.remove();
        }
        return card;
    };

    const renderMyPosts = (posts = []) => {
        if (!myPostsSection || !myPostsList || !myPostsEmpty || !myPostsCount) return;

        const sorted = [...posts].sort((a, b) => {
            const bTime = getTimestampValue(b.updatedAt || b.createdAt);
            const aTime = getTimestampValue(a.updatedAt || a.createdAt);
            return bTime - aTime;
        });

        myPostsList.innerHTML = '';

        if (!sorted.length) {
            myPostsEmpty.textContent = defaultMyPostsEmptyText;
            myPostsEmpty.classList.remove('hidden');
            myPostsCount.textContent = '0 posts';
        } else {
            myPostsEmpty.classList.add('hidden');
            sorted.forEach(post => {
                myPostsList.appendChild(createMyPostCard(post));
            });
            myPostsCount.textContent = sorted.length === 1 ? '1 post' : `${sorted.length} posts`;
        }

        myPostsSection.classList.remove('hidden');
    };

    const fetchMyPosts = async () => {
        if (!auth?.currentUser || !db || !myPostsSection) return;
        const user = auth.currentUser;

        if (myPostsEmpty) {
            myPostsEmpty.textContent = 'Loading your posts...';
            myPostsEmpty.classList.remove('hidden');
        }
        if (myPostsCount) {
            myPostsCount.textContent = 'Loading...';
        }
        myPostsList?.replaceChildren();
        myPostsSection.classList.remove('hidden');

        try {
            const snapshot = await db.collection('posts')
                .where('createdBy', '==', user.uid)
                .get();

            postCache.clear();
            const posts = snapshot.docs.map(doc => {
                const data = doc.data() || {};
                const slug = data.slug || doc.id;
                const entry = { ...data, slug, id: doc.id };
                postCache.set(slug, entry);
                return entry;
            });

            renderMyPosts(posts);
        } catch (error) {
            console.error('Failed to load posts for current user', error);
            if (myPostsEmpty) {
                myPostsEmpty.textContent = 'Unable to load your posts right now. Please try again soon.';
                myPostsEmpty.classList.remove('hidden');
            }
            if (myPostsCount) {
                myPostsCount.textContent = '--';
            }
        }
    };

    const setEditingMode = (post) => {
        if (!post) return;
        if (!quill) {
            setStatus('Editor is initializing. Please wait a moment and try again.', 'info');
            return;
        }
        if (auth?.currentUser && post.createdBy && post.createdBy !== auth.currentUser.uid) {
            setStatus('You can only edit posts you created.', 'error');
            return;
        }

        currentEditingSlug = post.slug;
        if (postForm) {
            postForm.dataset.mode = 'update';
        }

        submitBtn.textContent = 'Update Post';
        cancelEditBtn?.classList.remove('hidden');

        autoslug = false;
        if (autoslugToggle) {
            autoslugToggle.checked = false;
            autoslugToggle.disabled = true;
        }
        autoslugLabel?.classList.add('opacity-50', 'cursor-not-allowed');

        if (slugInput) {
            slugInput.value = post.slug || '';
            slugInput.readOnly = true;
        }

        if (titleInput) {
            titleInput.value = post.title || '';
        }
        const summaryInput = document.getElementById('post-summary');
        if (summaryInput) {
            summaryInput.value = post.summary || '';
        }
        const imageInput = document.getElementById('post-image');
        if (imageInput) {
            imageInput.value = post.heroImage || '';
        }
        const categoryInput = document.getElementById('post-category');
        if (categoryInput) {
            categoryInput.value = post.category || 'primary-care';
        }
        const readtimeInput = document.getElementById('post-readtime');
        if (readtimeInput) {
            readtimeInput.value = post.readTime || '';
        }
        const publishDateInput = document.getElementById('post-date');
        if (publishDateInput) {
            publishDateInput.value = toDateInputValue(post.publishedAt || post.createdAt);
        }
        const authorNameInput = document.getElementById('post-author');
        if (authorNameInput) {
            authorNameInput.value = post.authorName || '';
        }
        const authorInitialsInput = document.getElementById('post-initials');
        if (authorInitialsInput) {
            authorInitialsInput.value = post.authorInitials || '';
        }
        if (authorTitleInput) {
            authorTitleInput.value = post.authorCredentials || post.authorTitle || '';
        }
        if (authorBioInput) {
            authorBioInput.value = post.authorBio || '';
        }
        const statusInput = document.getElementById('post-status');
        if (statusInput) {
            statusInput.value = (post.status === 'published' ? 'published' : 'draft');
        }
        const featuredToggle = document.getElementById('post-featured');
        if (featuredToggle) {
            featuredToggle.checked = Boolean(post.featured);
        }

        quill.root.innerHTML = post.content || '';
        lastSavedBadge.textContent = '';

        setStatus(`Editing "${post.title || 'Untitled Story'}"`, 'info');
        window.scrollTo({ top: editorSection?.offsetTop || 0, behavior: 'smooth' });
    };

    const handleDeletePost = async (slug) => {
        if (!slug || !db || !auth?.currentUser) return;
        const post = postCache.get(slug);
        const title = post?.title || 'this post';
        const confirmed = window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`);
        if (!confirmed) return;

        try {
            setStatus('Deleting post...', 'info');
            await db.collection('posts').doc(slug).delete();
            postCache.delete(slug);

            if (currentEditingSlug === slug) {
                resetForm();
            }

            setStatus('Post deleted successfully.', 'success');
            fetchMyPosts();
        } catch (error) {
            console.error('Failed to delete post', error);
            setStatus(error.message || 'Unable to delete the post right now.', 'error');
        }
    };

    const lazyImport = (src) => new Promise((resolve, reject) => {
        const exists = document.querySelector(`script[src="${src}"]`);
        if (exists) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });

    const initFirebase = () => {
        if (!window.firebaseConfig) {
            throw new Error('Firebase configuration not found. Update js/firebase-config.js.');
        }
        const hasPlaceholderValues = Object.values(window.firebaseConfig)
            .some(value => typeof value === 'string' && value.startsWith('YOUR_'));
        if (hasPlaceholderValues) {
            throw new Error('Firebase configuration has placeholder values. Replace them with your Firebase credentials.');
        }

        const app = firebase.initializeApp(window.firebaseConfig);
        auth = firebase.auth(app);
        db = firebase.firestore(app);
    };

    const renderQuill = () => {
        quill = new Quill('#editor', {
            theme: 'snow',
            placeholder: 'Craft the perfect story here...',
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    [{ font: [] }, { size: [] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ color: [] }, { background: [] }],
                    [{ align: [] }],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['blockquote', 'code-block'],
                    ['link', 'image', 'video'],
                    ['clean']
                ]
            }
        });
    };

    const updateSlug = () => {
        if (!autoslug) return;
        const raw = titleInput.value || '';
        const slug = raw
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        slugInput.value = slug;
    };

    const resetForm = () => {
        postForm.reset();
        if (quill) {
            quill.setContents([]);
        }
        lastSavedBadge.textContent = '';

        currentEditingSlug = null;
        if (postForm) {
            delete postForm.dataset.mode;
        }

        submitBtn.textContent = 'Publish Post';
        cancelEditBtn?.classList.add('hidden');

        autoslug = true;
        if (autoslugToggle) {
            autoslugToggle.checked = true;
            autoslugToggle.disabled = false;
        }
        autoslugLabel?.classList.remove('opacity-50', 'cursor-not-allowed');

        if (slugInput) {
            slugInput.value = '';
            slugInput.readOnly = true;
        }

        updateSlug();
    };

    const autosaveDraft = () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const payload = {
            title: titleInput.value || '',
            slug: slugInput.value || '',
            summary: document.getElementById('post-summary').value || '',
            heroImage: document.getElementById('post-image').value || '',
            category: document.getElementById('post-category').value || 'primary-care',
            readTime: document.getElementById('post-readtime').value || '',
            authorName: document.getElementById('post-author').value || '',
            authorInitials: document.getElementById('post-initials').value || '',
            authorTitle: authorTitleInput?.value || '',
            authorBio: authorBioInput?.value || '',
            content: quill.root.innerHTML,
            updatedAt: Date.now()
        };
        localStorage.setItem(`mmc-admin-draft-${currentUser.uid}`, JSON.stringify(payload));
        lastSavedBadge.textContent = `Draft saved ${new Date(payload.updatedAt).toLocaleTimeString()}`;
    };

    const restoreDraft = () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const raw = localStorage.getItem(`mmc-admin-draft-${currentUser.uid}`);
        if (!raw) return;
        try {
            const payload = JSON.parse(raw);
            titleInput.value = payload.title || '';
            slugInput.value = payload.slug || '';
            document.getElementById('post-summary').value = payload.summary || '';
            document.getElementById('post-image').value = payload.heroImage || '';
            document.getElementById('post-category').value = payload.category || 'primary-care';
            document.getElementById('post-readtime').value = payload.readTime || '';
            document.getElementById('post-author').value = payload.authorName || '';
            document.getElementById('post-initials').value = payload.authorInitials || '';
            if (authorTitleInput) {
                authorTitleInput.value = payload.authorTitle || '';
            }
            if (authorBioInput) {
                authorBioInput.value = payload.authorBio || '';
            }
            quill.root.innerHTML = payload.content || '';
            lastSavedBadge.textContent = `Draft restored ${new Date(payload.updatedAt).toLocaleTimeString()}`;
        } catch (error) {
            console.warn('Failed to restore draft', error);
        }
    };

    const watchForAutosave = () => {
        const debounced = () => {
            clearTimeout(autosaveTimeout);
            autosaveTimeout = setTimeout(autosaveDraft, 1000);
        };

        ['input', 'change'].forEach(evt => {
            postForm.addEventListener(evt, debounced);
        });

        quill.on('text-change', debounced);
    };

    const handlePostSubmit = async (event) => {
        event.preventDefault();
        clearStatus();

        if (!auth.currentUser) {
            setStatus('You must be signed in to create a post.', 'error');
            return;
        }

        const contentHtml = quill.root.innerHTML.trim();
        if (!contentHtml || contentHtml === '<p><br></p>') {
            setStatus('Please add some content to your post before publishing.', 'error');
            return;
        }

        const isEditing = Boolean(currentEditingSlug);
        const slugValue = slugInput.value.trim();
        const titleValue = titleInput.value.trim();

        if (!titleValue || !slugValue) {
            setStatus('Title and slug are required fields.', 'error');
            return;
        }

        if (isEditing && slugValue !== currentEditingSlug) {
            setStatus('Slug cannot be changed while editing an existing post. Reset the form to create a new entry with a different slug.', 'error');
            return;
        }

        const payload = {
            title: titleValue,
            slug: slugValue,
            summary: document.getElementById('post-summary').value.trim(),
            heroImage: document.getElementById('post-image').value.trim(),
            category: document.getElementById('post-category').value || 'primary-care',
            readTime: document.getElementById('post-readtime').value.trim(),
            authorName: document.getElementById('post-author').value.trim(),
            authorInitials: document.getElementById('post-initials').value.trim(),
            authorCredentials: authorTitleInput ? authorTitleInput.value.trim() : '',
            authorBio: authorBioInput ? authorBioInput.value.trim() : '',
            publishedAt: document.getElementById('post-date').value || new Date().toISOString().split('T')[0],
            content: contentHtml,
            status: document.getElementById('post-status').value,
            featured: document.getElementById('post-featured').checked,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docId = isEditing ? currentEditingSlug : slugValue;
        const docRef = db.collection('posts').doc(docId);

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = isEditing ? 'Updating...' : 'Publishing...';

            if (isEditing) {
                await docRef.update(payload);
                setStatus('Post updated successfully.', 'success');
            } else {
                await docRef.set({
                    ...payload,
                    createdBy: auth.currentUser.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                setStatus('Post saved successfully! It will render on the blog once Firestore rules allow public reads.', 'success');
            }

            autosaveDraft();
            fetchMyPosts();
        } catch (error) {
            console.error('Failed to save post', error);
            setStatus(error.message || 'Failed to save post. Check the console for details.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = isEditing ? 'Update Post' : 'Publish Post';
        }
    };

    const bindAuthState = () => {
        auth.onAuthStateChanged(user => {
            clearStatus();
            if (user) {
                loginSection.classList.add('hidden');
                editorSection.classList.remove('hidden');
                resetForm();
                restoreDraft();
                fetchMyPosts();
            } else {
                resetForm();
                postCache.clear();
                myPostsList?.replaceChildren();
                if (myPostsEmpty) {
                    myPostsEmpty.textContent = defaultMyPostsEmptyText;
                    myPostsEmpty.classList.remove('hidden');
                }
                if (myPostsCount) {
                    myPostsCount.textContent = '0 posts';
                }
                myPostsSection?.classList.add('hidden');
                editorSection.classList.add('hidden');
                loginSection.classList.remove('hidden');
            }
        });
    };

    const init = async () => {
        try {
            await lazyImport('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
            await Promise.all([
                lazyImport('https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js'),
                lazyImport('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js')
            ]);

            initFirebase();
            renderQuill();
            watchForAutosave();
            bindAuthState();
            updateSlug();
        } catch (error) {
            console.error(error);
            setStatus(error.message, 'error');
        }
    };

    if (!loginForm || !postForm) {
        console.warn('Blog admin form markup missing, skipping admin setup.');
        return;
    }

    if (slugInput) {
        slugInput.readOnly = autoslug;
    }

    autoslugToggle?.addEventListener('change', (event) => {
        if (currentEditingSlug) {
            event.preventDefault();
            event.target.checked = false;
            setStatus('Slug is locked while editing an existing post. Cancel editing to create a new slug.', 'info');
            return;
        }
        autoslug = event.target.checked;
        slugInput.readOnly = autoslug;
        if (autoslug) {
            updateSlug();
        }
    });

    titleInput?.addEventListener('input', updateSlug);

    loginForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearStatus();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        if (!auth) {
            setStatus('Authentication is not ready yet. Please refresh and try again.', 'error');
            return;
        }
        try {
            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.textContent = 'Signing In...';
            }
            await auth.signInWithEmailAndPassword(email, password);
            loginForm.reset();
        } catch (error) {
            console.error('Login failed', error);
            setStatus(error.message || 'Login failed. Double check your credentials.', 'error');
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Sign In';
            }
        }
    });

    logoutBtn?.addEventListener('click', async () => {
        clearStatus();
        try {
            await auth.signOut();
            setStatus('Signed out successfully.', 'success');
        } catch (error) {
            console.error('Logout failed', error);
            setStatus('Unable to sign out at the moment.', 'error');
        }
    });

    postForm?.addEventListener('submit', handlePostSubmit);
    formResetBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        resetForm();
        setStatus('Form cleared. Draft retained for safety.', 'info');
    });

    cancelEditBtn?.addEventListener('click', () => {
        resetForm();
        setStatus('Editing canceled. Form cleared.', 'info');
    });

    myPostsList?.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const actionBtn = target.closest('button[data-action]');
        if (!actionBtn) return;
        const { action, slug } = actionBtn.dataset;
        if (!slug) return;

        if (action === 'edit') {
            const post = postCache.get(slug);
            if (!post) {
                setStatus('Unable to load that post. Refreshing your list...', 'error');
                fetchMyPosts();
                return;
            }
            setEditingMode(post);
        } else if (action === 'delete') {
            handleDeletePost(slug);
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            autosaveDraft();
        }
    });

    init();
})();
