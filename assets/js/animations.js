// ===== SCROLL ANIMATIONS =====

export function revealOnScroll() {
    const reveals = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scale-reveal');

    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('visible');
        }
    });
}

export function handleNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

export function animateSkillCircles() {
    const circles = document.querySelectorAll('.skill-circle-progress');

    circles.forEach(circle => {
        const container = circle.closest('.skill-circle');
        const label = container ? container.querySelector('.skill-percent') : null;

        // Determine the percentage from data attribute or fallback to label text
        let percentStr = circle.getAttribute('data-percent') || '';
        let percentNum = parseFloat(percentStr);

        if (Number.isNaN(percentNum)) {
            const text = label ? label.textContent || '' : '';
            const match = text.match(/\d+(?:\.\d+)?/);
            percentNum = match ? parseFloat(match[0]) : 0;
        }

        // Clamp between 0 and 100
        percentNum = Math.max(0, Math.min(100, percentNum));

        // Ensure the label text matches the actual percentage (rounded)
        if (label) {
            label.textContent = `${Math.round(percentNum)}%`;
        }

        const elementTop = circle.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // Animate the circle when it enters the viewport and only once
        if (elementTop < windowHeight - 150 && !circle.style.strokeDashoffset) {
            const circumference = 2 * Math.PI * 54; // r=54 in SVG
            const offset = circumference - (percentNum / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }
    });
}

export function initSmoothScrolling() {
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

export function showHeroContent() {
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.classList.add('visible');
        }
    }, 500);
}
