import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, Clock, Send, Brain, Trophy, ChevronRight, ChevronLeft, User, List, RefreshCcw, AlertCircle } from 'lucide-react';
import { saveQuizResult, subscribeToLeaderboard, subscribeToQuizzes } from '../services/dbService';
import { auth } from '../lib/firebase';
import { QuizResult, QuizQuestion } from '../types';

export default function DailyExam({ 
  profile,
  onXpGain, 
  onBack,
  onUpdateProgress
}: { 
  profile: any;
  onXpGain?: (xp: number) => void;
  onBack: () => void;
  onUpdateProgress?: (id: string, prog: number) => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes for 10 MCQs
  const [leaderboard, setLeaderboard] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    const unsub = subscribeToQuizzes((data) => {
      if (data.length > 0) {
        const seedStr = today.replace(/-/g, '');
        const seed = parseInt(seedStr, 10);
        
        const shuffle = (array: any[], s: number) => {
          const shuffled = [...array];
          let currentSeed = s;
          for (let i = shuffled.length - 1; i > 0; i--) {
            currentSeed = (currentSeed * 16807) % 2147483647;
            const j = currentSeed % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        };

        const daily = shuffle(data, seed).slice(0, 10);
        setQuestions(daily);
      }
      setLoading(false);
    });
    return unsub;
  }, [today]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examStarted && !examCompleted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !examCompleted && examStarted) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [examStarted, examCompleted, timeLeft]);

  useEffect(() => {
    let unsubLeaderboard: (() => void) | null = null;
    if (examCompleted) {
      setLoadingLeaderboard(true);
      unsubLeaderboard = subscribeToLeaderboard(today, (results) => {
        setLeaderboard(results);
        setLoadingLeaderboard(false);
      });
    }
    return () => {
      if (unsubLeaderboard) unsubLeaderboard();
    };
  }, [examCompleted, today]);

  const handleStart = () => {
    if (questions.length === 0) return;
    setExamStarted(true);
  };

  const currentQuestion = questions[currentIdx];

  const handleSubmit = async () => {
    setExamCompleted(true);
    let scoreCnt = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) scoreCnt += 1;
    });
    
    // XP is based on RAW correct count
    const xpEarned = scoreCnt * 40; 
    
    if (onXpGain) onXpGain(xpEarned);
    
    if (onUpdateProgress) {
        const currentQuizCount = profile?.challengeProgress?.['14'] || 0;
        onUpdateProgress('14', Math.min(3, currentQuizCount + 1));

        if (scoreCnt === questions.length) {
            onUpdateProgress('2', 1);
        }
    }

    if (auth.currentUser) {
      const result: QuizResult = {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || profile?.displayName || 'Siswa',
        score: scoreCnt, // Save RAW score for dashboard calculation
        totalQuestions: questions.length,
        xpEarned: xpEarned,
        date: today,
        createdAt: null
      };
      await saveQuizResult(result);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-4">
        <RefreshCcw size={40} className="text-[#4A7C44] animate-spin opacity-50" />
        <p className="text-[#5C6B5C] font-bold uppercase tracking-widest text-[10px]">Sinkronisasi Bank Soal...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
         <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
            <AlertCircle size={32} />
         </div>
         <h3 className="text-xl font-serif font-bold text-[#2D4F1E]">Ujian Belum Tersedia</h3>
         <p className="text-sm text-[#5C6B5C]">Bank soal saat ini masih kosong. Silakan hubungi Guru untuk menerbitkan soal ujian baru.</p>
         <button onClick={onBack} className="text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600 transition-all">Kembali</button>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 pb-40">
         <div className="bg-white border border-gray-100 rounded-[48px] p-12 shadow-2xl text-center space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <FileText size={200} />
            </div>
            <div className="relative z-10 space-y-6">
               <div className="w-24 h-24 bg-[#4A7C44]/10 rounded-[32px] flex items-center justify-center text-4xl mx-auto text-[#4A7C44]">📝</div>
               <h2 className="text-5xl font-serif font-black text-gray-800 italic tracking-tight">Daily Exam</h2>
               <p className="text-gray-400 max-w-sm mx-auto font-medium leading-relaxed">
                  Uji pemahamanmu secara mendalam melalui 10 soal pilihan ganda acak dari bank soal guru hari ini.
               </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
               <InfoCard icon={<Clock size={20}/>} label="Waktu" value="20 Menit" />
               <InfoCard icon={<FileText size={20}/>} label="Soal" value={`${questions.length} Butir`} />
               <InfoCard icon={<Brain size={20}/>} label="Metode" value="Bank Soal Real-time" />
            </div>
            <div className="flex flex-col gap-4 relative z-10">
               <button 
                 onClick={handleStart}
                 className="px-16 py-6 bg-[#4A7C44] text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-[#4A7C44]/20 hover:scale-105 active:scale-95 transition-all"
               >
                  Mulai Ujian
               </button>
               <button onClick={onBack} className="text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600 transition-all">Kembali</button>
            </div>
         </div>
      </div>
    );
  }

  if (examCompleted) {
    const correctCount = questions.filter((q, idx) => answers[idx] === q.correctIndex).length;
    
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 pb-40">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-[48px] p-16 shadow-2xl space-y-16">
            <div className="text-center space-y-8">
               <div className="text-[100px] animate-bounce">🏆</div>
               <h2 className="text-5xl font-serif font-black text-gray-800">Ujian Selesai!</h2>
               <div className="grid grid-cols-2 gap-8 max-w-xl mx-auto">
                  <div className="p-10 bg-gray-50 rounded-[40px] border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Benar</p>
                     <p className="text-4xl font-black text-[#4A7C44]">{correctCount} / {questions.length}</p>
                  </div>
                  <div className="p-10 bg-gray-50 rounded-[40px] border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bonus XP</p>
                     <p className="text-4xl font-black text-orange-500">+{correctCount * 40}</p>
                  </div>
               </div>
            </div>

            {/* Leaderboard Section */}
            <div className="space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-serif font-black text-gray-800 italic">Leaderboard Hari Ini</h3>
                  <div className="px-4 py-1.5 bg-gray-50 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest">
                     Top 10 Siswa
                  </div>
               </div>
               
               <div className="bg-gray-50/50 rounded-[40px] border border-gray-100 overflow-hidden">
                  {loadingLeaderboard ? (
                     <div className="p-12 text-center text-gray-400 font-medium italic">Memuat peringkat...</div>
                  ) : leaderboard.length === 0 ? (
                     <div className="p-12 text-center text-gray-400 font-medium italic">Belum ada data peringkat hari ini.</div>
                  ) : (
                     <div className="divide-y divide-gray-100">
                        {leaderboard.map((res, i) => (
                           <div key={res.id || i} className="flex items-center justify-between p-6 hover:bg-white transition-all">
                              <div className="flex items-center gap-6">
                                 <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                                    i === 0 ? 'bg-yellow-100 text-yellow-600' : 
                                    i === 1 ? 'bg-gray-200 text-gray-600' :
                                    i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                                 }`}>
                                    {i + 1}
                                 </span>
                                 <div>
                                    <p className="font-bold text-gray-800">{res.displayName}</p>
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{res.createdAt?.seconds ? new Date(res.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="font-black text-[#4A7C44] text-lg">{res.score}%</p>
                                 <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">+{res.xpEarned} XP</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>

            <div className="text-center pt-8">
               <button 
                 onClick={onBack}
                 className="px-16 py-6 bg-gray-800 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-xl hover:bg-black transition-all"
               >
                 Kembali ke Dashboard
               </button>
            </div>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pb-40">
       {/* Header */}
       <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-8 rounded-[40px] border border-gray-100 shadow-sm sticky top-4 z-40">
          <div className="flex items-center gap-6">
             <div className="w-14 h-14 bg-[#F1F6EE] text-[#4A7C44] rounded-2xl flex items-center justify-center font-black">
                {currentIdx + 1}
             </div>
             <div>
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Pertanyaan</p>
                <p className="text-sm font-bold text-gray-800">{currentQuestion.category || 'Materi'}</p>
             </div>
          </div>
          <div className="flex items-center gap-10">
             <div className="text-right">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Sisa Waktu</p>
                <div className={`flex items-center gap-2 font-mono text-lg font-black ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>
                   <Clock size={18} />
                   {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
             </div>
             <button 
               onClick={handleSubmit}
               className="px-8 py-4 bg-gray-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all"
             >
                <Send size={14} /> Selesai
             </button>
          </div>
       </div>

       {/* Question Content */}
       <div className="min-h-[500px] flex items-center">
          <AnimatePresence mode="wait">
             <motion.div 
                key={currentIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full bg-white border border-gray-100 rounded-[48px] p-12 md:p-20 shadow-xl"
             >
                <div className="space-y-12">
                   <h3 className="text-3xl md:text-5xl font-serif font-black text-gray-800 leading-tight italic">
                     "{currentQuestion.question}"
                   </h3>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentQuestion.options.map((opt, i) => (
                         <button
                           key={i}
                           onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))}
                           className={`p-8 rounded-[32px] text-left transition-all border-2 flex items-center justify-between group ${
                             answers[currentIdx] === i 
                               ? 'border-[#4A7C44] bg-[#F1F6EE] text-[#4A7C44]' 
                               : 'border-gray-50 bg-gray-50 hover:border-gray-200 text-gray-500 hover:bg-gray-100'
                           }`}
                         >
                            <span className="font-bold text-lg">{opt}</span>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                               answers[currentIdx] === i ? 'border-[#4A7C44] bg-[#4A7C44]' : 'border-gray-200'
                            }`}>
                               {answers[currentIdx] === i && <CheckCircle size={16} className="text-white" />}
                            </div>
                         </button>
                      ))}
                   </div>
                </div>
             </motion.div>
          </AnimatePresence>
       </div>

       {/* Footer Navigation */}
       <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-8 rounded-[40px] border border-gray-100">
          <button 
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm text-gray-400 hover:text-gray-800 transition-all disabled:opacity-30"
          >
             <ChevronLeft size={24} />
          </button>
          <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[200px] md:max-w-lg px-4">
             {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all flex-shrink-0 ${
                    i === currentIdx ? 'bg-[#4A7C44] w-6' : answers[i] !== undefined ? 'bg-[#4A7C44]/40' : 'bg-gray-200'
                  }`}
                />
             ))}
          </div>
          <button 
            disabled={currentIdx === questions.length - 1}
            onClick={() => setCurrentIdx(prev => prev + 1)}
            className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm text-gray-400 hover:text-gray-800 transition-all disabled:opacity-30"
          >
             <ChevronRight size={24} />
          </button>
       </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: any) {
  return (
    <div className="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
       <div className="flex items-center gap-3 text-[#4A7C44] mb-3">
          {icon} <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</span>
       </div>
       <p className="text-xl font-black text-gray-800">{value}</p>
    </div>
  );
}
