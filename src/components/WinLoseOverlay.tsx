import React from 'react';
import { motion } from 'motion/react';
import { Trophy, RotateCcw, BarChart3, Clock } from 'lucide-react';
import { DifficultyConfig } from '../types';
import { Language, TranslationSet, translations } from '../utils/i18n';

interface OverlayProps {
  status: 'won' | 'lost' | 'idle' | 'playing';
  time: number;
  bestTime: number | null;
  config: DifficultyConfig;
  onRestart: () => void;
  onOpenStats: () => void;
  lang: Language;
}

export default function WinLoseOverlay({
  status,
  time,
  bestTime,
  config,
  onRestart,
  onOpenStats,
  lang,
}: OverlayProps) {
  if (status !== 'won' && status !== 'lost') {
    return null;
  }

  const t: TranslationSet = translations[lang];

  const isWon = status === 'won';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 180 }}
      id="game-result-container"
      className="w-full max-w-lg mx-auto bg-white border border-slate-200/60 rounded-3xl shadow-md p-6 mt-6 relative no-select"
    >
      {/* Decorative colored badge on top */}
      <div className={`absolute top-0 inset-x-0 h-2.5 ${isWon ? 'bg-[#34A853]' : 'bg-[#EA4335]'}`} />

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Animated Icon Avatar */}
        <div className="flex items-center justify-center">
          {isWon ? (
            <motion.div
              animate={{ rotate: [0, 5, -5, 5, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 3, duration: 1 }}
              className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-100 shadow-sm"
            >
              <Trophy className="w-10 h-10" strokeWidth={1.5} />
            </motion.div>
          ) : (
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 rounded-full bg-red-50 text-[#EA4335] flex items-center justify-center border-2 border-red-100 shadow-sm"
            >
              <span className="text-4xl font-sans">💥</span>
            </motion.div>
          )}
        </div>

        {/* Text descriptions */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-3">
          <div>
            <span className={`text-[10px] font-display font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              isWon ? 'bg-[#34A853]/10 text-[#34A853]' : 'bg-[#EA4335]/10 text-[#EA4335]'
            }`}>
              {isWon ? 'Victory' : 'Game Over'}
            </span>
            <h2 className="font-display font-extrabold text-xl text-slate-800 mt-2 select-none">
              {isWon ? t.winOverTitle : t.loseOverTitle}
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed select-none">
              {isWon ? t.winOverDesc : t.loseOverDesc}
            </p>
          </div>

          {/* Timing details */}
          <div className="flex items-center gap-4 py-1">
            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 shadow-sm text-xs font-mono font-semibold">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{t.timeElapsed}: {time}s</span>
            </div>
            {bestTime !== null && (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50/50 border border-amber-100 rounded-xl px-3 py-1.5 shadow-sm text-xs font-mono font-semibold">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>{t.statBestTime}: {bestTime}s</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <button
              onClick={onRestart}
              id="result-play-again-btn"
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-white text-xs font-display font-bold shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 hover:shadow-md ${
                isWon 
                  ? 'bg-[#34A853] hover:bg-[#2c8d46]' 
                  : 'bg-[#EA4335] hover:bg-[#cf3c2e]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t.playAgainBtn}
            </button>

            <button
              onClick={onOpenStats}
              id="result-view-stats-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-display font-bold transition-all cursor-pointer border border-slate-200"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {t.viewStatsBtn}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
