import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Flame, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';
import { Language } from '../utils/i18n';
import { playSound } from '../utils/audio';

interface QTEProps {
  isOpen: boolean;
  lang: Language;
  theme: 'classic' | 'cyberpunk';
  soundEnabled: boolean;
  onSuccess: () => void;
  onFailure: () => void;
}

const ITEMS = [
  { char: '👴', label: 'Chief' },
  { char: '🛡️', label: 'Shield' },
  { char: '⚡', label: 'Capacitor' },
  { char: '🛒', label: 'Pushcart' },
];

export default function QTEOverlay({
  isOpen,
  lang,
  theme,
  soundEnabled,
  onSuccess,
  onFailure,
}: QTEProps) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(3.5); // 3.5 seconds challenge
  const [shake, setShake] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Generate a random sequence of 3 characters when QTE is opened
  useEffect(() => {
    if (isOpen) {
      const symbols = ITEMS.map(item => item.char);
      const newSeq = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
      setSequence(newSeq);
      setUserInput([]);
      setTimeLeft(3.5);
      setShake(false);
      playSound.hologramRise(soundEnabled);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.05) {
            return 0;
          }
          // Tick sound effect periodically
          if (Math.floor(prev * 10) % 5 === 0) {
            playSound.click(soundEnabled);
          }
          return prev - 0.05;
        });
      }, 50);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isOpen, soundEnabled]);

  // Handle QTE failure (timeout) safely via side effect to avoid React cross-component rendering setState warnings
  useEffect(() => {
    if (isOpen && timeLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      onFailure();
    }
  }, [timeLeft, isOpen, onFailure]);

  if (!isOpen) return null;

  const handleInput = (sym: string) => {
    const expected = sequence[userInput.length];
    if (sym === expected) {
      playSound.cascade(soundEnabled, userInput.length * 3);
      const nextInput = [...userInput, sym];
      setUserInput(nextInput);

      if (nextInput.length === sequence.length) {
        // Correct sequence fully inputted!
        if (timerRef.current) clearInterval(timerRef.current);
        onSuccess();
      }
    } else {
      // Wrong input! Shake and penalize timer or fail!
      playSound.jiaoBass(soundEnabled);
      setShake(true);
      setTimeLeft(prev => Math.max(0.1, prev - 1.0)); // Subtract 1 second penalty!
      setTimeout(() => setShake(false), 300);
    }
  };

  const getPercentageLeft = () => {
    return (timeLeft / 3.5) * 100;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 no-select touch-none">
      <motion.div
        animate={shake ? { x: [-15, 15, -15, 15, 0] } : {}}
        transition={{ duration: 0.25 }}
        className={`w-full max-w-md rounded-3xl p-6 flex flex-col items-center justify-center text-center relative border overflow-hidden ${
          theme === 'cyberpunk'
            ? 'bg-[#0f111a]/95 border-2 border-[#ffea00] shadow-[0_0_35px_rgba(255,234,0,0.4)]'
            : 'bg-gradient-to-b from-slate-900 to-slate-800 border-2 border-red-500 shadow-2xl'
        }`}
      >
        {/* Glow lasers background */}
        {theme === 'cyberpunk' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-[#9d4edd]/5 via-transparent to-[#ff00a2]/5 pointer-events-none" />
        )}

        {/* Header Alert badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/35 rounded-full select-none mb-3 text-red-400 animate-pulse text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>
            {lang === 'en' 
              ? "Emergency Anti-Seismic Shield" 
              : lang === 'zh-TW' 
                ? "椒哥防爆電容緊急自癒" 
                : "椒哥防爆电容紧急自愈"}
          </span>
        </div>

        {/* Master avatar in panic mode */}
        <div className="text-4xl animate-bounce mb-2 select-none">😱🛡️</div>

        <h3 className={`font-display font-black text-sm sm:text-base leading-snug select-none ${
          theme === 'cyberpunk' ? 'text-[#ffea00] cyber-glow-yellow' : 'text-white'
        }`}>
          {lang === 'en'
            ? "COEFFICIENT OVERLOAD SURGE!"
            : lang === 'zh-TW'
              ? "「袁」粒子高能爆發！"
              : "「袁」粒子高能爆发！"}
        </h3>

        <p className="text-[10px] sm:text-xs text-slate-300 max-w-xs mt-1 font-sans leading-relaxed select-none">
          {lang === 'en'
            ? "Instantly click pentatonic codes to trigger Master Jiao's Safe Decoupling capacitor!"
            : lang === 'zh-TW'
              ? "觸電秒全麻？請立刻輸入和弦信號，啟動椒哥 350ms 防爆大自癒防護壁！"
              : "触电秒全麻？请立刻输入和弦信号，启动椒哥 350ms 防爆大自愈防护壁！"}
        </p>

        {/* Ticking Progress bar */}
        <div className="w-full h-2.5 bg-slate-900 border border-slate-700/35 rounded-full overflow-hidden mt-4 relative">
          <motion.div
            className={`h-full ${
              timeLeft < 1.3
                ? 'bg-[#ff0055] shadow-[0_0_8px_#ff0055]'
                : theme === 'cyberpunk'
                  ? 'bg-[#ffea00] shadow-[0_0_8px_#ffea00]'
                  : 'bg-emerald-500'
            }`}
            style={{ width: `${getPercentageLeft()}%` }}
            transition={{ ease: 'linear', duration: 0.05 }}
          />
        </div>
        <span className="font-mono text-[9px] text-slate-400 tracking-wider font-extrabold mt-1 uppercase">
          {lang === 'en' ? "CAPACITOR FUEL:" : "防爆自愈因子电量:"} {timeLeft.toFixed(2)}s
        </span>

        {/* Expected Sequence Display */}
        <div className="flex items-center justify-center gap-3.5 my-4 p-3 bg-black/45 border border-slate-800 rounded-2xl w-full">
          {sequence.map((sym, index) => {
            const isFilled = userInput.length > index;
            const isCurrent = userInput.length === index;

            return (
              <div key={index} className="flex flex-col items-center">
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.25, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.0 }}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl select-none transition-all duration-200 border-2 ${
                    isFilled
                      ? 'bg-emerald-500/10 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)] filter scale-105 opacity-100'
                      : isCurrent
                        ? theme === 'cyberpunk'
                          ? 'bg-[#ffeb3b]/10 border-[#ffeb3b] shadow-[0_0_8px_rgba(255,235,59,0.5)]'
                          : 'bg-slate-700/40 border-amber-500'
                        : 'bg-slate-900 border-slate-800 opacity-40'
                  }`}
                >
                  {sym}
                </motion.div>
                <div className={`text-[8px] font-mono tracking-widest uppercase mt-0.5 font-black ${
                  isFilled ? 'text-emerald-400' : isCurrent ? 'text-amber-400 animate-pulse' : 'text-slate-600'
                }`}>
                  {isFilled ? "OK" : isCurrent ? "NEXT" : "LOCK"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input keys keyboard pad */}
        <div className="grid grid-cols-4 gap-2 w-full mt-1.5 select-none touch-none">
          {ITEMS.map((item) => (
            <button
              key={item.char}
              onClick={() => handleInput(item.char)}
              className={`py-3 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border active:scale-90 ${
                theme === 'cyberpunk'
                  ? 'border-[#00f0ff]/35 bg-[#00f0ff]/5 hover:bg-[#00f0ff]/20 text-white shadow-[0_0_6px_rgba(0,240,255,0.08)]'
                  : 'border-slate-500 bg-slate-800 hover:bg-slate-700 text-slate-200 shadow-sm'
              }`}
            >
              <span className="text-xl leading-none select-none">{item.char}</span>
              <span className="text-[7.5px] font-mono tracking-wider font-extrabold text-slate-400 uppercase select-none">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
