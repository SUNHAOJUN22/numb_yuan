import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export const getCurrentSeason = (): Season => {
  const month = new Date().getMonth(); // 0 is Jan, 11 is Dec
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};

interface Particle {
  id: number;
  emoji: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

interface SeasonalBackgroundProps {
  season: Season;
  theme: 'classic' | 'cyberpunk';
}

export default function SeasonalBackground({ season, theme }: SeasonalBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (theme === 'cyberpunk') {
      setParticles([]);
      return;
    }

    // Generate static particles that animate infinitely or specific emojis based on season
    const count = season === 'winter' ? 40 : season === 'spring' ? 30 : season === 'autumn' ? 25 : 15;
    
    let emojis: string[] = [];
    if (season === 'spring') emojis = ['🌸', '💮', '🍃', '🌱'];
    if (season === 'summer') emojis = ['☀️', '🌴', '🌻', '🌊'];
    if (season === 'autumn') emojis = ['🍁', '🍂', '🍄', '🌰'];
    if (season === 'winter') emojis = ['❄️', '🧊', '⛄', '🌨️'];

    const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * 100, // vw
      size: Math.random() * 1.5 + 0.8, // rem
      duration: Math.random() * 10 + 10, // 10-20 seconds to fall
      delay: Math.random() * -20, // Start at different times
    }));

    setParticles(newParticles);
  }, [season, theme]);

  if (theme === 'cyberpunk' || particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: '-10vh', x: `${p.x}vw`, rotate: 0 }}
          animate={{ 
            y: '110vh', 
            rotate: Math.random() > 0.5 ? 360 : -360,
            x: [`${p.x}vw`, `${p.x + (Math.random() * 10 - 5)}vw`, `${p.x}vw`] 
          }}
          transition={{ 
            duration: p.duration, 
            delay: p.delay, 
            ease: 'linear',
            repeat: Infinity
          }}
          className="absolute drop-shadow-sm opacity-30 select-none"
          style={{ 
            fontSize: `${p.size}rem`,
            filter: `blur(${Math.random() * 1 + 0.5}px)`
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}
