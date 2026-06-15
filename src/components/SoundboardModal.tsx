import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Play, 
  Music, 
  Sparkles, 
  Sliders, 
  Shuffle, 
  Square, 
  Headphones,
  Flame,
  Zap,
  Globe,
  Search
} from 'lucide-react';
import { Language } from '../utils/i18n';
import { playSound } from '../utils/audio';

interface SoundboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  soundEnabled: boolean;
  theme?: 'classic' | 'cyberpunk';
}

interface SoundItem {
  id: string;
  titleZh: string;
  titleEn: string;
  textZh: string;
  textEn: string;
  category: 'quotes' | 'funny' | 'effects';
  originalCategory?: 'wisdom' | 'warning' | 'drama' | 'victory'; // for legacy playback logic fallback
  isEffect?: boolean;
  effectAction?: () => void;
}

export default function SoundboardModal({ 
  isOpen, 
  onClose, 
  lang, 
  soundEnabled, 
  theme = 'classic' 
}: SoundboardModalProps) {
  const [pitch, setPitch] = useState<number>(1.1);
  const [rate, setRate] = useState<number>(1.1);
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState<string>('');
  const [isPlayingRemix, setIsPlayingRemix] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [equalizerBars, setEqualizerBars] = useState<number[]>([10, 10, 10, 10, 10, 10, 10, 10]);

  const eqTimerRef = useRef<NodeJS.Timeout | null>(null);
  const remixTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Iconic Quotes Collection of Jiao Ge
  const quotes: SoundItem[] = [
    // 1. WISDOM -> JIAO GE QUOTES
    {
      id: 'wisdom_1',
      titleZh: '极智核心 350ms',
      titleEn: '350ms Smart Core',
      textZh: '极智核心：极速 350ms 静止长按自主防抖，跳过 iOS 触控双击缩放！📱',
      textEn: 'Core Hack: Static 350ms Smart Long-press completely bypasses iOS Safari double-tap zoom latency! 📱',
      category: 'quotes',
      originalCategory: 'wisdom'
    },
    {
      id: 'wisdom_2',
      titleZh: '和弦连击心法',
      titleEn: 'Pentatonic Sweep',
      textZh: '和弦连击：双击已标记足够的数字格，可激活 Cascade 物理级五阶和弦连锁开区！🎹',
      textEn: 'Chord Combo: Double-click numerical blocks with complete flags to deploy cascading pentatonic sweeps! 🎹',
      category: 'quotes',
      originalCategory: 'wisdom'
    },
    {
      id: 'wisdom_3',
      titleZh: '手速决定上限',
      titleEn: 'Speed Dictates Limits',
      textZh: '极智心法：手速决定上限，微操决定命运。大声高唱五阶和弦！👑',
      textEn: 'Golden Mantra: Speed dictates limits, but master micro-controls decide destiny. Hum a chord for luck! 👑',
      category: 'quotes',
      originalCategory: 'wisdom'
    },
    {
      id: 'warning_3',
      titleZh: '高能颤动信号',
      titleEn: 'Seismic Vibrations',
      textZh: '高能“袁子弹”物质在剧烈颤动，安全负荷已经过载！⚡',
      textEn: 'Extreme Yuan Bullet energy signals detected. The tactical core shield is overloaded! ⚡',
      category: 'quotes',
      originalCategory: 'warning'
    },
    {
      id: 'victory_2',
      titleZh: '绝对抗爆屏蔽',
      titleEn: 'Explosive Shield',
      textZh: '已解锁首击绝对抗爆屏蔽！安全系数已达到顶峰！✨',
      textEn: 'Absolute explosive barrier deployed! Seismic threshold of index cells has hit peak safety level! ✨',
      category: 'quotes',
      originalCategory: 'victory'
    },

    // 2. FUNNY
    {
      id: 'warning_1',
      titleZh: '极高能袁子弹',
      titleEn: 'Yuan Bullet Threat',
      textZh: '警告：雷区深藏袁能粒子，触雷即刻产生‘袁式全麻’！☠️',
      textEn: 'Degree Alert: Grid is loaded with high-energy Yuan particles. Exploding leads to Delayed Graduation! 💀',
      category: 'funny',
      originalCategory: 'warning'
    },
    {
      id: 'warning_2',
      titleZh: '本科延年益寿',
      titleEn: 'Degree At Risk',
      textZh: '个袁世杰闹全麻！别墨迹，本科学位证直接延修！🎓',
      textEn: 'Yuan Shijie has completely paralyzed your progress! Your undergraduate graduation is now delayed! 🎓',
      category: 'funny',
      originalCategory: 'warning'
    },
    {
      id: 'drama_1',
      titleZh: '朝阳摆摊警告',
      titleEn: 'Chaoyang Cart Duty',
      textZh: '千万不要逼我亲自推朝阳的独轮手推车去帮你，用心微操！🛒',
      textEn: 'Do not force me to direct the Chaoyang cargo pushcart to your position! Master the coordinates! 🛒',
      category: 'funny',
      originalCategory: 'drama'
    },
    {
      id: 'drama_2',
      titleZh: '苹果自愈监听',
      titleEn: 'iOS Audio Refresh',
      textZh: '声音丢失？椒哥音频热插拔技术已自动重置苹果 Web Audio 上下文！🔊',
      textEn: 'Refresher Audio: Dynamic Apple Audio Context recovery resolves static silence on older iPhones! 🔊',
      category: 'funny',
      originalCategory: 'drama'
    },
    {
      id: 'drama_3',
      titleZh: '袁世杰闹全麻',
      titleEn: 'Shijie Paralyzed',
      textZh: '袁世杰你闹全麻了！你真的是整条街最奇葩的存在。💥',
      textEn: 'Yuan Shijie you are absolutely paralyzed! Truly the most bizarre specimen on this avenue. 💥',
      category: 'funny',
      originalCategory: 'drama'
    },
    {
      id: 'victory_1',
      titleZh: '华宇毕业典礼',
      titleEn: 'Huayu Graduation',
      textZh: '大胜！华宇学位证书已生成临时 PDF 并 beamed 到你的云端！🏆',
      textEn: 'Victory! Huayu graduation degree has been beam-cast as a security PDF file to your ledger! 🎉',
      category: 'funny',
      originalCategory: 'victory'
    },

    // 3. GAME EFFECTS
    {
      id: 'eff_click',
      titleZh: '微操铲击',
      titleEn: 'Shovel Click',
      textZh: '（音效）挖掘方块的声音。',
      textEn: '(SFX) The sound of uncovering a block.',
      category: 'effects',
      isEffect: true,
      effectAction: () => playSound.click(true)
    },
    {
      id: 'eff_flag',
      titleZh: '战术插旗',
      titleEn: 'Tactical Flag',
      textZh: '（音效）清脆的插旗声。',
      textEn: '(SFX) Crisp flagging sound.',
      category: 'effects',
      isEffect: true,
      effectAction: () => playSound.flag(true)
    },
    {
      id: 'eff_cascade',
      titleZh: '和弦扫弦',
      titleEn: 'Cascade Sweep',
      textZh: '（音效）连续开区的爽快音效。',
      textEn: '(SFX) Satisfying cascade sweep.',
      category: 'effects',
      isEffect: true,
      effectAction: () => playSound.cascade(true, 5)
    },
    {
      id: 'eff_explosion',
      titleZh: '袁子弹引爆',
      titleEn: 'Yuan Detonation',
      textZh: '（音效）剧烈的爆炸声！全麻！',
      textEn: '(SFX) Massive explosion! Paralyzed!',
      category: 'effects',
      isEffect: true,
      effectAction: () => playSound.explosion(true)
    },
    {
      id: 'eff_win',
      titleZh: '毕业钟声',
      titleEn: 'Graduation Chimes',
      textZh: '（音效）胜利的圣音。',
      textEn: '(SFX) The holy chimes of victory.',
      category: 'effects',
      isEffect: true,
      effectAction: () => playSound.win(true)
    }
  ];

  // Equalizer visualizer effect
  const startEqualizerAnim = (durationMs: number) => {
    if (eqTimerRef.current) clearInterval(eqTimerRef.current);
    
    const startTime = Date.now();
    eqTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= durationMs) {
        clearInterval(eqTimerRef.current!);
        setEqualizerBars([10, 10, 10, 10, 10, 10, 10, 10]);
      } else {
        setEqualizerBars(Array.from({ length: 8 }, () => Math.floor(Math.random() * 85) + 15));
      }
    }, 80);
  };

  const stopEqualizerAnim = () => {
    if (eqTimerRef.current) {
      clearInterval(eqTimerRef.current);
      eqTimerRef.current = null;
    }
    setEqualizerBars([10, 10, 10, 10, 10, 10, 10, 10]);
  };

  // Play synthetic melody notes matching the category style
  const playCategorySound = (category: string) => {
    if (!soundEnabled) return;

    if (category === 'victory') {
      playSound.win(true);
    } else if (category === 'warning') {
      playSound.jiaoBass(true);
      setTimeout(() => {
        playSound.explosion(true);
      }, 150);
    } else if (category === 'wisdom') {
      playSound.cyberChyme(true);
      setTimeout(() => {
        playSound.antiExplosion(true);
      }, 200);
    } else {
      playSound.easterEgg(true);
    }
  };

  // Trigger individual catchphrase play (Speech Synthesis + Synth chords)
  const handlePlayQuote = (q: SoundItem) => {
    // Stop previous utterance
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current = null;
    }

    if (q.isEffect && q.effectAction) {
       q.effectAction();
       setActiveQuoteId(q.id);
       setSubtitle(lang === 'en' ? q.textEn : q.textZh);
       startEqualizerAnim(800);
       setTimeout(() => {
         setActiveQuoteId(null);
         setSubtitle('');
         stopEqualizerAnim();
       }, 800);
       return;
    }

    setActiveQuoteId(q.id);
    const spokenText = lang === 'en' ? q.textEn : q.textZh;
    setSubtitle(spokenText);

    // Play retro category synth sounds
    if (q.originalCategory) {
       playCategorySound(q.originalCategory);
    }

    const spokenLang = lang === 'en' ? 'en-US' : 'zh-CN';
    
    // Estimate speaking duration (approx 80-120ms per character/syllable)
    let approxDuration = (spokenText.length * 150) / rate + 600;
    if (approxDuration > 6000) approxDuration = 6000;

    startEqualizerAnim(approxDuration);

    if (typeof window !== 'undefined' && window.speechSynthesis && soundEnabled) {
      // Use Web Speech API for Jiao Ge robotic synthesized speech reading
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = spokenLang;
      utterance.pitch = pitch;
      utterance.rate = rate;
      
      // Select appropriate voice if available (Chinese or English depending on context)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith(lang === 'en' ? 'en' : 'zh'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        setActiveQuoteId(null);
        setSubtitle('');
        stopEqualizerAnim();
      };

      utterance.onerror = () => {
        // Fallback cleanup on error
        setTimeout(() => {
          setActiveQuoteId(null);
          setSubtitle('');
          stopEqualizerAnim();
        }, approxDuration);
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      // Offline fallback: purely runs visual equalizer animation
      setTimeout(() => {
        setActiveQuoteId(null);
        setSubtitle('');
        stopEqualizerAnim();
      }, approxDuration);
    }
  };

  // Fun remix beats mode: Loops, beats, and randomized words merged!
  const triggerRemixBeatStep = () => {
    if (!soundEnabled) return;
    
    // Play a cool randomized synth beep/hum
    const sounds = [
      () => playSound.jiaoBass(true),
      () => playSound.click(true),
      () => playSound.unflag(true),
      () => playSound.flag(true),
      () => playSound.cascade(true, Math.floor(Math.random() * 10)),
      () => playSound.antiExplosion(true),
      () => playSound.cyberChyme(true),
      () => playSound.hologramRise(true)
    ];
    sounds[Math.floor(Math.random() * sounds.length)]();

    // Random speech snippet speaks high energy Chinese memes
    const remixSnippets = [
      '极智核心！', '微操！', '一铲搞定！', '袁自弹！', '延修学位！', '学位证！', '朝阳手推车！', '全麻！', '五阶和弦！', '拓扑电容！'
    ];
    const enRemixSnippets = [
      'Core Hack!', 'Micro Controls!', 'Seismic overlay!', 'Degree alert!', 'Chaoyang Cart!', 'Yuan Bullet!', 'All paralyzed!'
    ];

    const phrase = lang === 'en' 
      ? enRemixSnippets[Math.floor(Math.random() * enRemixSnippets.length)]
      : remixSnippets[Math.floor(Math.random() * remixSnippets.length)];

    setSubtitle(phrase);
    setEqualizerBars(Array.from({ length: 8 }, () => Math.floor(Math.random() * 80) + 20));

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = lang === 'en' ? 'en-US' : 'zh-CN';
      utterance.pitch = Math.random() * 1.0 + 0.6; // crazy dynamic pitch jumps!
      utterance.rate = Math.random() * 0.8 + 1.0;  // rapid stuttered rates
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRemixBeats = () => {
    if (isPlayingRemix) {
      setIsPlayingRemix(false);
      setSubtitle('');
      if (remixTimerRef.current) {
        clearInterval(remixTimerRef.current);
        remixTimerRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      stopEqualizerAnim();
    } else {
      setIsPlayingRemix(true);
      // Play a quick initial sequence and loop every 480ms (high tempo electronic step!)
      triggerRemixBeatStep();
      remixTimerRef.current = setInterval(() => {
        triggerRemixBeatStep();
      }, 480);
    }
  };

  // Cleanup synthesizer speech or loops on close or leave
  useEffect(() => {
    return () => {
      if (eqTimerRef.current) clearInterval(eqTimerRef.current);
      if (remixTimerRef.current) clearInterval(remixTimerRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  // Language translation terms inside the Soundboard
  const texts = {
    'zh-CN': {
      title: '杰哥/椒哥 极智声音控制板 📻',
      desc: '专属于全栈主程【极智大师 椒哥】的动态发言板。选择金句播放，实时体验微操声学校准！',
      visTitle: '极智光谱音频波形',
      pitchLabel: '极高能音调 (Pitch)',
      rateLabel: '微操加速率 (Speed/Rate)',
      remixBtnOn: '停止 Jiao Techno 自愈节奏轨 🛑',
      remixBtnOff: '激活 Jiao DJ 极智混音循环 🎚️',
      subTitleLabel: '发声器中文字幕',
      catQuotes: '🎙️ 椒哥金句',
      catFunny: '🤣 搞笑整活',
      catEffects: '🕹️ 游戏音效',
      searchPlaceholder: '搜索音频...',
      closeBtn: '退出发言轨道',
      speechBlocked: '（注：建议打开手机铃声/取消静音并佩戴耳机，音效更上头）'
    },
    'zh-TW': {
      title: '傑哥/椒哥 極智聲音控制板 📻',
      desc: '專屬於全疊主程【極智大師 椒哥】的動態發言板。選擇金句播放，即時體驗微操聲學校準！',
      visTitle: '極智光譜音頻波形',
      pitchLabel: '極高能音調 (Pitch)',
      rateLabel: '微操加速度 (Speed/Rate)',
      remixBtnOn: '停止 Jiao Techno 自癒節奏軌 🛑',
      remixBtnOff: '激活 Jiao DJ 極智混音循環 🎚️',
      subTitleLabel: '發聲器中文字幕',
      catQuotes: '🎙️ 椒哥金句',
      catFunny: '🤣 搞笑整活',
      catEffects: '🕹️ 遊戲音效',
      searchPlaceholder: '搜尋音訊...',
      closeBtn: '退出發聲軌道',
      speechBlocked: '（註：建議打開手機鈴聲/取消靜音並佩戴耳機，音效更上頭）'
    },
    'en': {
      title: "Jiao Ge's Golden Soundboard 📻",
      desc: "Architect Jiao Ge's official vocal modulator. Trigger verbal quotes and calibrate the acoustic feedback parameters in real-time!",
      visTitle: "Master Spectrum Equalizer",
      pitchLabel: "Vocal Pitch Modulator",
      rateLabel: "Speaking Rate (Speed)",
      remixBtnOn: "Stop Techno Remix Track 🛑",
      remixBtnOff: "Activate Jiao DJ Electro Loops 🎚️",
      subTitleLabel: "Synthesizer Subtitles",
      catQuotes: "🎙️ Jiao Ge Quotes",
      catFunny: "🤣 Funny",
      catEffects: "🕹️ Game Effects",
      searchPlaceholder: "Search sounds...",
      closeBtn: "Resume Microplay",
      speechBlocked: "(Note: Turn up device volume & unmute for optimal acoustic response.)"
    }
  };

  const t = texts[lang] || texts['en'];

  const searchLower = searchQuery.toLowerCase();
  const filteredQuotes = quotes.filter(q => 
    q.titleEn.toLowerCase().includes(searchLower) ||
    q.titleZh.toLowerCase().includes(searchLower) ||
    q.textEn.toLowerCase().includes(searchLower) ||
    q.textZh.toLowerCase().includes(searchLower)
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Dark overlay with background blur */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          if (isPlayingRemix) toggleRemixBeats();
          onClose();
        }}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
      />

      {/* Main Soundboard Frame */}
      <motion.div
        initial={{ scale: 0.9, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 15, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 180 }}
        className={`relative w-full max-w-2xl rounded-3xl border-2 overflow-hidden shadow-2xl flex flex-col max-h-[85vh] ${
          theme === 'cyberpunk'
            ? 'bg-[#0b0f19] border-[#ff0055]/40 text-slate-100 shadow-[0_0_40px_rgba(255,0,85,0.25)]'
            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        }`}
      >
        {/* Colorful top ambient bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${
          theme === 'cyberpunk'
            ? 'from-[#ff0055] via-[#9d4edd] to-[#ffea00]'
            : 'from-amber-400 via-rose-400 to-indigo-400'
        }`} />

        {/* Modal Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-200/20">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              theme === 'cyberpunk' ? 'bg-[#ffea00]/15 border-[#ffea00]/40 text-[#ffea00]' : 'bg-amber-100 text-amber-600 border-amber-200'
            }`}>
              <Headphones className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-extrabold tracking-tight flex items-center gap-1.5">
                {t.title}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                {theme === 'cyberpunk' ? 'SYS_ACOUSTIC_SOUNDBOARD_DIPLOMA_READY' : 'Jiao Ge Verbal Audio Board'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isPlayingRemix) toggleRemixBeats();
              onClose();
            }}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              theme === 'cyberpunk'
                ? 'border-slate-800 hover:border-slate-700 bg-slate-900/50 text-slate-400 hover:text-white'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Audio calibration deck (Pitch & Speed) */}
          <div className={`p-4 rounded-2xl border ${
            theme === 'cyberpunk'
              ? 'bg-slate-950/70 border-slate-800'
              : 'bg-slate-50 border-slate-250/60'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-display font-black uppercase tracking-wider">
                {theme === 'cyberpunk' ? "ACOUSTIC_MODULATOR_DECK" : "声学校对混音台"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pitch */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>{t.pitchLabel}</span>
                  <span className="text-emerald-400 font-black">{pitch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Rate (Speed) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>{t.rateLabel}</span>
                  <span className="text-cyan-400 font-black">{rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Subtitles & Equalizer Visualization Bubble */}
          <div className={`p-4 rounded-2xl border relative overflow-hidden transition-all min-h-[90px] flex flex-col justify-between ${
            isPlayingRemix
              ? 'border-fuchsia-500 bg-fuchsia-500/5 shadow-[0_0_15px_rgba(240,46,170,0.15)]'
              : activeQuoteId
              ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
              : theme === 'cyberpunk'
              ? 'bg-[#0f1424] border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5 mb-1">
                <Globe className={`w-3.5 h-3.5 ${isPlayingRemix ? 'text-fuchsia-400 animate-spin' : activeQuoteId ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                <span className="text-[9px] font-mono font-black text-slate-400">
                  {isPlayingRemix ? 'REMIX_BUS_STREAMING //' : 'VIRTUAL_RECEIVER //'}
                </span>
              </div>

              {/* Small Equalizer */}
              <div className="flex items-end gap-0.5 h-6">
                {equalizerBars.map((height, i) => (
                  <div
                    key={i}
                    className={`w-0.5 rounded-full transition-all duration-75 ${
                      isPlayingRemix
                        ? 'bg-fuchsia-500'
                        : activeQuoteId
                        ? 'bg-emerald-500'
                        : 'bg-slate-500'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Displaying text subtitle */}
            <div className="my-2 min-h-[30px] flex items-center justify-center text-center">
              <AnimatePresence mode="wait">
                {subtitle ? (
                  <motion.p
                    key={subtitle}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs sm:text-sm font-mono font-black tracking-wide leading-relaxed text-[#00f0ff] cyber-glow-cyan"
                  >
                    “ {subtitle} ”
                  </motion.p>
                ) : (
                  <p className="text-[11px] font-sans font-bold text-slate-500 italic">
                    {lang === 'en' 
                      ? "Standby. Tap any quote below to initiate speech synthesis calibration." 
                      : "音频就绪。点击下方任意金句，或开启下部电音 Remix 模块进行现场整活。"}
                  </p>
                )}
              </AnimatePresence>
            </div>

            <div className="text-[9px] text-right font-mono text-slate-400 block sm:absolute bottom-3 right-3 select-none">
              {t.speechBlocked}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={`w-4 h-4 ${theme === 'cyberpunk' ? 'text-[#00f0ff]' : 'text-slate-400'}`} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`block w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm font-sans transition-all focus:outline-none ${
                theme === 'cyberpunk'
                  ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
              }`}
            />
          </div>

          {/* Soundboard Categories */}
          <div className="space-y-8">
            {/* 1. Jiao Ge Quotes */}
            {filteredQuotes.filter(q => q.category === 'quotes').length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-display font-black tracking-widest text-[#ffee00] uppercase flex items-center gap-1.5 border-l-2 border-[#ffee00] pl-2">
                  <span>{t.catQuotes}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredQuotes.filter(q => q.category === 'quotes').map(q => (
                    <button
                      key={q.id}
                      onClick={() => handlePlayQuote(q)}
                      className={`px-3 py-3 rounded-xl border text-left flex flex-col justify-between transition-all group scale-98 hover:scale-100 active:scale-95 cursor-pointer ${
                        activeQuoteId === q.id
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : theme === 'cyberpunk'
                          ? 'bg-[#121629]/90 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-[#191e36]'
                          : 'bg-white border-slate-200 hover:border-amber-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] font-mono font-black mb-1 group-hover:text-emerald-400 transition-colors">
                        {lang === 'en' ? q.titleEn : q.titleZh}
                      </span>
                      <span className="text-[9px] text-slate-500 font-sans line-clamp-1 truncate group-hover:text-slate-400">
                        {lang === 'en' ? q.textEn : q.textZh}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Funny / Drama */}
            {filteredQuotes.filter(q => q.category === 'funny').length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-display font-black tracking-widest text-[#ff3300] uppercase flex items-center gap-1.5 border-l-2 border-[#ff3300] pl-2">
                  <span>{t.catFunny}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredQuotes.filter(q => q.category === 'funny').map(q => (
                    <button
                      key={q.id}
                      onClick={() => handlePlayQuote(q)}
                      className={`px-3 py-3 rounded-xl border text-left flex flex-col justify-between transition-all group scale-98 hover:scale-100 active:scale-95 cursor-pointer ${
                        activeQuoteId === q.id
                          ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_12px_rgba(240,46,170,0.3)]'
                          : theme === 'cyberpunk'
                          ? 'bg-[#121629]/90 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-[#191e36]'
                          : 'bg-white border-slate-200 hover:border-amber-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] font-mono font-black mb-1 group-hover:text-[#ff3300] transition-colors">
                        {lang === 'en' ? q.titleEn : q.titleZh}
                      </span>
                      <span className="text-[9px] text-slate-500 font-sans line-clamp-1 truncate group-hover:text-slate-400">
                        {lang === 'en' ? q.textEn : q.textZh}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Game Effects */}
            {filteredQuotes.filter(q => q.category === 'effects').length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-display font-black tracking-widest text-[#00f0ff] uppercase flex items-center gap-1.5 border-l-2 border-[#00f0ff] pl-2">
                  <span>{t.catEffects}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredQuotes.filter(q => q.category === 'effects').map(q => (
                    <button
                      key={q.id}
                      onClick={() => handlePlayQuote(q)}
                      className={`px-3 py-3 rounded-xl border text-left flex flex-col justify-between transition-all group scale-98 hover:scale-100 active:scale-95 cursor-pointer ${
                        activeQuoteId === q.id
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                          : theme === 'cyberpunk'
                          ? 'bg-[#121629]/90 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-[#191e36]'
                          : 'bg-white border-slate-200 hover:border-cyan-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] font-mono font-black mb-1 group-hover:text-[#00f0ff] transition-colors">
                        {lang === 'en' ? q.titleEn : q.titleZh}
                      </span>
                      <span className="text-[9px] text-slate-500 font-sans line-clamp-1 truncate group-hover:text-slate-400">
                        {lang === 'en' ? q.textEn : q.textZh}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No matches */}
            {filteredQuotes.length === 0 && (
              <div className="py-8 text-center text-slate-500 font-mono text-sm border border-dashed rounded-xl border-slate-300/50">
                {lang === 'en' ? 'No sound clips found.' : '未找到匹配的音频段落。'}
              </div>
            )}
          </div>

          {/* Epic DJ Jiao Remix Loop Section */}
          <div className="pt-2">
            <button
              onClick={toggleRemixBeats}
              className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer font-display font-black text-sm uppercase ${
                isPlayingRemix
                  ? 'bg-gradient-to-r from-red-500 via-purple-600 to-fuchsia-600 border border-fuchsia-400 hover:brightness-110 shadow-[0_0_20px_rgba(240,46,170,0.45)] text-white'
                  : theme === 'cyberpunk'
                  ? 'bg-[#151a30] hover:bg-[#1c2342] border border-[#ff0055]/30 text-[#ff0055] hover:text-white shadow-[0_0_10px_rgba(255,0,85,0.15)]'
                  : 'bg-amber-100 border border-amber-300 text-amber-700 hover:bg-amber-200'
              }`}
            >
              {isPlayingRemix ? (
                <>
                  <Square className="w-5 h-5 fill-current animate-pulse" />
                  <span>{t.remixBtnOn}</span>
                </>
              ) : (
                <>
                  <Shuffle className="w-5 h-5" />
                  <span>{t.remixBtnOff}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer/Actions */}
        <div className="px-6 py-4 border-t border-slate-200/20 flex justify-end">
          <button
            onClick={() => {
              if (isPlayingRemix) toggleRemixBeats();
              onClose();
            }}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-display font-extrabold text-xs tracking-wider transition-colors uppercase cursor-pointer ${
              theme === 'cyberpunk'
                ? 'bg-[#ff0055] hover:bg-[#ff0055]/90 text-white shadow-[0_0_10px_rgba(255,0,85,0.3)]'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {t.closeBtn}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
