/** พิทักษ์ดาวเค้ก — แตะทำลายอุกกาบาต แต่อย่ายิงกล่องของขวัญ */
(function () {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const TIME = 45;

  Games.register({
    id: 'meteor', title: 'พิทักษ์ดาวเค้ก', tone: '#ff9f45', unit: 'แต้ม', art: 'rock', scene: ['rock', 'cupcake'],
    rewards: ['blackhole'],
    desc: 'ยิงอุกกาบาตก่อนถึงเค้ก 45 วินาที',
    how: 'แตะอุกกาบาตให้แตกก่อนจะตกถึงดาวเค้ก ลูกใหญ่ต้องแตะ 2 ครั้ง ส่วนกล่องของขวัญปล่อยให้ตกถึงพื้นจะได้แต้มพิเศษ อยู่ให้รอด 45 วินาที',
    play(api) {
      const v = api.canvas();
      let things = [], bits = [], time = TIME, hp = 4, score = 0, spawn = 0.4, flash = 0;

      const boom = (x, y, c, n = 16) => {
        for (let i = 0; i < n; i++) bits.push({ x, y, vx: rnd(-220, 220), vy: rnd(-220, 220), t: rnd(0.3, 0.8), c });
      };
      const over = () => api.finish({
        win: hp > 0, score, unit: 'แต้ม', rewards: hp > 0 ? ['blackhole'] : [],
        title: hp > 0 ? 'ดาวเค้กปลอดภัยแล้ว!' : 'เค้กเละหมดเลย',
        text: hp > 0 ? `รักษาเค้กไว้ได้ ${hp} จาก 4 ก้อน ขอบคุณผู้พิทักษ์` : 'อุกกาบาตหลุดไป 4 ลูก ลองเล็งลูกที่อยู่ต่ำสุดก่อน',
      });

      api.on(v.el, 'pointerdown', (e) => {
        if (api.ended()) return;
        const p = v.pos(e);
        let target = null, bd = Infinity; // เลือกเป้าที่ใกล้จุดแตะที่สุด
        things.forEach((o) => {
          const d = Math.hypot(o.x - p.x, o.y - p.y);
          if (!o.dead && d < o.s * 0.5 + 18 && d < bd) { bd = d; target = o; }
        });
        if (!target) { boom(p.x, p.y, '#8fb7ff', 4); return; }
        if (target.gift) {
          target.dead = true;
          score = Math.max(0, score - 20);
          boom(target.x, target.y, '#7fa8ff');
          Sound.sfx('bad');
          return;
        }
        target.hp--;
        boom(target.x, target.y, '#ff9f45', 10);
        if (target.hp <= 0) {
          target.dead = true;
          score += target.big ? 25 : 10;
          Sound.sfx('boom');
          boom(target.x, target.y, '#ffd166', 18);
        } else { target.s *= 0.75; Sound.sfx('tap'); }
      });

      api.loop((dt, t) => {
        const { ctx, w, h } = v;
        api.stars(v, t, 6, flash > 0 ? 'rgba(255,90,90,.18)' : null);
        flash -= dt;
        if (!api.ended()) {
          time -= dt;
          spawn -= dt;
          const k = 1 - time / TIME;
          if (spawn <= 0) {
            const gift = Math.random() < 0.14, big = !gift && Math.random() < 0.2 + k * 0.15;
            const s = gift ? 46 : big ? 82 : rnd(44, 58);
            const x = rnd(s, w - s), tx = w / 2 + rnd(-w * 0.3, w * 0.3);
            const dur = (big ? 4.4 : 3.5) - k * 1.2;
            things.push({ gift, big, hp: big ? 2 : 1, s, x, y: -s, vx: (tx - x) / dur, vy: (h + s) / dur, rot: rnd(0, 6), vr: rnd(-2, 2) });
            spawn = 1 - k * 0.5;
          }
          if (time <= 0) { time = 0; over(); }
        }

        const gr = Math.max(w * 0.95, 420), gy = h + gr * 0.5;
        ctx.fillStyle = '#e8a0b4';
        ctx.beginPath(); ctx.ellipse(w / 2, gy, gr, gr * 0.5 + 58, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#f7d3dc';
        ctx.beginPath(); ctx.ellipse(w / 2, gy + 16, gr, gr * 0.5 + 58, 0, 0, 6.2832); ctx.fill();
        for (let i = 0; i < 4; i++) {
          const x = w / 2 + (i - 1.5) * Math.min(84, w * 0.2);
          Art.draw(ctx, i < hp ? 'cupcake' : 'rock', x, h - 72 + (i < hp ? Math.sin(t * 3 + i) * 2 : 14), i < hp ? 54 : 30);
        }

        things = things.filter((o) => {
          if (o.dead) return false;
          if (!api.ended()) { o.x += o.vx * dt; o.y += o.vy * dt; o.rot += o.vr * dt; }
          if (o.y > h - 74) {
            if (api.ended()) return false;
            if (o.gift) { score += 30; Sound.sfx('pick'); boom(o.x, o.y, '#7fe3c8'); }
            else {
              hp--;
              flash = 0.25;
              Sound.sfx('bad');
              boom(o.x, o.y, '#ff7f8e', 24);
              if (hp <= 0) over();
            }
            return false;
          }
          if (!o.gift) {
            const a = Math.atan2(o.vy, o.vx), ex = o.x - Math.cos(a) * o.s * 1.5, ey = o.y - Math.sin(a) * o.s * 1.5;
            const g = ctx.createLinearGradient(o.x, o.y, ex, ey);
            g.addColorStop(0, 'rgba(255,159,69,.75)');
            g.addColorStop(1, 'rgba(255,159,69,0)');
            ctx.strokeStyle = g;
            ctx.lineWidth = o.s * 0.6;
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(ex, ey); ctx.stroke();
          }
          Art.draw(ctx, o.gift ? 'gift' : 'rock', o.x, o.y, o.s, o.gift ? Math.sin(t * 3) * 0.2 : o.rot);
          return true;
        });
        bits = bits.filter((b) => {
          b.t -= dt; b.x += b.vx * dt; b.y += b.vy * dt;
          if (b.t <= 0) return false;
          ctx.globalAlpha = Math.min(1, b.t * 3);
          ctx.fillStyle = b.c;
          ctx.beginPath(); ctx.arc(b.x, b.y, 3.5, 0, 6.2832); ctx.fill();
          ctx.globalAlpha = 1;
          return true;
        });
        api.hud([['เวลา', Math.ceil(time)], ['เค้ก', `${Math.max(0, hp)}/4`], ['แต้ม', score]]);
      });
    },
  });
})();
