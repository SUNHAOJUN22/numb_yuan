/**
 * Dynamic Synthesizer Audio Effects using Web Audio API
 * Avoids loading large audio asset files, is extremely fast & works offline.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // Standard AudioContext initialization on first interaction
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // Resume context if suspended (browser security autoplay policy)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playSound = {
  click: (enabled: boolean) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  },

  flag: (enabled: boolean) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  },

  unflag: (enabled: boolean) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  },

  cascade: (enabled: boolean, depth: number = 0) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    // Cascades increase in pitch slightly as tiles reveal
    const startFreq = Math.min(800 + depth * 35, 1500);
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq - 150, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  },

  explosion: (enabled: boolean) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Create a synthesized rumble + crash sound using low oscillator + noise
    const osc = ctx.createOscillator();
    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gainOsc = ctx.createGain();
    const gainNoise = ctx.createGain();

    // Create white noise buffer
    const bufferSize = ctx.sampleRate * 1.5; // 1.5 seconds
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuffer;

    // Distort noise for dramatic crash
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 1.2);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.0);

    // Routings
    osc.connect(gainOsc);
    gainOsc.connect(ctx.destination);

    noise.connect(filter);
    filter.connect(gainNoise);
    gainNoise.connect(ctx.destination);

    // Audio envelope setup
    gainOsc.gain.setValueAtTime(0.3, ctx.currentTime);
    gainOsc.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);

    gainNoise.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNoise.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

    osc.start();
    osc.stop(ctx.currentTime + 1.1);

    noise.start();
    noise.stop(ctx.currentTime + 1.6);
  },

  win: (enabled: boolean) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Play a delightful Google-style 5-note fanfare (e.g., C4, E4, G4, C5, E5)
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
    const duration = 0.12;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);

      gain.gain.setValueAtTime(0.0, ctx.currentTime + index * 0.1);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + index * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.1 + duration + 0.05);

      osc.start(ctx.currentTime + index * 0.1);
      osc.stop(ctx.currentTime + index * 0.1 + duration + 0.08);
    });
  },

  easterEgg: (enabled: boolean) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // A beautiful soaring arpeggio representing Jiao Ge's ultimate wisdom (C5 -> D5 -> E5 -> G5 -> A5 -> C6)
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const duration = 0.15;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.07);

      gain.gain.setValueAtTime(0.0, ctx.currentTime + index * 0.07);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + index * 0.07 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + index * 0.07 + duration + 0.1);

      osc.start(ctx.currentTime + index * 0.07);
      osc.stop(ctx.currentTime + index * 0.07 + duration + 0.15);
    });
  }
};
