/**
 * Lightweight canvas confetti engine
 */
(function () {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animating = false;

  const COLORS = ['#ff6b9d', '#a855f7', '#ffd700', '#818cf8', '#34d399', '#fb923c', '#f472b6'];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticle(x, y) {
    const angle = random(0, Math.PI * 2);
    const speed = random(2, 10);
    return {
      x: x ?? random(0, canvas.width),
      y: y ?? random(-20, 0),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - random(2, 6),
      w: random(6, 12),
      h: random(4, 8),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: random(0, 360),
      rotationSpeed: random(-8, 8),
      gravity: random(0.15, 0.3),
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    };
  }

  function burst(count, x, y) {
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(x, y));
    }
    if (!animating) {
      animating = true;
      requestAnimationFrame(tick);
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter((p) => {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;

      if (p.y > canvas.height + 20) {
        p.opacity -= 0.05;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }

      ctx.restore();
      return p.opacity > 0 && p.y < canvas.height + 50;
    });

    if (particles.length > 0) {
      requestAnimationFrame(tick);
    } else {
      animating = false;
    }
  }

  window.Confetti = {
    burst: (count = 80, x, y) => burst(count, x, y),
    rain: (count = 50) => {
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(random(0, canvas.width), random(-canvas.height, 0)));
      }
      if (!animating) {
        animating = true;
        requestAnimationFrame(tick);
      }
    },
  };

  window.addEventListener('resize', resize);
  resize();
})();
