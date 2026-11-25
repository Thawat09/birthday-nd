/** ต่อกลุ่มดาว — แตะดาวตามลำดับเพื่อวาดภาพบนท้องฟ้า */
(function () {
  const heart = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    heart.push([0.5 + 0.026 * 16 * Math.sin(a) ** 3, 0.46 - 0.026 * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))]);
  }
  const star = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2, r = i % 2 ? 0.19 : 0.45;
    star.push([0.5 + Math.cos(a) * r, 0.52 + Math.sin(a) * r]);
  }
  const SHAPES = [
    { name: 'กลุ่มดาวมงกุฎ', pts: [[0.1, 0.8], [0.06, 0.28], [0.3, 0.52], [0.5, 0.14], [0.7, 0.52], [0.94, 0.28], [0.9, 0.8]] },
    { name: 'กลุ่มดาวประกาย', pts: star },
    { name: 'กลุ่มดาวแมวเหมียว', pts: [[0.2, 0.12], [0.36, 0.28], [0.64, 0.28], [0.8, 0.12], [0.86, 0.5], [0.72, 0.8], [0.5, 0.9], [0.28, 0.8], [0.14, 0.5]] },
    { name: 'กลุ่มดาวเค้กวันเกิด', pts: [[0.1, 0.9], [0.1, 0.62], [0.26, 0.62], [0.26, 0.38], [0.44, 0.38], [0.44, 0.22], [0.5, 0.06], [0.56, 0.22], [0.56, 0.38], [0.74, 0.38], [0.74, 0.62], [0.9, 0.62], [0.9, 0.9]] },
    { name: 'กลุ่มดาวหัวใจ', pts: heart },
  ];

  Games.register({
    id: 'constellation', title: 'ต่อกลุ่มดาว', tone: '#8fb7ff', unit: 'วินาที', art: 'star-gold', scene: ['star-gold', 'star-mint'],
    rewards: ['galaxy'],
    desc: 'ลากเส้นต่อดาวตามเลขให้เป็น 5 ภาพ',
    how: 'ลากนิ้วหรือแตะดาวไล่ตามตัวเลข 1 2 3 จนครบ ตั้งแต่ภาพที่ 3 ตัวเลขจะค่อย ๆ จางหาย ต้องจำให้ได้ ถ้าแตะผิดตัวเลขจะกลับมาให้ดูแป๊บเดียว',
    play(api) {
      let pts = [], level = 0, next = 0, show = 99, done = 0, bad = 0, dragging = false, miss = 0, time = 0;
      const mouse = { x: 0, y: 0 };
      const v = api.canvas(layout);

      function layout() {
        const s = Math.min(v.w - 60, v.h - 130, 560);
        const ox = (v.w - s) / 2, oy = (v.h - s) / 2 - 8;
        pts = SHAPES[level].pts.map(([x, y]) => ({ x: ox + x * s, y: oy + y * s }));
      }
      function load() {
        next = 0;
        done = 0;
        show = level < 2 ? 99 : 5;
        dragging = false;
        layout();
      }
      load();

      function touch(p, tap) {
        if (done || api.ended()) return;
        let hit = -1, bd = 28;
        pts.forEach((q, i) => {
          const d = Math.hypot(q.x - p.x, q.y - p.y);
          if (d < bd) { bd = d; hit = i; }
        });
        if (hit === next) {
          next++;
          Sound.note(330 * Math.pow(2, next / 12), 0.3);
          if (next === pts.length) { done = 0.01; Sound.sfx('rare'); Confetti.burst(40); }
        } else if (hit > next && tap) {
          bad = 0.4;
          miss++;
          show = Math.max(show, 1.5);
          Sound.sfx('bad');
        }
      }
      api.on(v.el, 'pointerdown', (e) => {
        dragging = true;
        v.el.setPointerCapture(e.pointerId);
        Object.assign(mouse, v.pos(e));
        touch(mouse, true);
      });
      api.on(v.el, 'pointermove', (e) => {
        Object.assign(mouse, v.pos(e));
        if (dragging) touch(mouse, false);
      });
      const up = () => { dragging = false; };
      api.on(v.el, 'pointerup', up);
      api.on(v.el, 'pointercancel', up);

      api.loop((dt, t) => {
        const { ctx, w, h } = v;
        api.stars(v, t, 2);
        if (!api.ended() && !done) { time += dt; show -= dt; }
        bad -= dt;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = bad > 0 ? '#ff7f8e' : '#ffc857';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ffc857';
        ctx.shadowBlur = done ? 22 : 8;
        ctx.beginPath();
        for (let i = 0; i < next; i++) ctx.lineTo(pts[i].x, pts[i].y);
        if (done) ctx.closePath();
        ctx.stroke();
        if (done) { ctx.fillStyle = `rgba(255,200,87,${Math.min(0.22, done * 0.2)})`; ctx.fill(); }
        ctx.shadowBlur = 0;
        if (!done && next && dragging) {
          ctx.globalAlpha = 0.45;
          ctx.setLineDash([4, 8]);
          ctx.beginPath(); ctx.moveTo(pts[next - 1].x, pts[next - 1].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        pts.forEach((p, i) => {
          const on = i < next;
          const r = (on ? 8 : 6) + Math.sin(t * 3 + i) * 1.2;
          if (!done && i === next && (level < 2 || next === 0)) {
            ctx.strokeStyle = 'rgba(127,227,200,.8)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(p.x, p.y, 15 + Math.sin(t * 5) * 3, 0, 6.2832); ctx.stroke();
          }
          ctx.fillStyle = on ? '#ffc857' : '#f3f0e6';
          ctx.beginPath();
          for (let k = 0; k < 8; k++) {
            const a = k * 0.785 + t * 0.2, q = k % 2 ? r * 0.45 : r * 1.5;
            ctx.lineTo(p.x + Math.cos(a) * q, p.y + Math.sin(a) * q);
          }
          ctx.fill();
          if (!done && !on) {
            ctx.globalAlpha = Math.max(0, Math.min(1, show));
            ctx.fillStyle = '#a9c4ff';
            ctx.font = '600 15px Kodchasan, sans-serif';
            ctx.fillText(i + 1, p.x + 17, p.y - 15);
            ctx.globalAlpha = 1;
          }
        });
        ctx.textBaseline = 'alphabetic';
        if (done) {
          done += dt;
          ctx.fillStyle = '#f3f0e6';
          ctx.font = '700 26px Kodchasan, sans-serif';
          ctx.fillText(SHAPES[level].name, w / 2, h - 34);
          if (done > 1.9 && !api.ended()) {
            if (level === SHAPES.length - 1) {
              api.finish({
                win: true, score: Math.round(time), lower: true, unit: 'วินาที', rewards: ['galaxy'],
                title: 'วาดท้องฟ้าครบ 5 ภาพ', text: miss ? `แตะพลาดไป ${miss} ครั้ง` : 'ไม่พลาดเลยสักดวง เก่งมาก!',
              });
            } else { level++; load(); }
          }
        }
        api.hud([['ภาพ', `${level + 1}/${SHAPES.length}`], ['ดาว', `${next}/${pts.length}`], ['เวลา', Math.floor(time)]]);
      });
    },
  });
})();
