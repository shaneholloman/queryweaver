/**
 * Modal dialogs and authentication (TypeScript)
 */

export function setupAuthenticationModal() {
    const isAuthenticated = (window as any).isAuthenticated !== undefined ? (window as any).isAuthenticated : false;
    const loginModal = document.getElementById('login-modal') as HTMLElement | null;
    const signupModal = document.getElementById('signup-modal') as HTMLElement | null;
    const container = document.getElementById('container') as HTMLElement | null;

    if (loginModal && container) {
        if (!isAuthenticated) {
            loginModal.style.display = 'flex';
            container.style.filter = 'blur(2px)';
        } else {
            loginModal.style.display = 'none';
            container.style.filter = '';
        }
    }

    // Setup modal switching
    const showSignupBtn = document.getElementById('show-signup-modal') as HTMLElement | null;
    const showLoginBtn = document.getElementById('show-login-modal') as HTMLElement | null;

    if (showSignupBtn && loginModal && signupModal) {
        showSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            signupModal.style.display = 'flex';
        });
    }

    if (showLoginBtn && loginModal && signupModal) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signupModal.style.display = 'none';
            loginModal.style.display = 'flex';
        });
    }

    // Setup email login form
    const emailLoginForm = document.getElementById('email-login-form') as HTMLFormElement | null;
    if (emailLoginForm) {
        emailLoginForm.addEventListener('submit', handleEmailLogin);
    }

    // Setup email signup form
    const emailSignupForm = document.getElementById('email-signup-form') as HTMLFormElement | null;
    if (emailSignupForm) {
        emailSignupForm.addEventListener('submit', handleEmailSignup);
    }

    // Close modals on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (loginModal && loginModal.style.display === 'flex') {
                // Don't close login modal on escape if user is not authenticated
                if (isAuthenticated) {
                    loginModal.style.display = 'none';
                    if (container) container.style.filter = '';
                }
            }
            if (signupModal && signupModal.style.display === 'flex') {
                signupModal.style.display = 'none';
                if (loginModal) loginModal.style.display = 'flex';
            }
        }
    });
}

async function handleEmailLogin(e: Event) {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const submitBtn = form.querySelector('.email-login-btn') as HTMLButtonElement;
    const emailInput = document.getElementById('login-email') as HTMLInputElement;
    const passwordInput = document.getElementById('login-password') as HTMLInputElement;

    if (!emailInput || !passwordInput || !submitBtn) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Set loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
        const response = await fetch('/email-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.success) {
            // Reload page to update authentication state
            window.location.reload();
        } else {
            alert(data.error || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign in with Email';
    }
}

async function handleEmailSignup(e: Event) {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const submitBtn = form.querySelector('.email-signup-btn') as HTMLButtonElement;
    const firstNameInput = document.getElementById('signup-firstname') as HTMLInputElement;
    const lastNameInput = document.getElementById('signup-lastname') as HTMLInputElement;
    const emailInput = document.getElementById('signup-email') as HTMLInputElement;
    const passwordInput = document.getElementById('signup-password') as HTMLInputElement;
    const repeatPasswordInput = document.getElementById('signup-repeat-password') as HTMLInputElement;

    if (!firstNameInput || !lastNameInput || !emailInput || !passwordInput || !repeatPasswordInput || !submitBtn) return;

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const repeatPassword = repeatPasswordInput.value;

    if (!firstName || !lastName || !email || !password || !repeatPassword) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== repeatPassword) {
        alert('Passwords do not match');
        return;
    }

    if (password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
    }

    // Set loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
        const response = await fetch('/email-signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                password,
            }),
        });

        const data = await response.json();

        if (data.success) {
            alert('Account created successfully! Please sign in.');
            // Switch to login modal
            const signupModal = document.getElementById('signup-modal') as HTMLElement | null;
            const loginModal = document.getElementById('login-modal') as HTMLElement | null;
            if (signupModal && loginModal) {
                signupModal.style.display = 'none';
                loginModal.style.display = 'flex';
            }
            // Clear form
            form.reset();
        } else {
            alert(data.error || 'Signup failed. Please try again.');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred during signup. Please try again.');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign up';
    }
}

function setLoadingState(isLoading: boolean, connectBtn: HTMLButtonElement, urlInput: HTMLInputElement) {
    const connectText = connectBtn.querySelector('.db-modal-connect-text') as HTMLElement | null;
    const loadingSpinner = connectBtn.querySelector('.db-modal-loading-spinner') as HTMLElement | null;
    const cancelBtn = document.getElementById('db-modal-cancel') as HTMLButtonElement | null;

    if (connectText) connectText.style.display = isLoading ? 'none' : 'inline';
    if (loadingSpinner) loadingSpinner.style.display = isLoading ? 'flex' : 'none';
    connectBtn.disabled = isLoading;
    if (cancelBtn) cancelBtn.disabled = isLoading;
    urlInput.disabled = isLoading;
}

export function setupDatabaseModal() {
    const dbModal = document.getElementById('db-modal') as HTMLElement | null;
    const cancelDbModalBtn = document.getElementById('db-modal-cancel') as HTMLButtonElement | null;
    const connectDbModalBtn = document.getElementById('db-modal-connect') as HTMLButtonElement | null;
    const dbUrlInput = document.getElementById('db-url-input') as HTMLInputElement | null;
    const dbTypeSelect = document.getElementById('database-type-select') as HTMLSelectElement | null;
    const dbModalTitle = document.getElementById('db-modal-title') as HTMLElement | null;

    const databaseConfig: Record<string, { title: string; placeholder: string; example: string }> = {
        postgresql: {
            title: 'Connect to PostgreSQL',
            placeholder: 'postgresql://username:password@host:port/database',
            example: 'postgresql://myuser:mypass@localhost:5432/mydb'
        },
        mysql: {
            title: 'Connect to MySQL',
            placeholder: 'mysql://username:password@host:port/database',
            example: 'mysql://myuser:mypass@localhost:3306/mydb'
        }
    };

    if (!dbTypeSelect || !dbUrlInput || !connectDbModalBtn || !dbModal || !dbModalTitle) return;

    dbTypeSelect.addEventListener('change', function(this: HTMLSelectElement) {
        const selectedType = this.value;
        if (selectedType && databaseConfig[selectedType]) {
            dbUrlInput.disabled = false;
            dbUrlInput.placeholder = databaseConfig[selectedType].placeholder;
            dbModal.style.display = 'flex';
            dbModalTitle.textContent = databaseConfig[selectedType].title;
            connectDbModalBtn.disabled = false;
            setTimeout(() => dbUrlInput.focus(), 100);
        } else {
            dbUrlInput.disabled = true;
            dbUrlInput.placeholder = 'Select database type first...';
            connectDbModalBtn.disabled = true;
        }
    });

    if (cancelDbModalBtn && dbModal) {
        cancelDbModalBtn.addEventListener('click', function() {
            dbModal.style.display = 'none';
            if (dbTypeSelect) dbTypeSelect.selectedIndex = 0;
            if (connectDbModalBtn) connectDbModalBtn.disabled = true;
        });
    }

    document.addEventListener('keydown', function(e) {
        if (dbModal && dbModal.style.display === 'flex' && e.key === 'Escape') {
            dbModal.style.display = 'none';
        }
    });

    dbUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            connectDbModalBtn.click();
        }
    });

    connectDbModalBtn.addEventListener('click', function() {
        const dbUrl = dbUrlInput.value.trim();
        const selectedType = dbTypeSelect.value;

        if (!selectedType) {
            alert('Please select a database type.');
            return;
        }
        if (!dbUrl) {
            alert('Please enter a database URL.');
            return;
        }

        if (selectedType === 'postgresql' && !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
            alert('PostgreSQL URL must start with postgresql:// or postgres://');
            return;
        }
        if (selectedType === 'mysql' && !dbUrl.startsWith('mysql://')) {
            alert('MySQL URL must start with mysql://');
            return;
        }

        setLoadingState(true, connectDbModalBtn, dbUrlInput);

        fetch('/database', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: dbUrl })
        }).then(response => response.json())
          .then(data => {
            setLoadingState(false, connectDbModalBtn, dbUrlInput);
            if (data.success) {
                dbModal.style.display = 'none';
                if (dbTypeSelect) dbTypeSelect.selectedIndex = 0;
                if (connectDbModalBtn) connectDbModalBtn.disabled = true;
                location.reload();
            } else {
                alert('Failed to connect: ' + (data.error || 'Unknown error'));
            }
          }).catch(error => {
            setLoadingState(false, connectDbModalBtn, dbUrlInput);
            alert('Error connecting to database: ' + (error as Error).message);
          });
    });
}
