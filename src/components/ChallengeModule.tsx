import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Zap, Clock, Star, Gift, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { UserProfile } from '../types';

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'sandbox' | 'quiz' | 'lab' | 'learn';
  difficulty: 'easy' | 'medium' | 'hard';
  targetValue: number;
}

const CHALLENGE_POOL: Challenge[] = [
  { id: '1', title: 'Pemula Ekologi', description: 'Tambahkan 10 flora di Sandbox Mode.', reward: 100, type: 'sandbox', difficulty: 'easy', targetValue: 10 },
  { id: '2', title: 'Kuis Sempurna', description: 'Selesaikan 1 sesi kuis tanpa salah.', reward: 250, type: 'quiz', difficulty: 'hard', targetValue: 1 },
  { id: '3', title: 'Stabilitas Terjaga', description: 'Pertahankan stabilitas >85% di ekosistem.', reward: 200, type: 'sandbox', difficulty: 'medium', targetValue: 85 },
  { id: '4', title: 'Eksplorasi Laboratorium', description: 'Simulasikan skenario di Lab Virtual.', reward: 150, type: 'lab', difficulty: 'medium', targetValue: 1 },
  { id: '5', title: 'Ahli Jaring Makanan', description: 'Capai keanekaragaman hayati >70%.', reward: 300, type: 'sandbox', difficulty: 'hard', targetValue: 70 },
  { id: '6', title: 'Pembaca Setia', description: 'Buka 5 materi ensiklopedia berbeda.', reward: 100, type: 'learn', difficulty: 'easy', targetValue: 5 },
  { id: '7', title: 'Predator Puncak', description: 'Tambahkan 5 Elang di hutan.', reward: 150, type: 'sandbox', difficulty: 'medium', targetValue: 5 },
  { id: '8', title: 'Fotosintesis Maksimal', description: 'Capai kadar oksigen 100% di Lab.', reward: 200, type: 'lab', difficulty: 'medium', targetValue: 100 },
  { id: '9', title: 'Penguasa Padang Rumput', description: 'Tambahkan 20 herbivora di Sandbox.', reward: 150, type: 'sandbox', difficulty: 'medium', targetValue: 20 },
  { id: '10', title: 'Rantai Makanan Seimbang', description: 'Tambahkan 10 karnivora di Sandbox.', reward: 200, type: 'sandbox', difficulty: 'medium', targetValue: 10 },
  { id: '11', title: 'Langit Ramai', description: 'Tambahkan 10 burung di langit.', reward: 120, type: 'sandbox', difficulty: 'medium', targetValue: 10 },
  { id: '12', title: 'Pasukan Kecil', description: 'Tambahkan 30 serangga di ekosistem.', reward: 120, type: 'sandbox', difficulty: 'medium', targetValue: 30 },
  { id: '13', title: 'Mata Air Murni', description: 'Capai kualitas air 100% di Sandbox.', reward: 200, type: 'sandbox', difficulty: 'medium', targetValue: 100 },
  { id: '14', title: 'Pelajar Tekun', description: 'Selesaikan 3 sesi kuis hari ini.', reward: 300, type: 'quiz', difficulty: 'medium', targetValue: 3 },
  { id: '15', title: 'Wawasan Luas', description: 'Buka 10 materi ensiklopedia.', reward: 200, type: 'learn', difficulty: 'medium', targetValue: 10 },
  { id: '16', title: 'Saintis Muda', description: 'Simulasikan 3 skenario lab berbeda.', reward: 300, type: 'lab', difficulty: 'hard', targetValue: 3 },
];

export default function ChallengeModule({ profile, onComplete, onNavigate }: { profile: UserProfile | null, onComplete: (xp: number) => void, onNavigate?: (tab: 'sandbox' | 'quiz' | 'lab' | 'learn') => void }) {
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    // Generate daily challenges based on date
    const today = new Date().toDateString();
    const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Select 3 unique challenges from pool using the hash
    const selected: Challenge[] = [];
    const poolCopy = [...CHALLENGE_POOL];
    for (let i = 0; i < 3; i++) {
        const index = (hash + i * 7) % poolCopy.length;
        if (poolCopy[index]) {
            selected.push(poolCopy.splice(index, 1)[0]);
        }
    }
    setDailyChallenges(selected);
  }, []);

  // Get real progress from profile
  const getProgress = (id: string, target: number) => {
    if (!profile?.challengeProgress) return 0;
    return profile.challengeProgress[id] || 0;
  };

  return (
    <div className="space-y-10">
      <div className="bg-[#2D4F1E] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">Misi Hari Ini</span>
              <span className="text-white/50 text-xs font-medium">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <h3 className="text-4xl font-serif font-bold mb-4">Jadilah Penjaga Alam Sejati</h3>
            <p className="text-white/70 max-w-lg mb-8 leading-relaxed">Tantangan harian dirancang untuk menguji ketangguhan Anda dalam mengelola ekosistem digital. Selesaikan hari ini sebelum reset pukul 00:00.</p>
            <div className="flex gap-10">
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 font-mono">Tersedia</span>
                  <span className="text-3xl font-serif font-bold text-[#A4C400]">{dailyChallenges.length} Tantangan</span>
               </div>
               <div className="w-px h-12 bg-white/10" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 font-mono">Status Akun</span>
                  <span className="text-3xl font-serif font-bold">Tier {profile?.level || 1}</span>
               </div>
            </div>
         </div>
         <Star size={240} className="absolute -right-24 -bottom-24 text-white/5 rotate-12" />
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#A4C400] blur-[150px] opacity-10 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {dailyChallenges.map((c, i) => {
           const progress = getProgress(c.id, c.targetValue);
           const percent = (progress / c.targetValue) * 100;
           const isComplete = progress >= c.targetValue;

           return (
             <motion.div 
               key={c.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               className={`bg-white border-2 rounded-[32px] p-8 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden ${isComplete ? 'border-[#4A7C44]/40 bg-[#F1F6EE]/30' : 'border-[#E0E7D9] hover:border-[#4A7C44]'}`}
             >
                <div className="flex justify-between items-start mb-8">
                   <div className={`p-4 rounded-2xl shadow-sm ${c.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' : c.difficulty === 'medium' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      <Target size={28} />
                   </div>
                   <div className="flex items-center gap-2 bg-[#F1F6EE] px-4 py-2 rounded-full border border-[#E0E7D9]">
                      <Zap size={14} className="text-[#4A7C44]" />
                      <span className="text-sm font-black text-[#4A7C44]">+{c.reward} XP</span>
                   </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-2xl font-serif font-bold text-[#2D4F1E] mb-2 flex items-center gap-3">
                    {c.title}
                    {isComplete && <CheckCircle2 size={24} className="text-[#4A7C44]" />}
                  </h4>
                  <p className="text-sm text-[#5C6B5C] font-medium leading-relaxed">{c.description}</p>
                </div>
                
                {/* Progress Bar UI */}
                <div className="space-y-3 mb-8">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-[#A0B0A0] uppercase tracking-widest">Progress</span>
                      <span className="text-sm font-mono font-bold text-[#4A7C44]">{progress} / {c.targetValue}</span>
                   </div>
                   <div className="h-3 bg-[#F1F6EE] rounded-full overflow-hidden border border-[#E0E7D9]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={`h-full transition-all duration-1000 ${isComplete ? 'bg-[#4A7C44]' : 'bg-[#A4C400]'}`}
                      />
                   </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[#E0E7D9]">
                   <div className="flex items-center gap-2 text-[#A0B0A0]">
                      <Clock size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Edisi Terbatas</span>
                   </div>
                   <button 
                    onClick={() => {
                      if (onNavigate && !isComplete) {
                        onNavigate(c.type);
                      }
                    }}
                    disabled={isComplete}
                    className={`px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${
                      isComplete 
                      ? 'bg-emerald-100/50 text-emerald-600 cursor-default' 
                      : 'bg-[#4A7C44] text-white hover:bg-black hover:shadow-lg'
                    }`}
                   >
                     {isComplete ? 'Selesai' : `Mulai Di ${c.type.charAt(0).toUpperCase() + c.type.slice(1)}`}
                     {!isComplete && <ChevronRight size={16} />}
                   </button>
                </div>
             </motion.div>
           );
         })}
      </div>

      <div className="bg-gradient-to-br from-[#4A7C44] to-[#2D4F1E] rounded-[40px] p-12 flex flex-col md:flex-row items-center gap-12 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
         <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-[40px] flex items-center justify-center shadow-2xl text-[#A4C400] rotate-6 border border-white/20 shrink-0">
            <Gift size={64} />
         </div>
         <div className="flex-1 text-center md:text-left">
            <h4 className="text-3xl font-serif font-bold mb-3">Program Penghargaan</h4>
            <p className="text-white/70 font-medium leading-relaxed max-w-xl">Setiap tantangan yang diselesaikan berkontribusi pada progres Tier Profile Anda. Kumpulkan total 5000 XP untuk membuka Habitat 'Lembah Kabut'!</p>
         </div>
         <button className="w-full md:w-auto px-12 py-6 bg-white text-[#2D4F1E] rounded-3xl font-black shadow-xl hover:scale-105 transition-all text-sm uppercase tracking-widest">Klaim Hadiah</button>
      </div>
    </div>
  );
}
