/** ยานเก็บดวงดาว — เกมหลัก เก็บของหลากหลายผ่าน 4 เขต */
(function () {
  const SECTORS = [
    { name: 'แถบดาวระยิบ', tint: 'rgba(40,52,111,.25)', pool: ['star-gold', 'star-pink', 'star-mint', 'moon', 'sun'] },
    { name: 'ระบบสุริยะชั้นใน', tint: 'rgba(120,60,50,.22)', pool: ['mercury', 'venus', 'earth', 'mars'] },
    { name: 'ดาวเคราะห์ยักษ์', tint: 'rgba(40,90,120,.25)', pool: ['jupiter', 'saturn', 'uranus', 'neptune'] },
    { name: 'ปาร์ตี้ไร้น้ำหนัก', tint: 'rgba(130,50,90,.22)', pool: ['gift', 'balloon', 'hat', 'cat', 'ufo', 'rabbit'] },
  ];
  const NEED = 10;
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ชิ้นที่ยังไม่มีจะโผล่บ่อยกว่า
  function pickItem(pool) {
    const missing = pool.filter((id) => !Album.has(id));
    const from = missing.length && Math.random() < 0.65 ? missing : pool;
    return from[(Math.random() * from.length) | 0];
  }

  Games.register({
    id: 'fly', title: 'ยานเก็บดวงดาว', tone: '#ffc857', unit: 'แต้ม', art: 'ship',
    scene: ['ship', 'star-gold', 'saturn', 'cat', 'earth', 'rock'],
    rewards: SECTORS.flatMap((s) => s.pool),
    desc: 'ขับยานผ่าน 4 เขต เก็บดาว ดาวเคราะห์ และเพื่อนอวกาศ 19 ชนิด',
    how: 'ลากนิ้วหรือเลื่อนเมาส์เพื่อบังคับยาน (หรือใช้ปุ่มลูกศร) เก็บของให้ครบเขตละ 10 ชิ้นและหลบอุกกาบาต เก็บติดกันเร็ว ๆ ได้คอมโบ โล่กันชนได้ 1 ครั้ง แม่เหล็กดูดของเข้าหายาน',
    play(api) {
      const ship = { x: 0, y: 0, tx: 0, ty: 0, hurt: 0, shield: 0, magnet: 0, tilt: 0 };
      const v = api.canvas((ow, oh) => {
        ship.x = ship.tx = ship.x * (v.w / ow);
        ship.y = ship.ty = ship.y * (v.h / oh);
      });
      ship.x = ship.tx = v.w / 2;
      ship.y = ship.ty = v.h * 0.78;
      const keys = {};
      let things = [], pops = [], bits = [];
      let sector = 0, got = 0, hearts = 3, score = 0, combo = 0, comboT = 0;
      let spawn = 0.6, power = 7, banner = 2.2, shake = 0;
      const size = Math.max(40, Math.min(58, v.w * 0.1));

      const follow = (e) => {
        const p = v.pos(e);
        ship.tx = p.x;
        ship.ty = e.pointerType === 'touch' ? p.y - 64 : p.y; // ไม่ให้นิ้วบังยาน
      };
      api.on(v.el, 'pointerdown', (e) => { v.el.setPointerCapture(e.pointerId); follow(e); });
      api.on(v.el, 'pointermove', follow);
      api.on(window, 'keydown', (e) => {
        if (e.key.startsWith('Arrow')) { keys[e.key] = true; e.preventDefault(); }
      });
      api.on(window, 'keyup', (e) => { keys[e.key] = false; });

      const add = (kind, id) => {
        const s = kind === 'rock' ? rnd(38, 68) : size;
        things.push({
          kind, id, s, x: rnd(s / 2, v.w - s / 2), y: -s,
          vy: (kind === 'rock' ? rnd(170, 250) : rnd(130, 180)) + sector * 28,
          vx: kind === 'rock' ? rnd(-40, 40) : 0, rot: rnd(0, 6), vr: kind === 'rock' ? rnd(-2, 2) : 0, p: rnd(0, 6),
        });
      };
      const say = (text, x, y, c = '#ffc857') => pops.push({ text, x, y, c, t: 0 });
      const sparks = (x, y, c, n = 12) => {
        for (let i = 0; i < n; i++) bits.push({ x, y, vx: rnd(-170, 170), vy: rnd(-170, 170), t: rnd(0.3, 0.7), c });
      };

      function hit(o) {
        sparks(o.x, o.y, '#958fae', 18);
        Sound.sfx('boom');
        if (ship.shield) { ship.shield = 0; ship.hurt = 0.8; say('โล่แตก', ship.x, ship.y - 40, '#8fb7ff'); return; }
        hearts--;
        combo = 0;
        ship.hurt = 1.6;
        shake = Sky.reduced ? 0 : 0.4;
        if (hearts <= 0) end(false);
      }
      function collect(o) {
        if (o.kind === 'power') {
          ship[o.id] = o.id === 'shield' ? 1 : 7;
          Sound.sfx('rare');
          say(o.id === 'shield' ? 'ได้โล่!' : 'แม่เหล็ก!', o.x, o.y, '#8fb7ff');
          return;
        }
        combo = comboT > 0 ? combo + 1 : 1;
        comboT = 2.2;
        const mult = Math.min(5, 1 + Math.floor(combo / 4));
        score += 10 * mult;
        got++;
        sparks(o.x, o.y, '#ffc857');
        say(mult > 1 ? `+${10 * mult} คอมโบ x${mult}` : '+10', o.x, o.y);
        if (!Album.add(o.id)) Sound.sfx('pick');
        if (got < NEED) return;
        if (sector === SECTORS.length - 1) { end(true); return; }
        sector++;
        got = 0;
        banner = 2.2;
        score += 50;
        things.forEach((k) => { if (k.kind === 'rock') k.gone = true; });
      }
      function end(win) {
        api.finish({
          win, score: score + (win ? hearts * 100 : 0), unit: 'แต้ม',
          title: win ? 'สำรวจครบทุกเขตแล้ว!' : 'ยานต้องกลับไปซ่อมก่อน',
          text: win ? `เหลือหัวใจ ${hearts} ดวง ได้โบนัส ${hearts * 100} แต้ม` : `ไปถึงเขต${SECTORS[sector].name} ของที่เก็บได้ยังอยู่ในสมุดสะสมนะ`,
        });
      }

      api.loop((dt, t) => {
        const { ctx, w, h } = v;
        const S = SECTORS[sector];
        api.stars(v, t, 120, S.tint);
        const live = !api.ended();
        if (live) {
          const ks = 460 * dt;
          if (keys.ArrowLeft) ship.tx -= ks;
          if (keys.ArrowRight) ship.tx += ks;
          if (keys.ArrowUp) ship.ty -= ks;
          if (keys.ArrowDown) ship.ty += ks;
          ship.tx = Math.max(24, Math.min(w - 24, ship.tx));
          ship.ty = Math.max(60, Math.min(h - 40, ship.ty));
          const dx = ship.tx - ship.x;
          const e = 1 - Math.exp(-14 * dt);
          ship.x += dx * e;
          ship.y += (ship.ty - ship.y) * e;
          ship.tilt = Math.max(-0.45, Math.min(0.45, dx * 0.012));
          ship.hurt = Math.max(0, ship.hurt - dt);
          ship.magnet = Math.max(0, ship.magnet - dt);
          comboT -= dt;
          if (comboT <= 0) combo = 0;
          banner -= dt;
          spawn -= dt;
          power -= dt;
          if (spawn <= 0 && banner < 1.2) {
            if (Math.random() < 0.26 + sector * 0.07) add('rock', 'rock');
            else add('item', pickItem(S.pool));
            spawn = (rnd(0.34, 0.62) - sector * 0.04) / Math.max(1, Math.min(1.6, w / 700)); // จอกว้างมีของมากขึ้น
          }
          if (power <= 0) { add('power', Math.random() < 0.5 ? 'shield' : 'magnet'); power = rnd(8, 12); }
        }

        ctx.save();
        if (shake > 0) { shake -= dt; ctx.translate(rnd(-7, 7), rnd(-7, 7)); }

        things = things.filter((o) => {
          if (o.gone) return false;
          o.y += o.vy * dt;
          o.x += o.vx * dt;
          o.rot += o.vr * dt;
          const dx = ship.x - o.x, dy = ship.y - o.y, d = Math.hypot(dx, dy) || 1;
          if (live && ship.magnet && o.kind === 'item' && d < 210) { o.x += (dx / d) * 420 * dt; o.y += (dy / d) * 420 * dt; }
          const reach = o.kind === 'rock' ? o.s * 0.42 + 13 : o.s * 0.5 + 24;
          if (d < reach && !api.ended()) {
            if (o.kind !== 'rock') { collect(o); return false; }
            if (ship.hurt <= 0) { hit(o); return false; }
          }
          if (o.kind === 'power') {
            ctx.fillStyle = 'rgba(143,183,255,.25)';
            ctx.beginPath(); ctx.arc(o.x, o.y, o.s * 0.72 + Math.sin(t * 6) * 3, 0, 6.2832); ctx.fill();
          }
          Art.draw(ctx, o.id, o.x, o.y, o.s, o.kind === 'rock' ? o.rot : Math.sin(t * 2 + o.p) * 0.2);
          return o.y < h + 80;
        });

        bits = bits.filter((b) => {
          b.t -= dt; b.x += b.vx * dt; b.y += b.vy * dt;
          if (b.t <= 0) return false;
          ctx.globalAlpha = Math.min(1, b.t * 3);
          ctx.fillStyle = b.c;
          ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, 6.2832); ctx.fill();
          ctx.globalAlpha = 1;
          return true;
        });

        if (hearts > 0) {
          if (ship.magnet) {
            ctx.strokeStyle = 'rgba(255,127,142,.5)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(ship.x, ship.y, 50 + ((t * 90) % 90), 0, 6.2832); ctx.stroke();
          }
          const blink = ship.hurt > 0 && Math.floor(t * 12) % 2 ? 0.3 : 1;
          Art.draw(ctx, 'ship', ship.x, ship.y, 62, ship.tilt, blink);
          if (ship.shield) {
            ctx.strokeStyle = '#8fb7ff';
            ctx.lineWidth = 3;
            ctx.fillStyle = 'rgba(143,183,255,.16)';
            ctx.beginPath(); ctx.arc(ship.x, ship.y, 42, 0, 6.2832); ctx.fill(); ctx.stroke();
          }
        }
        ctx.restore();

        ctx.textAlign = 'center';
        pops = pops.filter((p) => {
          p.t += dt;
          if (p.t > 0.9) return false;
          ctx.globalAlpha = 1 - p.t / 0.9;
          ctx.fillStyle = p.c;
          ctx.font = '700 18px Kodchasan, sans-serif';
          ctx.fillText(p.text, Math.max(70, Math.min(w - 70, p.x)), p.y - p.t * 50);
          ctx.globalAlpha = 1;
          return true;
        });
        if (banner > 0 && live) {
          ctx.globalAlpha = Math.min(1, banner);
          ctx.fillStyle = '#f3f0e6';
          ctx.font = '500 16px Anuphan, sans-serif';
          ctx.fillText(`เขตที่ ${sector + 1} จาก ${SECTORS.length}`, w / 2, h * 0.3);
          ctx.font = `700 ${Math.min(40, w * 0.085)}px Kodchasan, sans-serif`;
          ctx.fillText(S.name, w / 2, h * 0.3 + 44);
          ctx.globalAlpha = 1;
        }
        api.hud([['เก็บ', `${got}/${NEED}`], ['หัวใจ', '♥'.repeat(Math.max(0, hearts)) || '0'], ['แต้ม', score]]);
      });
    },
  });
})();
