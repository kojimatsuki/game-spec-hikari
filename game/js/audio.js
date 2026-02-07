// audio.js - Web Audio API サウンド管理

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function resumeAudio() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();
}

function playTone(freq, duration, type = 'sine', volume = 0.15) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playNotes(notes, tempo = 150) {
  const beatDur = 60 / tempo;
  notes.forEach(([freq, beats], i) => {
    setTimeout(() => {
      if (freq > 0) playTone(freq, beats * beatDur * 0.9, 'square', 0.08);
    }, i * beatDur * 1000 * beats);
  });
}

export function sfxTap() {
  playTone(800, 0.08, 'sine', 0.1);
}

export function sfxCollect() {
  playTone(523, 0.1, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 60);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 120);
}

export function sfxGolden() {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, 'sine', 0.15), i * 80);
  });
}

export function sfxBomb() {
  playTone(100, 0.4, 'sawtooth', 0.15);
}

export function sfxSlash() {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.value = 0.1;
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

export function sfxPeshi() {
  playTone(400, 0.05, 'square', 0.1);
  setTimeout(() => playTone(300, 0.08, 'square', 0.1), 50);
}

export function sfxJump() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

export function sfxStar() {
  playTone(1047, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(1319, 0.15, 'sine', 0.1), 80);
}

export function sfxPoopStep() {
  playTone(150, 0.3, 'sawtooth', 0.1);
}

export function sfxFlush() {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * 1.0;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate;
    data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - t) * 0.3
      + Math.sin(t * 200 * (1 - t * 0.5)) * 0.1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
}

export function sfxGhost() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.6);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.6);
}

export function sfxFart() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(80, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
  gain2.gain.setValueAtTime(0.06, ctx.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start();
  osc2.stop(ctx.currentTime + 0.25);
}

export function sfxClear() {
  playNotes([
    [523, 0.5], [659, 0.5], [784, 0.5], [1047, 1],
  ], 200);
}

export function sfxDrumroll(durationMs = 1500) {
  const steps = Math.floor(durationMs / 50);
  for (let i = 0; i < steps; i++) {
    setTimeout(() => playTone(200 + Math.random() * 100, 0.04, 'square', 0.06), i * 50);
  }
}

// BGM - simple looping melody
let bgmInterval = null;

export function startBGM(stageId) {
  stopBGM();
  const melodies = {
    title: [[523, 1], [587, 1], [659, 1], [523, 1]],
    1: [[262, 0.5], [294, 0.5], [330, 0.5], [294, 0.5]],
    2: [[330, 0.5], [370, 0.5], [392, 0.5], [370, 0.5]],
    3: [[392, 0.5], [440, 0.5], [494, 0.5], [440, 0.5]],
    4: [[523, 0.5], [587, 0.5], [659, 0.5], [784, 0.5]],
    5: [[659, 0.5], [784, 0.5], [880, 0.5], [784, 0.5]],
    6: [[523, 0.5], [440, 0.5], [392, 0.5], [330, 0.5]],
    7: [[220, 1], [196, 1], [175, 1], [165, 1]],
    8: [[330, 0.5], [392, 0.5], [440, 0.5], [523, 0.5]],
    9: [[440, 0.5], [523, 0.5], [659, 0.5], [523, 0.5]],
  };
  const melody = melodies[stageId] || melodies.title;
  let noteIdx = 0;
  const playNext = () => {
    const [freq, beats] = melody[noteIdx % melody.length];
    playTone(freq, beats * 0.4, 'triangle', 0.04);
    noteIdx++;
  };
  playNext();
  bgmInterval = setInterval(playNext, 600);
}

export function stopBGM() {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
}
