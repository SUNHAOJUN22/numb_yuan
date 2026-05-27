import React from 'react';
import { Trophy, HelpCircle, X, Trash2, Calendar, Award } from 'lucide-react';
import { GameStats, DIFFICULTIES } from '../types';

interface StatsProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  onClearStats: () => void;
}

export default function StatsModal({ isOpen, onClose, stats, onClearStats }: StatsProps) {
  if (!isOpen) return null;

  return (
    <div id="stats-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 no-select animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:max-h-[90vh] max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration matches Google colors */}
        <div className="h-2 flex w-full">
          <div className="bg-[#4285F4] flex-1" />
          <div className="bg-[#EA4335] flex-1" />
          <div className="bg-[#FBBC05] flex-1" />
          <div className="bg-[#34A853] flex-1" />
        </div>

        {/* Modal Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="font-display font-extrabold text-lg">Your Statistics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            id="close-stats-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-3">
            {(['easy', 'medium', 'hard'] as const).map((diff) => {
              const diffStats = stats[diff];
              const gamesPlayed = diffStats.gamesPlayed;
              const gamesWon = diffStats.gamesWon;
              const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
              const bestTime = diffStats.bestTime;
              const config = DIFFICULTIES[diff];

              return (
                <div key={diff} className="flex flex-col border border-slate-100 bg-slate-50/30 p-3.5 rounded-2xl relative overflow-hidden group">
                  {/* Decorative Border indicator */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${config.bgClass}`} />
                  
                  <div className="font-display font-bold text-sm text-slate-800 mt-1">
                    {config.label}
                  </div>
                  
                  <div className="mt-3 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Games</span>
                    <span className="font-mono text-base font-bold text-slate-700">
                      {gamesWon}/{gamesPlayed}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Win Rate</span>
                    <span className="font-mono text-base font-bold text-slate-700">
                      {winRate}%
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Best Time</span>
                    <span className="font-mono text-base font-bold text-slate-700 flex items-center gap-1">
                      {bestTime !== null ? `${bestTime}s` : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick instructions / tips box */}
          <div className="bg-lime-50/50 border border-lime-100 p-4 rounded-2xl flex items-start gap-3">
            <Award className="w-5 h-5 text-lime-600 shrink-0 mt-0.5" />
            <div className="text-xs text-lime-800 leading-relaxed font-sans">
              <strong className="block font-semibold font-display mb-0.5">Google Minesweeper Tip:</strong>
              The first tile you click is always safe and guaranteed to open a cluster of cells. Move fast and use chord double-clicks (clicking revealed number with correct adjacent flags) to sweep with lightning speed!
            </div>
          </div>
        </div>

        {/* Clear Stats Action Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all statistical histories? This cannot be undone.')) {
                onClearStats();
              }
            }}
            id="clear-stats-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 hover:bg-red-50 text-red-600 rounded-xl text-xs font-display font-semibold transition-colors border border-red-100/50 hover:border-red-200 hover:shadow-sm cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Reset Stats
          </button>
          
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-display font-semibold transition-colors cursor-pointer hover:shadow-md"
            id="stats-modal-ok-btn"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
