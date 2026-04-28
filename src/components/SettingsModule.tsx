import React, { useState } from 'react';
import { Settings as SettingsIcon, GraduationCap, Trophy, RefreshCcw } from 'lucide-react';
import { UserProfile } from '../types';
import { addQuiz } from '../services/dbService';
import { motion } from 'framer-motion';

export default function SettingsModule({ profile }: { profile: UserProfile | null }) {
  const [newQuiz, setNewQuiz] = useState({ question: '', options: ['', '', '', ''], correct: 0 });
  const [loading, setLoading] = useState(false);

  const handleAddQuiz = async () => {
    if (!newQuiz.question || newQuiz.options.some(o=>!o)) return alert("Isi semua field!");
    setLoading(true);
    await addQuiz({
      question: newQuiz.question,
      options: newQuiz.options,
      correctIndex: newQuiz.correct,
      createdBy: profile?.uid,
      difficulty: 'medium',
      category: 'User Created'
    });
    setLoading(false);
    alert("Pertanyaan berhasil ditambahkan ke database!");
    setNewQuiz({ question: '', options: ['', '', '', ''], correct: 0 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-white border border-[#E0E7D9] rounded-[32px] p-8 shadow-sm flex flex-col"
       >
          <div className="flex items-center gap-3 mb-8">
             <div className="p-3 bg-[#F1F6EE] rounded-2xl text-[#4A7C44]">
                <SettingsIcon size={24}/>
             </div>
             <div>
                <h4 className="font-serif font-bold text-[#2D4F1E] text-xl">Profil Pelajar</h4>
                <p className="text-xs text-[#5C6B5C] font-medium">Informasi akun dan progres belajar Anda</p>
             </div>
          </div>

          <div className="space-y-6 flex-1">
             <div className="flex items-center gap-6 p-6 rounded-[24px] bg-[#F1F6EE] border border-[#E0E7D9]">
                <div className="w-20 h-20 bg-[#4A7C44] rounded-[24px] flex items-center justify-center text-white font-serif text-4xl font-bold shadow-xl shadow-[#4A7C44]/20 border-4 border-white">
                   {profile?.displayName?.[0] || 'S'}
                </div>
                <div>
                   <p className="font-serif font-bold text-2xl text-[#2D4F1E]">{profile?.displayName}</p>
                   <p className="text-sm text-[#5C6B5C] font-medium opacity-70">{profile?.email}</p>
                   <div className="mt-2 inline-flex items-center gap-2 bg-[#4A7C44]/10 text-[#4A7C44] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#4A7C44]/20">
                      Penjaga Tier {profile?.level}
                   </div>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-[24px] border border-[#E0E7D9] bg-white text-center">
                   <p className="text-[10px] font-bold text-[#A0B0A0] uppercase mb-1 tracking-widest">Total XP</p>
                   <p className="text-3xl font-serif font-bold text-[#4A7C44]">{profile?.xp || 0}</p>
                </div>
                <div className="p-6 rounded-[24px] border border-[#E0E7D9] bg-white text-center">
                   <p className="text-[10px] font-bold text-[#A0B0A0] uppercase mb-1 tracking-widest">Quiz Selesai</p>
                   <p className="text-3xl font-serif font-bold text-[#2D4F1E]">{profile?.completedQuizzes || 0}</p>
                </div>
             </div>
          </div>
          
          <div className="mt-8 p-4 bg-[#2D4F1E] rounded-2xl text-white">
             <div className="flex items-center gap-3 mb-2">
                <Trophy size={16} className="text-[#A4C400]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Pencapaian Berikutnya</span>
             </div>
             <p className="text-sm font-medium opacity-80">Selesaikan 5 misi lagi untuk membuka habitat 'Lembah Kabut'.</p>
          </div>
       </motion.div>

       <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.1 }}
         className="bg-white border border-[#E0E7D9] rounded-[32px] p-8 shadow-sm"
       >
          <div className="flex items-center gap-3 mb-8">
             <div className="p-3 bg-[#F1F6EE] rounded-2xl text-[#4A7C44]">
                <GraduationCap size={24}/>
             </div>
             <div>
                <h4 className="font-serif font-bold text-[#2D4F1E] text-xl">Editor Ujian</h4>
                <p className="text-xs text-[#5C6B5C] font-medium">Bantu perkaya bank soal untuk siswa lain</p>
             </div>
          </div>

          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-bold text-[#5C6B5C] uppercase tracking-widest mb-2 block ml-2">Pertanyaan</label>
                <textarea 
                   rows={2}
                   value={newQuiz.question} 
                   onChange={e=>setNewQuiz({...newQuiz, question: e.target.value})} 
                   placeholder="Apa yang terjadi jika..." 
                   className="w-full p-4 rounded-2xl border border-[#E0E7D9] text-sm focus:border-[#4A7C44] outline-none transition-all resize-none" 
                />
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-bold text-[#5C6B5C] uppercase tracking-widest mb-1 block ml-2">Pilihan Jawaban</label>
                {newQuiz.options.map((o,i)=>(
                  <div key={i} className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#A0B0A0]">{String.fromCharCode(65 + i)}</span>
                     <input 
                        value={o} 
                        onChange={e=>{let n=[...newQuiz.options]; n[i]=e.target.value; setNewQuiz({...newQuiz, options: n})}} 
                        placeholder={`Opsi ${i+1}`} 
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E0E7D9] text-sm outline-none focus:border-[#4A7C44] transition-all" 
                     />
                  </div>
                ))}
             </div>

             <div className="pt-2">
                <label className="text-[10px] font-bold text-[#5C6B5C] uppercase tracking-widest mb-2 block ml-2">Jawaban Benar</label>
                <select 
                   value={newQuiz.correct} 
                   onChange={e=>setNewQuiz({...newQuiz, correct: parseInt(e.target.value)})} 
                   className="w-full p-4 rounded-xl border border-[#E0E7D9] text-sm outline-none bg-[#F1F6EE] font-bold text-[#4A7C44]"
                >
                   {newQuiz.options.map((_, i) => (
                      <option key={i} value={i}>Pilihan {String.fromCharCode(65 + i)} Benar</option>
                   ))}
                </select>
             </div>

             <button 
               onClick={handleAddQuiz} 
               disabled={loading}
               className="w-full py-4 bg-[#4A7C44] text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all mt-4 flex items-center justify-center gap-2"
             >
                {loading ? <RefreshCcw size={18} className="animate-spin" /> : 'Simpan Pertanyaan'}
             </button>
          </div>
       </motion.div>
    </div>
  );
}
