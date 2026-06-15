import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';

interface ComboHUDProps {
  multiplier: number;
  clearCount: number;
  theme?: 'classic' | 'cyberpunk';
}

export default function ComboHUD({ multiplier, clearCount, theme = 'classic' }: ComboHUDProps) {
  const [displayMultiplier, setDisplayMultiplier] = useState(1);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (multiplier > 1) {
      setDisplayMultiplier(multiplier);
      setActive(true);

      const timer = setTimeout(() => {
        setActive(false);
      }, 3500);
      
      return () => clearTimeout(timer);
    } else {
      setActive(false);
    }
  }, [multiplier, clearCount]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="combo-hud"
          initial={{ opacity: 0, scale: 0.8, x: -60 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, filter: 'blur(8px)', x: -60 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`fixed left-1/2 top-32 z-[100] rounded-2xl p-4 shadow-2xl flex flex-col items-center pointer-events-none transform -translate-x-1/2 md:absolute md:left-4 md:top-1/2 md:-translate-y-1/2 md:-translate-x-0 transition-all ${
            theme === 'cyberpunk' 
              ? 'bg-[#0b0e14]/90 border-2 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.4)] backdrop-blur-md'
              : 'bg-white/95 border-2 border-amber-400 shadow-[0_8px_20px_rgba(251,191,36,0.3)] backdrop-blur-md'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className={`w-5 h-5 ${theme === 'cyberpunk' ? 'text-[#ffea00]' : 'text-amber-500'} animate-pulse`} />
            <span 
              className={`text-xl font-display font-black uppercase tracking-widest ${
                theme === 'cyberpunk' ? 'text-[#00f0ff]' : 'text-slate-800'
              }`}
            >
              Combo
            </span>
          </div>
          
          <motion.div 
            key={`${clearCount}-${multiplier}`}
            initial={{ scale: 1.5, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 10 }}
            className={`text-6xl font-display font-black ${
              theme === 'cyberpunk'
                ? 'text-[#ff0055] drop-shadow-[0_0_15px_rgba(255,0,85,0.8)]'
                : 'text-amber-500 drop-shadow-lg'
            }`}
          >
            x{displayMultiplier}
          </motion.div>
          
          <motion.div 
            key={`count-${clearCount}`}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`mt-2 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              theme === 'cyberpunk'
                ? 'bg-slate-900 border-[#ab47bc] text-[#ab47bc]'
                : 'bg-amber-100 border-amber-200 text-amber-700'
            }`}
          >
            {clearCount} Blocks Cleared
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
