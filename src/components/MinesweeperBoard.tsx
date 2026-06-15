import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Cell, DifficultyConfig } from '../types';

interface BoardProps {
  board: Cell[][];
  config: DifficultyConfig;
  status: 'idle' | 'playing' | 'won' | 'lost';
  showcaseActive?: boolean;
  difficulty?: string;
  onReveal: (r: number, c: number) => void;
  onFlag: (r: number, c: number) => void;
  onChord: (r: number, c: number) => void;
  activeCell: { r: number; c: number } | null;
  setActiveCell: (cell: { r: number; c: number } | null) => void;
  theme?: 'classic' | 'cyberpunk';
  comboToasts?: { id: number; tokens: number; clearCount: number; r: number; c: number; multiplier: number }[];
  clickMode?: 'shovel' | 'flag';
}

export default function MinesweeperBoard({
  board,
  config,
  status,
  showcaseActive,
  difficulty = 'easy',
  onReveal,
  onFlag,
  onChord,
  activeCell,
  setActiveCell,
  theme = 'classic',
  comboToasts = [],
  clickMode = 'shovel',
}: BoardProps) {

  const getCursorStyle = () => {
    if (status !== 'playing' && status !== 'idle') return {};

    // %23 is the URL escape for # indicating color hex
    const jiaoFace = `
      <circle cx="8" cy="8" r="8" fill="%23ffe0bd" stroke="%234a3728" stroke-width="1.2" />
      <path d="M 1,6 C 0,3 3,2 3,5" fill="none" stroke="%2390a4ae" stroke-width="1.5" stroke-linecap="round" />
      <path d="M 15,6 C 16,3 13,2 13,5" fill="none" stroke="%2390a4ae" stroke-width="1.5" stroke-linecap="round" />
      <circle cx="5" cy="7.5" r="2.2" fill="none" stroke="%2337474f" stroke-width="0.75" />
      <circle cx="11" cy="7.5" r="2.2" fill="none" stroke="%2337474f" stroke-width="0.75" />
      <line x1="7" y1="7.5" x2="9" y2="7.5" stroke="%2337474f" stroke-width="0.75" />
      <path d="M 5,11.5 Q 8,14.5 11,11.5" fill="none" stroke="%2337474f" stroke-width="1.2" stroke-linecap="round" />
    `;

    if (clickMode === 'flag') {
      // Elegant red flags, flagpole, and Jiao Ge's face badge
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
          <!-- Flagpole -->
          <line x1="4" y1="2" x2="4" y2="34" stroke="%2337474f" stroke-width="2.5" stroke-linecap="round" />
          <!-- Flag Base Ornament -->
          <circle cx="4" cy="2" r="1.5" fill="%23ffea00" />
          <!-- Red Wavy Flag -->
          <path d="M 4,4 L 20,8 L 4,14 Z" fill="%23ff1744" stroke="%23d50000" stroke-width="1" stroke-linejoin="round" />
          <!-- Jiao Ge Face Badge -->
          <g transform="translate(14, 14)">
            ${jiaoFace}
          </g>
        </svg>
      `.trim().replace(/\s+/g, ' ');
      
      // Hotspot is flagpole tip (4, 2)
      return {
        cursor: `url("data:image/svg+xml;utf8,${svg}") 4 2, auto`
      };
    } else {
      // Classic shovel tool and Jiao Ge's face badge
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
          <!-- Shovel Blade (Tip at 2,2) pointed downwards-right to look like pointer -->
          <path d="M 2,2 L 12,5 L 5,12 Z" fill="%23cfd8dc" stroke="%2337474f" stroke-width="2" stroke-linejoin="round" />
          <!-- Shovel shaft lines -->
          <line x1="7" y1="7" x2="19" y2="19" stroke="%238d6e63" stroke-width="2.5" stroke-linecap="round" />
          <!-- Shovel handle -->
          <path d="M 18,18 L 22,22 M 20,20 L 24,24" stroke="%235d4037" stroke-width="3" stroke-linecap="round" />
          <!-- Jiao Ge Face Badge -->
          <g transform="translate(14, 4)">
            ${jiaoFace}
          </g>
        </svg>
      `.trim().replace(/\s+/g, ' ');

      // Hotspot is shovel tip (2, 2)
      return {
        cursor: `url("data:image/svg+xml;utf8,${svg}") 2 2, auto`
      };
    }
  };

  const { cols } = config;

  // Ripple effect state
  const [ripples, setRipples] = React.useState<Record<string, { x: number; y: number; id: number }[]>>({});

  const addRipple = (e: React.PointerEvent, r: number, c: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const key = `${r}-${c}`;
    const id = Date.now();
    
    setRipples(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { x, y, id }]
    }));
  };

  const removeRipple = (key: string, id: number) => {
    setRipples(prev => ({
      ...prev,
      [key]: prev[key]?.filter(r => r.id !== id) || []
    }));
  };

  // Touch handlers for mobile device compatibility (iOS/Android/Windows Touch)
  const touchTimeoutRef = useRef<any>(null);
  const touchHasMovedRef = useRef<boolean>(false);
  const lastTouchFlaggedCellRef = useRef<string | null>(null);

  const startTouchTimer = (r: number, c: number) => {
    if (status !== 'playing' && status !== 'idle') return;
    touchHasMovedRef.current = false;
    
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }

    touchTimeoutRef.current = setTimeout(() => {
      if (!touchHasMovedRef.current) {
        // Trigger small vibration for pristine feedback on mobile platforms
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          try {
            window.navigator.vibrate(35);
          } catch (e) {}
        }
        onFlag(r, c);
        lastTouchFlaggedCellRef.current = `${r}-${c}`;
        touchTimeoutRef.current = null;
      }
    }, 380); // Optimal long press duration for responsive feel without accidental trigger
  };

  const cancelTouchTimer = () => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
  };

  const handleTouchMove = () => {
    // If the finger slides, the user is scrolling the board. Cancel the flagging action.
    touchHasMovedRef.current = true;
    cancelTouchTimer();
  };

  // Render correct color values for neighbor mines (Google themed or Cyberpunk Neon)
  const getNumberColor = (num: number) => {
    if (theme === 'cyberpunk') {
      switch (num) {
        case 1: return 'text-[#39ff14] font-mono font-black cyber-glow-green filter drop-shadow-[0_0_2px_rgba(57,255,20,0.8)]'; 
        case 2: return 'text-[#ff00a2] font-mono font-black cyber-glow-magenta filter drop-shadow-[0_0_2px_rgba(255,0,162,0.8)]'; 
        case 3: return 'text-[#ffea00] font-mono font-black cyber-glow-yellow filter drop-shadow-[0_0_2px_rgba(255,234,0,0.8)]'; 
        case 4: return 'text-[#00f0ff] font-mono font-black cyber-glow-cyan filter drop-shadow-[0_0_2px_rgba(0,240,255,0.8)]'; 
        case 5: return 'text-[#9d4edd] font-mono font-black cyber-glow-purple filter drop-shadow-[0_0_2px_rgba(157,78,221,0.8)]'; 
        case 6: return 'text-[#ff5500] font-mono font-black cyber-glow-pink filter drop-shadow-[0_0_2px_rgba(255,85,0,0.8)]'; 
        case 7: return 'text-[#ffffff] font-mono font-black cyber-glow-white filter drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]'; 
        case 8: return 'text-[#39ff14] font-mono font-black cyber-glow-green animate-pulse filter drop-shadow-[0_0_4px_rgba(57,255,20,0.9)]'; 
        default: return 'text-transparent';
      }
    }
    // Minimalist classic colors
    switch (num) {
      case 1: return 'text-blue-600 font-sans font-black'; 
      case 2: return 'text-emerald-600 font-sans font-black'; 
      case 3: return 'text-red-500 font-sans font-black'; 
      case 4: return 'text-indigo-600 font-sans font-black'; 
      case 5: return 'text-orange-600 font-sans font-black'; 
      case 6: return 'text-cyan-600 font-sans font-black'; 
      case 7: return 'text-neutral-800 font-sans font-black'; 
      case 8: return 'text-rose-600 font-sans font-black animate-pulse'; 
      default: return 'text-transparent';
    }
  };

  // Double click handler for speed sweeps (chording)
  const handleDoubleClick = (r: number, c: number) => {
    if (status === 'playing' || status === 'idle') {
      onChord(r, c);
    }
  };

  // Prevent right-click context menus from interrupting flag placement
  const handleRightClick = (r: number, c: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (status === 'playing' || status === 'idle') {
      onFlag(r, c);
    }
  };

  // Handle keyboard shortcuts on individual cells after click
  const handleKeyDown = (r: number, c: number, e: React.KeyboardEvent) => {
    const maxR = board.length - 1;
    const maxC = board[0].length - 1;

    let targetR = r;
    let targetC = c;
    let handled = false;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        targetR = Math.max(0, r - 1);
        handled = true;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        targetR = Math.min(maxR, r + 1);
        handled = true;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        targetC = Math.max(0, c - 1);
        handled = true;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        targetC = Math.min(maxC, c + 1);
        handled = true;
        break;
      case ' ': // Spacebar
        e.preventDefault();
        if (status === 'playing' || status === 'idle') {
          if (clickMode === 'flag') {
            onFlag(r, c);
          } else {
            onReveal(r, c);
          }
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (status === 'playing' || status === 'idle') {
          onReveal(r, c);
        }
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        if (status === 'playing' || status === 'idle') {
          onFlag(r, c);
        }
        break;
      case 'c':
      case 'C':
        e.preventDefault();
        if (status === 'playing' || status === 'idle') {
          onChord(r, c);
        }
        break;
      default:
        break;
    }

    if (handled) {
      e.preventDefault();
      // Set active/focus coordinates
      setActiveCell({ r: targetR, c: targetC });
      // Direct DOM focus shift
      const targetEl = document.getElementById(`cell-${targetR}-${targetC}`);
      if (targetEl) {
        targetEl.focus();
      }
    }
  };

  // Determine standard cell background based on checker index (Google or Cyberpunk palette)
  const getCellClasses = (cell: Cell) => {
    const isEven = (cell.r + cell.c) % 2 === 0;
    const isActive = activeCell && activeCell.r === cell.r && activeCell.c === cell.c;

    if (theme === 'cyberpunk') {
      if (cell.isRevealed) {
        if (cell.isMine) {
          return `bg-gradient-to-br from-[#ff0055]/35 to-[#ff00aa]/20 border border-[#ff0055] text-white shadow-[0_0_15px_#ff0055] ${isActive ? 'ring-2 ring-[#00f0ff] ring-offset-1 ring-offset-[#080a14] z-10 scale-[1.08]' : ''}`;
        }
        // Retro Terminal style revealed cell: jet-black cathode tube background, neon green scanlines, glowing interface borders
        const terminalScanlineBg = `bg-[#03050a] bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(57,255,20,0.06)_50%)] bg-[size:100%_4px] border border-[#39ff14]/30 shadow-[inset_0_0_8px_rgba(57,255,20,0.12)]`;
        return `${terminalScanlineBg} ${isActive ? 'ring-2 ring-[#00f0ff] ring-offset-1 ring-offset-[#080a14] z-10 scale-[1.08]' : ''}`;
      }
      
      const sum = cell.r + cell.c;
      let hoverColor = 'hover:border-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.65)] text-[#00f0ff]';
      let borderAccent = 'border-[#00f0ff]/20';
      let bgBase = isEven ? 'bg-[#12152a]' : 'bg-[#151a34]';
      
      let activeGlow = isActive ? 'border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.65)] scale-[1.08] z-10 ring-2 ring-[#00f0ff] ring-offset-1 ring-offset-[#080a14]' : '';

      if (sum % 4 === 0) {
        // Neon Purple
        hoverColor = 'hover:border-[#9d4edd] hover:shadow-[0_0_15px_rgba(157,78,221,0.7)] text-[#9d4edd]';
        borderAccent = 'border-[#9d4edd]/25';
        if (isActive) {
          activeGlow = 'border-[#9d4edd] shadow-[0_0_15px_rgba(157,78,221,0.7)] scale-[1.08] z-10 ring-2 ring-[#9d4edd] ring-offset-1 ring-offset-[#080a14]';
        }
      } else if (sum % 4 === 1) {
        // Neon Pink/Magenta
        hoverColor = 'hover:border-[#ff00a2] hover:shadow-[0_0_15px_rgba(255,0,162,0.7)] text-[#ff00a2]';
        borderAccent = 'border-[#ff00a2]/25';
        if (isActive) {
          activeGlow = 'border-[#ff00a2] shadow-[0_0_15px_rgba(255,0,162,0.7)] scale-[1.08] z-10 ring-2 ring-[#ff00a2] ring-offset-1 ring-offset-[#080a14]';
        }
      } else if (sum % 4 === 2) {
        // Neon Green
        hoverColor = 'hover:border-[#39ff14] hover:shadow-[0_0_15px_rgba(57,255,20,0.7)] text-[#39ff14]';
        borderAccent = 'border-[#39ff14]/25';
        if (isActive) {
          activeGlow = 'border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.7)] scale-[1.08] z-10 ring-2 ring-[#39ff14] ring-offset-1 ring-offset-[#080a14]';
        }
      } else {
        // Neon Yellow
        hoverColor = 'hover:border-[#ffea00] hover:shadow-[0_0_15px_rgba(255,234,0,0.7)] text-[#ffea00]';
        borderAccent = 'border-[#ffea00]/25';
        if (isActive) {
          activeGlow = 'border-[#ffea00] shadow-[0_0_15px_rgba(255,234,0,0.7)] scale-[1.08] z-10 ring-2 ring-[#ffea00] ring-offset-1 ring-offset-[#080a14]';
        }
      }

      return `${bgBase} border ${borderAccent} ${hoverColor} cursor-pointer transition-all hover:z-10 ${activeGlow}`;
    }

    // Classic (Minimalist Flat, Optimized)
    let focusRing = isActive ? 'ring-2 ring-slate-800 ring-offset-1 z-25 scale-[1.04]' : '';
    if (cell.isRevealed) {
      if (cell.isMine) {
        return `bg-red-500 text-white ${focusRing}`; // Exploded mine color
      }
      // Flat minimal revealed cell
      const minimalBg = isEven ? "bg-[#f1f5f9] border border-slate-200" : "bg-[#e2e8f0] border border-slate-200"; 
      return `${minimalBg} ${focusRing}`;
    }

    // Unrevealed clean minimal cells
    const baseBg = isEven 
      ? 'bg-white hover:bg-slate-100 border-t-2 border-l-2 border-white border-r-2 border-b-2 border-slate-300 shadow-[inset_-1px_-1px_0px_rgba(0,0,0,0.06)] cursor-pointer text-slate-800' 
      : 'bg-slate-50 hover:bg-slate-100 border-t-2 border-l-2 border-white border-r-2 border-b-2 border-slate-300 shadow-[inset_-1px_-1px_0px_rgba(0,0,0,0.06)] cursor-pointer text-slate-800';

    return `${baseBg} ${focusRing}`;
  };

  return (
    <div 
      className={`w-full flex justify-center overflow-x-auto no-select touch-pan-x touch-pan-y transition-all duration-300 ${
        theme === 'cyberpunk'
          ? 'p-2 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border bg-[#090a12]/80 border-[#00f0ff]/20'
          : 'p-0 bg-transparent'
      }`}
      id="minesweeper-board-wrapper"
      style={getCursorStyle()}
    >
      <style>{`
        /* Faint grid-line overlay for keyboard users to improve navigation clarity */
        #board-grid:has(:focus-visible) > div::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          box-shadow: inset 0 0 0 1px ${theme === 'cyberpunk' ? 'rgba(0,240,255,0.2)' : 'rgba(0,0,0,0.1)'};
          z-index: 5;
        }
      `}</style>

      {/* Scrollable container grid with smooth shadows */}
      <div 
        className={`overflow-hidden select-none transition-all duration-300 ${
          theme === 'cyberpunk'
            ? 'rounded-xl bg-gradient-to-br from-[#ff0055]/40 to-[#00f0ff]/40 p-[2px] shadow-[0_0_20px_rgba(255,0,85,0.25)] border-transparent'
            : 'border-2 border-slate-300 bg-slate-300 shadow-none rounded-none'
        }`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          width: 'max-content',
          gap: '1px',
        }}
        id="board-grid"
      >
        {board.map((rowArr, rIdx) =>
          rowArr.map((cell, cIdx) => {
            const hasNum = cell.isRevealed && !cell.isMine && cell.neighborMines > 0;
            const isGameOverMine = status === 'lost' && cell.isMine;
            const isWrongFlag = status === 'lost' && cell.isFlagged && !cell.isMine;

            return (
              <motion.div
                key={`${rIdx}-${cIdx}`}
                id={`cell-${rIdx}-${cIdx}`}
                style={getCursorStyle()}
                
                // Unified touch start timer
                onTouchStart={() => startTouchTimer(rIdx, cIdx)}
                onTouchEnd={() => cancelTouchTimer()}
                onTouchMove={handleTouchMove}

                onPointerDown={(e) => addRipple(e, rIdx, cIdx)}

                onClick={() => {
                  // Guard against click if this was just flagged with touch-hold
                  if (lastTouchFlaggedCellRef.current === `${rIdx}-${cIdx}`) {
                    lastTouchFlaggedCellRef.current = null;
                    return;
                  }
                  if (status === 'playing' || status === 'idle') {
                    onReveal(rIdx, cIdx);
                  }
                }}
                onContextMenu={(e) => handleRightClick(rIdx, cIdx, e)}
                onDoubleClick={() => handleDoubleClick(rIdx, cIdx)}
                onMouseEnter={() => setActiveCell({ r: rIdx, c: cIdx })}
                onMouseLeave={() => setActiveCell(null)}
                onFocus={() => setActiveCell({ r: rIdx, c: cIdx })}
                onBlur={() => setActiveCell(null)}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(rIdx, cIdx, e)}
                
                // Exquisite Framer Motion visual polish physics configurations
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: 1,
                  scale: cell.isRevealed ? [0.93, 1.05, 1] : cell.isFlagged ? [0.93, 1.08, 1] : 1,
                  rotate: cell.isRevealed && cell.isMine ? [0, 8, -8, 6, -6, 0] : 0,
                }}
                whileHover={{ scale: cell.isRevealed ? 1.02 : 1.08, zIndex: 10 }}
                whileTap={{ scale: 0.92 }}
                transition={{
                  duration: 0.22,
                  ease: [0.16, 1, 0.3, 1], // premium custom cubic-bezier
                  delay: status === 'idle' ? (rIdx + cIdx) * 0.002 : 0, // staggered wave only on fresh board entry
                }}
                className={`
                  w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
                  flex items-center justify-center 
                  text-sm sm:text-base font-sans font-bold 
                  no-select outline-none
                  relative border-none select-none touch-manipulation
                  ${getCellClasses(cell)}
                `}
              >
                {/* Ripple Effect Container */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-sm z-0">
                  {(ripples[`${rIdx}-${cIdx}`] || []).map(r => (
                    <motion.span
                      key={r.id}
                      initial={{ scale: 0, opacity: theme === 'cyberpunk' ? 0.7 : 0.4 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      onAnimationComplete={() => removeRipple(`${rIdx}-${cIdx}`, r.id)}
                      className={`absolute rounded-full ${theme === 'cyberpunk' ? 'bg-[#00f0ff]' : 'bg-slate-800'}`}
                      style={{ 
                        left: r.x, 
                        top: r.y, 
                        width: 24, 
                        height: 24, 
                        marginTop: -12, 
                        marginLeft: -12,
                        filter: theme === 'cyberpunk' ? 'blur(2px)' : 'none'
                      }}
                    />
                  ))}
                </div>

                {/* Subtle Jiao Ge protective watermark on unrevealed tiles */}
                {!cell.isRevealed && !cell.isFlagged && (
                  <span className="absolute inset-0 flex items-center justify-center opacity-[0.06] text-[10px] font-display font-black select-none pointer-events-none">
                    {theme === 'cyberpunk' ? 'J' : '👴'}
                  </span>
                )}

                {/* 1. Revealed Numbers (1-8) or Showcase Emoji */}
                {hasNum && (
                  showcaseActive ? (
                    <span 
                      className={`select-none absolute inset-0 flex items-center justify-center ${
                        ['hard', 'expert'].includes(difficulty) ? 'animate-jiao-dance-expert' : 
                        difficulty === 'medium' ? 'animate-jiao-dance-intermediate' : 
                        'animate-jiao-dance-beginner'
                      }`}
                      style={{ 
                        animationDelay: `${(rIdx + cIdx) * 0.05}s` 
                      }}
                    >
                      {theme === 'cyberpunk' ? '😎' : '👴'}
                    </span>
                  ) : (
                    <span className={`relative z-10 ${getNumberColor(cell.neighborMines)} ${theme === 'cyberpunk' ? 'font-mono text-xs sm:text-sm' : 'font-sans text-base'} select-none scale-105`}>
                      {cell.neighborMines}
                    </span>
                  )
                )}

                {/* 2. Flag State */}
                {!cell.isRevealed && cell.isFlagged && !isWrongFlag && (
                  <div
                    className={`animate-flag-bounce flex items-center justify-center drop-shadow-sm z-10 font-display font-black text-base sm:text-lg select-none ${
                      theme === 'cyberpunk'
                        ? 'text-[#00f0ff] cyber-glow-cyan drop-shadow-[0_0_4px_#00f0ff] scale-110'
                        : 'text-[#EA4335]'
                    }`}
                  >
                    椒
                  </div>
                )}

                {/* 2.5 Combo Toasts Overlay */}
                {comboToasts && comboToasts.filter(t => t.r === rIdx && t.c === cIdx).map(t => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -45, scale: 1.1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                    className="absolute z-50 pointer-events-none flex flex-col items-center justify-center whitespace-nowrap text-center text-xs sm:text-sm font-black tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
                    style={{ 
                       color: theme === 'cyberpunk' ? '#00f0ff' : '#EA4335',
                       textShadow: theme === 'cyberpunk' ? '0 0 8px rgba(0,240,255,0.8)' : '0 1px 2px rgba(255,255,255,0.8)'
                    }}
                  >
                    <motion.div
                       initial={{ scale: 0.5, rotate: -20 }}
                       animate={{ scale: 1 + t.multiplier * 0.2, rotate: 0 }}
                       transition={{ type: 'spring', bounce: 0.6 }}
                       className="mb-1 drop-shadow-lg"
                    >
                      👴
                    </motion.div>
                    <div className="leading-tight">COMBO x{t.multiplier}!</div>
                    <div className="leading-tight">+{t.tokens} 椒</div>
                  </motion.div>
                ))}

                {/* 3. Game Over: Unrevealed Mines */}
                {isGameOverMine && !cell.isFlagged && (
                  <div
                    className={`flex items-center justify-center z-10 font-display font-extrabold select-none animate-[fade-in-scale_0.12s_ease-out_forwards] ${
                      theme === 'cyberpunk' ? 'text-[#ff0055] cyber-glow-magenta' : 'text-[#EA4335]'
                    }`}
                  >
                    袁
                  </div>
                )}

                {/* 4. Game Over: Exploded Mine (Clicked on) */}
                {cell.isRevealed && cell.isMine && (
                  <div className={`absolute inset-0 flex items-center justify-center z-10 font-display font-extrabold text-white text-base select-none ${
                    theme === 'cyberpunk' ? 'bg-[#ff0055] shadow-[0_0_12px_#ff0055] animate-pulse duration-100' : 'bg-[#EA4335]'
                  }`}>
                    袁
                  </div>
                )}

                {/* 5. Game Over: Wrongly Flagged Mine Correction */}
                {isWrongFlag && (
                  <div className="relative flex items-center justify-center z-10 animate-fade-in select-none">
                    <span className={`font-display font-extrabold text-sm sm:text-base select-none ${
                      theme === 'cyberpunk' ? 'text-slate-400' : 'text-[#EA4335]/50'
                    }`}>椒</span>
                    <X className={`absolute w-4.5 h-4.5 stroke-[3px] ${
                      theme === 'cyberpunk' ? 'text-[#ff0055]' : 'text-[#EA4335]'
                    }`} />
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
