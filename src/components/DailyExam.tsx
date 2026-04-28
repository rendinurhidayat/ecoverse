import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, Clock, Send, Brain, Trophy, ChevronRight, ChevronLeft, User, List } from 'lucide-react';
import { saveQuizResult, getDailyLeaderboard } from '../services/dbService';
import { auth } from '../lib/firebase';
import { QuizResult } from '../types';

interface Question {
  id: number;
  type: 'mcq';
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const QUESTION_POOL: Question[] = [
  { id: 1, type: 'mcq', category: 'Dasar', question: "Komponen biotik dalam ekosistem yang berperan sebagai produsen adalah...", options: ["Jamur", "Tumbuhan Hijau", "Bakteri", "Harimau"], correctAnswer: 1 },
  { id: 2, type: 'mcq', category: 'Interaksi', question: "Hubungan antara lebah dan bunga merupakan contoh simbiosis...", options: ["Parasitisme", "Komensalisme", "Mutualisme", "Amensalisme"], correctAnswer: 2 },
  { id: 3, type: 'mcq', category: 'Siklus', question: "Gas yang paling melimpah di atmosfer bumi adalah...", options: ["Oksigen", "Karbon Dioksida", "Nitrogen", "Argon"], correctAnswer: 2 },
  { id: 4, type: 'mcq', category: 'Rantai Makanan', question: "Organisme yang memakan tumbuhan secara langsung disebut sebagai...", options: ["Konsumen Primer", "Konsumen Sekunder", "Konsumen Tersier", "Dekomposer"], correctAnswer: 0 },
  { id: 5, type: 'mcq', category: 'Dasar', question: "Lingkungan fisik tempat suatu organisme hidup disebut...", options: ["Niche", "Habitat", "Biosfer", "Komunitas"], correctAnswer: 1 },
  { id: 6, type: 'mcq', category: 'Interaksi', question: "Predasi adalah hubungan antara...", options: ["Dua spesies yang saling menguntungkan", "Pemangsa dan mangsanya", "Dua spesies yang berebut sumber daya", "Parasit dan inangnya"], correctAnswer: 1 },
  { id: 7, type: 'mcq', category: 'Siklus', question: "Proses penguapan air dari permukaan daun tumbuhan disebut...", options: ["Evaporasi", "Kondensasi", "Transpirasi", "Presipitasi"], correctAnswer: 2 },
  { id: 8, type: 'mcq', category: 'Rantai Makanan', question: "Urutan aliran energi yang benar adalah...", options: ["Matahari -> Konsumen -> Produsen", "Matahari -> Produsen -> Konsumen", "Konsumen -> Produsen -> Matahari", "Produsen -> Matahari -> Konsumen"], correctAnswer: 1 },
  { id: 9, type: 'mcq', category: 'Siklus', question: "Siklus biogeokimia yang tidak melalui atmosfer adalah...", options: ["Siklus Nitrogen", "Siklus Karbon", "Siklus Fosfor", "Siklus Air"], correctAnswer: 2 },
  { id: 10, type: 'mcq', category: 'Dasar', question: "Kumpulan individu sejenis yang menempati daerah tertentu disebut...", options: ["Individu", "Populasi", "Komunitas", "Ekosistem"], correctAnswer: 1 },
  { id: 11, type: 'mcq', category: 'Lanjut', question: "Eutrofikasi biasanya disebabkan oleh kelebihan unsur...", options: ["Karbon", "Oksigen", "Nitrogen dan Fosfor", "Zat Besi"], correctAnswer: 2 },
  { id: 12, type: 'mcq', category: 'Lanjut', question: "Efek rumah kaca disebabkan oleh meningkatnya kadar...", options: ["O2", "CO2", "N2", "H2"], correctAnswer: 1 },
  { id: 13, type: 'mcq', category: 'Siklus', question: "Bakteri yang mengubah amonia menjadi nitrit disebut...", options: ["Nitrosomonas", "Nitrobacter", "Rhizobium", "Azotobacter"], correctAnswer: 0 },
  { id: 14, type: 'mcq', category: 'Dasar', question: "Tingkatan organisasi kehidupan dari yang terkecil adalah...", options: ["Populasi-Individu-Komunitas", "Individu-Populasi-Komunitas", "Komunitas-Populasi-Individu", "Ekosistem-Komunitas-Populasi"], correctAnswer: 1 },
  { id: 15, type: 'mcq', category: 'Interaksi', question: "Anggrek yang menempel pada pohon inangnya termasuk simbiosis...", options: ["Mutualisme", "Komensalisme", "Parasitisme", "Kompetisi"], correctAnswer: 1 },
  { id: 16, type: 'mcq', category: 'Rantai Makanan', question: "Dekomposer memiliki peran penting untuk...", options: ["Menghasilkan oksigen", "Menguraikan materi organik", "Menangkap energi matahari", "Memangsa konsumen puncak"], correctAnswer: 1 },
  { id: 17, type: 'mcq', category: 'Siklus', question: "Belerang (Sulfur) masuk ke atmosfer melalui...", options: ["Fotosintesis", "Erupsi Gunung Berapi", "Transpirasi", "Infiltrasi"], correctAnswer: 1 },
  { id: 18, type: 'mcq', category: 'Lanjut', question: "Kompetisi interspesifik terjadi antara...", options: ["Individu sejenis", "Individu berbeda spesies", "Produsen dan Konsumen", "Dekomposer dan Detritivor"], correctAnswer: 1 },
  { id: 19, type: 'mcq', category: 'Dasar', question: "Ilmu yang mempelajari hubungan timbal balik antara makhluk hidup dengan lingkungannya adalah...", options: ["Biologi", "Ekologi", "Geologi", "Zoologi"], correctAnswer: 1 },
  { id: 20, type: 'mcq', category: 'Siklus', question: "Proses pembentukan awan disebut sebagai...", options: ["Evaporasi", "Sublimasi", "Kondensasi", "Infiltrasi"], correctAnswer: 2 },
  { id: 21, type: 'mcq', category: 'Lanjut', question: "Spesies yang kehadirannya sangat menentukan struktur komunitas disebut...", options: ["Spesies Pionir", "Spesies Kunci (Keystone)", "Spesies Eksotis", "Spesies Indikator"], correctAnswer: 1 },
  { id: 22, type: 'mcq', category: 'Interaksi', question: "Interaksi antara sapi dan rumput adalah...", options: ["Predasi", "Herbivori", "Kompetisi", "Mutualisme"], correctAnswer: 1 },
  { id: 23, type: 'mcq', category: 'Dasar', question: "Komponen abiotik yang mempengaruhi fotosintesis adalah...", options: ["Cacing tanah", "Karbon Dioksida", "Bakteri pengurai", "Belalang"], correctAnswer: 1 },
  { id: 24, type: 'mcq', category: 'Siklus', question: "Pelepasan nitrogen kembali ke atmosfer oleh bakteri dilakukan melalui proses...", options: ["Nitrifikasi", "Fiksasi", "Denitrifikasi", "Amonifikasi"], correctAnswer: 2 },
  { id: 25, type: 'mcq', category: 'Rantai Makanan', question: "Piramida yang menggambarkan berat kering total organisme disebut...", options: ["Piramida Jumlah", "Piramida Energi", "Piramida Biomassa", "Piramida Trofik"], correctAnswer: 2 },
  { id: 26, type: 'mcq', category: 'Dasar', question: "Zona perairan yang masih dapat ditembus cahaya matahari disebut...", options: ["Zona Afotik", "Zona Fotik", "Zona Bentik", "Zona Abisal"], correctAnswer: 1 },
  { id: 27, type: 'mcq', category: 'Lanjut', question: "Pencemaran sungai oleh limbah deterjen dapat menyebabkan...", options: ["Peningkatan Oksigen Terlarut", "Penurunan Pertumbuhan Alga", "Penurunan Oksigen Terlarut", "Penjernihan Air"], correctAnswer: 2 },
  { id: 28, type: 'mcq', category: 'Siklus', question: "Dalam siklus karbon, fotosintesis berperan untuk...", options: ["Melepas CO2 ke atmosfer", "Menyerap CO2 dari atmosfer", "Mengubah CO2 menjadi N2", "Membakar bahan bakar fosil"], correctAnswer: 1 },
  { id: 29, type: 'mcq', category: 'Interaksi', question: "Ikan remora yang mengikuti hiu untuk mendapat sisa makanan adalah contoh...", options: ["Mutualisme", "Komensalisme", "Parasitisme", "Predasi"], correctAnswer: 1 },
  { id: 30, type: 'mcq', category: 'Rantai Makanan', question: "Organisme yang menempati tingkat trofik ketiga adalah...", options: ["Produsen", "Konsumen Sekunder", "Konsumen Primer", "Dekomposer"], correctAnswer: 1 },
];

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
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(2400); // 40 minutes for 20 MCQs
  const [leaderboard, setLeaderboard] = useState<QuizResult[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const dailyQuestions = useMemo(() => {
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

    return shuffle(QUESTION_POOL, seed).slice(0, 20);
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
    if (examCompleted) {
      fetchLeaderboard();
    }
  }, [examCompleted]);

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    const results = await getDailyLeaderboard(today);
    setLeaderboard(results);
    setLoadingLeaderboard(false);
  };

  const handleStart = () => {
    setExamStarted(true);
  };

  const currentQuestion = dailyQuestions[currentIdx];

  const handleSubmit = async () => {
    setExamCompleted(true);
    let score = 0;
    dailyQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score += 1;
    });
    
    const xpEarned = score * 40; // 40 XP per correct answer = 800 XP max
    
    if (onXpGain) onXpGain(xpEarned);
    
    // Update Challenge Progress
    if (onUpdateProgress) {
        // Challenge 14: Selesaikan 3 sesi kuis (id '14')
        const currentQuizCount = profile?.challengeProgress?.['14'] || 0;
        onUpdateProgress('14', Math.min(3, currentQuizCount + 1));

        // Challenge 2: Selesaikan 1 sesi kuis tanpa salah (id '2')
        if (score === dailyQuestions.length) {
            onUpdateProgress('2', 1);
        }
    }

    // Save result to Firestore
    if (auth.currentUser) {
      const result: QuizResult = {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || profile?.displayName || 'Siswa',
        score: score,
        totalQuestions: dailyQuestions.length,
        xpEarned: xpEarned,
        date: today,
        createdAt: null
      };
      await saveQuizResult(result);
      fetchLeaderboard(); // Refresh after saving
    }
  };

  if (!examStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 pb-40">
         <div className="bg-white border border-gray-100 rounded-[48px] p-12 shadow-2xl text-center space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <FileText size={200} />
            </div>
            <div className="relative z-10 space-y-6">
               <div className="w-24 h-24 bg-[#4A7C44]/10 rounded-[32px] flex items-center justify-center text-4xl mx-auto text-[#4A7C44]">📝</div>
               <h2 className="text-5xl font-serif font-black text-gray-800 italic tracking-tight">Daily Ecology Quiz</h2>
               <p className="text-gray-400 max-w-sm mx-auto font-medium leading-relaxed">
                  Uji pemahamanmu secara mendalam melalui 20 soal pilihan ganda acak setiap hari.
               </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
               <InfoCard icon={<Clock size={20}/>} label="Waktu" value="40 Menit" />
               <InfoCard icon={<FileText size={20}/>} label="Soal" value="20 Butir" />
               <InfoCard icon={<Brain size={20}/>} label="Metode" value="Random Harian" />
            </div>
            <div className="flex flex-col gap-4 relative z-10">
               <button 
                 onClick={handleStart}
                 className="px-16 py-6 bg-[#4A7C44] text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-[#4A7C44]/20 hover:scale-105 active:scale-95 transition-all"
               >
                  Mulai Quiz
               </button>
               <button onClick={onBack} className="text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600 transition-all">Kembali</button>
            </div>
         </div>
      </div>
    );
  }

  if (examCompleted) {
    const correctCount = dailyQuestions.filter(q => answers[q.id] === q.correctAnswer).length;
    
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 pb-40">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-[48px] p-16 shadow-2xl space-y-16">
            <div className="text-center space-y-8">
               <div className="text-[100px] animate-bounce">🏆</div>
               <h2 className="text-5xl font-serif font-black text-gray-800">Quiz Selesai!</h2>
               <div className="grid grid-cols-2 gap-8 max-w-xl mx-auto">
                  <div className="p-10 bg-gray-50 rounded-[40px] border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Benar</p>
                     <p className="text-4xl font-black text-[#4A7C44]">{correctCount} / {dailyQuestions.length}</p>
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
                                 <p className="font-black text-[#4A7C44] text-lg">{res.score * (100 / res.totalQuestions)}%</p>
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
                <p className="text-sm font-bold text-gray-800">{currentQuestion.category}</p>
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
                           onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: i }))}
                           className={`p-8 rounded-[32px] text-left transition-all border-2 flex items-center justify-between group ${
                             answers[currentQuestion.id] === i 
                               ? 'border-[#4A7C44] bg-[#F1F6EE] text-[#4A7C44]' 
                               : 'border-gray-50 bg-gray-50 hover:border-gray-200 text-gray-500 hover:bg-gray-100'
                           }`}
                         >
                            <span className="font-bold text-lg">{opt}</span>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                               answers[currentQuestion.id] === i ? 'border-[#4A7C44] bg-[#4A7C44]' : 'border-gray-200'
                            }`}>
                               {answers[currentQuestion.id] === i && <CheckCircle size={16} className="text-white" />}
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
             {dailyQuestions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all flex-shrink-0 ${
                    i === currentIdx ? 'bg-[#4A7C44] w-6' : answers[dailyQuestions[i].id] !== undefined ? 'bg-[#4A7C44]/40' : 'bg-gray-200'
                  }`}
                />
             ))}
          </div>
          <button 
            disabled={currentIdx === dailyQuestions.length - 1}
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
