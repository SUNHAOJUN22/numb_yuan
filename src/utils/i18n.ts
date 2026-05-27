export type Language = 'zh-CN' | 'zh-TW' | 'en';

export interface TranslationSet {
  title: string;
  subtitle: string;
  flagsLeft: string;
  timeElapsed: string;
  unearth: string;
  placeFlags: string;
  reset: string;
  difficulty: string;
  easy: string;
  medium: string;
  hard: string;
  winStatus: string;
  loseStatus: string;
  idleStatus: string;
  playingStatus: string;
  developerCredit: string;
  statsTitle: string;
  statGames: string;
  statWinRate: string;
  statBestTime: string;
  statTipTitle: string;
  statTipContent: string;
  clearStats: string;
  doneBtn: string;
  howToPlayTitle: string;
  goalTitle: string;
  goalDesc: string;
  controlsTitle: string;
  unearthTitle: string;
  unearthDesc: string;
  flagTitle: string;
  flagDesc: string;
  quickSweepTitle: string;
  quickSweepDesc: string;
  shortcutTip: string;
  readyBtn: string;
  winOverTitle: string;
  winOverDesc: string;
  loseOverTitle: string;
  loseOverDesc: string;
  playAgainBtn: string;
  viewStatsBtn: string;
  footerShortcutInfo: string;
  confirmResetStats: string;
  easterEggBtn: string;
}

export const translations: Record<Language, TranslationSet> = {
  'zh-CN': {
    title: '袁世杰闹麻了',
    subtitle: '极智高雅版 • 椒哥程式设计',
    flagsLeft: '剩余红旗',
    timeElapsed: '耗时',
    unearth: '开掘方格 (铲子)',
    placeFlags: '插红旗子 (红旗)',
    reset: '重置',
    difficulty: '游戏难度',
    easy: '简单',
    medium: '中等',
    hard: '困难',
    winStatus: '华宇的学位证归我了 🎉',
    loseStatus: '个袁世杰闹全麻 💀',
    idleStatus: '选择一个格子开始扫雷！',
    playingStatus: '用心细致排查... 严防“袁”雷',
    developerCredit: '程式设计：极智大师 椒哥 (Design by 椒哥)',
    statsTitle: '玩家生涯数据统计',
    statGames: '胜负对局',
    statWinRate: '战胜率',
    statBestTime: '最佳耗时',
    statTipTitle: '椒哥独门扫雷秘笈：',
    statTipContent: '首发左击是100%绝对安全的！在已有数字格子直接双键点按或双击（若周围标满等额红旗）可一键超速自动开掘邻格，通关效率飙升！移动触屏完美支持长按插旗！',
    clearStats: '清空战绩',
    doneBtn: '完成',
    howToPlayTitle: '《袁世杰闹麻了》玩法说明手册',
    goalTitle: '核心目标',
    goalDesc: '扫除整个棋盘里一切未知的土壤，小心地标出红旗，绝对不可踩到任何一个“袁”雷！踩中则个袁世杰闹全麻。',
    controlsTitle: '全面触控与按键指令',
    unearthTitle: '地块开掘 (刨土铲子)',
    unearthDesc: '左键单击（桌面端）或直接轻触（移动端）。排查并显示周围相邻 8 格中藏有的“袁”累积数量。',
    flagTitle: '设置标旗 (避险防护)',
    flagDesc: '右键点击，在“红旗模式”下直接轻触，或长按格点 400 毫秒。锁定该格保证不会因手抖误挖。',
    quickSweepTitle: '闪电扫荡 (和弦双击)',
    quickSweepDesc: '在已揭晓的数字单元格上进行双击。如果你已经妥善在周围插好了正确的红旗，便可同步揭开非雷邻格，职业选手的首选！',
    shortcutTip: '平台超级兼容提示：键盘按 [F] 键能瞬时反向切刀/换旗；按 [R] 键闪电一键洗牌重开！iOS/安卓支持长按方块极速精准插旗，消灭双击延迟。',
    readyBtn: '椒哥带我，即刻开整！',
    winOverTitle: '华宇的学位证归我了 🎉',
    winOverDesc: '恭喜凯旋！完美标记并揭发了全场隐秘，华宇本科学位证书即刻划归你的名下！',
    loseOverTitle: '个袁世杰闹全麻 💀',
    loseOverDesc: '大意踩雷！深藏地底的“袁”暴雷了，这下真是个袁世杰闹了全麻，推不回朝阳了。',
    playAgainBtn: '再闹一把',
    viewStatsBtn: '查看生涯',
    footerShortcutInfo: '点格子刨土。按 F 键可瞬时切刀插旗。双击揭示格可进行闪电双击连锁排雷。完美的 iOS、安卓、Windows 全平台全触控性能兼容支持。',
    confirmResetStats: '您确定要销毁过往的全部游戏生涯战果统计吗？该操作不可逆。',
    easterEggBtn: '椒哥特制彩蛋 🥚',
  },
  'zh-TW': {
    title: '袁世杰鬧麻了',
    subtitle: '極智高雅版 • 椒哥程式設計',
    flagsLeft: '剩餘紅旗',
    timeElapsed: '耗時',
    unearth: '開掘方格 (鏟子)',
    placeFlags: '插紅旗子 (紅旗)',
    reset: '重置',
    difficulty: '遊戲難度',
    easy: '簡單',
    medium: '中等',
    hard: '困難',
    winStatus: '華宇的學位證歸我了 🎉',
    loseStatus: '個袁世杰鬧全麻 💀',
    idleStatus: '選擇一個格子開始掃雷！',
    playingStatus: '用心細緻排查... 嚴防「袁」雷',
    developerCredit: '程式設計：極智大師 椒哥 (Design by 椒哥)',
    statsTitle: '玩家生涯數據統計',
    statGames: '勝負對局',
    statWinRate: '戰勝率',
    statBestTime: '最佳耗時',
    statTipTitle: '椒哥獨門掃雷秘笈：',
    statTipContent: '首發左擊是100%絕對安全的！在已有數字格子直接雙鍵點按或雙擊（若周圍標滿等額紅旗）可一鍵超速自動開掘鄰格，通關效率飆升！移動觸控完美支援長按插旗！',
    clearStats: '清空戰績',
    doneBtn: '完成',
    howToPlayTitle: '《袁世杰鬧麻了》玩法說明手冊',
    goalTitle: '核心目標',
    goalDesc: '掃除整個棋盤裡一切未知的土壤，小心地標出紅旗，絕對不可踩到任何一個「袁」雷！踩中則個袁世杰鬧全麻。',
    controlsTitle: '全面觸控與按鍵指令',
    unearthTitle: '地塊開掘 (刨土鏟子)',
    unearthDesc: '左鍵單擊（桌面端）或直接輕觸（移動端）。排查並顯示周圍相鄰 8 格中藏有的「袁」累積數量。',
    flagTitle: '設置標旗 (避險防護)',
    flagDesc: '右鍵點擊，在「紅旗模式」下直接輕觸，或長按格點 400 毫秒。鎖定該格保證不會因手抖誤挖。',
    quickSweepTitle: '閃電掃蕩 (和弦雙擊)',
    quickSweepDesc: '在已揭曉的數字單元格上進行雙擊。如果您已經妥善在周圍插好了正確的紅旗，便可同步揭開非雷鄰格，職業選手的首選！',
    shortcutTip: '平台超級相容提示：鍵盤按 [F] 鍵能瞬時反向切刀/換旗；按 [R] 鍵閃電一鍵洗牌重開！iOS/安卓支援長按方塊極速精準插旗，消滅雙擊延遲。',
    readyBtn: '椒哥帶我，即刻開整！',
    winOverTitle: '華宇的學位證歸我了 🎉',
    winOverDesc: '恭喜凱旋！完美標記並揭發了全場隱秘，華宇本科學位證書即刻劃歸你的名下！',
    loseOverTitle: '個袁世杰鬧全麻 💀',
    loseOverDesc: '大意踩雷！深藏地底的「袁」暴雷了，這下真是個袁世杰鬧了全麻，推不回朝陽了。',
    playAgainBtn: '再鬧一把',
    viewStatsBtn: '查看生涯',
    footerShortcutInfo: '點格子刨土。按 F 鍵可瞬時切刀插旗。雙擊揭示格可進行閃電雙擊連鎖排雷。完美的 iOS、安卓、Windows 全平台全觸控性能相容支援。',
    confirmResetStats: '您確定要銷毀過往的全部遊戲生涯戰果統計嗎？該操作不可逆。',
    easterEggBtn: '椒哥特製彩蛋 🥚',
  },
  'en': {
    title: 'Yuan Shijie Nao Ma Le',
    subtitle: 'Classic Edition • Designed by Jiao Ge',
    flagsLeft: 'Flags Left',
    timeElapsed: 'Time',
    unearth: 'Unearth (Dig)',
    placeFlags: 'Place Flags',
    reset: 'Reset',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    winStatus: "Huayu's Degree is Mine! 🎉",
    loseStatus: 'Yuan Shijie Nao Quan Ma! 💀',
    idleStatus: 'Select any cell to start sweeping!',
    playingStatus: 'Carefully searching... avoid the "Yuan" mines',
    developerCredit: 'Designed & Engineered by Master Jiao Ge',
    statsTitle: 'Career Stats Dashboard',
    statGames: 'Win/Loss',
    statWinRate: 'Win Rate',
    statBestTime: 'Best Time',
    statTipTitle: "Jiao Ge's Secret Tip:",
    statTipContent: 'Your very first click is guaranteed to be 100% safe and unearths an opening! Double-click on any unlocked number with correct surrounding flags to trigger high-speed sweep. Long press to flag is supported!',
    clearStats: 'Clear Stats',
    doneBtn: 'Done',
    howToPlayTitle: 'Minesweeper Playbook',
    goalTitle: 'Core Objective',
    goalDesc: 'Sweep all dirt and unearth numbers without triggering any hidden "Yuan" mines underneath! Set flags to seal locations.',
    controlsTitle: 'High Compatibility Commands',
    unearthTitle: 'Unearth Grid (Shovel Tool)',
    unearthDesc: 'Left Click on desktops or tap in Shovel mode. Numbers specify how many "Yuan" mines are near.',
    flagTitle: 'Place Flag (Shield Guard)',
    flagDesc: 'Right Click, tap directly in Flag mode, or Long Press for 400ms to seal cell from misclicks.',
    quickSweepTitle: 'Quick-Sweep (Chord Click)',
    quickSweepDesc: 'Double-click any revealed number with sufficient surrounding flags. It instantly opens adjacent safe cells!',
    shortcutTip: 'Universal Compatibility: Press [F] to temporarily reverse Shovel/Flag active tools, press [R] to instantly restart a fresh grid. Complete gesture-response eliminates iOS Safari zoom limits.',
    readyBtn: 'Jiao Ge Lead Me, Let\'s Go!',
    winOverTitle: "Huayu's Degree is Mine! 🎉",
    winOverDesc: 'Victory! You cleanly flagged and conquered the cells. Huayu\'s degree has officially been added to your inventory!',
    loseOverTitle: 'Yuan Shijie Nao Quan Ma! 💀',
    loseOverDesc: 'Oops! Hit a "Yuan" mine. Jiao Ge is speechless. Yuan Shijie is completely paralyzed and cannot push his cart back to Chaoyang!',
    playAgainBtn: 'Restart Grid',
    viewStatsBtn: 'Stats Archive',
    footerShortcutInfo: 'Click to unearth. Press [F] key to switch/reverse tools. Double-click numbers to fast-sweep adjacent. Fully responsive and optimized on iOS, Android, and Windows Touch.',
    confirmResetStats: 'Are you sure you want to wipe out all statistical records? This is permanent.',
    easterEggBtn: "Jiao Ge's Bonus 🥚",
  }
};
