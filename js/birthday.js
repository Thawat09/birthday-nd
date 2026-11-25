/**
 * วันเกิด / อายุ / ด่านกรอกวันเกิด
 * - ไม่มีวันเกิดเก็บอยู่ในโค้ด: ใช้ค่าที่ผู้ใช้กรอกถูกมาคำนวณต่อทั้งหมด
 * - คิดเวลาตามเวลาไทย (UTC+7) เสมอ ไม่ว่าเครื่องจะตั้งโซนเวลาไหน
 */
(function (root) {
  const DAY = 86400000;
  const TZ = 7 * 3600000;
  const CODE_HASH = '177jcpgk8d1';
  const MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  function hash(str) {
    let a = 0xdeadbeef, b = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      a = Math.imul(a ^ c, 2654435761);
      b = Math.imul(b ^ c, 1597334677);
    }
    a = Math.imul(a ^ (a >>> 16), 2246822507) ^ Math.imul(b ^ (b >>> 13), 3266489909);
    b = Math.imul(b ^ (b >>> 16), 2246822507) ^ Math.imul(a ^ (a >>> 13), 3266489909);
    return (4294967296 * (2097151 & b) + (a >>> 0)).toString(36);
  }

  /** เหลือเฉพาะตัวเลข (รองรับเลขไทย และรูปแบบ 01/01/2540) */
  function digits(raw) {
    return String(raw)
      .replace(/[๐-๙]/g, (c) => c.charCodeAt(0) - 0x0e50)
      .replace(/\D/g, '')
      .slice(0, 8);
  }

  function parse(code) {
    return { d: +code.slice(0, 2), m: +code.slice(2, 4), y: +code.slice(4) - 543 };
  }

  /** ตรวจรหัส → { ok, birth } หรือ { ok:false, message } */
  function check(raw) {
    const code = digits(raw);
    if (code.length < 8) {
      return { ok: false, message: `ยังไม่ครบ 8 หลัก ขาดอีก ${8 - code.length} ตัว` };
    }
    if (hash('endu-orbit:' + code) === CODE_HASH) return { ok: true, birth: parse(code) };
    const d = +code.slice(0, 2), m = +code.slice(2, 4), y = +code.slice(4);
    if (m < 1 || m > 12 || d < 1 || d > 31) {
      return { ok: false, message: 'วันหรือเดือนไม่ถูกต้อง เรียงเป็น วัน เดือน ปี นะ' };
    }
    if (y >= 1900 && y < 2200) {
      return { ok: false, message: 'ปีนี้เป็น ค.ศ. ลองเปลี่ยนเป็น พ.ศ. (บวก 543)' };
    }
    return { ok: false, message: 'ยังไม่ใช่วันเกิดของเจ้าของยานลำนี้ ลองใหม่อีกครั้งนะ' };
  }

  /** เวลา UTC (ms) ของเที่ยงคืนไทยในวันเกิดปีนั้น */
  function birthdayAt(birth, year) {
    return Date.UTC(year, birth.m - 1, birth.d) - TZ;
  }

  /**
   * phase: 'today' = วันเกิดจริง, 'belated' = เลยวันเกิดของปีนี้แล้ว, 'upcoming' = ปีนี้ยังไม่ถึง
   */
  function info(birth, now) {
    const year = new Date(now + TZ).getUTCFullYear();
    const thisYear = birthdayAt(birth, year);
    const passed = now >= thisYear;
    const last = passed ? thisYear : birthdayAt(birth, year - 1);
    const next = passed ? birthdayAt(birth, year + 1) : thisYear;
    const age = year - birth.y - (passed ? 0 : 1);
    const daysSince = Math.floor((now - last) / DAY);
    return {
      phase: !passed ? 'upcoming' : daysSince === 0 ? 'today' : 'belated',
      age,
      nextAge: age + 1,
      daysSince,
      left: next - now,
      todayLeft: last + DAY - now,
      daysUntil: Math.ceil((next - now) / DAY),
      progress: (now - last) / (next - last),
      daysLived: (now - birthdayAt(birth, birth.y)) / DAY,
      lastYearBE: new Date(last + TZ).getUTCFullYear() + 543,
      nextYearBE: new Date(next + TZ).getUTCFullYear() + 543,
      dayMonth: `${birth.d} ${MONTHS[birth.m - 1]}`,
      dayMonthShort: `${birth.d} ${MONTHS_SHORT[birth.m - 1]}`,
    };
  }

  function split(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    return { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
  }

  /** ใช้ทดสอบ: ?preview=2027-08-15T23:59:50 (เวลาไทย) */
  function previewOffset(search, realNow) {
    const p = new URLSearchParams(search).get('preview');
    if (!p) return 0;
    const t = Date.parse((p.length <= 10 ? p + 'T09:00:00' : p) + '+07:00');
    return Number.isNaN(t) ? 0 : t - realNow;
  }

  const offset = typeof location === 'undefined' ? 0 : previewOffset(location.search, Date.now());
  const api = { check, digits, parse, info, split, now: () => Date.now() + offset };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Birthday = api;
})(this);
