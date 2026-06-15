import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, BarChart3, Clock, Award, ShieldCheck, Download, Share2 } from 'lucide-react';
import { DifficultyConfig } from '../types';
import { Language, TranslationSet, translations } from '../utils/i18n';

interface OverlayProps {
  status: 'won' | 'lost' | 'idle' | 'playing';
  time: number;
  bestTime: number | null;
  config: DifficultyConfig;
  streak?: number;
  onRestart: () => void;
  onOpenStats: () => void;
  lang: Language;
  theme?: 'classic' | 'cyberpunk';
}

export default function WinLoseOverlay({
  status,
  time,
  bestTime,
  config,
  streak = 0,
  onRestart,
  onOpenStats,
  lang,
  theme = 'classic',
}: OverlayProps) {
  const [showDiploma, setShowDiploma] = useState(false);

  const t: TranslationSet = translations[lang];

  const isWon = status === 'won';

  const handleShare = async () => {
    const title = isWon 
      ? (lang === 'en' ? 'Victory in Jiao Ge Minesweeper!' : lang === 'zh-TW' ? '我通關了椒哥極智掃雷！' : '我通关了椒哥极智扫雷！') 
      : (lang === 'en' ? 'Attempted Jiao Ge Minesweeper' : lang === 'zh-TW' ? '挑戰了椒哥極智掃雷' : '挑战了椒哥极智扫雷');
    
    let difficultyName = config.label;
    if (lang === 'en') {
      difficultyName = config.type === 'easy' ? 'Beginner' : config.type === 'medium' ? 'Intermediate' : config.type === 'hard' ? 'Expert' : 'Custom';
    } 
    const streakInfo = streak > 0 ? `🔥 Streak: ${streak}` : '';
    const verb = isWon 
      ? (lang === 'en' ? `I cleared Jiao Ge's Minesweeper on ${difficultyName} in ${time}s! 🏆` : lang === 'zh-TW' ? `我在 ${time} 秒內通關了椒哥極智掃雷 (${difficultyName})! 🏆` : `我在 ${time} 秒内通关了椒哥极智扫雷 (${difficultyName})! 🏆`)
      : (lang === 'en' ? `I got paralyzed by Jiao Ge's Minesweeper on ${difficultyName}! 💀` : lang === 'zh-TW' ? `我被椒哥極智掃雷 (${difficultyName}) 的電容擊穿全麻了! 💀` : `我被椒哥极智扫雷 (${difficultyName}) 的电容击穿全麻了! 💀`);
    
    const text = `${verb} ${streakInfo}\n${lang === 'en' ? 'Play it now!' : '快來挑戰！'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.href,
        });
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.error("Error sharing:", e);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${title}\n${text}\n${window.location.href}`);
        alert(lang === 'en' ? 'Result copied to clipboard!' : '戰績已複製到剪貼簿！');
      } catch (err) {
        console.error("Clipboard copy failed", err);
      }
    }
  };

  return (
    <AnimatePresence>
      {(status === 'won' || status === 'lost') && (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        id="game-result-container"
        className={`w-full max-w-lg mx-auto border rounded-3xl p-6 mt-6 relative no-select transition-all duration-300 ${
          theme === 'cyberpunk'
            ? isWon
              ? 'bg-[#07131b]/95 border-[#00f0ff]/40 shadow-[0_0_20px_rgba(0,240,255,0.25)] text-[#00f0ff]'
              : 'bg-[#160710]/95 border-[#ff0055]/40 shadow-[0_0_20px_rgba(255,0,85,0.25)] text-[#ff0055]'
            : 'bg-white border-slate-200/60 shadow-md text-slate-800'
        }`}
      >
      {/* Decorative colored badge on top */}
      <div className={`absolute top-0 inset-x-0 h-2.5 transition-colors duration-300 ${
        isWon 
          ? theme === 'cyberpunk' ? 'bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]' : 'bg-[#34A853]' 
          : theme === 'cyberpunk' ? 'bg-[#ff0055] shadow-[0_0_10px_#ff0055]' : 'bg-[#EA4335]'
      }`} />

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Animated Icon Avatar */}
        <div className="flex items-center justify-center">
          {isWon ? (
            <motion.div
              whileHover={{ scale: 1.15, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              className={`w-20 h-20 rounded-full flex relative items-center justify-center border-2 shadow-sm transition-all duration-300 cursor-pointer ${
                theme === 'cyberpunk'
                  ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'
              }`}
              title="Master Jiao's Victory Dance!"
              onClick={(e) => {
                // Interactive Easter egg explosion effect
                const el = e.currentTarget;
                el.classList.remove('animate-jiao-dance');
                void el.offsetWidth; // trigger reflow
                el.classList.add('animate-jiao-dance');
              }}
            >
              <Trophy className="w-10 h-10 absolute opacity-20" strokeWidth={1.5} />
              <div className="text-[2.25rem] select-none absolute animate-jiao-dance">👴</div>
            </motion.div>
          ) : (
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`w-20 h-20 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-300 ${
                theme === 'cyberpunk'
                  ? 'bg-[#ff0055]/10 text-[#ff0055] border-[#ff0055]/30 shadow-[0_0_12px_rgba(255,0,85,0.3)]'
                  : 'bg-red-50 text-[#EA4335] border-red-100 shadow-sm'
              }`}
            >
              <span className="text-4xl font-sans">💥</span>
            </motion.div>
          )}
        </div>

        {/* Text descriptions */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-3">
          <div>
            <span className={`text-[10px] font-display font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
              isWon 
                ? theme === 'cyberpunk' ? 'bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]' : 'bg-[#34A853]/10 text-[#34A853]' 
                : theme === 'cyberpunk' ? 'bg-[#ff0055]/15 text-[#ff0055] border border-[#ff0055]/30 shadow-[0_0_8px_rgba(255,0,85,0.2)]' : 'bg-[#EA4335]/10 text-[#EA4335]'
            }`}>
              {isWon ? 'Victory' : 'Game Over'}
            </span>
            <h2 className={`font-display font-extrabold text-xl mt-2 select-none ${
              theme === 'cyberpunk'
                ? isWon ? 'text-[#00f0ff] cyber-glow-cyan' : 'text-[#ff0055] cyber-glow-magenta'
                : 'text-slate-800'
            }`}>
              {isWon ? t.winOverTitle : t.loseOverTitle}
            </h2>
            <p className={`text-xs mt-1 leading-relaxed select-none ${
              theme === 'cyberpunk' ? 'text-slate-300' : 'text-slate-400'
            }`}>
              {isWon ? t.winOverDesc : t.loseOverDesc}
            </p>
          </div>

          {/* Timing details */}
          <div className="flex flex-wrap items-center gap-4 py-1">
            <div className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-semibold ${
              theme === 'cyberpunk'
                ? 'rounded-xl text-slate-200 bg-[#121424]/90 border border-slate-700/80 shadow-[0_0_6px_rgba(0,240,255,0.15)]'
                : 'rounded border text-slate-600 bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <Clock className={`w-4 h-4 ${theme === 'cyberpunk' ? 'text-[#00f0ff]' : 'text-slate-400'}`} />
              <span>{t.timeElapsed}: {time}s</span>
            </div>
            {bestTime !== null && (
              <div className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-semibold ${
                theme === 'cyberpunk'
                  ? 'rounded-xl text-amber-300 bg-[#121424]/90 border border-amber-500/30'
                  : 'rounded border text-amber-700 bg-amber-50 border-amber-200 shadow-sm'
              }`}>
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>{t.statBestTime}: {bestTime}s</span>
              </div>
            )}
          </div>

          {/* Master Jiao Ge's Expert Forensic Diagnostic Report */}
          <div className={`w-full mt-1 p-3.5 border text-left font-mono text-[11px] leading-relaxed transition-all duration-300 ${
            theme === 'cyberpunk'
              ? isWon
                ? 'rounded-2xl bg-[#042024]/60 border-[#00f0ff]/35 text-[#00f0ff]'
                : 'rounded-2xl bg-[#250415]/60 border-[#ff0055]/35 text-[#ff0055]'
              : isWon
                ? 'rounded bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'rounded bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center justify-between font-bold mb-2 pb-1 border-b border-dashed border-current/25">
              <div className="flex items-center gap-1.5">
                <span className="text-xs animate-bounce">👑</span>
                <span className="uppercase tracking-widest text-[9px] font-black">
                  {lang === 'en' 
                    ? "Jiao Ge's Post-Game Forensic Review" 
                    : lang === 'zh-TW' 
                      ? "極智大師椒哥 · 局後戰術評估報告" 
                      : "极智大师椒哥 · 局后战术评估报告"}
                </span>
              </div>
              <span className="text-[8px] opacity-75">CODE: J_SYS_REV_2.8</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mb-2 text-[10.5px]">
              <div>
                <span className="opacity-70">
                  {lang === 'en' ? "• Microburst rate : " : lang === 'zh-TW' ? "• 手指微操爆發率 : " : "• 手指微操爆发率 :"}
                </span>{" "}
                <span className="font-extrabold">{isWon ? "99.8% (EXCEL)" : "22.4% (CAP_OVERFLOW)"}</span>
              </div>
              <div>
                <span className="opacity-70">
                  {lang === 'en' ? "• Yuan Radiation : " : lang === 'zh-TW' ? "• 袁能輻射濃度 : " : "• 袁能辐射浓度 :"}
                </span>{" "}
                <span className="font-extrabold">{isWon ? "0.0% (CLEARED)" : "100.0% (TOTAL_MA)"}</span>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <span className="opacity-70">
                  {lang === 'en' ? "• Academic Status : " : lang === 'zh-TW' ? "• 華宇學位授予結果 : " : "• 华宇学位授予结果 :"}
                </span>{" "}
                <span className="font-extrabold">
                  {isWon 
                    ? (lang === 'en' ? "GRADUATED 🎉" : lang === 'zh-TW' ? "極智畢業 · 學位證書PDF傳輸完畢 🎉" : "极智毕业 · 学位证书PDF传输完毕 🎉")
                    : (lang === 'en' ? "STILL_PARALYZED 💀" : lang === 'zh-TW' ? "續辦延修 · 袁氣入體全麻 💀" : "续办延修 · 袁气入体全麻 💀")
                  }
                </span>
              </div>
            </div>

            <div className="text-[10px] italic leading-relaxed p-2 rounded-xl bg-current/5 border border-current/10">
              <span className="font-bold mr-1">💬 {lang === 'en' ? "Diagnostic Remarks:" : "椒哥医嘱:"}</span>
              {isWon
                ? lang === 'en'
                  ? "Dynamic 350ms gesture engine perfectly bypassed all seismic capacitors. E-sports grade finger controls detected. Splendid victory, Master Jiao is highly pleased!"
                  : lang === 'zh-TW'
                    ? "本局微操手法臻至化境，350ms 防抖跳躍大獲全勝，未給反向電容任何擊穿空間。華宇學位PDF大印已盖！"
                    : "本局微操手法臻至化境，350ms 防抖跳跃大获全胜，未给反向电容任何击穿空间。华宇学位PDF大印已盖！"
                : lang === 'en'
                  ? "Classic explosive breakdown leading to fingers becoming totally 'Shijieized'. Absolute numbness captured. Rollback firmware immediately by hitting 'Restart'!"
                  : lang === 'zh-TW'
                    ? "檢測到防爆電容瞬間融化，手指陷入嚴重的「袁式全麻」狀態！微操偏離和弦基線，建議立刻重啟對局，重振榮光！"
                    : "检测到防爆电容瞬间融化，手指陷入严重的「袁式全麻」状态！微操偏离和弦基线，建议立刻重启对局，重振荣光！"
              }
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <button
              onClick={onRestart}
              id="result-play-again-btn"
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-display font-black shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                theme === 'cyberpunk'
                  ? isWon
                    ? 'bg-gradient-to-r from-[#00f0ff] to-[#00b0ff] text-[#080914] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] font-black'
                    : 'bg-gradient-to-r from-[#ff0055] to-[#ff0099] text-white hover:shadow-[0_0_15px_rgba(255,0,85,0.5)] font-black'
                  : isWon 
                    ? 'bg-[#34A853] hover:bg-[#2c8d46] text-white' 
                    : 'bg-[#EA4335] hover:bg-[#cf3c2e] text-white'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t.playAgainBtn}
            </button>

            <button
              onClick={onOpenStats}
              id="result-view-stats-btn"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-display font-bold transition-all cursor-pointer border ${
                theme === 'cyberpunk'
                  ? 'bg-transparent hover:bg-slate-800 border-[#00f0ff]/30 text-[#00f0ff] hover:border-[#00f0ff]/60 shadow-[0_0_8px_rgba(0,240,255,0.1)]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {t.viewStatsBtn}
            </button>

            <button
              onClick={handleShare}
              id="result-share-btn"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-display font-bold transition-all cursor-pointer border ${
                theme === 'cyberpunk'
                  ? 'bg-transparent hover:bg-slate-800 border-[#9d4edd]/30 text-[#9d4edd] hover:border-[#9d4edd]/60 shadow-[0_0_8px_rgba(157,78,221,0.1)]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Share' : lang === 'zh-TW' ? '分享' : '分享'}
            </button>

            {isWon && (
              <button
                onClick={() => setShowDiploma((d) => !d)}
                id="result-view-degree-btn"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-display font-black transition-all cursor-pointer border ${
                  theme === 'cyberpunk'
                    ? 'bg-[#ffea00]/10 hover:bg-[#ffea00]/20 border-[#ffea00]/30 text-[#ffea00] shadow-[0_0_8px_rgba(255,234,0,0.2)] ml-auto md:ml-0'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 ml-auto md:ml-0 shadow-sm'
                }`}
              >
                <Award className="w-3.5 h-3.5 animate-pulse" />
                <span>{showDiploma ? (lang === 'en' ? "Hide Degree" : "收起學位證書") : (lang === 'en' ? "Graduate Degree" : "極智學位證書")}</span>
              </button>
            )}
          </div>

          {/* Beautiful expandable inline diploma/degree certificate */}
          {isWon && showDiploma && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`w-full mt-4 p-5 rounded-2xl border flex flex-col gap-3 relative overflow-hidden text-left transition-all ${
                theme === 'cyberpunk'
                  ? 'bg-gradient-to-b from-[#080c10] to-[#121626] border-[#ffea00]/30 text-[#ffea00] shadow-[0_0_15px_rgba(255,234,0,0.15)] font-mono'
                  : 'bg-[#faf6e8] border-amber-300 text-amber-950 rounded-2xl font-serif'
              }`}
            >
              <div className="absolute right-4 bottom-4 opacity-10 select-none pointer-events-none text-5xl">
                🎓
              </div>

              <div className="text-center font-display font-black tracking-widest text-[10px] uppercase border-b border-dashed border-current/25 pb-2">
                🎓 {lang === 'en' ? "UNIVERSITY OF JIAOGE ACADEMIC BOARD" : lang === 'zh-TW' ? "椒哥極智皇家學位聯席會" : "椒哥极智皇家学位联席会"}
              </div>

              <div className="text-center text-sm md:text-base font-bold my-1 tracking-wide">
                {lang === 'en' ? "BACHELOR OF MINESWEEPER OPERATIONS" : lang === 'zh-TW' ? "極智雷區微操工學學士學位" : "极智雷区微操工学学士学位"}
              </div>

              <p className="text-[10px] md:text-xs leading-relaxed text-center opacity-90 italic px-2">
                {lang === 'en' 
                  ? "This digital credential is proudly conferred upon the esteemed user, who has victoriously navigated the topological high-density Yuan fields with an elite touchrate, satisfying all strict requirements of the academic audit."
                  : lang === 'zh-TW'
                    ? "茲證明此位卓越的微操主宰，在今日成功擊穿高能離子雷域，展現了卓越的五階和弦避震微操技巧，經椒哥極智董事會特批，特授予此學位，永不延修、特准畢業！"
                    : "兹证明此位卓越的微操主宰，在今日成功击穿高能离子雷域，展现了卓越的五阶和弦避震微操技巧，经椒哥极智董事会特批，特授予此学位，永不延修、特准毕业！"
                }
              </p>

              <div className="grid grid-cols-2 gap-4 mt-2 border-t border-dashed border-current/20 pt-2 text-[10px] lowercase font-mono">
                <div>
                  <span className="opacity-70">{lang === 'en' ? "conferral date:" : "授予日期:"}</span>{" "}
                  <span className="font-extrabold font-mono text-xs text-white bg-slate-900/50 px-1 rounded">{new Date().toISOString().substring(0, 10)}</span>
                </div>
                <div>
                  <span className="opacity-70">{lang === 'en' ? "audit duration:" : "排雷用时 :"}</span>{" "}
                  <span className="font-extrabold font-mono text-xs text-emerald-500">{time}s</span>
                </div>
                <div>
                  <span className="opacity-70">{lang === 'en' ? "anti-explosion status:" : "微操特许防爆 :"}</span>{" "}
                  <span className="font-extrabold font-mono text-xs text-amber-500">100% SECURE</span>
                </div>
                <div>
                  <span className="opacity-70">{lang === 'en' ? "authorized stamp:" : "联检签发章 :"}</span>{" "}
                  <span className="font-bold text-xs uppercase underline tracking-wider">{lang === 'en' ? "CHIEF JIAOGE // Approved" : "极智椒哥 // 准予毕业"}</span>
                </div>
              </div>

              <div className="text-center mt-3 border-t border-dashed border-current/15 pt-2">
                <button
                  onClick={() => alert(lang === 'en' ? "🏆 Graduation Certificate saved permanently in Cloud Backup!" : "🏆 华宇学士学位证书 PDF 已永久保存至云端并写入区块链明细！")}
                  className={`px-3.5 py-1.5 rounded-xl text-[9px] font-mono leading-none tracking-wider font-extrabold border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                    theme === 'cyberpunk'
                      ? 'border-[#ffea00]/40 bg-[#ffea00]/10 text-[#ffea00] hover:bg-[#ffea00]/20'
                      : 'border-amber-400 bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <Download className="w-3 h-3" />
                  <span>{lang === 'en' ? "Export Secure PDF" : "保存学业证书 PDF"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
    )}
    </AnimatePresence>
  );
}
