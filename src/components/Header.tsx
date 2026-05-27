import React from 'react';
import { 
  Timer, 
  Flag, 
  Volume2, 
  VolumeX, 
  BarChart3, 
  RotateCcw, 
  HelpCircle, 
  Spade,
  Award
} from 'lucide-react';
import { DifficultyType, DIFFICULTIES } from '../types';

interface HeaderProps {
  difficulty: DifficultyType;
  setDifficulty: (diff: DifficultyType) => void;
  status: 'idle' | 'playing' | 'won' | 'lost';
  flagsCount: number;
  totalMines: number;
  time: number;
  clickMode: 'shovel' | 'flag';
  setClickMode: (mode: 'shovel' | 'flag') => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onRestart: () => void;
  onOpenStats: () => void;
  onOpenHowTo: () => void;
}

export default function Header({
  difficulty,
  setDifficulty,
  status,
  flagsCount,
  totalMines,
  time,
  clickMode,
  setClickMode,
  soundEnabled,
  setSoundEnabled,
  onRestart,
  onOpenStats,
  onOpenHowTo,
}: HeaderProps) {
  // Determine Smiley Face based on status
  const getSmiley = () => {
    switch (status) {
      case 'won':
        return '😎'; // Cool sunglasses
      case 'lost':
        return '😵'; // Dead/knocked out
      case 'playing':
        return '🙂'; // Focused
      case 'idle':
      default:
        return '😊'; // Happy
    }
  };

  const getStatusText = () => {
    if (status === 'won') return 'Congratulations! You won! 🎉';
    if (status === 'lost') return 'Oops! Hit a mine. Try again! 🪴';
    if (status === 'playing') return 'Careful... search carefully';
    return 'Select a tile to start sweeping!';
  };

  const currentConfig = DIFFICULTIES[difficulty];

  return (
    <div className="w-full flex flex-col gap-4 no-select" id="minesweeper-header">
      {/* Upper Branded Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-100/80 google-shadow">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-1 bg-[#4285F4]/10 p-2 rounded-xl text-[#4285F4]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight text-slate-800 flex items-center gap-1 select-none">
              <span className="text-[#4285F4] font-extrabold">袁</span>
              <span className="text-[#EA4335] font-extrabold">世</span>
              <span className="text-[#FBBC05] font-extrabold">杰</span>
              <span className="text-[#4285F4] font-extrabold">闹</span>
              <span className="text-[#34A853] font-extrabold">麻</span>
              <span className="text-[#EA4335] font-extrabold">了</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-sans tracking-wide mt-0.5">Clean Minimalist Edition</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            id="audio-toggle-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-500 cursor-pointer ${
              soundEnabled ? 'text-[#34A853] border-[#34A853]/20 bg-[#34A853]/5' : ''
            }`}
            title={soundEnabled ? 'Sound On' : 'Sound Off'}
          >
            {soundEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
          </button>

          {/* Stats Button */}
          <button
            id="stats-modal-btn"
            onClick={onOpenStats}
            className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
            title="Statistics"
          >
            <BarChart3 className="w-4.5 h-4.5" />
          </button>

          {/* How to Play */}
          <button
            id="how-to-play-btn"
            onClick={onOpenHowTo}
            className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
            title="How to Play"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Main Stats Controller Board (Google's classic Clean Minimalist styling row) */}
      <div className="bg-white rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between border border-slate-200/80 google-shadow relative gap-4">
        {/* Dynamic statistics left details */}
        <div className="flex gap-8 select-none">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider font-display">Flags Left</span>
            <span className="text-2xl font-mono font-bold text-[#EA4335]">
              {Math.max(0, totalMines - flagsCount).toString().padStart(3, '0')}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider font-display">Time</span>
            <span className="text-2xl font-mono font-bold text-slate-700">
              {time.toString().padStart(3, '0')}
            </span>
          </div>
        </div>

        {/* Status indicator message */}
        <div className="hidden lg:flex flex-col items-center">
          <span className="text-xs font-display font-medium text-slate-500 select-none">
            {getStatusText()}
          </span>
        </div>

        {/* Action controls (Smiley face / Reset & Difficulty Toggles) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Difficulty Toggles */}
          <div className="flex items-center bg-[#f1f3f4] rounded-xl p-1 border border-slate-100">
            {(Object.keys(DIFFICULTIES) as DifficultyType[]).map((diffKey) => {
              const cfg = DIFFICULTIES[diffKey];
              const isActive = difficulty === diffKey;
              return (
                <button
                  key={diffKey}
                  id={`diff-btn-${diffKey}`}
                  onClick={() => setDifficulty(diffKey)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-display font-semibold transition-all duration-200 outline-none cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-800 google-shadow font-bold animate-fade-in'
                      : 'text-slate-500 hover:bg-[#e8eaed]/50'
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Reset Pill Button with Smiley */}
          <button
            id="game-restart-center-btn"
            onClick={onRestart}
            className="btn-pill px-5 py-2 hover:bg-slate-50 text-slate-700 border border-slate-200 bg-white rounded-full font-display font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            title="Reset Game"
          >
            <span className="text-base leading-none">{getSmiley()}</span>
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Interactive clickMode/Tool Toggle */}
      <div className="flex justify-center">
        <div className="bg-[#f1f3f4] p-1 rounded-2xl border border-slate-200/50 inline-flex shadow-sm gap-1 self-center">
          <button
            id="mode-toggle-shovel"
            onClick={() => setClickMode('shovel')}
            className={`flex items-center gap-2 px-4.5 py-1.5 rounded-xl font-display font-bold text-xs transition-all duration-150 outline-none cursor-pointer ${
              clickMode === 'shovel'
                ? 'bg-white text-slate-800 google-shadow'
                : 'text-slate-500 hover:bg-[#e8eaed]/50'
            }`}
          >
            <Spade className={`w-3.5 h-3.5 ${clickMode === 'shovel' ? 'text-[#4285F4]' : 'text-slate-400'}`} fill={clickMode === 'shovel' ? '#4285F4' : 'transparent'} />
            Unearth (Dig)
          </button>
          <button
            id="mode-toggle-flag"
            onClick={() => setClickMode('flag')}
            className={`flex items-center gap-2 px-4.5 py-1.5 rounded-xl font-display font-bold text-xs transition-all duration-150 outline-none cursor-pointer ${
              clickMode === 'flag'
                ? 'bg-white text-slate-800 google-shadow'
                : 'text-slate-500 hover:bg-[#e8eaed]/50'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${clickMode === 'flag' ? 'text-[#EA4335]' : 'text-slate-400'}`} fill={clickMode === 'flag' ? '#EA4335' : 'transparent'} />
            Place Flags
          </button>
        </div>
      </div>
    </div>
  );
}

