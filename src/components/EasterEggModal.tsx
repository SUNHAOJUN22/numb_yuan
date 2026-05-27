import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Award, Music } from 'lucide-react';
import { Language } from '../utils/i18n';
import { playSound } from '../utils/audio';

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  soundEnabled: boolean;
}

export default function EasterEggModal({ isOpen, onClose, lang, soundEnabled }: EasterEggModalProps) {
  const [pulseHero, setPulseHero] = useState(false);

  useEffect(() => {
    if (isOpen) {
      playSound.easterEgg(soundEnabled);
      setPulseHero(true);
      const timer = setTimeout(() => setPulseHero(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  // Multi-lingual content specifically for the Easter Egg
  const content = {
    'zh-CN': {
      title: '椒哥专属极智物理引擎彩蛋 🥚',
      designer: '软件程序设计: 椒哥 (Design by 椒哥)',
      congrats: '恭喜你！踩中彩蛋了！✨',
      desc: '此应用程式由主程【极智大师 椒哥】精心制作，进行了高强度的底层性能与跨端触控优化。完美适配 iOS Safari、Android Chrome、Windows Edge 及 macOS 各种移动/桌面端设备！',
      feature1: '📱 极速手势响应：独创 350ms 无拖曳触屏长按（Long-press）标旗机制，完美跳过 iOS 双击缩放，告别 300ms 触控时延！',
      feature2: '🔊 iOS 音频唤醒：动态恢复 Web Audio 播放器上下文状态，解决苹果内核在静音键或非首发交互时无法播放粒子声效的陈年顽疾。',
      feature3: '📐 抗破产安全第一击：利用安全区拓扑算法，确保无论在手机屏幕如何误触点下，第一铲必为 3x3 级大面积开阔安全带。',
      feature4: '🎹 逆天和弦（Chord）微操：双击数字格可极速连锁排雷。键盘按 R 键重开，按 F 反向切刀，微操流畅度堪比竞技电竞。',
      audioBtn: '聆听椒哥的五阶和弦 🎵',
      approval: '椒哥认证通过!👍',
      done: '椒哥带飞，继续探雷',
    },
    'zh-TW': {
      title: '椒哥專屬極智物理引擎彩蛋 🥚',
      designer: '軟體程序設計: 椒哥 (Design by 椒哥)',
      congrats: '恭喜你！踩中彩蛋了！✨',
      desc: '此應用程式由主程【極智大師 椒哥】精心製作，進行了高強度的底層性能與跨端觸控優化。完美適配 iOS Safari、Android Chrome、Windows Edge 及 macOS 各種移動/桌面端設備！',
      feature1: '📱 極速手勢響應：獨創 350ms 無拖曳觸屏長按（Long-press）標旗機制，完美跳過 iOS 雙擊縮放，告別 300ms 觸控時延！',
      feature2: '🔊 iOS 音頻喚醒：動態恢復 Web Audio 播放器上下文狀態，解決蘋果內核在靜音鍵或非首發交互時無法播放粒子聲效的陳年頑疾。',
      feature3: '📐 抗破產安全第一擊：利用安全區拓撲演算法，確保無論在手機螢幕如何誤觸點下，第一鏟必為 3x3 級大面積開闊安全帶。',
      feature4: '🎹 逆天和弦（Chord）微操：雙擊數字格可極速連鎖排雷。鍵盤按 R 鍵重開，按 F 反向切刀，微操流暢度堪比競技電競。',
      audioBtn: '聆聽椒哥的五階和弦 🎵',
      approval: '椒哥認證通過!👍',
      done: '椒哥帶飛，繼續探雷',
    },
    'en': {
      title: "Jiao Ge's Exclusive Hardcore Bonus 🥚",
      designer: 'Software Architecture: Jiao Ge (Design by Jiao Ge)',
      congrats: 'Congratulations! You triggered the Easter Egg! ✨',
      desc: 'This application is meticulously engineered & tuned by Lead Architect, Master Jiao Ge. Designed to operate flawlessly on iOS, Android, macOS, and Windows with extreme frame density.',
      feature1: '📱 Ultra Gestural Feed: Custom 350ms static Long-press algorithm for native flagging on touch screens. Sidesteps mobile zoom delay.',
      feature2: '🔊 Apple Audio Context Rescue: Restores suspended Web Audio policy on Safari, fixing silent sound issues on iPhones & iPads.',
      feature3: '📐 Safety First Strike: Re-routed seed generator ensures 100% boundary safety, guaranteed 3x3 expansion on first action.',
      feature4: '🎹 Chord Flash Combo: Double-clicks trigger immediate chains. Keyboard bindings [R] and [F] make it an e-sports grade sweeper.',
      audioBtn: "Hear Jiao Ge's Pentatonic Chime 🎵",
      approval: 'Jiao Ge Approved! 👍',
      done: "Back to Sweep",
    }
  };

  const t = content[lang] || content['en'];

  // Generated simple floating emojis for ambient decoration
  const starsArray = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div 
      id="easter-egg-overlay" 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 no-select animate-fade-in touch-none"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-3xl shadow-2xl relative border-2 border-amber-400 p-6 md:max-h-[92vh] max-h-[96vh] overflow-y-auto flex flex-col gap-5 google-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top ambient sparkles */}
        {starsArray.map((i) => (
          <motion.div
            key={i}
            className="absolute text-amber-300 text-sm pointer-events-none opacity-80"
            style={{
              top: `${15 + (i * 11) % 60}%`,
              left: `${8 + (i * 23) % 85}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.4, 0.9, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2.5 + (i % 3),
              repeat: Infinity,
              delay: i * 0.4,
            }}
          >
            ⭐
          </motion.div>
        ))}

        {/* Closing Button on Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-full transition-colors cursor-pointer"
          id="close-easter-egg-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Egg Title Banner */}
        <div className="flex flex-col items-center text-center mt-3">
          <motion.div
            animate={pulseHero ? { scale: [1, 1.25, 1], rotate: [0, -15, 15, 0] } : {}}
            transition={{ duration: 0.6 }}
            className="w-16 h-16 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-full flex items-center justify-center text-slate-900 shadow-md border-2 border-white/30 cursor-pointer"
            onClick={() => {
              setPulseHero(true);
              playSound.easterEgg(soundEnabled);
              setTimeout(() => setPulseHero(false), 600);
            }}
          >
            <Award className="w-9 h-9" />
          </motion.div>
          <span className="text-xs font-display font-extrabold uppercase tracking-widest text-[#FBBC05] mt-3">
            {t.congrats}
          </span>
          <h2 className="font-display font-extrabold text-lg md:text-xl text-white mt-1 select-none">
            {t.title}
          </h2>
          <span className="text-xs text-amber-200/95 font-semibold font-mono tracking-wide mt-1 bg-amber-500/10 border border-amber-400/20 px-3 py-1 rounded-full">
            {t.designer}
          </span>
        </div>

        {/* Content Paragraph */}
        <div className="text-xs text-slate-200/90 leading-relaxed font-sans px-2 text-center bg-slate-950/40 p-3.5 rounded-2xl border border-slate-700/30">
          {t.desc}
        </div>

        {/* Compatibility highlight bullet points */}
        <div className="flex flex-col gap-3 font-sans mt-1">
          <div className="bg-slate-950/20 rounded-2xl p-4 border border-slate-700/20 flex flex-col gap-3.5 text-xs text-slate-300/95 leading-relaxed">
            <p className="flex items-start gap-2.5">
              <span>{t.feature1}</span>
            </p>
            <p className="flex items-start gap-2.5">
              <span>{t.feature2}</span>
            </p>
            <p className="flex items-start gap-2.5">
              <span>{t.feature3}</span>
            </p>
            <p className="flex items-start gap-2.5">
              <span>{t.feature4}</span>
            </p>
          </div>
        </div>

        {/* Interactive sound arpeggio chord player */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mt-2.5">
          <button
            onClick={() => {
              setPulseHero(true);
              playSound.easterEgg(soundEnabled);
              setTimeout(() => setPulseHero(false), 650);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 text-xs font-display font-extrabold cursor-pointer transition-all shadow-md group border border-white/20"
            id="play-easter-audio-btn"
          >
            <Music className="w-4 h-4 text-slate-900 group-hover:animate-bounce" />
            <span>{t.audioBtn}</span>
          </button>

          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full cursor-pointer animate-pulse">
            {t.approval}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-display font-bold transition-colors cursor-pointer text-center border border-white/10"
          id="easter-ok-btn"
        >
          {t.done}
        </button>
      </motion.div>
    </div>
  );
}
