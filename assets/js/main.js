// ===== MAIN APPLICATION ENTRY POINT =====

import { initLoadingScreen } from './loading.js';
import { init3D, update3DOnScroll } from './3d-background.js';
import {
    revealOnScroll,
    handleNavbar,
    animateSkillCircles,
    initSmoothScrolling,
    showHeroContent
} from './animations.js';
import {
    downloadCV,
    showEasterEgg,
    closeEasterEgg,
    showModal,
    closeModal,
    initModalCloseOnOutsideClick,

} from './utils.js';

let threeScriptPromise = null;

function loadThreeScript() {
    if (typeof window.THREE !== 'undefined') {
        return Promise.resolve();
    }

    if (threeScriptPromise) {
        return threeScriptPromise;
    }

    threeScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'assets/lib/three.min.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Three.js'));
        document.head.appendChild(script);
    });

    return threeScriptPromise;
}

function init3DWhenIdle() {
    const start = () => {
        loadThreeScript()
            .then(() => init3D())
            .catch(() => {
                // Keep the page usable even if 3D fails to load.
            });
    };

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(start, { timeout: 1200 });
    } else {
        window.setTimeout(start, 150);
    }
}

// ===== INITIALIZATION =====
function init() {
    let hasStarted3D = false;
    const start3D = () => {
        if (hasStarted3D) return;
        hasStarted3D = true;
        init3DWhenIdle();
    };

    // Listen before loading init so we cannot miss an immediate dispatch.
    document.addEventListener('loadingComplete', start3D, { once: true });

    // Initialize loading screen
    initLoadingScreen();

    // Safety net if loading completed before event hookup in older cached bundles.
    window.setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        const isLoadingGone = !loadingScreen || loadingScreen.classList.contains('hidden');
        if (isLoadingGone) {
            start3D();
        }
    }, 0);

    // Initialize smooth scrolling
    initSmoothScrolling();

    // Initialize modal close on outside click
    initModalCloseOnOutsideClick();

    // Show hero content on page load
    window.addEventListener('load', showHeroContent, { once: true });

    // Scroll work is throttled to one update per animation frame.
    let isScrollTicking = false;
    const handleScroll = () => {
        if (isScrollTicking) return;

        isScrollTicking = true;
        window.requestAnimationFrame(() => {
            revealOnScroll();
            handleNavbar();
            animateSkillCircles();
            update3DOnScroll();
            isScrollTicking = false;
        });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial reveal check
    revealOnScroll();
    handleNavbar();
    animateSkillCircles();

    // Try to load experience data (non-blocking)
    renderExperienceFromJSON();
}

// ===== EXPOSE FUNCTIONS TO GLOBAL SCOPE FOR HTML ONCLICK HANDLERS =====
window.downloadCV = downloadCV;
window.showEasterEgg = showEasterEgg;
window.closeEasterEgg = closeEasterEgg;
window.showModal = showModal;
window.closeModal = closeModal;

// ===== START APPLICATION =====
init();

// ===== DYNAMIC EXPERIENCE RENDERING (Optional) =====
async function renderExperienceFromJSON() {
    const container = document.getElementById('experience-timeline');
    if (!container) return; // No experience section present

    const render = (data) => {
        if (!data || !Array.isArray(data.experiences) || data.experiences.length === 0) {
            // Do not clear container; keep any static fallback markup
            return false;
        }
        container.innerHTML = data.experiences.map((exp, idx) => {
            const title = exp.title || '';
            const company = exp.company || '';
            const location = exp.location ? ` • ${exp.location}` : '';
            const start = exp.start || '';
            const end = exp.end && exp.end.trim() ? exp.end : 'Present';
            const date = [start, end].filter(Boolean).join(' - ');
            const points = Array.isArray(exp.description) ? exp.description : [];
            const delayClass = idx > 0 ? ` skill-delay-${(idx % 6) + 1}` : '';

            const items = points.map(p => `<li>${escapeHtml(p)}</li>`).join('');

            return `
                <div class="timeline-item scroll-reveal${delayClass}">
                    <div class="timeline-content">
                        <div class="timeline-title">${escapeHtml(title)}</div>
                        <div class="timeline-company">${escapeHtml(company)}${escapeHtml(location)}</div>
                        <div class="timeline-date">${escapeHtml(date)}</div>
                        ${items ? `<ul>${items}</ul>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Ensure newly injected items become visible without requiring a scroll
        try { revealOnScroll(); } catch (_) { /* no-op */ }
        return true;
    };

    // Attempt network fetch first
    try {
        const res = await fetch(new URL('assets/data/experience.json', document.baseURI), { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            if (render(data)) return;
        }
    } catch (_) {
        // ignore network errors and fall back to inline data
    }

    // Fallback: use inline JSON if present
    const inline = document.getElementById('experience-data');
    if (inline && inline.textContent) {
        try {
            const data = JSON.parse(inline.textContent);
            render(data);
            return;
        } catch (_) {
            // If parsing fails, leave empty
        }
    }

    // Final fallback: keep whatever static markup exists
    return;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
