const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const navClose = document.getElementById('navClose');
const siteNav = document.getElementById('siteNav');
const sidebarOverlay = document.getElementById('sidebarOverlay');

const storedTheme = localStorage.getItem('abca-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

setTheme(initialTheme);

function setTheme(theme) {
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }
  localStorage.setItem('abca-theme', theme);
}

themeToggle.addEventListener('click', () => {
  const isDark = root.getAttribute('data-theme') === 'dark';
  setTheme(isDark ? 'light' : 'dark');
});

function openNav() {
  siteNav.classList.add('open');
  sidebarOverlay.classList.add('visible');
  menuToggle.setAttribute('aria-expanded', 'true');
}

function closeNav() {
  siteNav.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
  menuToggle.setAttribute('aria-expanded', 'false');
}

menuToggle.addEventListener('click', openNav);
navClose.addEventListener('click', closeNav);
sidebarOverlay.addEventListener('click', closeNav);

siteNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeNav);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeNav();
  }
});
