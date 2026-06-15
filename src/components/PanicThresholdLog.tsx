import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Terminal, Sparkles, AlertTriangle } from 'lucide-react';
import { Language } from '../utils/i18n';

interface PanicThresholdLogProps {
  status: 'idle' | 'playing' | 'won' | 'lost';
  time: number;
  lang: Language;
  theme?: 'classic' | 'cyberpunk';
}

interface ThresholdBreach {
  id: string;
  gameTime: number; // in seconds
  realtime: string;
  bpm: number;
  labelEn: string;
  labelZh: string;
  severity: 'warning' | 'danger' | 'critical' | 'terminal';
  code: string;
}

export default function PanicThresholdLog({
  status,
  time,
  lang,
  theme = 'classic',
}: PanicThresholdLogProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [breaches, setBreaches] = useState<ThresholdBreach[]>([]);
  
  // Track which thresholds have already been recorded in this run
  const recordedRef = useRef<Set<string>>(new Set());

  // Helper to format live real-time
  const getFormattedTime = () => {
    const now = new Date();
    const hrs = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const secs = now.getSeconds().toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // Calculate BPM
  const getBpm = () => {
    if (status === 'idle') return 60;
    if (status === 'won') return 45;
    if (status === 'lost') return 0;
    return Math.round(120 / Math.max(0.4, 2 - (time / 60)));
  };

  const bpm = getBpm();

  // Reset log on game restart/idle
  useEffect(() => {
    if (status === 'idle') {
      setBreaches([]);
      recordedRef.current.clear();
    }
  }, [status]);

  // Check and log threshold breaches
  useEffect(() => {
    if (status !== 'playing') return;

    const currentBpm = bpm;
    const currentTime = time;

    const thresholds = [
      {
        id: 'bpm-90',
        check: () => currentBpm >= 90,
        labelEn: 'ELEVATED CARDIO PROFILE DETECTED',
        labelZh: '檢測到心率頻譜上升',
        severity: 'warning' as const,
        code: 'BPM-EV90',
      },
      {
        id: 'bpm-120',
        check: () => currentBpm >= 120,
        labelEn: 'TACHYCARDIA WAVEFORM ACTIVE',
        labelZh: '竇性心動過速波形激活',
        severity: 'warning' as const,
        code: 'BPM-TC120',
      },
      {
        id: 'bpm-150',
        check: () => currentBpm >= 150,
        labelEn: 'PANIC LIMIT TRIGGERED (EXCEEDS 150)',
        labelZh: '恐慌極限觸發 (超出 150 BPM)',
        severity: 'danger' as const,
        code: 'BPM-PN150',
      },
      {
        id: 'bpm-180',
        check: () => currentBpm >= 180,
        labelEn: 'CRITICAL HEARTBEAT FLUX LIMIT REVOLUTION',
        labelZh: '關鍵心尖顫動高能臨界負荷',
        severity: 'critical' as const,
        code: 'BPM-CRT180',
      },
      {
        id: 'bpm-210',
        check: () => currentBpm >= 210,
        labelEn: 'TERMINAL HEART RUNAWAY HYPER-CORE',
        labelZh: '終端超頻心泵失控性爆發',
        severity: 'terminal' as const,
        code: 'BPM-TRM210',
      },
      // Time milestones
      {
        id: 'time-300',
        check: () => currentTime >= 300,
        labelEn: '5-MINUTE SYSTEM RUNTIME SPEEDUP',
        labelZh: '五分鐘系統加乘：重力湍流',
        severity: 'warning' as const,
        code: 'TIM-SP300',
      },
      {
        id: 'time-600',
        check: () => currentTime >= 600,
        labelEn: '10-MINUTE EXTREMED QUANTUM CASCADE',
        labelZh: '十分鐘極限跨越：量子級聯疊加',
        severity: 'danger' as const,
        code: 'TIM-QC600',
      },
      {
        id: 'time-900',
        check: () => currentTime >= 900,
        labelEn: '15-MINUTE SYSTEM EMERGENCY SIREN ACTIVE',
        labelZh: '十五分鐘超時警報：防空級警笛全解析',
        severity: 'critical' as const,
        code: 'TIM-SRN900',
      },
    ];

    let updated = false;
    const newBreaches: ThresholdBreach[] = [];

    thresholds.forEach((t) => {
      if (t.check() && !recordedRef.current.has(t.id)) {
        recordedRef.current.add(t.id);
        const breach: ThresholdBreach = {
          id: `${t.id}-${currentTime}-${Date.now()}`,
          gameTime: currentTime,
          realtime: getFormattedTime(),
          bpm: currentBpm,
          labelEn: t.labelEn,
          labelZh: t.labelZh,
          severity: t.severity,
          code: t.code,
        };
        newBreaches.push(breach);
        updated = true;
      }
    });

    if (updated) {
      setBreaches((prev) => {
        // Prepend new breaches so that chronological order is latest first, or append. Let's do latest first!
        return [...newBreaches, ...prev];
      });
    }
  }, [bpm, time, status]);

  // Format game duration
  const formatGameTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const getSeverityBadge = (severity: ThresholdBreach['severity']) => {
    if (theme === 'cyberpunk') {
      switch (severity) {
        case 'warning': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
        case 'danger': return 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold';
        case 'critical': return 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40 font-extrabold animate-pulse';
        case 'terminal': return 'bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/40 font-black animate-ping';
      }
    } else {
      switch (severity) {
        case 'warning': return 'bg-amber-50 text-amber-600 border border-amber-200';
        case 'danger': return 'bg-orange-50 text-orange-600 border border-orange-200 font-semibold';
        case 'critical': return 'bg-red-50 text-red-600 border border-red-200 font-bold';
        case 'terminal': return 'bg-red-100 text-red-700 border border-red-350 font-extrabold animate-pulse';
      }
    }
  };

  return (
    <div className={`w-full mt-2 border-t pt-1.5 transition-all duration-300 ${
      theme === 'cyberpunk' ? 'border-[#ff0055]/20' : 'border-slate-200/60'
    }`}>
      {/* Header bar */}
      <div className="flex items-center justify-between font-mono text-[8.5px] leading-none mb-1 text-slate-500">
        <button
          id="btn-panic-threshold-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1 py-0.5 px-1.5 rounded transition-colors duration-200 ${
            theme === 'cyberpunk'
              ? isOpen ? 'text-[#ff0055] bg-[#ff0055]/10 font-bold' : 'text-slate-500 hover:text-[#ff0055]/80'
              : isOpen ? 'text-red-500 bg-red-50 font-bold border border-red-200/50' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert size={10} className={status === 'playing' && bpm > 150 ? 'animate-bounce' : ''} />
          <span>{lang === 'en' ? 'FLIGHT RECO' : '黑盒子限溢日誌'}</span>
        </button>

        <span className="text-[7px] tracking-tight flex items-center gap-1 opacity-70">
          <Terminal size={7} />
          {breaches.length} {lang === 'en' ? 'BREACHES' : '次超出'}
        </span>
      </div>

      {/* Threshold incident Log view */}
      {isOpen && (
        <div className={`flex flex-col gap-1 p-1.5 rounded-lg transition-all duration-300 max-h-24 overflow-y-auto scrollbar-none ${
          theme === 'cyberpunk'
            ? 'bg-black/60 border border-[#ff0055]/15'
            : 'bg-slate-100/40 border border-slate-200/40'
        }`}>
          {breaches.length === 0 ? (
            <div className="text-center font-mono py-2 opacity-40 text-[7.5px] leading-relaxed flex flex-col items-center justify-center gap-1">
              {status === 'playing' ? (
                <>
                  <Sparkles size={10} className="animate-spin text-amber-500/80" />
                  <span>{lang === 'en' ? 'MONITORING PACING LEVEL...' : '對接實施全盤測量中...'}</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={10} className="opacity-30" />
                  <span>{lang === 'en' ? 'AWAITING MISSION START' : '等待局次激活日誌記錄'}</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {breaches.map((breach) => (
                <div 
                  key={breach.id} 
                  className={`flex flex-col gap-0.5 p-1 rounded font-mono text-[7.5px] leading-tight transition-all duration-200 ${
                    theme === 'cyberpunk' 
                      ? 'bg-black/40 border border-white/5' 
                      : 'bg-white/80 border border-slate-200/50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 overflow-hidden">
                    {/* Log Code and Timestamp */}
                    <div className="flex items-center gap-1">
                      <span className={`px-0.5 rounded-xs font-black text-[6.5px] ${getSeverityBadge(breach.severity)}`}>
                        {breach.code}
                      </span>
                      <span className="opacity-40">[{breach.realtime}]</span>
                    </div>

                    {/* Flight status metadata */}
                    <span className="opacity-60 font-bold">
                      {lang === 'en' ? `${breach.bpm} bpm` : `${breach.bpm} 心率`}
                    </span>
                  </div>

                  {/* Breach Detailed Incident Message */}
                  <div className={`font-semibold line-clamp-2 mt-0.5 uppercase ${
                    breach.severity === 'critical' || breach.severity === 'terminal'
                      ? theme === 'cyberpunk' ? 'text-red-400' : 'text-red-600'
                      : 'opacity-80'
                  }`}>
                    {lang === 'en' ? breach.labelEn : breach.labelZh}
                  </div>

                  {/* Game Time Index pointer */}
                  <div className="flex justify-between items-center text-[6px] opacity-40 border-t border-dashed border-current/10 pt-0.5 mt-0.5">
                    <span>T-INDEX: {formatGameTime(breach.gameTime)}</span>
                    <span>SEV: {breach.severity.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
