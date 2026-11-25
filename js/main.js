/**
 * หน้าเว็บหลัก: ด่านวันเกิด → หน้าอวยพร (เปลี่ยนตามวันเวลาจริง) → เกม/สมุดสะสม/ข้อความ
 */
(function () {
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => Math.floor(n).toLocaleString('en-US');
  let birth = null;
  let shownKey = '';

  window.App = { info: () => Birthday.info(birth, Birthday.now()) };

  /* ---------- ด่านกรอกวันเกิด ---------- */
  function setupGate() {
    const input = $('code-input'), slots = [...document.querySelectorAll('#code i')];
    const hints = slots.map((s) => s.textContent);
    const err = $('code-error');
    let busy = false;

    function paint() {
      const v = Birthday.digits(input.value);
      if (input.value !== v) input.value = v;
      slots.forEach((s, i) => {
        s.textContent = v[i] || hints[i];
        s.classList.toggle('on', i < v.length);
        s.classList.toggle('cur', i === Math.min(v.length, 7));
      });
      input.setSelectionRange(v.length, v.length);
    }
    input.addEventListener('input', () => { err.textContent = ''; $('code').classList.remove('bad'); paint(); });
    ['focus', 'click', 'keyup'].forEach((t) => input.addEventListener(t, paint));
    paint();

    $('gate-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (busy) return;
      const r = Birthday.check(input.value);
      if (!r.ok) {
        err.textContent = r.message;
        const box = $('code');
        box.classList.remove('bad');
        void box.offsetWidth;
        box.classList.add('bad');
        Sound.sfx('bad');
        input.focus();
        return;
      }
      busy = true;
      birth = r.birth;
      input.blur();
      await enter();
    });
  }

  async function enter() {
    Sound.sfx('launch');
    $('gate').classList.add('go');
    await Sky.warp(2.1);
    $('gate').remove();
    $('app').hidden = false;
    window.scrollTo(0, 0);
    Art.hydrate(document);
    setupPage();
    tick();
    setInterval(tick, 1000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
    celebrate(App.info().phase);
  }

  function celebrate(phase) {
    if (phase === 'upcoming') { Confetti.burst(40, innerWidth / 2, innerHeight * 0.4); return; }
    Sound.play();
    Confetti.burst(phase === 'today' ? 160 : 90, innerWidth / 2, innerHeight * 0.4);
    Confetti.rain(phase === 'today' ? 140 : 60);
  }

  /* ---------- เนื้อหาตามวันจริง ---------- */
  function copy(i) {
    const when = `${i.dayMonth} ${i.lastYearBE}`;
    if (i.phase === 'today') {
      return {
        greet: 'สุขสันต์วันเกิดนะ',
        msg: `วันนี้ณัฐชยาโคจรรอบดวงอาทิตย์ครบ ${i.age} รอบพอดี ทั้งจักรวาลมาฉลองด้วย ขอให้วันนี้เป็นวันที่มีความสุขที่สุด`,
        label: `วันเกิดครบ ${i.age} ปี ฉลองได้อีก`,
        scratch: `ครบ ${i.age} ปีวันนี้แล้ว เอ็นดูคือคนพิเศษของวันนี้ ขอให้ปีนี้เต็มไปด้วยรอยยิ้มนะ`,
        letter: ['วันนี้เป็นวันที่พิเศษที่สุด', 'ขอให้เธอยิ้มได้ทั้งวัน', 'และรู้ว่ามีคนคิดถึงเธอเสมอ', `สุขสันต์วันเกิดครบ ${i.age} ปีนะ`],
      };
    }
    if (i.phase === 'belated') {
      return {
        greet: 'สุขสันต์วันเกิดย้อนหลังนะ',
        msg: `ครบ ${i.age} ปีไปเมื่อ ${when} ผ่านมาแล้ว ${i.daysSince} วัน คำอวยพรนี้เดินทางข้ามอวกาศมาไกลหน่อย แต่มาถึงแล้วนะ`,
        label: `จะครบ ${i.nextAge} ปีในอีก`,
        scratch: `ถึงจะช้าไป ${i.daysSince} วัน แต่ความหวังดีไม่เคยหมดอายุ ขอให้ปีที่ ${i.nextAge} ของเธอเต็มไปด้วยรอยยิ้ม`,
        letter: ['แสงจากดาวบางดวงใช้เวลานานกว่าจะมาถึงเรา', `คำอวยพรนี้ก็เหมือนกัน มาช้าไป ${i.daysSince} วัน`, 'แต่ทุกคำยังสว่างเท่าเดิม', 'ขอให้เธอยิ้มได้ทุกวัน และรู้ว่ามีคนคิดถึงเธอเสมอ', `สุขสันต์วันเกิดครบ ${i.age} ปีย้อนหลังนะ`],
      };
    }
    return {
      greet: 'กำลังโคจรไปหาวันเกิด',
      msg: `ตอนนี้ณัฐชยาอายุ ${i.age} ปี อีก ${i.daysUntil} วันจะถึง ${i.dayMonth} ${i.nextYearBE} วันที่จะครบ ${i.nextAge} ปี`,
      label: `จะครบ ${i.nextAge} ปีในอีก`,
      scratch: `อีก ${i.daysUntil} วันก็ถึงวันของเธอแล้ว ระหว่างนี้ขอให้ทุกวันเป็นวันดี ๆ นะ`,
      letter: ['ยังไม่ถึงวันเกิดก็คิดถึงได้', 'ระหว่างทางที่โลกหมุนไปหาวันนั้น', 'ขอให้เธอยิ้มได้ทุกวัน', `แล้วเจอกันตอนครบ ${i.nextAge} ปีนะ`],
    };
  }

  function render(i) {
    const c = copy(i);
    document.body.dataset.phase = i.phase;
    document.title = `${c.greet} เอ็นดู`;
    $('hero-greet').textContent = c.greet;
    $('hero-msg').textContent = c.msg;
    $('count-label').textContent = c.label;
    $('count-days-box').hidden = i.phase === 'today';
    $('scratch-text').textContent = c.scratch;
    $('letter').innerHTML = `<b>ถึง เอ็นดู</b>${c.letter.map((l) => `<p>${l}</p>`).join('')}`;
    $('orbit-age').textContent = i.age;
    $('orbit-date').textContent = i.dayMonthShort;
    $('orbit-cap').textContent = `กำลังโคจรรอบที่ ${i.nextAge} มาได้ ${Math.floor(i.progress * 100)}% ของทาง`;
    const a = i.progress * Math.PI * 2;
    $('orbit-arc').setAttribute('stroke-dasharray', `${i.progress.toFixed(4)} 1`);
    $('orbit-earth').setAttribute('transform', `translate(${200 + Math.sin(a) * 165} ${200 - Math.cos(a) * 135})`);
  }

  function tick() {
    const i = App.info();
    const key = `${i.phase}|${i.age}|${i.daysSince}`;
    if (key !== shownKey) {
      const turned = shownKey && i.phase === 'today' && !shownKey.startsWith('today');
      shownKey = key;
      render(i);
      if (turned) celebrate('today'); // เที่ยงคืนพอดีขณะเปิดหน้าอยู่
    }
    const t = Birthday.split(i.phase === 'today' ? i.todayLeft : i.left);
    $('c-d').textContent = t.d;
    ['h', 'm', 's'].forEach((k) => { $('c-' + k).textContent = String(t[k]).padStart(2, '0'); });
    $('s-days').textContent = fmt(i.daysLived);
    $('s-km').textContent = fmt(i.daysLived * 86400 * 29.78); // โลกโคจร ~29.78 กม./วินาที
    $('s-moon').textContent = fmt(i.daysLived / 29.530589);
  }

  /* ---------- ส่วนต่าง ๆ ของหน้า ---------- */
  function setupPage() {
    ['mercury', 'venus', 'earth'].forEach((id) => $('o-' + id).setAttribute('href', Art.uri[id]));
    $('sun-rays').innerHTML = Array.from({ length: 12 }, (_, k) =>
      `<path d="M200 138V${k % 2 ? 130 : 126}" transform="rotate(${k * 30} 200 200)"/>`).join('');
    if (Sky.reduced) document.querySelector('.orbit svg').pauseAnimations();

    Sound.onSong((on) => { $('song-btn').textContent = on ? 'หยุดเพลง' : 'เปิดเพลงวันเกิด'; });
    $('song-btn').addEventListener('click', () => {
      if (Sound.isMuted()) setMute(false);
      Sound.toggleSong();
    });
    $('mute-btn').addEventListener('click', () => setMute(!Sound.isMuted()));
    $('party-btn').addEventListener('click', (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      Confetti.burst(90, r.left + r.width / 2, r.top);
      Sound.sfx('pick');
    });

    Games.renderCards();
    setupAlbum();
    setupWish();
    setupScratch();
    setupLetter();
    setupSecret();
    setupReveal();
  }

  function setMute(v) {
    Sound.setMuted(v);
    $('mute-btn').textContent = v ? 'เสียง: ปิด' : 'เสียง: เปิด';
    $('mute-btn').setAttribute('aria-pressed', v);
  }

  function setupAlbum() {
    const grid = $('album-grid');
    let pendingFinale = false;
    grid.innerHTML = Album.ITEMS.map((it) =>
      `<button type="button" class="slot${it.rare ? ' rare' : ''}" data-id="${it.id}"><img src="${Art.uri[it.id]}" alt=""><span></span></button>`).join('');
    const paint = () => {
      const n = Album.count(), all = Album.ITEMS.length;
      $('album-count').textContent = `สะสมแล้ว ${n} จาก ${all} ชิ้น`;
      $('album-bar').style.width = `${(n / all) * 100}%`;
      grid.querySelectorAll('.slot').forEach((el) => {
        const has = Album.has(el.dataset.id);
        el.classList.toggle('has', has);
        el.lastChild.textContent = has ? Album.BY_ID[el.dataset.id].name : '???';
      });
    };
    paint();
    Album.onChange((id, fresh) => {
      if (!fresh) return;
      paint();
      if (Album.complete()) pendingFinale = true;
    });
    grid.addEventListener('click', (e) => {
      const el = e.target.closest('.slot');
      if (!el) return;
      const it = Album.BY_ID[el.dataset.id];
      $('album-info').textContent = Album.has(it.id)
        ? `${it.name} เก็บได้ ${Album.qty(it.id)} ชิ้น จากเกม ${it.from}`
        : `ชิ้นนี้หาได้จากเกม ${it.from}`;
      el.classList.remove('wig');
      void el.offsetWidth;
      el.classList.add('wig');
      Sound.sfx('tap');
    });
    // โชว์ข้อความลับหลังปิดเกมแล้ว
    window.addEventListener('popstate', () => {
      if (!pendingFinale) return;
      pendingFinale = false;
      setTimeout(finale, 500);
    });
  }

  function showSecret(art, title, text) {
    $('secret-img').src = Art.uri[art];
    $('secret-title').textContent = title;
    $('secret-text').textContent = text;
    const d = $('secret');
    if (!d.open) d.showModal();
  }
  function finale() {
    showSecret('galaxy', 'สะสมครบทั้งจักรวาลแล้ว',
      'ดาวทุกดวงในสมุดเล่มนี้ยังสว่างไม่เท่าเธอเลย ขอให้ทุกความฝันของณัฐชยาสำเร็จ และมีความสุขในทุกรอบที่โลกหมุน');
    Sound.play();
    Confetti.burst(160);
    Confetti.rain(140);
  }

  function setupSecret() {
    let n = 0;
    $('secret-btn').addEventListener('click', () => {
      Sound.note(400 + n * 90, 0.2);
      if (++n < 5) return;
      n = 0;
      Confetti.rain(90);
      if (Album.complete()) { finale(); return; }
      showSecret('heart', 'เจอดาวลับแล้ว', 'เอ็นดูคือแสงสว่างของใครหลายคน ขอให้มีความสุขมาก ๆ นะ ณัฐชยา');
    });
  }

  const WISHES = [
    'ยิ้มให้กว้างที่สุดเลย ปีนี้เป็นปีของเธอ', 'ขอให้ปีนี้เต็มไปด้วยเรื่องราวดี ๆ', 'ขอให้ได้พักผ่อนและมีความสุขเต็ม ๆ',
    'ทุกความฝันของเธอขอให้สำเร็จ', 'ขอให้มีแต่คนดี ๆ รายล้อมตลอดปี', 'ขอให้ได้กินของอร่อยทุกวัน',
    'ขอให้หัวเราะได้บ่อย ๆ แบบไม่ต้องหยุด', 'ขอให้งานราบรื่นเหมือนลอยในอวกาศ', 'ขอให้เงินเข้ามาเยอะเท่าดาวบนฟ้า',
    'ขอให้สุขภาพแข็งแรงกว่าชุดนักบินอวกาศ', 'ขอให้ทุกเช้าตื่นมาแล้วอยากยิ้ม', 'ขอให้เจอที่เที่ยวสวย ๆ ทุกทริป',
    'ขอให้วันที่เหนื่อยมีคนคอยอยู่ข้าง ๆ เสมอ', 'ขอให้โชคดีพุ่งเข้าหาเหมือนดาวตก',
  ];
  function setupWish() {
    let last = -1, busy = false;
    $('wish-btn').addEventListener('click', () => {
      if (busy) return;
      busy = true;
      Sky.shoot();
      setTimeout(Sky.shoot, 180);
      Sound.sfx('rare');
      const el = $('wish-text');
      el.classList.add('out');
      setTimeout(() => {
        let k;
        do k = (Math.random() * WISHES.length) | 0; while (k === last);
        last = k;
        el.textContent = WISHES[k];
        el.classList.remove('out');
        const r = el.getBoundingClientRect();
        Confetti.burst(24, r.left + r.width / 2, r.top + r.height / 2);
        busy = false;
      }, 550);
    });
  }

  function setupScratch() {
    const wrap = $('scratch'), cv = $('scratch-canvas');
    let ctx, w = 0, h = 0, prev = null, done = false, moves = 0;

    function init() {
      const r = { width: wrap.offsetWidth, height: wrap.offsetHeight };
      // มือถือยิง resize ตอนแถบ URL หุบ ถ้ากว้างเท่าเดิมไม่ต้องล้างที่ถูไว้
      if (done || !r.width || r.width === w) return;
      w = r.width;
      h = r.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#4b58a8');
      g.addColorStop(0.5, '#7f86c9');
      g.addColorStop(1, '#3a4690');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) {
        ctx.fillStyle = ['#ffffff', '#ffc857', '#b9c6ff'][i % 3];
        ctx.globalAlpha = Math.random() * 0.8;
        ctx.fillRect(Math.random() * w, Math.random() * h, 1.6, 1.6);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.font = '600 18px Kodchasan, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ถูตรงนี้เพื่อปัดฝุ่นดาว', w / 2, h / 2 + 6);
    }
    const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    function rub(p) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 46;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y + 0.01); ctx.stroke();
      prev = p;
      if (++moves % 8 === 0) checkClear();
    }
    function checkClear() {
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0, n = 0;
      for (let i = 3; i < d.length; i += 404) { n++; if (d[i] < 40) clear++; }
      if (clear / n < 0.5) return;
      done = true;
      prev = null;
      cv.classList.add('gone');
      const r = wrap.getBoundingClientRect();
      Confetti.burst(50, r.left + r.width / 2, r.top + r.height / 2);
      Sound.sfx('rare');
    }
    cv.addEventListener('pointerdown', (e) => { if (done || !ctx) return; cv.setPointerCapture(e.pointerId); prev = pos(e); rub(prev); });
    cv.addEventListener('pointermove', (e) => { if (prev && !done) rub(pos(e)); });
    const up = () => { if (prev && !done) checkClear(); prev = null; };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    window.addEventListener('resize', init);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(init);
  }

  function setupLetter() {
    $('env-btn').addEventListener('click', (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.hidden = true;
      $('letter').hidden = false;
      Confetti.burst(40, r.left + r.width / 2, r.top + r.height / 2);
      Sound.sfx('rare');
    });
  }

  function setupReveal() {
    if (Sky.reduced || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((list) => list.forEach((x) => {
      if (x.isIntersecting) { x.target.classList.add('seen'); io.unobserve(x.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('.section').forEach((el) => { el.classList.add('reveal'); io.observe(el); });
  }

  Art.hydrate(document);
  setupGate();
})();
