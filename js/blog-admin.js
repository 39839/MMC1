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

    let quill;
    let db;
    let auth;
    let autoslug = true;
    let autosaveTimeout;

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
        quill.setContents([]);
        lastSavedBadge.textContent = '';
        if (autoslugToggle) {
            autoslugToggle.checked = true;
            autoslug = true;
        }
        if (slugInput) {
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

        const doc = {
            title: titleInput.value.trim(),
            slug: slugInput.value.trim(),
            summary: document.getElementById('post-summary').value.trim(),
            heroImage: document.getElementById('post-image').value.trim(),
            category: document.getElementById('post-category').value,
            readTime: document.getElementById('post-readtime').value.trim(),
            authorName: document.getElementById('post-author').value.trim(),
            authorInitials: document.getElementById('post-initials').value.trim(),
            authorCredentials: authorTitleInput ? authorTitleInput.value.trim() : '',
            authorBio: authorBioInput ? authorBioInput.value.trim() : '',
            publishedAt: document.getElementById('post-date').value || new Date().toISOString().split('T')[0],
            content: contentHtml,
            createdBy: auth.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: document.getElementById('post-status').value,
            featured: document.getElementById('post-featured').checked
        };

        if (!doc.title || !doc.slug) {
            setStatus('Title and slug are required fields.', 'error');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Publishing...';
            await db.collection('posts').doc(doc.slug).set(doc, { merge: true });
            setStatus('Post saved successfully! It will render on the blog once Firestore rules allow public reads.', 'success');
            autosaveDraft();
        } catch (error) {
            console.error('Failed to create post', error);
            setStatus(error.message || 'Failed to save post. Check the console for details.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publish Post';
        }
    };

    const bindAuthState = () => {
        auth.onAuthStateChanged(user => {
            clearStatus();
            if (user) {
                loginSection.classList.add('hidden');
                editorSection.classList.remove('hidden');
                restoreDraft();
            } else {
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

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            autosaveDraft();
        }
    });

    init();
})();
