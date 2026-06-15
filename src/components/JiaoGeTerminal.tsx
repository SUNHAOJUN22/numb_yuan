import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, ShieldAlert, Cpu, Sparkles, Flame, HelpCircle } from 'lucide-react';
import { Language } from '../utils/i18n';
import { playSound } from '../utils/audio';
import { Season } from './SeasonalBackground';

interface JiaoGeTerminalProps {
  status: 'idle' | 'playing' | 'won' | 'lost';
  lang: Language;
  theme: 'classic' | 'cyberpunk';
  season?: Season;
  soundEnabled: boolean;
  jiaoHelpsRemaining: number;
  jiaoHelpCooldown: number | null;
  messageOverride: string;
  onCallHelp: () => void;
  onOpenEasterEgg: () => void;
  onAvatarClick?: (emojis: string[]) => void;
}

export default function JiaoGeTerminal({
  status,
  lang,
  theme,
  season,
  soundEnabled,
  jiaoHelpsRemaining,
  jiaoHelpCooldown,
  messageOverride,
  onCallHelp,
  onOpenEasterEgg,
  onAvatarClick,
}: JiaoGeTerminalProps) {
  const [avatarExpr, setAvatarExpr] = useState<'normal' | 'happy' | 'coding' | 'shocked'>('normal');
  const [clickCount, setClickCount] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Dynamic funny expressions based on game state
  useEffect(() => {
    if (status === 'idle') {
      setAvatarExpr('normal');
    } else if (status === 'playing') {
      setAvatarExpr('coding');
    } else if (status === 'won') {
      setAvatarExpr('happy');
    } else if (status === 'lost') {
      setAvatarExpr('shocked');
    }
  }, [status]);

  // Jiao Ge quotes list for interactive click
  const jiaoQuotes = {
    'zh-CN': [
      '“极智第一法则：手速决定上限，微操决定命运！” ⚡',
      '“你尽管大胆地去挖，炸了算华宇的学位证倒霉！💀”',
      '“朝阳的推车已经整装待发，可千万别逼我亲自去帮你推！🛒”',
      '“那些跨端触控延迟？在我的 350ms 拦截自愈排雷算法面前，全是弟弟！🛡️”',
      '“用心排查！每一铲土里，都可能深藏着个想让你防爆电容全麻的‘袁’！💥”',
      '“我的五阶和弦已经注入了声学核心，你听到了吗？🎹”',
      '“只要有椒哥的保佑，世上就没有排不干净的雷区！🏆”'
    ],
    'zh-TW': [
      '「極智第一法則：手速決定上限，微操決定命運！」 ⚡',
      '「你儘管大膽地去挖，炸了算華宇的學位證倒楣！損毀率 100% 💀」',
      '「朝陽的推車已經整裝待發，可千萬別逼我親自去幫你推！🛒」',
      '「那些跨端觸控延遲？在我的 350ms 攔截自癒排雷演算法面前，全是弟弟！🛡️」',
      '「用心排查！每一鏟土裡，都可能深藏著個想讓你防爆電容全麻的『袁』！💥」',
      '「我的五階和弦已經注入了聲學核心，你聽到了嗎？🎹」',
      '「只要有椒哥的保佑，世上就沒有排不乾淨的雷區！🏆」'
    ],
    'en': [
      '"Jiao Ge\'s Law: Speed dictates limits, but micro-control dictates destiny!" ⚡',
      '"Go ahead and unearth fearlessly. If you explode, blame Huayu\'s degree! 💀"',
      '"The cart in Chaoyang is loaded and ready, do not force me to push it myself! 🛒"',
      '"Cross-platform touch lag? Slapped away by my 350ms unflagging safe gesture interceptor! 🛡️"',
      '"Dig selectively! Every unrevealed spot could house a complete Jiao-freezing Yuan-mine! 💥"',
      '"My pentatonic wave is vibrating through the audio sub-module. Do you hear it? 🎹"',
      '"With Jiao Ge\'s blessing, no minefield remains unresolved! 🏆"'
    ]
  };

  const activeQuotes = jiaoQuotes[lang] || jiaoQuotes['en'];

  // Handle clicking Jiao Ge's holographic avatar
  const handleAvatarClick = () => {
    playSound.easterEgg(soundEnabled);
    setClickCount((c) => c + 1);
    setQuoteIdx((prev) => (prev + 1) % activeQuotes.length);
    
    // Change expression temporarily
    const exprs: ('normal' | 'happy' | 'coding' | 'shocked')[] = ['happy', 'coding', 'normal'];
    const randomExpr = exprs[Math.floor(Math.random() * exprs.length)];
    setAvatarExpr(randomExpr);

    if (onAvatarClick) {
      onAvatarClick(['👴', '🎓', '👑', '⚡', '🎹', '🛒', '✨']);
    }

    setTimeout(() => {
      // Revert based on game state
      if (status === 'lost') setAvatarExpr('shocked');
      else if (status === 'won') setAvatarExpr('happy');
      else if (status === 'playing') setAvatarExpr('coding');
      else setAvatarExpr('normal');
    }, 1200);
  };

  // Determine displayed main message
  const getDisplayMessage = () => {
    if (messageOverride) return messageOverride;
    
    if (status === 'idle') {
      return lang === 'en'
        ? 'Standby... "Yuan" mines spotted on radar. Hit Jiao Help or unearth to initialize.'
        : lang === 'zh-TW'
        ? '系統就緒... 雷達觀測到「袁」高能物理堆。按椒哥助我，或點擊任意地塊即刻開始。'
        : '系统就绪... 雷达观测到“袁”高能物理堆。按椒哥助我，或者点击任意地块即刻开始。';
    }
    
    if (status === 'playing') {
      return lang === 'en'
        ? 'Active Scan // Processing matrix coefficients... First-click safety net deployed.'
        : lang === 'zh-TW'
        ? '極智即時監測 // 棋盤動態拓撲演算法運作中。已載入椒哥研發的防誤觸抗震保護。'
        : '极智实时监测 // 棋盘动态拓扑算法运作中。已加载椒哥研发的防误触抗震保护。';
    }
    
    if (status === 'won') {
      return lang === 'en'
        ? 'Victory Authenticated! Educational inventory updated successfully.'
        : lang === 'zh-TW'
        ? '高雅通關！已調用雲端證書接口，華宇本科學位證書 PDF 傳輸完畢！'
        : '高雅通关！已调用云端证书接口，华宇本科学位证书 PDF 传输完毕！';
    }
    
    // Lost state
    return lang === 'en'
      ? 'Critical Crash! Yuan-mine triggered a fatal bypass. Rollback to backup suggested.'
      : lang === 'zh-TW'
      ? '安全故障！「袁」暴雷能量逆流，防爆電容全麻。點擊【再鬧一把】快速回滾。'
      : '安全故障！“袁”暴雷能量逆流，防爆电容全麻。点击【再闹一把】快速回滚。';
  };

  const getTerminalStatusColor = () => {
    if (status === 'won') return 'border-[#39ff14] text-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.25)]';
    if (status === 'lost') return 'border-[#ff0055] text-[#ff0055] shadow-[0_0_10px_rgba(255,0,85,0.25)]';
    if (status === 'playing') return 'border-[#ffea00] text-[#ffea00] shadow-[0_0_10px_rgba(255,234,0,0.25)]';
    return 'border-[#9d4edd] text-[#9d4edd] shadow-[0_0_10px_rgba(157,78,221,0.25)]';
  };

  const getTerminalTitle = () => {
    let base = lang === 'en' ? "JIAO GE'S LIVE DIAGNOSTIC NODE" : lang === 'zh-TW' ? "椒哥極智雲端即時診斷節點" : "椒哥极智云端实时诊断节点";
    if (theme === 'classic' && season) {
       const seasonTitle = {
         spring: lang === 'en' ? '🌸 SPRING BLOSSOM' : '🌸 春樱绽放',
         summer: lang === 'en' ? '☀️ SUMMER BREEZE' : '☀️ 夏日骄阳',
         autumn: lang === 'en' ? '🍁 AUTUMN LEAVES' : '🍁 秋枫红叶',
         winter: lang === 'en' ? '❄️ WINTER FROST' : '❄️ 凛冬冰雪'
       };
       return `${base} [${seasonTitle[season]}]`;
    }
    return `${base} v2.8`;
  };

  return (
    <div 
      id="jiaoge-diagnostic-terminal"
      className={`rounded-2xl border p-4 sm:p-5 relative overflow-hidden transition-all duration-300 md:col-span-3 ${
        theme === 'cyberpunk'
          ? 'bg-[#0a0c1a]/90 border-[#9d4edd]/30 shadow-[0_0_20px_rgba(157,78,221,0.12)] text-white'
          : season === 'spring' ? 'bg-[#f8fdf9] border-[#bbf7b0]/60 text-slate-800 shadow-sm'
          : season === 'summer' ? 'bg-[#f4fafe] border-[#bde8ff]/60 text-slate-800 shadow-sm'
          : season === 'autumn' ? 'bg-[#fffcf7] border-[#ffe6ba]/60 text-slate-800 shadow-sm'
          : season === 'winter' ? 'bg-[#f8fbff] border-[#d2ddee]/60 text-slate-800 shadow-sm'
          : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}
    >
      {/* Dynamic Grid Overlay in Cyberpunk mode */}
      {theme === 'cyberpunk' && (
        <div className="absolute inset-0 bg-scanlines opacity-[0.03] pointer-events-none" />
      )}

      {/* Terminal Title Bar */}
      <div className={`flex items-center justify-between mb-3 border-b pb-2.5 select-none border-dashed ${theme === 'cyberpunk' ? 'border-slate-700/20' : 'border-slate-300/60'}`}>
        <div className="flex items-center gap-2">
          <Terminal className={`w-4 h-4 ${theme === 'cyberpunk' ? 'text-[#00f0ff]' : season === 'spring' ? 'text-green-600' : season === 'summer' ? 'text-sky-600' : season === 'autumn' ? 'text-amber-600' : season === 'winter' ? 'text-blue-500' : 'text-[#4285F4]'}`} />
          <span className={`text-[10px] font-mono font-black tracking-wider uppercase ${
            theme === 'cyberpunk' ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#ff00a2]' : 'text-slate-600'
          }`}>
            {getTerminalTitle()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold">
          <span className={`h-2 w-2 rounded-full inline-block animate-pulse ${
            status === 'lost' ? 'bg-[#ff0055]' : status === 'won' ? 'bg-[#39ff14]' : 'bg-[#00f0ff]'
          }`} />
          <span className={theme === 'cyberpunk' ? 'text-[#00f0ff]' : 'text-slate-500'}>
            SYS_ONLINE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Holographic Avatar Column */}
        <div className="md:col-span-3 flex flex-row md:flex-col items-center gap-3 md:justify-center md:border-r border-dashed border-slate-700/20 pr-0 md:pr-4">
          <div className="relative">
            {/* Holographic glow rings */}
            {theme === 'cyberpunk' && (
              <div className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/30 animate-ping opacity-60 pointer-events-none scale-125" style={{ animationDuration: '3s' }} />
            )}
            
            <button 
              onClick={handleAvatarClick}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center relative select-none cursor-pointer overflow-hidden border-2 transition-all duration-300 ${
                theme === 'cyberpunk'
                  ? 'bg-gradient-to-br from-[#130721] to-[#041a1a] border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-110 active:scale-95'
                  : 'bg-white border-slate-300 hover:border-slate-500 hover:scale-105 active:scale-95'
              }`}
            >
              {/* Interactive Holographic lines */}
              {theme === 'cyberpunk' && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00f0ff]/10 to-transparent animate-laser-sweep pointer-events-none" />
              )}
              
              {/* Expression Avatar Display */}
              <div className="text-2xl sm:text-3xl filter drop-shadow-[0_2px_5px_rgba(0,240,255,0.4)]">
                {avatarExpr === 'happy' ? '👴' : avatarExpr === 'coding' ? '👨‍💻' : avatarExpr === 'shocked' ? '😱' : '👑'}
              </div>
            </button>
          </div>

          <div className="flex flex-col text-left md:text-center select-none">
            <span className={`text-[11px] font-black font-display tracking-tight flex items-center gap-1 ${
              theme === 'cyberpunk' ? 'text-[#00f0ff]' : 'text-slate-800'
            }`}>
              {lang === 'en' ? 'Master Jiao' : '极智椒哥'}
              <Sparkles className="w-2.5 h-2.5 text-[#ffea00] animate-pulse" />
            </span>
            <span className="text-[8px] font-mono uppercase text-slate-500 font-extrabold tracking-widest mt-0.5">
              {avatarExpr === 'coding' ? 'CODING_MAX' : avatarExpr === 'happy' ? 'WIN_CHORD' : avatarExpr === 'shocked' ? 'RAD_DEFEAT' : 'CORE_ENGINE'}
            </span>
          </div>
        </div>

        {/* Diagnostic Output Column */}
        <div className="md:col-span-6 flex flex-col gap-2 min-h-[60px] justify-center">
          {/* Main output description */}
          <div className={`font-mono text-[11px] sm:text-xs font-semibold leading-relaxed p-3 rounded-xl border transition-all duration-300 ${
            theme === 'cyberpunk'
              ? 'bg-[#060814]/80 border-[#00f0ff]/20 text-[#e2e8f0]'
              : 'bg-slate-200/50 border-slate-300/40 text-slate-700'
          }`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={getDisplayMessage()}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {getDisplayMessage()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Prompt quote cycler on clicking */}
          {clickCount > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              className={`text-[10px] font-mono italic select-none ${
                theme === 'cyberpunk' ? 'text-[#ff00a2]' : 'text-slate-500'
              }`}
            >
              💬 {activeQuotes[quoteIdx]}
            </motion.div>
          )}
        </div>

        {/* Help Solver Callback Column */}
        <div className="md:col-span-3 flex flex-row md:flex-col gap-2 w-full">
          {/* Safe Sweep unearther helper toggle - Real Minesweeper resolution block to clear guesses */}
          <div className="flex-1 w-full flex flex-col gap-1 relative">
            <button
              onClick={onCallHelp}
              disabled={jiaoHelpsRemaining <= 0 || (status !== 'playing' && status !== 'idle')}
              className={`w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-4 rounded-xl text-xs font-display font-black tracking-wider transition-all duration-300 border cursor-pointer ${
                jiaoHelpsRemaining <= 0 || (status !== 'playing' && status !== 'idle')
                  ? 'opacity-40 cursor-not-allowed bg-slate-850 text-slate-500 border-slate-700/30'
                  : theme === 'cyberpunk'
                    ? 'bg-gradient-to-r from-[#ff00a2] via-[#9d4edd] to-[#00f0ff] hover:from-[#ff00b7] hover:to-[#00f0ff] text-white border-transparent shadow-[0_5px_15px_rgba(255,0,162,0.35)] hover:shadow-[0_8px_25px_rgba(255,0,162,0.5)] active:scale-95'
                    : 'bg-slate-900 hover:bg-slate-850 text-amber-300 border-transparent hover:scale-102 active:scale-95'
              }`}
            >
              <Cpu className={`w-3.5 h-3.5 ${jiaoHelpsRemaining > 0 ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span className="uppercase text-[10px] tracking-widest pt-0.5">
                {lang === 'en' ? 'Jiao Help ⚡' : lang === 'zh-TW' ? '椒哥助我 ⚡' : '椒哥助我 ⚡'}
              </span>
            </button>
            <div className="flex items-center justify-between px-1">
              {/* Charge Indicators */}
              <div className="flex gap-1 justify-center">
                {[1, 2, 3].map((slot) => (
                  <div
                    key={slot}
                    className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all duration-500 ${
                      slot <= jiaoHelpsRemaining
                        ? theme === 'cyberpunk' ? 'bg-[#ff00a2] shadow-[0_0_5px_#ff00a2]' : 'bg-emerald-500'
                        : theme === 'cyberpunk' ? 'bg-slate-800' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
              {/* Cooldown Number */}
              {jiaoHelpCooldown !== null && jiaoHelpsRemaining < 3 && status === 'playing' && (
                <div className={`text-[9px] font-mono font-bold ${
                  theme === 'cyberpunk' ? 'text-[#00f0ff]' : 'text-slate-500'
                }`}>
                  T - {jiaoHelpCooldown}s
                </div>
              )}
            </div>
          </div>

          {/* Mini Interactive Bonus button */}
          <button
            onClick={onOpenEasterEgg}
            className={`py-2 px-3 rounded-xl text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
              theme === 'cyberpunk'
                ? 'border-[#00f0ff]/35 bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20 shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Flame className="w-3 h-3 animate-pulse text-[#ffee00]" />
            <span>
              {lang === 'en' ? 'Bonus 🥚' : lang === 'zh-TW' ? '物理彩蛋 🥚' : '物理彩蛋 🥚'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
