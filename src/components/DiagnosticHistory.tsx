import React, { useEffect, useState, useRef } from 'react';
import { DifficultyType } from '../types';
import { Language } from '../utils/i18n';
import { Activity, ShieldAlert, CheckCircle, XCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface DiagnosticHistoryProps {
  status: 'idle' | 'playing' | 'won' | 'lost';
  time: number;
  difficulty: DifficultyType;
  lang: Language;
  theme?: 'classic' | 'cyberpunk';
}

interface DiagnosticRecord {
  id: string;
  timestamp: string;
  difficulty: DifficultyType;
  finalTime: number;
  peakBpm: number;
  outcome: 'won' | 'lost';
  panicCategory: string;
  panicColorClass: string;
}

const LOCAL_STORAGE_KEY = 'google_minesweeper_diagnostic_history';

// Panic rating helper
const getPanicRating = (peakBpm: number, lang: Language) => {
  if (peakBpm <= 60) {
    return {
      label: lang === 'en' ? 'Zen Master' : '禪定大師',
      color: 'text-[#34a853]'
    };
  } else if (peakBpm <= 120) {
    return {
      label: lang === 'en' ? 'Stably Paced' : '穩定耐壓',
      color: 'text-[#4285f4]'
    };
  } else if (peakBpm <= 220) {
    return {
      label: lang === 'en' ? 'High Panic' : '極度慌亂',
      color: 'text-[#fbbc05]'
    };
  } else {
    return {
      label: lang === 'en' ? 'Critical Stress' : '臨界失控',
      color: 'text-[#ea4335]'
    };
  }
};

export default function DiagnosticHistory({
  status,
  time,
  difficulty,
  lang,
  theme = 'classic',
}: DiagnosticHistoryProps) {
  const [history, setHistory] = useState<DiagnosticRecord[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSessionPeak, setCurrentSessionPeak] = useState(60);

  const hasRecorded = useRef(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load diagnostic history', e);
    }
  }, []);

  // Save history to localStorage on change
  const saveHistory = (newHistory: DiagnosticRecord[]) => {
    try {
      setHistory(newHistory);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save diagnostic history', e);
    }
  };

  // 1. Live Tracking of the active game session's peak BPM
  useEffect(() => {
    if (status === 'playing') {
      // Calculate active BPM based on time elapsed
      const currentBpm = Math.round(120 / Math.max(0.4, 2 - (time / 60)));
      setCurrentSessionPeak((prev) => Math.max(prev, currentBpm));
      hasRecorded.current = false;
    } else if (status === 'idle') {
      // Warm reset current peak to standard baseline
      setCurrentSessionPeak(60);
      hasRecorded.current = false;
    }
  }, [status, time]);

  // 2. Capture completed game session status to history
  useEffect(() => {
    if ((status === 'won' || status === 'lost') && !hasRecorded.current) {
      const finalBpm = Math.max(60, currentSessionPeak);
      const rating = getPanicRating(finalBpm, lang);

      const now = new Date();
      const timestampString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const newRecord: DiagnosticRecord = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: timestampString,
        difficulty,
        finalTime: time,
        peakBpm: finalBpm,
        outcome: status,
        panicCategory: rating.label,
        panicColorClass: rating.color,
      };

      const updatedHistory = [newRecord, ...history].slice(0, 50); // Keep last 50 games
      saveHistory(updatedHistory);
      hasRecorded.current = true;
    }
  }, [status, currentSessionPeak]);

  const handleClearHistory = () => {
    saveHistory([]);
  };

  const getDifficultyLabel = (diff: DifficultyType) => {
    const labels: Record<DifficultyType, { en: string; zh: string }> = {
      kids: { en: 'Kid', zh: '極易' },
      easy: { en: 'Easy', zh: '簡單' },
      medium: { en: 'Medium', zh: '中等' },
      hard: { en: 'Hard', zh: '困難' },
      expert: { en: 'Expert', zh: '專家' },
    };
    return lang === 'en' ? labels[diff].en : labels[diff].zh;
  };

  // Calculate stats
  const totalGames = history.length;
  const maxPeakBpm = history.length > 0 ? Math.max(...history.map(r => r.peakBpm)) : 0;
  const avgPeakBpm = history.length > 0 
    ? Math.round(history.reduce((acc, r) => acc + r.peakBpm, 0) / history.length) 
    : 0;

  return (
    <div className={`w-full mt-2 select-none border-t pt-2 ${
      theme === 'cyberpunk' ? 'border-[#ff0055]/20' : 'border-slate-200/60'
    }`}>
      {/* Expand/Collapse Toggle Button */}
      <button
        id="btn-diagnostic-history-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider py-1 rounded transition-colors duration-200 ${
          theme === 'cyberpunk'
            ? 'text-[#ff0055] hover:bg-[#ff0055]/5'
            : 'text-slate-500 hover:bg-slate-100'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Activity size={11} className={status === 'playing' ? 'animate-pulse' : ''} />
          {lang === 'en' ? 'DIAGNOSTIC ARCHIVE' : '診斷報告紀錄'}
        </span>
        <span className="flex items-center gap-1">
          {history.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-semibold ${
              theme === 'cyberpunk' ? 'bg-[#ff0055]/10 text-[#ff0055]' : 'bg-red-50 text-red-500 border border-red-100'
            }`}>
              {history.length}
            </span>
          )}
          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </span>
      </button>

      {/* Expandable History Container */}
      {isExpanded && (
        <div className="mt-2 flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-none animate-fade-in duration-300">
          
          {/* Quick Stats Panel */}
          {history.length > 0 && (
            <div className={`grid grid-cols-3 gap-1 p-1.5 rounded-md text-[8px] font-mono leading-none ${
              theme === 'cyberpunk' ? 'bg-black/50 text-[#ff0055]/80' : 'bg-slate-100/50 text-slate-500'
            }`}>
              <div className="flex flex-col items-center border-r border-slate-300/30">
                <span className="opacity-60 uppercase mb-0.5">{lang === 'en' ? 'SESSIONS' : '總局數'}</span>
                <span className="font-bold text-[10px]">{totalGames}</span>
              </div>
              <div className="flex flex-col items-center border-r border-slate-300/30">
                <span className="opacity-60 uppercase mb-0.5">{lang === 'en' ? 'AVG PEAK' : '平均最高'}</span>
                <span className="font-bold text-[10px] text-orange-400">{avgPeakBpm} <span className="text-[7px]">BPM</span></span>
              </div>
              <div className="flex flex-col items-center">
                <span className="opacity-60 uppercase mb-0.5">{lang === 'en' ? 'MAX PANIC' : '極限狂飆'}</span>
                <span className="font-bold text-[10px] text-red-500">{maxPeakBpm} <span className="text-[7px]">BPM</span></span>
              </div>
            </div>
          )}

          {/* Records List Container */}
          <div className="flex flex-col gap-1">
            {history.length === 0 ? (
              <div className={`text-center py-4 text-[9px] italic ${
                theme === 'cyberpunk' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {lang === 'en' ? 'NO DIAGNOSTIC DATA YET' : '尚無診斷數據。'}
              </div>
            ) : (
              history.map((record) => (
                <div
                  key={record.id}
                  className={`flex items-center justify-between p-1.5 rounded-md text-[8px] leading-tight font-mono transition-all ${
                    theme === 'cyberpunk'
                      ? 'bg-black/30 border border-[#ff0055]/10 hover:border-[#ff0055]/30'
                      : 'bg-slate-50 border border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {/* Left: Outcome Mark + Timestamp */}
                  <div className="flex items-center gap-1">
                    {record.outcome === 'won' ? (
                      <CheckCircle size={10} className="text-[#34a853] shrink-0" />
                    ) : (
                      <XCircle size={10} className="text-[#ea4335] shrink-0" />
                    )}
                    <span className="opacity-40 shrink-0">[{record.timestamp}]</span>
                    <span className={`px-1 py-0.2 rounded font-extrabold text-[7px] text-white shrink-0 ${
                      record.difficulty === 'kids' ? 'bg-[#34a853]' :
                      record.difficulty === 'easy' ? 'bg-[#4285f4]' :
                      record.difficulty === 'medium' ? 'bg-[#fbbc05]' :
                      record.difficulty === 'hard' ? 'bg-[#ea4335]' : 'bg-[#854dff]'
                    }`}>
                      {getDifficultyLabel(record.difficulty)}
                    </span>
                  </div>

                  {/* Middle Display: Time Taken */}
                  <div className="opacity-75 font-semibold text-center shrink-0">
                    {record.finalTime}s
                  </div>

                  {/* Right Display: Peak BPM and Panic status */}
                  <div className="flex items-center gap-1.5 shrink-0 text-right">
                    <span className={`font-extrabold pb-0.5 ${record.panicColorClass}`}>
                      {record.panicCategory}
                    </span>
                    <span className={`font-black tracking-tighter ${
                      theme === 'cyberpunk' ? 'text-white' : 'text-slate-700'
                    }`}>
                      {record.peakBpm} <span className="opacity-50 text-[7px] font-normal">BPM</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Row */}
          {history.length > 0 && (
            <div className="flex justify-end pt-1">
              <button
                id="btn-clear-diagnostic-history"
                onClick={handleClearHistory}
                className={`flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-all duration-200 ${
                  theme === 'cyberpunk'
                    ? 'text-[#ff0055]/60 hover:text-[#ff0055] hover:bg-[#ff0055]/10'
                    : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Trash2 size={10} />
                {lang === 'en' ? 'CLEAR DIAGNOSTICS' : '清除診斷報告'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
