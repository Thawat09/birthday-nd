/**
 * ภาพวาด SVG ทั้งหมดของเว็บ (ใช้ได้ทั้ง <img> และ canvas)
 */
(function () {
  const INK = '#231b45';

  const face = (x, y, s = 1, c = INK) =>
    `<g fill="${c}"><circle cx="${x - 6 * s}" cy="${y}" r="${2.1 * s}"/><circle cx="${x + 6 * s}" cy="${y}" r="${2.1 * s}"/></g>` +
    `<path d="M${x - 3 * s} ${y + 3.2 * s}q${3 * s} ${3.6 * s} ${6 * s} 0" fill="none" stroke="${c}" stroke-width="${1.7 * s}" stroke-linecap="round"/>` +
    `<g fill="#ff7f8e" opacity=".55"><circle cx="${x - 10 * s}" cy="${y + 3.5 * s}" r="${2.3 * s}"/><circle cx="${x + 10 * s}" cy="${y + 3.5 * s}" r="${2.3 * s}"/></g>`;

  const starPts = (cx, cy, R, r, n = 5) => {
    let p = '';
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI * i) / n - Math.PI / 2;
      const k = i % 2 ? r : R;
      p += `${(cx + Math.cos(a) * k).toFixed(1)},${(cy + Math.sin(a) * k).toFixed(1)} `;
    }
    return p.trim();
  };
  const star = (fill) =>
    `<polygon points="${starPts(32, 33, 25, 13.5)}" fill="${fill}" stroke="${fill}" stroke-width="8" stroke-linejoin="round"/>${face(32, 33, 0.95)}`;

  const ball = (fill, inner = '', f = face(32, 35), r = 23) =>
    `<clipPath id="c"><circle cx="32" cy="32" r="${r}"/></clipPath><circle cx="32" cy="32" r="${r}" fill="${fill}"/>` +
    `<g clip-path="url(#c)">${inner}<circle cx="${32 - r * 0.28}" cy="${32 - r * 0.28}" r="${r * 1.22}" fill="none" stroke="${INK}" stroke-opacity=".14" stroke-width="${r * 0.5}"/></g>${f}`;

  const RAW = {
    'star-gold': star('#ffd166'),
    'star-pink': star('#ff9fb0'),
    'star-mint': star('#86e8cf'),
    moon: ball('#efe8d2', '<g fill="#d5cbaa"><circle cx="18" cy="22" r="5"/><circle cx="45" cy="18" r="4"/><circle cx="40" cy="50" r="6"/><circle cx="14" cy="42" r="3"/></g>'),
    sun: `<polygon points="${starPts(32, 32, 30, 23, 12)}" fill="#ff9f45" stroke="#ff9f45" stroke-width="2" stroke-linejoin="round"/><circle cx="32" cy="32" r="20" fill="#ffd166"/>${face(32, 33)}`,
    mercury: ball('#b9a99a', '<g fill="#998877"><circle cx="20" cy="20" r="5"/><circle cx="44" cy="46" r="6"/><circle cx="46" cy="22" r="3"/></g>', face(32, 35), 19),
    venus: ball('#f4c98b', '<g fill="none" stroke="#e0a962" stroke-width="5"><path d="M4 22q14 6 28 0t30 0M4 50q14-6 28 0t30 0"/></g>'),
    earth: ball('#5aa9f0', '<g fill="#6fd08c"><path d="M10 14q10-6 18 1t-3 11-14 4-9-6z"/><path d="M42 12q14 0 14 12t-9 6-5-18z"/><path d="M22 46q10-4 18 2t-2 12-18-2z"/></g>'),
    mars: ball('#e2734f', '<path d="M14 8h36v8q-9 5-18 1t-18 1z" fill="#fbe3d2"/><g fill="#c25a3a"><circle cx="46" cy="44" r="5"/><circle cx="18" cy="50" r="4"/></g>', face(32, 35), 21),
    jupiter: ball('#eec9a0', '<g fill="#d39a6a"><rect y="14" width="64" height="6"/><rect y="25" width="64" height="3"/><rect y="45" width="64" height="6"/></g><ellipse cx="47" cy="48" rx="5" ry="3.4" fill="#d85c4a"/>', face(32, 35), 26),
    saturn: `<ellipse cx="32" cy="33" rx="30" ry="9" fill="none" stroke="#d9a86c" stroke-width="4" transform="rotate(-18 32 33)"/><circle cx="32" cy="32" r="18" fill="#f3d58f"/><path d="M16 24q16 5 32-1" fill="none" stroke="#dcb164" stroke-width="3"/>${face(32, 29, 0.85)}<path d="M2 33a30 9 0 0 0 60 0" fill="none" stroke="#d9a86c" stroke-width="4" transform="rotate(-18 32 33)"/>`,
    uranus: `<ellipse cx="32" cy="32" rx="6" ry="29" fill="none" stroke="#cdeef2" stroke-width="2.5" transform="rotate(14 32 32)"/>${ball('#8fdde6', '<rect y="16" width="64" height="4" fill="#b5edf2"/>', face(32, 34), 19)}`,
    neptune: ball('#5673e8', '<g fill="none" stroke="#7f97f5" stroke-width="4" stroke-linecap="round"><path d="M6 20q14-5 26 0M30 50q12 4 26-2"/></g>', face(32, 35, 1, '#eef1ff')),
    cupcake: `<path d="M16 38h32l-5 21a3 3 0 0 1-3 2H24a3 3 0 0 1-3-2z" fill="#f2a65a"/><path d="M24 40l2 20M32 40v20M40 40l-2 20" stroke="#d98838" stroke-width="2"/><path d="M12 38q-3-10 7-12 0-12 13-12t13 12q10 2 7 12z" fill="#ffb3c1"/><circle cx="32" cy="10" r="5" fill="#ff5d73"/>${face(32, 29, 0.9)}`,
    gift: `<rect x="11" y="26" width="42" height="33" rx="4" fill="#7fa8ff"/><rect x="8" y="20" width="48" height="11" rx="3" fill="#a5c1ff"/><rect x="28" y="20" width="8" height="39" fill="#ffd166"/><path d="M32 20q-16-2-14-10t14 10q0-16 10-12t-10 12z" fill="none" stroke="#ffd166" stroke-width="5" stroke-linejoin="round"/>${face(32, 43, 0.95)}`,
    balloon: `<path d="M32 50q-4 6 0 12" fill="none" stroke="#f3f0e6" stroke-width="2"/><path d="M28 52l4-5 4 5z" fill="#e85f73"/><ellipse cx="32" cy="26" rx="20" ry="23" fill="#ff7f8e"/><ellipse cx="24" cy="14" rx="4" ry="6" fill="#fff" opacity=".45" transform="rotate(25 24 14)"/>${face(32, 28)}`,
    hat: `<clipPath id="c"><path d="M32 10L54 58H10z"/></clipPath><path d="M32 10L54 58H10z" fill="#86e8cf" stroke="#86e8cf" stroke-width="3" stroke-linejoin="round"/><g clip-path="url(#c)" stroke="#48bfa4" stroke-width="5"><path d="M10 30l40-14M6 60l54-10"/></g><circle cx="32" cy="9" r="6" fill="#ffd166"/>${face(32, 44, 0.9)}`,
    candle: `<path d="M32 2q9 10 4 16a6 6 0 0 1-9-1q-2-6 5-15z" fill="#ffb347"/><path d="M32 10q4 5 1 8t-4-2q0-3 3-6z" fill="#fff3c4"/><path d="M32 20v6" stroke="${INK}" stroke-width="2"/><clipPath id="c"><rect x="22" y="25" width="20" height="36" rx="4"/></clipPath><rect x="22" y="25" width="20" height="36" rx="4" fill="#f3f0e6"/><g clip-path="url(#c)" stroke="#ff9fb0" stroke-width="5"><path d="M18 60l28-12M18 36l28-12"/></g>${face(32, 41, 0.75)}`,
    alien: `<path d="M20 14L14 6M44 14l6-8" stroke="#62c98a" stroke-width="3" stroke-linecap="round"/><circle cx="13" cy="6" r="4" fill="#ffd166"/><circle cx="51" cy="6" r="4" fill="#ffd166"/><path d="M32 10c18 0 24 12 22 24S42 60 32 60 12 46 10 34s4-24 22-24z" fill="#8be3a8"/><g fill="${INK}"><ellipse cx="22" cy="33" rx="6.5" ry="8.5" transform="rotate(-18 22 33)"/><ellipse cx="42" cy="33" rx="6.5" ry="8.5" transform="rotate(18 42 33)"/></g><g fill="#fff"><circle cx="24" cy="29" r="2.3"/><circle cx="44" cy="29" r="2.3"/></g><path d="M27 49q5 4 10 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
    cat: `<circle cx="32" cy="32" r="28" fill="#dfe7ff"/><circle cx="32" cy="32" r="23" fill="#28346f"/><path d="M17 30l1-14 9 6zM47 30l-1-14-9 6z" fill="#ffb066" stroke="#ffb066" stroke-width="3" stroke-linejoin="round"/><ellipse cx="32" cy="36" rx="17" ry="15" fill="#ffb066"/><path d="M32 21v6M26 22l1 4M38 22l-1 4" stroke="#d9843a" stroke-width="2.5" stroke-linecap="round"/>${face(32, 36)}<path d="M14 22q4-8 12-11" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`,
    ufo: `<path d="M22 42L12 62h40L42 42z" fill="#ffd166" opacity=".35"/><path d="M18 30a14 15 0 0 1 28 0z" fill="#b9e6ff"/><ellipse cx="32" cy="35" rx="29" ry="11" fill="#9aa5d8"/><ellipse cx="32" cy="31" rx="21" ry="5" fill="#c5cdf2"/><g fill="#ffd166"><circle cx="13" cy="37" r="2.5"/><circle cx="51" cy="37" r="2.5"/><circle cx="23" cy="42" r="2.5"/><circle cx="41" cy="42" r="2.5"/></g>${face(32, 24, 0.7)}`,
    robot: `<path d="M32 4v10" stroke="#9aa5d8" stroke-width="3"/><circle cx="32" cy="5" r="4" fill="#ff7f8e"/><rect x="4" y="26" width="8" height="16" rx="3" fill="#9aa5d8"/><rect x="52" y="26" width="8" height="16" rx="3" fill="#9aa5d8"/><rect x="10" y="14" width="44" height="40" rx="11" fill="#c5cdf2"/><rect x="16" y="22" width="32" height="24" rx="8" fill="#28346f"/>${face(32, 33, 0.95, '#7fe3c8')}`,
    rabbit: `<g fill="#f7f2ff"><ellipse cx="22" cy="16" rx="6.5" ry="15" transform="rotate(-8 22 16)"/><ellipse cx="42" cy="16" rx="6.5" ry="15" transform="rotate(8 42 16)"/></g><g fill="#ffb3c1"><ellipse cx="22" cy="17" rx="2.8" ry="10" transform="rotate(-8 22 17)"/><ellipse cx="42" cy="17" rx="2.8" ry="10" transform="rotate(8 42 17)"/></g><ellipse cx="32" cy="42" rx="22" ry="19" fill="#f7f2ff"/>${face(32, 42, 1.1)}`,
    comet: `<path d="M60 4L34 20 44 30zM62 18L40 30l6 8zM46 2L26 22l8 6z" fill="#8fb7ff" opacity=".75"/><circle cx="24" cy="40" r="19" fill="#bfe0ff"/><circle cx="24" cy="40" r="15" fill="#e6f4ff"/>${face(24, 40, 0.9)}`,
    gem: `<path d="M18 10h28l14 16-28 34L4 26z" fill="#7fe3c8"/><path d="M18 10l4 16 10-16 10 16 4-16M4 26h56M22 26l10 34 10-34" fill="none" stroke="#e8fff8" stroke-width="2" stroke-linejoin="round" opacity=".8"/>${face(32, 32, 0.75)}`,
    blackhole: `<ellipse cx="32" cy="32" rx="30" ry="12" fill="#ff9f45" transform="rotate(-18 32 32)"/><ellipse cx="32" cy="32" rx="26" ry="8" fill="#ffe3a3" transform="rotate(-18 32 32)"/><circle cx="32" cy="32" r="18" fill="#0a0d1f" stroke="#ffc857" stroke-width="2.5"/>${face(32, 32, 0.9, '#f3f0e6')}`,
    galaxy: `<g transform="rotate(-24 32 32)"><ellipse cx="32" cy="32" rx="31" ry="19" fill="#5d6be0" opacity=".55"/><path d="M4 34C4 18 26 10 44 17c14 6 14 18 4 23-9 4-20 1-21-5M60 30c0 16-22 24-40 17C6 41 6 29 16 24c9-4 20-1 21 5" fill="none" stroke="#b9a3ff" stroke-width="5" stroke-linecap="round"/><g fill="#fff"><circle cx="10" cy="24" r="1.5"/><circle cx="54" cy="42" r="1.5"/><circle cx="46" cy="10" r="1.2"/><circle cx="18" cy="54" r="1.2"/></g></g><circle cx="32" cy="32" r="14" fill="#fff3d6"/>${face(32, 32, 0.8)}`,
    heart: `<path d="M32 58C4 40 2 24 8 15s20-7 24 4c4-11 18-13 24-4s4 25-24 43z" fill="#ff7f8e"/><path d="M12 22q2-8 9-8" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/><g fill="#fff"><circle cx="46" cy="20" r="1.5"/><circle cx="50" cy="28" r="1"/><circle cx="20" cy="44" r="1.2"/></g>${face(32, 32, 1.1)}`,
    // ---- ไม่ใช่ของสะสม ----
    ship: '<path d="M25 52q7 22 14 0z" fill="#ffb347"/><path d="M29 52q3 12 6 0z" fill="#fff3c4"/><path d="M16 36L6 52l14-1zM48 36l10 16-14-1z" fill="#ff7f8e"/><path d="M32 2c12 10 16 22 14 38l-4 13H22l-4-13C16 24 20 12 32 2z" fill="#f3f0e6"/><path d="M32 2c6 5 10 10 12 16H20C22 12 26 7 32 2z" fill="#ff7f8e"/><circle cx="32" cy="32" r="9" fill="#8fb7ff" stroke="#28346f" stroke-width="3"/><path d="M27 30q2-4 6-4" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
    rock: '<path d="M20 8l20-3 16 14 3 20-14 17-22 3L6 45 4 24z" fill="#7d7796"/><path d="M20 8l20-3 16 14-18 2-20 8L4 24z" fill="#958fae"/><g fill="#5f5a78"><circle cx="24" cy="36" r="6"/><circle cx="43" cy="44" r="4"/><circle cx="42" cy="28" r="3"/></g>',
    shield: `<path d="M32 5l22 8v17q0 19-22 29Q10 49 10 30V13z" fill="#8fb7ff" stroke="#e6f0ff" stroke-width="4" stroke-linejoin="round"/>${face(32, 30)}`,
    magnet: '<path d="M10 8v24a22 22 0 0 0 44 0V8H40v24a8 8 0 0 1-16 0V8z" fill="#ff7f8e"/><path d="M10 8h14v11H10zM40 8h14v11H40z" fill="#f3f0e6"/>',
    envelope: '<rect x="4" y="14" width="56" height="40" rx="6" fill="#f3f0e6"/><path d="M6 18l26 20 26-20" fill="none" stroke="#c9bfa0" stroke-width="3" stroke-linejoin="round"/><path d="M32 47c-9-6-10-11-7-14s6-1 7 2c1-3 5-5 7-2s2 8-7 14z" fill="#ff7f8e"/>',
  };

  const uri = {};
  const img = {};
  Object.keys(RAW).forEach((id) => {
    uri[id] = 'data:image/svg+xml,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="128" height="128">${RAW[id]}</svg>`);
    img[id] = new Image();
    img[id].src = uri[id];
  });

  /** วาด sprite กลางจุด x,y ขนาด size */
  function draw(ctx, id, x, y, size, rot = 0, alpha = 1) {
    const im = img[id];
    if (!im.complete || !im.naturalWidth) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.drawImage(im, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  function hydrate(scope) {
    scope.querySelectorAll('img[data-art]').forEach((el) => {
      el.src = uri[el.dataset.art];
      el.draggable = false;
    });
  }

  window.Art = { uri, draw, hydrate };
})();
