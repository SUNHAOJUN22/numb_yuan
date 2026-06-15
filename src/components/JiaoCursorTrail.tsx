import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TrailParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  shadow: string;
  size: number;
  rotation: number;
}

interface JiaoCursorTrailProps {
  streak: number;
}

export default function JiaoCursorTrail({ streak }: JiaoCursorTrailProps) {
  const [particles, setParticles] = useState<TrailParticle[]>([]);
  const nextId = useRef<number>(1);
  const lastSpawnTime = useRef<number>(0);
  const lastPos = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    if (streak <= 0) {
      if (particles.length > 0) setParticles([]);
      return;
    }

    const getStreakColor = (streakCat: number) => {
      const index = Math.min(streakCat, 5);
      const schemes = [
        { color: '#ffee00', shadow: 'rgba(255,234,0,0.85)' }, // Streak 1: Electric Gold
        { color: '#39ff14', shadow: 'rgba(57,255,20,0.85)' },  // Streak 2: Neon Emerald
        { color: '#ff00ff', shadow: 'rgba(255,0,255,0.85)' },  // Streak 3: Cosmic Pink/Magenta
        { color: '#00ffff', shadow: 'rgba(0,240,255,0.85)' },  // Streak 4: Electric Cyan
        { color: '#ff6b00', shadow: 'rgba(255,107,0,0.85)' },  // Streak 5+: Hyper Orange Spark
      ];
      return schemes[index - 1];
    };

    const scheme = getStreakColor(streak);

    const spawnParticle = (x: number, y: number, force: boolean = false) => {
      const now = performance.now();
      if (!force) {
        // Limit spawn rate for mouse movement
        if (now - lastSpawnTime.current < 40) return; // ~25 FPS spawn rate
        if (lastPos.current) {
          const dx = x - lastPos.current.x;
          const dy = y - lastPos.current.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 100) return; // Too close
        }
      }

      lastSpawnTime.current = now;
      lastPos.current = { x, y };

      const pid = nextId.current++;
      
      const newParticle: TrailParticle = {
        id: pid,
        x: x + (Math.random() * 10 - 5),
        y: y + (Math.random() * 10 - 5),
        color: scheme.color,
        shadow: scheme.shadow,
        size: Math.random() * 8 + 4, // 4px to 12px
        rotation: Math.random() * 360,
      };

      setParticles(prev => [...prev.slice(-30), newParticle]); // keep max 30

      // Cleanup
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== pid));
      }, 800); // 800ms life
    };

    const handleMouseMove = (e: MouseEvent) => {
      spawnParticle(e.clientX, e.clientY);
    };

    const handleClick = (e: MouseEvent) => {
      // Spawn burst on click
      for(let i=0; i<5; i++) {
        spawnParticle(e.clientX, e.clientY, true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleClick, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleClick);
    };
  }, [streak]);

  if (streak <= 0 || particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.8, scale: 1, x: p.x, y: p.y, rotate: p.rotation }}
            animate={{ 
              opacity: 0, 
              scale: 0.2, 
              y: p.y + Math.random() * 20 + 20, // Drift down slightly
              x: p.x + Math.random() * 20 - 10,  
              rotate: p.rotation + Math.random() * 90 
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute rounded-full pointer-events-none mix-blend-screen"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.shadow}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
