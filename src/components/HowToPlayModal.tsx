import React from 'react';
import { X, Spade, Flag, Sparkles, MousePointerClick, HelpCircle } from 'lucide-react';
import { Language, TranslationSet, translations } from '../utils/i18n';

interface HowProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export default function HowToPlayModal({ isOpen, onClose, lang }: HowProps) {
  if (!isOpen) return null;

  const t: TranslationSet = translations[lang];

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
            <h2 className="font-display font-extrabold text-base md:text-lg select-none">{t.howToPlayTitle}</h2>
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
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-[#4285F4] select-none">{t.goalTitle}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans select-none">
              {t.goalDesc}
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Mouse Controls */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-[#EA4335] select-none">{t.controlsTitle}</h3>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded-xl text-[#4285F4] shrink-0">
                <Spade className="w-4.5 h-4.5" fill="#4285F4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs sm:text-sm text-slate-800 select-none">{t.unearthTitle}</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed select-none">
                  {t.unearthDesc}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-red-50 p-2 rounded-xl text-[#EA4335] shrink-0">
                <Flag className="w-4.5 h-4.5" fill="#EA4335" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs sm:text-sm text-slate-800 select-none">{t.flagTitle}</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed select-none">
                  {t.flagDesc}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-amber-50 p-2 rounded-xl text-amber-600 shrink-0">
                <MousePointerClick className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs sm:text-sm text-slate-800 select-none">{t.quickSweepTitle}</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed select-none">
                  {t.quickSweepDesc}
                </p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Tips */}
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-start gap-2.5">
            <HelpCircle className="w-5 h-5 text-[#4285F4] shrink-0 mt-0.5" />
            <div className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-sans select-none">
              {t.shortcutTip}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/30">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-display font-bold transition-colors cursor-pointer hover:shadow-md"
            id="how-to-ok-btn"
          >
            {t.readyBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
