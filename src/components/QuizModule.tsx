import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, RefreshCcw, HelpCircle } from 'lucide-react';
import { subscribeToQuizzes, addQuiz } from '../services/dbService';
import { QuizQuestion, UserProfile } from '../types';
import { QUIZ_QUESTIONS } from '../constants';

export default function QuizModule({ profile, onXpGain, onBack, onUpdateProgress }: { profile: UserProfile | null, onXpGain: (xp: number) => void, onBack?: () => void, onUpdateProgress?: (id: string, prog: number) => void }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (finished && score === questions.length && onUpdateProgress && questions.length > 0) {
      onUpdateProgress('2', 1);
    }
  }, [finished, score, questions.length, onUpdateProgress]);

  useEffect(() => {
    const unsub = subscribeToQuizzes((data) => {
      if (data.length > 0) {
        // Daily rotation logic: use current date as seed
        const today = new Date();
        const dateStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        
        // Simple hash/seed based on date
        let seed = 0;
        for (let i = 0; i < dateStr.length; i++) {
          seed += dateStr.charCodeAt(i);
        }

        // Shuffle questions based on seed
        const shuffled = [...data].sort((a, b) => {
          // Use seed to create a deterministic shuffle for the day
          const idA = a.id || '';
          const idB = b.id || '';
          let hashA = 0, hashB = 0;
          for (let i = 0; i < idA.length; i++) hashA += idA.charCodeAt(i) * seed;
          for (let i = 0; i < idB.length; i++) hashB += idB.charCodeAt(i) * seed;
          return (hashA % 100) - (hashB % 100);
        });

        // Take exactly 10 questions (or all if less than 10)
        setQuestions(shuffled.slice(0, 10));
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSeedQuizzes = async () => {
    setLoading(true);
    let imported = 0;
    // We need to fetch current quizzes to check for duplicates
    // But subscribeToQuizzes is already running and setQuestions is updating
    for (const q of QUIZ_QUESTIONS) {
       const isDuplicate = questions.some(ex => ex.question.toLowerCase().trim() === q.question.toLowerCase().trim());
       if (!isDuplicate) {
         await addQuiz(q);
         imported++;
       }
    }
    if (imported === 0) alert("Semua soal standar sudah ada.");
  };

  if (loading) return (
     <div className="py-20 text-center flex flex-col items-center gap-4">
        <RefreshCcw size={40} className="text-[#4A7C44] animate-spin opacity-50" />
        <p className="text-[#5C6B5C] font-bold uppercase tracking-widest text-[10px]">Memuat soal ujian...</p>
     </div>
  );

  if (questions.length === 0) return (
    <div className="py-20 text-center space-y-6 max-w-md mx-auto">
       <div className="w-16 h-16 bg-[#F1F6EE] rounded-full flex items-center justify-center mx-auto text-[#4A7C44]">
          <HelpCircle size={32} />
       </div>
       <h3 className="text-xl font-serif font-bold text-[#2D4F1E]">Belum ada soal ujian</h3>
       <p className="text-sm text-[#5C6B5C]">Database ujian kosong. Impor soal standar untuk memulai evaluasi kompetensi.</p>
       <button 
         onClick={handleSeedQuizzes}
         className="w-full py-4 bg-[#4A7C44] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
       >
         Impor Soal Standar
       </button>
    </div>
  );

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    setTimeout(() => {
      if (idx === questions[current].correctIndex) {
        setScore(s => s + 1);
        onXpGain(50);
      }
      if (current < questions.length - 1) {
        setCurrent(current + 1);
        setSelected(null);
      } else {
        setFinished(true);
      }
    }, 800);
  };

  if (finished) return (
     <div className="max-w-md mx-auto text-center bg-white border border-[#E0E7D9] rounded-[40px] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F1F6EE] rounded-full blur-3xl opacity-50" />
        <div className="w-20 h-20 bg-[#4A7C44] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-[#4A7C44]/20 text-white rotate-3">
           <Trophy size={40} />
        </div>
        <h4 className="text-3xl font-serif font-bold text-[#2D4F1E] mb-2">Luar Biasa!</h4>
        <p className="text-[#5C6B5C] mb-8 font-medium italic">Evaluasi Kompetensi Selesai</p>
        <div className="bg-[#F1F6EE] py-8 rounded-[32px] border border-[#E0E7D9] mb-8">
           <span className="text-6xl font-serif font-bold text-[#4A7C44]">{Math.round((score/questions.length)*100)}</span>
           <span className="text-xl font-bold text-[#5C6B5C]/30 ml-2">/ 100</span>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => onBack ? onBack() : window.location.reload()} 
             className="flex-1 py-4 bg-[#4A7C44] text-white rounded-2xl font-bold shadow-lg"
           >
             Kembali
           </button>
           <button onClick={()=>{setCurrent(0); setScore(0); setFinished(false); setSelected(null);}} className="flex-1 py-4 bg-white border border-[#E0E7D9] text-[#2D4F1E] rounded-2xl font-bold">Ulangi</button>
        </div>
     </div>
  );

  const q = questions[current];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div className="flex justify-between items-center px-4">
          <div className="flex flex-col">
             <span className="text-[10px] font-bold text-[#5C6B5C] uppercase tracking-widest leading-none mb-1">Pertanyaan</span>
             <span className="text-xl font-serif font-bold text-[#2D4F1E]">{current + 1} <span className="text-sm opacity-30">/ {questions.length}</span></span>
          </div>
          <div className="flex items-center gap-2 bg-[#F1F6EE] px-4 py-2 rounded-full border border-[#E0E7D9]">
             <CheckCircle2 size={14} className="text-[#4A7C44]" />
             <span className="text-xs font-bold text-[#2D4F1E] tracking-tight">Benar: {score}</span>
          </div>
       </div>

       <div className="bg-white border border-[#E0E7D9] rounded-[40px] p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 bg-[#4A7C44] transition-all duration-500" style={{ width: `${((current+1)/questions.length)*100}%` }} />
          
          <div className="mb-4">
             <span className="px-3 py-1 bg-[#F1F6EE] text-[#4A7C44] text-[9px] font-bold uppercase tracking-wider rounded-full border border-[#E0E7D9]">
                {q.category || 'Biologi Dasar'}
             </span>
          </div>

          <h4 className="text-2xl md:text-3xl font-serif font-bold text-[#2D4F1E] mb-12 leading-tight">{q.question}</h4>
          
          <div className="grid grid-cols-1 gap-4">
             {q.options.map((opt, i) => (
               <button 
                  key={i} 
                  onClick={()=>handleAnswer(i)}
                  disabled={selected !== null}
                  className={`w-full p-6 text-left rounded-[24px] border-2 transition-all flex justify-between items-center group font-bold text-sm md:text-base ${
                    selected === i 
                    ? (i === q.correctIndex ? 'bg-[#4A7C44] border-[#4A7C44] text-white' : 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-200')
                    : 'bg-white border-[#E0E7D9] hover:border-[#4A7C44]/40 hover:bg-[#F1F6EE] hover:translate-x-2'
                  } ${selected !== null && i === q.correctIndex && i !== selected ? 'bg-emerald-50 border-emerald-200 text-[#4A7C44]' : ''}`}
               >
                 <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-serif ${selected === i ? 'bg-white/20' : 'bg-[#F1F6EE] text-[#5C6B5C]'}`}>
                       {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                 </div>
                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                   selected===i 
                   ? 'border-white bg-white/20' 
                   : (selected !== null && i === q.correctIndex ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-[#E0E7D9]')
                 }`}>
                    {selected===i ? (i===q.correctIndex ? '✓' : '✗') : (selected !== null && i === q.correctIndex ? '✓' : '')}
                 </div>
               </button>
             ))}
          </div>
       </div>

       <div className="text-center">
          <p className="text-[9px] font-bold text-[#A0B0A0] uppercase tracking-[0.2em]">Pilih satu jawaban yang paling tepat</p>
       </div>
    </div>
  );
}
