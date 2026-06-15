import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Raindrop {
  id: number;
  emoji: string;
  x: number;
  size: number;
  duration: number;
}

interface JiaoRainfallProps {
  timePassed: number;
  isPlaying: boolean;
}

const EMOJIS = ['👴', '🌶️', '🌧️', '⚡', '💧', '✨', '🎓', '🛒'];

export default function JiaoRainfall({ timePassed, isPlaying }: JiaoRainfallProps) {
  const [drops, setDrops] = useState<Raindrop[]>([]);
  const nextId = useRef<number>(1);
  const lastSpawnTime = useRef<number>(0);

  useEffect(() => {
    // Only rain after 30 seconds of playing
    if (!isPlaying || timePassed < 30) {
      if (drops.length > 0) setDrops([]);
      return;
    }

    // Calculate spawn delay based on time passed
    // Starts slow (1 per 1.5s) and maxes out fast (10 per second) as game drags on
    const minSpawnDelay = 100; // max speed
    const maxSpawnDelay = 1500; // min speed
    
    // Scale intensity over the course of 30s to 120s
    let intensityProgress = (timePassed - 30) / 90;
    if (intensityProgress > 1) intensityProgress = 1;

    const currentSpawnDelay = maxSpawnDelay - (maxSpawnDelay - minSpawnDelay) * intensityProgress;

    let rafId: number;

    const loop = (timestamp: number) => {
      if (timestamp - lastSpawnTime.current > currentSpawnDelay) {
        const id = nextId.current++;
        const drop: Raindrop = {
          id,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          x: Math.random() * 100, // randomized viewport width %
          size: Math.random() * 1.5 + 0.8, // size variation
          duration: Math.random() * 4 + 3, // fall duration (3 to 7 seconds)
        };

        setDrops(prev => {
          const next = [...prev, drop];
          // Limit total drops to avoid lag
          if (next.length > 60) return next.slice(next.length - 60);
          return next;
        });
        
        lastSpawnTime.current = timestamp;

        // Cleanup this specific drop after animation completes
        setTimeout(() => {
          setDrops(prev => prev.filter(d => d.id !== id));
        }, drop.duration * 1000 + 500);
      }
      
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isPlaying, timePassed]);

  if (!isPlaying || timePassed < 30 || drops.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <AnimatePresence>
        {drops.map(drop => (
          <motion.div
            key={drop.id}
            initial={{ y: -50, x: `${drop.x}vw`, opacity: 0, rotate: 0 }}
            animate={{ 
              y: '110vh', 
              opacity: [0, 0.4, 0.6, 0.4, 0], 
              rotate: Math.random() * 360 > 180 ? 360 : -360 
            }}
            transition={{ duration: drop.duration, ease: 'linear' }}
            className="absolute drop-shadow-md mix-blend-overlay"
            style={{ 
              fontSize: `${drop.size}rem`, 
              left: `${drop.x}vw`,
              filter: `blur(${Math.random() * 2}px)`
            }}
          >
            {drop.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
