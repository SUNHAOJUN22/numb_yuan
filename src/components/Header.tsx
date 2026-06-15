import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  BarChart3, 
  HelpCircle, 
  Spade,
  Award,
  Sparkles,
  Gamepad2,
  Trophy,
  Radio,
  Globe,
  Settings
} from 'lucide-react';
import { DifficultyType, DIFFICULTIES } from '../types';
import { Language, TranslationSet, translations } from '../utils/i18n';

import JiaoTooltip from './JiaoTooltip';

interface HeaderProps {
  difficulty: DifficultyType;
  setDifficulty: (diff: DifficultyType) => void;
  status: 'idle' | 'playing' | 'won' | 'lost' | 'paused';
  flagsCount: number;
  totalMines: number;
  time: number;
  clickMode: 'shovel' | 'flag';
  setClickMode: (mode: 'shovel' | 'flag') => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onRestart: () => void;
  onOpenStats: () => void;
  onOpenHowTo: () => void;
  onOpenSettings: () => void;
  onOpenAchievements: () => void;
  onOpenSoundboard: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
  jiaoAvatar: string;
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenEasterEgg: () => void;
  theme?: 'classic' | 'cyberpunk';
  toggleTheme?: () => void;
  jiaoStreak: number;
  challengeMode: boolean;
  setChallengeMode: (val: boolean) => void;
  extraMinesAdded: number;
  onShuffle: () => void;
  onPauseToggle: () => void;
}

export default function Header({
  difficulty,
  setDifficulty,
  status,
  flagsCount,
  totalMines,
  time,
  clickMode,
  setClickMode,
  soundEnabled,
  setSoundEnabled,
  onRestart,
  onOpenStats,
  onOpenHowTo,
  onOpenSettings,
  onOpenAchievements,
  onOpenSoundboard,
  onOpenLeaderboard,
  onOpenProfile,
  jiaoAvatar,
  lang,
  setLang,
  onOpenEasterEgg,
  theme = 'classic',
  toggleTheme,
  jiaoStreak,
  challengeMode,
  setChallengeMode,
  extraMinesAdded,
  onShuffle,
  onPauseToggle,
}: HeaderProps) {
  const t: TranslationSet = translations[lang];

  // Determine Smiley Face based on status (represents Jiao Ge's customized tactical mood states!)
  const getSmiley = () => {
    switch (status) {
      case 'won':
        return '👴👑'; // Jiao Ge celebrating absolute graduation!
      case 'lost':
        return '😰💀'; // Nao Ma Le state, extreme numbness!
      case 'playing':
        return '👨‍💻⚡'; // Coding high-frequency capacitors!
      case 'paused':
        return '👴⏸️'; // Tactical paused state!
      case 'idle':
      default:
        return '👴✨'; // Calm Master Jiao Ge standby
    }
  };

  const getStatusText = () => {
    if (status === 'won') return t.winStatus;
    if (status === 'lost') return t.loseStatus;
    if (status === 'playing') return t.playingStatus;
    if (status === 'paused') return lang === 'en' ? 'PAUSED ⏸️' : lang === 'zh-TW' ? '已暫停 ⏸️' : '已暂停 ⏸️';
    return t.idleStatus;
  };

  const getDifficultyLabel = (diff: DifficultyType) => {
    if (diff === 'kids') return t.veryEasy;
    if (diff === 'easy') return t.easy;
    if (diff === 'medium') return t.medium;
    if (diff === 'hard') return t.hard;
    return t.veryHard;
  };

  const getJiaoDifficultyDescription = (diff: DifficultyType) => {
    switch (diff) {
      case 'kids':
        return lang === 'en'
          ? "👶 Jiao's Baby Camp: Safe tickrate, safe seismic capacitors. Play with absolute peace of mind."
          : lang === 'zh-TW'
            ? "👶 椒哥嬰兒營：避震防抖頻率高，開局絕對安全，適合萌新無傷體驗！"
            : "👶 椒哥婴儿营：避震防抖频率高，开局绝对安全，适合萌新无伤体验！";
      case 'easy':
        return lang === 'en'
          ? "🛡️ Capacitor Warmup: Standard 350ms static delay gesture protection initialized."
          : lang === 'zh-TW'
            ? "🛡️ 電容初級溫：350ms 拓撲避震抗抖動技術已就緒，適合手速入門解密！"
            : "🛡️ 电容初级温：350ms 拓扑避震抗抖动技术已就绪，适合手速入门解密！";
      case 'medium':
        return lang === 'en'
          ? "⚡ Yuan Bullet Rising: Density surges, keep your micro-control tight and hum pentatonics!"
          : lang === 'zh-TW'
            ? "⚡ 袁子彈初泛起：粒子能級上揚，考驗雙擊和弦與精準微操，學位證書略受波及！"
            : "⚡ 袁子弹初泛起：粒子能级上扬，考验双击和弦与精准微操，学位证书略受波及！";
      case 'hard':
        return lang === 'en'
          ? "💀 Academic Shield Warning: Severe threats detected. Degree is on the line!"
          : lang === 'zh-TW'
            ? "💀 學位大考區：雷區「袁子彈」活性飆至最高，大意踏雷全麻，準備推朝陽手推車！"
            : "💀 学位大考区：雷区「袁子弹」活性飙至最高，大意踏雷全麻，准备推朝阳手推车！";
      case 'expert':
        return lang === 'en'
          ? "👑 Pentatonic Apocalypse: Cascade sweep master zone. Request Master Jiao's grand blessing!"
          : lang === 'zh-TW'
            ? "👑 五階和弦終極共振禁區：諸神黃昏！非極智手速主宰不可生還，求椒哥庇佑大捷！"
            : "👑 五阶和弦终极共振禁区：诸神黄昏！非极智手速主宰不可生还，求椒哥庇佑大捷！";
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5 no-select" id="minesweeper-header">
      {/* Upper Branded Row: Compact height, centered items, beautiful toolbar */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 rounded border transition-all duration-300 ${
        theme === 'cyberpunk'
          ? 'rounded-xl bg-[#111326]/90 border-[#ff0055]/20 shadow-[0_0_15px_rgba(255,0,85,0.1)] text-white'
          : 'rounded-none bg-[#f3f4f6] border border-slate-300 shadow-none text-slate-800'
      }`}>
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-2">
            {/* Logo with Easter Egg Trigger click */}
            <div 
              onClick={onOpenEasterEgg}
              className={`flex items-center justify-center p-1.5 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 ${
                theme === 'cyberpunk'
                  ? 'bg-[#ff0055]/15 hover:bg-[#ff0055]/25 text-[#ff0055] border border-[#ff0055]/40 shadow-[0_0_8px_rgba(255,0,85,0.25)]'
                  : 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-500'
              }`}
              title={t.easterEggBtn}
            >
              <Award className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-[#e2e8f0] text-base md:text-lg tracking-tight flex items-center gap-1 select-none transition-all duration-200">
                {theme === 'cyberpunk' ? (
                  <>
                    {lang === 'en' ? (
                      <>
                        <span className="text-[#00f0ff] cyber-glow-cyan">YUAN SHIJIE</span>
                        <span className="text-[#ff00a2] cyber-glow-magenta font-black">NAO MA LE</span>
                      </>
                    ) : lang === 'zh-TW' ? (
                      <>
                        <span className="text-[#00f0ff] cyber-glow-cyan">袁世傑</span>
                        <span className="text-[#ff00a2] cyber-glow-magenta font-black">鬧麻了</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[#00f0ff] cyber-glow-cyan">袁世杰</span>
                        <span className="text-[#ff00a2] cyber-glow-magenta font-black">闹麻了</span>
                      </>
                    )}
                    <span className="hidden xs:inline text-[7px] font-mono font-black text-white bg-gradient-to-r from-[#9d4edd] via-[#ff00a2] to-[#ffea00] px-1 py-0.2 rounded-sm ml-1.5 tracking-wider uppercase shadow-[0_0_8px_rgba(255,0,162,0.4)]">
                      NEON
                    </span>
                  </>
                ) : lang === 'en' ? (
                  <>
                    <span className="text-[#4285F4]">Y</span>
                    <span className="text-[#EA4335]">u</span>
                    <span className="text-[#FBBC05]">a</span>
                    <span className="text-[#4285F4]">n</span>
                    <span className="text-slate-400 font-sans mx-0.5"> </span>
                    <span className="text-[#34A853]">S</span>
                    <span className="text-[#EA4335]">h</span>
                    <span className="text-[#4285F4]">i</span>
                    <span className="text-[#FBBC05]">j</span>
                    <span className="text-[#34A853]">i</span>
                    <span className="text-[#EA4335]">e</span>
                  </>
                ) : lang === 'zh-TW' ? (
                  <>
                    <span className="text-[#4285F4]">袁</span>
                    <span className="text-[#EA4335]">世</span>
                    <span className="text-[#FBBC05]">傑</span>
                    <span className="text-[#4285F4]">鬧</span>
                    <span className="text-[#34A853]">麻</span>
                    <span className="text-[#EA4335]">了</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#4285F4]">袁</span>
                    <span className="text-[#EA4335]">世</span>
                    <span className="text-[#FBBC05]">杰</span>
                    <span className="text-[#4285F4]">闹</span>
                    <span className="text-[#34A853]">麻</span>
                    <span className="text-[#EA4335]">了</span>
                  </>
                )}
              </h1>
              <p 
                onClick={onOpenEasterEgg}
                className={`text-[9px] font-mono tracking-wide mt-0.2 cursor-pointer flex items-center gap-1 transition-colors group ${
                  theme === 'cyberpunk'
                    ? 'text-slate-400 hover:text-[#00f0ff]'
                    : 'text-slate-400 hover:text-amber-500'
                }`}
              >
                {theme === 'cyberpunk' ? (
                  <>
                    <span className="text-[#ff0055] font-black">{">"}</span>
                    <span>SYS_SWEEPER_v2.8</span>
                  </>
                ) : (
                  <span>{t.subtitle}</span>
                )}
              </p>
            </div>
          </div>

          {/* Micro Active Streak indicators showing right next to Title on Mobile */}
          {jiaoStreak > 0 && (
            <div className={`px-2 py-0.5 sm:px-2.5 sm:py-0.8 rounded-full text-[10px] font-mono font-black flex items-center gap-1 shrink-0 ${
              theme === 'cyberpunk'
                ? 'bg-[#ff0055]/15 text-[#ffea00] border border-[#ff0055]/30'
                : 'bg-amber-600 text-white shadow-xs font-black'
            }`}>
              <span>🔥</span>
              <span>{jiaoStreak}</span>
            </div>
          )}
        </div>

        {/* Language Selectors & Action Controls Toolbar */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2 bg-[#000000]/10 p-1 rounded-xl sm:bg-transparent sm:p-0">
          {/* Flat Localisation Switcher */}
          <div className={`flex items-center rounded-lg p-0.5 border ${
            theme === 'cyberpunk'
              ? 'bg-[#080a14] border-[#ff0055]/15'
              : 'bg-[#f1f3f4] border-slate-200'
          }`}>
            {(['zh-CN', 'zh-TW', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-1.5 py-0.5 rounded-md text-[8px] font-display font-extrabold transition-all cursor-pointer ${
                  lang === l
                    ? theme === 'cyberpunk'
                      ? 'bg-[#ff0055] text-white shadow-[0_0_6px_#ff0055] font-black'
                      : 'bg-slate-900 text-amber-300 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={l === 'zh-CN' ? '简体中文' : l === 'zh-TW' ? '繁體中文' : 'English'}
              >
                {l === 'zh-CN' ? '简' : l === 'zh-TW' ? '繁' : 'EN'}
              </button>
            ))}
          </div>

          {/* Unified micro buttons container */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Theme Toggle Button */}
            {toggleTheme && (
              <button
                id="theme-toggle-btn"
                onClick={toggleTheme}
                className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[9px] font-display font-black transition-all cursor-pointer border ${
                  theme === 'cyberpunk'
                    ? 'bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/30 shadow-[0_0_6px_rgba(0,240,255,0.15)]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title="Toggle Cyberpunk Mode"
              >
                {theme === 'cyberpunk' ? (
                  <Gamepad2 className="w-3.5 h-3.5 text-[#00f0ff]" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#ff0055]" />
                )}
              </button>
            )}

            {/* Audio toggle */}
            <JiaoTooltip content="[Jiao Ge]: Toggle audio output. Hear the legendary Jiao Ge pulses!">
              <button
                id="audio-toggle-btn"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border transition-colors cursor-pointer ${
                  theme === 'cyberpunk'
                    ? soundEnabled
                      ? 'bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/30 shadow-[0_0_6px_rgba(0,240,255,0.15)] bg-cyan-950/20'
                      : 'bg-[#151726]/80 text-slate-400 border-slate-700/40 hover:bg-[#1f2136]'
                    : soundEnabled
                      ? 'text-[#34A853] border-[#34A853]/25 bg-[#34A853]/5'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                }`}
                title={soundEnabled ? 'Sound On' : 'Sound Off'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </JiaoTooltip>

            {/* Achievements Wall Button */}
            <JiaoTooltip content="[Jiao Ge]: Inspect your glorious milestone achievements!">
              <button
                id="achievements-modal-btn"
                onClick={onOpenAchievements}
                className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                  theme === 'cyberpunk'
                    ? 'border-[#ffea00]/30 bg-[#ffea00]/10 text-[#ffea00] shadow-[0_0_6px_rgba(255,234,0,0.2)] hover:bg-[#ffea00]/20'
                    : 'border-amber-250 bg-amber-50 hover:bg-amber-100 text-amber-600'
                }`}
                title={lang === 'en' ? "Achievements" : "微操成就"}
              >
                <Trophy className="w-3.5 h-3.5" />
              </button>
            </JiaoTooltip>

            {/* Jiao Ge Soundboard Modal Trigger Button */}
            <JiaoTooltip content="[Jiao Ge]: Access the ultimate voice calibration module!">
              <button
                id="soundboard-modal-btn"
                onClick={onOpenSoundboard}
                className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                  theme === 'cyberpunk'
                    ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.2)] hover:bg-cyan-500/20'
                    : 'border-[#4285F4]/25 bg-[#4285F4]/5 hover:bg-[#4285F4]/15 text-[#4285F4]'
                }`}
                title={lang === 'en' ? "Jiao Ge Soundboard" : "和弦发声板"}
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
              </button>
            </JiaoTooltip>

            {/* Global Jiao Leaderboard Trigger Button */}
            <button
              id="global-leaderboard-btn"
              onClick={onOpenLeaderboard}
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                theme === 'cyberpunk'
                  ? 'border-yellow-400/40 bg-yellow-400/10 text-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.2)] hover:bg-yellow-400/20'
                  : 'border-amber-400/30 bg-amber-50 hover:bg-amber-100 text-amber-600'
              }`}
              title={lang === 'en' ? "Global Jiao Leaderboard" : "名人堂"}
            >
              <Globe className="w-3.5 h-3.5" />
            </button>

            {/* User Profile Avatar Trigger Button */}
            <button
              id="profile-avatar-btn"
              onClick={onOpenProfile}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center text-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                theme === 'cyberpunk'
                  ? 'border-fuchsia-400/40 bg-fuchsia-500/10 shadow-[0_0_6px_rgba(232,121,249,0.2)] hover:bg-fuchsia-500/20'
                  : 'border-fuchsia-300 bg-fuchsia-50 hover:bg-fuchsia-100/80'
              }`}
              title={lang === 'en' ? "Change Profile Avatar" : "極智頭像"}
            >
              <span className="leading-none text-sm">{jiaoAvatar}</span>
            </button>

            {/* Settings */}
            <JiaoTooltip content="[Jiao Ge]: Configure tactical system preferences!">
              <button
                id="settings-modal-btn"
                onClick={onOpenSettings}
                className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border transition-colors cursor-pointer ${
                  theme === 'cyberpunk'
                    ? 'border-[#ff0055]/25 bg-[#151726]/85 hover:bg-[#1f2136] text-[#ff0055]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                }`}
                title="Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </JiaoTooltip>

            {/* How to Play */}
            <JiaoTooltip content="[Jiao Ge]: Read the holy scriptures of Mine-Sweeping!">
              <button
                id="how-to-play-btn"
                onClick={onOpenHowTo}
                className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border transition-colors cursor-pointer ${
                  theme === 'cyberpunk'
                    ? 'border-[#ff0055]/25 bg-[#151726]/85 hover:bg-[#1f2136] text-[#ff0055]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                }`}
                title="How to Play"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </JiaoTooltip>
          </div>
        </div>
      </div>

      {/* Central Integrated HUD Console Row - Minesweeper Classic Layout but Hyper-Slick */}
      <div className={`w-full grid grid-cols-3 items-center justify-between px-4 py-2 rounded border transition-all duration-300 ${
        theme === 'cyberpunk'
          ? 'rounded-xl bg-[#0f111a]/95 border-[#ff0055]/20 shadow-[0_0_15px_rgba(255,0,85,0.1)] text-white'
          : 'rounded-none bg-[#e5e7eb] border-2 border-slate-400 shadow-inner text-slate-800'
      }`}>
        {/* Left: Flags Remaining LCD Panel */}
        <div className="flex items-center gap-1.5 justify-self-start select-none">
          <span className={`text-[9px] uppercase font-bold text-slate-400 font-display hidden xs:inline`}>
            {t.flagsLeft}
          </span>
          <div className={`px-2.5 py-0.5 rounded-md font-mono font-black text-lg tracking-widest ${
            theme === 'cyberpunk' ? 'bg-black/40 text-[#ff33aa] border border-[#ff00a2]/30 cyber-glow-pink font-extrabold' : 'bg-slate-100 text-[#EA4335] border border-slate-200'
          }`}>
            {Math.max(0, totalMines - flagsCount).toString().padStart(3, '0')}
          </div>
        </div>

        {/* Center: Interactive Custom Smiley Reset Pill & Shuffle Board Option */}
        <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
          <JiaoTooltip content="[Jiao Ge]: Reset the grid matrix!">
            <button
              id="game-restart-center-btn"
              onClick={onRestart}
              className={`px-3.5 py-1.5 rounded-full font-display font-black text-[10px] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer border shadow-xs active:scale-95 group shrink-0 ${
                theme === 'cyberpunk'
                  ? 'bg-gradient-to-r from-[#ff0055] to-[#ff00aa] border-transparent text-white hover:shadow-[0_0_12px_rgba(255,0,85,0.5)] font-black'
                  : 'hover:bg-slate-50 text-slate-700 border-slate-200 bg-white'
              }`}
              title="Reset Game"
            >
              <span className="text-base leading-none transition-transform group-hover:scale-120 duration-200">{getSmiley()}</span>
              <span>{lang === 'en' ? 'Reset' : lang === 'zh-TW' ? '重置' : '重置'}</span>
            </button>
          </JiaoTooltip>

          <JiaoTooltip content="[Jiao Ge]: Shuffle board matrix but preserve your streaks and history progress!">
            <button
              id="game-shuffle-center-btn"
              onClick={onShuffle}
              className={`px-3.5 py-1.5 rounded-full font-display font-black text-[10px] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer border shadow-xs active:scale-95 group shrink-0 ${
                theme === 'cyberpunk'
                  ? 'bg-[#0f111a] hover:bg-[#1f2136] border-[#00f0ff]/30 text-[#00f0ff] hover:shadow-[0_0_12px_rgba(0,240,255,0.3)] font-black'
                  : 'bg-amber-50 hover:bg-amber-100/90 text-amber-800 border-amber-200/50 hover:border-amber-300 font-bold'
              }`}
              title="Shuffle Board"
            >
              <span className="text-sm leading-none transition-transform group-hover:rotate-180 duration-500">🎋</span>
              <span>{lang === 'en' ? 'Shuffle' : lang === 'zh-TW' ? '隨機洗牌' : '随机洗牌'}</span>
            </button>
          </JiaoTooltip>

          {(status === 'playing' || status === 'paused') && (
            <JiaoTooltip content={status === 'paused' ? "[Jiao Ge]: Resume the game timer and continue unearthing Yuan Bullets!" : "[Jiao Ge]: Pause gameplay, freezes time in the safe dimension!"}>
              <button
                id="game-pause-center-btn"
                onClick={onPauseToggle}
                className={`px-3.5 py-1.5 rounded-full font-display font-black text-[10px] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer border shadow-xs active:scale-95 group shrink-0 ${
                  theme === 'cyberpunk'
                    ? status === 'paused'
                      ? 'bg-gradient-to-r from-[#00f0ff] to-[#00aafe] border-transparent text-white hover:shadow-[0_0_12px_rgba(0,240,255,0.5)] font-black animate-pulse'
                      : 'bg-[#0f111a] hover:bg-[#1f2136] border-[#ff00bb]/30 text-[#ff00bb] hover:shadow-[0_0_12px_rgba(255,0,187,0.3)] font-black'
                    : status === 'paused'
                      ? 'bg-emerald-500 hover:bg-emerald-600 border-transparent text-white font-bold animate-pulse'
                      : 'hover:bg-slate-50 text-slate-700 border-slate-200 bg-white'
                }`}
                title={status === 'paused' ? "Resume Game" : "Pause Game"}
              >
                {status === 'paused' ? (
                  <>
                    <span className="text-xs leading-none transition-transform group-hover:scale-120 duration-200">▶️</span>
                    <span>{lang === 'en' ? 'Resume' : lang === 'zh-TW' ? '繼續' : '继续'}</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs leading-none transition-transform group-hover:scale-120 duration-200">⏸️</span>
                    <span>{lang === 'en' ? 'Pause' : lang === 'zh-TW' ? '暫停' : '暂停'}</span>
                  </>
                )}
              </button>
            </JiaoTooltip>
          )}
        </div>

        {/* Right: Time Elapsed LCD Panel */}
        <div className="flex items-center gap-1.5 justify-self-end select-none">
          <span className={`text-[9px] uppercase font-bold text-slate-400 font-display hidden xs:inline`}>
            {t.timeElapsed}
          </span>
          <div className={`px-2.5 py-0.5 rounded-md font-mono font-black text-lg tracking-widest ${
            theme === 'cyberpunk' ? 'bg-black/40 text-[#ffee00] border border-[#ffee00]/30 cyber-glow-yellow font-extrabold' : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}>
            {time.toString().padStart(3, '0')}
          </div>
        </div>
      </div>

      {/* Play Mode & Difficulty Settings Controller Bar */}
      <div className={`p-2 border flex flex-col md:flex-row md:items-center justify-between transition-all duration-300 gap-2.5 rounded ${
        theme === 'cyberpunk'
          ? 'rounded-xl bg-[#0f1124]/90 border-[#ff00bb]/15 text-white'
          : 'rounded-none bg-[#f3f4f6] border border-slate-300 shadow-none'
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Chinese-themed Board Size Selector Section */}
          <div className="flex flex-col gap-1 shrink-0">
            <span className={`text-[9px] font-display font-extrabold uppercase tracking-wider flex items-center gap-1 ${
              theme === 'cyberpunk' ? 'text-[#00f0ff]' : 'text-amber-800'
            }`}>
              <span>🎋</span>
              <span>{lang === 'en' ? 'Board Matrix Size' : lang === 'zh-TW' ? '極智板幅規格' : '极智板幅规格'}</span>
            </span>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Tab Selector implementation */}
              <div className={`p-0.5 rounded-lg border inline-flex gap-0.5 ${
                theme === 'cyberpunk'
                  ? 'bg-[#080a14] border-[#00f0ff]/15'
                  : 'bg-[#f1f3f4] border-slate-200'
              }`}>
                {(['mini', 'junior', 'pro'] as const).map((size) => {
                  const getActiveSize = () => {
                    if (difficulty === 'kids' || difficulty === 'easy') return 'mini';
                    if (difficulty === 'medium') return 'junior';
                    return 'pro';
                  };
                  const isSizeActive = getActiveSize() === size;
                  
                  const handleSizeSelect = () => {
                    if (size === 'mini') {
                      setDifficulty('easy');
                    } else if (size === 'junior') {
                      setDifficulty('medium');
                    } else if (size === 'pro') {
                      setDifficulty('hard');
                    }
                  };

                  const getLabel = () => {
                    if (size === 'mini') {
                      return lang === 'en' ? 'Mini 袖珍' : lang === 'zh-TW' ? '袖珍盤 Mini' : '袖珍盘 Mini';
                    }
                    if (size === 'junior') {
                      return lang === 'en' ? 'Junior 常規' : lang === 'zh-TW' ? '常規盤 Junior' : '常规盘 Junior';
                    }
                    return lang === 'en' ? 'Pro 專業' : lang === 'zh-TW' ? '極智盤 Pro' : '极智盘 Pro';
                  };

                  const getCyberStyle = () => {
                    if (size === 'mini') return 'bg-[#00f0ff] text-[#080a14] shadow-[0_0_6px_#00f0ff] font-black';
                    if (size === 'junior') return 'bg-[#ffee00] text-slate-950 shadow-[0_0_6px_#ffee00] font-black';
                    return 'bg-[#ff0055] text-white shadow-[0_0_6px_#ff0055] font-black';
                  };

                  const getClassicStyle = () => {
                    if (size === 'mini') return 'bg-blue-500 text-white shadow-inner font-bold border border-blue-600 rounded';
                    if (size === 'junior') return 'bg-amber-500 text-white shadow-inner font-bold border border-amber-600 rounded';
                    return 'bg-red-500 text-white shadow-inner font-bold border border-red-600 rounded';
                  };

                  return (
                    <button
                      key={size}
                      id={`size-tab-${size}`}
                      onClick={handleSizeSelect}
                      className={`px-3 py-1 rounded-md text-[10px] font-display font-black transition-all duration-150 outline-none cursor-pointer shrink-0 ${
                        isSizeActive
                          ? theme === 'cyberpunk'
                            ? getCyberStyle()
                            : getClassicStyle()
                          : theme === 'cyberpunk'
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-[#ff0055]/5'
                            : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-800'
                      }`}
                    >
                      {getLabel()}
                    </button>
                  );
                })}
              </div>

              {/* Advanced Fine-Tuning Dropdown Selector */}
              <div className="relative">
                <select
                  id="advanced-difficulty-dropdown"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyType)}
                  className={`text-[10px] font-display font-[#000000] py-1 px-2.5 rounded-lg border cursor-pointer outline-none transition-all ${
                    theme === 'cyberpunk'
                      ? 'bg-[#0f111a] border-[#ff0055]/30 text-[#00f0ff] hover:border-[#ff0055]/60'
                      : 'bg-white border-slate-350 text-slate-800 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <option value="kids">
                    {lang === 'en' ? '👶 Kids / Very Easy (6x6)' : lang === 'zh-TW' ? '👶 嬰兒營 (6x6)' : '👶 婴儿营 (6x6)'}
                  </option>
                  <option value="easy">
                    {lang === 'en' ? '🛡️ Mini / Easy (8x10)' : lang === 'zh-TW' ? '🛡️ 袖珍盤 (8x10)' : '🛡️ 袖珍盘 (8x10)'}
                  </option>
                  <option value="medium">
                    {lang === 'en' ? '⚡ Junior / Medium (14x18)' : lang === 'zh-TW' ? '⚡ 常規盤 (14x18)' : '⚡ 常规盘 (14x18)'}
                  </option>
                  <option value="hard">
                    {lang === 'en' ? '💀 Pro / Hard (20x24)' : lang === 'zh-TW' ? '💀 極智盤 (20x24)' : '💀 极智盘 (20x24)'}
                  </option>
                  <option value="expert">
                    {lang === 'en' ? '👑 God / Expert (24x30)' : lang === 'zh-TW' ? '👑 終極共振 (24x30)' : '👑 终极共振 (24x30)'}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <p className={`text-[9px] font-mono leading-tight px-1 max-w-[200px] sm:max-w-xs truncate hidden lg:block ${
            theme === 'cyberpunk' ? 'text-[#00f0ff]/70' : 'text-slate-500'
          }`} title={getJiaoDifficultyDescription(difficulty)}>
            {getJiaoDifficultyDescription(difficulty)}
          </p>
        </div>

        {/* Dual Tool Click Mode & Challenge Toggle controls */}
        <div className="flex items-center justify-between md:justify-end gap-3 select-none">
          {/* Challenge Mode switch toggle alongside */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[9px] font-display font-extrabold uppercase tracking-wider flex items-center gap-0.5 ${
              theme === 'cyberpunk' ? 'text-[#ffee00]' : 'text-amber-800'
            }`}>
              <Sparkles className="w-2.5 h-2.5" />
              <span>{t.challengeModeTitle}</span>
            </span>
            {jiaoStreak > 0 && challengeMode && (
              <span className="text-[10px] font-mono font-bold text-red-500">
                +{extraMinesAdded} 雷
              </span>
            )}
            <button
              onClick={() => setChallengeMode(!challengeMode)}
              className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-1 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                challengeMode
                  ? theme === 'cyberpunk'
                    ? 'bg-[#ffee00] shadow-[0_0_6px_rgba(255,234,0,0.3)]'
                    : 'bg-amber-500'
                  : 'bg-slate-300 dark:bg-slate-800'
              }`}
              role="switch"
              aria-checked={challengeMode}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-205 ease-in-out ${
                  challengeMode ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className={`p-0.5 rounded-lg border inline-flex gap-0.5 shadow-sm transition-all shrink-0 ${
            theme === 'cyberpunk'
              ? 'bg-[#080a14] border-[#00f0ff]/15'
              : 'bg-[#f1f3f4] border-slate-200'
          }`}>
            <JiaoTooltip content="[Jiao Ge]: Left-click to deploy seismic capacitors here!">
              <button
                id="mode-toggle-shovel"
                onClick={() => setClickMode('shovel')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-display font-black text-[10px] transition-all duration-150 outline-none cursor-pointer ${
                  clickMode === 'shovel'
                    ? theme === 'cyberpunk'
                        ? 'bg-[#00f0ff] text-[#080a14] shadow-[0_0_6px_#00f0ff]'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-300 rounded'
                    : theme === 'cyberpunk'
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                <Spade className="w-3 h-3" fill={clickMode === 'shovel' ? (theme === 'cyberpunk' ? '#080a14' : '#4285F4') : 'transparent'} />
                <span>{t.unearth}</span>
              </button>
            </JiaoTooltip>
            <JiaoTooltip content="[Jiao Ge]: Mark the 'Yuan-Bullet' with a Jiao Ge flag!">
              <button
                id="mode-toggle-flag"
                onClick={() => setClickMode('flag')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-display font-black text-[10px] transition-all duration-150 outline-none cursor-pointer ${
                  clickMode === 'flag'
                    ? theme === 'cyberpunk'
                      ? 'bg-[#ff0055] text-white shadow-[0_0_6px_#ff0055]'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-300 rounded font-bold'
                    : theme === 'cyberpunk'
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                <span className={`text-[10px] font-black select-none ${
                  clickMode === 'flag' 
                    ? theme === 'cyberpunk' ? 'text-white font-black' : 'text-[#EA4335] font-black' 
                    : 'text-slate-400 font-bold'
                }`}>椒</span>
                <span>{t.placeFlags}</span>
              </button>
            </JiaoTooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
