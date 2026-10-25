// ===== THEME TOGGLE =====
export function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const btn = document.querySelector('.theme-toggle');
    if (document.body.classList.contains('light-mode')) {
        btn.textContent = '🌙 Dark Mode';
        localStorage.setItem('theme', 'light');
    } else {
        btn.textContent = '☀️ Light Mode';
        localStorage.setItem('theme', 'dark');
    }
}

export function initTheme() {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        const btn = document.querySelector('.theme-toggle');
        if (btn) btn.textContent = '🌙 Dark Mode';
    }
}
