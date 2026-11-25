/**
 * ท้องฟ้าพื้นหลัง (ดาว, ดาวตก, ดาวเคราะห์ไกล, วาร์ป) และคอนเฟตติรูปดาว
 */
(function () {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const COLORS = ['#ffc857', '#ff7f8e', '#7fe3c8', '#8fb7ff', '#f3f0e6'];

  function fit(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  /* ---------- ท้องฟ้า ---------- */
  const skyEl = document.getElementById('sky');
  let S, stars = [], shots = [], nextShot = 1.5, warp = null, paused = false;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  function build() {
    const oldW = S && S.w;
    S = fit(skyEl);
    if (oldW === S.w && stars.length) return; // แถบ URL มือถือเลื่อน ไม่ต้องสุ่มดาวใหม่
    const n = Math.min(320, Math.round((S.w * S.h) / 4200));
    stars = Array.from({ length: n }, () => {
      const z = Math.random();
      return {
        x: Math.random(), y: Math.random(), z,
        r: 0.5 + z * 1.4, p: rnd(0, 6.28), s: rnd(0.6, 2.2),
        c: Math.random() < 0.18 ? COLORS[(Math.random() * 4) | 0] : '#f3f0e6',
      };
    });
  }

  function planet(x, y, r, a, b, ring) {
    const c = S.ctx;
    const g = c.createRadialGradient(x - r * 0.4, y - r * 0.5, r * 0.1, x, y, r * 1.05);
    g.addColorStop(0, a);
    g.addColorStop(0.65, b);
    g.addColorStop(1, '#0a0d1f');
    if (ring) {
      c.strokeStyle = ring;
      c.lineWidth = r * 0.12;
      c.beginPath(); c.ellipse(x, y, r * 1.85, r * 0.5, -0.35, Math.PI, Math.PI * 2); c.stroke();
    }
    c.fillStyle = g;
    c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
    if (ring) { c.beginPath(); c.ellipse(x, y, r * 1.85, r * 0.5, -0.35, 0, Math.PI); c.stroke(); }
  }

  function frame(t, dt) {
    const { ctx, w, h } = S;
    ctx.clearRect(0, 0, w, h);
    const scroll = window.scrollY;
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;

    const drift = reduced ? 0 : t * 4;
    for (const s of stars) {
      const x = (((s.x * w + pointer.x * 22 * s.z - drift * s.z) % w) + w) % w;
      const y = (((s.y * h - scroll * 0.18 * s.z + pointer.y * 22 * s.z) % h) + h) % h;
      ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * s.s * 0.6 + s.p)) * (0.4 + s.z * 0.6);
      ctx.fillStyle = s.c;
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;

    const k = scroll / h, m = Math.min(w, h), bob = reduced ? 0 : 1;
    planet(w * 0.97 + pointer.x * 14, h * 1.04 - k * h * 0.16 + Math.sin(t * 0.3) * 6 * bob, m * 0.075, '#ffb59a', '#a4506a', 'rgba(255,200,140,.5)');
    planet(w * 0.04 + pointer.x * 8, h * 1.35 - k * h * 0.3 + Math.sin(t * 0.22) * 8 * bob, m * 0.1, '#9fe6d6', '#2c6f86');
    planet(w * 0.95 + pointer.x * 10, h * 1.9 - k * h * 0.36 + Math.sin(t * 0.26) * 8 * bob, m * 0.09, '#b4c6ff', '#4b52a8', 'rgba(170,190,255,.4)');

    if (!reduced) {
      nextShot -= dt;
      if (nextShot < 0) { shoot(); nextShot = rnd(2.5, 6); }
    }
    shots = shots.filter((s) => {
      s.life += dt;
      const p = s.life / s.dur;
      if (p >= 1) return false;
      const x = s.x + s.vx * s.life;
      const y = s.y + s.vy * s.life;
      const len = s.len / Math.hypot(s.vx, s.vy);
      const g = ctx.createLinearGradient(x, y, x - s.vx * len, y - s.vy * len);
      g.addColorStop(0, '#fff8e0');
      g.addColorStop(1, 'rgba(143,183,255,0)');
      ctx.globalAlpha = Math.sin(p * Math.PI);
      ctx.strokeStyle = g;
      ctx.lineWidth = s.size;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - s.vx * len, y - s.vy * len); ctx.stroke();
      ctx.globalAlpha = 1;
      return true;
    });

    if (warp) drawWarp(dt);
  }

  function shoot(big) {
    const a = rnd(0.35, 0.75);
    const v = rnd(500, 800);
    const dir = Math.random() < 0.5 ? 1 : -1;
    shots.push({
      x: dir > 0 ? rnd(-50, S.w * 0.5) : rnd(S.w * 0.5, S.w + 50), y: rnd(-20, S.h * 0.35),
      vx: Math.cos(a) * v * dir, vy: Math.sin(a) * v, life: 0,
      dur: big ? 1.4 : rnd(0.7, 1.1), len: big ? 320 : rnd(90, 180), size: big ? 4 : 2,
    });
  }

  function drawWarp(dt) {
    const { ctx, w, h } = S;
    warp.t += dt;
    const p = Math.min(1, warp.t / warp.dur);
    const speed = 0.15 + Math.pow(Math.sin(p * Math.PI), 2) * 3.2;
    const R = Math.max(w, h) * 0.3;
    ctx.lineCap = 'round';
    for (const s of warp.stars) {
      const z0 = s.z;
      s.z -= speed * dt;
      if (s.z <= 0.04) { s.z = 1; continue; }
      ctx.strokeStyle = s.c;
      ctx.globalAlpha = (1 - s.z) * Math.sin(p * Math.PI);
      ctx.lineWidth = (1 - s.z) * 3;
      ctx.beginPath();
      ctx.moveTo(w / 2 + (s.x / z0) * R, h / 2 + (s.y / z0) * R);
      ctx.lineTo(w / 2 + (s.x / s.z) * R, h / 2 + (s.y / s.z) * R);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (p >= 1) { const done = warp.done; warp = null; done(); }
  }

  function startWarp(dur) {
    return new Promise((done) => {
      if (reduced || document.hidden) { done(); return; }
      warp = {
        t: 0, dur, done,
        stars: Array.from({ length: 420 }, () => ({ x: rnd(-1, 1), y: rnd(-1, 1), z: rnd(0.05, 1), c: COLORS[(Math.random() * 5) | 0] })),
      };
      // กันค้างถ้าแท็บถูกพับระหว่างวาร์ป
      setTimeout(() => { if (warp) { warp = null; done(); } }, dur * 1000 + 800);
    });
  }

  /* ---------- คอนเฟตติ ---------- */
  const fxEl = document.getElementById('fx');
  let X, bits = [], dirty = false;

  function bit(x, y, up) {
    const a = rnd(0, 6.28), v = rnd(60, 460);
    const b = {
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - up, g: rnd(260, 460),
      r: rnd(3, 8), rot: rnd(0, 6), vr: rnd(-7, 7), c: COLORS[(Math.random() * 5) | 0],
      life: rnd(1.4, 3), shape: (Math.random() * 3) | 0,
    };
    bits.push(b);
    return b;
  }
  function burst(n = 60, x = X.w / 2, y = X.h / 2) {
    if (reduced) n = Math.min(n, 16);
    if (bits.length > 700) return;
    for (let i = 0; i < n; i++) bit(x, y, 160);
  }
  function rain(n = 90) {
    if (reduced) n = 16;
    for (let i = 0; i < n; i++) Object.assign(bit(rnd(0, X.w), rnd(-X.h * 0.7, -10), 0), { life: 5, g: rnd(60, 130) });
  }
  function drawBits(dt) {
    if (!bits.length && !dirty) return;
    const { ctx, w, h } = X;
    ctx.clearRect(0, 0, w, h);
    dirty = bits.length > 0;
    bits = bits.filter((b) => {
      b.life -= dt; b.vy += b.g * dt; b.vx *= 1 - 0.9 * dt;
      b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
      if (b.life <= 0 || b.y > h + 20) return false;
      ctx.save();
      ctx.globalAlpha = Math.min(1, b.life * 1.5);
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.fillStyle = b.c;
      ctx.beginPath();
      if (b.shape === 0) ctx.rect(-b.r, -b.r / 2, b.r * 2, b.r);
      else if (b.shape === 1) ctx.arc(0, 0, b.r * 0.7, 0, 6.2832);
      else {
        for (let i = 0; i < 10; i++) {
          const k = i % 2 ? b.r * 0.5 : b.r * 1.2;
          ctx.lineTo(Math.cos(i * 0.628) * k, Math.sin(i * 0.628) * k);
        }
      }
      ctx.fill();
      ctx.restore();
      return true;
    });
  }

  let last = 0;
  function loop(ms) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (ms - last) / 1000 || 0.016);
    last = ms;
    if (!paused) frame(ms / 1000, dt);
    drawBits(dt);
  }

  function resize() { build(); X = fit(fxEl); }
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    pointer.tx = e.clientX / S.w - 0.5;
    pointer.ty = e.clientY / S.h - 0.5;
  }, { passive: true });
  resize();
  requestAnimationFrame(loop);

  window.Sky = { warp: startWarp, shoot: () => shoot(true), pause: (v) => { paused = v; }, reduced };
  window.Confetti = { burst, rain };
})();
