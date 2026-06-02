import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Cell, DifficultyConfig } from '../types';

interface BoardProps {
  board: Cell[][];
  config: DifficultyConfig;
  status: 'idle' | 'playing' | 'won' | 'lost';
  onReveal: (r: number, c: number) => void;
  onFlag: (r: number, c: number) => void;
  onChord: (r: number, c: number) => void;
  activeCell: { r: number; c: number } | null;
  setActiveCell: (cell: { r: number; c: number } | null) => void;
}

export default function MinesweeperBoard({
  board,
  config,
  status,
  onReveal,
  onFlag,
  onChord,
  activeCell,
  setActiveCell,
}: BoardProps) {
  const { cols } = config;

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

  // Render correct color values for neighbor mines (Google themed)
  const getNumberColor = (num: number) => {
    switch (num) {
      case 1:
        return 'text-[#4285F4] font-extrabold'; // Google Blue
      case 2:
        return 'text-[#34A853] font-extrabold'; // Google Green
      case 3:
        return 'text-[#EA4335] font-extrabold'; // Google Red
      case 4:
        return 'text-[#854dff] font-extrabold'; // Purple
      case 5:
        return 'text-[#FBBC05] font-extrabold'; // Google Amber
      case 6:
        return 'text-[#0097A7] font-extrabold'; // Teal
      case 7:
        return 'text-[#424242] font-extrabold'; // Dark Charcoal
      case 8:
        return 'text-[#8E8e8e] font-extrabold'; // Gray
      default:
        return 'text-transparent';
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
    if (e.key === 'f' || e.key === 'F') {
      onFlag(r, c);
    }
  };

  // Determine standard cell background based on row/column checker index (Google palette)
  const getCellClasses = (cell: Cell) => {
    const isEven = (cell.r + cell.c) % 2 === 0;

    if (cell.isRevealed) {
      if (cell.isMine) {
        return 'bg-[#EA4335] text-white'; // Exploded mine color
      }
      return isEven ? 'bg-[#ffffff]' : 'bg-[#f8f9fa]';
    }

    return isEven 
      ? 'bg-[#e8f0fe] hover:bg-[#d2e3fc] cursor-pointer' 
      : 'bg-[#dce9fc] hover:bg-[#c3dafe] cursor-pointer';
  };

  return (
    <div 
      className="w-full bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200/40 flex justify-center overflow-x-auto no-select touch-pan-x touch-pan-y"
      id="minesweeper-board-wrapper"
    >
      {/* Scrollable container grid with smooth shadows */}
      <div 
        className="rounded-xl overflow-hidden shadow-sm border border-slate-250 bg-[#dadce0] select-none"
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.08, delay: (rIdx + cIdx) * 0.0005 }}
                
                // Unified touch start timer
                onTouchStart={() => startTouchTimer(rIdx, cIdx)}
                onTouchEnd={() => cancelTouchTimer()}
                onTouchMove={handleTouchMove}

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
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(rIdx, cIdx, e)}
                className={`
                  w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
                  flex items-center justify-center 
                  text-sm sm:text-base font-display font-extrabold 
                  transition-all duration-100 no-select outline-none
                  relative border-none select-none touch-manipulation
                  ${getCellClasses(cell)}
                `}
              >
                {/* 1. Revealed Numbers (1-8) */}
                {hasNum && (
                  <span className={`${getNumberColor(cell.neighborMines)} font-sans select-none scale-105`}>
                    {cell.neighborMines}
                  </span>
                )}

                {/* 2. Flag State */}
                {!cell.isRevealed && cell.isFlagged && !isWrongFlag && (
                  <motion.div
                    initial={{ scale: 0.5, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="animate-flag-bounce flex items-center justify-center text-[#EA4335] drop-shadow-sm z-10 font-display font-black text-base sm:text-lg select-none"
                  >
                    椒
                  </motion.div>
                )}

                {/* 3. Game Over: Unrevealed Mines */}
                {isGameOverMine && !cell.isFlagged && (
                  <motion.div
                    initial={{ scale: 0.4, rotate: 45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="text-slate-800 flex items-center justify-center z-10 font-display font-extrabold text-[#EA4335] select-none"
                  >
                    袁
                  </motion.div>
                )}

                {/* 4. Game Over: Exploded Mine (Clicked on) */}
                {cell.isRevealed && cell.isMine && (
                  <div className="absolute inset-0 bg-[#EA4335] flex items-center justify-center z-10 font-display font-extrabold text-white text-base select-none">
                    袁
                  </div>
                )}

                {/* 5. Game Over: Wrongly Flagged Mine Correction */}
                {isWrongFlag && (
                  <div className="relative flex items-center justify-center z-10 animate-fade-in select-none">
                    <span className="text-[#EA4335]/50 font-display font-extrabold text-sm sm:text-base select-none">椒</span>
                    <X className="absolute w-4.5 h-4.5 text-[#EA4335] stroke-[3px]" />
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
