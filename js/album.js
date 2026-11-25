/**
 * สมุดสะสม — เก็บใน localStorage ของเครื่องนี้
 */
(function () {
  const FLY = 'ยานเก็บดวงดาว';
  const ITEMS = [
    ['star-gold', 'ดาวทอง', FLY], ['star-pink', 'ดาวชมพู', FLY], ['star-mint', 'ดาวมินต์', FLY],
    ['moon', 'ดวงจันทร์', FLY], ['sun', 'ดวงอาทิตย์', FLY],
    ['mercury', 'ดาวพุธ', FLY], ['venus', 'ดาวศุกร์', FLY], ['earth', 'โลก', FLY], ['mars', 'ดาวอังคาร', FLY],
    ['jupiter', 'ดาวพฤหัส', FLY], ['saturn', 'ดาวเสาร์', FLY], ['uranus', 'ดาวยูเรนัส', FLY], ['neptune', 'ดาวเนปจูน', FLY],
    ['gift', 'กล่องของขวัญ', FLY], ['balloon', 'ลูกโป่ง', FLY], ['hat', 'หมวกปาร์ตี้', FLY],
    ['cat', 'แมวอวกาศ', FLY], ['ufo', 'จานบิน', FLY], ['rabbit', 'กระต่ายจันทร์', FLY],
    ['cupcake', 'คัพเค้ก', 'เค้กทะลุชั้นบรรยากาศ'], ['candle', 'เทียนวันเกิด', 'เค้กทะลุชั้นบรรยากาศ'],
    ['alien', 'เพื่อนต่างดาว', 'สัญญาณจากต่างดาว'], ['robot', 'หุ่นยนต์', 'สัญญาณจากต่างดาว'],
    ['comet', 'ดาวหาง', 'พลุซูเปอร์โนวา'],
    ['gem', 'ผลึกจักรวาล', 'จับคู่ดาวเคราะห์', 1], ['blackhole', 'หลุมดำ', 'พิทักษ์ดาวเค้ก', 1],
    ['galaxy', 'กาแล็กซี', 'ต่อกลุ่มดาว', 1], ['heart', 'เนบิวลาหัวใจ', 'เป่าเทียนบนดวงจันทร์', 1],
  ].map(([id, name, from, rare]) => ({ id, name, from, rare: !!rare }));
  const BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

  const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* โหมดส่วนตัว */ } };

  const owned = read('endu-album');
  const best = read('endu-best');
  const subs = [];
  const count = () => ITEMS.filter((i) => owned[i.id]).length;
  const complete = () => count() === ITEMS.length;

  function toast(item) {
    const box = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<img src="${Art.uri[item.id]}" alt=""><span><b>${item.name}</b>ใหม่ในสมุดสะสม ${count()}/${ITEMS.length}</span>`;
    box.appendChild(el);
    while (box.children.length > 2) box.firstChild.remove();
    setTimeout(() => el.classList.add('out'), 2000);
    setTimeout(() => el.remove(), 2500);
  }

  /** คืน true ถ้าเป็นชิ้นใหม่ */
  function add(id) {
    const fresh = !owned[id];
    owned[id] = (owned[id] || 0) + 1;
    write('endu-album', owned);
    if (fresh) { toast(BY_ID[id]); Sound.sfx('rare'); }
    subs.forEach((fn) => fn(id, fresh));
    return fresh;
  }

  /** คืน true ถ้าเป็นสถิติใหม่ (lower = ค่าน้อยดีกว่า) */
  function record(game, score, lower) {
    const old = best[game];
    if (old != null && (lower ? score >= old : score <= old)) return false;
    best[game] = score;
    write('endu-best', best);
    return old != null;
  }

  window.Album = {
    ITEMS, BY_ID, add, record, count, complete,
    has: (id) => !!owned[id], qty: (id) => owned[id] || 0, best: (g) => best[g],
    onChange: (fn) => subs.push(fn),
  };
})();
