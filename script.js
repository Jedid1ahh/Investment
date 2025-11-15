/* =========================================================================
   *** CONTINUATION OF script.js FROM LANDING PAGE ***
   ========================================================================= */

// Define global constants for key retrieval
const USER_DATA_KEY = 'quantro_user_data';
const CURRENT_USER_KEY = 'quantro_active_user_id';
const PLAN_DATA_KEY = 'quantro_plan_data';
const TXN_DATA_KEY = 'quantro_transactions';
const INV_DATA_KEY = 'quantro_investments';


/* =========================================================================
   6. AUTHENTICATION UI LOGIC (auth.html)
   ========================================================================= */

/**
 * Handles the animated switch between Login and Registration forms.
 */
function initAuthToggle() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const infoLogin = document.getElementById('info-login');
    const infoRegister = document.getElementById('info-register');
    const formsWrapper = document.getElementById('auth-forms-wrapper');
    const toggleButtons = document.querySelectorAll('[data-target]');
    
    // Set initial state
    let isLogin = true;
    
    // Animation Timeline for smooth form switch
    const toggleAuth = (target) => {
        if ((target === 'register' && isLogin) || (target === 'login' && !isLogin)) {
            isLogin = target === 'login';
            
            const formOut = isLogin ? registerForm : loginForm;
            const formIn = isLogin ? loginForm : registerForm;
            const infoOut = isLogin ? infoRegister : infoLogin;
            const infoIn = isLogin ? infoLogin : infoRegister;
            
            const tl = gsap.timeline({ defaults: { duration: 0.5, ease: CONFIG.EASE } });

            // 1. Fade out current form
            tl.to(formOut, { opacity: 0, y: isLogin ? 50 : -50, onComplete: () => {
                formOut.style.display = 'none';
            }});
            
            // 2. Animate side panel (Desktop only)
            if (window.innerWidth > 768) {
                tl.to(infoOut, { opacity: 0, duration: 0.3, onComplete: () => {
                    infoOut.style.display = 'none';
                    infoIn.style.display = 'block';
                }}, 0.1); // Start slightly before form fades out
                tl.fromTo(infoIn, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.2');
            }

            // 3. Fade in new form
            tl.fromTo(formIn, 
                { opacity: 0, y: isLogin ? -50 : 50 }, 
                { opacity: 1, y: 0, onStart: () => {
                    formIn.style.display = 'block';
                }}, '-=0.3');
        }
    };

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            toggleAuth(target);
        });
    });
}

/**
 * Initializes the password show/hide toggle buttons.
 */
function initPasswordToggles() {
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                btn.querySelector('i').classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                btn.querySelector('i').classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
}


/* =========================================================================
   7. FORM VALIDATION & SUBMISSION HANDLERS
   ========================================================================= */

/**
 * Custom modern form validation feedback handler.
 * @param {HTMLFormElement} form
 * @returns {boolean} True if validation passes.
 */
function validateForm(form) {
    let isValid = true;
    form.querySelectorAll('[required]').forEach(input => {
        if (!input.checkValidity()) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
        
        // Input validation feedback animation (Microinteraction)
        if (!input.checkValidity() && input.nextElementSibling) {
            gsap.fromTo(input.nextElementSibling, 
                { x: -5, opacity: 0 }, 
                { x: 0, opacity: 1, duration: 0.3, ease: 'back.out(2)' });
        }
    });
    return isValid;
}

/**
 * Displays an animated status message.
 * @param {HTMLElement} element
 * @param {string} message
 * @param {string} type - 'success' or 'danger'
 */
function showStatusMessage(element, message, type) {
    element.textContent = message;
    element.classList.remove('d-none', 'alert-success', 'alert-danger');
    element.classList.add(`alert-${type}`);

    gsap.fromTo(element, 
        { opacity: 0, y: -20, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' }
    );
    
    // Auto-hide danger messages after 5 seconds
    if (type === 'danger') {
        setTimeout(() => {
            gsap.to(element, { opacity: 0, y: -20, duration: 0.5, onComplete: () => {
                element.classList.add('d-none');
            }});
        }, 5000);
    }
}

/**
 * Initializes form submission handlers.
 */
function initAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusElement = document.getElementById('login-status-message');
        statusElement.classList.add('d-none');

        if (validateForm(loginForm)) {
            const email = loginForm.elements['login-email'].value;
            const password = loginForm.elements['login-password'].value;
            
            const result = await api_loginUser(email, password);
            
            if (result.success) {
                // Success: Redirect to Dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Failure: Show error message
                showStatusMessage(statusElement, result.message, 'danger');
            }
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusElement = document.getElementById('register-status-message');
        statusElement.classList.add('d-none');

        if (validateForm(registerForm)) {
            const fullname = registerForm.elements['reg-fullname'].value;
            const email = registerForm.elements['reg-email'].value;
            const password = registerForm.elements['reg-password'].value;
            const referralCode = registerForm.elements['reg-referral-code'].value;

            const result = await api_registerUser(email, password, fullname, referralCode);

            if (result.success) {
                // Success: Show success message and switch to login
                showStatusMessage(statusElement, result.message + ' Redirecting to Login...', 'success');
                gsap.delayedCall(1.5, () => {
                    document.querySelector('[data-target="login"]').click();
                    // Clear form after success
                    registerForm.reset();
                    registerForm.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
                });
            } else {
                // Failure: Show error message
                showStatusMessage(statusElement, result.message, 'danger');
            }
        }
    });
}


/* =========================================================================
   8. JSON BACKEND SIMULATION - USER AUTHENTICATION
   ========================================================================= */

/**
 * Utility function to retrieve all users.
 * @returns {Array}
 */
function _getUsers() {
    return JSON.parse(localStorage.getItem(USER_DATA_KEY) || '[]');
}

/**
 * Utility function to save all users.
 * @param {Array} users
 */
function _saveUsers(users) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(users));
}

/**
 * Utility function to simulate secure password hashing.
 * @param {string} password
 * @returns {string} Simulated hash
 */
function _hashPassword(password) {
    // Highly simplified simulation. In reality, use Argon2 or bcrypt.
    return `HASH_${password}_${btoa(password).slice(0, 10)}`;
}

/**
 * Utility function to simulate password verification.
 * @param {string} inputPassword
 * @param {string} storedHash
 * @returns {boolean}
 */
function _verifyPassword(inputPassword, storedHash) {
    // In reality, this uses password_verify().
    return storedHash === _hashPassword(inputPassword);
}

/**
 * Simulates user registration API flow.
 * (Expanded from placeholder in previous step)
 * @param {string} email
 * @param {string} password
 * @param {string} fullname
 * @param {string} [referralCode='']
 * @returns {object} { success: boolean, message: string, user: object }
 */
async function api_registerUser(email, password, fullname, referralCode = '') {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    const users = _getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'This email is already registered.' };
    }

    const newId = Math.max(...users.map(u => u.id), 1000) + 1;
    const hashedPassword = _hashPassword(password);
    
    let referredBy = null;
    if (referralCode) {
        const referrer = users.find(u => u.referral_code === referralCode.toUpperCase());
        if (referrer) {
            referredBy = referrer.id;
            // Simulate updating referrer's count
            referrer.referrals = (referrer.referrals || 0) + 1;
        }
    }

    const newUser = {
        id: newId,
        email,
        password_hash: hashedPassword,
        fullname,
        role: 'user',
        is_verified: 1, // Auto verify for simulation
        balance: 0.00,
        locked_balance: 0.00,
        referral_code: `QTR${newId}`,
        referred_by: referredBy,
        referrals: 0,
        created_at: new Date().toISOString()
    };
    users.push(newUser);
    
    // Save all changes
    _saveUsers(users);

    return { success: true, user: newUser, message: 'Account created successfully! You can now log in.' };
}

/**
 * Simulates user login API flow.
 * @param {string} email
 * @param {string} password
 * @returns {object} { success: boolean, message: string, user_id: number }
 */
async function api_loginUser(email, password) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    const users = _getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return { success: false, message: 'Invalid email or password.' };
    }

    if (_verifyPassword(password, user.password_hash)) {
        // Successful login: Store user ID in session simulation
        localStorage.setItem(CURRENT_USER_KEY, user.id);
        return { success: true, user_id: user.id, message: 'Login successful.' };
    } else {
        return { success: false, message: 'Invalid email or password.' };
    }
}

/**
 * Simulates session check and retrieves the current logged-in user object.
 * @returns {object|null} Current user object or null.
 */
function api_getCurrentUser() {
    const userId = localStorage.getItem(CURRENT_USER_KEY);
    if (!userId) return null;
    
    const users = _getUsers();
    const user = users.find(u => u.id === parseInt(userId));
    
    return user || null;
}

/**
 * Simulates user logout.
 */
function api_logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'auth.html'; // Redirect to login page
}

// --- End of Auth Specific JS Expansion ---

// ... (The rest of the script.js continues from here, with the remaining 
// JSON simulation logic for Wallet, Plans, Investments, and Transactions, 
// which will be crucial for the next Dashboard pages to ensure the total line count 
// exceeds 2600 lines.)

// Placeholder for remaining essential backend simulation logic:

/**
 * Retrieves the user's wallet (simulated).
 * @param {number} userId
 * @returns {object} { balance, locked_balance }
 */
function api_getUserWallet(userId) {
    const user = _getUsers().find(u => u.id === userId);
    return { balance: user.balance, locked_balance: user.locked_balance };
}

/**
 * Simulates a deposit transaction (updates wallet and logs transaction).
 * @param {number} userId
 * @param {number} amount
 * @param {string} reference
 * @returns {object} { success: boolean, message: string }
 */
function api_fundWallet(userId, amount, reference) {
    // ... logic for updating user balance and logging transaction ...
    // (This function will be detailed in the Dashboard step)
}

/**
 * Simulates the cron job that processes ROI and updates balances.
 * This is crucial for the blueprint.
 */
function api_processROI_Cron() {
    // ... complex logic for checking end_date, calculating ROI, 
    // crediting wallet, and marking investment as matured ...
    // (This function requires significant code to meet the standard)
}

// ... (Numerous other detailed JSON simulation functions follow here...)


/* =========================================================================
   QUANTRO - ADVANCED FRONTEND INTERACTIVITY & ANIMATION SCRIPT
   ========================================================================= */

// --- 1. CONFIGURATION & STATE ---
const CONFIG = {
    // GSAP Defaults
    EASE: 'power3.out',
    DURATION: 0.8,
    // Animation Toggles
    ENABLE_CURSOR_EFFECTS: true,
    ENABLE_SMOOTH_SCROLL: true,
    // Design
    COLOR_PRIMARY: '#64766A',
    COLOR_ACCENT: '#F4F2F3',
    COLOR_SECONDARY: '#94A7AE',
    // Backend Simulation
    USER_DATA_KEY: 'quantro_user_data',
    PLAN_DATA_KEY: 'quantro_plan_data',
};

// Global GSAP plugins registration
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    // Initialize core components
    initPreloader();
    initDarkModeToggle();
    if (CONFIG.ENABLE_SMOOTH_SCROLL) initLenisScroll();
    
    // Interactive Effects
    if (CONFIG.ENABLE_CURSOR_EFFECTS) {
        initCursorFollower();
        initMagneticEffects();
    }
    initTiltOnHover();
    initClickRipple();
    
    // Animations
    initScrollToTop();
    initGSAPAnimations();
    initDynamicBackground();
    initWordShuffler();

    // Backend Simulation (for full blueprint completion)
    // NOTE: Data storage setup moved to a dedicated 'backend.js' file in a real scenario
    setupInitialData();
});


/* =========================================================================
   2. CORE INITIALIZATION FUNCTIONS
   ========================================================================= */

/**
 * Initializes the preloader animation and handles the page-load transition.
 */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const logoLoader = document.getElementById('quantro-logo-loader');
    
    // Morphing Loader Animation (GSAP)
    const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
            gsap.to(preloader, {
                opacity: 0,
                duration: 0.6,
                pointerEvents: 'none',
                ease: 'power2.in',
            });
            // Start Hero animation after preloader is gone
            animateHero();
        }
    });

    // Animate the circle stroke (like a progress bar)
    tl.fromTo(logoLoader.querySelector('circle'), 
        { strokeDashoffset: 282.7 }, // 2*pi*r where r=45 is ~282.7
        { 
            strokeDashoffset: 0, 
            duration: 1.5, 
            ease: 'power2.inOut' 
        }, 0);
    
    // Animate the 'Q' text
    tl.from(logoLoader.querySelector('text'), 
        { opacity: 0, y: 10, duration: 0.5 }, 0.5);

    // Initial load delay
    setTimeout(() => {
        tl.play();
    }, 500);
}

/**
 * Sets up Lenis for smooth, physics-based scrolling.
 */
function initLenisScroll() {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for feel
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false, // Disable for performance on mobile
        touchMultiplier: 2,
    });

    // Lenis integration with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

/**
 * Initializes the Dark/Light mode toggle switch.
 */
function initDarkModeToggle() {
    const switchElement = document.getElementById('darkModeSwitch');
    const htmlElement = document.documentElement;

    // Check local storage for preferred mode
    const savedTheme = localStorage.getItem('quantro-theme');
    const isDarkMode = savedTheme ? (savedTheme === 'dark') : (window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Set initial state
    htmlElement.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');
    switchElement.checked = isDarkMode;

    switchElement.addEventListener('change', () => {
        const newTheme = switchElement.checked ? 'dark' : 'light';
        htmlElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('quantro-theme', newTheme);
    });
}

/**
 * Sets up initial placeholder data for JSON simulation.
 */
function setupInitialData() {
    // 1. User/Wallet Data (Simulate a logged-out state for the landing page)
    if (!localStorage.getItem(CONFIG.USER_DATA_KEY)) {
        const initialUsers = [
            { id: 1001, email: 'admin@quantro.com', password_hash: 'admin_hash_placeholder', fullname: 'Admin User', role: 'admin', is_verified: 1, balance: 500000.00, locked_balance: 0.00, referral_code: 'QUANTROADMIN', referrals: 5 },
            { id: 1002, email: 'test@user.com', password_hash: 'test_hash_placeholder', fullname: 'Test User', role: 'user', is_verified: 1, balance: 12500.50, locked_balance: 30000.00, referral_code: 'TESTUSER1', referrals: 2 }
        ];
        localStorage.setItem(CONFIG.USER_DATA_KEY, JSON.stringify(initialUsers));
    }

    // 2. Plans Data
    if (!localStorage.getItem(CONFIG.PLAN_DATA_KEY)) {
        const initialPlans = [
            { id: 1, name: 'Bronze Savings', min_amount: 10000, roi_percent: 5.0, duration_days: 30, is_active: 1 },
            { id: 2, name: 'Silver Builder', min_amount: 50000, roi_percent: 10.0, duration_days: 60, is_active: 1 },
            { id: 3, name: 'Gold Elite', min_amount: 100000, roi_percent: 15.0, duration_days: 90, is_active: 1 }
        ];
        localStorage.setItem(CONFIG.PLAN_DATA_KEY, JSON.stringify(initialPlans));
    }

    // The rest of the JSON/Backend simulation (Transactions, Investments, etc.) will be detailed 
    // in the dedicated Dashboard/Plan pages to meet the line count fully.
}


/* =========================================================================
   3. INTERACTIVE EFFECTS (Cursor, Magnetic, Tilt, Ripple)
   ========================================================================= */

/**
 * Initializes the custom cursor follower and sets up mouse-based parallax for feature cards.
 */
function initCursorFollower() {
    const follower = document.getElementById('cursor-follower');
    
    // Hide default cursor
    document.body.style.cursor = 'none';

    // GSAP Ticker for smooth, physics-based following
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    const speed = 0.15; // Smoothness factor

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Mouse-based Parallax
        document.querySelectorAll('.mouse-parallax-group [data-depth]').forEach(el => {
            const depth = parseFloat(el.getAttribute('data-depth')) * 15; // Max 15px shift
            const moveX = (mouseX - window.innerWidth / 2) * (depth / window.innerWidth);
            const moveY = (mouseY - window.innerHeight / 2) * (depth / window.innerHeight);

            gsap.to(el, {
                x: moveX,
                y: moveY,
                duration: 1.5,
                ease: 'power2.out',
            });
        });
    });

    gsap.ticker.add(() => {
        // Lagged position for the cursor follower
        currentX += (mouseX - currentX) * speed;
        currentY += (mouseY - currentY) * speed;

        gsap.set(follower, {
            x: currentX,
            y: currentY,
        });
    });
}

/**
 * Implements the magnetic pull effect on specified elements.
 */
function initMagneticEffects() {
    const magneticTargets = document.querySelectorAll('.magnetic-btn, .magnetic-link');
    const strength = 0.2; // How far the element moves (percentage of cursor distance)

    magneticTargets.forEach(target => {
        target.addEventListener('mousemove', (e) => {
            const rect = target.getBoundingClientRect();
            const center = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            };
            
            const dx = e.clientX - center.x;
            const dy = e.clientY - center.y;
            
            const x = dx * strength;
            const y = dy * strength;

            gsap.to(target, {
                x: x,
                y: y,
                scale: 1.05,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)',
            });
        });

        target.addEventListener('mouseleave', () => {
            gsap.to(target, {
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: 'elastic.out(1, 0.4)',
            });
        });
    });
}

/**
 * Implements a subtle 3D tilt effect on hover for feature cards.
 */
function initTiltOnHover() {
    const tiltTargets = document.querySelectorAll('.tilt-on-hover');

    tiltTargets.forEach(target => {
        // Vanilla JS implementation of 3D tilt
        target.addEventListener('mousemove', (e) => {
            const rect = target.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const rotateY = (mouseX / width - 0.5) * 2 * 5; // Max 5 deg rotation
            const rotateX = (mouseY / height - 0.5) * 2 * -5; // Max 5 deg rotation

            gsap.to(target, {
                rotationY: rotateY,
                rotationX: rotateX,
                scale: 1.03,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                duration: 0.5,
                ease: 'power2.out',
            });
        });

        target.addEventListener('mouseleave', () => {
            gsap.to(target, {
                rotationY: 0,
                rotationX: 0,
                scale: 1,
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                duration: 0.8,
                ease: 'power3.out',
            });
        });
    });
}

/**
 * Creates a material design-like ripple animation on click for buttons.
 */
function initClickRipple() {
    document.querySelectorAll('.click-ripple').forEach(button => {
        button.style.position = 'relative';
        button.style.overflow = 'hidden';

        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            
            // Calculate position for the center of the click
            const size = Math.max(rect.width, rect.height) * 1.5;
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);

            // GSAP for ripple effect
            gsap.fromTo(ripple, 
                { opacity: 1, scale: 0 }, 
                { opacity: 0, scale: 1, duration: 0.7, ease: 'power2.out', onComplete: () => ripple.remove() }
            );
        });
    });
    
    // Add necessary CSS for the ripple class (injected or in style.css)
    const style = document.createElement('style');
    style.innerHTML = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            background: rgba(255, 255, 255, 0.4);
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}


/* =========================================================================
   4. GSAP & SCROLL-BASED ANIMATIONS
   ========================================================================= */

/**
 * Controls the visibility and animation of the Scroll-to-Top button.
 */
function initScrollToTop() {
    const btn = document.getElementById('scrollTopBtn');
    
    ScrollTrigger.create({
        trigger: document.body,
        start: 'top -500', // Show after 500px scroll
        end: 'bottom top',
        onUpdate: (self) => {
            if (self.direction === 1) {
                gsap.to(btn, { autoAlpha: 1, scale: 1, duration: 0.4 });
                btn.classList.add('show');
            } else if (self.direction === -1 && self.progress < 0.1) {
                gsap.to(btn, { autoAlpha: 0, scale: 0.8, duration: 0.4 });
                btn.classList.remove('show');
            }
        },
    });

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        // Use Lenis scroll if available, otherwise native
        if (typeof lenis !== 'undefined') {
            lenis.scrollTo(0);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

/**
 * Animates the Hero section elements on preloader complete.
 */
function animateHero() {
    // Kinetic Typography (Header Masked Reveal)
    const heroHeadline = document.querySelector('.kinetic-text');
    const heroText = document.querySelector('.hero-section p');
    const heroButtons = document.querySelectorAll('.hero-section .btn');
    
    const tl = gsap.timeline({ defaults: { ease: CONFIG.EASE } });

    // Initial state setup (hidden)
    gsap.set(heroHeadline.children, { yPercent: 100, opacity: 0 }); 

    tl.to('.logo-q', { rotation: 360, duration: 1.5, ease: 'back.out(1.7)' })
      .to('.logo-animate', { scale: 1.05, duration: 0.5, yoyo: true, repeat: 1, ease: 'power1.inOut' }, '<')
      .to('.navbar-brand', { color: CONFIG.COLOR_PRIMARY, duration: 0.8 }, '<')
      
      // Text Fill/Slide Combo
      .to(heroHeadline.children, { 
          yPercent: 0, 
          opacity: 1,
          stagger: 0.15,
          duration: 1.2,
      }, '-=0.5')
      .from(heroText, { opacity: 0, y: 30, duration: 0.8 }, '-=0.5')
      .from(heroButtons, { opacity: 0, y: 30, stagger: 0.2, duration: 0.6 }, '-=0.4');
}

/**
 * Sets up general scroll-based reveal animations for sections.
 */
function initGSAPAnimations() {
    // Scroll-Reveal Header (Text Fill on Scroll)
    document.querySelectorAll('.scroll-reveal-header').forEach(header => {
        gsap.from(header, {
            y: 50,
            opacity: 0,
            duration: 1.2,
            ease: CONFIG.EASE,
            scrollTrigger: {
                trigger: header,
                start: 'top 85%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse',
            }
        });
    });

    // Feature Cards (Staggered Fade-in)
    gsap.utils.toArray('.feature-card').forEach((card, i) => {
        gsap.from(card, {
            y: 50,
            opacity: 0,
            scale: 0.95,
            duration: 1,
            ease: CONFIG.EASE,
            delay: i * 0.1,
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse',
            }
        });
    });
    
    // Horizontal Scroll Pinning (Simulated)
    const hScrollContainer = document.querySelector('.horizontal-scroll-container');
    const planWrapper = document.querySelector('.plan-card-wrapper');

    if (hScrollContainer && planWrapper) {
        const plansWidth = planWrapper.scrollWidth;
        const containerWidth = hScrollContainer.clientWidth;
        
        if (plansWidth > containerWidth) {
             gsap.to(planWrapper, {
                x: () => -(plansWidth - containerWidth),
                ease: 'none',
                scrollTrigger: {
                    trigger: '#plans',
                    start: 'top top',
                    end: () => `+=${plansWidth - containerWidth}`, // Scroll distance equals extra content width
                    scrub: true,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                }
            });
        }
    }
}

/**
 * Implements the Word Shuffling effect for the Hero headline.
 */
function initWordShuffler() {
    const target = document.querySelector('.word-shuffle');
    if (!target) return;

    const words = ["Automated.", "Intelligent.", "Secure.", "Yours."];
    let currentIndex = 0;

    function shuffleText() {
        const nextWord = words[currentIndex];
        
        // Text Scramble Animation (GSAP TextPlugin alternative using simple characters)
        const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let iterations = 0;
        const maxIterations = 15;

        const interval = setInterval(() => {
            if (iterations >= maxIterations) {
                clearInterval(interval);
                target.textContent = nextWord;
                // Schedule the next word change
                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % words.length;
                    shuffleText();
                }, 3000); // Wait 3 seconds before next shuffle
                return;
            }

            // Scramble effect
            target.textContent = nextWord.split('').map((char, index) => {
                if (index < iterations) {
                    return char;
                }
                // Random char from charset
                return charSet[Math.floor(Math.random() * charSet.length)];
            }).join('');

            iterations++;
        }, 50); // Speed of scramble

        // GSAP for smooth scale/color change during scramble
        gsap.fromTo(target, 
            { scale: 1.1, color: CONFIG.COLOR_SECONDARY }, 
            { scale: 1, color: CONFIG.COLOR_PRIMARY, duration: 0.5, ease: 'power1.out' }
        );
    }
    
    // Start the loop
    setTimeout(() => shuffleText(), 2000); // Start after hero animation
}


/* =========================================================================
   5. CANVAS BACKGROUND (Mesh Gradient / Aurora)
   ========================================================================= */

/**
 * Initializes a dynamic, subtle mesh gradient/aurora background using Canvas.
 */
function initDynamicBackground() {
    const canvas = document.getElementById('backgroundCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Define color blobs (simplified points for the gradient)
    const blobs = [
        { x: width * 0.2, y: height * 0.3, radius: 400, color: '#335252', speedX: 0.05, speedY: 0.05 }, // Darker primary mix
        { x: width * 0.8, y: height * 0.7, radius: 450, color: '#6A8189', speedX: -0.04, speedY: -0.03 }, // Secondary mix
        { x: width * 0.5, y: height * 0.1, radius: 350, color: '#64766A', speedX: 0.03, speedY: 0.06 }  // Primary
    ];

    let lastTime = 0;
    const animate = (timestamp) => {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        // Clear canvas with base background color
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bs-body-bg');
        ctx.fillRect(0, 0, width, height);
        
        blobs.forEach(blob => {
            // Update position
            blob.x += Math.cos(timestamp * 0.0001) * blob.speedX * (deltaTime / 16);
            blob.y += Math.sin(timestamp * 0.00015) * blob.speedY * (deltaTime / 16);
            
            // Boundary wrapping
            if (blob.x > width + blob.radius) blob.x = -blob.radius;
            if (blob.x < -blob.radius) blob.x = width + blob.radius;
            if (blob.y > height + blob.radius) blob.y = -blob.radius;
            if (blob.y < -blob.radius) blob.y = height + blob.radius;

            // Draw blob (Radial Gradient for soft edge)
            const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob
