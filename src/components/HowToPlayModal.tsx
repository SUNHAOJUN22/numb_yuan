import React from 'react';
import { X, Spade, Sparkles, MousePointerClick, HelpCircle } from 'lucide-react';
import { Language, TranslationSet, translations } from '../utils/i18n';

interface HowProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme?: 'classic' | 'cyberpunk';
}

export default function HowToPlayModal({ isOpen, onClose, lang, theme = 'classic' }: HowProps) {
  if (!isOpen) return null;

  const t: TranslationSet = translations[lang];

  return (
    <div id="how-to-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-[#06070d]/75 backdrop-blur-sm p-4 no-select animate-fade-in">
      <div 
        className={`w-full max-w-md rounded-3xl overflow-hidden border flex flex-col md:max-h-[90vh] max-h-[95vh] transition-all duration-300 ${
          theme === 'cyberpunk'
            ? 'bg-[#0f111a]/95 border-[#ff0055]/30 shadow-[0_0_25px_rgba(255,0,85,0.25)] text-white'
            : 'bg-white border-slate-100 shadow-xl text-slate-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        {theme === 'cyberpunk' ? (
          <div className="h-1 bg-gradient-to-r from-[#00f0ff] to-[#ff00bb] shadow-[0_0_10px_#ff0055] w-full" />
        ) : (
          <div className="h-2 flex w-full">
            <div className="bg-[#4285F4] flex-1" />
            <div className="bg-[#EA4335] flex-1" />
            <div className="bg-[#FBBC05] flex-1" />
            <div className="bg-[#34A853] flex-1" />
          </div>
        )}

        {/* Modal Header */}
        <div className={`px-6 py-5 flex items-center justify-between border-b ${
          theme === 'cyberpunk' ? 'border-[#ff0055]/20 bg-[#ff0055]/5' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${theme === 'cyberpunk' ? 'text-[#ff00bb] drop-shadow-[0_0_3px_#ff00bb]' : 'text-amber-500'}`} />
            <h2 className={`font-display font-extrabold text-base md:text-lg select-none ${theme === 'cyberpunk' ? 'text-[#00f0ff] cyber-glow-cyan' : 'text-slate-800'}`}>{t.howToPlayTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 px-2 rounded-xl transition-colors cursor-pointer ${
              theme === 'cyberpunk'
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            id="close-how-to-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Objective */}
          <div className="flex flex-col gap-1.5">
            <h3 className={`text-xs font-display font-bold uppercase tracking-wider select-none ${theme === 'cyberpunk' ? 'text-[#00f0ff] cyber-glow-cyan' : 'text-[#4285F4]'}`}>{t.goalTitle}</h3>
            <p className={`text-xs sm:text-sm leading-relaxed font-sans select-none ${theme === 'cyberpunk' ? 'text-slate-200' : 'text-slate-600'}`}>
              {t.goalDesc}
            </p>
          </div>

          <hr className={theme === 'cyberpunk' ? 'border-[#ff0055]/15' : 'border-slate-100'} />

          {/* Mouse Controls */}
          <div className="flex flex-col gap-3">
            <h3 className={`text-xs font-display font-bold uppercase tracking-wider select-none ${theme === 'cyberpunk' ? 'text-[#ff0055] cyber-glow-magenta' : 'text-[#EA4335]'}`}>{t.controlsTitle}</h3>
            
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${theme === 'cyberpunk' ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_6px_rgba(0,240,255,0.2)]' : 'bg-blue-50 text-[#4285F4]'}`}>
                <Spade className="w-4.5 h-4.5" fill={theme === 'cyberpunk' ? 'transparent' : '#4285F4'} />
              </div>
              <div>
                <h4 className={`font-display font-bold text-xs sm:text-sm select-none ${theme === 'cyberpunk' ? 'text-white' : 'text-slate-800'}`}>{t.unearthTitle}</h4>
                <p className={`text-[11px] sm:text-xs mt-0.5 leading-relaxed select-none ${theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.unearthDesc}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`w-8.5 h-8.5 rounded-xl shrink-0 flex items-center justify-center font-display font-black text-sm select-none ${
                theme === 'cyberpunk' 
                  ? 'bg-[#ff0055]/15 text-[#ff0055] border border-[#ff0055]/30 shadow-[0_0_6px_rgba(255,0,85,0.25)]' 
                  : 'bg-red-50 text-[#EA4335]'
              }`}>
                椒
              </div>
              <div>
                <h4 className={`font-display font-bold text-xs sm:text-sm select-none ${theme === 'cyberpunk' ? 'text-white' : 'text-slate-800'}`}>{t.flagTitle}</h4>
                <p className={`text-[11px] sm:text-xs mt-0.5 leading-relaxed select-none ${theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.flagDesc}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${theme === 'cyberpunk' ? 'bg-[#ff00bb]/10 text-[#ff00bb] border border-[#ff00bb]/30' : 'bg-amber-50 text-amber-600'}`}>
                <MousePointerClick className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className={`font-display font-bold text-xs sm:text-sm select-none ${theme === 'cyberpunk' ? 'text-white' : 'text-slate-800'}`}>{t.quickSweepTitle}</h4>
                <p className={`text-[11px] sm:text-xs mt-0.5 leading-relaxed select-none ${theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.quickSweepDesc}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-1">
              <div className={`p-2 rounded-xl shrink-0 ${theme === 'cyberpunk' ? 'bg-[#ffea00]/10 text-[#ffea00] border border-[#ffea00]/30 shadow-[0_0_6px_rgba(255,234,0,0.2)]' : 'bg-yellow-50 text-[#FBBC05]'}`}>
                <div className="flex flex-col items-center animate-bounce">
                  <span className="text-[10px] leading-none mb-0.5">👆</span>
                  <span className="text-[10px] leading-none">👇</span>
                </div>
              </div>
              <div>
                <h4 className={`font-display font-bold text-xs sm:text-sm select-none ${theme === 'cyberpunk' ? 'text-white' : 'text-slate-800'}`}>
                  {lang === 'en' ? 'Jiao Gestures (Swipe Up/Down)' : lang === 'zh-TW' ? '椒哥手勢 (上下滑動)' : '椒哥手势 (上下滑动)'}
                </h4>
                <p className={`text-[11px] sm:text-xs mt-0.5 leading-relaxed select-none ${theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lang === 'en' 
                    ? 'Swipe up to trigger hyper ascension! Swipe down for an explosive descent! Emits unique Jiao-particles to celebrate your speed.' 
                    : lang === 'zh-TW' 
                      ? '在棋盤上向上滑動觸發極速飛昇！向下滑動觸發重力爆擊！爆發專屬椒哥粒子特效。' 
                      : '在棋盘上向上滑动触发极速飞升！向下滑动触发重力爆击！爆发专属椒哥粒子特效。'}
                </p>
              </div>
            </div>
          </div>

          <hr className={theme === 'cyberpunk' ? 'border-[#ff0055]/15' : 'border-slate-100'} />

          {/* Tips */}
          <div className={`p-4 rounded-2xl flex items-start gap-2.5 border transition-colors ${
            theme === 'cyberpunk'
              ? 'bg-[#00f0ff]/10 border-[#00f0ff]/25 text-slate-200'
              : 'bg-blue-50/50 border border-blue-100 text-[#1e40af]'
          }`}>
            <HelpCircle className={`w-5 h-5 shrink-0 mt-0.5 ${theme === 'cyberpunk' ? 'text-[#00f0ff]' : 'text-[#4285F4]'}`} />
            <div className="text-[11px] sm:text-xs leading-relaxed font-sans select-none">
              {t.shortcutTip}
            </div>
          </div>

          {/* Master Jiao's Special Ruleset */}
          <div className={`p-4 rounded-2xl border flex flex-col gap-2 text-left font-mono text-[11px] transition-all duration-300 ${
            theme === 'cyberpunk'
              ? 'bg-[#0a0c16] border-[#ffea00]/30 text-slate-300'
              : 'bg-amber-500/10 border-amber-300 text-slate-700'
          }`}>
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[9.5px]">
              <span className="text-[#ffee00] animate-bounce">⚡</span>
              <span className={theme === 'cyberpunk' ? 'text-[#ffea00]' : 'text-amber-805'}>
                {lang === 'en' ? "MASTER JIAO'S EXTREME WARP DISCIPLINE" : lang === 'zh-TW' ? "椒哥極智抗爆排雷法典" : "椒哥极智抗爆排雷法典"}
              </span>
            </div>
            
            <ul className="list-disc pl-4 space-y-1 text-[10px] leading-relaxed">
              <li>
                <strong>{lang === 'en' ? "Dynamic 350ms anti-jitter clamp:" : "350ms 防顫避震解鎖:"}</strong>{" "}
                {lang === 'en' 
                  ? "Long-press delay on phones is crushed! Masterful speed keeps your fingers feeling totally unhindered." 
                  : "手機長按 350 ms 即可閃電插旗，超越蘋果原生時延阻滯，行雲流水！"}
              </li>
              <li>
                <strong>{lang === 'en' ? "Holographic Solver Option:" : "「椒哥助我」全相防爆:"}</strong>{" "}
                {lang === 'en'
                  ? "At any point, press 'Jiao Help ⚡' in the diagnostics console. Zero chance of exploding on that move."
                  : "陷於泥潭疑慮重重？點擊診斷台【椒哥助我】，主控程序強制不爆，替你秒鑿一個安全眼！"}
              </li>
              <li>
                <strong>{lang === 'en' ? "Pentatonic Chord combos:" : "五階和弦快捷開孔:"}</strong>{" "}
                {lang === 'en'
                  ? "Once adjacent flagging matches the block number, double-click to execute cascade sweepwaves!"
                  : "數字周圍「椒」字旗插滿時，按 F 鍵或雙擊數字格，催動五階和弦完美連鎖無傷掃除！"}
              </li>
              <li>
                <strong>{lang === 'en' ? "Secret Master Cheatcodes:" : "極智隱秘密碼配方:"}</strong>{" "}
                {lang === 'en'
                  ? "At any point, continuously type 'jiaoge' on your keyboard to activate Jiao's Celestial Radar and automatically flag 3 hidden mines! Type 'yuan' to trigger forbidden danger warnings!"
                  : lang === 'zh-TW'
                    ? "在遊戲任意時刻順序輸入拼音字母“jiaoge”，即可驚動【椒哥極智天眼通】為你秒增3個保命標旗！切記，若不慎敲擊违禁詞“yuan”將會驚擾袁能粒子引發紅色學業全麻警戒！"
                    : "在游戏任意时刻顺序输入拼音字母“jiaoge”，即可惊动【椒哥极智天眼通】为你秒增3个保命标旗！切记，若不慎敲击违禁词“yuan”将会惊扰袁能粒子引发红色学业全麻警戒！"}
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-end ${
          theme === 'cyberpunk' ? 'border-[#ff0055]/20 bg-[#ff0055]/5' : 'border-slate-100 bg-slate-50/30'
        }`}>
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl text-xs font-display font-bold transition-all cursor-pointer ${
              theme === 'cyberpunk'
                ? 'bg-[#ff0055] hover:bg-[#ff0077] text-white shadow-[0_0_12px_rgba(255,0,85,0.4)]'
                : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-md'
            }`}
            id="how-to-ok-btn"
          >
            {t.readyBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
