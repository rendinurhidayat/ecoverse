import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RefreshCw, Activity, Thermometer, Droplets, Leaf, Wind, Shovel, Share2, Sun, CloudRain, Loader2, Info, X, Zap, Trophy, Timer, Target } from 'lucide-react';
import { useEcosystemEngine } from '../hooks/useEcosystemEngine';
import { EcosystemState, WeatherType } from '../types';
import { ORGANISM_DETAILS } from '../constants';
import { EcosystemVisuals } from './EcosystemVisuals';

interface SandboxModeProps {
  engine: ReturnType<typeof useEcosystemEngine>;
  uid?: string;
  onSaveSuccess?: () => void;
  onXpGain?: (xp: number) => void;
  onUpdateProgress?: (challengeId: string, progress: number) => void;
}

interface MiniChallenge {
  id: string;
  title: string;
  description: string;
  targetMetric: keyof EcosystemState;
  targetValue: number;
  duration: number; // in seconds
  reward: string;
}

const CHALLENGES: MiniChallenge[] = [
  {
    id: 'stability_high',
    title: 'Penjaga Harmoni',
    description: 'Stabilkan ekosistem hingga Indeks Stabilitas mencapai 90%!',
    targetMetric: 'stability',
    targetValue: 90,
    duration: 100,
    reward: 'Gelar: Maestro Keseimbangan'
  },
  {
    id: 'biodiversity_surge',
    title: 'Ledakan Hayati',
    description: 'Bawa Keanekaragaman Hayati melampaui angka 75%!',
    targetMetric: 'biodiversity',
    targetValue: 75,
    duration: 150,
    reward: 'Gelar: Pelopor Biodiversitas'
  },
  {
    id: 'oxygen_pure',
    title: 'Atmosfer Murni',
    description: 'Tingkatkan Kadar Oksigen hingga 85%!',
    targetMetric: 'oxygen',
    targetValue: 85,
    duration: 120,
    reward: 'Gelar: Penjaga Udara'
  },
  {
    id: 'water_crystal',
    title: 'Air Kristal',
    description: 'Tingkatkan Kualitas Air hingga mencapai 90%!',
    targetMetric: 'waterQuality',
    targetValue: 90,
    duration: 120,
    reward: 'Gelar: Ahli Hidrologi'
  },
  {
    id: 'forest_rebound',
    title: 'Hutan Abadi',
    description: 'Tingkatkan jumlah Flora hingga mencapai 50 unit!',
    targetMetric: 'plants',
    targetValue: 50,
    duration: 180,
    reward: 'Gelar: Arsitek Hutan'
  }
];

const WEATHER_INFO: Record<WeatherType, { label: string, icon: React.ReactNode, color: string, description: string }> = {
  normal: { label: 'Normal', icon: <Sun size={20} />, color: 'text-yellow-500', description: 'Kondisi lingkungan stabil.' },
  hujan: { label: 'Hujan Ringan', icon: <CloudRain size={20} />, color: 'text-blue-500', description: 'Meningkatkan kualitas air.' },
  terik: { label: 'Matahari Terik', icon: <Sun size={20} className="animate-spin-slow" />, color: 'text-orange-500', description: 'Suhu meningkat tajam.' },
  angin_kencang: { label: 'Angin Kencang', icon: <Wind size={20} />, color: 'text-sky-400', description: 'Meningkatkan sirkulasi oksigen.' }
};

export default function SandboxMode({ engine, uid, onSaveSuccess, onXpGain, onUpdateProgress }: SandboxModeProps) {
  const { state, updateState, isPaused, setIsPaused, reset } = engine;
  const weather = WEATHER_INFO[state.weather];

  const lastTrackedProgress = useRef<Record<string, number>>({});
  const lastTrackingTime = useRef(0);

  // Daily Challenge Progressive Tracking - Optimized with throttling
  useEffect(() => {
    if (!onUpdateProgress) return;
    
    // Throttle tracking to every 5 seconds to reduce system load
    const now = Date.now();
    if (now - lastTrackingTime.current < 5000) return;
    lastTrackingTime.current = now;

    const track = (id: string, currentVal: number) => {
      if (lastTrackedProgress.current[id] !== currentVal) {
        onUpdateProgress(id, currentVal);
        lastTrackedProgress.current[id] = currentVal;
      }
    };
    
    // Flora tracking (Challenge 1)
    if (state.plants > 0) track('1', Math.min(10, Math.floor(state.plants)));
    
    // Stability tracking (Challenge 3)
    if (state.stability >= 85) track('3', 85);

    // Biodiversity tracking (Challenge 5)
    if (state.biodiversity >= 70) track('5', 70);

    // Birds tracking (Challenge 7 & 11)
    if (state.birds > 0) {
      track('7', Math.min(5, Math.floor(state.birds)));
      track('11', Math.min(10, Math.floor(state.birds)));
    }

    // Herbivores tracking (Challenge 9)
    if (state.herbivores > 0) track('9', Math.min(20, Math.floor(state.herbivores)));

    // Carnivores tracking (Challenge 10)
    if (state.carnivores > 0) track('10', Math.min(10, Math.floor(state.carnivores)));

    // Insects tracking (Challenge 12)
    if (state.insects > 0) track('12', Math.min(30, Math.floor(state.insects)));

    // Water Quality tracking (Challenge 13)
    if (state.waterQuality >= 100) track('13', 100);

  }, [state, onUpdateProgress]);

  const [selectedOrganism, setSelectedOrganism] = useState<keyof typeof ORGANISM_DETAILS | null>(null);

  // Challenge State
  const [activeChallenge, setActiveChallenge] = useState<MiniChallenge | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeResult, setChallengeResult] = useState<'success' | 'failed' | null>(null);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeChallenge && timeLeft > 0 && !isPaused && !challengeResult) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && activeChallenge && !challengeResult) {
      setChallengeResult('failed');
      setShowChallengeModal(true);
    }
    return () => clearInterval(timer);
  }, [activeChallenge, timeLeft, isPaused, challengeResult]);

  // Victory Check Effect
  useEffect(() => {
    if (activeChallenge && !challengeResult) {
      const currentValue = state[activeChallenge.targetMetric];
      if (typeof currentValue === 'number' && currentValue >= activeChallenge.targetValue) {
        setChallengeResult('success');
        setShowChallengeModal(true);
        if (onXpGain) onXpGain(200);
      }
    }
  }, [state, activeChallenge, challengeResult]);

  const startChallenge = () => {
    const randomChallenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    setActiveChallenge(randomChallenge);
    setTimeLeft(randomChallenge.duration);
    setChallengeResult(null);
    setShowChallengeModal(true);
    setIsPaused(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10">
      {/* Vitals Sidebar */}
      <div className="w-full lg:w-[320px] flex flex-col gap-4 sm:gap-6 order-2 lg:order-1">
        <div className="bg-white border border-[#E0E7D9] rounded-3xl md:rounded-[32px] p-5 sm:p-6 md:p-8 shadow-sm">
          <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6B5C] uppercase tracking-widest mb-4 sm:mb-6">Cuaca Saat Ini</p>
          <div className="flex items-center gap-4">
             <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F1F6EE] ${weather.color} flex-shrink-0`}>
                <span className="sm:hidden">{React.cloneElement(weather.icon as React.ReactElement, { size: 16 })}</span>
                <span className="hidden sm:block">{weather.icon}</span>
             </div>
             <div>
                <p className="font-bold text-[#2D4F1E] text-xs sm:text-sm md:text-base">{weather.label}</p>
                <p className="text-[9px] sm:text-[10px] text-[#5C6B5C] font-medium leading-tight">{weather.description}</p>
             </div>
          </div>
        </div>

        <div className="bg-white border border-[#E0E7D9] rounded-3xl md:rounded-[32px] p-5 sm:p-6 md:p-8 shadow-sm">
          <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6B5C] uppercase tracking-widest mb-4 sm:mb-6">Data Utama Ekosistem</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
               <div className="space-y-3 sm:space-y-4">
                  <p className="text-[7px] sm:text-[8px] font-black text-[#4A7C44] uppercase tracking-[0.3em] flex items-center gap-2">
                     <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#4A7C44]" />
                     Habitat Darat
                  </p>
                  <div className="space-y-1.5 sm:space-y-2">
                    <VitalStat icon={<Leaf size={14}/>} label="Flora" value={Math.floor(state.plants)} color="text-green-600" />
                    <VitalStat icon={<Activity size={14}/>} label="Herbivora" value={Math.floor(state.herbivores)} color="text-blue-500" />
                    <VitalStat icon={<Activity size={14}/>} label="Karnivora" value={Math.floor(state.carnivores)} color="text-red-500" />
                  </div>
               </div>
               
               <div className="space-y-3 sm:space-y-4">
                  <p className="text-[7px] sm:text-[8px] font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-2">
                     <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-600" />
                     Habitat Laut
                  </p>
                  <div className="space-y-1.5 sm:space-y-2">
                    <VitalStat icon={<Droplets size={14}/>} label="Alga" value={Math.floor(state.algae)} color="text-teal-600" />
                    <VitalStat icon={<Activity size={14}/>} label="Pisces" value={Math.floor(state.fish)} color="text-blue-400" />
                    <VitalStat icon={<Zap size={14}/>} label="Predator" value={Math.floor(state.sharks)} color="text-slate-600" />
                  </div>
               </div>

               <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
                  <p className="text-[7px] sm:text-[8px] font-black text-sky-500 uppercase tracking-[0.3em] flex items-center gap-2">
                     <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-sky-500" />
                     Habitat Udara
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-1.5 sm:gap-y-2">
                     <VitalStat icon={<Wind size={14}/>} label="Avian" value={Math.floor(state.birds)} color="text-orange-600" />
                     <VitalStat icon={<Activity size={14}/>} label="Insekta" value={Math.floor(state.insects)} color="text-yellow-600" />
                     <VitalStat icon={<Droplets size={14}/>} label="Vitalitas Air" value={`${Math.floor(state.waterQuality)}%`} color="text-cyan-600" />
                     <VitalStat icon={<Wind size={14}/>} label="Atmoster O2" value={`${Math.floor(state.oxygen)}%`} color="text-sky-400" />
                  </div>
               </div>

               <div className="border-t border-[#E0E7D9] pt-4 sm:col-span-2 lg:col-span-1">
                  <VitalStat icon={<Thermometer size={14}/>} label="Termal Lingkungan" value={`${state.temperature.toFixed(1)}°C`} color="text-orange-500" />
               </div>
            </div>
        </div>
      </div>
      {/* Main Sandbox Area */}
      <div className="flex-1 bg-white border border-[#E0E7D9] rounded-3xl md:rounded-[48px] p-4 sm:p-6 md:p-8 lg:p-12 shadow-sm relative overflow-hidden flex flex-col order-1 lg:order-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 mb-6 md:mb-12">
            <div className="flex flex-col">
               <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#4A7C44] flex items-center justify-center text-white shadow-lg">
                    <Activity size={14} className="sm:hidden" />
                    <Activity size={18} className="hidden sm:block" />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-black text-[#2D4F1E] tracking-tight">Laboratorium Alam</h2>
               </div>
               <p className="text-[10px] sm:text-xs md:text-sm text-[#5C6B5C] font-medium sm:ml-11 border-l-2 border-[#E0E7D9] pl-3 sm:pl-4 max-w-lg">
                  Arsitektur Kehidupan Virtual. Simulasikan keseimbangan tiga habitat utama: Darat, Laut, dan Udara dalam sistem dinamis real-time.
               </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
               <div className="hidden sm:flex bg-[#F1F6EE] px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-[#E0E7D9] flex-col items-end">
                  <span className="text-[7px] sm:text-[8px] font-bold text-[#A0B0A0] uppercase tracking-widest whitespace-nowrap">Atmosfer Lokal</span>
                  <span className="text-xs sm:text-sm font-mono font-black text-[#2D4F1E]">{state.weather.toUpperCase().replace('_', ' ')}</span>
               </div>
               <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={startChallenge}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all shadow-md active:scale-95 ${activeChallenge && !challengeResult ? 'bg-yellow-400 text-yellow-900 animate-pulse' : 'bg-[#2D4F1E] text-white hover:bg-[#3D6638]'}`}
                  >
                    <Trophy size={16} className="sm:hidden" />
                    <Trophy size={18} className="hidden sm:block" />
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest">{activeChallenge && !challengeResult ? 'Misi Aktif' : 'Tantangan'}</span>
                  </button>
               </div>
            </div>
        </div>

         {/* Challenge Banner */}
         <AnimatePresence>
            {activeChallenge && !challengeResult && (
              <motion.div 
                initial={{ height: 0, opacity: 0, y: -20 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -20 }}
                className="mb-6 sm:mb-8 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-dashed border-yellow-400 rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative shadow-sm">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 relative z-10">
                      <div className="flex items-center gap-3 sm:gap-5">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-yellow-400 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-xl">
                           <Timer size={22} className={`hidden sm:block ${timeLeft < 15 ? 'animate-pulse text-red-600' : ''}`} />
                           <Timer size={18} className={`sm:hidden ${timeLeft < 15 ? 'animate-pulse text-red-600' : ''}`} />
                        </div>
                        <div className="text-left">
                           <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                              <span className="px-1.5 py-0.5 bg-yellow-200 text-yellow-800 rounded-md text-[7px] font-black uppercase tracking-tighter">Misi Aktif</span>
                              <p className="text-[8px] sm:text-[10px] font-bold text-yellow-700 uppercase tracking-widest">{activeChallenge.title}</p>
                           </div>
                           <h4 className="text-sm sm:text-lg font-serif font-bold text-yellow-900 leading-tight">{activeChallenge.description}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-8 w-full md:w-auto bg-white/50 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-yellow-200/50">
                         <div className="text-right flex-1 md:flex-none">
                            <p className="text-[8px] sm:text-[10px] font-bold text-yellow-700 uppercase tracking-widest mb-0.5 sm:mb-1">Sisa Waktu</p>
                            <p className={`text-lg sm:text-2xl font-mono font-black ${timeLeft < 15 ? 'text-red-500 animate-pulse' : 'text-yellow-900'}`}>
                               {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </p>
                         </div>
                         <div className="w-px h-8 sm:h-10 bg-yellow-200" />
                         <div className="text-right flex-1 md:flex-none">
                            <p className="text-[8px] sm:text-[10px] font-bold text-yellow-700 uppercase tracking-widest mb-0.5 sm:mb-1">Progres</p>
                            <p className="text-lg sm:text-2xl font-mono font-black text-yellow-900">
                               {Math.floor(state[activeChallenge.targetMetric] as number)}{['plants', 'herbivores', 'carnivores', 'fish', 'algae', 'sharks', 'birds', 'insects'].includes(activeChallenge.targetMetric) ? '' : '%'}<span className="text-[10px] sm:text-xs text-yellow-600/50 ml-1">/ {activeChallenge.targetValue}{['plants', 'herbivores', 'carnivores', 'fish', 'algae', 'sharks', 'birds', 'insects'].includes(activeChallenge.targetMetric) ? '' : '%'}</span>
                            </p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="mt-3 sm:mt-4 h-1.5 sm:h-2 bg-yellow-200/50 rounded-full overflow-hidden border border-yellow-200">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((state[activeChallenge.targetMetric] as number) / activeChallenge.targetValue) * 100)}%` }}
                        className={`h-full transition-all duration-1000 ${
                          ((state[activeChallenge.targetMetric] as number) / activeChallenge.targetValue) >= 1 ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                      />
                   </div>
                </div>
              </motion.div>
            )}
         </AnimatePresence>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-10 flex-1">
          <div className="xl:col-span-8 relative bg-[#F9FBF7] rounded-2xl sm:rounded-3xl md:rounded-[48px] border-2 border-[#E0E7D9] overflow-hidden shadow-2xl group min-h-[300px] sm:min-h-[400px] md:min-h-[550px]">
             <EcosystemVisuals 
                state={state} 
                onOrganismClick={(type) => setSelectedOrganism(type as keyof typeof ORGANISM_DETAILS)}
             />
             
             {/* Data Status Overlay */}
             <div className="absolute top-3 left-3 sm:top-5 sm:left-5 md:top-6 md:left-6 flex flex-col gap-2 md:gap-3 pointer-events-none">
                <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 md:px-4 md:py-2 rounded-xl text-white border border-white/10 flex items-center gap-2 md:gap-3">
                   <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full ${state.stability > 70 ? 'bg-green-400' : state.stability > 40 ? 'bg-yellow-400' : 'bg-red-400'} animate-pulse`} />
                   <span className="text-[7px] sm:text-[8px] md:text-[10px] uppercase font-black tracking-widest whitespace-nowrap">Sistem: {state.stability > 70 ? 'Stabil' : state.stability > 40 ? 'Waspada' : 'Kritis'}</span>
                </div>
             </div>

             {/* Integrated Simulation Controls */}
             <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 md:bottom-6 md:left-6 md:right-6 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
                   <button 
                     onClick={() => setIsPaused(!isPaused)}
                     className={`p-2.5 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl transition-all shadow-xl active:scale-90 ${isPaused ? 'bg-[#4A7C44] text-white' : 'bg-white/90 backdrop-blur text-[#4A7C44]'}`}
                   >
                     {isPaused ? <Play size={16} className="sm:hidden" /> : <Pause size={16} className="sm:hidden" />}
                     {isPaused ? <Play size={20} className="hidden sm:block" /> : <Pause size={20} className="hidden sm:block" />}
                   </button>
                   <button onClick={reset} className="p-2.5 sm:p-4 md:p-5 bg-white/90 backdrop-blur rounded-xl sm:rounded-2xl text-[#4A7C44] hover:bg-white transition-all shadow-xl active:scale-90">
                     <RefreshCw size={16} className="sm:hidden" />
                     <RefreshCw size={20} className="hidden sm:block" />
                   </button>
                </div>
                
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-xl sm:rounded-2xl border border-white/10 text-white flex items-center gap-3 sm:gap-4 md:gap-8">
                   <div className="text-center">
                      <p className="text-[5px] sm:text-[6px] md:text-[8px] font-bold text-white/50 uppercase tracking-widest">Stabilitas</p>
                      <p className="font-mono font-black text-xs sm:text-base md:text-xl">{Math.floor(state.stability)}%</p>
                   </div>
                   <div className="w-px h-5 sm:h-6 bg-white/10" />
                   <div className="text-center">
                      <p className="text-[5px] sm:text-[6px] md:text-[8px] font-bold text-white/50 uppercase tracking-widest">Biodiversitas</p>
                      <p className="font-mono font-black text-xs sm:text-base md:text-xl">{Math.floor(state.biodiversity)}%</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="xl:col-span-4 space-y-6 flex flex-col min-h-0">
             <div className="bg-[#F9FBF7] border-2 border-[#E0E7D9] rounded-3xl md:rounded-[48px] p-6 md:p-8 shadow-inner overflow-y-auto overflow-x-hidden scientific-scrollbar flex-1 max-h-[500px] xl:max-h-none">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-[#5C6B5C] uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} className="text-[#4A7C44]" />
                    Intervensi Sistem
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                     <ControlRow label="Reboisasi Darat (+10)" onAction={() => updateState({ plants: 10, soilFertility: 5, oxygen: 5 })} />
                     <ControlRow label="Migrasi Herbivora (+8)" onAction={() => updateState({ herbivores: 8 })} />
                     <ControlRow label="Budidaya Alga Laut (+12)" onAction={() => updateState({ algae: 12, waterQuality: 5 })} />
                     <ControlRow label="Pelepasan Benih Ikan (+10)" onAction={() => updateState({ fish: 10 })} />
                     <ControlRow label="Konservasi Hiu (+2)" onAction={() => updateState({ sharks: 2 })} />
                     <ControlRow label="Migrasi Burung (+4)" onAction={() => updateState({ birds: 4 })} />
                     <ControlRow label="Pelepasan Penyerbuk (+15)" onAction={() => updateState({ insects: 15 })} />
                     <ControlRow label="Purifikasi Air (+15)" onAction={() => updateState({ waterQuality: 15 })} />
                  </div>
                </div>
             
              <div className="bg-[#2D4F1E] p-6 md:p-8 rounded-[32px] text-white mt-6 shadow-2xl relative overflow-hidden">

                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Analisis Sistem</p>
                  <p className="text-sm font-medium leading-relaxed italic">
                    {state.stability > 80 ? "Ekosistem sangat sehat. Ketahanan biologis pada level optimal." : 
                     state.stability > 50 ? "Sistem cukup stabil, namun perhatikan rasio populasi agar tidak terjadi lonjakan." : 
                     state.stability > 20 ? "Ketidakseimbangan terdeteksi! Segera lakukan intervensi populasi." : 
                     "STATUS KRITIS. Ekosistem berada di ambang kehancuran total."}
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-white/5 rotate-12">
                   <Activity size={100} />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>


      {/* Save Modal */}
      <AnimatePresence>
        {selectedOrganism && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrganism(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl border border-[#E0E7D9] overflow-hidden"
            >
              <button 
                onClick={() => setSelectedOrganism(null)}
                className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 hover:bg-[#F1F6EE] rounded-full transition-all text-[#A0B0A0]"
              >
                <X size={20} className="sm:hidden" />
                <X size={24} className="hidden sm:block" />
              </button>

              <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                <motion.div 
                   initial={{ rotate: -10, scale: 0.8 }}
                   animate={{ rotate: 0, scale: 1 }}
                   className={`w-20 h-20 sm:w-28 sm:h-28 rounded-[28px] sm:rounded-[40px] flex items-center justify-center ${ORGANISM_DETAILS[selectedOrganism].color} bg-[#F1F6EE] shadow-inner relative overflow-hidden`}
                >
                   {selectedOrganism === 'plants' ? <Leaf size={32} className="sm:hidden" /> : 
                    selectedOrganism === 'algae' ? <Droplets size={32} className="sm:hidden" /> : 
                    selectedOrganism === 'sharks' || selectedOrganism === 'carnivores' ? <Zap size={32} className="sm:hidden" /> : 
                    selectedOrganism === 'birds' ? <Wind size={32} className="sm:hidden" /> : 
                    <Activity size={32} className="sm:hidden" />}
                    
                   <span className="hidden sm:block">
                    {selectedOrganism === 'plants' ? <Leaf size={48} /> : 
                     selectedOrganism === 'algae' ? <Droplets size={48} /> : 
                     selectedOrganism === 'sharks' || selectedOrganism === 'carnivores' ? <Zap size={48} /> : 
                     selectedOrganism === 'birds' ? <Wind size={48} /> : 
                     <Activity size={48} />}
                   </span>
                   <motion.div 
                     animate={{ opacity: [0.1, 0.3, 0.1] }}
                     transition={{ repeat: Infinity, duration: 3 }}
                     className="absolute inset-0 bg-white"
                   />
                </motion.div>
                <div>
                   <p className="text-[8px] sm:text-[10px] font-bold text-[#4A7C44] uppercase tracking-widest mb-0.5 sm:mb-1">Klasifikasi Organisme</p>
                   <h3 className="text-xl sm:text-3xl font-serif font-bold text-[#2D4F1E]">{ORGANISM_DETAILS[selectedOrganism].name}</h3>
                </div>
              </div>

              <motion.div 
                initial="hidden"
                animate="visible"
                className="space-y-4 sm:space-y-6"
              >
                <div 
                   className="text-xs sm:text-base text-[#5C6B5C] leading-relaxed font-medium"
                >
                   {ORGANISM_DETAILS[selectedOrganism].description}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                   <div 
                      className="p-4 sm:p-6 bg-[#F9FBF7] rounded-3xl sm:rounded-[32px] border border-[#E0E7D9]"
                   >
                      <p className="text-[8px] sm:text-[10px] font-bold text-[#4A7C44] uppercase tracking-widest mb-1 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                        <Share2 size={10} className="sm:hidden" />
                        <Share2 size={12} className="hidden sm:block" />
                        Peran Ekologis
                      </p>
                      <p className="text-xs sm:text-base text-[#2D4F1E] font-medium leading-relaxed">{ORGANISM_DETAILS[selectedOrganism].role}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div 
                        className="p-4 sm:p-6 bg-[#F9FBF7] rounded-3xl sm:rounded-[32px] border border-[#E0E7D9]"
                      >
                        <p className="text-[8px] sm:text-[10px] font-bold text-[#4A7C44] uppercase tracking-widest mb-0.5 sm:mb-1 flex items-center gap-1.5 sm:gap-2">
                           <Sun size={10} className="sm:hidden" />
                           <Sun size={12} className="hidden sm:block" />
                           Nutrisi
                        </p>
                        <p className="text-xs sm:text-base text-[#2D4F1E] font-bold">{ORGANISM_DETAILS[selectedOrganism].food}</p>
                      </div>
                      <div 
                        className="p-4 sm:p-6 bg-[#F9FBF7] rounded-3xl sm:rounded-[32px] border border-[#E0E7D9]"
                      >
                        <p className="text-[8px] sm:text-[10px] font-bold text-red-500 uppercase tracking-widest mb-0.5 sm:mb-1 flex items-center gap-1.5 sm:gap-2">
                           <Zap size={10} className="sm:hidden text-red-500" />
                           <Zap size={12} className="hidden sm:block text-red-500" />
                           Pemangsa
                        </p>
                        <p className="text-xs sm:text-base text-[#2D4F1E] font-bold">{ORGANISM_DETAILS[selectedOrganism].predators}</p>
                      </div>
                   </div>
                </div>

                <motion.button 
                   whileTap={{ scale: 0.98 }}
                   onClick={() => setSelectedOrganism(null)}
                   className="w-full py-4 sm:py-5 bg-[#4A7C44] text-white rounded-xl sm:rounded-2xl font-bold hover:shadow-lg transition-all text-sm sm:text-base"
                >
                  Tutup Informasi
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        )}

        {showChallengeModal && activeChallenge && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => !challengeResult && setShowChallengeModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl border border-[#E0E7D9] text-center"
              >
                 <div className="flex items-center justify-center mb-8">
                    <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center ${challengeResult === 'success' ? 'bg-green-500 text-white' : challengeResult === 'failed' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-white'} shadow-xl`}>
                       {challengeResult === 'success' ? <Trophy size={40} /> : challengeResult === 'failed' ? <X size={40} /> : <Target size={40} />}
                    </div>
                 </div>

                 <h3 className="text-3xl font-serif font-bold text-[#2D4F1E] mb-2">
                    {challengeResult === 'success' ? 'Luar Biasa!' : challengeResult === 'failed' ? 'Misi Gagal' : activeChallenge.title}
                 </h3>
                 <p className="text-[#5C6B5C] mb-8 font-medium">
                    {challengeResult === 'success' 
                      ? `Anda berhasil menjaga keseimbangan! Anda mendaapatkan gelar: ${activeChallenge.reward}` 
                      : challengeResult === 'failed' 
                        ? 'Waktu habis. Ekosistem belum mencapai target yang ditentukan.'
                        : activeChallenge.description}
                 </p>

                 <div className="space-y-4">
                    <div className="p-6 bg-[#F9FBF7] rounded-[32px] border border-[#E0E7D9] flex items-center justify-between">
                       <span className="text-[10px] font-bold text-[#4A7C44] uppercase tracking-widest">Durasi Tantangan</span>
                       <span className="font-mono font-bold text-[#2D4F1E]">{activeChallenge.duration} Detik</span>
                    </div>
                    {challengeResult ? (
                       <button 
                         onClick={() => {
                           setShowChallengeModal(false);
                           setActiveChallenge(null);
                           setChallengeResult(null);
                         }}
                         className="w-full py-5 bg-[#4A7C44] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                       >
                         {challengeResult === 'success' ? 'Terima Hadiah' : 'Coba Lagi Nanti'}
                       </button>
                    ) : (
                       <button 
                         onClick={() => setShowChallengeModal(false)}
                         className="w-full py-5 bg-[#4A7C44] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                       >
                         Mulai Simulasi
                       </button>
                    )}
                 </div>
              </motion.div>
           </div>
        )}

      </AnimatePresence>
    </div>
  );
}

const VitalStat = React.memo(({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => {
  return (
    <div className="flex items-center justify-between group py-1">
       <div className="flex items-center gap-3">
          <span className={`${color} opacity-60 group-hover:opacity-100 transition-opacity`}>{icon}</span>
          <span className="text-[10px] font-bold text-[#5C6B5C]">{label}</span>
       </div>
       <span className="font-mono text-xs font-bold text-[#2D4F1E]">{value}</span>
    </div>
  );
});

const ControlRow = React.memo(({ label, onAction }: { label: string, onAction: () => void }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-[#F1F6EE] rounded-2xl border border-[#E0E7D9] group hover:border-[#4A7C44] transition-all">
       <span className="text-[11px] font-bold text-[#2D4F1E]">{label}</span>
       <button 
         onClick={onAction}
         className="w-8 h-8 rounded-full bg-white border border-[#E0E7D9] flex items-center justify-center text-[#4A7C44] hover:bg-[#4A7C44] hover:text-white transition-all shadow-sm"
       >
          <Plus size={14} />
       </button>
    </div>
  );
});

function Plus({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5v14"/></svg>;
}
