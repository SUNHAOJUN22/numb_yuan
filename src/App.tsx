import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import MinesweeperBoard from './components/MinesweeperBoard';
import StatsModal from './components/StatsModal';
import HowToPlayModal from './components/HowToPlayModal';
import SettingsModal from './components/SettingsModal';
import WinLoseOverlay from './components/WinLoseOverlay';
import ComboHUD from './components/ComboHUD';
import EasterEggModal from './components/EasterEggModal';
import JiaoGeTerminal from './components/JiaoGeTerminal';
import JiaoGoldQuotesMarquee from './components/JiaoGoldQuotesMarquee';
import AchievementsModal, { unlockJiaoAchievement } from './components/AchievementsModal';
import SoundboardModal from './components/SoundboardModal';
import GlobalJiaoLeaderboardModal from './components/GlobalJiaoLeaderboardModal';
import JiaoGeProfileModal from './components/JiaoGeProfileModal';
import DailyMantraNotification from './components/DailyMantraNotification';
import JiaoCursorTrail from './components/JiaoCursorTrail';
import JiaoRainfall from './components/JiaoRainfall';
import QTEOverlay from './components/QTEOverlay';
import ChallengeMeter from './components/ChallengeMeter';
import JiaoAuraBg from './components/JiaoAuraBg';
import NumbnessMeter from './components/NumbnessMeter';
import SeasonalBackground, { getCurrentSeason, Season } from './components/SeasonalBackground';
import { useJiaoSwipeGesture } from './hooks/useJiaoSwipeGesture';
import { playSound, setMasterVolume } from './utils/audio';
import { vibrateCellReveal, vibrateVictoryTheme } from './utils/vibration';
import { playJiaoSpeech, getJiaoCatchphrase } from './utils/speech';
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
  kids: { gamesPlayed: 0, gamesWon: 0, bestTime: null },
  easy: { gamesPlayed: 0, gamesWon: 0, bestTime: null },
  medium: { gamesPlayed: 0, gamesWon: 0, bestTime: null },
  hard: { gamesPlayed: 0, gamesWon: 0, bestTime: null },
  expert: { gamesPlayed: 0, gamesWon: 0, bestTime: null },
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

  // Update browser document tab title dynamically
  useEffect(() => {
    document.title = t.title;
  }, [t.title]);

  // Game states
  const [difficulty, setDifficulty] = useState<DifficultyType>('easy');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [flagsCount, setFlagsCount] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [clickMode, setClickMode] = useState<ClickMode>('shovel');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [masterVolume, setMasterVolumeState] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('google_minesweeper_master_volume');
      if (stored !== null) return parseFloat(stored);
    } catch (e) {}
    return 1.0;
  });
  const [gameEndingSoundsEnabled, setGameEndingSoundsEnabled] = useState<boolean>(true);
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);

  const [showcaseActive, setShowcaseActive] = useState<boolean>(false);
  // Jiao Ge Active Win Streak & Challenge Mode states
  const [jiaoStreak, setJiaoStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('google_minesweeper_jiao_streak');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [bestJiaoStreak, setBestJiaoStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('google_minesweeper_best_jiao_streak');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  });
  
  const [jiaoBadges, setJiaoBadges] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('google_minesweeper_jiao_badges');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [jiaoTokens, setJiaoTokens] = useState<number>(() => {
    try { return Number(localStorage.getItem('jiaoge_tokens') || '0'); } catch { return 0; }
  });

  useEffect(() => {
    const handleTokensChange = () => {
      try {
        const val = Number(localStorage.getItem('jiaoge_tokens') || '0');
        setJiaoTokens(val);
      } catch {}
    };
    window.addEventListener('jiaoge_tokens_updated', handleTokensChange);
    return () => window.removeEventListener('jiaoge_tokens_updated', handleTokensChange);
  }, []);


  const [challengeMode, setChallengeMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('google_minesweeper_challenge_mode');
      return saved !== 'false'; // Default to true!
    } catch (e) {
      return true;
    }
  });

  // Track state changes to preserve localStorage
  useEffect(() => {
    try {
      localStorage.setItem('google_minesweeper_challenge_mode', challengeMode.toString());
    } catch (e) {}
  }, [challengeMode]);

  const getDynamicMines = useCallback((diff: DifficultyType, streak: number) => {
    try {
      const config = DIFFICULTIES[diff] || DIFFICULTIES['easy'];
      const baseMines = config.mines;
      if (!challengeMode || streak <= 0) return baseMines;
      
      let multiplier = 1;
      let maxExtra = 5;
      if (diff === 'kids') { multiplier = 1; maxExtra = 4; }
      else if (diff === 'easy') { multiplier = 2; maxExtra = 8; }
      else if (diff === 'medium') { multiplier = 5; maxExtra = 20; }
      else if (diff === 'hard') { multiplier = 10; maxExtra = 40; }
      else if (diff === 'expert') { multiplier = 15; maxExtra = 70; }
      
      return baseMines + Math.min(streak * multiplier, maxExtra);
    } catch (e) {
      console.error("Error calculating dynamic mines, falling back to base configuration:", e);
      return DIFFICULTIES[diff]?.mines || 10;
    }
  }, [challengeMode]);

  const activeMinesCount = getDynamicMines(difficulty, jiaoStreak);

  // Master Jiao Ge's Easter Egg help states
  const [jiaoHelpsRemaining, setJiaoHelpsRemaining] = useState<number>(3);
  const [jiaoHelpCooldown, setJiaoHelpCooldown] = useState<number | null>(null);
  const [jiaoMessageOverride, setJiaoMessageOverride] = useState<string>('');
  const typedBufferRef = useRef<string>('');

  // Modal open controllers
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isHowToOpen, setIsHowToOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [jiaoAuraIntensity, setJiaoAuraIntensity] = useState<number>(() => {
    try { return Number(localStorage.getItem('jiaoge_aura_intensity') || '100'); } catch { return 100; }
  });
  const [timeAttackMode, setTimeAttackMode] = useState<boolean>(() => {
    try { return localStorage.getItem('jiaoge_time_attack') === 'true'; } catch { return false; }
  });
  const [naoMaLeEnabled, setNaoMaLeEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('jiaoge_nao_ma_le') === 'true'; } catch { return false; }
  });

  const handleToggleTimeAttack = useCallback((val: boolean) => {
    try {
      localStorage.setItem('jiaoge_time_attack', String(val));
    } catch {}
    setTimeAttackMode(val);
  }, []);

  const handleToggleNaoMaLe = useCallback((val: boolean) => {
    try {
      localStorage.setItem('jiaoge_nao_ma_le', String(val));
    } catch {}
    setNaoMaLeEnabled(val);
  }, []);

  const [testBurstAmt, setTestBurstAmt] = useState<number>(0);
  const testBurstIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerNaoMaLeTestBurst = useCallback(() => {
    if (testBurstIntervalRef.current) {
      clearInterval(testBurstIntervalRef.current);
    }
    playSound.glitch(soundEnabled);
    let currentAmt = 15;
    setTestBurstAmt(currentAmt);
    testBurstIntervalRef.current = setInterval(() => {
      currentAmt -= 1;
      if (currentAmt <= 0) {
        setTestBurstAmt(0);
        if (testBurstIntervalRef.current) {
          clearInterval(testBurstIntervalRef.current);
          testBurstIntervalRef.current = null;
        }
      } else {
        setTestBurstAmt(currentAmt);
      }
    }, 180);
  }, [soundEnabled]);

  useEffect(() => {
    return () => {
      if (testBurstIntervalRef.current) {
        clearInterval(testBurstIntervalRef.current);
      }
    };
  }, []);

  const [decayJitterAmt, setDecayJitterAmt] = useState<number>(0);
  const rawJitterAmt = (status === 'playing' || status === 'paused') ? Math.floor(time / 10) : 0;
  const targetJitter = Math.max(rawJitterAmt, testBurstAmt);

  useEffect(() => {
    if (targetJitter > decayJitterAmt) {
      setDecayJitterAmt(targetJitter);
    } else if (targetJitter < decayJitterAmt) {
      const interval = setInterval(() => {
        setDecayJitterAmt((prev) => {
          if (prev <= targetJitter + 0.15) {
            clearInterval(interval);
            return targetJitter;
          }
          const step = Math.max(0.12, (prev - targetJitter) * 0.08);
          return Number((prev - step).toFixed(2));
        });
      }, 40);
      return () => clearInterval(interval);
    }
  }, [targetJitter, decayJitterAmt]);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Avatar state
  const [jiaoAvatar, setJiaoAvatar] = useState<string>(() => {
    try {
      return localStorage.getItem('google_minesweeper_jiao_avatar') || '👴';
    } catch {
      return '👴';
    }
  });

  const handleAvatarSelect = (avatar: string) => {
    setJiaoAvatar(avatar);
    try {
      localStorage.setItem('google_minesweeper_jiao_avatar', avatar);
    } catch(e) {}
  };

  const [lastPendingWin, setLastPendingWin] = useState<{
    time: number;
    difficulty: DifficultyType;
    mines: number;
    streak: number;
  } | null>(null);

  // Jiao Ge Emergency QTE States
  const [isQTEOpen, setIsQTEOpen] = useState<boolean>(false);
  const [qteCell, setQteCell] = useState<{ r: number; c: number } | null>(null);
  const [hasUsedQTEThisGame, setHasUsedQTEThisGame] = useState<boolean>(false);

  // Statistics persisted via LocalStorage
  const [stats, setStats] = useState<GameStats>(initialStatsState);

  // Unique particle generator ID
  const nextParticleId = useRef<number>(1);

  // Master Jiao Ge's multi-particle physical simulator state
  interface JiaoParticle {
    id: number;
    text: string;
    left: number;
    size: number;
    duration: number;
    drift: number;
    color?: string;
    shadow?: string;
  }
  const [jiaoParticles, setJiaoParticles] = useState<JiaoParticle[]>([]);

  // Spectacular Victory Firework Blast Particle definition
  interface VictoryFireworkParticle {
    id: number;
    text: string;
    size: number;
    color: string;
    dx: number;
    dy: number;
    duration: number;
    delay: number;
    scaleDst: number;
    centerX: number;
    centerY: number;
  }
  const [victoryFireworks, setVictoryFireworks] = useState<VictoryFireworkParticle[]>([]);

  const spawnBurst = useCallback((centerX: number, centerY: number, delayOffset: number = 0) => {
    const count = 28; // Spectacular dense bursts around the center point
    const emojis = ['👴', '🏆', '👑', '🎓', '✨', '🎉', '📜', '🎹', '⚡', '🛡️', '🍭', '🌟', '🔔', '🥳', '🔥'];
    const colors = [
      'rgba(255, 0, 85, 0.95)',    // Cyberpunk Magenta
      'rgba(0, 240, 255, 0.95)',   // Neon Cyan
      'rgba(57, 255, 20, 0.95)',    // Neon Lime Green
      'rgba(255, 234, 0, 0.95)',   // Gold/Yellow
      'rgba(157, 78, 221, 0.95)',   // Purple
      'rgba(255, 107, 0, 0.95)',    // Pulse Orange
    ];

    const newParticles: VictoryFireworkParticle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.3 - 0.15);
      const baseDist = window.innerWidth > 640 ? 300 : 160;
      const distance = (Math.random() * 0.6 + 0.5) * baseDist;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      newParticles.push({
        id: nextParticleId.current++,
        text: emojis[Math.floor(Math.random() * emojis.length)],
        size: Math.floor(Math.random() * 18) + 18, // 18px to 36px
        color: colors[Math.floor(Math.random() * colors.length)],
        dx,
        dy,
        duration: Math.random() * 0.4 + 1.2, // 1.2s - 1.6s
        delay: delayOffset,
        scaleDst: Math.random() * 0.6 + 0.8,
        centerX,
        centerY,
      });
    }

    setVictoryFireworks((prev) => [...prev, ...newParticles]);
  }, []);

  const triggerVictoryFireworks = useCallback(() => {
    // Play rhythmic vibration pulses synchronized with the spectacular explosive visual flashes
    vibrateVictoryTheme();

    // Burst 1: Center of board
    spawnBurst(50, 50, 0);

    // Burst 2: Left center, slightly higher
    setTimeout(() => {
      spawnBurst(30, 42, 0);
    }, 200);

    // Burst 3: Right center, slightly higher
    setTimeout(() => {
      spawnBurst(70, 45, 0);
    }, 420);

    // Burst 4: Center top side, spectacular double colorful blast
    setTimeout(() => {
      spawnBurst(50, 28, 0);
    }, 680);

    // Burst 5: Extra flash bottom-left & bottom-right
    setTimeout(() => {
      spawnBurst(22, 60, 0);
      spawnBurst(78, 60, 0);
    }, 950);

    // Full stable hardware-accelerated cleanup after complete animation
    setTimeout(() => {
      setVictoryFireworks([]);
    }, 4500);
  }, [spawnBurst]);

  const spawnJiaoParticles = useCallback((emojiOptions = ['👴', '👑', '🎹', '✨', '⚡', '🎓', '🛒']) => {
    const newParticles: JiaoParticle[] = [];
    const count = 8; // Reduced count for maximum fluid performance
    const spawnedIds = new Set<number>();
    
    // Streaked styling configurations
    const getStreakColor = (streakCat: number) => {
      if (streakCat <= 0) return undefined;
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
    const streakStyle = getStreakColor(jiaoStreak);
    
    for (let i = 0; i < count; i++) {
      const pid = nextParticleId.current++;
      spawnedIds.add(pid);
      newParticles.push({
        id: pid,
        text: emojiOptions[Math.floor(Math.random() * emojiOptions.length)],
        left: Math.random() * 90 + 5, // Percent from left boundary
        size: Math.floor(Math.random() * 16) + 16, // Snappier sizes: 16px to 32px
        duration: Math.random() * 0.8 + 1.2, // Snappier duration: 1.2s to 2.0s
        drift: Math.random() * 12 - 6, // Fixed stable drift value at birth
        color: streakStyle?.color,
        shadow: streakStyle?.shadow,
      });
    }
    setJiaoParticles((p) => [...p, ...newParticles]);
    
    // Auto cleanup sequence after completion (faster sweep)
    setTimeout(() => {
      setJiaoParticles((p) => p.filter((x) => !spawnedIds.has(x.id)));
    }, 2200);
  }, [jiaoStreak]);

  const [comboToasts, setComboToasts] = useState<{ id: number; tokens: number; clearCount: number; r: number; c: number; multiplier: number }[]>([]);
  const [lastComboInfo, setLastComboInfo] = useState<{ multiplier: number; clearCount: number; timestamp: number } | null>(null);
  const nextToastId = useRef(0);

  const processCombos = useCallback((initialBoard: Cell[][], finalBoard: Cell[][], centerR: number, centerC: number) => {
    try {
      if (!initialBoard || !finalBoard || initialBoard.length === 0 || finalBoard.length === 0) return;
      if (!initialBoard[0] || !finalBoard[0] || initialBoard.length !== finalBoard.length || initialBoard[0].length !== finalBoard[0].length) return;

      let oldRevealed = 0;
      let newRevealed = 0;
      for (let r = 0; r < initialBoard.length; r++) {
         for (let c = 0; c < initialBoard[r].length; c++) {
            if (initialBoard[r][c]?.isRevealed) oldRevealed++;
            if (finalBoard[r][c]?.isRevealed) newRevealed++;
         }
      }
      const cleared = newRevealed - oldRevealed;
      if (cleared > 1) { // Combo!
         let multiplier = 1;
         if (cleared >= 30) multiplier = 10;
         else if (cleared >= 20) multiplier = 5;
         else if (cleared >= 10) multiplier = 3;
         else if (cleared >= 5) multiplier = 2;

         const earnedTokens = cleared * multiplier;
         
         setJiaoTokens(prev => {
           const nx = prev + earnedTokens;
           try { localStorage.setItem('jiaoge_tokens', String(nx)); window.dispatchEvent(new Event('jiaoge_tokens_updated')); } catch {}
           return nx;
         });

         if (multiplier > 1) {
           playSound.comboMultiplier(soundEnabled, multiplier);
         }

         const id = nextToastId.current++;
         setComboToasts(prev => [...prev, { id, tokens: earnedTokens, clearCount: cleared, r: centerR, c: centerC, multiplier }]);
         if (multiplier > 1) {
           setLastComboInfo({ multiplier, clearCount: cleared, timestamp: Date.now() });
         }
         setTimeout(() => {
            setComboToasts(prev => prev.filter(t => t.id !== id));
         }, 2000);
         
         spawnJiaoParticles(['🔥', '⭐', '⚡']);
         if (earnedTokens >= 15) {
           playSound.cascade(soundEnabled, 15);
         }
      }
    } catch (error) {
      console.error("Error processed in processCombos callback loop safely: ", error);
    }
  }, [soundEnabled, spawnJiaoParticles, setJiaoTokens]);

  // Theme selection: classic vs cyberpunk (defaults to cyberpunk)
  const [theme, setTheme] = useState<'classic' | 'cyberpunk'>(() => {
    try {
      const stored = localStorage.getItem('google_minesweeper_theme');
      if (stored === 'classic' || stored === 'cyberpunk') {
        return stored;
      }
    } catch (e) {}
    return 'cyberpunk';
  });

  const [season, setSeason] = useState<Season>(getCurrentSeason());

  useEffect(() => {
    try {
      localStorage.setItem('google_minesweeper_master_volume', masterVolume.toString());
    } catch (e) {}
    setMasterVolume(masterVolume);
  }, [masterVolume]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeason(getCurrentSeason());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'classic' ? 'cyberpunk' : 'classic';
      try {
        localStorage.setItem('google_minesweeper_theme', next);
      } catch (e) {}
      return next;
    });
  };

  // Use refs to keep track of current states in timer subscription closure
  const statusRef = useRef<GameStatus>(status);
  statusRef.current = status;
  const timeRef = useRef<number>(time);
  timeRef.current = time;

  // Load stats on mounting with backward compatibility backup
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setStats({
          ...initialStatsState,
          ...parsed,
        });
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
    try {
      // If they were actively playing, reset the streak to prevent streak-saving cheating
      if (statusRef.current === 'playing') {
        setJiaoStreak(0);
        try {
          localStorage.setItem('google_minesweeper_jiao_streak', '0');
        } catch (e) {}
      }

      const config = DIFFICULTIES[diffSetting] || DIFFICULTIES['easy'];
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
      setTime(timeAttackMode ? 60 : 0);
      setJiaoHelpsRemaining(3);
      setJiaoHelpCooldown(null);
      setHasUsedQTEThisGame(false);
      setQteCell(null);
      setIsQTEOpen(false);
      setJiaoMessageOverride('');
    } catch (error) {
      console.error("Critical board initialization failure, falling back to Easy:", error);
      try {
        const config = DIFFICULTIES['easy'];
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
      } catch (innerError) {
        console.error("Fatal initialization failure:", innerError);
      }
    }
  }, [difficulty, setJiaoStreak, timeAttackMode]);

  const handleRestart = useCallback(() => {
    initializeBoard();
    playSound.quantumTides(soundEnabled);
    spawnJiaoParticles(['👴', '✨', '⚡', '👑']);
    const welcomeQuotes = {
      'en': "Restarted // Capacitors fully safe. Tap any cell to unearth!",
      'zh-TW': "棋盤已重置 // 防爆電容器冷卻完畢。點擊任意非雷格點開始微操！",
      'zh-CN': "棋盘已重置 // 防爆电容器冷却完毕。点击任意非雷格点开始微操！"
    };
    setJiaoMessageOverride(welcomeQuotes[lang] || welcomeQuotes['en']);
  }, [initializeBoard, soundEnabled, lang, spawnJiaoParticles]);

  const handlePauseToggle = useCallback(() => {
    setStatus((prev) => {
      if (prev === 'playing') {
        playSound.glitch(soundEnabled);
        return 'paused';
      }
      if (prev === 'paused') {
        playSound.click(soundEnabled);
        return 'playing';
      }
      return prev;
    });
  }, [soundEnabled]);

  // Global spacebar listener for quick restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }
      // Or if a modal is potentially open (though some modals might just swallow it, better to be safe)
      if (e.code === 'Space') {
        e.preventDefault(); // prevent page scroll
        handleRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRestart]);

  const handleShuffle = useCallback(() => {
    try {
      const config = DIFFICULTIES[difficulty] || DIFFICULTIES['easy'];
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
      setTime(timeAttackMode ? 60 : 0);
      setJiaoHelpsRemaining(3);
      setJiaoHelpCooldown(null);
      setHasUsedQTEThisGame(false);
      setQteCell(null);
      setIsQTEOpen(false);
      
      const shuffleQuotes = {
        'en': "Board Shuffled! 🎋 Your win streak and progress history remain fully safe and protected.",
        'zh-TW': "棋盤已洗牌！🎋 您的連勝紀錄與生涯進度已被安全保護，未受影響！",
        'zh-CN': "棋盘已洗牌！🎋 您的连胜纪录与生涯进度已被安全保护，未受影响！"
      };
      setJiaoMessageOverride(shuffleQuotes[lang] || shuffleQuotes['en']);
      
      playSound.quantumTides(soundEnabled);
      spawnJiaoParticles(['🎋', '🍃', '👴', '⚡']);
    } catch (e) {
      console.error("Error shuffling board:", e);
    }
  }, [difficulty, lang, soundEnabled, spawnJiaoParticles, timeAttackMode]);

  // Run board initialization on mounting or when difficulty or timeAttackMode changes
  useEffect(() => {
    initializeBoard(difficulty);
  }, [difficulty, initializeBoard, timeAttackMode]);

  // Active playing Stopwatch Timer
  useEffect(() => {
    let timerId: any = null;
    if (status === 'playing') {
      timerId = setInterval(() => {
        setTime((prev) => {
          if (timeAttackMode) {
            return Math.max(0, prev - 1);
          } else {
            if (prev >= 999) {
              clearInterval(timerId); // Cap at digital standard 999
              return 999;
            }
            return prev + 1;
          }
        });

        // Cooldown ticks for Jiao Help
        setJiaoHelpCooldown((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            setJiaoHelpsRemaining((c) => Math.min(3, c + 1));
            return 30; // reset cooldown for next charge if < 3
          }
          return prev - 1;
        });

      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [status, timeAttackMode]);

  // Check if we reached full charges and clear cooldown
  useEffect(() => {
    if (jiaoHelpsRemaining >= 3) {
      setJiaoHelpCooldown(null);
    } else if (jiaoHelpsRemaining < 3 && jiaoHelpCooldown === null) {
      setJiaoHelpCooldown(30);
    }
  }, [jiaoHelpsRemaining, jiaoHelpCooldown]);

  // Synchronized heartbeat audio pulse
  useEffect(() => {
    let timeoutId: any = null;

    const playHeartbeatLoop = () => {
      if (statusRef.current !== 'playing' || !soundEnabled) return;
      
      playSound.heartbeat(true);
      const currentCSSDuration = Math.max(0.4, 2 - (timeRef.current / 60));
      timeoutId = setTimeout(playHeartbeatLoop, currentCSSDuration * 1000);
    };

    if (status === 'playing' && soundEnabled) {
      playHeartbeatLoop();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [status, soundEnabled]);

  // Seed mine spots: Ensures safety field layout by guaranteeing a mine-free 3x3 region around the clicked cell!
  const generateMinesAndNeighbors = (firstR: number, firstC: number, currentBoard: Cell[][]) => {
    try {
      const config = DIFFICULTIES[difficulty] || DIFFICULTIES['easy'];
      const totalSlots = config.rows * config.cols;
      const minePositions = new Set<string>();

      // Target total mines count
      let minesToPlace = activeMinesCount;

      // Check boundary safe zones (the 3x3 surrounding cells can't have mines)
      const isSafeZone = (r: number, c: number) => {
        return Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1;
      };

      // Safeguard against infinite loop. Count actual safe zone cells that are on the grid.
      let safeZoneCellsCount = 0;
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (isSafeZone(r, c)) safeZoneCellsCount++;
        }
      }

      const maxMinesAllowed = Math.max(1, totalSlots - safeZoneCellsCount - 1);
      if (minesToPlace > maxMinesAllowed) {
        minesToPlace = maxMinesAllowed;
      }

      // Loop safety watch-dog
      let iterations = 0;
      while (minePositions.size < minesToPlace && iterations < 15000) {
        iterations++;
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
          if (!workingBoard[r] || !workingBoard[r][c] || workingBoard[r][c].isMine) continue;

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
                workingBoard[nr] &&
                workingBoard[nr][nc] &&
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
    } catch (error) {
      console.error("Error in generateMinesAndNeighbors:", error);
      return currentBoard;
    }
  };

  // Check victory condition
  const checkVictory = (currentBoard: Cell[][]) => {
    const config = DIFFICULTIES[difficulty];
    let revealedNonMines = 0;
    const totalNonMines = config.rows * config.cols - activeMinesCount;

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
      playSound.win(soundEnabled && gameEndingSoundsEnabled);
      
      setShowcaseActive(true);
      setTimeout(() => setShowcaseActive(false), 4500); // Temporary showcase duration
      
      const newStreak = jiaoStreak + 1;
      setJiaoStreak(newStreak);
      if (newStreak > bestJiaoStreak) {
        setBestJiaoStreak(newStreak);
        try {
          localStorage.setItem('google_minesweeper_best_jiao_streak', newStreak.toString());
        } catch (e) {}
      }
      
      if (newStreak > 0 && newStreak % 5 === 0) {
        setJiaoBadges(prev => {
          const next = prev + 1;
          try {
            localStorage.setItem('google_minesweeper_jiao_badges', next.toString());
          } catch (e) {}
          return next;
        });
      }
      
      // Save stats to lastPendingWin to allow submission to public Leaderboard
      setLastPendingWin({
        time,
        difficulty,
        mines: activeMinesCount,
        streak: newStreak
      });

      try {
        localStorage.setItem('google_minesweeper_jiao_streak', newStreak.toString());
      } catch (e) {}

      // Adaptive specialized Diagnostic Terminal Message on short clear times / higher streaks
      let adaptiveMsg = "";
      if (challengeMode) {
        if (time < 30) {
          adaptiveMsg = lang === 'en'
            ? `⚡ SPEEDRUN! Cleared in ${time}s! Level ${newStreak} Jiao Challenge Mode activated. Dynamic Mines density increased!`
            : lang === 'zh-TW'
            ? `⚡ 光速平定！僅 ${time} 秒神級破關！已解鎖第 ${newStreak} 級椒哥微操挑戰，下次高能雷數量提升！`
            : `⚡ 光速平定！仅 ${time} 秒神级破关！已解锁第 ${newStreak} 级椒哥微操挑战，下次高能雷数量提升！`;
        } else {
          adaptiveMsg = lang === 'en'
            ? `🔥 Active Streak is now ${newStreak}! Next board will have heavier mine security.`
            : lang === 'zh-TW'
            ? `🔥 目前極智連勝：${newStreak} 次！下局雷格紅線安全荷載將繼續縮窄。`
            : `🔥 目前极智连胜：${newStreak} 次！下局雷格红线安全荷载将继续缩窄。`;
        }
      }
      setJiaoMessageOverride(adaptiveMsg);

      let streakEmojis = ['👴', '🏆', '👑', '🎓', '✨', '🎉', '📜'];
      if (newStreak >= 3) {
        streakEmojis = ['🔥', '👑', '⚡', '🏆', '🎉', '✨', '🤩', '👴'];
      }
      spawnJiaoParticles(streakEmojis);
      triggerVictoryFireworks();
      unlockJiaoAchievement('degree_unlocked');

      // Experimental Text-to-Speech milestone triggers
      let speechPhrase = "";
      if (difficulty === 'expert') {
        speechPhrase = getJiaoCatchphrase('expert_clear', lang);
      } else if (newStreak === 10) {
        speechPhrase = getJiaoCatchphrase('streak_10', lang);
      } else if (newStreak === 5) {
        speechPhrase = getJiaoCatchphrase('streak_5', lang);
      } else {
        speechPhrase = getJiaoCatchphrase('victory', lang);
      }
      playJiaoSpeech(speechPhrase, lang, soundEnabled);

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
    playSound.explosion(soundEnabled && gameEndingSoundsEnabled);
    spawnJiaoParticles(['😰', '💀', '💥', '⚠️', '❌']);
 
    // Reset streak!
    setJiaoStreak(0);
    try {
      localStorage.setItem('google_minesweeper_jiao_streak', '0');
    } catch (e) {}

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

  // Time Attack defeat trigger
  useEffect(() => {
    if (timeAttackMode && status === 'playing' && time <= 0) {
      executeDefeat(0, 0, board);
      const outOfTimeQuotes = {
        'en': "Time's up! ⏱️ The tactical reactor overloaded before you could clear all threat coordinates.",
        'zh-TW': "時間到！⏱️ 在您清除所有雷格座標之前，防爆電容器已被超載瓦解！",
        'zh-CN': "时间到！⏱️ 在您清除所有雷格坐标之前，防爆电容器已被超载瓦解！"
      };
      setJiaoMessageOverride(outOfTimeQuotes[lang] || outOfTimeQuotes['en']);
    }
  }, [time, status, timeAttackMode, board, lang]);

  // Nao Ma Le Glitch Sound Trigger
  const jitterLevel = Math.floor(time / 10);
  useEffect(() => {
    if (!naoMaLeEnabled || status !== 'playing' || jitterLevel <= 0) {
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;

    const playGlitchAndSchedule = () => {
      playSound.glitch(soundEnabled);
      const delay = Math.floor(Math.random() * (300 - 50 + 1)) + 50;
      timeoutId = setTimeout(playGlitchAndSchedule, delay);
    };

    // Schedule subsequent organic triggers
    const initialDelay = Math.floor(Math.random() * (300 - 50 + 1)) + 50;
    timeoutId = setTimeout(playGlitchAndSchedule, initialDelay);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [jitterLevel, naoMaLeEnabled, status, soundEnabled]);

  // Safe Cascade Queue-based Reveal Algorithm
  const revealEmptyChain = (startR: number, startC: number, currentBoard: Cell[][]) => {
    try {
      const config = DIFFICULTIES[difficulty] || DIFFICULTIES['easy'];
      const workingBoard = currentBoard.map((row) => [...row]);
      const queue: [number, number][] = [[startR, startC]];
      const visited = new Set<string>([`${startR},${startC}`]);

      let cascadeCount = 0;

      while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        if (!workingBoard[r] || !workingBoard[r][c]) continue;
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
                workingBoard[nr] &&
                workingBoard[nr][nc] &&
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
    } catch (error) {
      console.error("Error in revealEmptyChain cascading:", error);
      return currentBoard;
    }
  };

  const handleQTESuccess = () => {
    if (!qteCell) return;
    const { r, c } = qteCell;
    const workingBoard = board.map((row) =>
      row.map((cell) => {
        if (cell.r === r && cell.c === c) {
          return { ...cell, isFlagged: true };
        }
        return cell;
      })
    );
    setBoard(workingBoard);
    setFlagsCount((prev) => prev + 1);
    setIsQTEOpen(false);
    setQteCell(null);
    playSound.antiExplosion(soundEnabled);
    spawnJiaoParticles(['🛡️', '✨', '👑', '⚡']);
    unlockJiaoAchievement('qte_defuse');

    const successQuotes = {
      'en': "⚡ SHIELD ACTIVATE! Mine successfully decoupled & flagged as JIAO!",
      'zh-TW': "⚡ 防爆自主癒成功！和弦大師微操避震，雷格點已安全標記為 椒！ ⚡",
      'zh-CN': "⚡ 防爆自主愈成功！和弦大师微操避震，雷格点已安全标记为 椒！ ⚡"
    };
    setJiaoMessageOverride(successQuotes[lang] || successQuotes['en']);
  };

  const handleQTEFailure = () => {
    if (!qteCell) return;
    const { r, c } = qteCell;
    setIsQTEOpen(false);
    setQteCell(null);

    const workingBoard = board.map((row) =>
      row.map((cell) => {
        if (cell.r === r && cell.c === c) {
          return { ...cell, isRevealed: true };
        }
        return cell;
      })
    );
    setBoard(workingBoard);
    executeDefeat(r, c, workingBoard);

    const failQuotes = {
      'en': "💥 Capacitor exploded! Critical touch latency overload. Numbness active!",
      'zh-TW': "💥 防爆電容器超載熔斷！微操和弦失敗，全麻警報響起！ 💥",
      'zh-CN': "💥 防爆电容器超载熔断！微操和弦失败，全麻警报响起！ 💥"
    };
    setJiaoMessageOverride(failQuotes[lang] || failQuotes['en']);
  };

  // Left click / Tap Unearth Command Handler
  const handleRevealCell = (r: number, c: number) => {
    try {
      // Prevent out-of-bound reference crashes
      if (!board || !board[r] || !board[r][c]) return;

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
      if (workingBoard[r] && workingBoard[r][c] && workingBoard[r][c].isMine) {
        if (!hasUsedQTEThisGame) {
          setQteCell({ r, c });
          setIsQTEOpen(true);
          setHasUsedQTEThisGame(true);
          return;
        }
        workingBoard[r][c].isRevealed = true;
        setBoard(workingBoard);
        executeDefeat(r, c, workingBoard);
        return;
      }

      // 3. Normal Reveal
      playSound.click(soundEnabled);
      vibrateCellReveal();
      let finalRevealedBoard: Cell[][];

      if (workingBoard[r] && workingBoard[r][c] && workingBoard[r][c].neighborMines === 0) {
        finalRevealedBoard = revealEmptyChain(r, c, workingBoard);
      } else {
        if (workingBoard[r] && workingBoard[r][c]) {
          workingBoard[r][c].isRevealed = true;
        }
        finalRevealedBoard = workingBoard;
      }

      setBoard(finalRevealedBoard);
      processCombos(board, finalRevealedBoard, r, c);
      checkVictory(finalRevealedBoard);
    } catch (e) {
      console.error("Error unearthing cell:", e);
    }
  };

  // Toggle Red Flag on a cell
  const handleFlagCell = (r: number, c: number) => {
    try {
      if (!board || !board[r] || !board[r][c]) return;
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
    } catch (e) {
      console.error("Error flagging cell safely:", e);
    }
  };

  // Chord Quick-Sweeper (Pro Double click / Left+Right click solver)
  const handleChordSweep = (r: number, c: number) => {
    try {
      if (!board || !board[r] || !board[r][c]) return;
      const config = DIFFICULTIES[difficulty] || DIFFICULTIES['easy'];
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
            if (board[nr] && board[nr][nc] && board[nr][nc].isFlagged) {
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
          if (!workingBoard[nr] || !workingBoard[nr][nc]) continue;
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
          if (!hasUsedQTEThisGame) {
            setQteCell({ r: explodedR, c: explodedC });
            setIsQTEOpen(true);
            setHasUsedQTEThisGame(true);
            return;
          }
          setBoard(workingBoard);
          executeDefeat(explodedR, explodedC, workingBoard);
        } else {
          playSound.click(soundEnabled);
          vibrateCellReveal();
          setBoard(workingBoard);
          processCombos(board, workingBoard, r, c);
          checkVictory(workingBoard);
        }
      }
    } catch (e) {
      console.error("Error executing chord sweep safely:", e);
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
      if (e.key === 'm' || e.key === 'M') {
        setSoundEnabled((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsStatsOpen(false);
        setIsHowToOpen(false);
      }

      // Pro Cheat Key Sequencer
      const k = e.key.toLowerCase();
      if (/^[a-z]$/.test(k)) {
        typedBufferRef.current = (typedBufferRef.current + k).slice(-12);
        if (typedBufferRef.current.endsWith('jiaoge')) {
          triggerJiaoCelestialRadar();
          spawnJiaoParticles(['👴', '👑', '✨', '⚡', '🎹', '🛡️']);
          unlockJiaoAchievement('cheat_radar');
          typedBufferRef.current = '';
        } else if (typedBufferRef.current.endsWith('yuan') || typedBufferRef.current.endsWith('shijie')) {
          playSound.jiaoBass(soundEnabled);
          spawnJiaoParticles(['😰', '💀', '💥', '⚠️', '❌']);
          let warnMsg = '';
          if (lang === 'en') {
            warnMsg = "【WARNING】You typed the forbidden word 'yuan' or 'shijie'! High-energy particles are destabilized. Chime a Jiao-chord to pacify!";
          } else if (lang === 'zh-TW') {
            warnMsg = "【學術警告】你輸入了極危險的違禁詞「yuan」或「shijie」！雷區中的袁能粒子能級暴漲，請迅速在椒哥診斷台呼喚“椒哥助我”或大唱五階和弦消災！";
          } else {
            warnMsg = "【学术警告】你输入了极危险的违禁词「yuan」或「shijie」！雷区中的袁能粒子能级暴涨，请迅速在椒哥诊断台呼唤“椒哥打救”或大唱五阶和弦消灾！";
          }
          setJiaoMessageOverride(warnMsg);
          typedBufferRef.current = '';
        } else if (typedBufferRef.current.endsWith('naomale')) {
          playSound.jiaoBass(soundEnabled);
          spawnJiaoParticles(['😰', '💀', '💥', '⁉️']);
          unlockJiaoAchievement('cheat_naomale');
          let warnMsg = '';
          if (lang === 'en') {
            warnMsg = "【ALERT】'Nao Ma Le' mode initialized! Absolute full-body numbness locked in. Avoid stepping on Yuan particles!";
          } else if (lang === 'zh-TW') {
            warnMsg = "【紅色警戒】「鬧麻了」連銷效應解鎖！手指產生嚴重的「袁式全麻」狀態，大意挖土將直接引发雷區共振！";
          } else {
            warnMsg = "【红色警戒】「闹麻了」连锁效应解锁！手指产生严重的「袁式全麻」状态，大意挖土将直接引发雷区共振！";
          }
          setJiaoMessageOverride(warnMsg);
          typedBufferRef.current = '';
        } else if (typedBufferRef.current.endsWith('xuewei') || typedBufferRef.current.endsWith('biye')) {
          playSound.hologramRise(soundEnabled);
          spawnJiaoParticles(['🎓', '👑', '📜', '🎉', '🌟']);
          unlockJiaoAchievement('degree_unlocked');
          let msg = '';
          if (lang === 'en') {
            msg = "【GRADUATION】Audit approved! Master Jiao has stamped your degree certificate. PDF is safe on cloud storage!";
          } else if (lang === 'zh-TW') {
            msg = "【華宇學位授予】考核通過！極智學士學位大印已蓋上，PDF文件雲端保存，永不延修！🎉";
          } else {
            msg = "【华宇学位授予】考核通过！极智学士学位大印已盖上，PDF文件云端保存，永不延修！🎉";
          }
          setJiaoMessageOverride(msg);
          typedBufferRef.current = '';
        } else if (typedBufferRef.current.endsWith('chaoyang') || typedBufferRef.current.endsWith('cart')) {
          playSound.cyberChyme(soundEnabled);
          spawnJiaoParticles(['🛒', '📦', '🏃', '💨']);
          unlockJiaoAchievement('cheat_cart');
          let msg = '';
          if (lang === 'en') {
            msg = "【CHAOYANG CARGO】The master cargo pushcart is fully prepped and on its way! Watch your steps.";
          } else if (lang === 'zh-TW') {
            msg = "【朝陽獨輪車】極智手推車物資已調配就緒，椒哥開著推車急速駛向你的雷域！";
          } else {
            msg = "【朝阳独轮车】极智推车物资已调配就绪，椒哥开着推车急速驶向你的雷域！";
          }
          setJiaoMessageOverride(msg);
          typedBufferRef.current = '';
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => {
      window.removeEventListener('keydown', handleGlobalShortcuts);
    };
  }, [initializeBoard, board, difficulty, flagsCount, soundEnabled, lang, status]);

  // Score reset helper
  const handleClearStats = () => {
    saveStats(initialStatsState);
    setJiaoStreak(0);
    setBestJiaoStreak(0);
    setJiaoBadges(0);
    try {
      localStorage.setItem('google_minesweeper_jiao_streak', '0');
      localStorage.setItem('google_minesweeper_best_jiao_streak', '0');
      localStorage.setItem('google_minesweeper_jiao_badges', '0');
    } catch(e) {}
  };

  // Master Jiao Ge's AI solver & safe block unearthing helper
  const handleJiaoHelp = () => {
    if (status !== 'playing' && status !== 'idle') return;
    if (jiaoHelpsRemaining <= 0) {
      setJiaoMessageOverride(t.jiaoHelpUsed);
      return;
    }

    const config = DIFFICULTIES[difficulty];

    // If starting on a fresh board, let Jiao Ge choose the initial block
    if (status === 'idle') {
      const midR = Math.floor(config.rows / 2);
      const midC = Math.floor(config.cols / 2);
      handleRevealCell(midR, midC);
      setJiaoHelpsRemaining((prev) => prev - 1);
      if (jiaoHelpCooldown === null) setJiaoHelpCooldown(30);
      spawnJiaoParticles(['👴', '🛡️', '⚡', '✨', '👑']);
      setJiaoMessageOverride(
        lang === 'en'
          ? "Master Jiao Ge initialized a 100% blast-shield opening in the center grid!"
          : lang === 'zh-TW'
          ? "極智大師椒哥已在棋盤正中心為你初始化了一個100%抗爆的安全開區！"
          : "极智大师椒哥已在棋盘正中心为你初始化了一个100%抗爆的安全开区！"
      );
      return;
    }

    let targetR = -1;
    let targetC = -1;
    let foundMathematicalSafe = false;

    // 1. Try to find a mathematically safe unrevealed grid based on current numbers (professional solver style!)
    for (let r = 0; r < config.rows; r++) {
      if (foundMathematicalSafe) break;
      for (let c = 0; c < config.cols; c++) {
        const cell = board[r][c];
        if (cell.isRevealed && cell.neighborMines > 0) {
          // Count flags and unrevealed neighbors
          let adjacentFlags = 0;
          const unrevealedNonFlaggedNeighbors: [number, number][] = [];

          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
                if (dr === 0 && dc === 0) continue;
                const neighbor = board[nr][nc];
                if (neighbor.isFlagged) {
                  adjacentFlags++;
                } else if (!neighbor.isRevealed) {
                  unrevealedNonFlaggedNeighbors.push([nr, nc]);
                }
              }
            }
          }

          if (adjacentFlags === cell.neighborMines && unrevealedNonFlaggedNeighbors.length > 0) {
            // Found mathematically safe neighbor!
            const [sr, sc] = unrevealedNonFlaggedNeighbors[0];
            targetR = sr;
            targetC = sc;
            foundMathematicalSafe = true;
            break;
          }
        }
      }
    }

    // 2. If no first-order mathematical safe blocks are visible, look under the hood (cheat-reveal any secure non-mine cell!)
    if (!foundMathematicalSafe) {
      const allUnhiddenSafeCells: [number, number][] = [];
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          const cell = board[r][c];
          if (!cell.isRevealed && !cell.isMine && !cell.isFlagged) {
            allUnhiddenSafeCells.push([r, c]);
          }
        }
      }

      if (allUnhiddenSafeCells.length > 0) {
        // Pick a random available safe cell
        const randomIndex = Math.floor(Math.random() * allUnhiddenSafeCells.length);
        [targetR, targetC] = allUnhiddenSafeCells[randomIndex];
      }
    }

    // 3. Process unearthing if cell is found
    if (targetR !== -1 && targetC !== -1) {
      playSound.easterEgg(soundEnabled);
      spawnJiaoParticles(['👴', '🛰️', '✨', '⚡', '🎹']);
      let workingBoard = board.map((row) => [...row]);
      let finalRevealedBoard: Cell[][];

      if (workingBoard[targetR][targetC].neighborMines === 0) {
        finalRevealedBoard = revealEmptyChain(targetR, targetC, workingBoard);
      } else {
        workingBoard[targetR][targetC].isRevealed = true;
        finalRevealedBoard = workingBoard;
      }

      setBoard(finalRevealedBoard);
      processCombos(board, finalRevealedBoard, targetR, targetC);
      setJiaoHelpsRemaining((prev) => prev - 1);
      if (jiaoHelpCooldown === null) setJiaoHelpCooldown(30);
      checkVictory(finalRevealedBoard);

      // Custom funny message based on language
      let customMsg = '';
      if (lang === 'en') {
        customMsg = `Jiao Ge executed dynamic arpeggio tides: safely unearthed Row ${targetR + 1}, Col ${targetC + 1}!`;
      } else if (lang === 'zh-TW') {
        customMsg = `椒哥催動五階和弦量子潮汐：成功為你淨化並開掘了第 ${targetR + 1} 行、第 ${targetC + 1} 列的絕對安全格子！`;
      } else {
        customMsg = `椒哥催动五阶和弦量子潮汐：成功为你净化并开掘了第 ${targetR + 1} 行、第 ${targetC + 1} 列的绝对安全格子！`;
      }
      setJiaoMessageOverride(customMsg);
    } else {
      setJiaoMessageOverride(t.jiaoHelpNoTarget);
    }
  };

  // Master Jiao Ge's Celestial Search Radar Cheat Activation
  const triggerJiaoCelestialRadar = () => {
    if (status !== 'playing' && status !== 'idle') return;

    const config = DIFFICULTIES[difficulty];
    const unflaggedMines: [number, number][] = [];

    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        const cell = board[r][c];
        if (cell.isMine && !cell.isFlagged && !cell.isRevealed) {
          unflaggedMines.push([r, c]);
        }
      }
    }

    if (unflaggedMines.length === 0) {
      playSound.jiaoBass(soundEnabled);
      setJiaoMessageOverride(
        lang === 'en'
          ? "【CHIEF RADAR】No unflagged mines found! You're extremely safe."
          : lang === 'zh-TW'
          ? "【極智天眼通】場上已經沒有尚未標記的「袁」雷！椒哥感到十分欣慰！"
          : "【极智天眼通】场上已经没有尚未标记的「袁」雷！椒哥感到十分欣慰！"
      );
      return;
    }

    // Capture and automatically flag up to 3 hidden mines safely!
    const minesToFlag = unflaggedMines.slice(0, 3);
    const workingBoard = board.map((row) =>
      row.map((cell) => {
        const matches = minesToFlag.some(([r, c]) => r === cell.r && c === cell.c);
        if (matches) {
          return { ...cell, isFlagged: true };
        }
        return cell;
      })
    );

    playSound.quantumTides(soundEnabled);

    const newFlagCount = flagsCount + minesToFlag.length;
    setFlagsCount(newFlagCount);
    setBoard(workingBoard);

    let customMsg = '';
    if (lang === 'en') {
      customMsg = `【CELESTIAL RADAR】Password "jiaoge" verified! Jiao Ge deployed standard pentatonic waves to scan-expose and flag ${minesToFlag.length} hidden "Yuan" mines!`;
    } else if (lang === 'zh-TW') {
      customMsg = `【極智天眼通】秘籍解鎖！你輸入了極智密碼“jiaoge”，椒哥催動五階和弦脈衝，為你精準掃描並標記了 ${minesToFlag.length} 個重磅「袁」雷！`;
    } else {
      customMsg = `【极智天眼通】秘籍解锁！你输入了极智密码“jiaoge”，椒哥催动五阶和弦脉冲，为你精确扫描并标记了 ${minesToFlag.length} 个重磅「袁」雷！`;
    }
    setJiaoMessageOverride(customMsg);

    checkVictory(workingBoard);
  };

  const boardWrapperRef = useRef<HTMLDivElement>(null);

  useJiaoSwipeGesture(boardWrapperRef, {
    onSwipeUp: () => {
      spawnJiaoParticles(['🏄', '🚀', '⬆️', '🔥', '✨']);
      if (soundEnabled) playSound.click(true);
    },
    onSwipeDown: () => {
      spawnJiaoParticles(['⬇️', '🛡️', '⚓', '💥', '⚠️']);
      if (soundEnabled) playSound.click(true);
    }
  });

  return (
    <div 
      className={`min-h-[100dvh] w-full flex flex-col items-center justify-center p-2 sm:p-3 font-sans antialiased transition-all duration-500 relative overflow-x-hidden ${
        status === 'lost' ? 'animate-screen-shake' : ''
      } ${
        theme === 'cyberpunk'
          ? 'bg-[#06070d] text-[#00f0ff] cyber-grid cyber-scanlines'
          : season === 'spring' ? 'bg-[#f4fbf7] text-[#1e3a24]'
          : season === 'summer' ? 'bg-[#f0f8ff] text-[#1a365d]'
          : season === 'autumn' ? 'bg-[#fffdf7] text-[#4a3424]'
          : 'bg-[#f8fafc] text-[#0f172a]' // winter
      } ${
        naoMaLeEnabled && (decayJitterAmt > 0) ? 'nao-ma-le-active-page' : ''
      }`}
      style={{
        '--jitter-amt': naoMaLeEnabled ? decayJitterAmt : 0,
        '--jitter-speed': `${0.05 + Math.random() * 0.15}s`,
        '--jiao-streak': jiaoStreak
      } as React.CSSProperties}
    >
      {theme === 'classic' && <SeasonalBackground theme={theme} season={season} />}

      {/* Dynamic Floating Ambient light orbs in Cyberpunk Mode - Rich Multi-color Palette */}
      {theme === 'cyberpunk' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Cyber Cyan Orb */}
          <div className="absolute w-[250px] h-[250px] md:w-[350px] md:h-[350px] rounded-full bg-cyan-500/10 blur-[80px] md:blur-[120px] top-[5%] left-[-130px] animate-pulse-slow-1" />
          {/* Cyber Fuchsia/Pink Orb */}
          <div className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full bg-fuchsia-500/10 blur-[90px] md:blur-[140px] bottom-[10%] right-[-150px] animate-pulse-slow-2" />
          {/* Cyber Mystic Purple Orb */}
          <div className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full bg-purple-600/10 blur-[70px] md:blur-[110px] top-[40%] left-[55%] animate-pulse-slow-3" />
        </div>
      )}

      {/* Immersive Cyberpunk Laser Sweeper effect */}
      {theme === 'cyberpunk' && <div className="cyber-laser-sweep" />}

      <div className="w-full max-w-4xl flex flex-col gap-3.5 relative z-10 animate-fade-in duration-700 px-1 sm:px-2">
        {/* Playable Section Card */}
        <div className={`flex flex-col gap-4 relative transition-all duration-500 ${
          theme === 'cyberpunk'
            ? 'p-3 sm:p-5 rounded-3xl bg-[#0f111a]/95 border border-[#ff0055]/30 shadow-[0_0_25px_rgba(255,0,85,0.2)] cyber-panel-glow'
            : 'p-4 sm:p-6 rounded-3xl bg-white/95 border border-slate-200 shadow-md'
        }`}>
          {/* Multi-colored cybernetic top ribbon integrating Purple, Pink, Green and Yellow */}
          {theme === 'cyberpunk' && (
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[24px] bg-gradient-to-r from-[#9d4edd] via-[#ff00a2] via-[#39ff14] to-[#ffea00] shadow-[0_3px_20px_rgba(255,0,162,0.6)] z-20" />
          )}
          {/* Main Title & stats bar */}
          <Header
            difficulty={difficulty}
            setDifficulty={(diff) => {
              setDifficulty(diff);
              initializeBoard(diff);
            }}
            status={status}
            flagsCount={flagsCount}
            totalMines={activeMinesCount}
            time={time}
            clickMode={clickMode}
            setClickMode={setClickMode}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            onRestart={handleRestart}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenHowTo={() => setIsHowToOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
            onOpenSoundboard={() => setIsSoundboardOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            jiaoAvatar={jiaoAvatar}
            lang={lang}
            setLang={setLang}
            onOpenEasterEgg={() => setIsEasterEggOpen(true)}
            theme={theme}
            toggleTheme={toggleTheme}
            jiaoStreak={jiaoStreak}
            challengeMode={challengeMode}
            setChallengeMode={setChallengeMode}
            extraMinesAdded={activeMinesCount - currentConfig.mines}
            onShuffle={handleShuffle}
            onPauseToggle={handlePauseToggle}
          />

          {/* Daily Jiao-mantra Wisdom Banner */}
          <DailyMantraNotification
            lang={lang}
            theme={theme}
            soundEnabled={soundEnabled}
          />

          {/* Interactive Core Garden grid Section with Nao Ma Le Indicator */}
          <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 relative">
            {naoMaLeEnabled && (
              <NumbnessMeter 
                jitterAmt={decayJitterAmt} 
                lang={lang} 
                theme={theme} 
                onTriggerTestBurst={triggerNaoMaLeTestBurst}
              />
            )}

            <div 
              ref={boardWrapperRef} 
              className={`touch-pan-y relative z-10 w-full lg:w-auto flex justify-center ${status === 'playing' ? 'animate-urgency-pulse' : ''} ${naoMaLeEnabled && (decayJitterAmt > 0) ? 'nao-ma-le-active' : ''} ${status === 'won' || status === 'lost' ? 'is-game-ended' : ''} ${status === 'paused' ? 'is-game-paused' : ''}`}
              style={{ 
                '--urgency-dur': `${Math.max(0.4, 2 - (time / 60))}s`,
                '--urgency-intensity': Math.min(0.25, (time / 999) * 0.25),
                '--vein-max-opacity': Math.min(0.7, (time / 400) * 0.7),
                '--jitter-amt': naoMaLeEnabled ? decayJitterAmt : 0,
                '--jitter-speed': `${0.05 + Math.random() * 0.15}s`,
                '--jiao-streak': jiaoStreak
               } as React.CSSProperties}
            >
              {/* Jiao Aura Filter background wrapper */}
              {jiaoStreak > 0 && <JiaoAuraBg streak={jiaoStreak} intensity={jiaoAuraIntensity} />}
              
              {/* Pixel Burst Overlay when Nao Ma Le Active is high */}
              {naoMaLeEnabled && (decayJitterAmt > 0) && (
                <div id="pixel-burst-overlay" className="pixel-burst-overlay absolute inset-0 pointer-events-none rounded-[20px] overflow-hidden z-30">
                  <div id="pixel-fragment-1" className="pixel-fragment fragment-1" />
                  <div id="pixel-fragment-2" className="pixel-fragment fragment-2" />
                  <div id="pixel-fragment-3" className="pixel-fragment fragment-3" />
                  <div id="pixel-fragment-4" className="pixel-fragment fragment-4" />
                  <div id="pixel-fragment-5" className="pixel-fragment fragment-5" />
                  <div id="pixel-fragment-6" className="pixel-fragment fragment-6" />
                </div>
              )}
              
              {/* Vein Overlay */}
              {status === 'playing' && (
                <div className="absolute inset-0 pointer-events-none rounded-[20px] mix-blend-screen z-20 vein-overlay" />
              )}

              <MinesweeperBoard
                board={board}
                config={currentConfig}
                status={status as any}
                showcaseActive={showcaseActive}
                difficulty={difficulty}
                comboToasts={comboToasts}
                onReveal={handleRevealCell}
                onFlag={handleFlagCell}
                onChord={handleChordSweep}
                activeCell={activeCell}
                setActiveCell={setActiveCell}
                theme={theme}
                clickMode={clickMode}
              />

              {/* Manual Pause Warning Overlay */}
              {status === 'paused' && (
                <div className="absolute inset-0 bg-[#07080f]/90 backdrop-blur-md rounded-[20px] pointer-events-auto z-40 flex flex-col items-center justify-center p-6 border-2 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-fade-in-rapid">
                  {/* Warning Sign icon */}
                  <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center text-red-500 text-2.5xl font-bold mb-4 shadow-[0_0_15px_rgba(239,68,68,0.35)] animate-pulse select-none">
                    ⚠️
                  </div>
                  <h3 className="text-red-500 font-display font-extrabold text-base sm:text-lg md:text-xl tracking-wider select-none uppercase text-center">
                    {lang === 'en' 
                      ? 'Nao Ma Le - Simulation Paused' 
                      : lang === 'zh-TW' 
                      ? '鬧麻了 - 腦電波防抖避震暫停' 
                      : '闹麻了 - 脑电波防抖避震暂停'}
                  </h3>
                  <p className="text-slate-400 text-[10px] sm:text-xs text-center max-w-xs mt-2 select-none">
                    {lang === 'en'
                      ? 'The current intellectual capacitor calibration has been frozen. Press Resume to restore stimulation.'
                      : lang === 'zh-TW'
                      ? '當前五階和弦避震抗抖動技術已掛起。點擊「繼續」以恢復超頻磁極刺激！'
                      : '当前五阶和弦避震抗抖动技术已挂起。点击“继续”以恢复超频磁极刺激！'}
                  </p>
                  <button
                    onClick={handlePauseToggle}
                    className="mt-5 px-5 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 font-display text-white text-[10px] font-black rounded-full shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_20px_rgba(239,68,68,0.5)] cursor-pointer active:scale-95 transition-all uppercase"
                  >
                    {lang === 'en' ? 'Resume Session' : lang === 'zh-TW' ? '恢復極智會話' : '恢复极智会话'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Persistent Challenge Level Meter */}
          <ChallengeMeter 
            streak={jiaoStreak} 
            tokens={jiaoTokens}
            badges={jiaoBadges}
            lang={lang} 
            theme={theme} 
          />

          {/* Jiao Ge's Live AI Diagnostic Terminal & Solver Assistant */}
          <JiaoGeTerminal
            status={status}
            lang={lang}
            theme={theme}
            season={season}
            soundEnabled={soundEnabled}
            jiaoHelpsRemaining={jiaoHelpsRemaining}
            jiaoHelpCooldown={jiaoHelpCooldown}
            messageOverride={jiaoMessageOverride}
            onCallHelp={handleJiaoHelp}
            onOpenEasterEgg={() => setIsEasterEggOpen(true)}
            onAvatarClick={spawnJiaoParticles}
          />

          {/* Persistent Combo HUD */}
          <ComboHUD 
            multiplier={lastComboInfo?.multiplier || 1} 
            clearCount={lastComboInfo?.clearCount || 0}
            theme={theme}
          />

          {/* Auxiliary result summary overlay at base of grid */}
          <WinLoseOverlay
            status={status as any}
            time={time}
            bestTime={stats[difficulty].bestTime}
            config={currentConfig}
            streak={jiaoStreak}
            onRestart={() => initializeBoard()}
            onOpenStats={() => setIsStatsOpen(true)}
            lang={lang}
            theme={theme}
          />
        </div>

        <JiaoGoldQuotesMarquee lang={lang} theme={theme} />

        {/* Footer credits matches branding honesty constraints: Simple literal details, no system clutter of slop */}
        <div className="text-center text-[11px] select-none flex flex-col gap-3">
          <div className={`leading-relaxed font-sans transition-colors duration-300 ${
            theme === 'cyberpunk' ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {t.footerShortcutInfo}
          </div>
          <div 
            onClick={() => setIsEasterEggOpen(true)}
            className={`font-display font-extrabold tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-95 transition-all duration-200 select-none ${
              theme === 'cyberpunk'
                ? 'text-[#ff0055] hover:text-[#ff3377] drop-shadow-[0_0_4px_#ff0055]'
                : 'text-amber-500 hover:text-amber-600'
            }`}
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
        theme={theme}
        currentJiaoStreak={jiaoStreak}
        bestJiaoStreak={bestJiaoStreak}
        jiaoBadges={jiaoBadges}
      />

      <HowToPlayModal
        isOpen={isHowToOpen}
        onClose={() => setIsHowToOpen(false)}
        lang={lang}
        theme={theme}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        theme={theme}
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolumeState}
        intensity={jiaoAuraIntensity}
        setIntensity={setJiaoAuraIntensity}
        timeAttackMode={timeAttackMode}
        setTimeAttackMode={handleToggleTimeAttack}
        gameEndingSoundsEnabled={gameEndingSoundsEnabled}
        setGameEndingSoundsEnabled={setGameEndingSoundsEnabled}
        naoMaLeEnabled={naoMaLeEnabled}
        setNaoMaLeEnabled={handleToggleNaoMaLe}
      />

      {/* Jiao Ge's Legendary Easter Egg Modal */}
      <EasterEggModal
        isOpen={isEasterEggOpen}
        onClose={() => setIsEasterEggOpen(false)}
        lang={lang}
        soundEnabled={soundEnabled}
        theme={theme}
      />

      {/* Jiao Ge's Scholastic Achievements Milestone Wall */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        lang={lang}
        theme={theme}
        soundEnabled={soundEnabled}
      />

      {/* Jiao Ge's Dynamic Vocal Soundboard Console */}
      <SoundboardModal
        isOpen={isSoundboardOpen}
        onClose={() => setIsSoundboardOpen(false)}
        lang={lang}
        theme={theme}
        soundEnabled={soundEnabled}
      />

      {/* Global Jiao Ge Cloud Leaderboard Wall */}
      <GlobalJiaoLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        lang={lang}
        theme={theme}
        soundEnabled={soundEnabled}
        currentAvatar={jiaoAvatar}
        lastPendingWin={lastPendingWin}
        onClearPendingWin={() => setLastPendingWin(null)}
      />

      {/* Jiao Ge Avatar Selection Profile */}
      <JiaoGeProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        lang={lang}
        theme={theme}
        soundEnabled={soundEnabled}
        currentAvatar={jiaoAvatar}
        onAvatarSelect={handleAvatarSelect}
      />

      {/* Jiao Ge's Tactical Real-Time Anti-Explosion QTE Controller */}
      <QTEOverlay
        isOpen={isQTEOpen}
        lang={lang}
        theme={theme}
        soundEnabled={soundEnabled}
        onSuccess={handleQTESuccess}
        onFailure={handleQTEFailure}
      />

      {/* Floating Jiao Ge Celebration/Mantra/Warning Particles Layer */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        <AnimatePresence>
          {jiaoParticles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: '105vh', x: `${p.left}vw`, opacity: 0, scale: 0.8 }}
              animate={{ 
                y: '-10vh', 
                opacity: [0, 1, 1, 0], 
                scale: 1.1,
                x: `${p.left + p.drift}vw`
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, ease: "linear" }}
              style={{ 
                position: 'absolute',
                fontSize: `${p.size}px`,
                color: p.color || undefined,
                filter: p.shadow 
                  ? `drop-shadow(0 0 10px ${p.shadow})` 
                  : (theme === 'cyberpunk' ? 'drop-shadow(0 0 4px rgba(255,0,162,0.6))' : 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))')
              }}
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Spectacular Radial Victory Fireworks Burst Layer */}
      <div className="fixed inset-0 pointer-events-none z-[101] overflow-hidden">
        <AnimatePresence>
          {victoryFireworks.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: p.dx, y: p.dy, scale: 0.1, opacity: 0 }}
              animate={{ 
                scale: p.scaleDst, 
                opacity: [0, 1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
              style={{ 
                position: 'absolute',
                left: `${p.centerX}%`,
                top: `${p.centerY}%`,
                width: '60px',
                height: '60px',
                marginLeft: '-30px',
                marginTop: '-30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `${p.size}px`,
                filter: `drop-shadow(0 0 8px ${p.color})`,
              }}
            >
              <div 
                className="animate-jiao-dance"
                style={{ 
                  animationDuration: `${0.3 + Math.random() * 0.4}s`,
                  animationDelay: `${Math.random() * 0.3}s`
                }}
              >
                {p.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Dynamic Cursor/Click Jiao-trail */}
      <JiaoCursorTrail streak={jiaoStreak} />

      {/* Dynamic Jiao Rainfall based on game time elapsed */}
      <JiaoRainfall timePassed={time} isPlaying={status === 'playing'} />
    </div>
  );
}
