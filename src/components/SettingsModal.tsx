import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings2, Volume2, VolumeX } from 'lucide-react';
import { Language } from '../utils/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: 'classic' | 'cyberpunk';
  masterVolume: number;
  setMasterVolume: (val: number) => void;
  intensity: number;
  setIntensity: (val: number | ((prev: number) => number)) => void;
  timeAttackMode: boolean;
  setTimeAttackMode: (val: boolean) => void;
  gameEndingSoundsEnabled: boolean;
  setGameEndingSoundsEnabled: (val: boolean) => void;
  naoMaLeEnabled: boolean;
  setNaoMaLeEnabled: (val: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  lang,
  theme,
  masterVolume,
  setMasterVolume,
  intensity,
  setIntensity,
  timeAttackMode,
  setTimeAttackMode,
  gameEndingSoundsEnabled,
  setGameEndingSoundsEnabled,
  naoMaLeEnabled,
  setNaoMaLeEnabled
}: SettingsModalProps) {
  if (!isOpen) return null;

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setIntensity(val);
    try {
      localStorage.setItem('jiaoge_aura_intensity', String(val));
    } catch {}
  };

  const isCyberpunk = theme === 'cyberpunk';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={`absolute inset-0 ${isCyberpunk ? 'bg-[#080a14]/90 backdrop-blur-md' : 'bg-slate-900/40 backdrop-blur-sm'}`}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${
            isCyberpunk
              ? 'bg-[#151726]/95 border-[#ff0055]/40 shadow-[0_0_30px_rgba(255,0,85,0.2)] text-white'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              isCyberpunk
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${
              isCyberpunk ? 'bg-[#ff0055]/20 text-[#ff0055]' : 'bg-slate-100 text-slate-600'
            }`}>
              <Settings2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-display font-black tracking-tight uppercase">
              {lang === 'en' ? 'Tactical Settings' : '系统参数调整'}
            </h2>
          </div>

          <div className={`p-4 rounded-xl border ${
            isCyberpunk ? 'bg-[#080a14] border-[#00f0ff]/20' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <label 
                htmlFor="aura-intensity-slider" 
                className={`font-semibold text-sm ${isCyberpunk ? 'text-[#00f0ff]' : 'text-slate-700'}`}
              >
                {lang === 'en' ? 'Jiao-Aura Intensity' : '极智等离子光环强度'}
              </label>
              <span className={`text-xs font-mono font-bold px-2 py-1 rounded bg-black/10 ${
                isCyberpunk ? 'text-[#ffea00]' : 'text-slate-600'
              }`}>
                {intensity}%
              </span>
            </div>
            
            <input
              id="aura-intensity-slider"
              type="range"
              min="0"
              max="200"
              value={intensity}
              onChange={handleIntensityChange}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                isCyberpunk 
                  ? 'bg-slate-800 accent-[#ff0055]' 
                  : 'bg-slate-200 accent-amber-500'
              }`}
            />
            
            <p className={`text-xs mt-3 ${isCyberpunk ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'en' 
                ? 'Adjust the vibrancy of the pulsing streak colors on the board.' 
                : '微调大扫荡连胜光环的等离子滤镜视觉释放强度。'}
            </p>
          </div>

          <div className={`p-4 rounded-xl border mt-4 ${
            isCyberpunk ? 'bg-[#080a14] border-[#00f0ff]/20' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex flex-col pr-4">
                <span className={`font-semibold text-sm ${isCyberpunk ? 'text-[#00f0ff]' : 'text-slate-700'}`}>
                  {lang === 'en' ? '⚡ Time Attack' : '⚡ 极智限时挑战'}
                </span>
                <span className={`text-[10px] mt-1 leading-normal ${isCyberpunk ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lang === 'en' 
                    ? 'Adds a 60-second countdown; win before time expires or face immediate defeat!' 
                    : '开启 60 秒限时倒计时，在倒计时结束前扫雷获胜，否则将被引爆。'}
                </span>
              </div>
              
              <button
                id="time-attack-toggle"
                onClick={() => setTimeAttackMode(!timeAttackMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  timeAttackMode
                    ? isCyberpunk ? 'bg-[#ff0055]' : 'bg-amber-500'
                    : 'bg-slate-300'
                }`}
                aria-label="Toggle Time Attack"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    timeAttackMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className={`p-4 rounded-xl border mt-4 ${
            isCyberpunk ? 'bg-[#080a14] border-[#00f0ff]/20' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex flex-col pr-4">
                <span className={`font-semibold text-sm ${isCyberpunk ? 'text-[#00f0ff]' : 'text-slate-700'}`}>
                  {lang === 'en' ? '😵 Nao Ma Le Mode (Jitter)' : '😵 闹麻了模式'}
                </span>
                <span className={`text-[10px] mt-1 leading-normal ${isCyberpunk ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lang === 'en' 
                    ? 'Dynamically introduces a jitter effect to the game board every 10s of gameplay.' 
                    : '游玩时间每经过 10 秒，扫雷棋盘就会发生动态抖动，让你感受到什么是“闹麻了”。'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNaoMaLeEnabled(!naoMaLeEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  naoMaLeEnabled
                    ? isCyberpunk ? 'bg-[#ff0055]' : 'bg-amber-500'
                    : 'bg-slate-300'
                }`}
                aria-label="Toggle Nao Ma Le Mode"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    naoMaLeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className={`p-4 rounded-xl border mt-4 ${
            isCyberpunk ? 'bg-[#080a14] border-[#00f0ff]/20' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <label 
                htmlFor="master-volume-slider" 
                className={`font-semibold text-sm ${isCyberpunk ? 'text-[#00f0ff]' : 'text-slate-700'}`}
              >
                {lang === 'en' ? 'Master Volume' : '主音量控制'}
              </label>
              <span className={`text-xs font-mono font-bold px-2 py-1 rounded bg-black/10 ${
                isCyberpunk ? 'text-[#ffea00]' : 'text-slate-600'
              }`}>
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
            
            <input
              id="master-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                isCyberpunk 
                  ? 'bg-slate-800 accent-[#00f0ff]' 
                  : 'bg-slate-200 accent-amber-500'
              }`}
            />
            
            <p className={`text-xs mt-3 ${isCyberpunk ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'en' 
                ? 'Adjust the general loudness of all game sound effects independently.' 
                : '独立调整所有游戏音效的基础音量。'}
            </p>
          </div>

          <div className={`p-4 rounded-xl border mt-4 ${
            isCyberpunk ? 'bg-[#080a14] border-[#00f0ff]/20' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex flex-col pr-4">
                <span className={`font-semibold text-sm flex items-center gap-2 ${isCyberpunk ? 'text-[#00f0ff]' : 'text-slate-700'}`}>
                  {gameEndingSoundsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  {lang === 'en' ? 'Victory & Defeat Sounds' : '胜负结算音效'}
                </span>
                <span className={`text-[10px] mt-1 leading-normal ${isCyberpunk ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lang === 'en' 
                    ? 'Play grand fanfare or explosion sounds when a game concludes.' 
                    : '游戏结束时播放胜利或爆炸的音效，关闭后保留基础点击声。'}
                </span>
              </div>
              
              <button
                onClick={() => setGameEndingSoundsEnabled(!gameEndingSoundsEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  gameEndingSoundsEnabled
                    ? isCyberpunk ? 'bg-[#ff0055]' : 'bg-amber-500'
                    : 'bg-slate-300'
                }`}
                aria-label="Toggle Game Ending Sounds"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    gameEndingSoundsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
