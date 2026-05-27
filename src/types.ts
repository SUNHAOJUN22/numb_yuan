export type DifficultyType = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  type: DifficultyType;
  label: string;
  rows: number;
  cols: number;
  mines: number;
  color: string; // Theme color for Google buttons
  bgClass: string;
}

export const DIFFICULTIES: Record<DifficultyType, DifficultyConfig> = {
  easy: {
    type: 'easy',
    label: 'Easy',
    rows: 8,
    cols: 10,
    mines: 10,
    color: '#4285F4', // Google Blue
    bgClass: 'bg-[#4285F4]',
  },
  medium: {
    type: 'medium',
    label: 'Medium',
    rows: 14,
    cols: 18,
    mines: 40,
    color: '#FBBC05', // Google Yellow
    bgClass: 'bg-[#FBBC05]',
  },
  hard: {
    type: 'hard',
    label: 'Hard',
    rows: 20,
    cols: 24,
    mines: 99,
    color: '#EA4335', // Google Red
    bgClass: 'bg-[#EA4335]',
  },
};

export interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export interface GameStats {
  easy: { gamesPlayed: number; gamesWon: number; bestTime: number | null };
  medium: { gamesPlayed: number; gamesWon: number; bestTime: number | null };
  hard: { gamesPlayed: number; gamesWon: number; bestTime: number | null };
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';
export type ClickMode = 'shovel' | 'flag';
