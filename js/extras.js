/**
 * ลูกเล่นเพิ่ม — ซองจดหมาย, สุ่มคำอวยพร, พลุ, กล่องของขวัญ
 */

const RANDOM_WISHES = [
  'วันนี้เป็นวันของเธอ — ยิ้มให้กว้างที่สุดเลย! 😄',
  'ขอให้ปีนี้เต็มไปด้วยเรื่องราวดีๆ 🌸',
  'เอ็นดูสวยและน่ารักที่สุดในวันนี้ ✨',
  'ขอให้ได้พักผ่อนและมีความสุขเต็มๆ 🛋️',
  'ทุกความฝันของเธอขอให้สำเร็จ 🌟',
  'มีแต่คนดีๆ รายล้อมตลอดปี 💕',
  'ขอให้กินของอร่อยได้ทุกวัน 🍜',
  'เอ็นดูคือของขวัญที่ดีที่สุดของวันนี้ 🎁',
  'ขอให้หัวเราะได้บ่อยๆ แบบไม่ต้องหยุด 😆',
  'วันเกิดปีนี้ขอให้พิเศษที่สุดเท่าที่เคยมี! 🎂',
];

let giftTaps = 0;

function setupExtras() {
  setupEnvelope();
  setupRandomWish();
  setupFireworks();
  setupGiftBox();
}

/* ===== Envelope ===== */
function setupEnvelope() {
  const btn = document.getElementById('envelope-btn');
  const letter = document.getElementById('envelope-letter');

  btn.addEventListener('click', () => {
    if (letter.hidden === false) return;
    btn.hidden = true;
    letter.hidden = false;
    if (window.Confetti) Confetti.burst(30);
  });
}

/* ===== Random wish ===== */
function setupRandomWish() {
  const btn = document.getElementById('random-wish-btn');
  const text = document.getElementById('random-wish-text');
  let lastIndex = -1;

  btn.addEventListener('click', () => {
    let idx;
    do { idx = Math.floor(Math.random() * RANDOM_WISHES.length); } while (idx === lastIndex && RANDOM_WISHES.length > 1);
    lastIndex = idx;

    text.classList.remove('show');
    void text.offsetWidth;
    text.textContent = RANDOM_WISHES[idx];
    text.classList.add('show');
    if (window.Confetti) Confetti.burst(25);
  });
}

/* ===== Fireworks tap zone ===== */
function setupFireworks() {
  const zone = document.getElementById('firework-zone');
  let count = 0;

  const launch = (x, y) => {
    count++;
    document.getElementById('firework-count').textContent = count;

    const burst = document.createElement('span');
    burst.className = 'firework-burst';
    burst.textContent = ['🎆', '🎇', '✨', '💥'][Math.floor(Math.random() * 4)];
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    zone.appendChild(burst);
    setTimeout(() => burst.remove(), 800);

    if (window.Confetti) Confetti.burst(35, zone.getBoundingClientRect().left + x, zone.getBoundingClientRect().top + y);
  };

  zone.addEventListener('click', (e) => {
    const rect = zone.getBoundingClientRect();
    launch(e.clientX - rect.left, e.clientY - rect.top);
  });

  zone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = zone.getBoundingClientRect();
    const t = e.touches[0];
    launch(t.clientX - rect.left, t.clientY - rect.top);
  }, { passive: false });
}

/* ===== Gift box ===== */
function setupGiftBox() {
  const btn = document.getElementById('gift-box-btn');
  const icon = document.getElementById('gift-box-icon');
  const hint = document.getElementById('gift-tap-hint');
  const left = document.getElementById('gift-taps-left');
  const result = document.getElementById('gift-result');

  btn.addEventListener('click', () => {
    if (giftTaps >= 3) return;

    giftTaps++;
    icon.classList.add('gift-shake');
    setTimeout(() => icon.classList.remove('gift-shake'), 400);

    if (giftTaps < 3) {
      left.textContent = 3 - giftTaps;
      return;
    }

    hint.hidden = true;
    btn.disabled = true;
    icon.textContent = '🎀';
    result.hidden = false;
    if (window.Confetti) Confetti.burst(100);
  });
}

window.setupExtras = setupExtras;
