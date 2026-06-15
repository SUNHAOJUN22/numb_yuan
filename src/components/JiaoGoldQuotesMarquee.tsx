import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, ShieldAlert, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { Language } from '../utils/i18n';

interface JiaoGoldQuotesMarqueeProps {
  lang: Language;
  theme: 'classic' | 'cyberpunk';
}

export default function JiaoGoldQuotesMarquee({ lang, theme }: JiaoGoldQuotesMarqueeProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const quotesMap = {
    'zh-CN': [
      { text: "极智核心：极速 350ms 静止长按自主防抖，跳过 iOS 触控双击缩放，防爆率提升 300%！📱", category: "TECH" },
      { text: "学业警告：雷区深藏袁能粒子，触雷即刻产生‘袁式全麻’，本科学位证直接延修！💀", category: "WARN" },
      { text: "自愈科技：声音丢失？椒哥音频热插拔技术已自动监听首发触控，重置苹果 Web Audio 上下文。🔊", category: "AUDIO" },
      { text: "和弦连击：双击已标记足够的数字格，可激活 Cascade 物理级五阶和弦连锁开区！🎹", category: "SWEEP" },
      { text: "极智心法：手速决定上限，微操决定命运。大声高唱五阶和弦，挖起第一铲百分百安全！👑", category: "MANTRA" },
      { text: "椒哥医嘱：千万不要逼我亲自推朝阳的独轮手推车去帮你，赶紧打起精神，用心微操！🛒", category: "DRAMA" },
      { text: "防爆优化：全盘采用拓扑消抖自适应格点，完美兼容电脑鼠标、平板手写笔、手机触屏。🛡️", category: "HARDWARE" }
    ],
    'zh-TW': [
      { text: "極智核心：極速 350ms 靜止長按自主防抖，跳過 iOS 觸控雙擊縮放，防爆率提升 300%！📱", category: "TECH" },
      { text: "學業警告：雷區深藏袁能粒子，觸雷即刻產生‘袁式全麻’，本科學位證直接延修！💀", category: "WARN" },
      { text: "自癒科技：聲音丟失？椒哥音頻熱插拔技術已自動監聽首發觸控，重置蘋果 Web Audio 上下文。🔊", category: "AUDIO" },
      { text: "和弦連擊：雙擊已標記足夠的數字格，可激活 Cascade 物理級五階和弦連鎖開區！🎹", category: "SWEEP" },
      { text: "極智心法：手速決定上限，微操決定命運。大聲高唱五階和弦，挖起第一鏟百分百安全！👑", category: "MANTRA" },
      { text: "椒哥醫囑：千萬不要逼我親自推朝陽的獨輪手推車去幫你，趕緊打起精神，用心微操！🛒", category: "DRAMA" },
      { text: "防爆優化：全盤採用拓撲消抖自適應格點，完美兼容電腦滑鼠、平板手寫筆、手機觸屏。🛡️", category: "HARDWARE" }
    ],
    'en': [
      { text: "Core Hack: Static 350ms Smart Long-press completely bypasses iOS Safari double-tap zoom latency! 📱", category: "TECH" },
      { text: "Degree Alert: Grid is loaded with high-energy Yuan particles. Exploding leads to delayed graduation! 💀", category: "WARN" },
      { text: "Refresher Aud: Dynamic Apple Audio Context recovery resolves static silence on older iPhones! 🔊", category: "AUDIO" },
      { text: "Chord Combo: Double-click numerical blocks with complete flags to deploy cascading pentatonic sweeps! 🎹", category: "SWEEP" },
      { text: "Golden Mantra: Speed dictates limits, but master micro-controls decide destiny. Hum a chord for luck! 👑", category: "MANTRA" },
      { text: "Tactical Call: Do not force me to direct the Chaoyang cargo cart to your position. Focus on details! 🛒", category: "DRAMA" },
      { text: "Hardened Grid: Topologically optimized cell layout supports fingers, modern mice, and stylus inputs. 🛡️", category: "HARDWARE" }
    ]
  };

  const activeQuotes = quotesMap[lang] || quotesMap['en'];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeQuotes.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [activeQuotes]);

  const activeQuote = activeQuotes[currentIdx];

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'WARN':
        return theme === 'cyberpunk' 
          ? 'bg-[#ff0055]/15 text-[#ff0055] border-[#ff0055]/30' 
          : 'bg-red-50 text-red-600 border-red-200';
      case 'TECH':
      case 'HARDWARE':
        return theme === 'cyberpunk'
          ? 'bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/30'
          : 'bg-blue-50 text-blue-600 border-blue-200';
      case 'AUDIO':
      case 'SWEEP':
        return theme === 'cyberpunk'
          ? 'bg-[#9d4edd]/15 text-[#9d4edd] border-[#9d4edd]/30'
          : 'bg-purple-50 text-purple-600 border-purple-200';
      case 'MANTRA':
      case 'DRAMA':
      default:
        return theme === 'cyberpunk'
          ? 'bg-[#ffea00]/15 text-[#ffea00] border-[#ffea00]/30'
          : 'bg-amber-50 text-amber-600 border-amber-200';
    }
  };

  return (
    <div 
      id="jiaoge-quotes-ticker"
      className={`w-full rounded-2xl border p-3 flex items-center md:items-start gap-3 transition-all duration-300 ${
        theme === 'cyberpunk'
          ? 'bg-[#0b0d18]/90 border-[#9d4edd]/20 shadow-[0_0_12px_rgba(157,78,221,0.06)] text-slate-300'
          : 'bg-white border-slate-200 text-slate-700 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-1.5 shrink-0 self-center">
        <div className={`p-1.5 rounded-xl border ${
          theme === 'cyberpunk' ? 'bg-[#ffea00]/10 border-[#ffea00]/30' : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          <Zap className={`w-3.5 h-3.5 ${theme === 'cyberpunk' ? 'text-[#ffea00] animate-pulse' : 'text-amber-500 animate-pulse'}`} />
        </div>
        <span className={`text-[9px] font-mono font-black uppercase tracking-wider hidden sm:inline ${
          theme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {lang === 'en' ? "MASTERTIP //" : "极智大师小贴士 //"}
        </span>
      </div>

      <div className="flex-1 overflow-hidden relative min-h-[30px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="flex items-center flex-wrap gap-2 text-left"
          >
            <span className={`px-2 py-0.5 rounded-md text-[8px] font-mono font-black border uppercase tracking-wider shrink-0 ${getCategoryBadge(activeQuote.category)}`}>
              {activeQuote.category}
            </span>
            <span className="text-[10px] sm:text-xs font-mono font-bold leading-normal select-none">
              {activeQuote.text}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={() => setCurrentIdx((prev) => (prev + 1) % activeQuotes.length)}
        className={`p-1 rounded-lg border transition-colors self-center shrink-0 hover:scale-105 active:scale-95 cursor-pointer ${
          theme === 'cyberpunk'
            ? 'border-slate-800 bg-slate-900/50 text-[#00f0ff] hover:text-white'
            : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800'
        }`}
        title="Next Tip"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
