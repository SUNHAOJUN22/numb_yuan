import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
  Volume2, 
  Copy, 
  Check, 
  Flame, 
  Compass, 
  Terminal,
  ShieldCheck,
  Award
} from 'lucide-react';
import { Language } from '../utils/i18n';
import mantras from '../data/jiao_mantras.json';
import { playSound } from '../utils/audio';

interface DailyMantraNotificationProps {
  lang: Language;
  theme: 'classic' | 'cyberpunk';
  soundEnabled: boolean;
}

export default function DailyMantraNotification({
  lang,
  theme,
  soundEnabled
}: DailyMantraNotificationProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [dayIndex, setDayIndex] = useState<number>(1);

  // Math-calculate Day-of-Year (1 to 365) to map the proper daily quote
  useEffect(() => {
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime() + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      const computedIndex = Math.min(365, Math.max(1, dayOfYear));
      setDayIndex(computedIndex);
    } catch (e) {
      setDayIndex(1);
    }

    // Check if user dismissed it today
    try {
      const todayString = new Date().toDateString();
      const lastDismissed = localStorage.getItem('jiao_mantra_last_dismiss_date');
      if (lastDismissed !== todayString) {
        // Automatically make visible on load
        const timer = setTimeout(() => {
          setIsVisible(true);
          if (soundEnabled) {
            // Soft subtle launch sound
            playSound.easterEgg(true);
          }
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      setIsVisible(true);
    }
  }, [soundEnabled]);

  const activeMantra = mantras[dayIndex - 1] || mantras[0];
  const mantraText = lang === 'en' ? activeMantra.textEn : activeMantra.textZh;

  // Handles copying daily quote to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mantraText);
      setCopied(true);
      if (soundEnabled) playSound.click(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Clipboard copy failed: ", err);
    }
  };

  // Uses SpeechSynthesis to read Chief Jiao's wisdom
  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    if (soundEnabled) playSound.cyberChyme(true);

    const utterance = new SpeechSynthesisUtterance(mantraText);
    utterance.lang = lang === 'en' ? 'en-US' : 'zh-CN';
    utterance.pitch = 1.05;
    utterance.rate = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith(lang === 'en' ? 'en' : 'zh'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleDismiss = () => {
    if (soundEnabled) playSound.click(true);
    setIsVisible(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // Record dismissal for today to keep home screen clean
    try {
      const todayString = new Date().toDateString();
      localStorage.setItem('jiao_mantra_last_dismiss_date', todayString);
    } catch (e) {}
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="jiao-daily-mantra-banner"
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 140 }}
        className={`w-full rounded-2xl border p-4 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 shadow-md ${
          theme === 'cyberpunk'
            ? 'bg-[#0b101c]/95 border-amber-500/30 text-slate-100 shadow-[0_0_20px_rgba(245,158,11,0.08)]'
            : 'bg-gradient-to-r from-amber-50/95 to-amber-100/95 border-amber-250 text-amber-900'
        }`}
      >
        {/* Abstract graphic layout highlights */}
        <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-amber-500/5 blur-xl pointer-events-none" />

        <div className="flex items-start gap-3.5 flex-1 select-none">
          {/* Avatar badge for Chief Jiao Ge */}
          <div className={`p-2.5 rounded-xl shrink-0 border relative ${
            theme === 'cyberpunk'
              ? 'bg-amber-400/10 border-amber-400/40 text-amber-400'
              : 'bg-white border-amber-300 text-amber-700 shadow-xs'
          }`}>
            <span>👴</span>
            <span className="absolute -bottom-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          {/* Texts content area */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs font-display font-black tracking-widest uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500 shrink-0" />
                <span>{lang === 'en' ? `DAILY JIAO-MANTRA • Day ${dayIndex}/365` : `椒哥每日極智心法 • 第 ${dayIndex}/365 天`}</span>
              </h4>

              <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.2 rounded-md border ${
                theme === 'cyberpunk'
                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5'
                  : 'border-emerald-600/30 text-emerald-800 bg-emerald-50'
              }`}>
                {theme === 'cyberpunk' ? 'CORE_SECURE' : 'MASTER APPROVED'}
              </span>
            </div>

            <p className={`text-xs leading-relaxed font-semibold transition-all ${
              theme === 'cyberpunk' ? 'text-slate-200' : 'text-amber-950 font-sans'
            }`}>
              “ {mantraText} ”
            </p>
          </div>
        </div>

        {/* Dynamic button control bar */}
        <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`p-2 rounded-xl border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              theme === 'cyberpunk'
                ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-amber-400 hover:border-amber-400/40'
                : 'border-amber-200 bg-white/70 hover:bg-white text-amber-800 hover:border-amber-400'
            }`}
            title={lang === 'en' ? 'Copy Mantra' : '複製心法金句'}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Speech synthesizer speak button */}
          <button
            onClick={handleSpeak}
            className={`p-2 rounded-xl border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              theme === 'cyberpunk'
                ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/40'
                : 'border-amber-200 bg-white/70 hover:bg-white text-amber-800 hover:border-amber-400'
            } ${isSpeaking ? 'animate-bounce text-emerald-500 border-emerald-500/40' : ''}`}
            title={lang === 'en' ? 'Listen (TTS)' : '朗读心法 (中英)'}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className={`py-2 px-3.5 rounded-xl border font-display font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1 ${
              theme === 'cyberpunk'
                ? 'border-slate-850 bg-slate-900 text-slate-300 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500'
                : 'border-amber-250 bg-amber-500 text-amber-950 font-bold hover:bg-amber-600'
            }`}
          >
            <X className="w-3 h-3" />
            <span>{lang === 'en' ? 'Acknowledge' : '領悟心法'}</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
