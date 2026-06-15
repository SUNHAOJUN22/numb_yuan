import React from 'react';
import { Trophy, X, Trash2, Award } from 'lucide-react';
import { GameStats, DifficultyType } from '../types';
import { Language, TranslationSet, translations } from '../utils/i18n';

interface StatsProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  onClearStats: () => void;
  lang: Language;
  theme?: 'classic' | 'cyberpunk';
  currentJiaoStreak?: number;
  bestJiaoStreak?: number;
  jiaoBadges?: number;
}

export default function StatsModal({ 
  isOpen, 
  onClose, 
  stats, 
  onClearStats, 
  lang, 
  theme = 'classic',
  currentJiaoStreak = 0,
  bestJiaoStreak = 0,
  jiaoBadges = 0
}: StatsProps) {
  if (!isOpen) return null;

  const t: TranslationSet = translations[lang];

  const getDifficultyLabel = (diff: DifficultyType) => {
    if (diff === 'kids') return t.veryEasy;
    if (diff === 'easy') return t.easy;
    if (diff === 'medium') return t.medium;
    if (diff === 'hard') return t.hard;
    return t.veryHard;
  };

  const difficultyColors: Record<DifficultyType, string> = {
    kids: theme === 'cyberpunk' ? 'bg-[#00f0ff]' : 'bg-[#34A853]', // Google Green / Cyber Cyan
    easy: theme === 'cyberpunk' ? 'bg-[#ff0055]' : 'bg-[#4285F4]', // Google Blue / Cyber Magenta
    medium: theme === 'cyberpunk' ? 'bg-[#ffeb3b]' : 'bg-[#FBBC05]', // Google Yellow / Cyber Yellow
    hard: theme === 'cyberpunk' ? 'bg-[#00ff66]' : 'bg-[#EA4335]', // Google Red / Cyber Green
    expert: theme === 'cyberpunk' ? 'bg-[#ff00bb]' : 'bg-[#854dff]', // Purple / Cyber Purple
  };

  return (
    <div id="stats-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-[#06070d]/75 backdrop-blur-sm p-4 no-select animate-fade-in">
      <div 
        className={`w-full max-w-md rounded-3xl overflow-hidden border flex flex-col md:max-h-[90vh] max-h-[95vh] transition-all duration-300 ${
          theme === 'cyberpunk'
            ? 'bg-[#0f111a]/95 border-[#ff0055]/30 shadow-[0_0_25px_rgba(255,0,85,0.25)] text-white'
            : 'bg-white border-slate-100 shadow-xl text-slate-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        {theme === 'cyberpunk' ? (
          <div className="h-1 bg-gradient-to-r from-[#00f0ff] to-[#ff00bb] shadow-[0_0_10px_#ff0055] w-full" />
        ) : (
          <div className="h-2 flex w-full">
            <div className="bg-[#4285F4] flex-1" />
            <div className="bg-[#EA4335] flex-1" />
            <div className="bg-[#FBBC05] flex-1" />
            <div className="bg-[#34A853] flex-1" />
          </div>
        )}

        {/* Modal Header */}
        <div className={`px-6 py-5 flex items-center justify-between border-b ${
          theme === 'cyberpunk' ? 'border-[#ff0055]/20 bg-[#ff0055]/5' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-2">
            <Trophy className={`w-5 h-5 ${theme === 'cyberpunk' ? 'text-[#ff0055] drop-shadow-[0_0_4px_#ff0055]' : 'text-amber-500'}`} />
            <h2 className={`font-display font-extrabold text-lg ${theme === 'cyberpunk' ? 'text-[#00f0ff] cyber-glow-cyan' : 'text-slate-800'}`}>{t.statsTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 px-2 rounded-xl transition-all cursor-pointer ${
              theme === 'cyberpunk'
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            id="close-stats-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {(['kids', 'easy', 'medium', 'hard', 'expert'] as const).map((diff) => {
              const diffStats = stats[diff] || { gamesPlayed: 0, gamesWon: 0, bestTime: null };
              const gamesPlayed = diffStats.gamesPlayed;
              const gamesWon = diffStats.gamesWon;
              const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
              const bestTime = diffStats.bestTime;

              return (
                <div key={diff} className={`flex flex-col border p-2.5 rounded-2xl relative overflow-hidden group transition-all duration-300 ${
                  theme === 'cyberpunk'
                    ? 'bg-[#121422] border-[#00f0ff]/15 text-slate-200 hover:border-[#00f0ff]/40'
                    : 'border-slate-100 bg-slate-50/30 text-slate-800 hover:border-slate-200'
                }`}>
                  {/* Decorative Border indicator */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${difficultyColors[diff]}`} />
                  
                  <div className={`font-display font-black text-sm select-none ${theme === 'cyberpunk' ? 'text-slate-100' : 'text-slate-800'} mt-1`}>
                    {getDifficultyLabel(diff)}
                  </div>
                  
                  <div className="mt-2.5 flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">{t.statGames}</span>
                    <span className={`font-mono text-xs font-black ${theme === 'cyberpunk' ? 'text-[#00f0ff]' : 'text-slate-700'}`}>
                      {gamesWon}/{gamesPlayed}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">{t.statWinRate}</span>
                    <span className={`font-mono text-xs font-black ${theme === 'cyberpunk' ? 'text-[#ff00bb]' : 'text-slate-700'}`}>
                      {winRate}%
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">{t.statBestTime}</span>
                    <span className={`font-mono text-xs font-black ${theme === 'cyberpunk' ? 'text-amber-400' : 'text-slate-700'}`}>
                      {bestTime !== null ? `${bestTime}s` : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick instructions / tips box */}
          <div className={`p-4 rounded-2xl flex items-start gap-3 border transition-colors ${
            theme === 'cyberpunk'
              ? 'bg-[#ff0055]/10 border-[#ff0055]/30 text-slate-200'
              : 'bg-lime-50/50 border-lime-100 text-[#3f6212]'
          }`}>
            <Award className={`w-5 h-5 shrink-0 mt-0.5 ${theme === 'cyberpunk' ? 'text-[#ff00bb]' : 'text-lime-600'}`} />
            <div className="text-xs leading-relaxed font-sans select-none">
              <strong className={`block font-semibold font-display mb-0.5 ${theme === 'cyberpunk' ? 'text-slate-100' : 'text-lime-700'}`}>
                {t.statTipTitle}
              </strong>
              {t.statTipContent}
            </div>
          </div>

          {/* Master Jiao Ge's Finger Health & Academic Audit Certificate */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col gap-2 bg-gradient-to-r text-left ${
            theme === 'cyberpunk'
              ? 'from-[#0b0c16] to-[#121424] border-[#00f0ff]/20 text-slate-200 shadow-[0_0_15px_rgba(0,240,255,0.06)]'
              : 'from-slate-50 to-amber-50/20 border-amber-200/60 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-dashed border-slate-500/20 pb-2">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-xs select-none">🎓</span>
                <span className={`text-[9px] font-black tracking-widest uppercase ${
                  theme === 'cyberpunk' ? 'text-[#ffea00]' : 'text-amber-600'
                }`}>
                  {lang === 'en'
                    ? "JIAO GE'S ACADEMIC AUDIT BOARD"
                    : lang === 'zh-TW'
                      ? "椒哥·極智本科學位終端聯檢"
                      : "椒哥·极智本科学位终端联检"}
                </span>
              </div>
              <span className="font-mono text-[8px] opacity-60">VER: 99.8% READY</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className={`p-2 rounded-xl border text-[10px] font-mono leading-tight flex flex-col justify-between ${
                theme === 'cyberpunk' ? 'bg-[#060814]/40 border-slate-800' : 'bg-white border-slate-200/50'
              }`}>
                <span className="opacity-60 text-[9px] uppercase tracking-wider block mb-0.5">
                  {lang === 'en' ? "MASTERSHIP RATE" : "極智領悟度"}
                </span>
                <span className={`font-black text-xs ${theme === 'cyberpunk' ? 'text-[#00f0ff]' : 'text-[#4285F4]'}`}>
                  100% PASS
                </span>
              </div>

              <div className={`p-2 rounded-xl border text-[10px] font-mono leading-tight flex flex-col justify-between ${
                theme === 'cyberpunk' ? 'bg-[#060814]/40 border-slate-800' : 'bg-white border-slate-200/50'
              }`}>
                <span className="opacity-60 text-[9px] uppercase tracking-wider block mb-0.5">
                  {lang === 'en' ? "CAPACITOR HEAL" : "防爆自愈因子"}
                </span>
                <span className={`font-black text-xs ${theme === 'cyberpunk' ? 'text-[#ff00bb]' : 'text-[#EA4335]'}`}>
                  350ms PROTECT
                </span>
              </div>

              <div className={`p-2 rounded-xl border text-[10px] font-mono leading-tight flex flex-col justify-between ${
                theme === 'cyberpunk' ? 'bg-[#060814]/40 border-slate-800' : 'bg-white border-slate-200/50'
              }`}>
                <span className="opacity-60 text-[9px] uppercase tracking-wider block mb-0.5">
                  {lang === 'en' ? "HANDCART STRIKES" : "推車警告次數"}
                </span>
                <span className="font-black text-xs text-emerald-500">
                  {lang === 'en' ? "0 / CLEAN RECORD" : "0 次 (紀錄良好)"}
                </span>
              </div>

              <div className={`p-2 rounded-xl border text-[10px] font-mono leading-tight flex flex-col justify-between ${
                theme === 'cyberpunk' ? 'bg-[#060814]/40 border-slate-800' : 'bg-white border-slate-200/50'
              }`}>
                <span className="opacity-60 text-[9px] uppercase tracking-wider block mb-0.5">
                  {lang === 'en' ? "YUAN REMOVAL" : "「袁」氣抗性強度"}
                </span>
                <span className={`font-black text-xs ${theme === 'cyberpunk' ? 'text-amber-400' : 'text-amber-600'}`}>
                  ULTRA MAX
                </span>
              </div>
            </div>

            <div className={`mt-1 font-mono text-[9px] italic leading-relaxed p-2 rounded-xl ${
              theme === 'cyberpunk' ? 'bg-white/5 text-[#00f0ff]/80' : 'bg-amber-500/10 text-amber-900/80'
            }`}>
              {lang === 'en'
                ? "💡 Master Jiao's Wisdom: 'If touch latency drives your capacitor to overheat, look directly into the holographic terminal and execute custom Pentatonic waves!'"
                : lang === 'zh-TW'
                  ? "💡 椒哥寄語：『若是手指有全麻之虞，請立刻呼喚“椒哥助我”，觸發和弦聲學脈衝瞬間擊穿所有頑敵！護你華宇學位證書安然無恙！』"
                  : "💡 椒哥寄语：『若是手指有全麻之虞，请立刻呼唤“椒哥助我”，触发和弦声学脉冲瞬间击穿所有顽敌！护你华宇学位证书安然无恙！』"}
            </div>
          </div>

          {/* Jiao Ge Win Streaks Section */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col gap-3 bg-gradient-to-br ${
            theme === 'cyberpunk'
              ? 'from-[#1a0b16] to-[#0b121a] border-[#ff00bb]/30 text-slate-200'
              : 'from-amber-50 to-orange-50/50 border-amber-200/60 text-slate-800'
          }`}>
            <div className={`font-display font-black text-sm uppercase tracking-wider flex items-center gap-2 ${
              theme === 'cyberpunk' ? 'text-[#ff00bb] drop-shadow-[0_0_8px_#ff00bb]' : 'text-amber-600'
            }`}>
              <Trophy className="w-4 h-4" />
              {lang === 'en' ? "Jiao Ge's Challenge Streaks" : '椒哥极限操作连胜记录'}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden ${
                theme === 'cyberpunk' ? 'bg-[#0f0412]/50 border-slate-800' : 'bg-white border-amber-100'
              }`}>
                <span className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
                  theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {lang === 'en' ? 'Current Streak' : '当前连胜'}
                </span>
                <span className={`font-mono text-3xl font-black ${
                  theme === 'cyberpunk' ? 'text-[#00f0ff] drop-shadow-[0_0_5px_#00f0ff]' : 'text-emerald-500'
                }`}>
                  {currentJiaoStreak}
                </span>
                {currentJiaoStreak > 0 && (
                  <span className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${
                    theme === 'cyberpunk' ? 'from-[#00f0ff] to-[#ff00bb]' : 'from-emerald-400 to-amber-400'
                  }`} />
                )}
              </div>

              <div className={`p-3 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden ${
                theme === 'cyberpunk' ? 'bg-[#0f0412]/50 border-slate-800' : 'bg-white border-amber-100'
              }`}>
                <span className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
                  theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {lang === 'en' ? 'Peak Streak' : '最高连胜'}
                </span>
                <span className={`font-mono text-3xl font-black ${
                  theme === 'cyberpunk' ? 'text-[#ffea00] drop-shadow-[0_0_5px_#ffea00]' : 'text-amber-500'
                }`}>
                  {bestJiaoStreak}
                </span>
                {bestJiaoStreak > 5 && (
                  <span className={`absolute top-1 right-1 text-[10px]`}>👑</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <span className={`text-[9px] uppercase tracking-wider font-semibold ${
                theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {lang === 'en' ? `Milestone Badges Unlocked: ${jiaoBadges}` : `已解锁极智徽章: ${jiaoBadges}`}
              </span>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: Math.min(jiaoBadges, 10) }).map((_, i) => (
                  <span key={i} className={`flex items-center justify-center w-6 h-6 rounded bg-black/5 ${
                    theme === 'cyberpunk' ? 'text-xl drop-shadow-[0_0_2px_#ff00bb]' : 'text-lg drop-shadow-sm'
                  }`}>
                    {['🎖️', '⭐', '🥇', '🏆', '💎'][i % 5]}
                  </span>
                ))}
                {jiaoBadges === 0 && (
                  <span className={`text-[10px] font-mono italic ${theme === 'cyberpunk' ? 'text-slate-600' : 'text-slate-400'}`}>
                    {lang === 'en' ? "Reach a streak of 5 to earn your first badge..." : "达到5连胜解锁首个徽章..."}
                  </span>
                )}
                {jiaoBadges > 10 && (
                  <span className={`flex items-center justify-center w-6 h-6 rounded bg-black/5 text-[10px] font-bold ${
                    theme === 'cyberpunk' ? 'text-[#ffea00]' : 'text-amber-600'
                  }`}>
                    +{jiaoBadges - 10}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Clear Stats Action Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          theme === 'cyberpunk' ? 'border-[#ff0055]/20 bg-[#ff0055]/5' : 'border-slate-100 bg-slate-50/30'
        }`}>
          <button
            onClick={() => {
              if (window.confirm(t.confirmResetStats)) {
                onClearStats();
              }
            }}
            id="clear-stats-btn"
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-display font-medium transition-all border cursor-pointer ${
              theme === 'cyberpunk'
                ? 'bg-transparent border-[#ff0055]/40 hover:border-[#ff0055]/75 hover:bg-[#ff0055]/10 text-[#ff0055]'
                : 'hover:bg-red-50 text-red-600 border border-red-100/50 hover:border-red-200 hover:shadow-sm'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.clearStats}
          </button>
          
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-display font-black transition-all cursor-pointer ${
              theme === 'cyberpunk'
                ? 'bg-[#00f0ff] hover:bg-[#00d0ff] text-[#080914] hover:shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-md'
            }`}
            id="stats-modal-ok-btn"
          >
            {t.doneBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
