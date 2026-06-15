import React, { useEffect, useState, useRef } from 'react';

interface UrgencyLogProps {
  status: 'idle' | 'playing' | 'won' | 'lost';
  time: number;
  theme?: 'classic' | 'cyberpunk';
}

interface LogEntry {
  id: string;
  timestamp: string;
  bpm: number;
  message: string;
  type: 'nominal' | 'elevated' | 'tachycardia' | 'critical' | 'serene' | 'flatline' | 'standby';
}

export default function UrgencyLog({ status, time, theme = 'classic' }: UrgencyLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  // Helper to format simulated or live local time
  const getTimestamp = () => {
    const now = new Date();
    const hrs = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const secs = now.getSeconds().toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // Determine diagnostic status details based on current game time and status
  const getDiagnosticStatus = (currentTime: number) => {
    if (status === 'idle') {
      return {
        bpm: 60,
        message: 'SYS: STANDBY / NOMINAL',
        type: 'standby' as const
      };
    }
    if (status === 'won') {
      return {
        bpm: 45,
        message: 'COMPLETED: HOMEOSM',
        type: 'serene' as const
      };
    }
    if (status === 'lost') {
      return {
        bpm: 0,
        message: 'ALERT: FLATLINE DETECTED',
        type: 'flatline' as const
      };
    }

    // Calculating dynamic BPM based on accelerating heartbeat multiplier
    const bpm = Math.round(120 / Math.max(0.4, 2 - (currentTime / 60)));

    if (bpm < 80) {
      return {
        bpm,
        message: 'SYS_OK: SLOW_STEADY',
        type: 'nominal' as const
      };
    } else if (bpm < 130) {
      return {
        bpm,
        message: 'WARN: PACED_STEADY',
        type: 'elevated' as const
      };
    } else if (bpm < 220) {
      return {
        bpm,
        message: 'ERR: TACHYCARDIC_FLUX',
        type: 'tachycardia' as const
      };
    } else {
      return {
        bpm,
        message: 'CRT: DANGER_LIMIT_RUSH',
        type: 'critical' as const
      };
    }
  };

  // Handle updates when status changes or play timer evolves
  useEffect(() => {
    const currentDiag = getDiagnosticStatus(time);
    
    // Add new log entry
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: getTimestamp(),
      bpm: currentDiag.bpm,
      message: currentDiag.message,
      type: currentDiag.type
    };

    setLogs((prev) => {
      // Keep only last 15 elements to prevent bloating
      const nextLogs = [...prev, newEntry];
      return nextLogs.slice(-15);
    });
  }, [status, time]);

  // Scroll to bottom whenever new logs are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Styling helpers
  const getColorClass = (type: LogEntry['type']) => {
    if (theme === 'cyberpunk') {
      switch (type) {
        case 'nominal': return 'text-[#39ff14]';
        case 'elevated': return 'text-[#ffea00]';
        case 'tachycardia': return 'text-[#ff00a2]';
        case 'critical': return 'text-red-500 font-extrabold animate-pulse';
        case 'serene': return 'text-[#00ffff]';
        case 'flatline': return 'text-red-600 font-bold border-r pr-1 border-red-600 animate-pulse';
        case 'standby': return 'text-[#9d4edd]';
        default: return 'text-slate-400';
      }
    } else {
      switch (type) {
        case 'nominal': return 'text-green-600';
        case 'elevated': return 'text-amber-500';
        case 'tachycardia': return 'text-orange-600';
        case 'critical': return 'text-red-600 font-semibold';
        case 'serene': return 'text-blue-500';
        case 'flatline': return 'text-red-700 animate-pulse';
        case 'standby': return 'text-slate-500';
        default: return 'text-slate-400';
      }
    }
  };

  return (
    <div className={`w-full mt-2 border-t pt-1.5 transition-colors duration-300 ${
      theme === 'cyberpunk' ? 'border-[#ff0055]/20' : 'border-slate-200/60'
    }`}>
      {/* Scrollable diagnostic panel screen */}
      <div 
        ref={logContainerRef}
        className={`w-full h-11 overflow-y-auto scrollbar-none font-mono text-[8px] leading-tight flex flex-col gap-0.5 select-none transition-all duration-300 ${
          theme === 'cyberpunk' 
            ? 'text-[#ff0055]/70 bg-black/40 p-1 rounded-md' 
            : 'text-slate-500 bg-slate-100/30 p-1 rounded-md'
        }`}
        style={{ scrollBehavior: 'smooth' }}
      >
        {logs.length === 0 ? (
          <div className="text-center italic opacity-40">INITIALIZING TELEMETRY...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-1 justify-between tracking-tighter">
              <span className="opacity-40 shrink-0">[{log.timestamp}]</span>
              <span className="font-semibold truncate text-left max-w-[70px]">{log.message}</span>
              <span className={`shrink-0 font-bold ${getColorClass(log.type)}`}>
                {log.bpm > 0 ? `${log.bpm} bpm` : '---'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
