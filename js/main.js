/**
 * สุขสันต์วันเกิด เอ็นดู — main interactions
 */

const BIRTH_DATE = new Date(1992, 7, 16); // 16 สิงหาคม 2535

document.addEventListener('DOMContentLoaded', init);

function init() {
  hideLoader();
  setupIntro();
  setupNav();
  setupHeroMessage();
  setupRevealOnScroll();
  setupConfettiButton();
  setupBalloons();
  setupCandles();
  setupScratchCard();
  setupHeartGame();
  setupSecretHeart();
  setupScrollHearts();
  setupModal();
  if (window.setupExtras) setupExtras();
}

function hideLoader() {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 800);
}

/* ===== Intro ===== */
function setupIntro() {
  const overlay = document.getElementById('intro-overlay');
  const startBtn = document.getElementById('start-btn');

  const start = () => {
    overlay.classList.add('hidden');
    if (window.Confetti) {
      Confetti.burst(120, window.innerWidth / 2, window.innerHeight / 2);
      setTimeout(() => Confetti.rain(40), 400);
    }
    spawnFloatingHearts(8);
    if (window.BirthdayMusic) {
      BirthdayMusic.play().then(() => updateMusicBtn(true)).catch(() => updateMusicBtn(false));
    }
  };

  startBtn.addEventListener('click', start);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) start();
  });
}

/* ===== Navigation ===== */
function setupNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
  });

  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.textContent = '☰';
    });
  });
}

/* ===== Hero message ===== */
function setupHeroMessage() {
  const age = new Date().getFullYear() - BIRTH_DATE.getFullYear();
  document.getElementById('hero-message').textContent =
    `🎉 วันนี้ครบ ${age} ปีแล้วนะ เอ็นดู! ขอให้มีความสุขมาก ๆ`;
}

/* ===== Scroll reveal ===== */
function setupRevealOnScroll() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));
}

/* ===== Confetti button & music ===== */
function updateMusicBtn(playing) {
  const btn = document.getElementById('music-btn');
  if (!btn) return;
  btn.textContent = playing ? '🔇 ปิดดนตรี' : '🎵 เปิดดนตรี';
}

function setupConfettiButton() {
  document.getElementById('confetti-btn').addEventListener('click', (e) => {
    const rect = e.target.getBoundingClientRect();
    if (window.Confetti) {
      Confetti.burst(100, rect.left + rect.width / 2, rect.top);
    }
  });

  document.getElementById('music-btn').addEventListener('click', () => {
    if (!window.BirthdayMusic) return;
    const on = BirthdayMusic.toggle();
    updateMusicBtn(on);
  });

  window.addEventListener('birthday-music-ended', () => updateMusicBtn(false));
}

/* ===== Balloon pop ===== */
const BALLOON_GOAL = 10;
const BALLOON_COLORS = ['#ff6b9d', '#a855f7', '#818cf8', '#34d399', '#fb923c', '#f472b6'];
let balloonScore = 0;
let balloonWon = false;
let balloonRespawnTimer = null;

function setupBalloons() {
  const area = document.getElementById('balloon-area');
  document.getElementById('balloon-replay').addEventListener('click', resetBalloonGame);
  spawnBalloons(area, 6);

  balloonRespawnTimer = setInterval(() => {
    if (balloonWon) return;
    if (area.querySelectorAll('.balloon:not(.pop)').length < 4) {
      spawnBalloons(area, 2);
    }
  }, 3000);
}

function resetBalloonGame() {
  balloonScore = 0;
  balloonWon = false;
  document.getElementById('balloon-score').textContent = '0';
  document.getElementById('balloon-win').hidden = true;
  const area = document.getElementById('balloon-area');
  area.querySelectorAll('.balloon').forEach((b) => b.remove());
  spawnBalloons(area, 6);
}

function spawnBalloons(area, count) {
  if (balloonWon) return;

  for (let i = 0; i < count; i++) {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.style.background = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    balloon.style.left = `${random(5, 75)}%`;
    balloon.style.top = `${random(10, 60)}%`;
    balloon.style.animationDelay = `${random(0, 2)}s`;

    const pop = (e) => {
      e.stopPropagation();
      if (balloon.classList.contains('pop') || balloonWon) return;
      balloon.classList.add('pop');
      balloonScore++;
      document.getElementById('balloon-score').textContent = balloonScore;
      if (window.Confetti) {
        const rect = balloon.getBoundingClientRect();
        Confetti.burst(20, rect.left + rect.width / 2, rect.top);
      }
      setTimeout(() => balloon.remove(), 300);

      if (balloonScore >= BALLOON_GOAL) {
        winBalloonGame();
      }
    };

    balloon.addEventListener('click', pop);
    balloon.addEventListener('touchstart', pop, { passive: true });
    area.appendChild(balloon);
  }
}

function winBalloonGame() {
  balloonWon = true;
  document.getElementById('balloon-win').hidden = false;
  document.getElementById('balloon-area').querySelectorAll('.balloon').forEach((b) => b.remove());
  if (window.Confetti) Confetti.burst(80);
}

/* ===== Candles — แตะทีละเล่น ===== */
function setupCandles() {
  const candles = document.querySelectorAll('.candle');
  const result = document.getElementById('candle-result');

  candles.forEach((candle) => {
    const blowOut = () => {
      if (!candle.classList.contains('lit')) return;
      candle.classList.remove('lit');
      if (window.Confetti) Confetti.burst(15);

      const remaining = document.querySelectorAll('.candle.lit').length;
      if (remaining === 0) {
        result.hidden = false;
        if (window.Confetti) Confetti.burst(80);
      }
    };

    candle.addEventListener('click', blowOut);
    candle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      blowOut();
    }, { passive: false });
  });

  document.getElementById('relight-btn').addEventListener('click', () => {
    candles.forEach((c) => c.classList.add('lit'));
    result.hidden = true;
  });
}

/* ===== Scratch card ===== */
function setupScratchCard() {
  const canvas = document.getElementById('scratch-canvas');
  const wrap = canvas.parentElement;
  let ctx = canvas.getContext('2d');
  let drawing = false;

  function initCanvas() {
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Silver scratch layer
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#c0c0c0');
    gradient.addColorStop(0.5, '#e8e8e8');
    gradient.addColorStop(1, '#a0a0a0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = '#888';
    ctx.font = 'bold 14px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ขูดตรงนี้ ✨', rect.width / 2, rect.height / 2);
  }

  function scratch(x, y) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (x - rect.left) * (canvas.width / rect.width) / (window.devicePixelRatio || 1);
    const cy = (y - rect.top) * (canvas.height / rect.height) / (window.devicePixelRatio || 1);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  const start = (e) => {
    drawing = true;
    scratch(e.clientX ?? e.touches[0].clientX, e.clientY ?? e.touches[0].clientY);
  };

  const move = (e) => {
    if (!drawing) return;
    e.preventDefault();
    scratch(e.clientX ?? e.touches[0].clientX, e.clientY ?? e.touches[0].clientY);
  };

  const end = () => { drawing = false; };

  initCanvas();
  window.addEventListener('resize', initCanvas);

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', end);
  canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('touchstart', start, { passive: true });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);
}

/* ===== Heart catch game ===== */
const HEART_GOAL = 10;
let heartScore = 0;
let heartWon = false;
let heartInterval = null;

function setupHeartGame() {
  const game = document.getElementById('heart-game');
  document.getElementById('heart-replay').addEventListener('click', resetHeartGame);
  heartInterval = setInterval(() => {
    if (!heartWon) spawnTapHeart(game);
  }, 1200);
}

function resetHeartGame() {
  heartScore = 0;
  heartWon = false;
  document.getElementById('heart-score').textContent = '0';
  document.getElementById('heart-win').hidden = true;
  document.getElementById('heart-game').querySelectorAll('.tap-heart').forEach((h) => h.remove());
}

function spawnTapHeart(game) {
  if (heartWon) return;

  const heart = document.createElement('span');
  heart.className = 'tap-heart';
  heart.textContent = ['💖', '💕', '💗', '❤️', '🩷'][Math.floor(Math.random() * 5)];
  heart.style.left = `${random(10, 80)}%`;
  heart.style.top = `${random(20, 70)}%`;

  const catchHeart = (e) => {
    e.stopPropagation();
    if (heart.classList.contains('caught') || heartWon) return;
    heart.classList.add('caught');
    heartScore++;
    document.getElementById('heart-score').textContent = heartScore;
    if (window.Confetti) Confetti.burst(12);
    setTimeout(() => heart.remove(), 400);

    if (heartScore >= HEART_GOAL) {
      winHeartGame();
    }
  };

  heart.addEventListener('click', catchHeart);
  heart.addEventListener('touchstart', catchHeart, { passive: true });

  game.appendChild(heart);

  setTimeout(() => {
    if (heart.parentElement && !heart.classList.contains('caught')) heart.remove();
  }, 3000);
}

function winHeartGame() {
  heartWon = true;
  document.getElementById('heart-win').hidden = false;
  document.getElementById('heart-game').querySelectorAll('.tap-heart').forEach((h) => h.remove());
  if (window.Confetti) Confetti.burst(80);
}

/* ===== Secret heart easter egg ===== */
function setupSecretHeart() {
  let taps = 0;
  const btn = document.getElementById('secret-heart');
  const modal = document.getElementById('secret-modal');

  btn.addEventListener('click', () => {
    taps++;
    btn.textContent = '❤️';
    setTimeout(() => { btn.textContent = '🤍'; }, 200);

    if (taps >= 5) {
      taps = 0;
      modal.hidden = false;
      if (window.Confetti) Confetti.rain(80);
    }
  });
}

function setupModal() {
  const modal = document.getElementById('secret-modal');
  document.getElementById('modal-close').addEventListener('click', () => {
    modal.hidden = true;
  });
  modal.querySelector('.modal-backdrop').addEventListener('click', () => {
    modal.hidden = true;
  });
  document.getElementById('modal-confetti').addEventListener('click', () => {
    if (window.Confetti) Confetti.burst(150, window.innerWidth / 2, window.innerHeight / 2);
  });
}

/* ===== Floating hearts on scroll ===== */
function setupScrollHearts() {
  let lastScroll = 0;
  window.addEventListener(
    'scroll',
    () => {
      const scrollY = window.scrollY;
      if (scrollY - lastScroll > 80) {
        spawnFloatingHearts(2);
        lastScroll = scrollY;
      }
    },
    { passive: true }
  );
}

function spawnFloatingHearts(count) {
  const container = document.getElementById('floating-hearts');
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = ['💕', '✨', '🎀', '🌸'][Math.floor(Math.random() * 4)];
    heart.style.left = `${random(5, 95)}%`;
    heart.style.bottom = '-20px';
    heart.style.animationDuration = `${random(3, 6)}s`;
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 6000);
  }
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}
