/** เกมบนกระดาน: จับคู่ดาวเคราะห์ + สัญญาณจากต่างดาว */
(function () {
  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  Games.register({
    id: 'memory', title: 'จับคู่ดาวเคราะห์', tone: '#7fe3c8', unit: 'ครั้ง', art: 'saturn', scene: ['saturn', 'earth'],
    rewards: ['gem'],
    desc: 'เปิดการ์ดหาดาวคู่เหมือนให้ครบ 8 คู่',
    how: 'แตะเปิดการ์ดทีละ 2 ใบ จำตำแหน่งแล้วจับคู่ดาวที่เหมือนกันให้ครบ 8 คู่ ยิ่งเปิดน้อยครั้งยิ่งเก่ง',
    play(api) {
      const pool = shuffle(['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon', 'sun']).slice(0, 8);
      const deck = shuffle([...pool, ...pool]);
      api.stage.classList.add('stage-board');
      const grid = document.createElement('div');
      grid.className = 'memory';
      let first = null, busy = false, pairs = 0, moves = 0;
      const hud = () => api.hud([['คู่', `${pairs}/8`], ['เปิด', moves]]);

      deck.forEach((id, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'mem';
        b.setAttribute('aria-label', `การ์ดใบที่ ${i + 1}`);
        b.innerHTML = `<span class="mem-in"><span class="mem-back"></span><span class="mem-front"><img src="${Art.uri[id]}" alt=""></span></span>`;
        api.on(b, 'click', () => {
          if (busy || b.classList.contains('open')) return;
          b.classList.add('open');
          b.setAttribute('aria-label', Album.BY_ID[id].name);
          Sound.sfx('tap');
          if (!first) { first = { b, id, i }; return; }
          moves++;
          const a = first;
          first = null;
          if (a.id === id) {
            pairs++;
            Sound.sfx('pick');
            a.b.classList.add('match');
            b.classList.add('match');
            if (pairs === 8) {
              api.after(0.7, () => api.finish({
                win: true, score: moves, lower: true, unit: 'ครั้ง', rewards: ['gem'], title: 'จับคู่ครบทุกดวง!',
                text: moves <= 14 ? 'ความจำระดับนักบินอวกาศ' : 'เก่งมาก ลองทำให้น้อยกว่านี้ดูไหม',
              }));
            }
          } else {
            busy = true;
            api.after(0.85, () => {
              [a, { b, i }].forEach((c) => { c.b.classList.remove('open'); c.b.setAttribute('aria-label', `การ์ดใบที่ ${c.i + 1}`); });
              busy = false;
            });
          }
          hud();
        });
        grid.appendChild(b);
      });
      api.stage.appendChild(grid);
      hud();
    },
  });

  const PADS = [['alien', '#62c98a', 392], ['robot', '#8fb7ff', 523], ['cat', '#ffb066', 659], ['rabbit', '#ff9fb0', 784]];
  const GOAL = 7;

  Games.register({
    id: 'signal', title: 'สัญญาณจากต่างดาว', tone: '#62c98a', unit: 'รอบ', art: 'alien', scene: ['alien', 'robot'],
    rewards: ['alien', 'robot'],
    desc: 'ฟังแล้วตอบสัญญาณกลับให้ถูกลำดับ',
    how: 'ดูและฟังว่าเพื่อนอวกาศตัวไหนส่งสัญญาณ แล้วแตะตอบตามลำดับเดิม สัญญาณจะยาวขึ้นเรื่อย ๆ ผ่าน 4 รอบได้เพื่อนต่างดาว ผ่าน 7 รอบได้หุ่นยนต์',
    play(api) {
      api.stage.classList.add('stage-board');
      const wrap = document.createElement('div');
      wrap.className = 'signal';
      wrap.innerHTML = '<p class="signal-msg" aria-live="polite"></p><div class="signal-pads"></div>';
      const msg = wrap.firstChild, box = wrap.lastChild;
      const seq = [];
      let pos = 0, listening = false;
      const pads = PADS.map(([id, color, freq], i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'pad';
        b.style.setProperty('--tone', color);
        b.setAttribute('aria-label', Album.BY_ID[id].name);
        b.innerHTML = `<img src="${Art.uri[id]}" alt="">`;
        api.on(b, 'click', () => press(i));
        box.appendChild(b);
        return { b, freq };
      });
      api.stage.appendChild(wrap);

      function light(i, len) {
        const { b, freq } = pads[i];
        b.classList.add('lit');
        Sound.note(freq, len);
        api.after(len * 0.8, () => b.classList.remove('lit'));
      }
      function round() {
        seq.push((Math.random() * 4) | 0);
        pos = 0;
        listening = false;
        box.classList.add('wait');
        msg.textContent = 'ฟังสัญญาณให้ดีนะ';
        api.hud([['รอบ', `${seq.length}/${GOAL}`]]);
        const gap = Math.max(0.34, 0.62 - seq.length * 0.035);
        seq.forEach((p, i) => api.after(0.7 + i * gap, () => light(p, gap * 0.85)));
        api.after(0.7 + seq.length * gap, () => {
          listening = true;
          box.classList.remove('wait');
          msg.textContent = 'ถึงตาเธอตอบแล้ว';
        });
      }
      function press(i) {
        if (!listening || api.ended()) return;
        light(i, 0.25);
        if (seq[pos] !== i) {
          listening = false;
          const cleared = seq.length - 1, ok = cleared >= 4;
          api.finish({
            win: ok, score: cleared, unit: 'รอบ', rewards: ok ? ['alien'] : [], title: 'สัญญาณขาดหาย',
            text: ok ? 'เพื่อนต่างดาวประทับใจมาก ลองให้ถึง 7 รอบดูนะ' : 'ผ่านให้ได้ 4 รอบเพื่อพบเพื่อนต่างดาว',
          });
          return;
        }
        if (++pos < seq.length) return;
        listening = false;
        if (seq.length === GOAL) {
          api.after(0.5, () => api.finish({
            win: true, score: GOAL, unit: 'รอบ', rewards: ['alien', 'robot'], title: 'ติดต่อสำเร็จ!',
            text: 'ข้อความจากต่างดาวแปลได้ว่า "ขอให้เอ็นดูมีความสุขมาก ๆ"',
          }));
          return;
        }
        msg.textContent = 'ถูกต้อง!';
        Sound.sfx('pick');
        api.after(0.7, round);
      }
      round();
    },
  });
})();
