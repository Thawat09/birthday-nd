/**
 * โครงเกมเต็มจอ: เปิด/ปิด, หน้าเริ่ม, หน้าสรุป, loop, จัดการ event ให้ล้างเองเมื่อออก
 */
(function () {
  const list = [];
  const $ = (id) => document.getElementById(id);
  const overlay = $('game'), stage = $('game-stage'), panel = $('game-panel'), hud = $('game-hud');
  let cur = null, opener = null, cleanups = [];

  const hash01 = (i) => { const s = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return s - Math.floor(s); };
  const register = (g) => list.push(g);

  function cleanup() {
    cleanups.forEach((fn) => fn());
    cleanups = [];
    stage.textContent = '';
    hud.textContent = '';
    delete hud.dataset.h;
    stage.className = 'game-stage';
  }

  function makeApi(game) {
    let ended = false;
    const api = {
      stage,
      ended: () => ended,
      on(el, type, fn, opt) {
        el.addEventListener(type, fn, opt);
        cleanups.push(() => el.removeEventListener(type, fn, opt));
      },
      after(sec, fn) {
        const id = setTimeout(fn, sec * 1000);
        cleanups.push(() => clearTimeout(id));
      },
      loop(fn) {
        let id, last = performance.now(), t = 0;
        const step = (ms) => {
          id = requestAnimationFrame(step);
          const dt = Math.min(0.04, Math.max(0, (ms - last) / 1000));
          last = ms;
          t += dt;
          fn(dt, t);
        };
        id = requestAnimationFrame(step);
        cleanups.push(() => cancelAnimationFrame(id));
      },
      /** canvas เต็ม stage; view.w/h อัปเดตเองเมื่อหมุนจอ */
      canvas(onResize) {
        const el = document.createElement('canvas');
        stage.appendChild(el);
        const view = { el, ctx: el.getContext('2d'), w: 0, h: 0 };
        const size = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const ow = view.w, oh = view.h;
          view.w = Math.max(1, stage.clientWidth);
          view.h = Math.max(1, stage.clientHeight);
          el.width = Math.round(view.w * dpr);
          el.height = Math.round(view.h * dpr);
          view.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          if (ow && onResize && (ow !== view.w || oh !== view.h)) onResize(ow, oh);
        };
        size();
        api.on(window, 'resize', size);
        view.pos = (e) => {
          const r = el.getBoundingClientRect();
          return { x: e.clientX - r.left, y: e.clientY - r.top };
        };
        return view;
      },
      hud(items) {
        const html = items.map(([k, v]) => `<span><i>${k}</i>${v}</span>`).join('');
        if (hud.dataset.h !== html) { hud.innerHTML = html; hud.dataset.h = html; }
      },
      /** พื้นหลังดาวสำหรับเกม canvas */
      stars(view, t, speed = 30, tint) {
        const { ctx, w, h } = view;
        ctx.clearRect(0, 0, w, h);
        if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, w, h); }
        ctx.fillStyle = '#f3f0e6';
        for (let i = 0; i < 90; i++) {
          const z = hash01(i);
          const x = hash01(i + 100) * w;
          const y = (hash01(i + 200) * h + t * speed * (0.3 + z)) % h;
          ctx.globalAlpha = 0.25 + z * 0.6;
          ctx.fillRect(x, y, 1 + z * 1.4, 1 + z * (1.4 + speed / 40));
        }
        ctx.globalAlpha = 1;
      },
      finish({ win, title, text, score, lower, unit = '', rewards = [] }) {
        if (ended) return;
        ended = true;
        const fresh = rewards.filter((id) => Album.add(id));
        const isNew = score != null && Album.record(game.id, score, lower);
        Sound.sfx(win ? 'win' : 'bad');
        if (win) { Confetti.burst(110, innerWidth / 2, innerHeight * 0.4); Confetti.rain(50); }
        renderCards();
        const icons = rewards.map((id) =>
          `<figure class="reward"><img src="${Art.uri[id]}" alt=""><figcaption>${Album.BY_ID[id].name}${fresh.includes(id) ? ' <b>ใหม่!</b>' : ''}</figcaption></figure>`).join('');
        showPanel(`<h3>${title}</h3>${icons ? `<div class="rewards">${icons}</div>` : ''}<p>${text}</p>` +
          (score != null ? `<p class="panel-score">${score.toLocaleString('en-US')} ${unit}${isNew ? ' <b>สถิติใหม่</b>' : ''}</p>` : ''),
          [['เล่นอีกครั้ง', start, 'btn'], ['กลับยานแม่', close, 'btn btn-ghost']]);
      },
    };
    return api;
  }

  function showPanel(html, buttons) {
    panel.innerHTML = html;
    const row = document.createElement('div');
    row.className = 'panel-actions';
    buttons.forEach(([label, fn, cls]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.textContent = label;
      b.addEventListener('click', fn);
      row.appendChild(b);
    });
    panel.appendChild(row);
    panel.hidden = false;
    row.firstChild.focus({ preventScroll: true });
  }

  function start() {
    cleanup();
    panel.hidden = true;
    Sound.sfx('tap');
    cur.play(makeApi(cur));
  }

  function open(id) {
    const g = list.find((x) => x.id === id);
    if (!g || cur) return;
    cur = g;
    opener = id;
    cleanup();
    $('game-title').textContent = cur.title;
    overlay.hidden = false;
    document.documentElement.classList.add('locked');
    $('app').inert = true;
    Sky.pause(true);
    history.pushState({ game: id }, '');
    showPanel(`<img class="panel-art" src="${Art.uri[cur.art]}" alt=""><h3>${cur.title}</h3><p>${cur.how}</p>`,
      [['เริ่มเล่น', start, 'btn']]);
  }

  function reallyClose() {
    if (!cur) return;
    cleanup();
    cur = null;
    overlay.hidden = true;
    panel.hidden = true;
    document.documentElement.classList.remove('locked');
    $('app').inert = false;
    Sky.pause(false);
    renderCards();
    const back = document.querySelector(`[data-game="${opener}"]`);
    if (back) back.focus({ preventScroll: true });
  }
  // ปุ่มย้อนกลับของมือถือ = ปิดเกม ไม่ใช่ออกจากเว็บ
  function close() {
    if (history.state && history.state.game) history.back();
    else reallyClose();
  }
  window.addEventListener('popstate', reallyClose);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && cur) close(); });
  $('game-close').addEventListener('click', close);

  function renderCards() {
    $('game-grid').innerHTML = list.map((g, i) => {
      const b = Album.best(g.id);
      const got = g.rewards.filter(Album.has).length;
      return `<button type="button" class="card${i === 0 ? ' card-main' : ''}" data-game="${g.id}" style="--tone:${g.tone}">` +
        `<span class="card-art">${g.scene.map((a, n) => `<img src="${Art.uri[a]}" alt="" style="--n:${n}">`).join('')}</span>` +
        `<span class="card-body"><b>${g.title}</b><span>${g.desc}</span>` +
        `<small>ของสะสม ${got}/${g.rewards.length}${b != null ? ` · ดีที่สุด ${b.toLocaleString('en-US')} ${g.unit}` : ''}</small></span></button>`;
    }).join('');
  }
  $('game-grid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-game]');
    if (b) open(b.dataset.game);
  });

  window.Games = { register, open, close, renderCards, list };
})();
