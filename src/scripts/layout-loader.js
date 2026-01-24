/**
 * layout-loader.js
 * Utility to load shared layout components (Navbar, Footer, etc.)
 */

// Global System Configuration
const SYSTEM_CONFIG = {
  ENV: 'DEV', // Options: DEV, QA, UAT, PROD
  BUILD: {
    VERSION: '1.2.4',
    NUMBER: '852'
  }
};

function initializeNavbar() {
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('mobile-menu');
  const navContainer = document.querySelector('.nav-container');

  if (!toggle || !menu) return;

  // Toggle Menu
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = menu.classList.toggle('active');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isActive);
  });

  // Close on Outside Click
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('active') && !menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('active');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
      menu.classList.remove('active');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Scroll Behavior
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navContainer.classList.add('scrolled');
    } else {
      navContainer.classList.remove('scrolled');
    }
  });
}

function loadLayout() {
  const elements = {
    'navbar-placeholder': 'src/components/navbar.html',
    'footer-placeholder': 'src/components/footer.html',
    'vision-nav-placeholder': 'src/components/vision-nav.html'
  };

  const isPublic = window.location.pathname.includes('/public/');
  const prefix = isPublic ? '../' : '';

  const promises = Object.entries(elements).map(([id, path]) => {
    const container = document.getElementById(id);
    if (!container) return Promise.resolve();

    return fetch(prefix + path)
      .then(res => res.text())
      .then(html => {
        if (isPublic) {
          if (id !== 'vision-nav-placeholder') {
            html = html.replace(/href="public\//g, 'href="');
            html = html.replace(/href="index.html"/g, 'href="../index.html"');
            html = html.replace(/src="assets\//g, 'src="../assets/');
          }
        }
        container.innerHTML = html;

        if (id === 'footer-placeholder') {
          const envEl = document.getElementById('env-label');
          const buildEl = document.getElementById('build-label');
          if (envEl) envEl.textContent = SYSTEM_CONFIG.ENV;
          if (buildEl) buildEl.textContent = `v${SYSTEM_CONFIG.BUILD.VERSION}-b${SYSTEM_CONFIG.BUILD.NUMBER}`;
        }
      })
      .catch(err => console.error(`Failed to load component ${id}:`, err));
  });

  Promise.all(promises).then(() => {
    initializeNavbar();
  });
}

document.addEventListener('DOMContentLoaded', loadLayout);
