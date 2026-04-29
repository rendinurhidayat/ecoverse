import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  GraduationCap, 
  Trophy, 
  RefreshCcw, 
  User, 
  School, 
  Quote, 
  Save, 
  CheckCircle2, 
  Cloud, 
  Flame,
  Award,
  BookOpen,
  Gamepad2,
  Calendar
} from 'lucide-react';
import { UserProfile } from '../types';
import { addQuiz, updateUserProfile } from '../services/dbService';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsModule({ profile, onProfileUpdate }: { profile: UserProfile | null, onProfileUpdate?: (updated: UserProfile) => void }) {
  // Profile Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    displayName: profile?.displayName || '',
    school: profile?.school || '',
    bio: profile?.bio || ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Sync Logic
  useEffect(() => {
    if (profile) {
      setEditedProfile({
        displayName: profile.displayName || '',
        school: profile.school || '',
        bio: profile.bio || ''
      });
      setLastSaved(new Date());
    }
  }, [profile]);

  // Quiz Editor State
  const [newQuiz, setNewQuiz] = useState({ question: '', options: ['', '', '', ''], correct: 0 });
  const [quizLoading, setQuizLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setUpdateLoading(true);
    const updated = await updateUserProfile(profile.uid, editedProfile);
    if (updated && onProfileUpdate) {
      onProfileUpdate(updated);
      setIsEditing(false);
      setLastSaved(new Date());
    }
    setUpdateLoading(false);
  };

  const handleAddQuiz = async () => {
    if (!newQuiz.question || newQuiz.options.some(o=>!o)) return alert("Isi semua field!");
    setQuizLoading(true);
    await addQuiz({
      question: newQuiz.question,
      options: newQuiz.options,
      correctIndex: newQuiz.correct,
      createdBy: profile?.uid,
      difficulty: 'medium',
      category: 'User Created'
    });
    setQuizLoading(false);
    alert("Pertanyaan berhasil ditambahkan ke database!");
    setNewQuiz({ question: '', options: ['', '', '', ''], correct: 0 });
  };

  const syncStatus = lastSaved ? `Tersinkronisasi ${lastSaved.toLocaleTimeString()}` : 'Belum tersinkron';

  return (
    <div className="space-y-8 pb-20">
      {/* Top Banner / Sync Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#E0E7D9] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${lastSaved ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
            <Cloud size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#A0B0A0] uppercase tracking-widest">Status Cloud Core</p>
            <p className="text-sm font-bold text-[#2D4F1E] flex items-center gap-2">
              {syncStatus}
              {lastSaved && <CheckCircle2 size={14} className="text-green-500" />}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#F1F6EE] rounded-xl border border-[#E0E7D9]">
            <Flame size={18} className="text-orange-500 fill-orange-500" />
            <div>
              <p className="text-[8px] font-bold text-[#A0B0A0] uppercase tracking-tighter">Daily Streak</p>
              <p className="text-xs font-bold text-[#2D4F1E]">{profile?.streak || 1} Hari</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#F1F6EE] rounded-xl border border-[#E0E7D9]">
            <Award size={18} className="text-amber-500 fill-amber-500" />
            <div>
              <p className="text-[8px] font-bold text-[#A0B0A0] uppercase tracking-tighter">Level</p>
              <p className="text-xs font-bold text-[#2D4F1E]">{profile?.level || 1}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card & Editor */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white border border-[#E0E7D9] rounded-[32px] overflow-hidden shadow-sm flex flex-col"
        >
          <div className="p-8 bg-gradient-to-br from-[#4A7C44] to-[#2D4F1E] text-white relative overflow-hidden">
             {/* Abstract bio pattern */}
             <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 border-4 border-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 border-2 border-white rounded-full translate-y-1/2 -translate-x-1/2" />
             </div>

             <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[32px] flex items-center justify-center text-white font-serif text-4xl font-bold border-4 border-white/30 shadow-2xl">
                   {profile?.displayName?.[0] || 'S'}
                </div>
                <div className="text-center md:text-left flex-1">
                   <h4 className="text-3xl font-serif font-bold mb-1 tracking-tight">{profile?.displayName}</h4>
                   <p className="text-white/60 text-sm font-medium mb-3 flex items-center justify-center md:justify-start gap-2">
                     <School size={14} /> {profile?.school || "Belum Mengatur Nama Sekolah"}
                   </p>
                   <div className="flex flex-wrap justify-center md:justify-start gap-2">
                     <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">
                       ID: {profile?.uid.slice(0, 8)}...
                     </span>
                     <span className="px-3 py-1 bg-[#A4C400] text-[#2D4F1E] rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">
                       Penjaga Tier {profile?.level}
                     </span>
                   </div>
                </div>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-2xl border border-white/20"
                >
                  <SettingsIcon size={20} />
                </button>
             </div>
          </div>

          <div className="p-8 space-y-8">
             <AnimatePresence mode="wait">
               {isEditing ? (
                 <motion.div 
                   key="edit"
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="space-y-6 overflow-hidden"
                 >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#A0B0A0] uppercase tracking-widest flex items-center gap-2 ml-1">
                          <User size={12} /> Nama Profil
                        </label>
                        <input 
                          type="text"
                          value={editedProfile.displayName}
                          onChange={e => setEditedProfile({...editedProfile, displayName: e.target.value})}
                          className="w-full px-5 py-4 bg-[#F1F6EE] border border-[#E0E7D9] rounded-2xl text-sm focus:border-[#4A7C44] outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#A0B0A0] uppercase tracking-widest flex items-center gap-2 ml-1">
                          <School size={12} /> Sekolah
                        </label>
                        <input 
                          type="text"
                          value={editedProfile.school}
                          onChange={e => setEditedProfile({...editedProfile, school: e.target.value})}
                          className="w-full px-5 py-4 bg-[#F1F6EE] border border-[#E0E7D9] rounded-2xl text-sm focus:border-[#4A7C44] outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#A0B0A0] uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Quote size={12} /> Bio Singkat
                      </label>
                      <textarea 
                        rows={3}
                        value={editedProfile.bio}
                        onChange={e => setEditedProfile({...editedProfile, bio: e.target.value})}
                        className="w-full px-5 py-4 bg-[#F1F6EE] border border-[#E0E7D9] rounded-2xl text-sm focus:border-[#4A7C44] outline-none transition-all resize-none"
                        placeholder="Deskripsikan dirimu sebagai penjaga ekosistem..."
                      />
                    </div>
                    <div className="flex gap-4">
                       <button 
                         onClick={() => setIsEditing(false)}
                         className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
                       >
                         Batal
                       </button>
                       <button 
                         onClick={handleUpdateProfile}
                         disabled={updateLoading}
                         className="flex-1 py-4 bg-[#4A7C44] text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#4A7C44]/20 hover:bg-black transition-all flex items-center justify-center gap-2"
                       >
                         {updateLoading ? <RefreshCcw size={14} className="animate-spin" /> : <><Save size={14} /> Simpan Perubahan</>}
                       </button>
                    </div>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="stats"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="space-y-8"
                 >
                    {/* Bio Display */}
                    {profile?.bio && (
                      <div className="relative p-6 rounded-2xl bg-[#F1F6EE] border-l-4 border-[#4A7C44]">
                        <Quote size={40} className="absolute -top-4 -left-2 text-[#4A7C44] opacity-10" />
                        <p className="text-sm italic text-[#5C6B5C] font-medium leading-relaxed relative z-10">"{profile.bio}"</p>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Total XP', value: profile?.xp || 0, icon: <Award size={16} />, color: 'text-amber-600' },
                        { label: 'Quiz Selesai', value: profile?.completedQuizzes || 0, icon: <BookOpen size={16} />, color: 'text-indigo-600' },
                        { label: 'Level', value: profile?.level || 1, icon: <Trophy size={16} />, color: 'text-amber-500' },
                        { label: 'Saves', value: 0, icon: <Gamepad2 size={16} />, color: 'text-emerald-600' }, // Dummy for now
                      ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-[#E0E7D9] text-center hover:shadow-md transition-all">
                          <div className={`mx-auto mb-2 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center ${stat.color}`}>
                            {stat.icon}
                          </div>
                          <p className="text-[10px] font-bold text-[#A0B0A0] uppercase tracking-tighter mb-1">{stat.label}</p>
                          <p className="text-xl font-serif font-bold text-[#2D4F1E]">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Milestone Progress */}
                    <div className="bg-[#2D4F1E] rounded-3xl p-6 text-white overflow-hidden relative">
                       <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-12 translate-x-16" />
                       <div className="flex justify-between items-end mb-4">
                          <div>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-[#A4C400] mb-1">Target Milestone</p>
                             <h5 className="text-xl font-serif font-bold">Menuju Tier { (profile?.level || 1) + 1 }</h5>
                          </div>
                          <p className="text-xs font-bold font-mono">{(profile?.xp || 0) % 1000} / 1000 XP</p>
                       </div>
                       <div className="h-3 bg-white/10 rounded-full border border-white/20 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(profile?.xp || 0) % 1000 / 10}%` }}
                            className="h-full bg-gradient-to-r from-white/40 to-white"
                          />
                       </div>
                       <p className="mt-4 text-[11px] font-medium text-white/60 leading-relaxed uppercase tracking-tighter">
                         Teruslah belajar dan bereksperimen untuk membuka fitur penelitian lanjutan.
                       </p>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </motion.div>

        {/* Editor & Extra Tools */}
        <div className="space-y-8">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-white border border-[#E0E7D9] rounded-[32px] p-8 shadow-sm"
           >
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-[#F1F6EE] rounded-2xl text-[#4A7C44]">
                    <GraduationCap size={20}/>
                 </div>
                 <div>
                    <h4 className="font-serif font-bold text-[#2D4F1E] text-lg leading-tight text-balance">Editor Ujian</h4>
                    <p className="text-[10px] text-[#5C6B5C] font-bold uppercase tracking-widest">Bank Soal Komunitas</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[8px] font-bold text-[#A0B0A0] uppercase tracking-widest ml-2 flex items-center gap-1">
                       <Quote size={8} /> Pertanyaan
                    </label>
                    <textarea 
                       rows={2}
                       value={newQuiz.question} 
                       onChange={e=>setNewQuiz({...newQuiz, question: e.target.value})} 
                       placeholder="Sebutkan faktor abiotik yang..." 
                       className="w-full px-4 py-3 rounded-xl bg-[#F9FBF7] border border-[#E0E7D9] text-xs font-medium focus:border-[#4A7C44] outline-none transition-all resize-none" 
                    />
                 </div>

                 <div className="grid grid-cols-1 gap-2">
                    {newQuiz.options.map((o,i)=>(
                      <div key={i} className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold px-1.5 py-0.5 bg-white border border-[#E0E7D9] rounded text-[#4A7C44]">{String.fromCharCode(65 + i)}</span>
                         <input 
                            value={o} 
                            onChange={e=>{let n=[...newQuiz.options]; n[i]=e.target.value; setNewQuiz({...newQuiz, options: n})}} 
                            placeholder={`Opsi ${i+1}`} 
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E0E7D9] text-xs font-medium outline-none focus:border-[#4A7C44] transition-all" 
                         />
                      </div>
                    ))}
                 </div>

                 <div className="pt-2">
                    <select 
                       value={newQuiz.correct} 
                       onChange={e=>setNewQuiz({...newQuiz, correct: parseInt(e.target.value)})} 
                       className="w-full px-4 py-3 rounded-xl border border-[#E0E7D9] text-[10px] font-bold uppercase tracking-widest outline-none bg-[#F1F6EE] text-[#4A7C44]"
                    >
                       {newQuiz.options.map((_, i) => (
                          <option key={i} value={i}>Pilihan {String.fromCharCode(65 + i)} BENAR</option>
                       ))}
                    </select>
                 </div>

                 <button 
                   onClick={handleAddQuiz} 
                   disabled={quizLoading}
                   className="w-full py-4 bg-[#2D4F1E] text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-[#2D4F1E]/20 hover:bg-[#4A7C44] transition-all flex items-center justify-center gap-2"
                 >
                    {quizLoading ? <RefreshCcw size={14} className="animate-spin" /> : 'Sematkan Soal'}
                 </button>
              </div>
           </motion.div>

           {/* Achievements Preview */}
           <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-gradient-to-br from-[#F1F6EE] to-[#E0E7D9] rounded-[32px] p-8 border border-[#E0E7D9]"
           >
              <div className="flex items-center gap-3 mb-6">
                 <Trophy size={20} className="text-[#A4C400]" />
                 <h5 className="font-serif font-bold text-[#2D4F1E]">Capaian Terdekat</h5>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-white">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 grayscale opacity-40">
                       <Gamepad2 size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-[#2D4F1E] uppercase tracking-tighter">Biosfer Stabil</p>
                       <p className="text-[9px] text-[#5C6B5C] font-medium leading-tight">Simpan ekosistem dengan stabilitas 100%.</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-white">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 shadow-sm border border-orange-200">
                       <Calendar size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-[#2D4F1E] uppercase tracking-tighter">Penjaga Setia</p>
                       <p className="text-[9px] text-[#5C6B5C] font-medium leading-tight">Log in 7 hari berturut-turut.</p>
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
}
