/**
 * ดนตรี Happy Birthday (ไม่มีเสียงร้อง) — เล่นครั้งเดียวแล้วจบ
 */
(function () {
  const MELODY = [
    { note: 'G4', dur: 0.3 }, { note: 'G4', dur: 0.3 }, { note: 'A4', dur: 0.6 }, { note: 'G4', dur: 0.6 },
    { note: 'C5', dur: 0.6 }, { note: 'B4', dur: 1.0 },
    { note: 'G4', dur: 0.3 }, { note: 'G4', dur: 0.3 }, { note: 'A4', dur: 0.6 }, { note: 'G4', dur: 0.6 },
    { note: 'D5', dur: 0.6 }, { note: 'C5', dur: 1.0 },
    { note: 'G4', dur: 0.3 }, { note: 'G4', dur: 0.3 }, { note: 'G5', dur: 0.6 }, { note: 'E5', dur: 0.6 },
    { note: 'C5', dur: 0.6 }, { note: 'B4', dur: 0.6 }, { note: 'A4', dur: 1.0 },
    { note: 'F5', dur: 0.3 }, { note: 'F5', dur: 0.3 }, { note: 'E5', dur: 0.6 }, { note: 'C5', dur: 0.6 },
    { note: 'D5', dur: 0.6 }, { note: 'C5', dur: 1.2 },
  ];

  const FREQ = {
    G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25,
    D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
  };

  let ctx = null;
  let playing = false;
  let endTimer = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function playTone(freq, start, dur) {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  function playOnce() {
    const ac = getCtx();
    let t = ac.currentTime + 0.05;
    MELODY.forEach(({ note, dur }) => {
      playTone(FREQ[note], t, dur * 0.9);
      t += dur;
    });
    return t - ac.currentTime;
  }

  function finish() {
    playing = false;
    endTimer = null;
    window.dispatchEvent(new CustomEvent('birthday-music-ended'));
  }

  function play() {
    if (playing) return Promise.resolve();

    const ac = getCtx();
    playing = true;

    if (endTimer) clearTimeout(endTimer);

    return ac.resume().then(() => {
      const duration = playOnce();
      endTimer = setTimeout(finish, duration * 1000 + 300);
    });
  }

  function stop() {
    playing = false;
    if (endTimer) {
      clearTimeout(endTimer);
      endTimer = null;
    }
  }

  function toggle() {
    if (playing) {
      stop();
      return false;
    }
    play();
    return true;
  }

  function isPlaying() {
    return playing;
  }

  window.BirthdayMusic = { play, stop, toggle, isPlaying };
})();
