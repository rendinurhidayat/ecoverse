import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Brain, 
  Sparkles, 
  Save, 
  X, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToQuizzes, addQuiz, deleteQuiz, updateQuiz, clearQuizBank } from '../services/dbService';
import { QuizQuestion, UserProfile } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

export default function TeacherQuizBank({ profile }: { profile: UserProfile | null }) {
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizQuestion | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // AI Form State
  const [generationTopic, setGenerationTopic] = useState('');
  const [generationDifficulty, setGenerationDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [generationCount, setGenerationCount] = useState(5);

  useEffect(() => {
    const unsub = subscribeToQuizzes((data) => {
      setQuizzes(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(quizzes.map(q => q.category || 'Lainnya'));
    return ['Semua', ...Array.from(cats)].sort();
  }, [quizzes]);

  const validateQuizzes = () => {
    const errors: string[] = [];
    quizzes.forEach((q, idx) => {
      if (!q.question) errors.push(`Soal #${idx + 1}: Pertanyaan kosong.`);
      if (q.options.some(opt => !opt)) errors.push(`Soal #${idx + 1}: Ada pilihan jawaban yang kosong.`);
      if (q.correctIndex < 0 || q.correctIndex >= q.options.length) errors.push(`Soal #${idx + 1}: Kunci jawaban tidak valid.`);
    });
    
    if (errors.length === 0) {
      alert("✅ Seluruh bank soal valid!");
    } else {
      setValidationErrors(errors);
    }
  };

  const handleClearAll = async () => {
    const ids = quizzes.map(q => q.id!).filter(id => !!id);
    if (ids.length > 0) {
      setLoading(true);
      await clearQuizBank(ids);
      setShowClearConfirm(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const question = formData.get('question') as string;
    const category = formData.get('category') as string;
    const difficulty = formData.get('difficulty') as any;
    const options = [
      formData.get('opt0') as string,
      formData.get('opt1') as string,
      formData.get('opt2') as string,
      formData.get('opt3') as string,
    ];
    const correctIndex = parseInt(formData.get('correctIndex') as string);

    if (editingQuiz) {
      await updateQuiz(editingQuiz.id!, {
        question,
        category,
        difficulty,
        options,
        correctIndex
      });
      setEditingQuiz(null);
    } else {
      await addQuiz({
        question,
        category,
        difficulty,
        options,
        correctIndex,
        createdBy: profile?.uid
      });
    }
    setIsAdding(false);
  };

  const handleAIGenerate = async () => {
    if (!generationTopic) return;
    setIsGenerating(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Generate ${generationCount} multiple-choice test questions about: ${generationTopic}. 
      Target: High School Biology (Biologi SMA Kelas 10, 11, or 12).
      Difficulty level: ${generationDifficulty}.
      Respond in Indonesian.
      Each question must have 4 options and 1 correctIndex (0-3).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  minItems: 4,
                  maxItems: 4
                },
                correctIndex: { type: Type.INTEGER, minimum: 0, maximum: 3 },
                category: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] }
              },
              required: ['question', 'options', 'correctIndex', 'category', 'difficulty']
            }
          }
        }
      });

      const generated = JSON.parse(response.text);
      for (const q of generated) {
        await addQuiz({ ...q, createdBy: profile?.uid });
      }
      setGenerationTopic('');
    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowClearConfirm(false)}
               className="absolute inset-0 bg-red-950/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative bg-white rounded-[40px] p-10 max-w-md w-full text-center shadow-2xl border border-red-100"
             >
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                   <Trash2 size={40} />
                </div>
                <h3 className="text-2xl font-serif font-black text-gray-900 mb-4">Hapus Semua Soal?</h3>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                   Tindakan ini tidak dapat dibatalkan. Seluruh data di bank soal akan dihapus secara permanen dari basis data.
                </p>
                <div className="flex gap-4">
                   <button 
                     onClick={() => setShowClearConfirm(false)}
                     className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                   >
                     Batal
                   </button>
                   <button 
                     onClick={handleClearAll}
                     className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                   >
                     Ya, Hapus Semua
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[32px] border border-[#E0E7D9] shadow-sm">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0B0A0]" size={18} />
           <input 
             type="text"
             placeholder="Cari soal berdasarkan pertanyaan atau kategori..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-12 pr-4 py-3 bg-[#F1F6EE] border-none rounded-2xl focus:ring-2 focus:ring-[#4A7C44]/20 transition-all font-medium text-[#2D4F1E]"
           />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button 
             onClick={() => setIsAdding(true)}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#2D4F1E] text-white rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
           >
             <Plus size={18} /> Manual
           </button>
           <button 
             onClick={() => setGenerationTopic(generationTopic || 'Materi Biologi')}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#F1F6EE] text-[#4A7C44] border border-[#E0E7D9] rounded-2xl font-bold hover:bg-[#E0E7D9] transition-all"
           >
             <Sparkles size={18} /> AI Generate
           </button>
        </div>
      </div>

      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-50 border border-red-100 rounded-3xl p-6"
          >
             <div className="flex justify-between items-center mb-4">
                <h4 className="text-red-700 font-bold flex items-center gap-2">
                   <AlertCircle size={20} /> Masalah Validasi Ditemukan
                </h4>
                <button onClick={() => setValidationErrors([])} className="text-red-400 hover:text-red-600">
                   <X size={20} />
                </button>
             </div>
             <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {validationErrors.map((err, i) => (
                  <li key={i} className="text-xs text-red-600 flex items-center gap-2">
                     <span className="w-1 h-1 bg-red-400 rounded-full" /> {err}
                  </li>
                ))}
             </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Quiz List */}
        <div className="lg:col-span-8 space-y-4">
           <div className="flex items-center gap-4 mb-2 overflow-x-auto pb-2 custom-scrollbar">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[#2D4F1E] text-white' : 'bg-white text-[#5C6B5C] border border-[#E0E7D9] hover:bg-[#F1F6EE]'}`}
                >
                  {cat}
                </button>
              ))}
           </div>

           {loading ? (
             <div className="py-20 text-center">
                <Loader2 className="animate-spin mx-auto text-[#4A7C44] mb-4" size={32} />
                <p className="text-[#5C6B5C] font-medium">Memuat Bank Soal...</p>
             </div>
           ) : filteredQuizzes.length === 0 ? (
             <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-[#E0E7D9]">
                <AlertCircle className="mx-auto text-[#A0B0A0] mb-4" size={48} />
                <p className="text-[#2D4F1E] font-bold">Belum ada soal ditemukan</p>
                <p className="text-sm text-[#5C6B5C]">Buat soal baru secara manual atau gunakan AI untuk generate cepat.</p>
             </div>
           ) : (
             <div className="space-y-4">
               {filteredQuizzes.map((quiz) => (
                 <motion.div 
                   layout
                   key={quiz.id}
                   className="bg-white border border-[#E0E7D9] p-6 rounded-[32px] hover:shadow-md transition-all group"
                 >
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            quiz.difficulty === 'easy' ? 'bg-green-50 text-green-600' :
                            quiz.difficulty === 'hard' ? 'bg-red-50 text-red-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                             {quiz.difficulty || 'medium'}
                          </span>
                          <span className="px-3 py-1 bg-[#F1F6EE] text-[#4A7C44] text-[10px] font-bold uppercase tracking-wider rounded-full">
                             {quiz.category || 'Materi'}
                          </span>
                       </div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setEditingQuiz(quiz);
                              setIsAdding(true);
                            }}
                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Soal"
                          >
                             <Plus size={16} className="rotate-45" />
                          </button>
                          <button 
                            onClick={() => deleteQuiz(quiz.id!)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Soal"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                    <h4 className="text-lg font-serif font-black text-[#2D4F1E] mb-6 leading-relaxed">{quiz.question}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {quiz.options.map((opt, i) => (
                         <div key={i} className={`p-3 rounded-xl text-sm font-medium border ${i === quiz.correctIndex ? 'bg-[#F1F6EE] border-[#4A7C44] text-[#2D4F1E]' : 'bg-gray-50 border-gray-100 text-[#5C6B5C]'}`}>
                            <span className="opacity-50 mr-2">{String.fromCharCode(65 + i)}.</span>
                            {opt}
                         </div>
                       ))}
                    </div>
                 </motion.div>
               ))}
             </div>
           )}
        </div>

        {/* Right Side: AI Generation & Tools */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#2D4F1E] p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
              <Sparkles className="absolute -top-10 -right-10 w-40 h-40 text-white/5" />
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white/10 rounded-2xl">
                       <Brain size={24} />
                    </div>
                    <h3 className="text-xl font-serif font-black">Generate via AI</h3>
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Topik Pembahasan</label>
                       <input 
                         type="text"
                         placeholder="Contoh: Fotosintesis, Rantai Makanan..."
                         value={generationTopic}
                         onChange={(e) => setGenerationTopic(e.target.value)}
                         className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
                       />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Kesulitan</label>
                          <select 
                            value={generationDifficulty}
                            onChange={(e) => setGenerationDifficulty(e.target.value as any)}
                            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none"
                          >
                             <option value="easy" className="text-gray-900">Mudah</option>
                             <option value="medium" className="text-gray-900">Sedang</option>
                             <option value="hard" className="text-gray-900">Sulit</option>
                          </select>
                       </div>
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Jumlah Soal</label>
                          <input 
                            type="number"
                            min="1"
                            max="20"
                            value={generationCount}
                            onChange={(e) => setGenerationCount(parseInt(e.target.value))}
                            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none"
                          />
                       </div>
                    </div>

                    <button 
                      onClick={handleAIGenerate}
                      disabled={isGenerating || !generationTopic}
                      className="w-full py-4 bg-white text-[#2D4F1E] rounded-2xl font-black uppercase tracking-widest text-xs mt-4 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                      {isGenerating ? 'Sedang Generate...' : 'Generate Soal'}
                    </button>
                    <p className="text-[9px] text-center opacity-50 italic">AI akan memproses bank soal sesuai standar kurikulum 2013/Merdeka.</p>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-[#E0E7D9]">
              <h4 className="text-sm font-black text-[#2D4F1E] mb-6 uppercase tracking-widest">Alat Manajemen</h4>
              <div className="space-y-3">
                 <button 
                  onClick={() => setSelectedCategory('Semua')}
                  className="w-full p-4 border border-[#E0E7D9] rounded-2xl flex items-center justify-between text-left hover:bg-[#F1F6EE] transition-all"
                 >
                    <div className="flex items-center gap-3">
                       <Filter className="text-[#4A7C44]" size={18} />
                       <span className="text-sm font-bold text-[#5C6B5C]">Reset Filter</span>
                    </div>
                    <ChevronRight size={16} />
                 </button>
                 <button 
                   onClick={validateQuizzes}
                   className="w-full p-4 border border-[#E0E7D9] rounded-2xl flex items-center justify-between text-left hover:bg-[#F1F6EE] transition-all"
                 >
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="text-[#4A7C44]" size={18} />
                       <span className="text-sm font-bold text-[#5C6B5C]">Validasi Seluruh Soal</span>
                    </div>
                    <ChevronRight size={16} />
                 </button>
                 <button 
                   onClick={() => setShowClearConfirm(true)}
                   className="w-full p-4 border border-red-100 bg-red-50 rounded-2xl flex items-center justify-between text-left group transition-all"
                 >
                    <div className="flex items-center gap-3">
                       <Trash2 className="text-red-400 group-hover:text-red-600" size={18} />
                       <span className="text-sm font-bold text-red-600">Kosongkan Bank Soal</span>
                    </div>
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Manual Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsAdding(false)}
               className="absolute inset-0 bg-[#2D4F1E]/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white rounded-[40px] p-8 md:p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E0E7D9]"
             >
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-serif font-black text-[#2D4F1E]">
                      {editingQuiz ? 'Edit Soal' : 'Buat Soal Manual'}
                   </h3>
                   <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-[#F1F6EE] rounded-full transition-colors">
                      <X size={24} />
                   </button>
                </div>

                <form onSubmit={handleManualAdd} className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#5C6B5C] mb-2 block">Pertanyaan</label>
                      <textarea 
                        name="question"
                        required
                        defaultValue={editingQuiz?.question}
                        rows={3}
                        className="w-full bg-[#F1F6EE] border-none rounded-2xl px-4 py-3 font-medium text-[#2D4F1E] focus:ring-2 focus:ring-[#4A7C44]/20"
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-[#5C6B5C] mb-2 block">Kategori</label>
                         <input name="category" defaultValue={editingQuiz?.category} className="w-full bg-[#F1F6EE] border-none rounded-2xl px-4 py-3" />
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-[#5C6B5C] mb-2 block">Kesulitan</label>
                         <select name="difficulty" defaultValue={editingQuiz?.difficulty || 'medium'} className="w-full bg-[#F1F6EE] border-none rounded-2xl px-4 py-3">
                            <option value="easy">Mudah</option>
                            <option value="medium">Sedang</option>
                            <option value="hard">Sulit</option>
                         </select>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#5C6B5C] mb-2 block">Opsi Jawaban & Kunci</label>
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3 items-center">
                           <input 
                             type="radio" 
                             name="correctIndex" 
                             value={i} 
                             defaultChecked={editingQuiz?.correctIndex === i || (i === 0 && !editingQuiz)}
                             className="w-5 h-5 accent-[#4A7C44]"
                           />
                           <input 
                             name={`opt${i}`}
                             placeholder={`Pilihan ${String.fromCharCode(65+i)}`}
                             required
                             defaultValue={editingQuiz?.options[i]}
                             className="flex-1 bg-[#F1F6EE] border-none rounded-2xl px-4 py-3 font-medium"
                           />
                        </div>
                      ))}
                   </div>

                   <button 
                     type="submit"
                     className="w-full py-5 bg-[#2D4F1E] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                   >
                     <Save size={18} /> {editingQuiz ? 'Simpan Perubahan' : 'Terbitkan Soal'}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
