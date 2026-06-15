import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trophy, 
  Flame, 
  Clock, 
  Activity, 
  RefreshCw, 
  ShieldAlert, 
  LogIn, 
  LogOut, 
  UploadCloud, 
  Crown,
  ChevronRight,
  User,
  Medal,
  Award,
  CircleDot
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from '../utils/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { DifficultyType, DIFFICULTIES } from '../types';
import { Language } from '../utils/i18n';
import { playSound } from '../utils/audio';

interface GlobalJiaoLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  soundEnabled: boolean;
  theme?: 'classic' | 'cyberpunk';
  currentAvatar: string;
  lastPendingWin?: {
    time: number;
    difficulty: DifficultyType;
    mines: number;
    streak: number;
  } | null;
  onClearPendingWin?: () => void;
}

interface LeaderboardRecord {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  time: number;
  difficulty: string;
  mines: number;
  streak: number;
  createdAt: any;
}

export default function GlobalJiaoLeaderboardModal({
  isOpen,
  onClose,
  lang,
  soundEnabled,
  theme = 'classic',
  currentAvatar,
  lastPendingWin,
  onClearPendingWin
}: GlobalJiaoLeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<DifficultyType>('easy');
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [customUsername, setCustomUsername] = useState<string>('');

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.displayName) {
        setCustomUsername(user.displayName);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch top scorers for active difficulty tab
  const fetchScores = async (difficulty: DifficultyType) => {
    setLoading(true);
    setErrorMsg('');
    const path = 'leaderboard';
    try {
      let querySnapshot;
      try {
        const q = query(
          collection(db, path),
          where('difficulty', '==', difficulty),
          orderBy('time', 'asc'),
          limit(10)
        );
        querySnapshot = await getDocs(q);
      } catch (err: any) {
        console.warn("Index query with orderBy failed, falling back to non-indexed query with in-memory sort:", err);
        const qFallback = query(
          collection(db, path),
          where('difficulty', '==', difficulty),
          limit(100)
        );
        querySnapshot = await getDocs(qFallback);
      }
      
      let fetched: LeaderboardRecord[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          userId: data.userId,
          username: data.username || 'Anonymous Player',
          avatar: data.avatar,
          time: data.time ?? 9999,
          difficulty: data.difficulty || 'easy',
          mines: data.mines ?? 10,
          streak: data.streak ?? 0,
          createdAt: data.createdAt,
        });
      });

      // Robust in-memory sorting & trimming to guarantee accurate highscore order
      fetched.sort((a, b) => a.time - b.time);
      fetched = fetched.slice(0, 10);

      setRecords(fetched);
    } catch (err) {
      setErrorMsg(lang === 'en' ? 'Failed to fetch global leaderboard.' : '獲取全域排行榜失敗，請重試。');
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (logError) {
        // Log details but keep app safe
        console.error("Firestore leaderboard retrieval error captured: ", logError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when modality opens or tab shifts
  useEffect(() => {
    if (isOpen) {
      fetchScores(activeTab);
    }
  }, [isOpen, activeTab]);

  // Authenticate user with Google Login Popup
  const handleGoogleLogin = async () => {
    if (soundEnabled) playSound.click(true);
    try {
      setErrorMsg('');
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user && result.user.displayName) {
        setCustomUsername(result.user.displayName);
      }
    } catch (err: any) {
      console.error("Google Auth failed: ", err);
      setErrorMsg(lang === 'en' ? 'Google Authentication aborted.' : 'Google 登入失敗或已取消。');
    }
  };

  // Sign out user
  const handleSignOut = async () => {
    if (soundEnabled) playSound.click(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed: ", err);
    }
  };

  // Send victory performance score record to Firebase
  const handleSubmitScore = async () => {
    if (!currentUser || !lastPendingWin) return;
    if (!customUsername.trim()) {
      setErrorMsg(lang === 'en' ? 'Username is required!' : '請輸入顯示名稱！');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    const path = 'leaderboard';

    try {
      const payload = {
        userId: currentUser.uid,
        username: customUsername.trim().substring(0, 30),
        avatar: currentAvatar,
        time: Math.floor(lastPendingWin.time),
        difficulty: lastPendingWin.difficulty,
        mines: Math.floor(lastPendingWin.mines),
        streak: Math.floor(lastPendingWin.streak),
        createdAt: serverTimestamp(),
      };

      // Create record
      await addDoc(collection(db, path), payload);
      
      setSubmitSuccess(true);
      if (soundEnabled) playSound.win(true);
      
      // Clear game's pending win and reload active tab score view
      if (onClearPendingWin) onClearPendingWin();
      
      // Set the active tab to match the submitted difficulty to witness the entry!
      setActiveTab(lastPendingWin.difficulty);
      fetchScores(lastPendingWin.difficulty);
    } catch (err) {
      setErrorMsg(lang === 'en' ? 'Failed to publish high score.' : '上傳成績失敗，請檢查規則或網路。');
      try {
        handleFirestoreError(err, OperationType.CREATE, path);
      } catch (logError) {
        console.error("Score submit error logged: ", logError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const tabs: { key: DifficultyType; labelZh: string; labelEn: string; color: string }[] = [
    { key: 'kids', labelZh: '極簡易', labelEn: 'Kids', color: 'border-l-green-500' },
    { key: 'easy', labelZh: '簡單', labelEn: 'Easy', color: 'border-l-blue-500' },
    { key: 'medium', labelZh: '中等', labelEn: 'Medium', color: 'border-l-yellow-500' },
    { key: 'hard', labelZh: '困難', labelEn: 'Hard', color: 'border-l-red-500' },
    { key: 'expert', labelZh: '極智大師', labelEn: 'Expert', color: 'border-l-purple-500' },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Absolute shadow overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xs"
      />

      {/* Leaderboard frame */}
      <motion.div
        initial={{ scale: 0.93, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 10, opacity: 0 }}
        className={`relative w-full max-w-xl rounded-3xl border-2 overflow-hidden shadow-2xl flex flex-col max-h-[90vh] ${
          theme === 'cyberpunk'
            ? 'bg-[#0a0e1a] border-cyan-500/40 text-slate-100'
            : 'bg-white border-amber-400 text-slate-800'
        }`}
      >
        {/* Dynamic decorative top line */}
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 w-full" />

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200/20">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${theme === 'cyberpunk' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-yellow-100 text-yellow-600'}`}>
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-black tracking-tight uppercase">
                {lang === 'en' ? 'Global Jiao Hall of Fame' : '椒哥極智全球名人堂'}
              </h2>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                {theme === 'cyberpunk' ? 'SYS_LEADERBOARD_AUTHENTIC_CLOUD_STORE' : 'Top 10 Fast Clears from Firebase'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              theme === 'cyberpunk'
                ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">

          {/* Pending submission score card */}
          {lastPendingWin && (
            <div className={`p-4 rounded-2xl border-2 relative overflow-hidden flex flex-col justify-between ${
              theme === 'cyberpunk'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                : 'bg-amber-50 border-amber-400/60 text-amber-900 shadow-md'
            }`}>
              <div className="absolute top-0 right-0 p-8 blur-3xl rounded-full bg-amber-500/10" />

              <div className="relative flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500 animate-spin" />
                  <span className="text-xs font-display font-black uppercase tracking-wider">
                    {lang === 'en' ? 'UNPUBLISHED RECORD DETECTED!' : '檢測到新通關記錄！'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/10 dark:bg-black/30 p-3 rounded-lg font-mono text-xs text-center border border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Time' : '通關時間'}</span>
                    <strong className="text-sm font-black text-amber-400">{lastPendingWin.time}s</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Difficulty' : '難度級別'}</span>
                    <strong className="text-sm font-black text-cyan-400">{lastPendingWin.difficulty.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Mines' : '地雷總數'}</span>
                    <strong className="text-sm font-black text-rose-400">{lastPendingWin.mines}💣</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Streak' : '連勝次數'}</span>
                    <strong className="text-sm font-black text-emerald-400">{lastPendingWin.streak}🔥</strong>
                  </div>
                </div>

                {/* Submission Forms */}
                {!currentUser ? (
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full mt-1.5 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-display font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-101 active:scale-99 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Sign in with Google to Publish' : '登入 Google 上傳至全球排行'}</span>
                  </button>
                ) : (
                  <div className="space-y-2 mt-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={20}
                        placeholder={lang === 'en' ? 'Type your fighter display name...' : '請輸入戰士暱稱...'}
                        value={customUsername}
                        onChange={(e) => setCustomUsername(e.target.value)}
                        className={`flex-1 text-xs px-3 py-2 rounded-xl outline-hidden border ${
                          theme === 'cyberpunk'
                            ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                            : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-300'
                        }`}
                      />
                      <button
                        onClick={handleSubmitScore}
                        disabled={submitting}
                        className="py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:scale-103 active:scale-97 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {submitting ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>{lang === 'en' ? 'Submit' : '上傳'}</span>
                      </button>
                    </div>
                    
                    {/* User credentials details */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{lang === 'en' ? `Logged in as: ${currentUser.email}` : `已登入: ${currentUser.email}`}</span>
                      </span>
                      <button onClick={handleSignOut} className="text-rose-500 hover:underline flex items-center gap-0.5">
                        <LogOut className="w-3 h-3" />
                        <span>{lang === 'en' ? 'Sign out' : '登出'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error and Alert Message Bar */}
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-rose-500 text-xs font-mono rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Difficulty Selection Tab Headers */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-950/60 rounded-xl border border-slate-200/20 overflow-x-auto gap-0.5 no-scrollbar">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    if (soundEnabled) playSound.click(true);
                    setActiveTab(tab.key);
                  }}
                  className={`flex-1 min-w-[75px] py-1.5 px-1 rounded-lg text-[10px] font-display font-black tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border-l-2 ' + tab.color
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'en' ? tab.labelEn : tab.labelZh}
                </button>
              );
            })}
          </div>

          {/* Records Table view */}
          <div className={`rounded-2xl border overflow-hidden min-h-[310px] flex flex-col justify-between ${
            theme === 'cyberpunk' ? 'bg-slate-950/80 border-slate-900' : 'bg-slate-50 border-slate-250/50'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-200/10 text-[9px] text-slate-400 uppercase tracking-widest bg-slate-900/10 dark:bg-slate-950/40">
                    <th className="py-2.5 px-4 font-bold">{lang === 'en' ? 'Rank' : '名次'}</th>
                    <th className="py-2.5 px-2 font-bold">{lang === 'en' ? 'Player' : '微操大師'}</th>
                    <th className="py-2.5 px-2 font-bold text-center">{lang === 'en' ? 'Time' : '快秒'}</th>
                    <th className="py-2.5 px-2 font-bold text-center">{lang === 'en' ? 'Mines' : '雷荷'}</th>
                    <th className="py-2.5 px-4 font-bold text-right">{lang === 'en' ? 'Streak' : '連勝'}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 justify-center">
                          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{lang === 'en' ? 'Syncing Firebase Database...' : '即時同步雲端資料庫...'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-500 italic text-xs">
                        <div className="flex flex-col items-center gap-1.5 justify-center">
                          <CircleDot className="w-5 h-5 text-slate-400" />
                          <span>{lang === 'en' ? 'No cleared records submitted for this tab yet.' : '當前難度尚未有極智記錄，快去創造一個！'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    records.map((r, i) => {
                      const isTop1 = i === 0;
                      const isTop2 = i === 1;
                      const isTop3 = i === 2;

                      return (
                        <tr 
                          key={r.id} 
                          className={`border-b border-slate-200/5 transition-colors group ${
                            isTop1 
                              ? 'bg-yellow-500/5 hover:bg-yellow-500/10 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/15 font-black' 
                              : 'hover:bg-slate-500/5'
                          }`}
                        >
                          {/* Rank column */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              {isTop1 ? (
                                <Crown className="w-4 h-4 text-yellow-500 fill-current animate-bounce" />
                              ) : isTop2 ? (
                                <Medal className="w-3.5 h-3.5 text-zinc-400 fill-current" />
                              ) : isTop3 ? (
                                <Medal className="w-3.5 h-3.5 text-amber-500 fill-current" />
                              ) : (
                                <span className="text-slate-400 pl-1.5">{i + 1}</span>
                              )}
                            </div>
                          </td>

                          {/* Username with badge for top player */}
                          <td className="py-3 px-2 max-w-[140px] truncate text-slate-300">
                            <div className="flex items-center gap-1.5">
                              {r.avatar && <span className="text-sm shrink-0">{r.avatar}</span>}
                              <span className={`truncate text-sm tracking-tight ${isTop1 ? 'text-yellow-400 dark:text-yellow-400 font-bold' : theme === 'cyberpunk' ? 'text-slate-200' : 'text-slate-700'}`}>
                                {r.username}
                              </span>

                              {/* TOP PLAYER SPECIAL JIAO GE ICON BADGE */}
                              {isTop1 && (
                                <span 
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-sans font-black bg-gradient-to-r from-red-500 to-orange-500 text-white select-none shrink-0" 
                                  title="Jiao Ge's Approved Commander!"
                                >
                                  <span>👴</span>
                                  <span>椒哥欽點</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Time Column */}
                          <td className="py-3 px-2 text-center">
                            <span className={`text-xs inline-flex items-center gap-0.5 ${isTop1 ? 'text-yellow-400 font-black' : theme === 'cyberpunk' ? 'text-cyan-400' : 'text-[#4285F4] font-semibold'}`}>
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{r.time}s</span>
                            </span>
                          </td>

                          {/* Mines Column */}
                          <td className="py-3 px-2 text-center text-[11px] text-slate-400">
                            <span>{r.mines}</span>
                          </td>

                          {/* Streak Column */}
                          <td className="py-3 px-4 text-right">
                            {r.streak > 0 ? (
                              <span className="inline-flex items-center gap-0.5 text-orange-500 text-[10px] font-black bg-orange-500/10 px-1.5 py-0.5 rounded-md border border-orange-500/20">
                                <Flame className="w-3 h-3 fill-current" />
                                <span>{r.streak}</span>
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick stats footer summary inside list */}
            {!loading && records.length > 0 && (
              <div className="px-4 py-2.5 bg-black/10 dark:bg-black/30 border-t border-slate-200/5 text-[9px] text-slate-400 font-mono flex justify-between items-center select-none">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>{lang === 'en' ? `Synchronized items: ${records.length}` : `已加載同步紀錄數: ${records.length}`}</span>
                </span>
                
                <button 
                  onClick={() => fetchScores(activeTab)} 
                  className="font-bold hover:text-white uppercase transition-colors flex items-center gap-1 cursor-pointer"
                  title="Manual refresh"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>REFRESH_STREAM</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 border-t border-slate-200/20 bg-slate-900/10 dark:bg-slate-950/20 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <p className="text-[10px] text-slate-400 text-center sm:text-left font-mono">
            {lang === 'en' 
              ? 'Scores are locked immediately upon submission via secure firestore.rules.' 
              : '安全規則（firestore.rules）保證歷史榜單絕不容許任何作弊覆寫與越權刪除。'}
          </p>

          <button
            onClick={onClose}
            className={`w-full sm:w-auto px-5 py-2 rounded-xl font-display font-black text-xs tracking-wider transition-all uppercase cursor-pointer ${
              theme === 'cyberpunk'
                ? 'bg-[#ffe600] text-slate-950 font-black hover:brightness-110 shadow-lg shadow-yellow-500/10'
                : 'bg-slate-900 border border-slate-800 text-white hover:bg-slate-800'
            }`}
          >
            {lang === 'en' ? 'Return to Sandbox' : '返回主介面'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
