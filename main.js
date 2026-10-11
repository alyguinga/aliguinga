document.getElementById('year').textContent = new Date().getFullYear();

// Theme toggle
const root = document.documentElement;
const themeBtn = document.getElementById('theme');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const pointerEffects = window.matchMedia('(min-width: 601px) and (hover: hover) and (pointer: fine)').matches && !reducedMotion.matches;
try {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
} catch { /* Theme persistence is optional. */ }
const updateThemeLabel = () => {
  themeBtn.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
};
updateThemeLabel();
themeBtn.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  updateThemeLabel();
  try { localStorage.setItem('theme', root.dataset.theme); } catch { /* Storage may be disabled. */ }
});

// Typewriter
const typed = document.getElementById('typed');
const words = ['Data Science', 'Machine Learning', 'Artificial Intelligence', 'Big Data Analytics', 'Computer Vision', 'Natural Language Processing'];
let wi = 0, ci = 0, deleting = false;
function type() {
  if (reducedMotion.matches) { typed.textContent = words[0]; return; }
  const w = words[wi];
  typed.textContent = w.slice(0, ci);
  let delay = deleting ? 45 : 90;
  if (!deleting && ci === w.length) { delay = 1600; deleting = true; }
  else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 300; }
  else ci += deleting ? -1 : 1;
  setTimeout(type, delay);
}
type();

// Reveal effects progressively enhance already-readable content.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });
  root.classList.add('reveal-ready');
  document.querySelectorAll('[data-reveal]').forEach((element) => io.observe(element));
}

// Custom cursor
const cursor = document.querySelector('.cursor');
let cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy;
window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
if (pointerEffects) (function loop() {
  cx += (tx - cx) * 0.18;
  cy += (ty - cy) * 0.18;
  cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a, button, .card').forEach((el) => {
  el.addEventListener('mouseenter', () => cursor.classList.add('big'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
});

// Animated blob background
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
let blobs = [];
function resize() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
function seed() {
  const colors = ['#ff5c38', '#6d5cff', '#23d5ab'];
  blobs = colors.map((color, i) => ({
    color,
    x: window.innerWidth * (0.25 + i * 0.25),
    y: window.innerHeight * (0.3 + (i % 2) * 0.4),
    r: Math.min(window.innerWidth, window.innerHeight) * 0.45,
    dx: (i % 2 ? 1 : -1) * 0.25,
    dy: (i % 2 ? -1 : 1) * 0.18
  }));
}
function draw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.globalCompositeOperation = 'lighter';
  blobs.forEach((b) => {
    b.x += b.dx; b.y += b.dy;
    if (b.x < 0 || b.x > window.innerWidth) b.dx *= -1;
    if (b.y < 0 || b.y > window.innerHeight) b.dy *= -1;
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    g.addColorStop(0, b.color + '55');
    g.addColorStop(1, b.color + '00');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(draw);
}
window.addEventListener('resize', () => { resize(); seed(); });
resize(); seed();
if (!reducedMotion.matches) draw();

// Scroll progress
const bar = document.querySelector('.progress');
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
}, { passive: true });

// 3D tilt on project cards
if (pointerEffects) {
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-8px) perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// Compact navigation on phones, with a usable no-JavaScript fallback.
const navToggle = document.getElementById('nav-toggle');
const primaryNav = document.getElementById('primary-nav');
const compactNav = window.matchMedia('(max-width: 600px)');
function setMenu(open) {
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navToggle.firstElementChild.textContent = open ? '×' : '☰';
  primaryNav.hidden = compactNav.matches && !open;
}
function syncMenu() {
  const focusInNav = primaryNav.contains(document.activeElement);
  navToggle.hidden = !compactNav.matches;
  setMenu(false);
  if (compactNav.matches && focusInNav) navToggle.focus();
}
navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  setMenu(open);
  if (open) primaryNav.querySelector('a').focus();
});
primaryNav.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || !compactNav.matches) return;
  setMenu(false);
  const section = document.querySelector(link.getAttribute('href'));
  if (section) {
    section.setAttribute('tabindex', '-1');
    section.focus({ preventScroll: true });
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && compactNav.matches && navToggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    navToggle.focus();
  }
});
document.addEventListener('click', (event) => {
  if (compactNav.matches && !event.target.closest('.nav')) setMenu(false);
});
compactNav.addEventListener('change', syncMenu);
syncMenu();
