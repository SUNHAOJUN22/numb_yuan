import React from 'react';
import { X, Spade, Flag, Flame, Target, Sparkles, MousePointerClick } from 'lucide-react';

interface HowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ isOpen, onClose }: HowProps) {
  if (!isOpen) return null;

  return (
    <div id="how-to-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 no-select animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:max-h-[90vh] max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-2 flex w-full">
          <div className="bg-[#4285F4] flex-1" />
          <div className="bg-[#EA4335] flex-1" />
          <div className="bg-[#FBBC05] flex-1" />
          <div className="bg-[#34A853] flex-1" />
        </div>

        {/* Modal Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="font-display font-extrabold text-lg">How to Play Minesweeper</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            id="close-how-to-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Objective */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-[#4285F4]">The Goal</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              Clean the entire lawn of grasses without hitting any hidden subterranean mines! If you dig a mine, the garden is ruined (Game Over).
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Mouse Controls */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-[#EA4335]">Mechanics & Controls</h3>
            
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                <Spade className="w-5 h-5" fill="#2563eb" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-slate-800">Unearth a tile (Dig)</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  <strong>Left Click</strong> on standard tiles, or tap them directly under Shovel mode. Numbers indicate how many mines are hiding in the adjacent 8 neighbors.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-red-50 p-2.5 rounded-xl text-red-600">
                <Flag className="w-5 h-5" fill="#dc2626" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-slate-800">Place a flag (Safety mark)</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  <strong>Right Click</strong> on standard tiles, or tap directly under Flag mode. Safe flags lock tiles from wrongful clicks!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-amber-50 p-2.5 rounded-xl text-amber-700">
                <MousePointerClick className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-slate-800">Quick-Sweep (Chord Click)</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  <strong>Double Click</strong> or left+right click a revealed cell count. If you have already flagged the correct number of surrounding mines, this instantly unearths all other adjacent tiles for maximum speed!
                </p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Tips */}
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
            <Target className="w-5 h-5 text-[#4285F4] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed font-sans">
              <strong className="block font-semibold font-display text-[#4285F4] mb-0.5">Quick Shortcut:</strong>
              Press the <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 shadow-sm text-slate-800 rounded font-mono font-bold text-[10px]">F</kbd> key on desktop to temporarily reverse toggle your active shovel/flag tool modifier for super-smooth control!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/30">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-display font-semibold transition-colors cursor-pointer hover:shadow-md"
            id="how-to-ok-btn"
          >
            I'm Ready!
          </button>
        </div>
      </div>
    </div>
  );
}
