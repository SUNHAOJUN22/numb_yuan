import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import MinesweeperBoard from './components/MinesweeperBoard';
import StatsModal from './components/StatsModal';
import HowToPlayModal from './components/HowToPlayModal';
import WinLoseOverlay from './components/WinLoseOverlay';
import EasterEggModal from './components/EasterEggModal';
import { playSound } from './utils/audio';
import { 
  DifficultyType, 
  DIFFICULTIES, 
  Cell, 
  GameStats, 
  GameStatus, 
  ClickMode 
} from './types';
import { Language, translations } from './utils/i18n';

const STATS_KEY = 'google_minesweeper_stats';

const initialStatsState: GameStats = {
  easy: { gamesPlayed: 0, gamesWon: 0, bestTime: null },
  medium: { gamesPlayed: 0, gamesWon: 0, bestTime: null },
  hard: { gamesPlayed: 0, gamesWon: 0, bestTime: null },
};

export default function App() {
  // Multilingual localization states (Simplified Chinese default with smart browser locale fallback)
  const [lang, setLang] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('google_minesweeper_lang');
      if (stored === 'zh-CN' || stored === 'zh-TW' || stored === 'en') {
        return stored as Language;
      }
    } catch (e) {}
    
    if (typeof navigator !== 'undefined') {
      const navLang = navigator.language;
      if (navLang.includes('TW') || navLang.includes('HK') || navLang.includes('CHT')) return 'zh-TW';
      if (navLang.includes('CN') || navLang.includes('ZH') || navLang.includes('zh')) return 'zh-CN';
    }
    return 'en';
  });

  const [isEasterEggOpen, setIsEasterEggOpen] = useState<boolean>(false);

  // Synchronize language selection automatically across matches
  useEffect(() => {
    try {
      localStorage.setItem('google_minesweeper_lang', lang);
    } catch (e) {}
  }, [lang]);

  const t = translations[lang];

  // Game states
  const [difficulty, setDifficulty] = useState<DifficultyType>('easy');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [flagsCount, setFlagsCount] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [clickMode, setClickMode] = useState<ClickMode>('shovel');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);

  // Modal open controllers
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isHowToOpen, setIsHowToOpen] = useState<boolean>(false);

  // Statistics persisted via LocalStorage
  const [stats, setStats] = useState<GameStats>(initialStatsState);

  // Use refs to keep track of current states in timer subscription closure
  const statusRef = useRef<GameStatus>(status);
  statusRef.current = status;

  // Load stats on mounting
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      if (stored) {
        setStats(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse previous user stats:', e);
    }
  }, []);

  // Save stats helper
  const saveStats = (updatedStats: GameStats) => {
    setStats(updatedStats);
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(updatedStats));
    } catch (e) {
      console.error('Failed to store statistics:', e);
    }
  };

  const currentConfig = DIFFICULTIES[difficulty];

  // Initialize brand new board
  const initializeBoard = useCallback((diffSetting = difficulty) => {
    const config = DIFFICULTIES[diffSetting];
    const newBoard: Cell[][] = Array.from({ length: config.rows }, (_, r) =>
      Array.from({ length: config.cols }, (_, c) => ({
        r,
        c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );
    setBoard(newBoard);
    setStatus('idle');
    setFlagsCount(0);
    setTime(0);
  }, [difficulty]);

  // Run board initialization on mounting or when difficulty changes
  useEffect(() => {
    initializeBoard(difficulty);
  }, [difficulty, initializeBoard]);

  // Active playing Stopwatch Timer
  useEffect(() => {
    let timerId: any = null;
    if (status === 'playing') {
      timerId = setInterval(() => {
        setTime((prev) => {
          if (prev >= 999) {
            clearInterval(timerId); // Cap at digital standard 999
            return 999;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [status]);

  // Seed mine spots: Ensures safety field layout by guaranteeing a mine-free 3x3 region around the clicked cell!
  const generateMinesAndNeighbors = (firstR: number, firstC: number, currentBoard: Cell[][]) => {
    const config = DIFFICULTIES[difficulty];
    const totalSlots = config.rows * config.cols;
    const minePositions = new Set<string>();

    // Target total mines count
    let minesToPlace = config.mines;

    // Check boundary safe zones (the 3x3 surrounding cells can't have mines)
    const isSafeZone = (r: number, c: number) => {
      return Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1;
    };

    while (minePositions.size < minesToPlace) {
      const idx = Math.floor(Math.random() * totalSlots);
      const r = Math.floor(idx / config.cols);
      const c = idx % config.cols;

      if (!isSafeZone(r, c)) {
        minePositions.add(`${r},${c}`);
      }
    }

    // Embed positions into state board
    const workingBoard = currentBoard.map((row) =>
      row.map((cell) => {
        const hasMine = minePositions.has(`${cell.r},${cell.c}`);
        return { ...cell, isMine: hasMine };
      })
    );

    // Calculate neighborhood mine values
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (workingBoard[r][c].isMine) continue;

        let neighbors = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 &&
              nr < config.rows &&
              nc >= 0 &&
              nc < config.cols &&
              workingBoard[nr][nc].isMine
            ) {
              neighbors++;
            }
          }
        }
        workingBoard[r][c].neighborMines = neighbors;
      }
    }

    return workingBoard;
  };

  // Check victory condition
  const checkVictory = (currentBoard: Cell[][]) => {
    const config = DIFFICULTIES[difficulty];
    let revealedNonMines = 0;
    const totalNonMines = config.rows * config.cols - config.mines;

    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        const cell = currentBoard[r][c];
        if (cell.isRevealed && !cell.isMine) {
          revealedNonMines++;
        }
      }
    }

    if (revealedNonMines === totalNonMines) {
      setStatus('won');
      playSound.win(soundEnabled);

      // Persist statistics
      const updatedDiffStats = {
        gamesPlayed: stats[difficulty].gamesPlayed + 1,
        gamesWon: stats[difficulty].gamesWon + 1,
        bestTime:
          stats[difficulty].bestTime === null
            ? time
            : Math.min(stats[difficulty].bestTime as number, time),
      };

      saveStats({
        ...stats,
        [difficulty]: updatedDiffStats,
      });
    }
  };

  // Trigger defeat sequence
  const executeDefeat = (lastClickedR: number, lastClickedC: number, currentBoard: Cell[][]) => {
    setStatus('lost');
    playSound.explosion(soundEnabled);

    // Reveal cells & correct visual display
    const finalBoard = currentBoard.map((row) =>
      row.map((cell) => {
        if (cell.isMine && !cell.isRevealed) {
          // Keep normal unrevealed state but make sure we flag them or show normal bomb on end screen
          return { ...cell };
        }
        return cell;
      })
    );

    setBoard(finalBoard);

    const updatedDiffStats = {
      ...stats[difficulty],
      gamesPlayed: stats[difficulty].gamesPlayed + 1,
    };

    saveStats({
      ...stats,
      [difficulty]: updatedDiffStats,
    });
  };

  // Safe Cascade Queue-based Reveal Algorithm
  const revealEmptyChain = (startR: number, startC: number, currentBoard: Cell[][]) => {
    const config = DIFFICULTIES[difficulty];
    const workingBoard = currentBoard.map((row) => [...row]);
    const queue: [number, number][] = [[startR, startC]];
    const visited = new Set<string>([`${startR},${startC}`]);

    let cascadeCount = 0;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      workingBoard[r][c].isRevealed = true;
      workingBoard[r][c].isFlagged = false; // Auto unflag if revealed

      cascadeCount++;

      // If neighbor mines count is zero, check all direction offsets
      if (workingBoard[r][c].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            const coordKey = `${nr},${nc}`;

            if (
              nr >= 0 &&
              nr < config.rows &&
              nc >= 0 &&
              nc < config.cols &&
              !workingBoard[nr][nc].isRevealed &&
              !workingBoard[nr][nc].isFlagged &&
              !visited.has(coordKey)
            ) {
              visited.add(coordKey);
              queue.push([nr, nc]);
            }
          }
        }
      }
    }

    // Play cascade ripple audio pitch
    playSound.cascade(soundEnabled, Math.min(Math.floor(cascadeCount / 5), 15));
    return workingBoard;
  };

  // Left click / Tap Unearth Command Handler
  const handleRevealCell = (r: number, c: number) => {
    // Prevent unearthing already revealed or flagged cells
    if (board[r][c].isRevealed || board[r][c].isFlagged) {
      if (board[r][c].isRevealed) {
        // Trigger Chord check automatically on re-click
        handleChordSweep(r, c);
      }
      return;
    }

    // If active modifier is Flag mode, let's redirect to Flag Placement!
    if (clickMode === 'flag') {
      handleFlagCell(r, c);
      return;
    }

    let workingBoard = board.map((row) => [...row]);

    // 1. First-click check initialization
    if (status === 'idle') {
      setStatus('playing');
      workingBoard = generateMinesAndNeighbors(r, c, workingBoard);
    }

    // 2. Mine Check
    if (workingBoard[r][c].isMine) {
      workingBoard[r][c].isRevealed = true;
      setBoard(workingBoard);
      executeDefeat(r, c, workingBoard);
      return;
    }

    // 3. Normal Reveal
    playSound.click(soundEnabled);
    let finalRevealedBoard: Cell[][];

    if (workingBoard[r][c].neighborMines === 0) {
      finalRevealedBoard = revealEmptyChain(r, c, workingBoard);
    } else {
      workingBoard[r][c].isRevealed = true;
      finalRevealedBoard = workingBoard;
    }

    setBoard(finalRevealedBoard);
    checkVictory(finalRevealedBoard);
  };

  // Toggle Red Flag on a cell
  const handleFlagCell = (r: number, c: number) => {
    if (board[r][c].isRevealed) return; // Cannot flag a revealed cell

    const val = !board[r][c].isFlagged;
    
    // Play correct pop synth sound
    if (val) {
      playSound.flag(soundEnabled);
    } else {
      playSound.unflag(soundEnabled);
    }

    const workingBoard = board.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === r && cIdx === c) {
          return { ...cell, isFlagged: val };
        }
        return cell;
      })
    );

    // Sync counts
    const newFlagCount = flagsCount + (val ? 1 : -1);
    setFlagsCount(newFlagCount);
    setBoard(workingBoard);
  };

  // Chord Quick-Sweeper (Pro Double click / Left+Right click solver)
  const handleChordSweep = (r: number, c: number) => {
    const config = DIFFICULTIES[difficulty];
    const cell = board[r][c];
    if (!cell.isRevealed || cell.neighborMines === 0) return;

    // Count adjacent flags
    let adjacentFlagsCount = 0;
    const neighbors: [number, number][] = [];

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
          if (dr === 0 && dc === 0) continue;
          neighbors.push([nr, nc]);
          if (board[nr][nc].isFlagged) {
            adjacentFlagsCount++;
          }
        }
      }
    }

    // If flagged neighbors count equals target cell count value, quick sweep!
    if (adjacentFlagsCount === cell.neighborMines) {
      let workingBoard = board.map((row) => [...row]);
      let hitMine = false;
      let explodedR = -1;
      let explodedC = -1;

      // Unearth all non-flagged neighboring squares
      for (const [nr, nc] of neighbors) {
        const targetCell = workingBoard[nr][nc];
        if (!targetCell.isRevealed && !targetCell.isFlagged) {
          if (targetCell.isMine) {
            hitMine = true;
            explodedR = nr;
            explodedC = nc;
            workingBoard[nr][nc].isRevealed = true;
          } else if (targetCell.neighborMines === 0) {
            workingBoard = revealEmptyChain(nr, nc, workingBoard);
          } else {
            workingBoard[nr][nc].isRevealed = true;
          }
        }
      }

      if (hitMine) {
        setBoard(workingBoard);
        executeDefeat(explodedR, explodedC, workingBoard);
      } else {
        playSound.click(soundEnabled);
        setBoard(workingBoard);
        checkVictory(workingBoard);
      }
    }
  };

  // Global Keyboard listener for Pro commands (e.g. F key toggling tools, ESC, restarts)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
      if (isInput) return; // Ignore inside standard input nodes

      if (e.key === 'f' || e.key === 'F') {
        setClickMode((p) => (p === 'shovel' ? 'flag' : 'shovel'));
      }
      if (e.key === 'r' || e.key === 'R') {
        initializeBoard();
      }
      if (e.key === 'Escape') {
        setIsStatsOpen(false);
        setIsHowToOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => {
      window.removeEventListener('keydown', handleGlobalShortcuts);
    };
  }, [initializeBoard]);

  // Score reset helper
  const handleClearStats = () => {
    saveStats(initialStatsState);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-3 sm:p-6 font-sans antialiased text-slate-800">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        {/* Playable Section Card */}
        <div className="bg-white rounded-[24px] shadow-sm p-4 sm:p-8 flex flex-col gap-6 border border-slate-200/50 relative overflow-hidden google-shadow">
          {/* Main Title & stats bar */}
          <Header
            difficulty={difficulty}
            setDifficulty={(diff) => {
              setDifficulty(diff);
              initializeBoard(diff);
            }}
            status={status}
            flagsCount={flagsCount}
            totalMines={currentConfig.mines}
            time={time}
            clickMode={clickMode}
            setClickMode={setClickMode}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            onRestart={() => initializeBoard()}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenHowTo={() => setIsHowToOpen(true)}
            lang={lang}
            setLang={setLang}
            onOpenEasterEgg={() => setIsEasterEggOpen(true)}
          />

          {/* Interactive Core Garden grid */}
          <MinesweeperBoard
            board={board}
            config={currentConfig}
            status={status}
            onReveal={handleRevealCell}
            onFlag={handleFlagCell}
            onChord={handleChordSweep}
            activeCell={activeCell}
            setActiveCell={setActiveCell}
          />

          {/* Auxiliary result summary overlay at base of grid */}
          <WinLoseOverlay
            status={status as any}
            time={time}
            bestTime={stats[difficulty].bestTime}
            config={currentConfig}
            onRestart={() => initializeBoard()}
            onOpenStats={() => setIsStatsOpen(true)}
            lang={lang}
          />
        </div>

        {/* Footer credits matches branding honesty constraints: Simple literal details, no system clutter of slop */}
        <div className="text-center text-[11px] text-slate-400 select-none flex flex-col gap-3">
          <div className="leading-relaxed font-sans">
            {t.footerShortcutInfo}
          </div>
          <div 
            onClick={() => setIsEasterEggOpen(true)}
            className="text-amber-500 hover:text-amber-600 font-display font-extrabold tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-95 transition-all duration-200 select-none"
            id="footer-egg-trigger"
          >
            <span>✨ Designed & Engineered by 椒哥 (Design by 椒哥) ✨</span>
          </div>
        </div>
      </div>

      {/* Persistence and Guide Modals */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        onClearStats={handleClearStats}
        lang={lang}
      />

      <HowToPlayModal
        isOpen={isHowToOpen}
        onClose={() => setIsHowToOpen(false)}
        lang={lang}
      />

      {/* Jiao Ge's Legendary Easter Egg Modal */}
      <EasterEggModal
        isOpen={isEasterEggOpen}
        onClose={() => setIsEasterEggOpen(false)}
        lang={lang}
        soundEnabled={soundEnabled}
      />
    </div>
  );
}
