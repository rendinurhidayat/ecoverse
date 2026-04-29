import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, CloudRain, Droplets, Leaf, Activity, RefreshCw, 
  Brain, Mountain, Wind, Zap, ChevronRight, CheckCircle, XCircle
} from 'lucide-react';
import { subscribeToLabState, saveLabState } from '../services/dbService';

type LabType = 'water' | 'carbon' | 'nitrogen' | 'phosphorus' | 'sulfur' | 'games';

export default function VirtualLab({ onXpGain, onUpdateProgress, profile, uid }: { onXpGain?: (xp: number) => void, onUpdateProgress?: (id: string, prog: number) => void, profile?: any, uid?: string }) {
  const [activeLab, setActiveLab] = useState<LabType>('water');
  const [simulatedLabs, setSimulatedLabs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!onUpdateProgress) return;
    
    // Track unique lab simulations
    if (activeLab !== 'games' && !simulatedLabs.has(activeLab)) {
        const next = new Set(simulatedLabs);
        next.add(activeLab);
        setSimulatedLabs(next);
        
        // Challenge 4: 1 scenario (id '4')
        onUpdateProgress('4', 1);
        
        // Challenge 16: 3 scenarios (id '16')
        onUpdateProgress('16', Math.min(3, next.size));
    }
  }, [activeLab, onUpdateProgress]);

  // Track Oxygen 100% (Challenge 8)
  // This is a bit tricky since it's child-state, but I'll add the check inside the components or lift state.
  // For now, I'll focus on the ones I can track easily.

  return (
    <div className="space-y-8 pb-32">
      {/* Navigation - Clean Minimalist Style */}
      <div className="flex bg-white/90 backdrop-blur-md p-2 rounded-full border border-gray-100 w-fit mx-auto sticky top-4 z-40 shadow-xl shadow-gray-200/40 overflow-x-auto max-w-full no-scrollbar">
        <LabTab active={activeLab === 'water'} onClick={() => setActiveLab('water')} icon={<Droplets size={16}/>} label="Air" />
        <LabTab active={activeLab === 'carbon'} onClick={() => setActiveLab('carbon')} icon={<Sun size={16}/>} label="Karbon" />
        <LabTab active={activeLab === 'nitrogen'} onClick={() => setActiveLab('nitrogen')} icon={<Wind size={16}/>} label="Nitrogen" />
        <LabTab active={activeLab === 'phosphorus'} onClick={() => setActiveLab('phosphorus')} icon={<Mountain size={16}/>} label="Fosfor" />
        <LabTab active={activeLab === 'sulfur'} onClick={() => setActiveLab('sulfur')} icon={<Zap size={16}/>} label="Sulfur" />
        <LabTab active={activeLab === 'games'} onClick={() => setActiveLab('games')} icon={<Brain size={16}/>} label="Game Center" />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <motion.div
           key={activeLab}
           initial={{ opacity: 0, scale: 0.98, y: 10 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {activeLab === 'water' && <WaterCycleLab uid={uid} />}
          {activeLab === 'carbon' && <CarbonCycleLab uid={uid} onUpdateProgress={onUpdateProgress} />}
          {activeLab === 'nitrogen' && <NitrogenCycleLab uid={uid} />}
          {activeLab === 'phosphorus' && <PhosphorusCycleLab uid={uid} />}
          {activeLab === 'sulfur' && <SulfurCycleLab uid={uid} />}
          {activeLab === 'games' && <GameCenter onXpGain={onXpGain} />}
        </motion.div>
      </div>
    </div>
  );
}

function LabTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap ${
        active 
          ? 'bg-[#4A7C44] text-white shadow-lg shadow-[#4A7C44]/20' 
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span className={active ? 'scale-110 transition-transform' : ''}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function LabControl({ label, value, onChange, icon, min = 0, max = 100, unit = '%' }: any) {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span className="p-1.5 bg-gray-50 rounded-lg text-[#4A7C44]">{icon}</span> {label}
         </span>
         <span className="text-xs font-black text-[#2D4F1E]">{value}{unit}</span>
      </div>
      <input 
        type="range" min={min} max={max} value={value} onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-1 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#4A7C44]"
      />
    </div>
  );
}

// --- CYCLE LABS ---

function WaterCycleLab({ uid }: { uid?: string }) {
  const [heat, setHeat] = useState(50);
  const [vegetation, setVegetation] = useState(50);
  const [stage, setStage] = useState(0); 
  const [dbStateId, setDbStateId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeToLabState(uid, 'water', (state) => {
      if (state) {
        setHeat(state.data.heat ?? 50);
        setVegetation(state.data.vegetation ?? 50);
        setDbStateId(state.id || null);
      }
    });
    return unsub;
  }, [uid]);

  const handleUpdate = async (newHeat?: number, newVeg?: number) => {
    const h = newHeat !== undefined ? newHeat : heat;
    const v = newVeg !== undefined ? newVeg : vegetation;
    setHeat(h);
    setVegetation(v);
    
    if (uid) {
      await saveLabState({
        id: dbStateId || undefined,
        uid,
        labId: 'water',
        data: { heat: h, vegetation: v }
      });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setStage(s => (s + 1) % 4), 6000);
    return () => clearInterval(timer);
  }, []);

  const stages = [
    { name: "Evaporasi", icon: "💨", text: "Air berubah menjadi uap akibat radiasi surya." },
    { name: "Kondensasi", icon: "☁️", text: "Uap air mendingin dan membentuk partikel awan." },
    { name: "Presipitasi", icon: "🌧️", text: "Awan melepaskan air kembali ke permukaan bumi." },
    { name: "Infiltrasi", icon: "🌊", text: "Air menyerap ke tanah dan mengisi akuifer." }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-gradient-to-br from-blue-50/50 to-white border border-gray-100 rounded-[48px] p-12 min-h-[600px] relative overflow-hidden shadow-sm flex flex-col items-center justify-center">
         <motion.div 
            key={stage}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-center space-y-8 z-10"
         >
            <span className="text-[160px] block drop-shadow-2xl">{stages[stage].icon}</span>
            <div>
               <h3 className="text-4xl font-serif font-black text-[#2D4F1E] italic tracking-tight">{stages[stage].name}</h3>
               <p className="text-gray-400 max-w-sm mx-auto mt-2 font-medium">{stages[stage].text}</p>
            </div>
         </motion.div>
         
         <div className="absolute bottom-0 inset-x-0 h-48 bg-white/40 backdrop-blur-sm border-t border-gray-100 flex justify-around items-end pb-12 px-12">
            {[...Array(8)].map((_, i) => (
               <motion.span 
                 key={i} 
                 animate={{ y: vegetation > i * 12 ? 0 : 100 }} 
                 className="text-5xl"
               >
                 {vegetation > 70 ? '🌳' : '🌿'}
               </motion.span>
            ))}
         </div>
      </div>
      <div className="space-y-4">
         <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Parameter Lingkungan</p>
            <LabControl label="Radiasi Surya" value={heat} onChange={(val: number) => handleUpdate(val, undefined)} icon={<Sun size={14}/>} />
            <LabControl label="Tutupan Hijau" value={vegetation} onChange={(val: number) => handleUpdate(undefined, val)} icon={<Leaf size={14}/>} />
         </div>
         <div className="p-8 bg-[#4A7C44] rounded-[40px] text-white">
            <h4 className="font-serif font-bold text-lg mb-2">Insight Air</h4>
            <p className="text-xs opacity-80 leading-relaxed font-medium">Vegetasi berperan sebagai spons alami, memperlambat aliran permukaan dan meningkatkan infiltrasi ke dalam tanah.</p>
         </div>
      </div>
    </div>
  );
}

function CarbonCycleLab({ uid, onUpdateProgress }: { uid?: string, onUpdateProgress?: (id: string, prog: number) => void }) {
  const [emissions, setEmissions] = useState(30);
  const [forests, setForests] = useState(60);
  const [dbStateId, setDbStateId] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeToLabState(uid, 'carbon', (state) => {
      if (state) {
        setEmissions(state.data.emissions ?? 30);
        setForests(state.data.forests ?? 60);
        setDbStateId(state.id || null);
      }
    });
    return unsub;
  }, [uid]);

  const handleUpdate = async (newEmissions?: number, newForests?: number) => {
    const e = newEmissions !== undefined ? newEmissions : emissions;
    const f = newForests !== undefined ? newForests : forests;
    setEmissions(e);
    setForests(f);
    
    if (uid) {
      await saveLabState({
        id: dbStateId || undefined,
        uid,
        labId: 'carbon',
        data: { emissions: e, forests: f }
      });
    }
  };

  useEffect(() => {
    if (onUpdateProgress && forests >= 100) {
      onUpdateProgress('8', 100);
    }
  }, [forests, onUpdateProgress]);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-[#F9FAFB] border border-gray-100 rounded-[48px] p-12 min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#4A7C4405_0%,transparent_70%)]" />
         <div className="flex flex-col items-center space-y-16 relative z-10 w-full max-w-md text-center">
            <motion.div 
               animate={{ 
                 scale: 1 + (emissions / 200),
                 filter: `grayscale(${Math.max(0, (emissions - forests)/100)})` 
               }}
               className="text-[160px] drop-shadow-2xl"
            >
               🌍
            </motion.div>
            <div className="grid grid-cols-2 gap-12 w-full">
               <div className="flex flex-col items-center space-y-4">
                  <span className="text-5xl">🏭</span>
                  <div className="h-32 w-3 bg-gray-200 rounded-full overflow-hidden">
                     <motion.div animate={{ height: `${emissions}%` }} className="bg-orange-500 w-full" />
                  </div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Emisi Fosil</span>
               </div>
               <div className="flex flex-col items-center space-y-4">
                  <span className="text-5xl">🌱</span>
                  <div className="h-32 w-3 bg-gray-200 rounded-full overflow-hidden">
                     <motion.div animate={{ height: `${forests}%` }} className="bg-emerald-500 w-full" />
                  </div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Fotosintesis</span>
               </div>
            </div>
         </div>
      </div>
      <div className="space-y-4">
         <LabControl label="Aktivitas Industri" value={emissions} onChange={(val: number) => handleUpdate(val, undefined)} icon={<Activity size={14}/>} />
         <LabControl label="Restorasi Hutan" value={forests} onChange={(val: number) => handleUpdate(undefined, val)} icon={<Leaf size={14}/>} />
      </div>
    </div>
  );
}

function NitrogenCycleLab({ uid }: { uid?: string }) {
  const [fertilizer, setFertilizer] = useState(20);
  const [bacteria, setBacteria] = useState(50);
  const [dbStateId, setDbStateId] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeToLabState(uid, 'nitrogen', (state) => {
      if (state) {
        setFertilizer(state.data.fertilizer ?? 20);
        setBacteria(state.data.bacteria ?? 50);
        setDbStateId(state.id || null);
      }
    });
    return unsub;
  }, [uid]);

  const handleUpdate = async (newFert?: number, newBact?: number) => {
    const f = newFert !== undefined ? newFert : fertilizer;
    const b = newBact !== undefined ? newBact : bacteria;
    setFertilizer(f);
    setBacteria(b);
    
    if (uid) {
      await saveLabState({
        id: dbStateId || undefined,
        uid,
        labId: 'nitrogen',
        data: { fertilizer: f, bacteria: b }
      });
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-[#F1F6EE] border border-gray-100 rounded-[48px] p-20 shadow-sm flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#4A7C4410_0%,transparent_60%)]" />
         <div className="text-center mb-16 relative z-10">
            <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="text-9xl mb-8 block drop-shadow-2xl">🌱</motion.span>
            <h3 className="text-5xl font-serif font-black text-[#2D4F1E] italic tracking-tight">Siklus Nitrogen</h3>
            <p className="text-gray-400 mt-4 max-w-sm mx-auto font-medium">Bakteri adalah arsitek utama di balik konversi atom nitrogen Atmosferik menjadi nutrisi tanah.</p>
         </div>
         <div className="grid grid-cols-3 gap-4 w-full max-w-xl relative z-10">
            <div className="text-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
               <span className="text-3xl block mb-2">⚡</span>
               <p className="text-[9px] font-black uppercase text-gray-400">Fiksasi</p>
               <p className="text-lg font-black text-[#2D4F1E]">{Math.floor(bacteria * 0.8)}%</p>
            </div>
            <div className="text-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
               <span className="text-3xl block mb-2">🧪</span>
               <p className="text-[9px] font-black uppercase text-gray-400">Nitrat</p>
               <p className="text-lg font-black text-[#2D4F1E]">{Math.floor((fertilizer + bacteria) / 2)}%</p>
            </div>
            <div className="text-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
               <span className="text-3xl block mb-2">🌬️</span>
               <p className="text-[9px] font-black uppercase text-gray-400">Pelepasan</p>
               <p className="text-lg font-black text-[#2D4F1E]">{Math.floor(100 - bacteria)}%</p>
            </div>
         </div>
      </div>
      <div className="space-y-4">
         <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Aktivitas Manusia & Alam</p>
            <LabControl label="Penggunaan Pupuk" value={fertilizer} onChange={(val: number) => handleUpdate(val, undefined)} icon={<Zap size={14}/>} />
            <LabControl label="Populasi Bakteri" value={bacteria} onChange={(val: number) => handleUpdate(undefined, val)} icon={<Activity size={14}/>} />
         </div>
         <div className="p-8 bg-[#4A7C44] rounded-[40px] text-white">
            <h4 className="font-serif font-bold text-lg mb-2">Eutrofikasi</h4>
            <p className="text-xs opacity-80 leading-relaxed font-medium">Kadar nitrogen yang terlalu tinggi (dari pupuk berlebih) dapat memicu ledakan populasi alga yang merusak ekosistem air.</p>
         </div>
      </div>
    </div>
  );
}


function PhosphorusCycleLab({ uid }: { uid?: string }) {
  const [weathering, setWeathering] = useState(30);
  const [mining, setMining] = useState(10);
  const [dbStateId, setDbStateId] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeToLabState(uid, 'phosphorus', (state) => {
      if (state) {
        setWeathering(state.data.weathering ?? 30);
        setMining(state.data.mining ?? 10);
        setDbStateId(state.id || null);
      }
    });
    return unsub;
  }, [uid]);

  const handleUpdate = async (newWeathering?: number, newMining?: number) => {
    const w = newWeathering !== undefined ? newWeathering : weathering;
    const m = newMining !== undefined ? newMining : mining;
    setWeathering(w);
    setMining(m);
    
    if (uid) {
      await saveLabState({
        id: dbStateId || undefined,
        uid,
        labId: 'phosphorus',
        data: { weathering: w, mining: m }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-[#FAF9F6] border border-gray-100 rounded-[48px] p-20 shadow-sm text-center flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
         <div className="absolute inset-0 bg-[#6B4F2D]/5 opacity-50" />
         <div className="relative z-10 flex flex-col items-center">
            <motion.span animate={{ rotate: [0, weathering/10, -weathering/10, 0] }} transition={{ repeat: Infinity, duration: 8 }} className="text-[180px] mb-12 block drop-shadow-2xl">⛰️</motion.span>
            <h3 className="text-5xl font-serif font-black text-[#6B4F2D] italic tracking-tight">Siklus Fosfor</h3>
            <p className="text-gray-500 max-w-lg mx-auto mt-6 font-medium italic text-lg leading-relaxed px-8">
               "Fosfor merayap secara geologis melalui pelapukan batuan purba dan pengendapan di dasar laut."
            </p>
            <div className="mt-12 flex gap-8">
               <div className="text-center">
                  <p className="text-[9px] font-black uppercase text-[#6B4F2D] opacity-40 mb-2">Laju Luruh</p>
                  <p className="text-2xl font-black text-[#6B4F2D]">{weathering}%</p>
               </div>
               <div className="text-center">
                  <p className="text-[9px] font-black uppercase text-[#6B4F2D] opacity-40 mb-2">Deposit Tanah</p>
                  <p className="text-2xl font-black text-[#6B4F2D]">{Math.floor(weathering * 1.5 + mining)}</p>
               </div>
            </div>
         </div>
      </div>
      <div className="space-y-4">
         <LabControl label="Pelapukan Batuan" value={weathering} onChange={(val: number) => handleUpdate(val, undefined)} icon={<Mountain size={14}/>} />
         <LabControl label="Eksploitasi Tambang" value={mining} onChange={(val: number) => handleUpdate(undefined, val)} icon={<Activity size={14}/>} />
         <div className="p-8 bg-[#6B4F2D] rounded-[40px] text-white">
            <h4 className="font-serif font-bold text-lg mb-2">Deposit Geon</h4>
            <p className="text-xs opacity-80 leading-relaxed font-medium">Berbeda dengan nitrogen, fosfor tidak melalui fase gas di atmosfer, menjadikannya elemen yang sangat lambat bersirkulasi.</p>
         </div>
      </div>
    </div>
  );
}

function SulfurCycleLab({ uid }: { uid?: string }) {
  const [volcano, setVolcano] = useState(20);
  const [industry, setIndustry] = useState(40);
  const [dbStateId, setDbStateId] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeToLabState(uid, 'sulfur', (state) => {
      if (state) {
        setVolcano(state.data.volcano ?? 20);
        setIndustry(state.data.industry ?? 40);
        setDbStateId(state.id || null);
      }
    });
    return unsub;
  }, [uid]);

  const handleUpdate = async (newVolcano?: number, newInd?: number) => {
    const v = newVolcano !== undefined ? newVolcano : volcano;
    const i = newInd !== undefined ? newInd : industry;
    setVolcano(v);
    setIndustry(i);
    
    if (uid) {
      await saveLabState({
        id: dbStateId || undefined,
        uid,
        labId: 'sulfur',
        data: { volcano: v, industry: i }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-[#FFF9EA] border border-gray-100 rounded-[48px] p-20 shadow-sm text-center flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
         <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#8B7D2F]/5" />
         <div className="relative z-10 flex flex-col items-center">
            <motion.span 
               animate={{ 
                 scale: [1, 1 + (volcano/400), 1],
                 y: [0, -volcano/10, 0] 
               }} 
               transition={{ repeat: Infinity, duration: 4 }} 
               className="text-[180px] mb-12 block drop-shadow-2xl"
            >
               🌋
            </motion.span>
            <h3 className="text-5xl font-serif font-black text-[#8B7D2F] italic tracking-tight">Siklus Sulfur</h3>
            <p className="text-gray-500 max-w-xl mx-auto mt-6 font-medium leading-relaxed px-8 text-lg">
               Sulphur memasuki atmosfer melalui emisi vulkanik and aktivitas antropogenik.
            </p>
            <div className="mt-12 flex gap-12">
               <div className="text-center">
                  <p className="text-[9px] font-black uppercase text-[#8B7D2F] opacity-40 mb-2">SO₂ Atmosfer</p>
                  <p className="text-3xl font-black text-[#8B7D2F]">{volcano + industry} ppm</p>
               </div>
               <div className="text-center">
                  <p className="text-[9px] font-black uppercase text-[#8B7D2F] opacity-40 mb-2">Potensi Hujan Asam</p>
                  <p className={`text-3xl font-black ${(volcano + industry) > 80 ? 'text-red-500' : 'text-[#8B7D2F]'}`}>
                     {(volcano + industry) > 80 ? 'TINGGI' : 'RENDAH'}
                  </p>
               </div>
            </div>
         </div>
      </div>
      <div className="space-y-4">
         <LabControl label="Aktivitas Vulkanik" value={volcano} onChange={(val: number) => handleUpdate(val, undefined)} icon={<Zap size={14}/>} />
         <LabControl label="Emisi Industri" value={industry} onChange={(val: number) => handleUpdate(undefined, val)} icon={<Activity size={14}/>} />
         <div className="p-8 bg-[#8B7D2F] rounded-[40px] text-white">
            <h4 className="font-serif font-bold text-lg mb-2">Protein & Sulfur</h4>
            <p className="text-xs opacity-80 leading-relaxed font-medium">Sulfur adalah komponen esensial dari asam amino seperti sistein dan metionin yang mendasari struktur protein mahkluk hidup.</p>
         </div>
      </div>
    </div>
  );
}

// --- GAME CENTER ---

function GameCenter({ onXpGain }: { onXpGain?: (xp: number) => void }) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  return (
    <div className="space-y-12">
      {!selectedGame ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <GameCard 
              title="Eco-Match" 
              desc="Pisahkan elemen ekosistem ke dalam kategori Biotik dan Abiotik secara presisi." 
              icon="🧩" 
              onClick={() => setSelectedGame('match')}
           />
           <GameCard 
              title="Chain Sorter" 
              desc="Pahami aliran energi dengan menyusun rantai makanan yang seimbang." 
              icon="⛓️" 
              onClick={() => setSelectedGame('chain')}
           />
           <GameCard 
              title="Cycle Heroes" 
              desc="Kuis cepat untuk menguji pemahamanmu tentang siklus biogeokimia." 
              icon="🚀" 
              onClick={() => setSelectedGame('quiz')}
           />
        </div>
      ) : (
        <div className="space-y-6">
           <button 
             onClick={() => setSelectedGame(null)}
             className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-800 transition-all group"
           >
              <span className="group-hover:-translate-x-1 transition-transform">← Kembali ke Menu</span>
           </button>
           <div className="bg-white border border-gray-100 rounded-[48px] p-12 shadow-2xl min-h-[600px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[#F9FAFB] opacity-30" />
              <div className="relative z-10 w-full">
                 {selectedGame === 'match' && <EcoMatchGame onXpGain={onXpGain} />}
                 {selectedGame === 'chain' && <ChainSorterGame onXpGain={onXpGain} />}
                 {selectedGame === 'quiz' && <CycleHeroesGame onXpGain={onXpGain} />}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function CycleHeroesGame({ onXpGain }: any) {
  const [gameState, setGameState] = useState<'playing' | 'result'>('playing');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

  const questions = [
    {
      q: "Proses perubahan uap air menjadi titik-titik air di awan disebut...",
      options: ["Evaporasi", "Kondensasi", "Transpirasi", "Presipitasi"],
      correct: 1
    },
    {
      q: "Siklus manakah yang tidak melewati fase gas di atmosfer?",
      options: ["Siklus Air", "Siklus Karbon", "Siklus Fosfor", "Siklus Nitrogen"],
      correct: 2
    },
    {
      q: "Bakteri Rhizobium berperan penting dalam siklus apa?",
      options: ["Nitrogen", "Sulfur", "Karbon", "Fosfor"],
      correct: 0
    },
    {
      q: "Gas rumah kaca utama yang dilepaskan lewat asap industri adalah...",
      options: ["Oksigen", "Metana", "Nitrogen", "Karbon Dioksida"],
      correct: 3
    }
  ];

  const handleAnswer = (idx: number) => {
    if (feedback !== 'none') return;
    if (idx === questions[currentQ].correct) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback('none');
      if (currentQ < questions.length - 1) setCurrentQ(c => c + 1);
      else {
        setGameState('result');
        if (onXpGain) onXpGain(score * 50);
      }
    }, 1000);
  };

  if (gameState === 'result') {
    return (
      <div className="text-center space-y-8 py-12">
        <div className="text-9xl">🎓</div>
        <h2 className="text-4xl font-serif font-black text-gray-800 uppercase">Master Siklus</h2>
        <p className="text-xl font-bold text-gray-400">Skor: {score} / {questions.length}</p>
        <div className="p-6 bg-[#4A7C44]/5 rounded-3xl border border-[#4A7C44]/10">
          <p className="text-[10px] font-black text-[#4A7C44] uppercase tracking-widest">Pengetahuan Ekologi meningkat!</p>
        </div>
        <button 
          onClick={() => { setCurrentQ(0); setScore(0); setGameState('playing'); }}
          className="px-12 py-5 bg-[#4A7C44] text-white rounded-full font-black text-[10px] uppercase tracking-widest"
        >
          Ulangi Kuis
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-12 py-10 px-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
          <span>Pertanyaan {currentQ + 1} / {questions.length}</span>
          <span>Skor: {score}</span>
        </div>
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            className="h-full bg-[#4A7C44]"
          />
        </div>
      </div>

      <h3 className="text-3xl font-serif font-black text-gray-800 leading-tight text-center italic">
        "{questions[currentQ].q}"
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questions[currentQ].options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={feedback !== 'none'}
            className={`p-6 rounded-3xl text-left font-bold transition-all border ${
              feedback === 'none' 
                ? 'bg-white border-gray-100 hover:border-[#4A7C44] hover:bg-gray-50' 
                : i === questions[currentQ].correct 
                  ? 'bg-emerald-500 text-white border-emerald-500' 
                  : feedback === 'wrong' && i === questions[currentQ].correct ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-gray-100 opacity-50'
            }`}
          >
            <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Opsi {String.fromCharCode(65 + i)}</span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function GameCard({ title, desc, icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="bg-white border border-gray-100 p-10 rounded-[40px] text-left hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden h-full flex flex-col"
    >
       <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-4xl mb-12 group-hover:bg-[#F1F6EE] transition-colors duration-500">{icon}</div>
       <h4 className="text-2xl font-serif font-black text-gray-800 mb-3 tracking-tight">{title}</h4>
       <p className="text-sm text-gray-400 font-medium leading-relaxed mb-auto">{desc}</p>
       <div className="mt-12 flex items-center gap-2 text-[#4A7C44] text-[10px] font-black uppercase tracking-widest">
          Mulai Misi <ChevronRight size={14} />
       </div>
    </button>
  );
}

function ChainSorterGame({ onXpGain }: any) {
  const [level, setLevel] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'result'>('playing');
  
  const levels = [
    { chain: ['🌱', '🐇', '🐺'], options: ['🐺', '🌱', '🐇'], label: 'Rantai Padang Rumput' },
    { chain: ['🍃', '🐛', '🐦', '🦅'], options: ['🦅', '🐦', '🍃', '🐛'], label: 'Rantai Hutan' },
    { chain: ['🦠', '🦐', '🐟', '🦈'], options: ['🦐', '🦠', '🦈', '🐟'], label: 'Rantai Laut' }
  ];

  const [userChain, setUserChain] = useState<string[]>([]);
  
  const handleSelect = (emoji: string) => {
    if (userChain.includes(emoji)) return;
    const nextChain = [...userChain, emoji];
    setUserChain(nextChain);
    
    if (nextChain.length === levels[level].chain.length) {
      const isCorrect = nextChain.every((val, index) => val === levels[level].chain[index]);
      setTimeout(() => {
        if (isCorrect) {
          if (level < levels.length - 1) {
            setLevel(level + 1);
            setUserChain([]);
          } else {
            setGameState('result');
            if (onXpGain) onXpGain(200);
          }
        } else {
          setUserChain([]);
        }
      }, 500);
    }
  };

  if (gameState === 'result') {
    return (
      <div className="text-center space-y-8 py-12">
        <div className="text-[120px]">🏆</div>
        <h2 className="text-4xl font-serif font-black text-gray-800 uppercase italic">Ahli Rantai Makanan!</h2>
        <p className="text-gray-400 font-medium">Kamu telah menyusun semua rantai dengan sempurna.</p>
        <button 
          onClick={() => { setLevel(0); setUserChain([]); setGameState('playing'); }}
          className="px-12 py-5 bg-[#4A7C44] text-white rounded-full font-black text-[10px] uppercase tracking-widest"
        >
          Main Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-12 py-10 w-full max-w-md mx-auto">
       <div className="space-y-2">
         <h3 className="text-3xl font-serif font-black text-gray-800 italic uppercase">Chain Sorter</h3>
         <p className="text-[10px] font-black text-[#4A7C44] tracking-widest uppercase">{levels[level].label}</p>
       </div>
       
       <div className="flex justify-center gap-6 min-h-[100px] bg-gray-50 rounded-[32px] p-8 border border-dashed border-gray-200">
          {userChain.map((emoji, i) => (
             <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl">{emoji}</motion.span>
          ))}
          {userChain.length === 0 && <span className="text-gray-200 text-sm font-medium flex items-center">Pilih dari bawah...</span>}
       </div>
       
       <div className="grid grid-cols-4 gap-4">
          {levels[level].options.map(emoji => (
             <button 
               key={emoji} 
               onClick={() => handleSelect(emoji)}
               disabled={userChain.includes(emoji)}
               className="h-20 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-4xl shadow-sm hover:shadow-md transition-all disabled:opacity-30"
             >
               {emoji}
             </button>
          ))}
       </div>
       <div className="flex justify-between items-center px-4">
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Level {level + 1} / {levels.length}</span>
          <button onClick={() => setUserChain([])} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500">Reset</button>
       </div>
    </div>
  );
}

function EcoMatchGame({ onXpGain }: any) {
  const [gameState, setGameState] = useState<'playing' | 'result'>('playing');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

  const items = [
    { name: 'Radiasi Surya', cat: 'abiotik', emoji: '☀️' },
    { name: 'Rumput Laut', cat: 'biotik', emoji: '🌿' },
    { name: 'Nitrogen Gas', cat: 'abiotik', emoji: '💨' },
    { name: 'Dekomposer', cat: 'biotik', emoji: '🍄' },
    { name: 'Tanah Liat', cat: 'abiotik', emoji: '🧱' },
    { name: 'Burung Elang', cat: 'biotik', emoji: '🦅' },
    { name: 'Kelembapan', cat: 'abiotik', emoji: '💧' },
    { name: 'Fitoplankton', cat: 'biotik', emoji: '🦠' },
    { name: 'Suhu Udara', cat: 'abiotik', emoji: '🌡️' },
    { name: 'Cacing Tanah', cat: 'biotik', emoji: '🪱' }
  ];

  const handleGuess = (cat: string) => {
    if (feedback !== 'none') return;
    if (items[currentIndex].cat === cat) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
    setTimeout(() => {
      setFeedback('none');
      if (currentIndex < items.length - 1) setCurrentIndex(c => c + 1);
      else {
        setGameState('result');
        if (onXpGain) onXpGain(score * 25);
      }
    }, 800);
  };

  if (gameState === 'result') {
    return (
      <div className="text-center space-y-10 py-12">
         <div className="text-[120px] animate-bounce">🏆</div>
         <div>
            <h2 className="text-5xl font-serif font-black text-gray-800 tracking-tight">Misimu Selesai!</h2>
            <p className="text-2xl font-bold text-gray-300 mt-2">Akurasi: {Math.round((score/items.length)*100)}%</p>
         </div>
         <div className="p-8 bg-gray-50 border border-gray-100 rounded-[32px] inline-block">
            <p className="text-[10px] font-black text-[#4A7C44] uppercase tracking-widest mb-2">Rewards</p>
            <p className="text-3xl font-black text-gray-800">+{score * 25} XP</p>
         </div>
         <div className="pt-4">
           <button 
             onClick={() => { setScore(0); setCurrentIndex(0); setGameState('playing'); }}
             className="px-16 py-6 bg-[#4A7C44] text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
           >
             Mulai Ulang
           </button>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto text-center space-y-12 py-10">
       <div className="flex justify-between items-center bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-8">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">PROGRESS {currentIndex + 1} / {items.length}</span>
          <div className="flex items-center gap-3">
             <span className="w-10 h-10 bg-[#F1F6EE] text-[#4A7C44] rounded-full flex items-center justify-center font-black">{score}</span>
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Skor</span>
          </div>
       </div>
       
       <div className="relative h-80 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
             <motion.div 
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.5, rotate: 15 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="text-[180px] drop-shadow-2xl"
             >
                {items[currentIndex].emoji}
             </motion.div>
          </AnimatePresence>
       </div>
       
       <h3 className="text-4xl font-serif font-black text-gray-800 italic tracking-tighter uppercase">{items[currentIndex].name}</h3>

       <div className="grid grid-cols-2 gap-8 w-full">
          <button 
            onClick={() => handleGuess('biotik')}
            disabled={feedback !== 'none'}
            className="group p-10 bg-emerald-500 rounded-[40px] text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-green-100 hover:bg-emerald-600 transition-all disabled:opacity-50"
          >
            Biotik
          </button>
          <button 
            onClick={() => handleGuess('abiotik')}
            disabled={feedback !== 'none'}
            className="group p-10 bg-gray-800 rounded-[40px] text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-gray-200 hover:bg-black transition-all disabled:opacity-50"
          >
            Abiotik
          </button>
       </div>
       
       {feedback !== 'none' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-[48px] z-50">
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
               {feedback === 'correct' ? <CheckCircle size={140} className="text-emerald-500" /> : <XCircle size={140} className="text-red-500" />}
             </motion.div>
          </motion.div>
       )}
    </div>
  );
}
