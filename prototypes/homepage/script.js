/* ─── Footer Year ─────────────────────────────────────────── */
document.getElementById('footer-year').textContent = new Date().getFullYear();

/* ─── Navbar scroll opacity ───────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ─── Mobile menu ─────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ─── Scroll fade-in observer ─────────────────────────────── */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.section-fade').forEach(el => fadeObserver.observe(el));

/* ─── Pricing toggle ──────────────────────────────────────── */
const billingToggle = document.getElementById('billing-toggle');
const proPrice  = document.getElementById('pro-price');
const proPeriod = document.getElementById('pro-period');
const proDesc   = document.getElementById('pro-desc');
const lblMonthly = document.getElementById('lbl-monthly');
const lblYearly  = document.getElementById('lbl-yearly');

billingToggle.addEventListener('change', () => {
  const yearly = billingToggle.checked;
  if (yearly) {
    proPrice.textContent  = '$72';
    proPeriod.textContent = '/yr';
    proDesc.textContent   = 'Billed annually — save $24';
    lblMonthly.classList.remove('active');
    lblYearly.classList.add('active');
  } else {
    proPrice.textContent  = '$8';
    proPeriod.textContent = '/mo';
    proDesc.textContent   = 'Billed monthly';
    lblMonthly.classList.add('active');
    lblYearly.classList.remove('active');
  }
});
// Set initial active state
lblMonthly.classList.add('active');

/* ─── Chaos Canvas Animation ──────────────────────────────── */
(function initChaos() {
  const canvas = document.getElementById('chaos-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const wrap = canvas.parentElement;
  let mouse = null;
  let animId = null;
  let icons = [];

  // Icon definitions: label, bg color, text/symbol color, text
  const ICON_DEFS = [
    { key: 'notion',   bg: '#ffffff', fg: '#000000', label: 'N',   shape: 'round-square' },
    { key: 'github',   bg: '#24292e', fg: '#ffffff', label: 'GH',  shape: 'circle' },
    { key: 'slack',    bg: '#4a154b', fg: '#e01e5a', label: '#',   shape: 'round-square' },
    { key: 'vscode',   bg: '#0078d4', fg: '#ffffff', label: '<>',  shape: 'round-square' },
    { key: 'browser',  bg: '#1a73e8', fg: '#ffffff', label: '⊕',   shape: 'circle' },
    { key: 'terminal', bg: '#1e1e1e', fg: '#33ff00', label: '>_',  shape: 'round-square' },
    { key: 'textfile', bg: '#374151', fg: '#9ca3af', label: '≡',   shape: 'round-square' },
    { key: 'bookmark', bg: '#6366f1', fg: '#ffffff', label: '⚑',   shape: 'circle' },
  ];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    // Re-clamp icon positions to new bounds
    icons.forEach(icon => {
      icon.x = Math.max(icon.radius, Math.min(w - icon.radius, icon.x));
      icon.y = Math.max(icon.radius, Math.min(h - icon.radius, icon.y));
    });
  }

  function createIcon(def, canvasW, canvasH) {
    const r = 22;
    return {
      ...def,
      x: r + Math.random() * (canvasW - r * 2),
      y: r + Math.random() * (canvasH - r * 2),
      vx: (Math.random() - 0.5) * 1.4,
      vy: (Math.random() - 0.5) * 1.4,
      radius: r,
      rotation: (Math.random() - 0.5) * 0.4,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      scale: 1,
      scaleDir: 1,
      scaleSpeed: 0.002 + Math.random() * 0.002,
    };
  }

  function drawIcon(icon) {
    const { x, y, radius, rotation, scale, bg, fg, label, shape } = icon;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    // Shadow
    ctx.shadowColor = bg;
    ctx.shadowBlur = 10;

    const r = radius;

    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = bg;
      ctx.fill();
    } else {
      // Rounded square
      const s = r * 1.7;
      const cr = s * 0.28;
      ctx.beginPath();
      ctx.roundRect(-s / 2, -s / 2, s, s, cr);
      ctx.fillStyle = bg;
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    // Label text
    ctx.fillStyle = fg;
    const fontSize = label.length > 2 ? 9 : label.length > 1 ? 11 : 16;
    ctx.font = `700 ${fontSize}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 0);

    ctx.restore();
  }

  function update() {
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;

    icons.forEach(icon => {
      // Mouse repulsion
      if (mouse) {
        const dx = icon.x - mouse.x;
        const dy = icon.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90 && dist > 0) {
          const force = ((90 - dist) / 90) * 2.5;
          icon.vx += (dx / dist) * force;
          icon.vy += (dy / dist) * force;
        }
      }

      // Damping
      icon.vx *= 0.985;
      icon.vy *= 0.985;

      // Speed cap
      const speed = Math.sqrt(icon.vx * icon.vx + icon.vy * icon.vy);
      const maxSpeed = 2.5;
      if (speed > maxSpeed) {
        icon.vx = (icon.vx / speed) * maxSpeed;
        icon.vy = (icon.vy / speed) * maxSpeed;
      }

      // Minimum drift so icons never stop completely
      if (speed < 0.25) {
        icon.vx += (Math.random() - 0.5) * 0.3;
        icon.vy += (Math.random() - 0.5) * 0.3;
      }

      icon.x += icon.vx;
      icon.y += icon.vy;

      // Bounce off walls
      const r = icon.radius;
      if (icon.x - r < 0) { icon.x = r; icon.vx = Math.abs(icon.vx) * 0.8; }
      if (icon.x + r > W) { icon.x = W - r; icon.vx = -Math.abs(icon.vx) * 0.8; }
      if (icon.y - r < 0) { icon.y = r; icon.vy = Math.abs(icon.vy) * 0.8; }
      if (icon.y + r > H) { icon.y = H - r; icon.vy = -Math.abs(icon.vy) * 0.8; }

      // Subtle rotation
      icon.rotation += icon.rotSpeed;

      // Scale pulse
      icon.scale += icon.scaleSpeed * icon.scaleDir;
      if (icon.scale > 1.06 || icon.scale < 0.94) icon.scaleDir *= -1;
    });
  }

  function render() {
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;
    ctx.clearRect(0, 0, W, H);
    icons.forEach(drawIcon);
  }

  function loop() {
    update();
    render();
    animId = requestAnimationFrame(loop);
  }

  // Track mouse position relative to canvas
  wrap.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, { passive: true });

  wrap.addEventListener('mouseleave', () => { mouse = null; }, { passive: true });

  // Init
  resize();
  icons = ICON_DEFS.map(def => createIcon(def, wrap.clientWidth, wrap.clientHeight));

  const resizeObs = new ResizeObserver(() => { resize(); });
  resizeObs.observe(wrap);

  // Only animate when visible
  const visObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animId) animId = requestAnimationFrame(loop);
      } else {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
      }
    });
  }, { threshold: 0.1 });
  visObs.observe(canvas);
})();
