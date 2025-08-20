/**
 * UI components and interactions
 */

import { DOM } from './config.js';

export function toggleContainer(container, onOpen) {
    // Check if we're on mobile (768px breakpoint to match CSS)
    const isMobile = window.innerWidth <= 768;

    // find all the containers with class "sidebar-container" and if open remove open
    const allContainers = document.querySelectorAll('.sidebar-container');
    allContainers.forEach((c) => {
        if (c !== container && c.classList.contains('open')) {
            c.classList.remove('open');
        }
    });

    if (!container.classList.contains('open')) {
        container.classList.add('open');
        
        // Only adjust padding on desktop, not mobile (mobile uses overlay)
        if (!isMobile) {
            DOM.chatContainer.style.paddingRight = '10%';
            DOM.chatContainer.style.paddingLeft = '10%';
        }
        if (onOpen) {
            onOpen();
        }
    } else {
        container.classList.remove('open');
        
        // Only adjust padding on desktop, not mobile (mobile uses overlay)
        if (!isMobile) {
            DOM.chatContainer.style.paddingRight = '20%';
            DOM.chatContainer.style.paddingLeft = '20%';
        }
    }
}

export function showResetConfirmation() {
    DOM.resetConfirmationModal.style.display = 'flex';
    // Focus the Reset Session button when modal opens
    setTimeout(() => {
        DOM.resetConfirmBtn.focus();
    }, 100);
}

export function hideResetConfirmation() {
    DOM.resetConfirmationModal.style.display = 'none';
}

export function handleResetConfirmation() {
    hideResetConfirmation();
    // Import initChat dynamically to avoid circular dependency
    import('./messages.js').then(({ initChat }) => {
        initChat();
    });
}

export function setupUserProfileDropdown() {
    const userProfileBtn = document.getElementById('user-profile-btn');
    const userProfileDropdown = document.getElementById('user-profile-dropdown');

    if (userProfileBtn && userProfileDropdown) {
        // Toggle dropdown when profile button is clicked
        userProfileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userProfileDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userProfileBtn.contains(e.target) && !userProfileDropdown.contains(e.target)) {
                userProfileDropdown.classList.remove('show');
            }
        });

        // Close dropdown with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && userProfileDropdown.classList.contains('show')) {
                userProfileDropdown.classList.remove('show');
            }
        });

        // Prevent dropdown from closing when clicking inside it
        userProfileDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

export function setupThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    // Get theme from localStorage or default to 'system'
    const currentTheme = localStorage.getItem('theme') || 'system';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            let newTheme;
            
            // Cycle through themes: dark -> light -> system -> dark
            switch (currentTheme) {
                case 'dark':
                    newTheme = 'light';
                    break;
                case 'light':
                    newTheme = 'system';
                    break;
                case 'system':
                default:
                    newTheme = 'dark';
                    break;
            }
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update button title
            const titles = {
                'dark': 'Switch to Light Mode',
                'light': 'Switch to System Mode', 
                'system': 'Switch to Dark Mode'
            };
            themeToggleBtn.title = titles[newTheme];
        });
        
        // Set initial title
        const titles = {
            'dark': 'Switch to Light Mode',
            'light': 'Switch to System Mode',
            'system': 'Switch to Dark Mode'
        };
        themeToggleBtn.title = titles[currentTheme];
    }
}

export function setupToolbar() {
    // Keyboard navigation: roving tabindex within #toolbar-buttons
    const toolbar = document.getElementById('toolbar-buttons');
    if (toolbar) {
        const buttons = Array.from(toolbar.querySelectorAll('button.toolbar-button'));
        // Ensure first button is tabbable
        buttons.forEach((b, i) => b.setAttribute('tabindex', i === 0 ? '0' : '-1'));

        toolbar.addEventListener('keydown', (e) => {
            const focused = document.activeElement;
            const idx = buttons.indexOf(focused);
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                const next = buttons[(idx + 1) % buttons.length];
                if (next) {
                    buttons.forEach(b => b.setAttribute('tabindex', '-1'));
                    next.setAttribute('tabindex', '0');
                    next.focus();
                }
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const prev = buttons[(idx - 1 + buttons.length) % buttons.length];
                if (prev) {
                    buttons.forEach(b => b.setAttribute('tabindex', '-1'));
                    prev.setAttribute('tabindex', '0');
                    prev.focus();
                }
            } else if (e.key === 'Enter' || e.key === ' ') {
                // Activate the button
                e.preventDefault();
                if (focused) focused.click();
            }
        });
    }

    // const schemaBtn = document.getElementById('toolbar-schema');
    // let schemaPanel = document.getElementById('schema-panel');

    // if (!schemaPanel) {
    //     schemaPanel = document.createElement('div');
    //     schemaPanel.id = 'schema-panel';
    //     schemaPanel.innerHTML = '<h3 style="margin:0 0 6px 0;font-size:14px;">Schema</h3><div id="schema-panel-body" style="margin-top:8px;font-size:13px;">Schema panel (empty). Add schema widgets here.</div>';
    //     document.body.appendChild(schemaPanel);
    // }

    // async function loadSchemaIntoPanel() {
    //     const body = document.getElementById('schema-panel-body');
    //     if (!body) return;
    //     body.innerHTML = '<p style="font-size:13px;margin:0;">Loading schema…</p>';
    //     try {
    //         const resp = await fetch('/api/schema');
    //         if (!resp.ok) throw new Error('Network response was not ok');
    //         const data = await resp.json();
    //         // If data has tables array, render a simple list/table
    //         if (Array.isArray(data.tables)) {
    //             const ul = document.createElement('ul');
    //             ul.style.margin = '0';
    //             ul.style.padding = '0 0 0 14px';
    //             data.tables.forEach(t => {
    //                 const li = document.createElement('li');
    //                 li.textContent = t.name || JSON.stringify(t);
    //                 ul.appendChild(li);
    //             });
    //             body.innerHTML = '';
    //             body.appendChild(ul);
    //         } else {
    //             body.innerHTML = '<pre style="white-space:pre-wrap;font-size:12px;margin:0;">' + JSON.stringify(data, null, 2) + '</pre>';
    //         }
    //     } catch (err) {
    //         body.innerHTML = '<p style="color:var(--text-secondary);margin:0;font-size:13px;">Could not load schema. Showing placeholder.</p><pre style="white-space:pre-wrap;font-size:12px;margin-top:8px;">' + String(err) + '</pre>';
    //     }
    // }

    // if (schemaBtn) {
    //     schemaBtn.addEventListener('click', function() {
    //         const isOpen = schemaBtn.getAttribute('aria-pressed') === 'true';
    //         schemaBtn.setAttribute('aria-pressed', (!isOpen).toString());
    //         schemaPanel.classList.toggle('open');
    //         if (!isOpen) {
    //             // panel opened — attempt to load schema
    //             loadSchemaIntoPanel();
    //         }
    //     });
    // }
}

export function handleWindowResize() {
    const isMobile = window.innerWidth <= 768;

    // Find all the containers with class "sidebar-container" and if open remove open
    const allContainers = document.querySelectorAll('.sidebar-container');
    allContainers.forEach((c) => {
        // If menu is open and we switch to mobile, remove any desktop padding
        if (isMobile && c.classList.contains('open')) {
            DOM.chatContainer.style.paddingRight = '';
            DOM.chatContainer.style.paddingLeft = '';
        }
        // If menu is open and we switch to desktop, apply desktop padding
        else if (!isMobile && c.classList.contains('open')) {
            DOM.chatContainer.style.paddingRight = '10%';
            DOM.chatContainer.style.paddingLeft = '10%';
        }
        // If menu is closed and we're on desktop, ensure default desktop padding
        else if (!isMobile && !c.classList.contains('open')) {
            DOM.chatContainer.style.paddingRight = '20%';
            DOM.chatContainer.style.paddingLeft = '20%';
        }
    });


}
