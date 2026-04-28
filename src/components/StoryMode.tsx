import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Leaf, Activity, Wind, Droplets, Shovel, Share2, Thermometer, Eye, FlaskConical, Target, Zap, Brain, RefreshCw } from 'lucide-react';
import { useEcosystemEngine } from '../hooks/useEcosystemEngine';
import { UNIFIED_STORY } from '../constants';
import { EcosystemState, MissionPhase, StoryProgress } from '../types';
import { getStoryProgress, saveStoryProgress } from '../services/dbService';
import { EcosystemVisuals } from './EcosystemVisuals';

interface StoryModeProps {
  engine: ReturnType<typeof useEcosystemEngine>;
  uid?: string;
}

// Typing hook for smooth narrative delivery
function useTypingEffect(text: string, speed: number = 20, active: boolean = true) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setDisplayedText(text);
      setIsDone(true);
      return;
    }

    setDisplayedText('');
    setIsDone(false);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsDone(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, active]);

  return { displayedText, isDone };
}

export default function StoryMode({ engine, uid }: StoryModeProps) {
  const { state, updateState } = engine;
  const [currentSceneId, setCurrentSceneId] = useState(1);
  const [phase, setPhase] = useState<MissionPhase>('observe');
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Load progress
  useEffect(() => {
    if (uid) {
      setLoadingProgress(true);
      getStoryProgress(uid).then(progress => {
        if (progress) {
          setCurrentSceneId(progress.currentSceneId);
          setPhase(progress.phase);
          setSelectedChoiceIndex(progress.selectedChoiceIndex ?? null);
          updateState(progress.state);
        }
        setLoadingProgress(false);
      });
    }
  }, [uid]);

  const saveProgress = async (sceneId: number, p: MissionPhase, choiceIdx: number | null = selectedChoiceIndex) => {
    if (uid) {
      await saveStoryProgress({
        uid,
        currentSceneId: sceneId,
        phase: p,
        selectedChoiceIndex: choiceIdx,
        state: engine.state,
        updatedAt: Date.now()
      });
    }
  };

  const currentSceneIndex = UNIFIED_STORY.findIndex(s => s.id === currentSceneId);
  const currentScene = UNIFIED_STORY[currentSceneIndex];
  
  const { displayedText, isDone: isTypingDone } = useTypingEffect(
    currentScene?.text || '', 
    15, 
    phase === 'observe'
  );

  const handleChoiceSelect = (index: number) => {
    setSelectedChoiceIndex(index);
    setPhase('decide');
    saveProgress(currentSceneId, 'decide', index);
  };

  const executeChoice = () => {
    if (selectedChoiceIndex === null) return;
    const choice = currentScene.choices[selectedChoiceIndex];
    updateState(choice.effect);
    setPhase('consequence');
    saveProgress(currentSceneId, 'consequence', selectedChoiceIndex);
  };

  const goToNextPhase = () => {
    let nextPhase: MissionPhase = phase;
    let nextSceneId = currentSceneId;

    if (phase === 'observe') nextPhase = 'experiment';
    else if (phase === 'experiment') nextPhase = 'decide';
    else if (phase === 'consequence') nextPhase = 'reflect';
    else if (phase === 'reflect') {
      const choice = currentScene.choices[selectedChoiceIndex!];
      if (choice.nextSceneId) {
        nextSceneId = choice.nextSceneId;
        nextPhase = 'observe';
        setSelectedChoiceIndex(null);
      } else {
        nextSceneId = -1; // Finished
      }
    }

    setPhase(nextPhase);
    setCurrentSceneId(nextSceneId);
    saveProgress(nextSceneId, nextPhase, nextPhase === 'observe' ? null : selectedChoiceIndex);
  };

  const getPhaseIcon = (p: MissionPhase) => {
    switch (p) {
      case 'observe': return <Eye size={18} />;
      case 'experiment': return <FlaskConical size={18} />;
      case 'decide': return <Target size={18} />;
      case 'consequence': return <Zap size={18} />;
      case 'reflect': return <Brain size={18} />;
    }
  };

  const getPhaseLabel = (p: MissionPhase) => {
    switch (p) {
      case 'observe': return 'Observasi';
      case 'experiment': return 'Eksperimen';
      case 'decide': return 'Keputusan';
      case 'consequence': return 'Konsekuensi';
      case 'reflect': return 'Refleksi';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[700px]">
      {/* Vitals & Loop Progress Sidebar */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white border border-[#E0E7D9] rounded-[32px] p-6 shadow-sm overflow-hidden relative">
          <div className="h-40 mb-6 relative">
            <EcosystemVisuals state={state} />
            {phase === 'observe' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 border-4 border-[#4A7C44] rounded-[28px] pointer-events-none"
              />
            )}
          </div>
          
          <p className="text-[10px] font-bold text-[#5C6B5C] uppercase tracking-widest mb-4">Alur Berpikir Ilmiah</p>
          <div className="space-y-2">
             {(['observe', 'experiment', 'decide', 'consequence', 'reflect'] as MissionPhase[]).map((p) => (
               <div key={p} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${phase === p ? 'bg-[#4A7C44] text-white shadow-md' : 'bg-[#F1F6EE] text-[#A0B0A0]'}`}>
                  {getPhaseIcon(p)}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{getPhaseLabel(p)}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white border border-[#E0E7D9] rounded-[32px] p-8 shadow-sm">
          <p className="text-[10px] font-bold text-[#5C6B5C] uppercase tracking-widest mb-6">Status Ekosistem</p>
          <div className="space-y-4">
             <VitalStat icon={<Leaf size={14}/>} label="Tumbuhan" value={state.plants} color="text-green-600" />
             <VitalStat icon={<Activity size={14}/>} label="Herbivora" value={state.herbivores} color="text-blue-500" />
             <VitalStat icon={<Activity size={14}/>} label="Karnivora" value={state.carnivores} color="text-red-500" />
             <VitalStat icon={<Wind size={14}/>} label="Oksigen" value={`${state.oxygen}%`} color="text-sky-400" />
             <VitalStat icon={<Droplets size={14}/>} label="Kualitas Air" value={`${state.waterQuality}%`} color="text-cyan-600" />
             <VitalStat icon={<Shovel size={14}/>} label="Kesuburan" value={`${state.soilFertility}%`} color="text-orange-900" />
             <VitalStat icon={<Thermometer size={14}/>} label="Stabilitas" value={`${Math.floor(state.stability)}%`} color="text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 bg-white border border-[#E0E7D9] rounded-[48px] p-8 lg:p-12 shadow-sm relative overflow-hidden flex flex-col min-h-[600px]">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F1F6EE] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#A4C400]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/2" />

        <AnimatePresence mode="wait">
          {currentSceneId === -1 ? (
             <motion.div 
               key="finish"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="h-full flex flex-col items-center justify-center text-center py-20"
             >
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="w-24 h-24 bg-[#4A7C44] text-white rounded-full flex items-center justify-center mb-8 shadow-2xl"
                >
                   <Leaf size={48} />
                </motion.div>
                <h3 className="text-4xl font-serif font-bold text-[#2D4F1E] mb-4">Misi Penjagaan Berhasil!</h3>
                <p className="text-[#5C6B5C] mb-12 text-lg max-w-md mx-auto">
                   Anda telah menyelesaikan seluruh siklus pembelajaran ilmiah. Ekosistem kini stabil berkat keputusan tepat Anda.
                </p>
                <button 
                   onClick={() => { setCurrentSceneId(1); setPhase('observe'); }}
                   className="px-12 py-5 bg-[#4A7C44] text-white rounded-[24px] font-bold hover:shadow-xl transition-all flex items-center gap-3 transform hover:-translate-y-1"
                >
                   <RefreshCw size={20} /> Mulai Petualangan Baru
                </button>
             </motion.div>
          ) : currentScene && (
            <motion.div 
              key={`${currentSceneId}-${phase}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full flex flex-col"
            >
              <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full relative z-10">
                 <div className="bg-[#F9FBF7]/80 backdrop-blur-md p-10 lg:p-14 rounded-[48px] border border-[#E0E7D9] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12 text-[#4A7C44]">
                       {getPhaseIcon(phase)}
                    </div>

                    <div className="space-y-8 relative">
                       <motion.div 
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A7C44]/10 text-[#4A7C44] rounded-full text-[10px] font-bold uppercase tracking-wider mb-4"
                       >
                          {getPhaseIcon(phase)} Phase: {getPhaseLabel(phase)}
                       </motion.div>

                       {phase === 'observe' && (
                          <div className="space-y-8">
                             <h3 className="text-3xl font-serif font-bold text-[#2D4F1E] leading-tight min-h-[4em]">
                               {displayedText}
                             </h3>
                             
                             <AnimatePresence>
                               {isTypingDone && (
                                 <motion.div 
                                   initial={{ opacity: 0, y: 10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   className="space-y-8"
                                 >
                                    <p className="text-lg text-[#5C6B5C] p-6 bg-white border-l-4 border-[#A4C400] rounded-r-2xl italic shadow-sm">
                                       "{currentScene.observationPrompt}"
                                    </p>
                                    <button 
                                      onClick={goToNextPhase} 
                                      className="w-full py-5 bg-[#4A7C44] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                                    >
                                       Mulai Eksperimen Virtual <ChevronRight size={18} />
                                    </button>
                                 </motion.div>
                               )}
                             </AnimatePresence>
                          </div>
                       )}

                       {phase === 'experiment' && (
                          <motion.div 
                             variants={containerVariants}
                             initial="hidden"
                             animate="visible"
                             className="space-y-6"
                          >
                             <motion.h3 variants={itemVariants} className="text-2xl font-serif font-bold text-[#2D4F1E]">Waktunya Eksperimen Virtual</motion.h3>
                             <motion.p variants={itemVariants} className="text-lg text-[#5C6B5C]">
                                Sebelum membuat keputusan permanen, gunakan simulasi untuk memprediksi hasil.
                             </motion.p>
                             <motion.div variants={itemVariants} className="p-8 bg-[#2D4F1E] text-white rounded-[32px] shadow-2xl relative overflow-hidden group">
                                <motion.div 
                                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                                  transition={{ repeat: Infinity, duration: 3 }}
                                  className="absolute inset-0 bg-white"
                                />
                                <div className="relative">
                                  <p className="text-xs font-bold uppercase tracking-widest text-[#A4C400] mb-4">Petunjuk dari Laboratorium:</p>
                                  <p className="text-xl font-bold font-serif leading-relaxed italic">"{currentScene.experimentHint}"</p>
                                </div>
                             </motion.div>
                             <motion.button 
                               variants={itemVariants}
                               onClick={goToNextPhase} 
                               className="w-full py-5 bg-[#4A7C44] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#3D6638] transition-colors"
                             >
                                Siap Membuat Keputusan <ChevronRight size={18} />
                             </motion.button>
                          </motion.div>
                       )}

                       {phase === 'decide' && (
                          <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-6"
                          >
                             <motion.h3 variants={itemVariants} className="text-2xl font-serif font-bold text-[#2D4F1E]">Pilih Intervensi Anda</motion.h3>
                             <div className="grid grid-cols-1 gap-4">
                                {currentScene.choices.map((choice, i) => (
                                   <motion.button 
                                      variants={itemVariants}
                                      key={i}
                                      onClick={() => handleChoiceSelect(i)}
                                      className={`p-6 border-2 transition-all rounded-[28px] text-left group flex items-center justify-between ${selectedChoiceIndex === i ? 'bg-[#4A7C44] border-[#4A7C44] text-white shadow-xl scale-[1.02]' : 'bg-white border-[#E0E7D9] text-[#2D4F1E] hover:border-[#4A7C44] hover:bg-[#F9FBF7]'}`}
                                   >
                                      <div className="flex-1">
                                        <span className="font-bold text-lg block mb-1">{choice.text}</span>
                                        <span className={`text-xs opacity-60 ${selectedChoiceIndex === i ? 'text-white' : 'text-[#5C6B5C]'}`}>Pilih opsi ini untuk menerapkan strategi</span>
                                      </div>
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selectedChoiceIndex === i ? 'bg-white text-[#4A7C44]' : 'bg-[#F1F6EE] text-[#A0B0A0] group-hover:bg-[#4A7C44] group-hover:text-white'}`}>
                                         <Target size={20} />
                                      </div>
                                   </motion.button>
                                ))}
                             </div>
                             {selectedChoiceIndex !== null && (
                                <motion.button 
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   onClick={executeChoice} 
                                   className="w-full py-6 bg-[#A4C400] text-[#2D4F1E] rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                                >
                                   TERAPKAN KEPUTUSAN
                                </motion.button>
                             )}
                          </motion.div>
                       )}

                       {phase === 'consequence' && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8 text-center"
                          >
                             <motion.div 
                               animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                               transition={{ repeat: Infinity, duration: 2 }}
                               className="w-24 h-24 bg-yellow-400 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl"
                             >
                                <Zap size={40} className="text-white" />
                             </motion.div>
                             <h3 className="text-3xl font-serif font-bold text-[#2D4F1E]">Efek Terdeteksi!</h3>
                             <motion.div 
                               initial={{ opacity: 0 }}
                               animate={{ opacity: 1 }}
                               transition={{ delay: 0.3 }}
                               className="p-8 bg-white border border-[#E0E7D9] rounded-[32px] shadow-sm relative"
                             >
                               <p className="text-xl text-[#5C6B5C] font-medium leading-relaxed italic">
                                  {currentScene.choices[selectedChoiceIndex!].explanation}
                               </p>
                             </motion.div>
                             <div className="grid grid-cols-2 gap-4 py-8">
                                <div className="p-4 bg-[#F1F6EE] rounded-2xl border border-[#E0E7D9]">
                                   <p className="text-[10px] font-bold text-[#A0B0A0] uppercase tracking-widest mb-1">Impact Level</p>
                                   <p className="text-xl font-black text-[#4A7C44]">SIGNIFIKAN</p>
                                </div>
                                <div className="p-4 bg-[#F1F6EE] rounded-2xl border border-[#E0E7D9]">
                                   <p className="text-[10px] font-bold text-[#A0B0A0] uppercase tracking-widest mb-1">Status</p>
                                   <p className="text-xl font-black text-[#2D4F1E]">AKTIF</p>
                                </div>
                             </div>
                             <button onClick={goToNextPhase} className="w-full py-5 bg-[#4A7C44] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all">
                                Masuk ke Tahap Refleksi <ChevronRight size={18} />
                             </button>
                          </motion.div>
                       )}

                       {phase === 'reflect' && (
                          <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-8"
                          >
                             <motion.h3 variants={itemVariants} className="text-2xl font-serif font-bold text-[#2D4F1E]">Tinjauan & Refleksi</motion.h3>
                             <motion.div variants={itemVariants} className="p-8 bg-[#F1F6EE] rounded-[32px] border-2 border-dashed border-[#A0B0A0]">
                                <p className="text-xl text-[#2D4F1E] font-medium leading-relaxed italic">
                                   "{currentScene.reflectionQuestion}"
                                </p>
                             </motion.div>
                             <motion.textarea 
                                variants={itemVariants}
                                className="w-full p-8 bg-white border-2 border-[#E0E7D9] rounded-[32px] outline-none focus:border-[#4A7C44] transition-all text-[#2D4F1E] font-medium shadow-inner"
                                placeholder="Tuliskan hasil analisis Anda di sini sebagai catatan ilmiah..."
                                rows={4}
                             />
                             <motion.button 
                                variants={itemVariants}
                                onClick={goToNextPhase} 
                                className="w-full py-6 bg-[#A4C400] text-[#2D4F1E] rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-2xl transition-all"
                             >
                                Simpan Analisis & Lanjut <ChevronRight size={20} />
                             </motion.button>
                          </motion.div>
                       )}
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function VitalStat({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  return (
    <div className="flex items-center justify-between group py-1">
       <div className="flex items-center gap-3">
          <motion.span 
            whileHover={{ scale: 1.2, rotate: 10 }}
            className={`${color} opacity-60 group-hover:opacity-100 transition-opacity`}
          >
            {icon}
          </motion.span>
          <span className="text-[10px] font-bold text-[#5C6B5C] group-hover:text-[#2D4F1E] transition-colors">{label}</span>
       </div>
       <span className="font-mono text-xs font-bold text-[#2D4F1E] bg-[#F1F6EE] px-2 py-0.5 rounded-md min-w-[3rem] text-right">{value}</span>
    </div>
  );
}
