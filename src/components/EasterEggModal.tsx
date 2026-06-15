import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Award, Music } from 'lucide-react';
import { Language } from '../utils/i18n';
import { playSound } from '../utils/audio';
import JiaoGeSaysMinigame from './JiaoGeSaysMinigame';

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  soundEnabled: boolean;
  theme?: 'classic' | 'cyberpunk';
}

export default function EasterEggModal({ isOpen, onClose, lang, soundEnabled, theme = 'classic' }: EasterEggModalProps) {
  const [pulseHero, setPulseHero] = useState(false);
  const [fortune, setFortune] = useState<any>(null);
  const [synthClicks, setSynthClicks] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('jiaoge_synth_clicks') || '0');
    } catch {
      return 0;
    }
  });

  const handlePlaySynth = (soundFunc: () => void) => {
    soundFunc();
    const nextClicks = synthClicks + 1;
    setSynthClicks(nextClicks);
    try {
      localStorage.setItem('jiaoge_synth_clicks', String(nextClicks));
      if (nextClicks >= 10) {
        const stored = localStorage.getItem('jiaoge_unlocked_achievements');
        let unlocked: string[] = stored ? JSON.parse(stored) : [];
        if (!unlocked.includes('chord_synth')) {
          unlocked.push('chord_synth');
          localStorage.setItem('jiaoge_unlocked_achievements', JSON.stringify(unlocked));
        }
      }
    } catch (e) {}
  };

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
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 no-select animate-fade-in touch-none transition-colors duration-300 ${
        theme === 'cyberpunk' ? 'bg-[#06070d]/80' : 'bg-slate-900/70'
      }`}
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        className={`w-full max-w-lg text-white rounded-3xl relative p-6 md:max-h-[92vh] max-h-[96vh] overflow-y-auto flex flex-col gap-5 transition-all duration-300 ${
          theme === 'cyberpunk'
            ? 'bg-[#0f111a]/95 border-2 border-[#00f0ff] shadow-[0_0_25px_rgba(0,240,255,0.3)]'
            : 'bg-gradient-to-b from-slate-900 to-slate-800 border bg-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top ambient sparkles */}
        {starsArray.map((i) => (
          <motion.div
            key={i}
            className={`absolute text-sm pointer-events-none opacity-80 ${theme === 'cyberpunk' ? 'text-[#00f0ff]' : 'text-amber-300'}`}
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
            {theme === 'cyberpunk' ? '✦' : '⭐'}
          </motion.div>
        ))}

        {/* Closing Button on Top Right */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors cursor-pointer ${
            theme === 'cyberpunk'
              ? 'text-slate-400 hover:text-[#00f0ff] bg-slate-800/80 hover:bg-[#00f0ff]/10'
              : 'text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80'
          }`}
          id="close-easter-egg-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Egg Title Banner */}
        <div className="flex flex-col items-center text-center mt-3">
          <motion.div
            animate={pulseHero ? { scale: [1, 1.25, 1], rotate: [0, -15, 15, 0] } : {}}
            transition={{ duration: 0.6 }}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-slate-900 shadow-md border-2 cursor-pointer transition-all duration-300 ${
              theme === 'cyberpunk'
                ? 'bg-gradient-to-br from-[#00f0ff] to-[#ff00bb] text-slate-950 border-[#00f0ff]/40 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-900 border-white/30'
            }`}
            onClick={() => {
              setPulseHero(true);
              playSound.easterEgg(soundEnabled);
              setTimeout(() => setPulseHero(false), 600);
            }}
          >
            <Award className="w-9 h-9" />
          </motion.div>
          <span className={`text-xs font-display font-extrabold uppercase tracking-widest mt-3 ${
            theme === 'cyberpunk' ? 'text-[#ff00bb] cyber-glow-magenta' : 'text-[#FBBC05]'
          }`}>
            {t.congrats}
          </span>
          <h2 className={`font-display font-extrabold text-lg md:text-xl mt-1 select-none ${
            theme === 'cyberpunk' ? 'text-[#00f0ff] cyber-glow-cyan' : 'text-white'
          }`}>
            {t.title}
          </h2>
          <span className={`text-xs font-semibold font-mono tracking-wide mt-1 px-3 py-1 rounded-full border ${
            theme === 'cyberpunk'
              ? 'text-amber-300 bg-amber-500/10 border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
              : 'text-amber-200/95 bg-amber-500/10 border-amber-400/20'
          }`}>
            {t.designer}
          </span>
        </div>

        {/* Content Paragraph */}
        <div className={`text-xs leading-relaxed font-sans px-2 text-center p-3.5 rounded-2xl border transition-colors ${
          theme === 'cyberpunk'
            ? 'bg-[#121422] border-[#00f0ff]/20 text-slate-200'
            : 'bg-slate-950/40 border-slate-700/30 text-slate-200/90'
        }`}>
          {t.desc}
        </div>

        {/* Compatibility highlight bullet points */}
        <div className="flex flex-col gap-3 font-sans mt-1">
          <div className={`rounded-2xl p-4 border flex flex-col gap-3.5 text-xs text-slate-300/95 leading-relaxed transition-colors ${
            theme === 'cyberpunk'
              ? 'bg-[#121422]/60 border-[#ff0055]/20'
              : 'bg-slate-950/20 border-slate-700/20'
          }`}>
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

        {/* Interactive Jiao Ge Pentatonic Soundboard Keyboard */}
        <div className={`rounded-2xl p-4 mt-1 border flex flex-col gap-3 transition-colors ${
          theme === 'cyberpunk'
            ? 'bg-[#121422] border-[#00f0ff]/25'
            : 'bg-slate-950/40 border-slate-700/20'
        }`}>
          <div className="flex items-center gap-1.5 select-none text-[10px] font-mono font-black uppercase text-amber-300">
            <span className="animate-spin text-xs">⚙️</span>
            <span>
              {lang === 'en' 
                ? "Jiao Ge's Pentatonic Synthesizer Controller" 
                : lang === 'zh-TW' 
                  ? "椒哥極智五階和弦合成器主控台" 
                  : "椒哥极智五阶和弦合成器主控台"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 select-none">
            {/* Bass Key */}
            <button
              onClick={() => handlePlaySynth(() => playSound.jiaoBass(soundEnabled))}
              className={`py-2 px-1 rounded-xl text-[10px] font-mono font-black cursor-pointer transition-all border ${
                theme === 'cyberpunk'
                  ? 'border-[#ff00a2]/30 hover:border-[#ff00a2] bg-[#ff00a2]/5 text-[#ff00a2] hover:shadow-[0_0_8px_rgba(255,0,162,0.3)] active:scale-95 animate-pulse-slow-2'
                  : 'border-slate-500 bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95'
              }`}
            >
              🔊 D-BASS
            </button>
            {/* Rise Key */}
            <button
              onClick={() => handlePlaySynth(() => playSound.hologramRise(soundEnabled))}
              className={`py-2 px-1 rounded-xl text-[10px] font-mono font-black cursor-pointer transition-all border ${
                theme === 'cyberpunk'
                  ? 'border-[#9d4edd]/30 hover:border-[#9d4edd] bg-[#9d4edd]/5 text-[#9d4edd] hover:shadow-[0_0_8px_rgba(157,78,221,0.3)] active:scale-95'
                  : 'border-slate-500 bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95'
              }`}
            >
              ⚡ RISE
            </button>
            {/* Crystals Key */}
            <button
              onClick={() => handlePlaySynth(() => playSound.cyberChyme(soundEnabled))}
              className={`py-2 px-1 rounded-xl text-[10px] font-mono font-black cursor-pointer transition-all border ${
                theme === 'cyberpunk'
                  ? 'border-[#00f0ff]/30 hover:border-[#00f0ff] bg-[#00f0ff]/5 text-[#00f0ff] hover:shadow-[0_0_8px_rgba(0,240,255,0.3)] active:scale-95'
                  : 'border-slate-500 bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95'
              }`}
            >
              💎 CHYMES
            </button>
            {/* Shield Key */}
            <button
              onClick={() => handlePlaySynth(() => playSound.antiExplosion(soundEnabled))}
              className={`py-2 px-1 rounded-xl text-[10px] font-mono font-black cursor-pointer transition-all border ${
                theme === 'cyberpunk'
                  ? 'border-[#39ff14]/30 hover:border-[#39ff14] bg-[#39ff14]/5 text-[#39ff14] hover:shadow-[0_0_8px_rgba(57,255,20,0.3)] active:scale-95'
                  : 'border-slate-500 bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95'
              }`}
            >
              🛡️ SHIELD
            </button>
            {/* Tides Key */}
            <button
              onClick={() => handlePlaySynth(() => playSound.quantumTides(soundEnabled))}
              className={`py-2 px-1 col-span-2 sm:col-span-1 rounded-xl text-[10px] font-mono font-black cursor-pointer transition-all border ${
                theme === 'cyberpunk'
                  ? 'border-[#ffea00]/30 hover:border-[#ffea00] bg-[#ffea00]/5 text-[#ffea00] hover:shadow-[0_0_8px_rgba(255,234,0,0.3)] active:scale-95'
                  : 'border-slate-500 bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95'
              }`}
            >
              🌊 QUANTUM
            </button>
          </div>

          {/* Golden signature trigger */}
          <div className="flex items-center gap-3 justify-center mt-1">
            <button
              onClick={() => {
                setPulseHero(true);
                playSound.easterEgg(soundEnabled);
                setTimeout(() => setPulseHero(false), 650);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-display font-extrabold cursor-pointer transition-all border ${
                theme === 'cyberpunk'
                  ? 'bg-gradient-to-r from-[#00f0ff] via-[#9d4edd] to-[#ff00a2] text-[#080914] hover:text-white border-transparent hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] active:scale-95 font-extrabold'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-white/20 active:scale-95 shadow-md font-black'
              }`}
              id="play-easter-audio-btn"
            >
              <Music className="w-3.5 h-3.5 animate-pulse" />
              <span>{t.audioBtn}</span>
            </button>

            <span className={`text-[11px] font-semibold px-4 py-2.5 rounded-xl select-none animate-pulse border ${
              theme === 'cyberpunk'
                ? 'text-[#00ff66] bg-[#00ff66]/10 border-[#00ff66]/30 font-mono text-[9px]'
                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
            }`}>
              {t.approval}
            </span>
          </div>

          <button
            onClick={() => {
              const list = {
                'zh-CN': [
                  { luck: "大吉 (SSR) 🏆", evaluate: "微操神之手！350ms 拦截自愈全面开启，今日点雷百分百避开，手感如有神助！", advice: "放手前行，学位证稳如钟！" },
                  { luck: "中吉 (SR) ⚡", evaluate: "和弦共鸣良好。避震防爆性能坚挺，消抖保护运作平稳，失误率趋近于零。", advice: "跟着节奏，朝阳独轮车不会来。" },
                  { luck: "小吉 (R) 🛡️", evaluate: "电容轻微热。偶有些许手抖，建议保持 350ms 触控节奏稳步清除。", advice: "切勿暴躁点击，注意心平气静避免全麻。" },
                  { luck: "大麻 (NaoMaLe!) 💀", evaluate: "检测到身体散发出沉重的“袁子弹”粒子能量，抗震电容负荷剧增，手部面临窒息全麻重击！", advice: "大声高唱“闹麻了”三遍，触发极智退散结界！" }
                ],
                'zh-TW': [
                  { luck: "大吉 (SSR) 🏆", evaluate: "微操神之手！350ms 攔截自癒全面開啟，今日點雷百分百避開，手感如有神助！", advice: "放手前行，學會證穩如鐘！" },
                  { luck: "中吉 (SR) ⚡", evaluate: "和弦共鳴良好。避震防爆性能堅挺，消抖保護運作平穩，失誤率趨近於零。", advice: "跟著節奏，朝陽獨輪車不會來。" },
                  { luck: "小吉 (R) 🛡️", evaluate: "電容輕微發熱。偶有些許手抖，建議保持 350ms 觸控節奏穩步清除。", advice: "切勿暴躁點擊，注意心平氣靜避免全麻。" },
                  { luck: "大麻 (鬧麻了!) 💀", evaluate: "檢測到身體散發出沉重的「袁子彈」粒子能量，抗震電容負荷劇增，手部面臨窒息全麻重擊！", advice: "大聲高唱「鬧麻了」三遍，觸發極智退散結界！" }
                ],
                'en': [
                  { luck: "MAX LUCK (SSR) 🏆", evaluate: "Perfect e-sports fingers! Core self-cure engine active, 100% immune to random touch slips today!", advice: "Go bold! Educational credentials perfectly verified." },
                  { luck: "STEADY (SR) ⚡", evaluate: "High pentatonic harmonic resonance. Dynamic gesture filters shielding your session with high rating.", advice: "Pace your sweeps, the Chaoyang pushcart remains docked." },
                  { luck: "STABLE (R) 🛡️", evaluate: "Thermal index nominal. Minor vibration registered, process key blocks with steady pace.", advice: "Do not rush blind double-clicks, keep fingers calm." },
                  { luck: "NUMB (NaoMaLe!) 💀", evaluate: "Dangerous levels of 'Yuan Bullet particles' detected! High overload on safe-shunt capacitors.", advice: "Say 'Nao Ma Le' three times aloud to disperse the fog!" }
                ]
              };
              const activeList = list[lang] || list['en'];
              const randomItem = activeList[Math.floor(Math.random() * activeList.length)];
              setFortune(randomItem);
            }}
            className={`w-full py-2 rounded-xl text-[10px] font-display font-black leading-none tracking-widest cursor-pointer transition-all border ${
              theme === 'cyberpunk'
                ? 'border-[#00f0ff]/35 bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20 shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                : 'border-slate-500 bg-slate-800 hover:bg-slate-700 text-amber-300'
            }`}
          >
            🔮 {lang === 'en' ? "CALCULATE DAILY MICRO-CONTROL FORTUNE" : "测一测今日微操运势 // CAST ORACLE"}
          </button>

          <AnimatePresence mode="wait">
            {fortune && (
              <motion.div
                key={fortune.luck}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all text-left leading-normal text-[10px] ${
                  theme === 'cyberpunk'
                    ? 'bg-[#0a0715] border-[#ff00bb]/35 text-[#ff00bb]'
                    : 'bg-slate-900/40 border-slate-700/30 text-slate-200'
                }`}
              >
                <div>
                  <span className="opacity-75">{lang === 'en' ? "Fortune Status:" : "运势级别:"}</span>{" "}
                  <span className="font-extrabold text-xs text-amber-300 underline">{fortune.luck}</span>
                </div>
                <div>
                  <span className="opacity-75">{lang === 'en' ? "Tactical Evaluation:" : "微操评估:"}</span>{" "}
                  <span className="font-semibold text-slate-200">{fortune.evaluate}</span>
                </div>
                <div>
                  <span className="opacity-75">{lang === 'en' ? "Golden Advice:" : "极智医嘱:"}</span>{" "}
                  <span className="font-bold underline text-emerald-400">{fortune.advice}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reaction-Time Trial: Jiao Ge Says Minigame */}
        <JiaoGeSaysMinigame 
          lang={lang} 
          theme={theme} 
          soundEnabled={soundEnabled} 
        />

        <button
          onClick={onClose}
          className={`w-full mt-2 py-2.5 rounded-xl text-xs font-display font-bold transition-all cursor-pointer text-center border ${
            theme === 'cyberpunk'
              ? 'bg-[#ff0055] hover:bg-[#ff0077] text-white border-transparent shadow-[0_0_12px_rgba(255,0,85,0.4)]'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-white/10'
          }`}
          id="easter-ok-btn"
        >
          {t.done}
        </button>
      </motion.div>
    </div>
  );
}
