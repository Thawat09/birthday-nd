/** เค้กทะลุชั้นบรรยากาศ + เป่าเทียนบนดวงจันทร์ + พลุซูเปอร์โนวา */
(function () {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const LAYERS = ['#ff9fb0', '#f3f0e6', '#86e8cf', '#ffd166', '#a5c1ff', '#f2a65a'];
  const GOAL = 15;

  function rounded(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ---------- ซ้อนเค้ก ---------- */
  Games.register({
    id: 'stack', title: 'เค้กทะลุชั้นบรรยากาศ', tone: '#ff9fb0', unit: 'ชั้น', art: 'cupcake', scene: ['cupcake', 'candle'],
    rewards: ['cupcake', 'candle'],
    desc: 'วางเค้กซ้อนจากพื้นโลกขึ้นไปถึงอวกาศ',
    how: 'แตะจอ (หรือกดเว้นวรรค) เพื่อวางชั้นเค้กให้ตรงกัน ส่วนที่เกินจะถูกตัดออก วางตรงเป๊ะติดกันได้ความกว้างคืน ครบ 8 ชั้นได้คัพเค้ก ครบ 15 ชั้นได้เทียนวันเกิด',
    play(api) {
      const v = api.canvas();
      const H = Math.max(30, Math.min(44, v.h * 0.06));
      const base = Math.min(230, v.w * 0.55);
      // x เก็บเป็นระยะจากกลางจอ เพื่อให้หมุนจอแล้วเค้กยังอยู่กลาง
      const layers = [{ x: -base / 2, w: base, c: LAYERS[0] }];
      let cam = 0, scraps = [], msg = null, perfect = 0, mov = make();

      function make() {
        const n = layers.length;
        return { w: layers[n - 1].w, c: LAYERS[n % LAYERS.length], p: n % 2 ? -1.5 : 1.5, speed: 1.5 + n * 0.11 };
      }
      const movX = () => Math.sin(mov.p) * Math.min(v.w * 0.46, 280) - mov.w / 2;

      function drop() {
        if (api.ended() || !mov) return;
        const top = layers[layers.length - 1], n = layers.length;
        let x = movX();
        const off = x - top.x;
        if (Math.abs(off) >= top.w - 2) {
          scraps.push({ x, w: mov.w, c: mov.c, n, vy: 0, dy: 0 });
          mov = null;
          end();
          return;
        }
        let w = top.w - Math.abs(off);
        if (Math.abs(off) < 6) {
          perfect++;
          w = Math.min(base, top.w + (perfect > 1 ? 10 : 0));
          x = top.x - (w - top.w) / 2;
          msg = { text: perfect > 1 ? `เป๊ะ x${perfect}` : 'เป๊ะ!', t: 0 };
          Sound.sfx('pick');
        } else {
          perfect = 0;
          scraps.push({ x: off > 0 ? top.x + top.w : x, w: Math.abs(off), c: mov.c, n, vy: 0, dy: 0 });
          x = Math.max(x, top.x);
          Sound.sfx('tap');
        }
        layers.push({ x, w, c: mov.c });
        if (layers.length > GOAL) { mov = null; end(); return; }
        mov = make();
      }
      function end() {
        const n = layers.length - 1, full = n >= GOAL, ok = n >= 8;
        api.after(0.9, () => api.finish({
          win: ok, score: n, unit: 'ชั้น', rewards: [...(ok ? ['cupcake'] : []), ...(full ? ['candle'] : [])],
          title: full ? 'เค้กสูงถึงอวกาศแล้ว!' : ok ? 'เค้กสูงเหนือเมฆ' : 'เค้กล้มซะแล้ว',
          text: full ? 'เค้กวันเกิดที่สูงที่สุดในระบบสุริยะ' : ok ? `อีก ${GOAL - n} ชั้นจะได้เทียนวันเกิด` : 'ซ้อนให้ถึง 8 ชั้นเพื่อรับคัพเค้ก',
        }));
      }
      api.on(v.el, 'pointerdown', drop);
      api.on(window, 'keydown', (e) => {
        if (e.key !== ' ' || api.ended()) return;
        e.preventDefault();
        if (!e.repeat) drop();
      });

      api.loop((dt, t) => {
        const { ctx, w, h } = v;
        const k = Math.min(1, (layers.length - 1) / GOAL);
        api.stars(v, t, 4);
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, `rgba(60,90,190,${0.55 * (1 - k)})`);
        g.addColorStop(1, `rgba(255,150,130,${0.75 * (1 - k)})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        const want = Math.max(0, layers.length * H - h * 0.45);
        cam += (want - cam) * (1 - Math.exp(-5 * dt));
        const floor = h - 70 + cam;
        const yOf = (n) => floor - (n + 1) * H;

        Art.draw(ctx, 'moon', w * 0.82, h * 0.2 - (1 - k) * h * 0.4, 90);
        Art.draw(ctx, 'ufo', w * 0.16 + Math.sin(t) * 20, h * 0.3 - (1 - k) * h * 0.6, 64);
        ctx.fillStyle = '#3c8f6b';
        ctx.beginPath(); ctx.ellipse(w / 2, floor + 220, Math.max(w * 0.9, 400), 222, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#f3f0e6';
        ctx.beginPath(); ctx.ellipse(w / 2, floor + 2, base * 0.68, 12, 0, 0, 6.2832); ctx.fill();

        const layer = (x, y, lw, c) => {
          ctx.fillStyle = c; rounded(ctx, w / 2 + x, y, lw, H - 2, 8); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.45)'; rounded(ctx, w / 2 + x, y, lw, H * 0.28, 8); ctx.fill();
          ctx.fillStyle = 'rgba(35,27,69,.12)'; ctx.fillRect(w / 2 + x, y + H * 0.62, lw, 3);
        };
        layers.forEach((l, n) => layer(l.x, yOf(n), l.w, l.c));
        scraps = scraps.filter((s) => {
          s.vy += 900 * dt;
          s.dy += s.vy * dt;
          layer(s.x, yOf(s.n) + s.dy, s.w, s.c);
          return s.dy < h;
        });
        const top = layers[layers.length - 1];
        if (mov) {
          mov.p += mov.speed * dt;
          layer(movX(), yOf(layers.length), mov.w, mov.c);
        } else if (layers.length > GOAL) Art.draw(ctx, 'candle', w / 2 + top.x + top.w / 2, yOf(layers.length - 1) - 24, 56);
        if (msg) {
          msg.t += dt;
          ctx.globalAlpha = Math.max(0, 1 - msg.t);
          ctx.fillStyle = '#ffc857';
          ctx.textAlign = 'center';
          ctx.font = '700 26px Kodchasan, sans-serif';
          ctx.fillText(msg.text, w / 2 + top.x + top.w / 2, yOf(layers.length) - 34 - msg.t * 30);
          ctx.globalAlpha = 1;
          if (msg.t > 1) msg = null;
        }
        api.hud([['ชั้น', `${layers.length - 1}/${GOAL}`]]);
      });
    },
  });

  /* ---------- เป่าเทียน ---------- */
  Games.register({
    id: 'candles', title: 'เป่าเทียนบนดวงจันทร์', tone: '#ffd166', unit: 'วินาที', art: 'candle', scene: ['candle', 'moon'],
    rewards: ['heart'],
    desc: 'ลากนิ้วเป่าเทียนให้ดับครบตามอายุ',
    how: 'อธิษฐานในใจ แล้วกดลากนิ้วหรือเมาส์ผ่านเปลวไฟให้ดับทุกเล่ม จำนวนเทียนเท่ากับอายุ ระวังเทียนสีทอง มันจะติดกลับขึ้นมาอีกครั้ง',
    play(api) {
      const v = api.canvas();
      const total = App.info().age;
      const rows = [Math.ceil(total * 0.42), Math.ceil(total * 0.33)];
      rows.push(total - rows[0] - rows[1]);
      const cs = [];
      rows.forEach((n, r) => { for (let i = 0; i < n; i++) cs.push({ r, i, n, lit: true, trick: Math.random() < 0.18, back: 0, p: rnd(0, 6) }); });
      let smoke = [], time = 0, prev = null, finished = false;

      const tier = (r) => {
        const tw = Math.min(v.w - 60, 540) * [1, 0.76, 0.52][r];
        const th = Math.min(96, v.h * 0.135);
        return { w: tw, h: th, y: v.h * 0.85 - (r + 1) * th };
      };
      const flame = (c) => {
        const g = tier(c.r);
        return { x: v.w / 2 - g.w / 2 + (g.w * (c.i + 0.5)) / c.n, y: g.y - 34, top: g.y, gap: g.w / c.n };
      };

      function blow(a, b) {
        cs.forEach((c) => {
          if (!c.lit) return;
          const f = flame(c);
          const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy; // ระยะจากเปลวไฟถึงเส้นที่ลาก
          const k = L ? Math.max(0, Math.min(1, ((f.x - a.x) * dx + (f.y - a.y) * dy) / L)) : 0;
          if (Math.hypot(a.x + dx * k - f.x, a.y + dy * k - f.y) > 17) return;
          c.lit = false;
          if (c.trick) { c.trick = false; c.back = rnd(1, 2); }
          Sound.note(500 + Math.random() * 300, 0.12);
          for (let i = 0; i < 4; i++) smoke.push({ x: f.x, y: f.y, t: 1, vx: rnd(-14, 14) });
        });
      }
      api.on(v.el, 'pointerdown', (e) => { v.el.setPointerCapture(e.pointerId); prev = v.pos(e); blow(prev, prev); });
      api.on(v.el, 'pointermove', (e) => {
        if (!prev) return;
        const p = v.pos(e);
        blow(prev, p);
        prev = p;
      });
      const up = () => { prev = null; };
      api.on(v.el, 'pointerup', up);
      api.on(v.el, 'pointercancel', up);

      api.loop((dt, t) => {
        const { ctx, w, h } = v;
        api.stars(v, t, 2);
        if (!finished) time += dt;
        Art.draw(ctx, 'earth', w * 0.84, h * 0.13, 64, Math.sin(t * 0.4) * 0.2);
        ctx.fillStyle = '#cfc7ae';
        ctx.beginPath(); ctx.ellipse(w / 2, h + 170, Math.max(w * 0.8, 420), 170 + h * 0.2, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#b9b094';
        [[0.12, 0.94, 34], [0.84, 0.92, 44], [0.45, 0.97, 28]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(w * x, h * y, r, r * 0.35, 0, 0, 6.2832); ctx.fill(); });

        [0, 1, 2].forEach((r) => {
          const g = tier(r), x = w / 2 - g.w / 2 - 10, tw = g.w + 20;
          ctx.fillStyle = r === 1 ? '#f7d3dc' : '#ff9fb0';
          rounded(ctx, x, g.y, tw, g.h, 12); ctx.fill();
          ctx.fillStyle = '#fff8ea';
          rounded(ctx, x, g.y, tw, 16, 8); ctx.fill();
          const n = Math.round(tw / 26);
          for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(x + (tw * (i + 0.5)) / n, g.y + 15, tw / n / 2, 0, Math.PI); ctx.fill(); }
        });
        let lit = 0;
        cs.forEach((c) => {
          if (c.back > 0) { c.back -= dt; if (c.back <= 0) { c.lit = true; Sound.sfx('tap'); } }
          const f = flame(c);
          const cw = Math.max(4, Math.min(9, f.gap * 0.4));
          ctx.fillStyle = c.trick || c.back > 0 ? '#ffc857' : ['#8fb7ff', '#86e8cf', '#c9a7ff'][c.i % 3];
          rounded(ctx, f.x - cw / 2, f.top - 24, cw, 28, 3); ctx.fill();
          if (!c.lit) return;
          lit++;
          const s = 1 + Math.sin(t * 9 + c.p) * 0.14;
          const gl = ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, 22);
          gl.addColorStop(0, 'rgba(255,200,100,.5)');
          gl.addColorStop(1, 'rgba(255,200,100,0)');
          ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(f.x, f.y, 22, 0, 6.2832); ctx.fill();
          ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.ellipse(f.x, f.y, 4.6, 9 * s, 0, 0, 6.2832); ctx.fill();
          ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.ellipse(f.x, f.y + 3, 2.2, 4.5 * s, 0, 0, 6.2832); ctx.fill();
        });
        smoke = smoke.filter((s) => {
          s.t -= dt; s.y -= 42 * dt; s.x += s.vx * dt;
          if (s.t <= 0) return false;
          ctx.globalAlpha = s.t * 0.35;
          ctx.fillStyle = '#f3f0e6';
          ctx.beginPath(); ctx.arc(s.x, s.y, 3 + (1 - s.t) * 9, 0, 6.2832); ctx.fill();
          ctx.globalAlpha = 1;
          return true;
        });
        if (!lit && !finished && !cs.some((c) => c.back > 0)) {
          finished = true;
          api.after(0.9, () => api.finish({
            win: true, score: Math.max(1, Math.round(time)), lower: true, unit: 'วินาที', rewards: ['heart'],
            title: `ดับครบ ${total} เล่มแล้ว`, text: 'คำอธิษฐานถูกส่งออกไปถึงดวงดาวเรียบร้อย ขอให้สมหวังนะเอ็นดู',
          }));
        }
        api.hud([['เทียน', `${lit}/${total}`], ['เวลา', Math.floor(time)]]);
      });
    },
  });

  /* ---------- พลุ ---------- */
  Games.register({
    id: 'nova', title: 'พลุซูเปอร์โนวา', tone: '#ff7f8e', unit: '', art: 'comet', scene: ['comet', 'star-pink'],
    rewards: ['comet'],
    desc: 'แตะฟ้าจุดพลุ ทุก 8 ลูกมีข้อความลับ',
    how: 'แตะตรงไหนก็ได้เพื่อส่งจรวดพลุขึ้นไประเบิด ทุก 8 ลูกจะมีข้อความลับบนฟ้า จุดครบ 16 ลูกได้ดาวหาง แล้วเล่นต่อได้เรื่อย ๆ',
    play(api) {
      const v = api.canvas();
      const C = ['#ffc857', '#ff7f8e', '#7fe3c8', '#8fb7ff', '#f3f0e6', '#d7a8ff'];
      const WORDS = ['เอ็นดู', 'HBD', `${App.info().age} ปี`, 'เก่งมาก', 'ยิ้มนะ'];
      let rockets = [], bits = [], n = 0, word = 0, idle = 0;

      const launch = (x, y, text) => rockets.push({ x, y: v.h + 10, ty: Math.max(50, y), c: C[(Math.random() * C.length) | 0], text });
      const spark = (x, y, vx, vy, c, t, g = 70, drag = 1.5) => bits.push({ x, y, vx, vy, c, t, T: t, g, drag });

      function explode(r) {
        Sound.sfx('boom');
        if (r.text) { explodeText(r); return; }
        const kind = (Math.random() * 5) | 0, c2 = C[(Math.random() * C.length) | 0];
        const N = 80, power = rnd(150, 230);
        for (let i = 0; i < N; i++) {
          const a = (i / N) * Math.PI * 2;
          let vx = Math.cos(a), vy = Math.sin(a);
          if (kind === 0) { // หัวใจ
            vx = (16 * Math.sin(a) ** 3) / 15;
            vy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 15;
          } else if (kind === 1) { // ดอกไม้
            const k = 0.65 + 0.35 * Math.cos(5 * a); vx *= k; vy *= k;
          } else if (kind === 2) { // ทรงกลม
            const k = Math.sqrt(Math.random()); vx *= k; vy *= k;
          } else if (kind === 3) { // ดาวเสาร์
            if (i % 2) { const px = vx * 1.5, py = vy * 0.4; vx = px * 0.94 + py * 0.34; vy = py * 0.94 - px * 0.34; }
            else { vx *= 0.55; vy *= 0.55; }
          }
          spark(r.x, r.y, vx * power, vy * power, kind === 3 && i % 2 ? c2 : r.c, rnd(1.1, 1.7), 45);
        }
      }
      function explodeText(r) {
        const o = document.createElement('canvas');
        o.width = Math.round(Math.min(v.w * 0.86, 560));
        o.height = 200;
        const g = o.getContext('2d', { willReadFrequently: true });
        let fs = 130;
        do { g.font = `700 ${fs}px Kodchasan, sans-serif`; fs -= 6; } while (g.measureText(r.text).width > o.width - 10 && fs > 30);
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillStyle = '#fff';
        g.fillText(r.text, o.width / 2, o.height / 2 + 10);
        const d = g.getImageData(0, 0, o.width, o.height).data;
        const step = v.w < 500 ? 4 : 5;
        for (let y = 0; y < o.height; y += step) {
          for (let x = 0; x < o.width; x += step) {
            if (d[(y * o.width + x) * 4 + 3] < 120) continue;
            // drag = 3 → ระยะที่ไปหยุด = ความเร็ว / 3
            spark(r.x, r.y, (x - o.width / 2) * 3, (y - o.height / 2) * 3, Math.random() < 0.2 ? '#fff8e0' : r.c, rnd(2.6, 3.2), 0, 3);
          }
        }
      }

      api.on(v.el, 'pointerdown', (e) => {
        const p = v.pos(e);
        n++;
        idle = 0;
        Sound.note(180 + Math.random() * 80, 0.2);
        launch(p.x, p.y);
        if (n % 8 === 0) {
          const text = WORDS[word++ % WORDS.length];
          api.after(0.7, () => launch(v.w / 2, v.h * 0.32, text));
        }
        if (n === 16) api.after(1.4, () => Album.add('comet'));
      });

      api.loop((dt, t) => {
        const { ctx, w, h } = v;
        api.stars(v, t, 2);
        idle += dt;
        if (!n || idle > 6) {
          ctx.globalAlpha = 0.6 + Math.sin(t * 3) * 0.3;
          ctx.fillStyle = '#f3f0e6';
          ctx.textAlign = 'center';
          ctx.font = '600 20px Kodchasan, sans-serif';
          ctx.fillText('แตะบนฟ้าเพื่อจุดพลุ', w / 2, h * 0.5);
          ctx.globalAlpha = 1;
        }
        rockets = rockets.filter((r) => {
          r.y -= Math.max(380, (r.y - r.ty) * 2.4) * dt;
          if (r.y <= r.ty) { explode(r); return false; }
          ctx.fillStyle = '#fff3c4';
          ctx.beginPath(); ctx.arc(r.x, r.y, 3, 0, 6.2832); ctx.fill();
          spark(r.x, r.y, rnd(-15, 15), rnd(20, 70), '#ffb347', 0.4);
          return true;
        });
        ctx.globalCompositeOperation = 'lighter';
        bits = bits.filter((b) => {
          b.t -= dt;
          if (b.t <= 0) return false;
          const k = Math.exp(-b.drag * dt);
          b.vx *= k;
          b.vy = b.vy * k + b.g * dt;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          ctx.globalAlpha = Math.min(1, (b.t / b.T) * 1.8);
          ctx.fillStyle = b.c;
          ctx.fillRect(b.x - 1.6, b.y - 1.6, 3.2, 3.2);
          return true;
        });
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        if (bits.length > 4500) bits.splice(0, bits.length - 4500);
        api.hud([['พลุ', n], ['ข้อความลับใน', 8 - (n % 8)]]);
      });
    },
  });
})();
