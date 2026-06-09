"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F3] text-[#1A1A1A] font-sans selection:bg-[#92B57A] selection:text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <motion.div 
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-24 -right-24 w-96 h-96 bg-[#92B57A]/20 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.5, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#D1D1F7]/40 rounded-full blur-3xl"
      />

      <div className="max-w-2xl text-center relative z-10 bg-white border-2 border-[#1A1A1A] p-12 md:p-20 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(209,209,247,1)]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block bg-[#D1D1F7] border border-[#1A1A1A]/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-8"
        >
          WORK IN PROGRESS
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-display font-bold uppercase leading-none tracking-tighter mb-6"
        >
          Coming <span className="text-[#92B57A]">Soon</span>.
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium opacity-70 mb-12"
        >
          We're working hard to get this page ready. Check back soon for updates!
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            href="/"
            className="inline-block px-10 py-5 bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] font-black uppercase tracking-widest text-sm rounded-full shadow-[4px_4px_0px_0px_rgba(146,181,122,1)] hover:bg-[#92B57A] hover:border-[#92B57A] transition-all"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
