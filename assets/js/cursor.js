// ===== CUSTOM CURSOR (Desktop only) =====
export function initCustomCursor() {
    // Only enable custom cursor on desktop with mouse
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return;
    }

    const cursor = document.querySelector('.cursor');
    const cursorTrail = document.querySelector('.cursor-trail');

    if (!cursor || !cursorTrail) return;

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        setTimeout(() => {
            cursorTrail.style.left = e.clientX + 'px';
            cursorTrail.style.top = e.clientY + 'px';
        }, 100);
    });
}
