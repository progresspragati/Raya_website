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

function loadLayout() {
  const elements = {
    'navbar-placeholder': 'src/components/navbar.html',
    'footer-placeholder': 'src/components/footer.html'
  };

  const isPublic = window.location.pathname.includes('/public/');
  const prefix = isPublic ? '../' : '';

  Object.entries(elements).forEach(([id, path]) => {
    const container = document.getElementById(id);
    if (!container) return;

    fetch(prefix + path)
      .then(res => res.text())
      .then(html => {
        if (isPublic) {
          // Robust path correction for being deep inside /public/
          // Ensure shared component relative links point to the right place
          html = html.replace(/href="public\//g, 'href="');
          html = html.replace(/href="index.html"/g, 'href="../index.html"');
          html = html.replace(/src="assets\//g, 'src="../assets/');
        }

        container.innerHTML = html;

        // Post-load injection for Environment and Build info
        if (id === 'footer-placeholder') {
          const envEl = document.getElementById('env-label');
          const buildEl = document.getElementById('build-label');
          
          if (envEl) {
            envEl.textContent = SYSTEM_CONFIG.ENV;
            // Optional: style based on env
            if (SYSTEM_CONFIG.ENV === 'PROD') {
              envEl.classList.remove('bg-amber-500/10', 'text-amber-500', 'border-amber-500/20');
              envEl.classList.add('bg-emerald-500/10', 'text-emerald-500', 'border-emerald-500/20');
            }
          }
          
          if (buildEl) {
            buildEl.textContent = `v${SYSTEM_CONFIG.BUILD.VERSION}-b${SYSTEM_CONFIG.BUILD.NUMBER}`;
          }
        }
      })
      .catch(err => console.error(`Failed to load component ${id}:`, err));
  });
}

document.addEventListener('DOMContentLoaded', loadLayout);
