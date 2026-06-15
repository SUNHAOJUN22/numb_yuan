import React, { useState, useEffect } from 'react';
import { Gauge } from 'lucide-react';
import { Language } from '../utils/i18n';

interface HeartbeatBpmGaugeProps {
  status: 'idle' | 'playing' | 'won' | 'lost';
  time: number;
  lang: Language;
  theme?: 'classic' | 'cyberpunk';
}

export default function HeartbeatBpmGauge({
  status,
  time,
  lang,
  theme = 'classic',
}: HeartbeatBpmGaugeProps) {
  const [showGauge, setShowGauge] = useState(true);

  // 1. Calculate current BPM
  const getBpm = () => {
    if (status === 'idle') return 60;
    if (status === 'won') return 45;
    if (status === 'lost') return 0;
    return Math.round(120 / Math.max(0.4, 2 - (time / 60)));
  };

  const bpm = getBpm();

  // 2. Map BPM to needle rotation angle
  // Map range: 40 BPM (leftmost, -180 deg) to 220 BPM (rightmost, 0 deg)
  const minBpm = 40;
  const maxBpm = 220;
  const clampedBpm = Math.min(maxBpm, Math.max(minBpm, bpm));
  const percentage = (clampedBpm - minBpm) / (maxBpm - minBpm);
  const angle = -180 + percentage * 180; // Angle from -180 to 0 (flat semicircle facing up)

  // Labels for theme & localization
  const currentLabel = lang === 'en' ? 'PULSE STRESS' : '心率脅迫比';

  const greenColor = theme === 'cyberpunk' ? '#39ff14' : '#22c55e';
  const yellowColor = theme === 'cyberpunk' ? '#f5fb31' : '#eab308';
  const orangeColor = theme === 'cyberpunk' ? '#ff9900' : '#f97316';
  const redColor = theme === 'cyberpunk' ? '#ff0055' : '#ef4444';
  const axisColor = theme === 'cyberpunk' ? '#ff0055/50' : '#cbd5e1';

  return (
    <div className={`w-full mt-1.5 border-t pt-1.5 transition-all duration-300 ${
      theme === 'cyberpunk' ? 'border-[#ff0055]/20' : 'border-slate-200/60'
    }`}>
      {/* Control bar */}
      <div className="flex items-center justify-between font-mono text-[8.5px] leading-none mb-1 text-slate-500">
        <button
          id="btn-bpm-gauge-active-toggle"
          onClick={() => setShowGauge(!showGauge)}
          className={`flex items-center gap-1 py-0.5 px-1.5 rounded transition-colors duration-200 ${
            theme === 'cyberpunk'
              ? 'hover:text-[#ff0055]/80 text-slate-400'
              : 'hover:text-slate-800 text-slate-500'
          }`}
        >
          <Gauge size={10} className={status === 'playing' ? 'animate-pulse' : ''} />
          <span>{lang === 'en' ? 'PULSE GAUGE' : '心率儀表板'}</span>
        </button>
        <span className="text-[7.5px] opacity-60">
          {bpm > 150 ? (lang === 'en' ? 'CRITICAL' : '極限') : (lang === 'en' ? 'NOMINAL' : '正常')}
        </span>
      </div>

      {showGauge && (
        <div className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all duration-300 relative overflow-hidden ${
          theme === 'cyberpunk'
            ? 'bg-black/55 border border-[#ff0055]/15'
            : 'bg-slate-100/30 border border-slate-200/30'
        }`}>
          {/* Medical Gauge SVG */}
          <div className="relative w-28 h-12 flex items-center justify-center pt-2">
            <svg width="100" height="50" viewBox="0 0 100 50" className="overflow-visible">
              {/* Semicircular Arc Track - split into segments */}
              {/* Radius = 40, Center = (50, 48) */}
              
              {/* 1. Zen/Low Range: 40 to 85 BPM */}
              <path
                d="M 10 48 A 40 40 0 0 1 21.7 19.7"
                fill="none"
                stroke={greenColor}
                strokeWidth="4"
                className="opacity-70"
              />
              {/* 2. Stable Range: 85 to 130 BPM */}
              <path
                d="M 21.7 19.7 A 40 40 0 0 1 50 8"
                fill="none"
                stroke={yellowColor}
                strokeWidth="4"
                className="opacity-70"
              />
              {/* 3. Panic Range: 130 to 175 BPM */}
              <path
                d="M 50 8 A 40 40 0 0 1 78.3 19.7"
                fill="none"
                stroke={orangeColor}
                strokeWidth="4"
                className="opacity-70"
              />
              {/* 4. Critical Range: 175 to 220 BPM */}
              <path
                d="M 78.3 19.7 A 40 40 0 0 1 90 48"
                fill="none"
                stroke={redColor}
                strokeWidth="4"
                className="opacity-80"
              />

              {/* Major grid lines / ticks */}
              <line x1="10" y1="48" x2="14" y2="48" stroke={theme === 'cyberpunk' ? '#ff0055' : axisColor} strokeWidth="1" />
              <line x1="21.7" y1="19.7" x2="24.5" y2="22.5" stroke={theme === 'cyberpunk' ? '#ff0055' : axisColor} strokeWidth="1" />
              <line x1="50" y1="8" x2="50" y2="12" stroke={theme === 'cyberpunk' ? '#ff0055' : axisColor} strokeWidth="1" />
              <line x1="78.3" y1="19.7" x2="75.5" y2="22.5" stroke={theme === 'cyberpunk' ? '#ff0055' : axisColor} strokeWidth="1" />
              <line x1="90" y1="48" x2="86" y2="48" stroke={theme === 'cyberpunk' ? '#ff0055' : axisColor} strokeWidth="1" />

              {/* Needle rotating group */}
              <g transform="translate(50, 48)">
                <g transform={`rotate(${angle})`}>
                  {/* Outer tapering needle indicator */}
                  <line 
                    x1="0" 
                    y1="0" 
                    x2="42" 
                    y2="0" 
                    stroke={bpm > 150 ? redColor : theme === 'cyberpunk' ? '#39ff14' : '#1e293b'} 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                    className="transition-transform duration-300 ease-out"
                  />
                  {/* Subtle triangle arrow pointer */}
                  <polygon 
                    points="42,0 36,-1.5 36,1.5" 
                    fill={bpm > 150 ? redColor : theme === 'cyberpunk' ? '#39ff14' : '#1e293b'}
                  />
                </g>
                
                {/* Center Pivot Hub */}
                <circle cx="0" cy="0" r="4" fill={theme === 'cyberpunk' ? '#0f172a' : '#f1f5f9'} stroke={theme === 'cyberpunk' ? '#ff0055' : '#64748b'} strokeWidth="1.5" />
                <circle cx="0" cy="0" r="1.5" fill={bpm > 150 ? redColor : theme === 'cyberpunk' ? '#39ff14' : '#1e293b'} />
              </g>
            </svg>
            
            {/* Legend labels */}
            <div className="absolute left-1 bottom-0 font-mono text-[6px] opacity-40">40</div>
            <div className="absolute right-1 bottom-0 font-mono text-[6px] opacity-40">220+</div>
          </div>

          {/* Stress percentage description bar */}
          <div className="w-full flex items-center justify-between font-mono text-[7.5px] mt-1 px-1">
            <span className="opacity-50">{currentLabel}</span>
            <span className={`font-black ${
              bpm > 150 ? 'text-red-500 animate-pulse' : theme === 'cyberpunk' ? 'text-[#39ff14]' : 'text-slate-700'
            }`}>
              {bpm > 0 ? `${Math.round(((bpm - minBpm) / (maxBpm - minBpm)) * 100)}%` : '0%'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
