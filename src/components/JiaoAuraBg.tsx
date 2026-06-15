import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface JiaoAuraBgProps {
  streak: number;
  intensity?: number;
}

export default function JiaoAuraBg({ streak, intensity = 100 }: JiaoAuraBgProps) {
  if (streak === 0) return null;

  // Streak levels: 1-3, 4-9, 10+
  // Change aura base color and intensity
  let auraColor = '#f59e0b'; // amber-500
  let scale = 1.05;
  let freq = 0.02;

  const mult = Math.max(0, intensity / 100);

  if (streak >= 10) {
    auraColor = '#db2777'; // pink-600 (Cyberpunk-ish or fiery)
    scale = 1.2;
    freq = 0.05 * mult;
  } else if (streak >= 4) {
    auraColor = '#ef4444'; // red-500
    scale = 1.12;
    freq = 0.035 * mult;
  } else {
    freq = 0.02 * mult;
  }

  // Adjust blur and displacement based on intensity
  const blurBase = (4 + streak) * mult;
  const displacementBase = (20 + streak * 2) * mult;
  const opacityHigh = 0.8 * mult;
  const opacityLow = 0.4 * mult;
  const glowRadius = (20 + streak * 5) * mult;

  // Don't render SVG filter if intensity is essentially 0
  if (mult < 0.01) return null;

  return (
    <div className="absolute inset-0 z-[-1] pointer-events-none">
      {/* SVG Filter Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="jiao-aura-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={freq}
              numOctaves="3"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                values={`${freq};${freq * 1.5};${freq}`}
                dur={`${4 / Math.max(1, streak * 0.5)}s`}
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={displacementBase}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation={blurBase} result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Pulsing Aura Box */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: [opacityLow, opacityHigh, opacityLow],
            scale: [1, scale, 1],
          }}
          transition={{
            duration: 2 / Math.max(1, streak * 0.3),
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-xl"
          style={{
            backgroundColor: auraColor,
            filter: 'url(#jiao-aura-filter)',
            boxShadow: `0 0 ${glowRadius}px ${auraColor}`,
          }}
        />
      </AnimatePresence>
    </div>
  );
}
