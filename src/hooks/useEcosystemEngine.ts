import { useState, useEffect, useCallback, useRef } from 'react';
import { EcosystemState, WeatherType } from '../types';

export function useEcosystemEngine() {
  const [state, setState] = useState<EcosystemState>({
    plants: 50,
    herbivores: 20,
    carnivores: 5,
    algae: 40,
    fish: 15,
    sharks: 2,
    birds: 8,
    insects: 30,
    decomposers: 10,
    waterQuality: 100,
    temperature: 25,
    stability: 100,
    oxygen: 95,
    soilFertility: 80,
    biodiversity: 60,
    weather: 'normal'
  });

  const [isPaused, setIsPaused] = useState(false);
  const stateRef = useRef(state);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Weather cycle effect (every 120-180 seconds)
  useEffect(() => {
    let timeoutId: any;
    
    const changeWeather = () => {
      const weathers: WeatherType[] = ['normal', 'hujan', 'terik', 'angin_kencang'];
      const nextWeather = weathers[Math.floor(Math.random() * weathers.length)];
      
      setState(prev => ({ ...prev, weather: nextWeather }));
      
      const nextDelay = (120 + Math.random() * 60) * 1000;
      timeoutId = setTimeout(changeWeather, nextDelay);
    };

    timeoutId = setTimeout(changeWeather, (120 + Math.random() * 60) * 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  const updateState = useCallback((patch: Partial<EcosystemState>) => {
    setState(prev => {
      const newState = { ...prev };
      Object.keys(patch).forEach(key => {
        const k = key as keyof EcosystemState;
        const val = patch[k];
        if (typeof val === 'number') {
          const nextVal = newState[k] + val;
          // Apply realistic limits during manual updates
          if (k === 'temperature') {
            (newState[k] as number) = Math.max(0, Math.min(60, nextVal));
          } else if (['stability', 'waterQuality', 'oxygen', 'soilFertility', 'biodiversity'].includes(k)) {
            (newState[k] as number) = Math.max(0, Math.min(100, nextVal));
          } else {
            (newState[k] as number) = Math.max(0, Math.min(500, nextVal));
          }
        }
      });
      
      // Efek sekunder
      if (newState.plants === 0) newState.stability -= 5;
      if (newState.waterQuality < 20) newState.plants -= 2;
      
      // Batasi stabilitas
      newState.stability = Math.max(0, Math.min(100, newState.stability));
      newState.waterQuality = Math.max(0, Math.min(100, newState.waterQuality));
      
      return newState;
    });
  }, []);

  const tick = useCallback(() => {
    if (isPaused) return;

    setState(prev => {
      const next = { ...prev };
      
      // 1. Pertumbuhan Alami (Logic Disempurnakan)
      const tempFactor = Math.max(0, 1 - Math.abs(next.temperature - 25) / 25);
      const waterFactor = next.waterQuality / 100;
      const soilFactor = next.soilFertility / 100;
      
      // Weather effects
      if (next.weather === 'hujan') {
        next.waterQuality = Math.min(100, next.waterQuality + 0.1);
        next.temperature = Math.max(15, next.temperature - 0.05);
      } else if (next.weather === 'terik') {
        next.waterQuality = Math.max(0, next.waterQuality - 0.1);
        next.temperature = Math.min(45, next.temperature + 0.1);
      } else if (next.weather === 'angin_kencang') {
        next.oxygen = Math.min(100, next.oxygen + 0.05);
        next.soilFertility = Math.max(0, next.soilFertility - 0.02); // Topsoil erosion
      }

      // --- HABITAT REALISED DYNAMICS ---
      
      // pollinators (insects) effect on plants
      const pollinationBonus = 1 + (next.insects / 100);

      // LAND (DARAT)
      const plantGrowth = (next.plants * 0.04 * tempFactor * waterFactor * soilFactor * pollinationBonus) - (next.herbivores * 0.12);
      next.plants += plantGrowth;
      const foodForHerbs = next.plants / (next.herbivores * 2.5 + 1);
      next.herbivores += (next.herbivores * 0.035 * Math.min(1.2, foodForHerbs)) - (next.carnivores * 0.15) - (next.herbivores * 0.02);
      const foodForCarni = next.herbivores / (next.carnivores * 2.2 + 1);
      next.carnivores += (next.carnivores * 0.025 * Math.min(1.1, foodForCarni)) - (next.carnivores * 0.04);

      // SEA (LAUT)
      const algaeGrowth = (next.algae * 0.05 * waterFactor * tempFactor) - (next.fish * 0.2);
      next.algae += algaeGrowth;
      const birdPredation = (next.birds * 0.05); // Birds eat fish
      const foodForFish = next.algae / (next.fish * 1.5 + 1);
      next.fish += (next.fish * 0.04 * Math.min(1.2, foodForFish)) - (next.sharks * 0.15) - (next.fish * 0.02) - birdPredation;
      const foodForSharks = next.fish / (next.sharks * 3 + 1);
      next.sharks += (next.sharks * 0.03 * Math.min(1.1, foodForSharks)) - (next.sharks * 0.05);

      // AIR (UDARA)
      const insectGrowth = (next.plants * 0.01) - (next.birds * 0.12) - (next.insects * 0.03);
      next.insects += insectGrowth;
      const birdGrowth = (next.insects * 0.05 + next.fish * 0.05) / (next.birds + 1);
      next.birds += (next.birds * 0.02 * Math.min(1.5, birdGrowth)) - (next.birds * 0.03);

      // GLOBAL CYCLES
      const waste = (next.herbivores * 0.05) + (next.carnivores * 0.05) + (next.fish * 0.05) + (next.sharks * 0.05);
      next.decomposers += waste * 0.1;
      next.soilFertility = Math.min(100, next.soilFertility + (next.decomposers * 0.01) - (next.plants * 0.005));
      next.oxygen = Math.min(100, next.oxygen + (next.plants * 0.08) + (next.algae * 0.05) - (next.herbivores * 0.04) - (next.carnivores * 0.04));
      next.waterQuality = Math.max(0, next.waterQuality - 0.02 + (next.algae * 0.001) + (next.plants * 0.001));

      // Metrics
      const populations = [next.plants, next.herbivores, next.carnivores, next.algae, next.fish, next.sharks, next.birds, next.insects];
      const speciesPresent = populations.filter(p => p > 1).length;
      next.biodiversity = (speciesPresent / 8) * 100;

      let stabilityChange = 0;
      if (next.plants > next.herbivores * 1.5) stabilityChange += 0.1; else stabilityChange -= 0.15;
      if (next.algae > next.fish * 1.5) stabilityChange += 0.1; else stabilityChange -= 0.15;
      if (next.oxygen < 30) stabilityChange -= 0.5;
      if (next.waterQuality < 40) stabilityChange -= 0.3;
      next.stability += stabilityChange;

      // Batasan Global & Pembersihan Angka (Real-life Limits)
      const result = { ...next };
      Object.keys(result).forEach(key => {
        const k = key as keyof EcosystemState;
        if (typeof result[k] === 'number') {
          result[k] = parseFloat(result[k].toFixed(2));
          
          if (k === 'temperature') {
            result[k] = Math.max(0, Math.min(60, result[k]));
          } else if (['stability', 'waterQuality', 'oxygen', 'soilFertility', 'biodiversity'].includes(k)) {
            result[k] = Math.max(0, Math.min(100, result[k]));
          } else {
            // Population limits for birds, rabbits, etc.
            result[k] = Math.max(0, Math.min(500, result[k]));
          }
        }
      });

      return result;
    });
  }, [isPaused]);

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  return {
    state,
    updateState,
    isPaused,
    setIsPaused,
    reset: () => setState({
      plants: 50,
      herbivores: 20,
      carnivores: 5,
      algae: 40,
      fish: 15,
      sharks: 2,
      birds: 8,
      insects: 30,
      decomposers: 10,
      waterQuality: 100,
      temperature: 25,
      stability: 100,
      oxygen: 95,
      soilFertility: 80,
      biodiversity: 60,
      weather: 'normal'
    })
  };
}
