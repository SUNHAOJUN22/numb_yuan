import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';
import { Language } from '../utils/i18n';
import { playSound } from '../utils/audio';

export const AVATARS = ['👴', '🥷', '🧙‍♂️', '👨‍💻', '🦸‍♂️', '🥸', '🌶️', '👨‍🎓', '👑', '✨', '💥', '☢️'];

interface JiaoGeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: 'classic' | 'cyberpunk';
  soundEnabled: boolean;
  currentAvatar: string;
  onAvatarSelect: (avatar: string) => void;
}

export default function JiaoGeProfileModal({
  isOpen,
  onClose,
  lang,
  theme,
  soundEnabled,
  currentAvatar,
  onAvatarSelect
}: JiaoGeProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      {/* Absolute shadow overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Profile Modal frame */}
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className={`relative w-full max-w-sm rounded-[24px] border overflow-hidden shadow-2xl flex flex-col ${
          theme === 'cyberpunk'
            ? 'bg-[#0b101c]/95 border-amber-500/40 text-slate-100 shadow-[0_10px_40px_rgba(245,158,11,0.15)]'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${
          theme === 'cyberpunk' ? 'border-amber-500/20 bg-slate-900/50' : 'border-slate-100 bg-slate-50'
        }`}>
          <div>
            <h2 className="text-xl font-display font-black tracking-tight">{lang === 'en' ? 'Choose Avatar' : '選擇極智頭像'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{lang === 'en' ? 'This represents you on the Leaderboard.' : '在排行榜與全宇宙展示你的專屬身份。'}</p>
          </div>
          <button 
            onClick={() => {
              if (soundEnabled) playSound.click(true);
              onClose();
            }}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              theme === 'cyberpunk' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 pb-8">
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {AVATARS.map((emoji) => {
              const isSelected = emoji === currentAvatar;
              return (
                <button
                  key={emoji}
                  onClick={() => {
                    if (soundEnabled) playSound.click(true);
                    onAvatarSelect(emoji);
                  }}
                  className={`aspect-square relative rounded-2xl text-3xl sm:text-4xl flex items-center justify-center transition-all cursor-pointer ${
                    isSelected 
                      ? (theme === 'cyberpunk' ? 'bg-amber-500/20 border-2 border-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-amber-100 border-2 border-amber-500 scale-105 shadow-md')
                      : (theme === 'cyberpunk' ? 'bg-slate-900/60 border-2 border-transparent hover:border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-2 border-transparent hover:border-slate-200 hover:bg-slate-100 opacity-80 hover:opacity-100')
                  }`}
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    {emoji}
                  </motion.div>
                  {isSelected && (
                    <motion.div 
                      layoutId="avatar-check"
                      className="absolute -top-2 -right-2 bg-amber-500 rounded-full text-white shadow-md p-0.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
