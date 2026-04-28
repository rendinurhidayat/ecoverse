import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Edit2, X, Check, Search, Download, Sparkles, FileUp, Loader2 } from 'lucide-react';
import { getMaterials, saveMaterial, deleteMaterial } from '../services/dbService';
import { Flashcard } from '../types';
import { FLASHCARDS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

export default function LearningModule({ profile, onUpdateProgress }: { profile: any, onUpdateProgress?: (id: string, prog: number) => void }) {
  const [materials, setMaterials] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [readMaterials, setReadMaterials] = useState<Set<string>>(new Set());

  const handleRead = (id: string) => {
    if (!onUpdateProgress || !id) return;
    if (!readMaterials.has(id)) {
      const next = new Set(readMaterials);
      next.add(id);
      setReadMaterials(next);
      
      // Challenge 6: Buka 5 materi (id '6')
      onUpdateProgress('6', Math.min(5, next.size));
      
      // Challenge 15: Buka 10 materi (id '15')
      onUpdateProgress('15', Math.min(10, next.size));
    }
  };

  const [selectedGrade, setSelectedGrade] = useState<string>('Semua');
  const [selectedChapter, setSelectedChapter] = useState<string>('Semua');
  const [editing, setEditing] = useState<Partial<Flashcard> | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState('');

  const GRADES = ['Semua', '10', '11', '12'];
  const GRADE_CHAPTERS: Record<string, string[]> = {
    '10': ['BAB 1: Keanekaragaman Hayati', 'BAB 2: Virus', 'BAB 3: Bakteri', 'BAB 4: Protista', 'BAB 5: Fungi', 'BAB 6: Ekosistem', 'BAB 7: Perubahan Lingkungan'],
    '11': ['BAB 1: Sel', 'BAB 2: Jaringan', 'BAB 3: Sistem Gerak', 'BAB 4: Sirkulasi', 'BAB 5: Pencernaan', 'BAB 6: Respirasi', 'BAB 7: Ekskresi', 'BAB 8: Koordinasi', 'BAB 9: Reproduksi', 'BAB 10: Imun'],
    '12': ['BAB 1: Pertumbuhan', 'BAB 2: Metabolisme', 'BAB 3: Genetika', 'BAB 4: Pembelahan Sel', 'BAB 5: Pewarisan Sifat', 'BAB 6: Evolusi', 'BAB 7: Bioteknologi']
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    setSelectedChapter('Semua');
  }, [selectedGrade]);

  const loadMaterials = async () => {
    setLoading(true);
    const data = await getMaterials();
    setMaterials(data);
    setLoading(false);
  };

  const handleSeedMaterials = async () => {
    setLoading(true);
    for (const f of FLASHCARDS) {
      await saveMaterial(f);
    }
    await loadMaterials();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.question || !editing?.answer) return;
    await saveMaterial(editing as Flashcard);
    setEditing(null);
    loadMaterials();
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      alert("Materi ini tidak dapat dihapus (ID tidak ditemukan).");
      return;
    }
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    await deleteMaterial(deletingId);
    setDeletingId(null);
    loadMaterials();
  };

  const handleAIGenerate = async () => {
    if (!editing?.chapter || !editing?.grade) return;
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Generate an educational flashcard for Biology High School (Kurikulum Merdeka).
      Grade: ${editing.grade}
      Chapter: ${editing.chapter}
      Topic: ${editing.question || 'General important concept'}
      
      Respond in Indonesian.
      Ensure the explanation (answer) is clear, formal, and comprehensive.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "A specific question or concept name" },
              answer: { type: Type.STRING, description: "Detailed explanation or answer" }
            },
            required: ["question", "answer"]
          }
        }
      });

      const resultString = response.text || "{}";
      const result = JSON.parse(resultString);
      setEditing(prev => ({ ...prev, question: result.question, answer: result.answer }));
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("Gagal menjenerasi materi. Pastikan API Key valid.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleImport = async () => {
    const lines = importText.split('\n').filter(l => l.trim().includes(':'));
    if (lines.length === 0) {
      alert("Format salah. Gunakan 'Pertanyaan : Jawaban' per baris.");
      return;
    }

    setLoading(true);
    for (const line of lines) {
      const parts = line.split(':');
      const q = parts[0];
      const a = parts.slice(1).join(':');
      
      const material: Flashcard = {
        grade: selectedGrade !== 'Semua' ? selectedGrade : '10',
        chapter: selectedChapter !== 'Semua' ? selectedChapter : GRADE_CHAPTERS[selectedGrade !== 'Semua' ? selectedGrade : '10'][0],
        category: 'Dasar',
        question: q.trim(),
        answer: a.trim()
      };
      await saveMaterial(material);
    }
    setImportText('');
    setImporting(false);
    loadMaterials();
  };

  const filtered = materials.filter(m => {
    const matchesSearch = 
      m.question.toLowerCase().includes(search.toLowerCase()) || 
      m.answer.toLowerCase().includes(search.toLowerCase());
    const matchesGrade = selectedGrade === 'Semua' || m.grade === selectedGrade;
    const matchesChapter = selectedChapter === 'Semua' || m.chapter === selectedChapter;
    return matchesSearch && matchesGrade && matchesChapter;
  });

  return (
    <div className="space-y-12 pb-40">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full max-w-lg">
           <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
             type="text" value={search} onChange={e => setSearch(e.target.value)}
             placeholder="Cari konsep biologi..."
             className="w-full pl-14 pr-8 py-4 bg-white border border-gray-200 rounded-2xl focus:border-[#4A7C44] outline-none transition-all font-medium text-sm shadow-sm"
           />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setImporting(true)}
            className="p-4 bg-white border border-gray-200 text-gray-400 rounded-2xl hover:text-[#4A7C44] hover:border-[#4A7C44] transition-all"
            title="Impor Materi"
          >
            <FileUp size={20} />
          </button>
          {materials.length === 0 && !loading && (
             <button 
               onClick={handleSeedMaterials}
               className="flex-1 md:flex-none px-6 py-4 bg-white border border-[#4A7C44] text-[#4A7C44] rounded-2xl font-bold text-[11px] uppercase tracking-wider hover:bg-[#F1F6EE] transition-all"
             >
               Impor Standar
             </button>
          )}
          <button 
            onClick={() => setEditing({ grade: selectedGrade !== 'Semua' ? selectedGrade : '10', chapter: selectedChapter !== 'Semua' ? selectedChapter : 'BAB 1: Keanekaragaman Hayati', category: 'Dasar', question: '', answer: '' })}
            className="flex-1 md:flex-none px-8 py-4 bg-[#4A7C44] text-white rounded-2xl font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-[#4A7C44]/20 hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Tambah Materi
          </button>
        </div>
      </div>

      {/* Selectors Section */}
      <div className="space-y-6">
        {/* Grade Tabs */}
        <div className="flex items-center p-1.5 bg-gray-100 rounded-2xl w-fit">
          {GRADES.map(grade => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                selectedGrade === grade 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {grade === 'Semua' ? 'Semua' : `Kelas ${grade}`}
            </button>
          ))}
        </div>

        {/* Chapter Pills */}
        {(selectedGrade !== 'Semua' || selectedChapter !== 'Semua') && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedChapter('Semua')}
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
                selectedChapter === 'Semua' 
                  ? 'bg-[#4A7C44] text-white border-[#4A7C44]' 
                  : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
              }`}
            >
              Semua BAB
            </button>
            {selectedGrade !== 'Semua' && GRADE_CHAPTERS[selectedGrade].map(chap => (
              <button
                key={chap}
                onClick={() => setSelectedChapter(chap)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
                  selectedChapter === chap 
                    ? 'bg-[#4A7C44] text-white border-[#4A7C44]' 
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                }`}
              >
                {chap}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-32 text-center">
           <div className="w-10 h-10 border-2 border-gray-200 border-t-[#4A7C44] rounded-full animate-spin mx-auto mb-4" />
           <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Memuat data...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="py-24 text-center max-w-md mx-auto bg-white border border-gray-100 rounded-[32px] px-10 shadow-sm">
           <div className="w-16 h-16 bg-[#F1F6EE] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#4A7C44]">
              <BookOpen size={32} />
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">Ensiklopedia Kosong</h3>
           <p className="text-sm text-gray-500 mb-8 leading-relaxed">Belum ada materi pembelajaran. Silakan impor materi standar Kurikulum Merdeka atau mulai menulis manual.</p>
           <button onClick={handleSeedMaterials} className="px-8 py-4 bg-[#4A7C44] text-white rounded-2xl font-bold shadow-lg shadow-[#4A7C44]/20 hover:bg-gray-800 transition-all">Mulai Sekarang</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400 italic text-sm">Tidak ada materi yang sesuai dengan filter.</div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filtered.map((m) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={m.id || m.question}
            >
              <MaterialCard 
                material={m} 
                onEdit={() => setEditing(m)} 
                onDelete={() => handleDelete(m.id || '')} 
                onFlip={() => handleRead(m.id || '')}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {importing && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
               className="bg-white rounded-[32px] p-10 w-full max-w-2xl shadow-2xl relative border border-gray-100"
             >
                <button onClick={() => setImporting(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors"><X size={24}/></button>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Impor Materi Cepat</h3>
                <p className="text-sm text-gray-500 mb-8 font-medium">Pisahkan pertanyaan dan jawaban dengan titik dua (<span className="text-[#4A7C44] font-bold">:</span>).</p>
                
                <textarea 
                  value={importText} onChange={e => setImportText(e.target.value)}
                  placeholder="Apa itu Sel? : Unit terkecil makhluk hidup...&#10;Mitokondria : Organel penghasil energi..."
                  className="w-full h-72 p-6 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#4A7C44] outline-none transition-all font-medium leading-relaxed resize-none mb-6 text-sm"
                />

                <div className="flex gap-4 mb-8">
                   <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target Kelas</p>
                      <p className="font-bold text-gray-700">Kelas {selectedGrade !== 'Semua' ? selectedGrade : '10'}</p>
                   </div>
                   <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target BAB</p>
                      <p className="font-bold text-gray-700 truncate">{selectedChapter !== 'Semua' ? selectedChapter : 'Default'}</p>
                   </div>
                </div>

                <button 
                  onClick={handleImport}
                  className="w-full py-4 bg-[#4A7C44] text-white rounded-xl font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-[#4A7C44]/20 hover:bg-gray-800 transition-all"
                >
                   Konfirmasi Impor
                </button>
             </motion.div>
           </div>
        )}

        {editing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSave}
              className="bg-white rounded-[32px] p-10 w-full max-w-xl shadow-2xl relative border border-gray-100"
            >
              <button onClick={() => setEditing(null)} type="button" className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors"><X size={24}/></button>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">{editing.id ? 'Edit Materi' : 'Tambah Materi'}</h3>
              
              <div className="space-y-5 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Kelas</label>
                        <select 
                          value={editing.grade} onChange={e => setEditing({...editing, grade: e.target.value})}
                          className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none font-bold text-sm focus:border-[#4A7C44] focus:bg-white transition-all appearance-none"
                        >
                           <option value="10">Kelas 10</option>
                           <option value="11">Kelas 11</option>
                           <option value="12">Kelas 12</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Kategori</label>
                        <select 
                          value={editing.category} onChange={e => setEditing({...editing, category: e.target.value})}
                          className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none font-bold text-sm focus:border-[#4A7C44] focus:bg-white transition-all appearance-none"
                        >
                           <option value="Dasar">Dasar</option>
                           <option value="Interaksi">Interaksi</option>
                           <option value="Rantai Makanan">Rantai Makanan</option>
                           <option value="Siklus">Siklus</option>
                           <option value="Lanjut">Lanjut</option>
                        </select>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">BAB (Kurikulum Merdeka)</label>
                    <select 
                      value={editing.chapter} onChange={e => setEditing({...editing, chapter: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none font-bold text-sm focus:border-[#4A7C44] focus:bg-white transition-all appearance-none"
                    >
                       {editing.grade && GRADE_CHAPTERS[editing.grade].map(chap => (
                         <option key={chap} value={chap}>{chap}</option>
                       ))}
                    </select>
                 </div>
                 <div className="relative">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Pertanyaan / Topik</label>
                    <input 
                      type="text" value={editing.question} onChange={e => setEditing({...editing, question: e.target.value})}
                      placeholder="Masukkan pertanyaan atau topik..."
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none font-medium focus:border-[#4A7C44] focus:bg-white transition-all text-sm"
                    />
                    <button 
                      type="button"
                      onClick={handleAIGenerate}
                      disabled={aiLoading}
                      className="absolute right-3 bottom-1.5 p-2 bg-white text-[#4A7C44] rounded-lg shadow-sm border border-gray-100 disabled:opacity-50 hover:border-[#4A7C44] transition-all"
                      title="Generate with AI"
                    >
                       {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    </button>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Penjelasan</label>
                    <textarea 
                      rows={5} value={editing.answer} onChange={e => setEditing({...editing, answer: e.target.value})}
                      placeholder="Tuliskan jawaban atau penjelasan mendalam..."
                      className="w-full p-5 bg-gray-50 border border-transparent rounded-xl outline-none font-medium leading-relaxed resize-none focus:border-[#4A7C44] focus:bg-white transition-all text-sm"
                    />
                 </div>
              </div>

              <button className="w-full mt-10 py-4 bg-[#4A7C44] text-white rounded-xl font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-[#4A7C44]/20 hover:bg-gray-800 transition-all">
                 {editing.id ? 'Perbarui Materi' : 'Simpan Materi'}
              </button>
            </motion.form>
          </div>
        )}

        {deletingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-10 w-full max-w-sm shadow-2xl relative border border-gray-100 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Materi?</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">Tindakan ini tidak dapat dibatalkan. Materi akan dihapus permanen dari sistem.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MaterialCardProps {
  material: Flashcard;
  onEdit: () => void;
  onDelete: () => void;
  onFlip?: () => void;
}

function MaterialCard({ material, onEdit, onDelete, onFlip }: MaterialCardProps) {
  const [flipped, setFlipped] = useState(false);
  
  const handleFlip = () => {
    if (!flipped && onFlip) onFlip();
    setFlipped(!flipped);
  };

  return (
    <div className="relative h-96 cursor-pointer perspective-1000 group">
       <div className="absolute top-5 right-5 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-xl hover:text-[#4A7C44] hover:border-[#4A7C44] transition-all"
          >
            <Edit2 size={14}/>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-xl hover:text-red-500 hover:border-red-500 transition-all"
          >
            <Trash2 size={14}/>
          </button>
       </div>

      <motion.div 
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        onClick={handleFlip}
        className="w-full h-full relative preserve-3d"
      >
        {/* Front Side - Question */}
        <div className="absolute inset-0 bg-white border border-gray-100 rounded-[32px] p-8 flex flex-col justify-between items-center text-center backface-hidden shadow-sm group-hover:shadow-xl group-hover:border-[#F1F6EE] transition-all">
          <div className="flex flex-col items-center w-full">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 text-gray-400 group-hover:bg-[#F1F6EE] group-hover:text-[#4A7C44] transition-colors">
              <BookOpen size={20} />
            </div>
            <p className="text-[10px] font-bold text-[#A4C400] uppercase tracking-widest mb-4 font-sans">{material.category}</p>
            <h4 className="text-xl font-bold text-gray-900 leading-tight px-2 font-serif italic break-words w-full">
              {material.question}
            </h4>
          </div>
          
          <div className="w-full flex-shrink-0">
            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-4 group-hover:text-gray-400 font-sans">{material.chapter}</p>
            <div className="px-4 py-1.5 bg-gray-50 rounded-full text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:bg-gray-100 font-sans">
              Lihat Penjelasan
            </div>
          </div>
        </div>

        {/* Back Side - Explanation */}
        <div className="absolute inset-0 bg-gray-50 border border-gray-200 rounded-[32px] p-8 flex flex-col justify-between items-center text-center backface-hidden rotate-y-180 shadow-inner overflow-hidden">
          <div className="w-full h-full flex flex-col items-center overflow-y-auto py-2 custom-scrollbar">
            <div className="mb-4 flex-shrink-0">
               <Check size={20} className="text-[#4A7C44] mx-auto opacity-50" />
            </div>
            <p className="text-sm md:text-base font-medium leading-relaxed text-gray-600 px-2 font-sans w-full break-words">
              {material.answer}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 w-full flex-shrink-0">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-sans">
              Klik untuk kembali
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
