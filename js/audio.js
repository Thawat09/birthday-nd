/**
 * เพลง Happy Birthday (Web Audio) + เสียงเอฟเฟกต์
 */
(function () {
  const F = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
  const SONG = ('G4 .3 G4 .3 A4 .6 G4 .6 C5 .6 B4 1 G4 .3 G4 .3 A4 .6 G4 .6 D5 .6 C5 1 ' +
    'G4 .3 G4 .3 G5 .6 E5 .6 C5 .6 B4 .6 A4 1 F5 .3 F5 .3 E5 .6 C5 .6 D5 .6 C5 1.2').split(' ');

  let ac = null;
  let master = null;
  let muted = false;
  let song = null; // { gain, oscs, timer }
  const listeners = [];

  function ctx() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    return ac;
  }

  function tone(freq, at, dur, { type = 'triangle', vol = 0.16, out = master, to } = {}) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, at);
    if (to) o.frequency.exponentialRampToValueAtTime(to, at + dur);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(vol, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0008, at + dur);
    o.connect(g);
    g.connect(out);
    o.start(at);
    o.stop(at + dur + 0.05);
    return o;
  }

  const emit = () => listeners.forEach((fn) => fn(!!song));

  function stop() {
    if (!song) return;
    clearTimeout(song.timer);
    song.oscs.forEach((o) => { try { o.stop(); } catch (e) { /* จบไปแล้ว */ } });
    song.gain.disconnect();
    song = null;
    emit();
  }

  function play() {
    if (!ctx()) return;
    stop();
    const gain = ac.createGain();
    gain.connect(master);
    const oscs = [];
    let t = ac.currentTime + 0.1;
    const t0 = t;
    for (let i = 0; i < SONG.length; i += 2) {
      const f = F[SONG[i]];
      const d = +SONG[i + 1] * 1.1;
      oscs.push(tone(f, t, d, { out: gain, vol: 0.17 }));
      oscs.push(tone(f * 2, t, d * 0.7, { out: gain, vol: 0.035, type: 'sine' }));
      oscs.push(tone(f / 2, t, d, { out: gain, vol: 0.05, type: 'sine' }));
      t += d;
    }
    song = { gain, oscs, timer: setTimeout(stop, (t - t0) * 1000 + 400) };
    emit();
  }

  const SFX = {
    tap: [[520, 0, 0.08]],
    pick: [[660, 0, 0.09], [990, 0.06, 0.14]],
    rare: [[523, 0, 0.12], [659, 0.09, 0.12], [784, 0.18, 0.12], [1047, 0.27, 0.3]],
    win: [[523, 0, 0.15], [659, 0.13, 0.15], [784, 0.26, 0.15], [1047, 0.39, 0.5]],
    bad: [[180, 0, 0.22, 90]],
    boom: [[150, 0, 0.3, 40]],
    launch: [[90, 0, 1.4, 900]],
  };

  function sfx(name) {
    if (muted || !ctx()) return;
    SFX[name].forEach(([f, d, len, to]) =>
      tone(f, ac.currentTime + d, len, { vol: 0.1, to, type: name === 'bad' || name === 'boom' ? 'sawtooth' : 'triangle' }));
  }

  function note(freq, len = 0.35) {
    if (!muted && ctx()) tone(freq, ac.currentTime, len, { vol: 0.15, type: 'sine' });
  }

  function setMuted(v) {
    muted = v;
    if (master) master.gain.value = v ? 0 : 1;
  }

  window.Sound = {
    play, stop, sfx, note, setMuted,
    toggleSong: () => (song ? stop() : play()),
    isMuted: () => muted,
    onSong: (fn) => listeners.push(fn),
  };
})();
