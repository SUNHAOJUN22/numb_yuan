import React, { useEffect, useRef } from 'react';

interface HeartbeatWaveformProps {
  status: 'idle' | 'playing' | 'won' | 'lost';
  time: number;
  theme?: 'classic' | 'cyberpunk';
  soundEnabled?: boolean;
}

export default function HeartbeatWaveform({ status, time, theme = 'classic', soundEnabled = true }: HeartbeatWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width;
    let height = canvas.height;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 120 * dpr;
    canvas.height = 36 * dpr;
    ctx.scale(dpr, dpr);
    width = 120;
    height = 36;

    // Animation state
    let phase = 0; // 0 to 1 representing one complete heartbeat cycle
    let lastTime = performance.now();

    // Create a history of previous waveform points for trace rendering
    const historyLength = 60;
    const points: number[] = new Array(historyLength).fill(height / 2);

    const draw = (now: number) => {
      const delta = (now - lastTime) / 1000; // in seconds
      lastTime = now;

      // Heartbeat duration matched perfectly with the CSS and audio timers
      // duration starts at 2s and ramps down toward 0.4s as time increases
      const pulseDuration = status === 'playing' ? Math.max(0.4, 2 - (time / 60)) : 1.5;

      // Increment phase
      if (status === 'playing') {
        phase += delta / pulseDuration;
        if (phase >= 1.0) {
          phase = phase % 1.0;
        }
      } else if (status === 'won' || status === 'lost') {
        // Flatline or highly static based on outcome
        phase = 0;
      } else {
        // Idle normal hovering pace
        phase += delta / pulseDuration;
        if (phase >= 1.0) {
          phase = phase % 1.0;
        }
      }

      // Calculate the current amplitude at the leading edge of the waveform
      // Traditional ECG shape components:
      // 0.0 - 0.2: Isoelectric baseline
      // 0.2 - 0.3: P-Wave (minor positive deflection)
      // 0.3 - 0.35: PR-segment (baseline)
      // 0.35 - 0.38: Q-Wave (slight downward dip)
      // 0.38 - 0.43: R-Wave (massive upward peak)
      // 0.43 - 0.46: S-Wave (deep downward dip)
      // 0.46 - 0.55: ST-Segment (baseline)
      // 0.55 - 0.7: T-Wave (medium positive deflection)
      // 0.7 - 1.0: Baseline
      let yOffset = 0;
      const p = phase;

      if (status === 'lost') {
        // Complete block flatline!
        yOffset = 0;
      } else if (status === 'won') {
        // Smooth serene rhythmic gentle wave
        yOffset = Math.sin(p * Math.PI * 2) * 2;
      } else {
        // Formulate EKG pulses
        if (p >= 0.15 && p < 0.25) {
          // P Wave
          const pPhase = (p - 0.15) / 0.1;
          yOffset = Math.sin(pPhase * Math.PI) * 2.5;
        } else if (p >= 0.32 && p < 0.35) {
          // Q Wave
          const qPhase = (p - 0.32) / 0.03;
          yOffset = -qPhase * 2;
        } else if (p >= 0.35 && p < 0.4) {
          // R Wave
          const rPhase = (p - 0.35) / 0.05;
          yOffset = Math.sin(rPhase * Math.PI) * 14; // High spike
        } else if (p >= 0.4 && p < 0.44) {
          // S Wave
          const sPhase = (p - 0.4) / 0.04;
          yOffset = -Math.sin(sPhase * Math.PI) * 4.5; // Deep dip
        } else if (p >= 0.52 && p < 0.68) {
          // T Wave
          const tPhase = (p - 0.52) / 0.16;
          yOffset = Math.sin(tPhase * Math.PI) * 4;
        }
      }

      // Shift existing points left
      points.shift();
      // Push new leading edge point
      const midY = height / 2;
      points.push(midY - yOffset);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Draw grid background (EKG paper style)
      ctx.strokeStyle = theme === 'cyberpunk' ? 'rgba(255, 0, 85, 0.05)' : 'rgba(0, 0, 0, 0.03)';
      ctx.lineWidth = 0.5;
      
      const gridSize = 6;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Plot waveform trace with trailing glow
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const pulseColor = theme === 'cyberpunk' ? '#ff0055' : '#ea4335';
      
      // Cyber glow effect
      if (theme === 'cyberpunk') {
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(255, 0, 85, 0.8)';
      } else {
        ctx.shadowBlur = 1;
        ctx.shadowColor = 'rgba(234, 67, 53, 0.4)';
      }

      // We paint the lines connecting our history array
      ctx.lineWidth = 1.75;
      ctx.strokeStyle = pulseColor;

      for (let i = 0; i < points.length; i++) {
        const posX = (i / (points.length - 1)) * width;
        const posY = points[i];
        if (i === 0) {
          ctx.moveTo(posX, posY);
        } else {
          ctx.lineTo(posX, posY);
        }
      }
      ctx.stroke();

      // Reset shadows for background dot
      ctx.shadowBlur = 0;

      // 3. Render leading indicator blip at the end of trace
      if (points.length > 0) {
        const endX = width;
        const endY = points[points.length - 1];
        
        ctx.beginPath();
        ctx.arc(endX - 2, endY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = pulseColor;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [status, time, theme]);

  // Audio Siren hook when time reaches 900 seconds
  useEffect(() => {
    const isAlarmActive = status === 'playing' && time >= 900 && soundEnabled;

    let audioCtx: AudioContext | null = null;
    let osc: OscillatorNode | null = null;
    let lfo: OscillatorNode | null = null;
    let gainNode: GainNode | null = null;

    if (isAlarmActive) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          audioCtx = new AudioCtxClass();
          osc = audioCtx.createOscillator();
          lfo = audioCtx.createOscillator();
          const lfoGain = audioCtx.createGain();
          gainNode = audioCtx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(600, audioCtx.currentTime); // base freq

          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(2.0, audioCtx.currentTime); // oscillates twice a second
          lfoGain.gain.setValueAtTime(300, audioCtx.currentTime); // sweeps between 300Hz and 900Hz

          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 1.0); // smooth entry

          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          osc.start();
          lfo.start();
        }
      } catch (err) {
        console.warn('Emergency Siren audio initialization failed:', err);
      }
    }

    return () => {
      if (gainNode && audioCtx) {
        try {
          const currentGain = gainNode.gain.value;
          gainNode.gain.setValueAtTime(currentGain, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
          setTimeout(() => {
            try {
              osc?.stop();
              osc?.disconnect();
              lfo?.stop();
              lfo?.disconnect();
              gainNode?.disconnect();
              audioCtx?.close();
            } catch (err) {
              // ignore
            }
          }, 600);
        } catch (e) {
          // ignore
        }
      }
    };
  }, [status, time >= 900, soundEnabled]);

  const showSirenAlarm = status === 'playing' && time >= 900;

  return (
    <div className={`w-full flex flex-col items-center justify-center mt-1 relative p-1 rounded-lg transition-all duration-300 ${
      showSirenAlarm 
        ? theme === 'cyberpunk'
          ? 'bg-red-950/20 border border-red-500/50 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.4)]'
          : 'bg-red-50 border border-red-300/60 animate-pulse'
        : 'bg-transparent'
    }`}>
      <canvas
        ref={canvasRef}
        style={{ width: '120px', height: '36px' }}
        className="block bg-transparent select-none pointer-events-none z-10"
      />
      
      {showSirenAlarm && (
        <span className={`text-[7px] font-mono font-bold tracking-widest mt-1 uppercase animate-pulse shrink-0 ${
          theme === 'cyberpunk' 
            ? 'text-red-400 drop-shadow-[0_0_1px_rgba(239,68,68,0.6)]' 
            : 'text-red-600'
        }`}>
          ⚠️ EMERGENCY SIREN ACTIVE ⚠️
        </span>
      )}
    </div>
  );
}
