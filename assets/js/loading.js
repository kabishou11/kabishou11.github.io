// ===== LOADING SCREEN =====
const SESSION_KEY = 'cv-loading-seen';
const MIN_FIRST_LOAD_MS = 120;
const MIN_REPEAT_LOAD_MS = 0;
const MAX_WAIT_MS = 900;
const PROGRESS_RAMP_MS = 320;

export function initLoadingScreen() {
    const progressFill = document.getElementById('progressFill');
    const loadingPercent = document.getElementById('loadingPercent');
    const loadingScreen = document.getElementById('loadingScreen');

    if (!progressFill || !loadingPercent || !loadingScreen) {
        document.dispatchEvent(new CustomEvent('loadingComplete'));
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSeenLoading = sessionStorage.getItem(SESSION_KEY) === '1';
    const minimumDisplayMs = prefersReducedMotion
        ? 0
        : (hasSeenLoading ? MIN_REPEAT_LOAD_MS : MIN_FIRST_LOAD_MS);

    const startTime = performance.now();
    let hasCompleted = false;
    let isPageReady = document.readyState !== 'loading';

    function finalizeLoading() {
        if (hasCompleted) return;
        hasCompleted = true;
        sessionStorage.setItem(SESSION_KEY, '1');

        progressFill.style.width = '100%';
        loadingPercent.textContent = '100%';

        const elapsed = performance.now() - startTime;
        const waitMs = Math.max(0, minimumDisplayMs - elapsed);

        window.setTimeout(() => {
            loadingScreen.classList.add('hidden');
            // Notify main.js that loading is complete
            document.dispatchEvent(new CustomEvent('loadingComplete'));
        }, waitMs);
    }

    function updateProgress() {
        if (hasCompleted) return;

        const elapsed = performance.now() - startTime;
        const maxBeforeComplete = isPageReady ? 99 : 95;
        const progress = Math.min(maxBeforeComplete, Math.round((elapsed / PROGRESS_RAMP_MS) * 95));

        progressFill.style.width = `${progress}%`;
        loadingPercent.textContent = `${progress}%`;

        window.requestAnimationFrame(updateProgress);
    }

    const markReady = () => {
        isPageReady = true;
        finalizeLoading();
    };

    if (isPageReady) {
        finalizeLoading();
    } else {
        document.addEventListener('DOMContentLoaded', markReady, { once: true });
        window.addEventListener('load', markReady, { once: true });
    }

    window.setTimeout(finalizeLoading, MAX_WAIT_MS);
    window.requestAnimationFrame(updateProgress);
}
