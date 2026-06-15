import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import { Language } from '../utils/i18n';

interface HeartbeatMetronomeProps {
  status: 'idle' | 'playing' | 'won' | 'lost';
  time: number;
  lang: Language;
  theme?: 'classic' | 'cyberpunk';
}

export default function HeartbeatMetronome({
  status,
  time,
  lang,
  theme = 'classic',
}: HeartbeatMetronomeProps) {
  const [isActive, setIsActive] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Calculate BPM based on same formula as Heartbeat monitor parts
  const getBpm = () => {
    if (status === 'idle') return 60;
    if (status === 'won') return 45;
    if (status === 'lost') return 0;
    return Math.round(120 / Math.max(0.4, 2 - (time / 60)));
  };

  const bpm = getBpm();

  // Dynamic swing period in seconds: 60 / BPM gives the time for one tick/swing segment
  // Complete period (back and forth) is 2 * (60 / BPM) = 120 / BPM
  const swingDuration = bpm > 0 ? `${120 / bpm}s` : '0s';

  // Tick Sound trigger on interval
  useEffect(() => {
    if (!isAudioEnabled || bpm === 0 || status === 'idle' || status === 'won' || status === 'lost') {
      return;
    }

    const intervalTime = (60 / bpm) * 1000;
    let audioContext: AudioContext | null = null;

    const playTick = () => {
      try {
        if (!audioContext) {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.type = 'sine';
        // Alternate tone or high pitch click
        osc.frequency.setValueAtTime(bpm > 165 ? 1200 : 800, audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.015, audioContext.currentTime);
        // Quick decay
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.08);

        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
      } catch (err) {
        console.warn('Web Audio tick failed:', err);
      }
    };

    // Play tick immediately and schedule subsequent ticks
    playTick();
    const tickInterval = setInterval(playTick, intervalTime);

    return () => {
      clearInterval(tickInterval);
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isAudioEnabled, bpm, status]);

  return (
    <div className={`w-full mt-2 border-t pt-1.5 transition-all duration-300 ${
      theme === 'cyberpunk' ? 'border-[#ff0055]/20' : 'border-slate-200/60'
    }`}>
      {/* Control bar */}
      <div className="flex items-center justify-between font-mono text-[8.5px] leading-none mb-1 text-slate-500">
        <button
          id="btn-metronome-active-toggle"
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-1 py-0.5 px-1.5 rounded transition-colors duration-200 ${
            theme === 'cyberpunk'
              ? isActive ? 'text-[#ff0055] bg-[#ff0055]/10 font-bold' : 'text-slate-500 hover:text-[#ff0055]/80'
              : isActive ? 'text-red-500 bg-red-50 font-bold border border-red-200/50' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {isActive ? <Eye size={10} /> : <EyeOff size={10} />}
          <span>{lang === 'en' ? 'METRONOME' : '節拍器狀態'}</span>
        </button>

        {isActive && bpm > 0 && (
          <button
            id="btn-metronome-audio-toggle"
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-1 rounded transition-colors ${
              theme === 'cyberpunk'
                ? isAudioEnabled ? 'text-[#39ff14]/90 hover:bg-[#39ff14]/10' : 'text-slate-500 hover:text-slate-300'
                : isAudioEnabled ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-slate-600'
            }`}
            title={lang === 'en' ? 'Toggle Tick Sound' : '切換嘀嗒音效'}
          >
            {isAudioEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />}
          </button>
        )}
      </div>

      {/* Visual metronome playground */}
      {isActive && (
        <div className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 relative overflow-hidden h-14 ${
          theme === 'cyberpunk'
            ? 'bg-black/50 border border-[#ff0055]/15'
            : 'bg-slate-100/40 border border-slate-200/40'
        }`}>
          {/* Pendulum Swing Box */}
          {bpm > 0 ? (
            <div className="w-12 h-10 flex justify-center items-end relative">
              {/* Pivoting frame base anchor (triangular guide) */}
              <div className={`absolute bottom-0 w-8 h-8 opacity-20 border-b border-l border-r rounded-t-sm ${
                theme === 'cyberpunk' ? 'border-[#ff0055]' : 'border-slate-400'
              }`} style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />

              {/* The swinging arm and weight */}
              <div 
                className="absolute w-0.5 bg-current origin-bottom"
                style={{
                  height: '28px',
                  bottom: '1px',
                  transformOrigin: 'bottom center',
                  color: theme === 'cyberpunk' ? '#ff0055' : '#ea4335',
                  animation: `metronome-swing ${swingDuration} ease-in-out infinite alternate`,
                }}
              >
                {/* Visual copper slide weight */}
                <div className={`absolute w-2 h-2.5 -left-[3.75px] rounded-xs shadow-xs ${
                  theme === 'cyberpunk' 
                    ? 'bg-[#39ff14] border border-[#39ff14]/50' 
                    : 'bg-amber-600 border border-amber-700'
                }`} style={{ top: '10px' }} />

                {/* Pendulum head indicator */}
                <div className="absolute w-1 h-1 -left-[1.75px] top-0 rounded-full bg-current" />
              </div>

              {/* Center point anchor pivot bolt */}
              <div className={`absolute bottom-0 w-1.5 h-1.5 rounded-full ${
                theme === 'cyberpunk' ? 'bg-[#ff0055]' : 'bg-slate-500'
              }`} />
            </div>
          ) : (
            <div className="text-[8px] font-mono opacity-50 tracking-wider">
              {lang === 'en' ? '[ FLATLINE - HALTED ]' : '[ 直線心率 - 已停止 ]'}
            </div>
          )}

          {/* Miniature speed text indicator */}
          {bpm > 0 && (
            <div className={`text-[7px] font-mono tracking-wider absolute bottom-0.5 right-1.5 ${
              theme === 'cyberpunk' ? 'text-[#39ff14]' : 'text-slate-400'
            }`}>
              {bpm} BPM
            </div>
          )}
        </div>
      )}

      {/* Embedded pendulum keyframe styles directly in component to avoid modifying globals */}
      <style>{`
        @keyframes metronome-swing {
          0% {
            transform: rotate(-28deg);
          }
          100% {
            transform: rotate(28deg);
          }
        }
      `}</style>
    </div>
  );
}
