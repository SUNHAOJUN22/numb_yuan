import React from 'react';
import { motion } from 'motion/react';
import { Zap, Activity, AlertTriangle } from 'lucide-react';

interface NumbnessMeterProps {
  jitterAmt: number;
  lang: 'zh-CN' | 'zh-TW' | 'en';
  theme?: 'classic' | 'cyberpunk';
  onTriggerTestBurst?: () => void;
}

export default function NumbnessMeter({ 
  jitterAmt, 
  lang, 
  theme = 'classic',
  onTriggerTestBurst
}: NumbnessMeterProps) {
  const maxCap = 15;
  const clampedAmt = Math.min(jitterAmt, maxCap);
  
  // Status labels dictionary
  const labels = {
    'en': {
      title: 'Brain Numbness',
      subtitle: 'Nao Ma Le Gauge',
      states: [
        { limit: 0, text: 'Ultra Conscious', color: 'text-emerald-400' },
        { limit: 3, text: 'Mild Numbness', color: 'text-amber-400' },
        { limit: 7, text: 'Medium Freeze', color: 'text-orange-400 font-semibold' },
        { limit: 12, text: 'Severe Paralysis', color: 'text-red-400 font-bold' },
        { limit: Infinity, text: 'COMPLETELY NUMB!', color: 'text-fuchsia-500 font-black animate-pulse' }
      ]
    },
    'zh-CN': {
      title: '脑麻检测仪',
      subtitle: 'Jitter 强度',
      states: [
        { limit: 0, text: '极其清醒', color: 'text-emerald-400' },
        { limit: 3, text: '开始微麻', color: 'text-amber-400' },
        { limit: 7, text: '中度脑麻', color: 'text-orange-400 font-semibold' },
        { limit: 12, text: '重度麻痹', color: 'text-red-400 font-bold animate-pulse' },
        { limit: Infinity, text: '彻底脑麻了！', color: 'text-fuchsia-500 font-black animate-bounce' }
      ]
    },
    'zh-TW': {
      title: '腦麻檢測儀',
      subtitle: 'Jitter 強度',
      states: [
        { limit: 0, text: '極其清醒', color: 'text-emerald-400' },
        { limit: 3, text: '開始微麻', color: 'text-amber-400' },
        { limit: 7, text: '中度腦麻', color: 'text-orange-400 font-semibold' },
        { limit: 12, text: '重度麻痹', color: 'text-red-400 font-bold animate-pulse' },
        { limit: Infinity, text: '徹底腦麻了！', color: 'text-fuchsia-500 font-black animate-bounce' }
      ]
    }
  };

  const currentDict = labels[lang] || labels['zh-CN'];
  
  // Determine text based on value
  const getStatusTextAndColor = (val: number) => {
    for (const state of currentDict.states) {
      if (val <= state.limit) {
        return { text: state.text, color: state.color };
      }
    }
    return { text: currentDict.states[0].text, color: currentDict.states[0].color };
  };

  const { text: statusText, color: statusColor } = getStatusTextAndColor(jitterAmt);
  const isCyber = theme === 'cyberpunk';

  // Render horizontal/vertical indicators depending on design
  return (
    <div
      id="nao-ma-le-meter-container"
      className={`flex flex-col gap-2 p-3.5 rounded-2xl transition-all duration-300 ${
        isCyber
          ? 'bg-[#0f111a]/80 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
          : 'bg-slate-900/90 border border-slate-700/50 shadow-lg'
      } self-stretch lg:w-44 lg:justify-between h-auto lg:h-full`}
    >
      {/* Title & Status Indicator */}
      <div className="flex lg:flex-col items-start justify-between gap-1.5 lg:gap-2">
        <div className="flex items-center gap-1.5">
          {jitterAmt > 7 ? (
            <AlertTriangle className={`w-4 h-4 text-rose-500 ${jitterAmt > 12 ? 'animate-bounce' : 'animate-pulse'}`} />
          ) : (
            <Zap className={`w-4 h-4 text-cyan-400 ${jitterAmt > 0 ? 'animate-pulse' : ''}`} />
          )}
          <div className="flex flex-col">
            <span className="text-xs font-display font-bold tracking-tight text-slate-200">
              {currentDict.title}
            </span>
            <span className="text-[10px] opacity-60 text-slate-400 font-mono">
              {currentDict.subtitle}
            </span>
          </div>
        </div>

        {/* Numerals display */}
        <div className="flex items-baseline gap-1 lg:self-center lg:my-3">
          <span className={`text-2xl font-mono font-extrabold ${
            jitterAmt === 0 ? 'text-slate-400' : isCyber ? 'text-cyan-400 drop-shadow-[0_0_6px_#00f0ff]' : 'text-amber-400'
          }`}>
            {jitterAmt}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">/ {maxCap}</span>
        </div>
      </div>

      {/* Visual Bar Segment Gauge */}
      <div className="flex-1 flex lg:flex-col items-center gap-1.5 my-2 lg:my-4 w-full">
        {/* Horizontal segments on mobile, Vertical on Desktop */}
        <div className="flex-1 lg:flex-none flex lg:flex-col-reverse items-stretch justify-between gap-1 w-full h-4 lg:h-44">
          {Array.from({ length: maxCap }).map((_, idx) => {
            const segmentVal = idx + 1;
            const isActive = segmentVal <= clampedAmt;
            
            // Choose colors based on segment level and theme
            let activeColorClass = '';
            if (isActive) {
              if (isCyber) {
                if (segmentVal <= 4) activeColorClass = 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]';
                else if (segmentVal <= 9) activeColorClass = 'bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.5)]';
                else activeColorClass = 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse';
              } else {
                if (segmentVal <= 4) activeColorClass = 'bg-emerald-500';
                else if (segmentVal <= 9) activeColorClass = 'bg-amber-500';
                else activeColorClass = 'bg-rose-500 animate-pulse';
              }
            }

            return (
              <div
                key={idx}
                className={`flex-1 rounded-sm transition-all duration-300 ${
                  isActive
                    ? activeColorClass
                    : isCyber
                    ? 'bg-slate-950/80 border border-slate-800/60'
                    : 'bg-slate-800/80'
                }`}
                style={{
                  // Enhance glowing effect dynamically inside the style
                  opacity: isActive ? 0.35 + (segmentVal / maxCap) * 0.65 : 0.25
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Dynamic textual feedback based on amount */}
      <div className="text-center font-sans text-[10px] border-t border-slate-800/80 pt-2 lg:mt-auto">
        <div className="opacity-50 text-slate-400 mb-0.5">
          {lang === 'en' ? 'EFFECT:' : '麻木感:'}
        </div>
        <div className={`transition-all duration-300 select-none ${statusColor}`}>
          {statusText}
        </div>
      </div>

      {onTriggerTestBurst && (
        <button
          onClick={onTriggerTestBurst}
          disabled={jitterAmt > 0}
          className={`mt-2 w-full py-1.5 px-3 rounded-lg text-xs font-mono font-medium transition-all duration-300 flex items-center justify-center gap-1.5 ${
            jitterAmt > 0 
              ? 'bg-red-950/40 text-red-400 border border-red-900/30 cursor-not-allowed select-none'
              : isCyber
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] active:scale-95'
              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-400/40 active:scale-95'
          }`}
        >
          <Activity className={`w-3.5 h-3.5 ${jitterAmt > 0 ? 'animate-spin' : ''}`} />
          {jitterAmt > 0 
            ? (lang === 'en' ? 'BURSTING...' : lang === 'zh-TW' ? '測試中...' : '测试中...') 
            : (lang === 'en' ? 'TEST BURST' : lang === 'zh-TW' ? '測試暴走' : '测试暴走')}
        </button>
      )}
    </div>
  );
}
