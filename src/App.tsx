import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TreePine, 
  Rabbit, 
  Cat, 
  BarChart3, 
  BrainCircuit, 
  HelpCircle, 
  RefreshCcw, 
  CloudRain, 
  Sun,
  Settings as SettingsIcon,
  LayoutDashboard,
  LogOut,
  Waves,
  Wind,
  Save,
  FolderOpen,
  ArrowRight,
  Trophy,
  CheckCircle2,
  XCircle,
  Dna,
  Bug,
  Bird,
  Fish,
  GraduationCap,
  Sprout,
  Droplets,
  Activity,
  Flame,
  Leaf,
  Star
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { v4 as uuidv4 } from 'uuid';

import { auth, signOut, signInWithGoogle } from './lib/firebase';
import { HABITAT_CONFIG, ORGANISM_DATA, FLASHCARDS, QUIZ_QUESTIONS, SCENARIOS } from './constants';
import { getUserProfile, saveUserProfile, getSaves, saveEcosystem, getQuizzes, addQuiz } from './services/dbService';
import { Organism, OrganismType, EcosystemStats, HabitatType, UserProfile, EcosystemSave, QuizQuestion, Flashcard } from './types';
import Login from './components/Login';
import { useEcosystemEngine } from './hooks/useEcosystemEngine';
import SandboxMode from './components/SandboxMode';
import StoryMode from './components/StoryMode';
import VirtualLab from './components/VirtualLab';
import LearningModule from './components/LearningModule';
import SettingsModule from './components/SettingsModule';
import ChallengeModule from './components/ChallengeModule';
import DailyExam from './components/DailyExam';
import { updateUserXP, updateChallengeProgress } from './services/dbService';

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all w-full group relative ${
        active 
          ? 'bg-[#4A7C44] text-white shadow-xl shadow-[#4A7C44]/20' 
          : 'text-slate-400 hover:bg-[#F1F6EE] hover:text-[#2D4F1E]'
      }`}
    >
      <span className={`${active ? 'text-white' : 'group-hover:text-[#4A7C44]'}`}>{icon}</span>
      <span className="font-bold text-xs uppercase tracking-widest hidden md:block">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-glow" 
          className="absolute -left-1 w-1 h-8 bg-white rounded-full hidden md:block" 
        />
      )}
    </button>
  );
}
// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sandbox' | 'story' | 'lab' | 'learn' | 'quiz' | 'settings' | 'challenges'>('sandbox');
  const [viewHistory, setViewHistory] = useState<EcosystemSave[]>([]);
  const ecoEngine = useEcosystemEngine();

  const handleXpGain = async (xp: number) => {
    if (!user) return;
    const updated = await updateUserXP(user.uid, xp);
    if (updated) setProfile(updated);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        let existingProfile = await getUserProfile(firebaseUser.uid);
        if (!existingProfile) {
          existingProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Siswa EcoVerse',
            xp: 0,
            level: 1,
            completedQuizzes: 0,
            unlockedHabitats: ['forest'],
            badges: []
          };
          await saveUserProfile(existingProfile);
        }
        setProfile(existingProfile);
        setUser(firebaseUser);
        const saves = await getSaves(firebaseUser.uid);
        setViewHistory(saves);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshSaves = async () => {
    if (user) {
      const saves = await getSaves(user.uid);
      setViewHistory(saves);
    }
  };

  const handleStartScenario = (scenario: any) => {
    setActiveTab('sandbox');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F9FBF7] flex flex-col items-center justify-center font-serif text-[#2D4F1E]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
        <RefreshCcw size={48} className="opacity-20" />
      </motion.div>
      <p className="mt-4 font-bold tracking-widest text-[10px] uppercase">Menyusun Biomassa...</p>
    </div>
  );

  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-[#F9FBF7] text-[#2D3A2D] font-sans selection:bg-[#4A7C44] selection:text-white overflow-hidden flex">
      {/* Sidebar */}
      <nav className="w-20 md:w-64 bg-white border-r border-[#E0E7D9] flex flex-col items-center py-8 px-4 gap-8 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#4A7C44] rounded-xl flex items-center justify-center shadow-lg shadow-[#4A7C44]/20">
            <TreePine className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-serif font-bold tracking-tight text-[#2D4F1E] hidden md:block">EcoVerse</h1>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <NavButton active={activeTab === 'sandbox'} onClick={() => setActiveTab('sandbox')} icon={<LayoutDashboard size={20} />} label="Sandbox Mode" />
          <NavButton active={activeTab === 'story'} onClick={() => setActiveTab('story')} icon={<Trophy size={20} />} label="Misi Penjaga" />
          <NavButton active={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')} icon={<Star size={20} />} label="Tantangan" />
          <NavButton active={activeTab === 'lab'} onClick={() => setActiveTab('lab')} icon={<Dna size={20} />} label="Lab Virtual" />
          <NavButton active={activeTab === 'learn'} onClick={() => setActiveTab('learn')} icon={<BrainCircuit size={20} />} label="Materi" />
          <NavButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<HelpCircle size={20} />} label="Ujian" />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={20} />} label="Profil" />
        </div>

        <div className="mt-auto w-full pt-8 border-t border-[#E0E7D9] space-y-4">
          <div className="bg-[#F1F6EE] p-4 rounded-2xl hidden md:block border border-[#E0E7D9]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-[#5C6B5C] uppercase">Level {profile?.level}</span>
              <Trophy size={14} className="text-[#A4C400]" />
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden border border-[#E0E7D9]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(profile?.xp || 0) % 1000 / 10}%` }}
                className="h-full bg-[#4A7C44]"
              />
            </div>
            <p className="text-[10px] text-center mt-2 font-bold text-[#5C6B5C] tracking-tighter">{(profile?.xp || 0) % 1000} / 1000 XP</p>
          </div>
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-3 text-[#A0B0A0] hover:text-red-500 transition-colors w-full group"
          >
            <LogOut size={20} />
            <span className="hidden md:block font-bold text-[10px] uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </nav>

      {/* Konten Utama */}
      <main className="flex-1 relative overflow-y-auto bg-[#F9FBF7]">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[#E0E7D9] px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-[10px] text-[#4A7C44] font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
              <CheckCircle2 size={10} /> Selamat Datang, {profile?.displayName}
            </h2>
            <h3 className="text-2xl font-serif font-bold text-[#2D4F1E]">
              {activeTab === 'sandbox' ? 'Sandbox Mode' : 
               activeTab === 'story' ? 'Misi Penjaga: Algoritma Alam' :
               activeTab === 'lab' ? 'Laboratorium Biologi' :
               activeTab === 'challenges' ? 'Tantangan Harian' :
               activeTab === 'learn' ? 'Ensiklopedia' : 
               activeTab === 'quiz' ? 'Ujian Kompetensi' : 'Pengaturan'}
            </h3>
          </div>
          <div className="hidden sm:flex bg-[#F1F6EE] px-4 py-2 rounded-full border border-[#E0E7D9] items-center gap-3">
             <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"><Waves size={12} className="text-blue-500" /></div>
                <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center"><Wind size={12} className="text-emerald-500" /></div>
             </div>
             <span className="text-[10px] font-bold text-[#5C6B5C] uppercase tracking-widest">Multi-Atmosfer Ready</span>
          </div>
        </header>

        <section className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'sandbox' && (
              <div key="sandbox">
                <SandboxMode 
                  engine={ecoEngine} 
                  uid={user?.uid} 
                  onSaveSuccess={refreshSaves} 
                  onXpGain={handleXpGain}
                  onUpdateProgress={(id, prog) => user && updateChallengeProgress(user.uid, id, prog).then(updated => updated && setProfile(updated))}
                />
              </div>
            )}
            {activeTab === 'story' && (
              <div key="story">
                <StoryMode engine={ecoEngine} uid={user?.uid} />
              </div>
            )}
            {activeTab === 'challenges' && (
              <div key="challenges">
                <ChallengeModule profile={profile} onComplete={handleXpGain} onNavigate={(tab) => setActiveTab(tab)} />
              </div>
            )}
            {activeTab === 'lab' && (
              <div key="lab">
                <VirtualLab onXpGain={handleXpGain} />
              </div>
            )}
            {activeTab === 'learn' && <LearningModule key="learn" />}
            {activeTab === 'quiz' && (
              <DailyExam 
                profile={profile}
                onXpGain={handleXpGain} 
                onBack={() => setActiveTab('sandbox')}
              />
            )}
            {activeTab === 'settings' && <SettingsModule profile={profile} />}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
