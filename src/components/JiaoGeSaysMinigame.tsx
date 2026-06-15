import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../utils/i18n';
import { playSound } from '../utils/audio';

interface JiaoGeSaysMinigameProps {
  lang: Language;
  theme: 'classic' | 'cyberpunk';
  soundEnabled: boolean;
}

interface GameTarget {
  id: number;
  x: number; // percentage
  y: number; // percentage
  icon: string;
  isFake: boolean;
}

const EMOJIS_TARGET = ['👴', '🌶️', '🚀', '🔥', '✨'];
const EMOJIS_FAKE = ['💀', '💣', '❌', '⚠️', '🧟'];

export default function JiaoGeSaysMinigame({ lang, theme, soundEnabled }: JiaoGeSaysMinigameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [tokens, setTokens] = useState<number>(() => {
    try { return Number(localStorage.getItem('jiaoge_tokens') || '0'); } catch { return 0; }
  });
  const [targets, setTargets] = useState<GameTarget[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const nextTargetId = useRef(0);
  const lastSpawnRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const t = {
    'zh-CN': {
      title: '椒哥考验：手速对决',
      start: '开始挑战',
      playing: '点击椒哥图标！避开炸弹！',
      score: '当前连击',
      tokens: '积攒椒币',
      gameover: '反应过慢或误触！',
    },
    'zh-TW': {
      title: '椒哥考驗：手速對決',
      start: '開始挑戰',
      playing: '點擊椒哥圖示！避開炸彈！',
      score: '當前連擊',
      tokens: '積攢椒幣',
      gameover: '反應過慢或誤觸！',
    },
    'en': {
      title: "Jiao Ge Says: Reaction Trial",
      start: "Start Trial",
      playing: "Click Jiao Ge icons! Avoid bombs!",
      score: "Current Combo",
      tokens: "Jiao-Tokens",
      gameover: "Too slow or misclick!",
    }
  }[lang] || { title: "Jiao Ge Says: Reaction Trial", start: "Start Trial", playing: "Click Jiao Ge icons! Avoid bombs!", score: "Current Combo", tokens: "Jiao-Tokens", gameover: "Too slow or misclick!" };

  useEffect(() => {
    try { 
      localStorage.setItem('jiaoge_tokens', String(tokens));
      window.dispatchEvent(new Event('jiaoge_tokens_updated'));
    } catch {}
  }, [tokens]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTargets([]);
    setTimeLeft(30); // 30 seconds game
    lastSpawnRef.current = 0;
  };

  const endGame = () => {
    setIsPlaying(false);
    setTargets([]);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (soundEnabled) playSound.explosion(true);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const loop = (time: number) => {
      // Spawn targets
      if (time - lastSpawnRef.current > Math.max(400, 1000 - score * 30)) {
        const isFake = Math.random() > 0.7;
        const target: GameTarget = {
          id: ++nextTargetId.current,
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
          icon: isFake ? EMOJIS_FAKE[Math.floor(Math.random() * EMOJIS_FAKE.length)] : EMOJIS_TARGET[Math.floor(Math.random() * EMOJIS_TARGET.length)],
          isFake
        };
        setTargets(prev => [...prev.slice(-4), target]); // keep max 5 on screen
        lastSpawnRef.current = time;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(timer);
    };
  }, [isPlaying, score]);

  // Clean old targets automatically (they disappear after ~1s)
  useEffect(() => {
    if (!isPlaying || targets.length === 0) return;
    const oldestTargetId = targets[0].id;
    const isFake = targets[0].isFake;
    
    const timeout = setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== oldestTargetId));
      if (!isFake) {
        // Missed a real target! Break combo.
        setScore(0);
      }
    }, Math.max(600, 1500 - score * 40));

    return () => clearTimeout(timeout);
  }, [targets, isPlaying, score]);

  const handleTargetClick = (target: GameTarget) => {
    if (!isPlaying) return;
    if (target.isFake) {
      // Clicked a fake!
      endGame();
      return;
    }
    
    // Good click
    if (soundEnabled) playSound.click(true);
    setScore(s => s + 1);
    setTokens(tks => tks + 1);
    setTargets(prev => prev.filter(t => t.id !== target.id));
  };

  return (
    <div className={`mt-3 rounded-2xl p-4 border flex flex-col items-center justify-center gap-3 transition-colors ${
      theme === 'cyberpunk'
        ? 'bg-[#121422] border-[#ffb703]/30 shadow-[0_0_15px_rgba(255,183,3,0.1)]'
        : 'bg-slate-950/40 border-amber-400/20 shadow-inner'
    }`}>
      <div className="flex w-full items-center justify-between font-mono text-[10px] font-black uppercase text-amber-300">
        <span className="flex items-center gap-1">⏱️ {isPlaying ? `${timeLeft}s` : t.title}</span>
        <span className="flex items-center gap-2">
          <span>{t.score}: {score}</span>
          <span className="text-[#00f0ff]">{t.tokens}: 💰{tokens}</span>
        </span>
      </div>

      <div 
        ref={gameAreaRef}
        className={`relative w-full h-32 rounded-xl border overflow-hidden transition-colors ${
          theme === 'cyberpunk'
            ? 'bg-[#0a0715] border-[#ff00bb]/20'
            : 'bg-slate-900 border-slate-700/50'
        }`}
      >
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10 p-2 text-center">
            <span className="text-[10px] text-slate-300 mb-2 font-mono">{timeLeft === 0 && targets.length === 0 && score === 0 ? '' : t.gameover}</span>
            <button
              onClick={startGame}
              className={`px-4 py-1.5 rounded-lg text-xs font-display font-black cursor-pointer transition-all border ${
                theme === 'cyberpunk'
                  ? 'border-[#00ff66]/40 bg-[#00ff66]/10 text-[#00ff66] hover:bg-[#00ff66]/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-transparent shadow-md'
              }`}
            >
              {t.start}
            </button>
          </div>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] opacity-20 font-mono text-slate-400 pointer-events-none">
            {t.playing}
          </span>
        )}

        <AnimatePresence>
          {targets.map(target => (
            <motion.div
              key={target.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => handleTargetClick(target)}
              className="absolute text-2xl cursor-pointer hover:scale-110 active:scale-95 transition-transform"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {target.icon}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
