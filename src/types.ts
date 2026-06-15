export type DifficultyType = 'kids' | 'easy' | 'medium' | 'hard' | 'expert';

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
  kids: {
    type: 'kids',
    label: 'Very Easy',
    rows: 6,
    cols: 6,
    mines: 3,
    color: '#34A853', // Google Green
    bgClass: 'bg-[#34A853]',
  },
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
  expert: {
    type: 'expert',
    label: 'Very Hard',
    rows: 24,
    cols: 30,
    mines: 170,
    color: '#854dff', // Purple
    bgClass: 'bg-[#854dff]',
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
  kids: { gamesPlayed: number; gamesWon: number; bestTime: number | null };
  easy: { gamesPlayed: number; gamesWon: number; bestTime: number | null };
  medium: { gamesPlayed: number; gamesWon: number; bestTime: number | null };
  hard: { gamesPlayed: number; gamesWon: number; bestTime: number | null };
  expert: { gamesPlayed: number; gamesWon: number; bestTime: number | null };
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost' | 'paused';
export type ClickMode = 'shovel' | 'flag';
