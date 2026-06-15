import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';

interface ChallengeMeterProps {
  streak: number;
  tokens: number;
  badges?: number;
  lang: 'en' | 'zh-CN' | 'zh-TW';
  theme: 'classic' | 'cyberpunk';
}

export default function ChallengeMeter({ streak, tokens, badges = 0, lang, theme }: ChallengeMeterProps) {
  // Calculate a mock "level" out of 100 based on streak and tokens
  // e.g. 1 streak = 10, 1 token = 1 => caps at 100
  const totalScore = (streak * 15) + (tokens * 2);
  const maxScore = 150;
  const percentage = Math.min(100, Math.max(0, (totalScore / maxScore) * 100));
  
  // Calculate level
  const level = Math.floor(totalScore / 30) + 1;

  const t = {
    'en': 'Challenge Level',
    'zh-CN': '试炼等级',
    'zh-TW': '試煉等級'
  }[lang] || 'Challenge Level';

  const isCyber = theme === 'cyberpunk';
  
  return (
    <div className={`mt-4 w-full flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
      isCyber ? 'bg-[#121422] border border-[#00ffd5]/20' : 'bg-slate-100/80 border border-slate-300 shadow-inner'
    }`}>
      <div className={`w-full flex items-center justify-between px-2 mb-1 text-[10px] font-mono uppercase tracking-wide font-black select-none ${
        isCyber ? 'text-[#00ffd5]' : 'text-slate-600'
      }`}>
        <span className="flex items-center gap-1 opacity-75">
          <Zap size={10} className={streak > 0 ? "text-amber-400" : ""} />
          {t} {level}
        </span>
        <span className="opacity-75">
          {Math.floor(percentage)}%
        </span>
      </div>
      
      {/* ProgressBar Background */}
      <div className={`w-full h-2 rounded-full overflow-hidden relative ${
        isCyber ? 'bg-[#000]' : 'bg-slate-300'
      }`}>
        {/* Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`absolute left-0 top-0 bottom-0 ${
            isCyber ? 'bg-gradient-to-r from-[#00ffd5] to-[#ff00bb]' : 'bg-gradient-to-r from-amber-400 to-rose-400'
          }`}
        />
        {/* Glow effect for Cyberpunk */}
        {isCyber && percentage > 0 && (
           <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute left-0 top-0 bottom-0 blur-[3px] bg-[#00ffd5]/50"
          />
        )}
      </div>

      <AnimatePresence>
        {badges > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="w-full flex flex-wrap justify-center gap-2 mt-3 p-1"
          >
            {Array.from({ length: badges }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: i * 0.1 }}
                className={`text-lg drop-shadow-md relative group flex items-center justify-center w-8 h-8 rounded-full ${
                  isCyber ? 'bg-[#00ffd5]/10 border border-[#00ffd5]/30' : 'bg-white border border-slate-200'
                }`}
                title={(i + 1) * 5 + ' Streak Badge!'}
              >
                🏆
                <div className={`absolute -bottom-1 -right-1 text-[8px] font-black px-1 rounded-sm ${
                  isCyber ? 'bg-[#ff00bb] text-white' : 'bg-amber-400 text-white'
                }`}>
                  {(i + 1) * 5}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
