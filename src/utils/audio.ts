/**
 * Dynamic Synthesizer Audio Effects using Web Audio API
 * Avoids loading large audio asset files, is extremely fast & works offline.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let _masterVolume = 1.0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // Standard AudioContext initialization on first interaction
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = _masterVolume;
      masterGain.connect(audioCtx.destination);
    }
  }
  // Resume context if suspended (browser security autoplay policy)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const setMasterVolume = (volume: number) => {
  _masterVolume = volume;
  if (masterGain && audioCtx) {
    // Smoothly transition volume to avoid popping
    masterGain.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.05);
  }
};

export const playSound = {
  click: (enabled: boolean) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(masterGain!);

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
    gain.connect(masterGain!);

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
    gain.connect(masterGain!);

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
    gain.connect(masterGain!);

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
    gainOsc.connect(masterGain!);

    noise.connect(filter);
    filter.connect(gainNoise);
    gainNoise.connect(masterGain!);

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
      gain.connect(masterGain!);

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
      gain.connect(masterGain!);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.07);

      gain.gain.setValueAtTime(0.0, ctx.currentTime + index * 0.07);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + index * 0.07 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + index * 0.07 + duration + 0.1);

      osc.start(ctx.currentTime + index * 0.07);
      osc.stop(ctx.currentTime + index * 0.07 + duration + 0.15);
    });
  },

  jiaoBass: (enabled: boolean) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, ctx.currentTime); // A2 note
    osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.3); // Drop to A1

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55, ctx.currentTime);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(masterGain!);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.start();
    subOsc.start();
    osc.stop(ctx.currentTime + 0.4);
    subOsc.stop(ctx.currentTime + 0.4);
  },

  hologramRise: (enabled: boolean) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.45); // Ascending octave sweep

    filter.type = 'peaking';
    filter.Q.value = 8;
    filter.frequency.setValueAtTime(220, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain!);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.45);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  },

  cyberChyme: (enabled: boolean) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Sparkling raindrop frequencies representing digital crystals (E5 -> G#5 -> B5 -> E6)
    const tones = [659.25, 830.61, 987.77, 1318.51];
    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);

      osc.connect(gain);
      gain.connect(masterGain!);

      gain.gain.setValueAtTime(0.0, ctx.currentTime + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.25);

      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.3);
    });
  },

  antiExplosion: (enabled: boolean) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // A beautiful 180-phase frequency sweep representing an active "anti-mine energy shield" (from low hum to high shield ping)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(120, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(121, ctx.currentTime); // slightly detuned for deep rich phasing Chorus
    osc2.frequency.exponentialRampToValueAtTime(1198, ctx.currentTime + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGain!);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 0.6);
  },

  quantumTides: (enabled: boolean) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // A lush slow-blooming frequency swell representing serene quantum states
    const chord = [293.66, 440.00, 587.33, 739.99]; // D major chord variants
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      osc.connect(gain);
      gain.connect(masterGain!);

      // Deep swell envelope: slow rise, long sustain, smooth decay
      gain.gain.setValueAtTime(0.0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);

      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    });
  },

  heartbeat: (enabled: boolean) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Low frequency thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain!);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  },

  glitch: (enabled: boolean) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // High frequency chaotic glitch squeaks
    for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(masterGain!);

        osc.type = Math.random() > 0.5 ? 'sawtooth' : 'square';
        const startFreq = 2500 + Math.random() * 4000;
        const endFreq = 1000 + Math.random() * 2000;
        
        osc.frequency.setValueAtTime(startFreq, ctx.currentTime + i * 0.03);
        osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + i * 0.03 + 0.03);

        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.03);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.03 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.03 + 0.03);

        osc.start(ctx.currentTime + i * 0.03);
        osc.stop(ctx.currentTime + i * 0.03 + 0.04);
    }
  },

  comboMultiplier: (enabled: boolean, multiplier: number) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Ascending harmonic chime based on multiplier
    // Multiplier is usually 2, 3, 5, 10
    // Base scale (C pentatonic): C5, D5, E5, G5, A5, C6
    const baseFreq = 523.25; // C5
    const intervals = [1, 9/8, 5/4, 3/2, 5/3, 2];
    
    // Choose notes count and speed based on multiplier
    const count = Math.min(Math.max(2, Math.floor(multiplier * 1.5)), 6);
    const duration = 0.1;
    const intervalTime = 0.08;

    for (let i = 0; i < count; i++) {
        const freqIndex = Math.min(i, intervals.length - 1);
        const freq = baseFreq * intervals[freqIndex] * (Math.max(1, multiplier / 4)); // Shift octave slightly up for big multipliers
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(masterGain!);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * intervalTime);

        gain.gain.setValueAtTime(0.0, ctx.currentTime + i * intervalTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * intervalTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * intervalTime + duration + 0.05);

        osc.start(ctx.currentTime + i * intervalTime);
        osc.stop(ctx.currentTime + i * intervalTime + duration + 0.1);
    }
  }
};
