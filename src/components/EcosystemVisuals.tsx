import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Activity, Sun, CloudRain, Wind, Zap } from 'lucide-react';
import { EcosystemState } from '../types';

interface EcosystemVisualsProps {
  state: EcosystemState;
  onOrganismClick?: (type: any) => void;
}

function usePrevious<T>(value: T) {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function EcosystemVisuals({ state, onOrganismClick }: EcosystemVisualsProps) {
  const prevPlants = usePrevious(state.plants);
  const prevHerbivores = usePrevious(state.herbivores);
  const [eatingEvent, setEatingEvent] = useState(false);

  useEffect(() => {
    if (state.herbivores > (prevHerbivores ?? 0) && state.plants > 10) {
      setEatingEvent(true);
      const timer = setTimeout(() => setEatingEvent(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.herbivores, state.plants]);

  // Population sampling for display
  const renderCounts = {
    birds: Math.min(6, Math.floor(state.birds / 2)),
    insects: Math.min(10, Math.floor(state.insects / 8)),
    plants: Math.min(12, Math.floor(state.plants / 10)),
    herbivores: Math.min(6, Math.floor(state.herbivores / 8)),
    carnivores: Math.min(3, Math.floor(state.carnivores / 10)),
    algae: Math.min(10, Math.floor(state.algae / 8)),
    fish: Math.min(8, Math.floor(state.fish / 5)),
    sharks: Math.min(3, Math.max(1, Math.floor(state.sharks / 2))),
  };

  return (
    <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-inner border border-[#D0DBCA] flex flex-col">
      
      {/* Technical Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
         <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
         <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />
         <div className="absolute inset-y-0 left-0 w-px bg-white/20" />
         <div className="absolute inset-y-0 right-0 w-px bg-white/20" />
         <div className="w-full h-full bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* 1. SKY (UDARA) - Top 30% */}
      <div className="relative flex-none h-[30%] bg-gradient-to-b from-[#87CEEB] to-[#B0E0E6] overflow-hidden">
        {/* Background Clouds/Mountains */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-white/20 blur-xl rounded-[100%]" />
        <motion.div 
          animate={{ x: [-10, 10] }} 
          transition={{ repeat: Infinity, duration: 20, repeatType: 'reverse' }} 
          className="absolute top-8 left-10 text-white/40 filter blur-[1px]"
        >
          <Sun size={60} strokeWidth={1} />
        </motion.div>
        
        {/* Distant Mountain Peaks */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-10 opacity-30">
          <div className="w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-bottom-[40px] border-bottom-white" />
          <div className="w-0 h-0 border-l-[80px] border-l-transparent border-r-[80px] border-r-transparent border-bottom-[60px] border-bottom-white" />
        </div>

        {/* Birds */}
        {Array.from({ length: renderCounts.birds }).map((_, i) => (
          <motion.div
            key={`bird-${i}`}
            onClick={() => onOrganismClick?.('birds')}
            whileHover={{ scale: 1.2 }}
            animate={{ 
              x: [0, 150, 0],
              y: [0, 20, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ repeat: Infinity, duration: 12 + i * 3, ease: "easeInOut" }}
            className="absolute text-2xl select-none cursor-pointer z-20"
            style={{ left: `${(i * 15) % 70 + 5}%`, top: `${(i * 20) % 40 + 10}%` }}
          >
            🦅
          </motion.div>
        ))}

        {/* Insects - Swarming behavior */}
        {Array.from({ length: renderCounts.insects }).map((_, i) => (
          <motion.div
            key={`ins-${i}`}
            onClick={() => onOrganismClick?.('insects')}
            whileHover={{ scale: 1.5 }}
            animate={{ 
              x: [0, 15, -15, 0],
              y: [0, -15, 15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ repeat: Infinity, duration: 0.8 + Math.random(), delay: i * 0.1 }}
            className="absolute text-xs cursor-pointer z-20"
            style={{ left: `${Math.random() * 95}%`, top: `${Math.random() * 70 + 15}%` }}
          >
            🐝
          </motion.div>
        ))}
      </div>

      {/* 2. LAND (DARAT) - Middle 40% */}
      <div className="relative flex-none h-[40%] bg-[#91C170] overflow-hidden border-t-4 border-[#A4C400]/20 shadow-inner">
        {/* Detailed Terrain */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2D4F1E_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-black/5 to-transparent" />
        
        {/* Plants - Clustered and varied */}
        {Array.from({ length: renderCounts.plants }).map((_, i) => (
          <motion.div
            key={`land-plt-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1, y: -5 }}
            onClick={() => onOrganismClick?.('plants')}
            className="absolute text-2xl drop-shadow-sm cursor-pointer"
            style={{ 
              left: `${(i * 87.5) % 90 + 5}%`, 
              bottom: `${(i * 41.2) % 60 + 5}%`,
              zIndex: Math.floor((i * 41.2) % 60)
            }}
          >
            {state.soilFertility < 30 ? '🍂' : (i % 2 === 0 ? '🌿' : '🌳')}
          </motion.div>
        ))}

        {/* Herbivores */}
        {Array.from({ length: renderCounts.herbivores }).map((_, i) => (
          <motion.div
            key={`land-hrb-${i}`}
            onClick={() => onOrganismClick?.('herbivores')}
            whileHover={{ scale: 1.2 }}
            animate={{ 
              x: [0, 50, 0],
              y: [0, -5, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ repeat: Infinity, duration: 6 + i, ease: "easeInOut" }}
            className="absolute text-2xl z-50 drop-shadow-md cursor-pointer"
            style={{ left: `${(i * 73) % 80 + 10}%`, top: `${(i * 107) % 60 + 20}%` }}
          >
            🐰
          </motion.div>
        ))}

        {/* Carnivores */}
        {Array.from({ length: renderCounts.carnivores }).map((_, i) => (
          <motion.div
            key={`land-crn-${i}`}
            onClick={() => onOrganismClick?.('carnivores')}
            whileHover={{ scale: 1.2 }}
            animate={{ 
              x: [-40, 40, -40],
              scaleX: [-1, 1, -1]
            }}
            transition={{ repeat: Infinity, duration: 10 + i * 2, ease: "linear" }}
            className="absolute text-4xl z-50 drop-shadow-lg cursor-pointer"
            style={{ left: `${(i * 157) % 60 + 20}%`, top: `${(i * 233) % 40 + 30}%` }}
          >
            🐺
          </motion.div>
        ))}
      </div>

      {/* 3. SEA (LAUT) - Bottom 30% */}
      <div className="relative flex-none h-[30%] bg-gradient-to-b from-[#1E90FF] to-[#00008B] overflow-hidden border-t-8 border-[#B0E0E6]/30">
        {/* Underwater Rays */}
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.05)_45%,rgba(255,255,255,0.05)_55%,transparent_60%)] bg-[length:200%_100%] animate-[shimmer_5s_infinite_linear]" />
        
        {/* Algae/Seaweed clusters */}
        {Array.from({ length: renderCounts.algae }).map((_, i) => (
          <motion.div
            key={`sea-alg-${i}`}
            onClick={() => onOrganismClick?.('algae')}
            whileHover={{ scale: 1.2, rotate: 10 }}
            animate={{ 
              height: ['100%', '110%', '100%'],
              skewX: [-5, 5, -5]
            }}
            transition={{ repeat: Infinity, duration: 4, delay: i * 0.2 }}
            className="absolute text-2xl origin-bottom cursor-pointer z-10"
            style={{ left: `${(i * 37) % 90 + 5}%`, bottom: `-5px` }}
          >
            🌱
          </motion.div>
        ))}

        {/* Fish - Schooling */}
        {Array.from({ length: renderCounts.fish }).map((_, i) => (
          <motion.div
            key={`sea-fsh-${i}`}
            onClick={() => onOrganismClick?.('fish')}
            whileHover={{ scale: 1.3 }}
            animate={{ 
              x: [-20, 120, -20],
              y: [0, 5, -5, 0],
              rotateY: [180, 0, 180]
            }}
            transition={{ repeat: Infinity, duration: 7 + i, ease: "easeInOut" }}
            className="absolute text-xl z-20 drop-shadow-sm cursor-pointer"
            style={{ left: `${(i * 47) % 80}%`, top: `${(i * 79) % 60 + 15}%` }}
          >
            🐟
          </motion.div>
        ))}

        {/* Sharks */}
        {Array.from({ length: renderCounts.sharks }).map((_, i) => (
          <motion.div
            key={`sea-shk-${i}`}
            onClick={() => onOrganismClick?.('sharks')}
            whileHover={{ scale: 1.2 }}
            animate={{ 
              x: [150, -50, 150],
              rotateY: [0, 180, 0]
            }}
            transition={{ repeat: Infinity, duration: 15 + i * 5, ease: "linear" }}
            className="absolute text-4xl z-30 drop-shadow-xl cursor-pointer"
            style={{ right: `${(i * 113) % 50}%`, top: `${(i * 181) % 50 + 20}%` }}
          >
            🦈
          </motion.div>
        ))}

        {/* Bubbles */}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`bub-${i}`}
            animate={{ y: [100, -20], opacity: [0, 0.5, 0] }}
            transition={{ repeat: Infinity, duration: 4 + Math.random() * 4, delay: Math.random() * 4 }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      {/* Overlays */}
      <WeatherVisualOverlay state={state} />
      
      {state.stability < 20 && (
         <div className="absolute inset-0 bg-red-900/20 backdrop-blur-[1px] flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-red-600 text-white px-4 py-2 rounded-full font-black text-[10px] animate-pulse">EKOSISTEM TIDAK STABIL</div>
         </div>
      )}
    </div>
  );
}

function WeatherVisualOverlay({ state }: { state: EcosystemState }) {
  return (
    <AnimatePresence>
      {state.weather === 'hujan' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-40 bg-blue-900/10">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, 500] }}
              transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5 }}
              className="absolute w-0.5 h-4 bg-blue-300/40 rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `-20px` }}
            />
          ))}
        </motion.div>
      )}
      {state.weather === 'terik' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-40 bg-orange-500/10" />
      )}
    </AnimatePresence>
  );
}