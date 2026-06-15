import React, { useState, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface JiaoTooltipProps {
  children: ReactNode;
  content: string;
  delayMs?: number;
  wrapperClassName?: string;
}

export default function JiaoTooltip({ children, content, delayMs = 500, wrapperClassName = "" }: JiaoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<any>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  return (
    <div 
      className={`relative flex items-center justify-center ${wrapperClassName}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full mb-2 px-2 py-1 bg-slate-800 text-white text-xs font-mono rounded pointer-events-none z-50 whitespace-nowrap shadow-lg flex items-center gap-1.5 border border-slate-600"
          >
            <span>👴</span>
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
