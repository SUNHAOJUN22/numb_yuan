import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Lock, Sparkles, Award, ShieldAlert, CheckCircle2, Zap } from 'lucide-react';
import { Language } from '../utils/i18n';
import { playSound } from '../utils/audio';

interface Achievement {
  id: string;
  titleZhCN: string;
  titleZhTW: string;
  titleEn: string;
  descZhCN: string;
  descZhTW: string;
  descEn: string;
  icon: string;
  color: string;
}

export const JIAO_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'chord_synth',
    titleZhCN: '五阶和弦主控官 🎹',
    titleZhTW: '五階和弦主控官 🎹',
    titleEn: 'Pentatonic Maestro 🎹',
    descZhCN: '在椒哥极智音色音调板中弹奏合成器达到 10 次以上，让声学脉冲全频共鸣！',
    descZhTW: '在椒哥極智音色音調板中彈奏合成器達到 10 次以上，讓聲學脈衝全頻共鳴！',
    descEn: 'Trigger the pentatonic synthesizer on the bonus soundboard over 10 times.',
    icon: '🎹',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'qte_defuse',
    titleZhCN: '防爆电容拯救者 🛡️',
    titleZhTW: '防爆電容拯救者 🛡️',
    titleEn: 'Capacitor Savior 🛡️',
    descZhCN: '精准操作！成功通过 QTE 避震自愈系统，在袁能爆发的 3 秒内化险为夷标记安全！',
    descZhTW: '精準操作！成功通過 QTE 避震自癒系統，在袁能爆發的 3 秒內化險為夷標記安全！',
    descEn: 'Successfully complete a QTE self-healing defusal within the 3-second limit.',
    icon: '🛡️',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    id: 'degree_unlocked',
    titleZhCN: '华宇皇家特许学位 🎓',
    titleZhTW: '華宇皇家特許學位 🎓',
    titleEn: 'Royal Charter Degree 🎓',
    descZhCN: '赢得雷区游戏的胜利，获得极智主考官椒哥签发的本科学位证书！',
    descZhTW: '贏得雷區遊戲的勝利，獲得極智主考官椒哥簽發的本科學位證書！',
    descEn: 'Win a game and unlock the graduation degree certificate approved by Master Jiao.',
    icon: '🎓',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'cheat_radar',
    titleZhCN: '极智天眼通先驱 ⚡',
    titleZhTW: '極智天眼通先驅 ⚡',
    titleEn: 'Celestial Radar Pioneer ⚡',
    descZhCN: '输入极智秘籍“jiaoge”解锁天眼扫描，自动标记隐藏在地底的“袁”雷。',
    descZhTW: '輸入極智秘籍“jiaoge”解鎖天眼掃描，自動標記隱藏在地底的「袁」雷。',
    descEn: 'Type the master cheat code "jiaoge" to trigger the celestial mine radar.',
    icon: '⚡',
    color: 'from-[#00f0ff] to-blue-500',
  },
  {
    id: 'cheat_naomale',
    titleZhCN: '退散，袁式全麻！💀',
    titleZhTW: '退散，袁式全麻！💀',
    titleEn: 'Say Nao Ma Le! 💀',
    descZhCN: '输入“naomale”触发终极红色警报结界，全方位抵御暴雷全麻！',
    descZhTW: '輸入“naomale”觸發終極紅色警報結界，全方位抵禦暴雷全麻！',
    descEn: 'Type the code "naomale" to unleash the red protective warning screen.',
    icon: '💀',
    color: 'from-[#ff0055] to-red-500',
  },
  {
    id: 'cheat_cart',
    titleZhCN: '朝阳独轮车队指挥官 🛒',
    titleZhTW: '朝陽獨輪車隊指揮官 🛒',
    titleEn: 'Chaoyang Dispatcher 🛒',
    descZhCN: '输入秘籍“chaoyang”或“cart”，召唤极智物流手推车车队火速驰援。',
    descZhTW: '輸入秘籍“chaoyang”或“cart”，召喚極智物流手推車車隊火速馳援。',
    descEn: 'Type "chaoyang" or "cart" to request full logistics handcart support.',
    icon: '🛒',
    color: 'from-[#ffee00] to-orange-500',
  },
];

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme?: 'classic' | 'cyberpunk';
  soundEnabled: boolean;
}

export default function AchievementsModal({
  isOpen,
  onClose,
  lang,
  theme = 'classic',
  soundEnabled,
}: AchievementsModalProps) {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isOpen) {
      playSound.easterEgg(soundEnabled);
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 500);

      // Load unlocked items from localStorage
      try {
        const stored = localStorage.getItem('jiaoge_unlocked_achievements');
        if (stored) {
          setUnlockedIds(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load achievements:', e);
      }

      return () => clearTimeout(timer);
    }
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  const getTitle = () => {
    if (lang === 'en') return "MASTER JIAOGE'S SCHOLASTIC ACHIEVEMENTS WALL";
    if (lang === 'zh-TW') return "椒哥極智皇家學術成就里程碑牆 🏆";
    return "椒哥极智皇家学术成就里程碑墙 🏆";
  };

  const getSubTitle = () => {
    if (lang === 'en') return "Track your micro-control accomplishments under direct scholastic oversight";
    if (lang === 'zh-TW') return "在極智大師椒哥的實時學務聯檢下，紀錄你的神級微操高光時刻";
    return "在极智大师椒哥的实时学务联检下，记录你的神级微操高光时刻";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#06070d]/75 backdrop-blur-md p-4 no-select animate-fade-in touch-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        className={`w-full max-w-xl text-white rounded-3xl relative p-6 max-h-[85vh] overflow-y-auto flex flex-col gap-4 transition-all duration-350 ${
          theme === 'cyberpunk'
            ? 'bg-[#0f111a]/95 border-2 border-[#9d4edd] shadow-[0_0_30px_rgba(157,78,221,0.3)]'
            : 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 border-2 border-amber-400 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-all cursor-pointer ${
            theme === 'cyberpunk'
              ? 'text-slate-400 hover:text-[#9d4edd] bg-slate-800/80 hover:bg-[#9d4edd]/10'
              : 'text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="text-center mt-2 flex flex-col items-center">
          <motion.div
            animate={pulse ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-slate-900 border-2 select-none mb-3 ${
              theme === 'cyberpunk'
                ? 'bg-gradient-to-br from-[#9d4edd] to-[#ff00bb] text-[#00f0ff] border-[#ff00bb]/40 shadow-[0_0_15px_#9d4edd]'
                : 'bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 border-white/20'
            }`}
          >
            <Trophy className="w-6 h-6" />
          </motion.div>
          <h2 className={`font-display font-black text-base md:text-lg tracking-tight select-none ${
            theme === 'cyberpunk' ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#ff00ee]' : 'text-white'
          }`}>
            {getTitle()}
          </h2>
          <p className="text-[10px] md:text-xs text-slate-400 max-w-md mx-auto mt-1 select-none font-sans">
            {getSubTitle()}
          </p>
        </div>

        {/* Core Achievements List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 overflow-y-auto pr-1">
          {JIAO_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedIds.includes(ach.id);
            const title = lang === 'en' ? ach.titleEn : lang === 'zh-TW' ? ach.titleZhTW : ach.titleZhCN;
            const desc = lang === 'en' ? ach.descEn : lang === 'zh-TW' ? ach.descZhTW : ach.descZhCN;

            return (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border transition-all duration-300 relative flex items-start gap-3 overflow-hidden ${
                  isUnlocked
                    ? theme === 'cyberpunk'
                      ? 'bg-gradient-to-br from-[#120f26]/80 to-[#07131b]/90 border-[#00f0ff]/30 shadow-[0_0_10px_rgba(0,240,255,0.06)]'
                      : 'bg-slate-800/40 border-amber-500/20'
                    : 'opacity-50 bg-[#07080f]/90 border-slate-800'
                }`}
              >
                {/* Background colored abstract gradient for unlocked items */}
                {isUnlocked && (
                  <div className={`absolute bottom-[-20%] right-[-10%] w-16 h-16 rounded-full blur-[20px] opacity-15 bg-gradient-to-br ${ach.color}`} />
                )}

                {/* Left Mini Emoji Shield Indicator */}
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border text-lg select-none relative ${
                  isUnlocked
                    ? 'bg-slate-900/60 border-slate-700/40'
                    : 'bg-black/40 border-slate-800 text-slate-600'
                }`}>
                  {isUnlocked ? (
                    ach.icon
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600 animate-pulse" />
                  )}

                  {/* Tiny check mark badge */}
                  {isUnlocked && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm border border-slate-950">
                      <CheckCircle2 className="w-2.5 h-2.5 stroke-[3px]" />
                    </div>
                  )}
                </div>

                {/* Right Text Description */}
                <div className="flex flex-col text-left gap-0.5 leading-normal">
                  <span className={`text-[11px] font-black font-display tracking-tight leading-normal ${
                    isUnlocked 
                      ? theme === 'cyberpunk' ? 'text-[#00f0ff]' : 'text-slate-100'
                      : 'text-slate-500'
                  }`}>
                    {title}
                  </span>
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-sans leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Audit Disclaimer stamp at bottom */}
        <div className={`text-center py-2.5 px-4 rounded-xl border border-dashed text-[10px] font-mono leading-relaxed select-none mt-2 ${
          theme === 'cyberpunk' 
            ? 'bg-[#150a22]/40 border-[#ff00bb]/25 text-[#ff00bb]' 
            : 'bg-amber-500/5 border-amber-500/20 text-amber-300/80'
        }`}>
          {lang === 'en'
            ? "⚠️ SCHOLASTIC INTEGRITY: Accomplishments are hashed directly onto Master Jiao's local Web Storage instance. Removing app data triggers academic delayed graduation."
            : lang === 'zh-TW'
              ? "⚠️ 學術誠信背書：椒哥極智董事會特批，所有微操成就直接寫入本地區塊鏈明細。清除應用程式快取將視為自動退學延修！"
              : "⚠️ 学术诚信背书：椒哥极智董事会特批，所有微操成就直接写入本地区块链明细。清除应用程序缓存将视为自动退学延修！"}
        </div>
      </motion.div>
    </div>
  );
}

// Global utility helper to trigger an achievement and display a notification or store it
export function unlockJiaoAchievement(id: string): string[] {
  try {
    const key = 'jiaoge_unlocked_achievements';
    const stored = localStorage.getItem(key);
    let unlocked: string[] = stored ? JSON.parse(stored) : [];
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      localStorage.setItem(key, JSON.stringify(unlocked));
      return unlocked;
    }
  } catch (e) {
    console.error('Failed to storage unlock event:', e);
  }
  return [];
}
