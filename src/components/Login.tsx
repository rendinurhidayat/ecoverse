import React from 'react';
import { motion } from 'framer-motion';
import { TreePine, Lock, Globe } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

export default function Login() {
  return (
    <div className="min-h-screen bg-[#F9FBF7] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-12 border border-[#E0E7D9] text-center"
      >
        <div className="w-20 h-20 bg-[#4A7C44] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-[#4A7C44]/20 rotate-3">
          <TreePine size={40} className="text-white" />
        </div>
        
        <h1 className="text-4xl font-serif font-bold text-[#2D4F1E] mb-2 tracking-tight">EcoVerse</h1>
        <p className="text-[#5C6B5C] mb-12 font-medium italic">Gamifikasi Ekosistem & Pendidikan Biologi</p>
        
        <div className="space-y-4">
          <button 
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-4 bg-white border-2 border-[#E0E7D9] py-4 rounded-2xl font-bold text-[#2D3A2D] hover:bg-[#F1F6EE] transition-all group active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
            Lanjutkan dengan Google
          </button>
          
          <div className="flex items-center gap-4 py-4">
            <div className="h-[1px] flex-1 bg-[#E0E7D9]"></div>
            <span className="text-[10px] font-bold text-[#5C6B5C] uppercase tracking-widest">Atau</span>
            <div className="h-[1px] flex-1 bg-[#E0E7D9]"></div>
          </div>

          <button className="w-full bg-[#2D4F1E] text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2D4F1E]/20">
            <Globe size={18} /> Mulai Sebagai Tamu
          </button>
        </div>

        <p className="mt-12 text-[10px] text-[#7A8A7A] uppercase tracking-widest font-bold">
          <Lock size={10} className="inline mr-1 mb-0.5" /> Data Belajar Tersimpan Aman di Cloud
        </p>
      </motion.div>
    </div>
  );
}
