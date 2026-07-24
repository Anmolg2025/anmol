/* =========================================================
   Anmol Gupta — Portfolio interactions
   ========================================================= */

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Nav scroll state + mobile toggle ---------- */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 20);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('is-open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('is-open'));
});

/* ---------- Typewriter effect ---------- */
const phrases = ['Artificial Intelligence', 'Machine Learning'];
const typeTarget = document.getElementById('typeTarget');

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeLoop() {
  const current = phrases[phraseIndex];

  if (!isDeleting) {
    charIndex++;
    typeTarget.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      isDeleting = true;
      setTimeout(typeLoop, 1400);
      return;
    }
  } else {
    charIndex--;
    typeTarget.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(typeLoop, 300);
      return;
    }
  }

  const speed = isDeleting ? 45 : 85;
  setTimeout(typeLoop, speed);
}
typeLoop();

/* ---------- Scroll fade-up reveals ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.fade-up').forEach(el => revealObserver.observe(el));

/* ---------- Custom cursor node ---------- */
const cursorNode = document.getElementById('cursorNode');
if (cursorNode) {
  window.addEventListener('mousemove', (e) => {
    cursorNode.style.left = e.clientX + 'px';
    cursorNode.style.top = e.clientY + 'px';
  });

  document.querySelectorAll('a, button, .gallery__item, .chip').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorNode.style.width = '34px';
      cursorNode.style.height = '34px';
      cursorNode.style.background = 'rgba(0,229,255,0.12)';
    });
    el.addEventListener('mouseleave', () => {
      cursorNode.style.width = '18px';
      cursorNode.style.height = '18px';
      cursorNode.style.background = 'transparent';
    });
  });
}

/* ---------- Hero neural network canvas ----------
   A small forward-pass simulation: nodes connect with lines,
   and light pulses travel along edges toward the profile photo,
   evoking signal propagation through a neural net. */
const canvas = document.getElementById('netCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const heroSection = document.querySelector('.hero');

let nodes = [];
let pulses = [];
let dpr = Math.min(window.devicePixelRatio || 1, 2);

function resizeCanvas() {
  if (!canvas) return;
  const rect = heroSection.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  initNodes(rect.width, rect.height);
}

function initNodes(w, h) {
  const count = Math.max(18, Math.floor((w * h) / 42000));
  nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 1
    });
  }
}

function spawnPulse() {
  if (nodes.length < 2) return;
  const a = nodes[Math.floor(Math.random() * nodes.length)];
  const b = nodes[Math.floor(Math.random() * nodes.length)];
  if (a === b) return;
  pulses.push({ a, b, t: 0 });
}

function drawFrame() {
  if (!ctx) return;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  ctx.clearRect(0, 0, w, h);

  const maxDist = Math.min(150, w / 5);

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > w) n.vx *= -1;
    if (n.y < 0 || n.y > h) n.vy *= -1;
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.18;
        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  for (const n of nodes) {
    ctx.beginPath();
    ctx.fillStyle = 'rgba(150, 220, 255, 0.55)';
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill();
  }

  pulses.forEach(p => { p.t += 0.02; });
  pulses = pulses.filter(p => p.t <= 1);
  for (const p of pulses) {
    const x = p.a.x + (p.b.x - p.a.x) * p.t;
    const y = p.a.y + (p.b.y - p.a.y) * p.t;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(139, 92, 246, 0.9)';
    ctx.shadowColor = 'rgba(0, 229, 255, 0.9)';
    ctx.shadowBlur = 8;
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  requestAnimationFrame(drawFrame);
}

if (canvas && ctx) {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  setInterval(spawnPulse, 220);
  requestAnimationFrame(drawFrame);
}

/* ---------- Contact form (front-end only demo handler) ---------- */
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formNote.textContent = 'Message received — I\u2019ll get back to you soon.';
    contactForm.reset();
  });
}
