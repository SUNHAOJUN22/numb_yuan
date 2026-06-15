export const playJiaoSpeech = (text: string, lang: 'en' | 'zh-CN' | 'zh-TW', soundEnabled: boolean) => {
  if (typeof window === 'undefined' || !window.speechSynthesis || !soundEnabled) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set language
  if (lang === 'zh-CN') utterance.lang = 'zh-CN';
  else if (lang === 'zh-TW') utterance.lang = 'zh-TW';
  else utterance.lang = 'en-US';

  // Pitch and rate for Jiao Ge (robotic/energetic)
  utterance.pitch = 1.1;
  utterance.rate = 1.05;
  utterance.volume = 1;

  // Try to find a good voice (Mandarin for zh, English for en)
  const voices = window.speechSynthesis.getVoices();
  const targetVoices = voices.filter(v => 
    v.lang.startsWith(utterance.lang) || 
    (utterance.lang.startsWith('zh') && v.lang.startsWith('zh'))
  );

  // Pick a male voice if available and requested (heuristic based on name)
  const jiaoVoice = targetVoices.find(v => v.name.toLowerCase().includes('huihui') || v.name.toLowerCase().includes('yaoyao') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('male')) || targetVoices[0] || voices[0];
  
  if (jiaoVoice) {
    utterance.voice = jiaoVoice;
  }

  window.speechSynthesis.speak(utterance);
};

// Catchphrases based on milestone types
export const getJiaoCatchphrase = (type: 'victory' | 'streak_5' | 'streak_10' | 'expert_clear', lang: 'en' | 'zh-CN' | 'zh-TW'): string => {
  const phrases = {
    'en': {
      'victory': [
        "Flawless execution! Jiao Master is pleased.",
        "Aesthetic perfection. The mines tremble before you.",
        "Calculated and majestic. Simply brilliant."
      ],
      'streak_5': [
        "Five wins in a row! The focus is unparalleled!",
        "A quintuple flow state achieved! Keep ascending!",
        "Unstoppable momentum! Jiao particles are at maximum!"
      ],
      'streak_10': [
        "Ten victories! You have transcended the mortal realm!",
        "Deca-win streak! The matrix is bending to your will!",
        "Absolutely divine! Reality itself bows to your logic!"
      ],
      'expert_clear': [
        "Expert level annihilated! You are a tactical genius!",
        "Incredible! The hardest difficulty falls beneath your supreme intellect!",
        "A masterpiece of logic. The expert board has been conquered!"
      ]
    },
    'zh-CN': {
      'victory': [
        "完美收官！椒哥非常满意。",
        "行云流水般的操作！地雷在你面前颤抖。",
        "精准而优雅，简直是艺术。"
      ],
      'streak_5': [
        "五连胜！专注力已达巅峰！",
        "五连绝世！继续飞升吧！",
        "势不可挡！椒哥粒子浓度已满！"
      ],
      'streak_10': [
        "十连胜！你已超越了凡人境界！",
        "十连破局！代码矩阵都在为你让路！",
        "神级操作！现实都得服从你的逻辑！"
      ],
      'expert_clear': [
        "地狱难度被你彻底碾压！战术天才降临！",
        "不可思议！最高难度也只能向你低头！",
        "极智流的巅峰之作！专家盘面已被征服！"
      ]
    },
    'zh-TW': {
      'victory': [
        "完美收官！椒哥非常滿意。",
        "行雲流水般的操作！地雷在你面前顫抖。",
        "精準而優雅，簡直是藝術。"
      ],
      'streak_5': [
        "五連勝！專注力已達巔峰！",
        "五連絕世！繼續飛昇吧！",
        "勢不可擋！椒哥粒子濃度已滿！"
      ],
      'streak_10': [
        "十連勝！你已超越了凡人境界！",
        "十連破局！代碼矩陣都在為你讓路！",
        "神級操作！現實都得服從你的邏輯！"
      ],
      'expert_clear': [
        "地獄難度被你徹底碾壓！戰術天才降臨！",
        "不可思議！最高難度也只能向你低頭！",
        "極智流的巔峰之作！專家盤面已被征服！"
      ]
    }
  };

  const pool = phrases[lang][type];
  return pool[Math.floor(Math.random() * pool.length)];
};
