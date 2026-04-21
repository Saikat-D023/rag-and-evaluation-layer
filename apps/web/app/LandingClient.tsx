"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Cal, { getCalApi } from "@calcom/embed-react";

export default function LandingClient({ user }: { user: any }) {
  const [isCalOpen, setIsCalOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "30min" });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const navVariants = {
    hidden: { y: -100 },
    visible: {
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
      },
    },
  };

  return (
    <div className="min-h-screen text-[#1A1A1A] font-sans selection:bg-[#92B57A] selection:text-white overflow-x-hidden">
      {/* SECTION 1 — NAVBAR */}
      <motion.nav 
        initial="hidden"
        animate="visible"
        variants={navVariants}
        className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-[#1A1A1A]/10 z-50 h-20 flex items-center justify-between px-8"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <motion.div 
            animate={{ rotate: [0, 90, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-5 bg-[#92B57A] border-2 border-[#1A1A1A] rounded-sm"
          ></motion.div>
          <span className="font-display font-bold text-xl uppercase tracking-tighter">
            RAG Explorer
          </span>
        </motion.div>
        <div className="hidden md:flex items-center gap-10 font-bold text-[11px] uppercase tracking-[0.2em]">
          {["Product", "Features", "Pricing", "Docs"].map((item) => (
            <Link 
              key={item}
              href={`#${item.toLowerCase()}`} 
              className="relative group overflow-hidden"
            >
              <span className="group-hover:text-[#92B57A] transition-colors">{item}</span>
              <motion.span 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-[#92B57A]"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest">
          {user ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] hover:bg-[#92B57A] hover:border-[#92B57A] transition-all rounded-full shadow-sm"
              >
                Dashboard
              </Link>
            </motion.div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block hover:text-[#92B57A] transition-colors"
              >
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-[#92B57A] text-white border-2 border-[#92B57A] hover:bg-black hover:border-black transition-all rounded-full shadow-sm"
                >
                  Get Started
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </motion.nav>

      {/* SECTION 2 — HERO */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="pt-32 pb-32 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20"
      >
        <div className="flex-1 space-y-10">
          <motion.div 
            variants={itemVariants}
            className="inline-block bg-[#D1D1F7] border border-[#1A1A1A]/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full"
          >
            V2.0 NOW LIVE
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-display font-bold uppercase leading-[0.95] tracking-tighter"
          >
            Talk to your <motion.span 
              initial={{ color: "#1A1A1A" }}
              animate={{ color: "#92B57A" }}
              transition={{ delay: 1, duration: 1 }}
              className="italic"
            >data</motion.span> like never before.
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl font-medium max-w-xl leading-relaxed opacity-80"
          >
            Advanced Retrieval-Augmented Generation for the modern enterprise. Unified knowledge synthesis at scale.
          </motion.p>
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 pt-4"
          >
            <motion.div whileHover={{ scale: 1.05, x: 2, y: 2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/dashboard"
                className="text-center px-10 py-5 bg-[#92B57A] border-2 border-[#1A1A1A] text-white text-sm font-black uppercase tracking-widest rounded-full shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all inline-block w-full sm:w-auto"
              >
                Start Exploring
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, x: 2, y: 2 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => setIsCalOpen(true)}
                className="text-center px-10 py-5 bg-white border-2 border-[#1A1A1A] text-sm font-black uppercase tracking-widest rounded-full shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all inline-block w-full sm:w-auto"
              >
                Book Demo
              </button>
            </motion.div>
          </motion.div>
        </div>

        <motion.div 
          variants={itemVariants}
          className="flex-1 w-full max-w-lg relative"
        >
          <motion.div 
            whileHover={{ rotate: 2, scale: 1.02 }}
            className="relative w-full aspect-square bg-white border-2 border-[#1A1A1A] rounded-[40px] shadow-[12px_12px_0px_0px_rgba(209,209,247,1)] flex items-center justify-center overflow-hidden"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute w-3/4 h-3/4 bg-[#D1D1F7] rounded-full"
            ></motion.div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              whileHover={{ scale: 1.1, rotate: 180 }}
              className="absolute w-1/2 h-1/2 bg-[#92B57A] rotate-45 border-2 border-[#1A1A1A] opacity-80"
            ></motion.div>
            
            {/* Sticker */}
            <motion.div 
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              whileHover={{ scale: 1.1, rotate: 0 }}
              initial={{ rotate: -6 }}
              className="absolute bottom-10 right-10 bg-[#92B57A] border-2 border-[#1A1A1A] px-6 py-3 font-black uppercase tracking-widest text-[10px] text-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transform cursor-grab active:cursor-grabbing z-30"
            >
              NO CODE
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* SECTION 2.5 — DEMO VIDEO */}
      <section id="demo" className="px-8 max-w-6xl mx-auto -mt-8 mb-32 relative z-20">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="w-full aspect-video bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[32px] shadow-[20px_20px_0px_0px_rgba(146,181,122,0.3)] flex flex-col overflow-hidden group"
        >
          {/* Fake Browser Header */}
          <div className="h-14 bg-white border-b border-[#1A1A1A]/10 flex items-center px-6 gap-2.5 shrink-0">
            <div className="w-3.5 h-3.5 rounded-full bg-[#FF605C]"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD44]"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#28C840]"></div>
            <div className="mx-auto bg-[#F9F8F3] border border-[#1A1A1A]/10 px-6 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full">
              RAG_EXPLORER_DEMO.GIF
            </div>
          </div>
          {/* Demo GIF Area */}
          <div className="flex-1 bg-white flex flex-col items-center justify-center relative">
            <img
              src="/demo.gif"
              alt="RAG Explorer Demo"
              className="absolute inset-0 w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </motion.div>
      </section>

      {/* SECTION 3 — SOCIAL PROOF BAR */}
      <section className="w-full bg-[#1A1A1A] text-white py-10 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="font-display font-bold text-lg uppercase tracking-widest flex-shrink-0"
          >
            POWERING 2,000+ ECOSYSTEMS
          </motion.div>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 font-bold text-sm uppercase tracking-[0.4em]">
            {["Vertex", "OmniCorp", "Nexus_Data", "Synthetica"].map((partner, i) => (
              <motion.span 
                key={partner}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.4 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ opacity: 1, scale: 1.1, color: "#92B57A" }}
                className="cursor-default transition-all"
              >
                {partner}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — FEATURES */}
      <section id="features" className="py-32 px-8 max-w-7xl mx-auto">
        <div className="mb-24">
          <motion.h2 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter leading-none mb-8"
          >
            Engineered for <br/><motion.span 
              animate={{ color: ["#1A1A1A", "#92B57A", "#1A1A1A"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >Intelligence.</motion.span>
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 0.4 }}
            viewport={{ once: true }}
            className="text-xl font-bold uppercase tracking-[0.2em] max-w-xl"
          >
            Experience the next generation of document semantic synthesis.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              icon: "⚡",
              title: "Instant Indexing",
              desc: "Upload documents and have them ready for semantic querying in milliseconds.",
              color: "#D1D1F7"
            },
            {
              icon: "🔍",
              title: "Semantic Search",
              desc: "Find exact meaning behind your data — not just keyword matches. We understand context.",
              color: "#92B57A"
            },
            {
              icon: "❞",
              title: "AI Citations",
              desc: "Every response includes direct citations from your source material. Trust but verify everything.",
              color: "#F9F8F3"
            },
            {
              icon: "🔀",
              title: "Hybrid Retrieval",
              desc: "Combines dense vector similarity with BM25 matching for maximum recall accuracy.",
              color: "#1A1A1A",
              dark: true
            },
            {
              icon: "📊",
              title: "Eval Pipeline",
              desc: "Built-in LLM-as-a-judge scoring. Know your bot's faithfulness score instantly.",
              color: "#D1D1F7"
            },
            {
              icon: "⚡",
              title: "Streaming",
              desc: "Responses stream token-by-token in real time. No waiting. No spinners.",
              color: "#92B57A"
            },
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ 
                y: -10, 
                boxShadow: "0px 20px 40px rgba(146,181,122,0.1)",
                borderColor: "#92B57A"
              }}
              className="bg-white border-2 border-[#1A1A1A] p-10 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(26,26,26,0.05)] transition-all duration-300 group"
            >
              <motion.div 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`w-14 h-14 border-2 border-[#1A1A1A] rounded-2xl flex items-center justify-center text-xl mb-8 shadow-sm`}
                style={{ backgroundColor: feature.color, color: feature.dark ? 'white' : 'black' }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-2xl font-display font-bold uppercase mb-4 tracking-tighter group-hover:text-[#92B57A] transition-colors">
                {feature.title}
              </h3>
              <p className="font-medium text-lg opacity-70 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — HOW IT WORKS */}
      <section id="product" className="py-32 px-8 bg-white border-y border-[#1A1A1A]/10">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-display font-bold uppercase text-center tracking-tighter mb-32"
          >
            The Workflow
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 max-w-5xl mx-auto relative">
            {[
              { num: 1, bg: "#92B57A", title: "Upload", desc: "Drop your enterprise knowledge into the explorer.", color: "white" },
              { num: 2, bg: "#D1D1F7", title: "Index", desc: "Automated vectorization and secure semantic storage.", color: "black" },
              { num: 3, bg: "#1A1A1A", title: "Ask", desc: "Query naturally. Get verified, cited answers instantly.", color: "white" }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center space-y-8 group"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-24 h-24 rounded-full border-2 border-[#1A1A1A] flex items-center justify-center text-4xl font-bold shadow-lg transition-transform"
                  style={{ backgroundColor: step.bg, color: step.color }}
                >
                  {step.num}
                </motion.div>
                <h3 className="text-3xl font-display font-bold uppercase tracking-tighter group-hover:text-[#92B57A] transition-colors">
                  {step.title}
                </h3>
                <p className="font-medium text-lg opacity-70">{step.desc}</p>
              </motion.div>
            ))}
            
            {/* Connection Lines (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-[#1A1A1A]/20 -z-10"></div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — PRICING */}
      <section id="pricing" className="py-32 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-8"
          >
            Simple Pricing.
          </motion.h2>
          <p className="text-xl font-bold uppercase tracking-[0.3em] opacity-40">
            No hidden fees. No nonsense.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 items-stretch gap-10 max-w-6xl mx-auto">
          {/* BASIC */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white border-2 border-[#1A1A1A] p-10 rounded-[40px] flex flex-col hover:border-[#D1D1F7] transition-colors duration-500"
          >
            <h3 className="text-2xl font-display font-bold uppercase tracking-tighter mb-4">Basic</h3>
            <div className="text-6xl font-display font-bold mb-10">$0<span className="text-xl opacity-30 font-sans">/mo</span></div>
            <ul className="space-y-6 mb-12 flex-1 font-bold text-sm uppercase tracking-widest opacity-70">
              <li>✓ 5 Documents</li>
              <li>✓ 100 Queries/mo</li>
              <li>✓ Community Support</li>
            </ul>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/signup" className="block text-center w-full py-5 bg-white border-2 border-[#1A1A1A] font-black uppercase tracking-widest text-xs rounded-full hover:bg-[#D1D1F7] transition-all">
                Get Started
              </Link>
            </motion.div>
          </motion.div>

          {/* PRO */}
          <motion.div 
            initial={{ scale: 0.95 }}
            whileInView={{ scale: 1 }}
            whileHover={{ y: -15, scale: 1.02 }}
            viewport={{ once: true }}
            className="bg-[#92B57A] border-2 border-[#1A1A1A] p-12 rounded-[40px] flex flex-col relative shadow-[16px_16px_0px_0px_rgba(209,209,247,1)]"
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white border-2 border-[#1A1A1A] px-8 py-2 font-black uppercase text-[10px] tracking-[0.3em] rounded-full">
              POPULAR
            </div>
            <h3 className="text-3xl font-display font-bold uppercase tracking-tighter mb-4 text-white">Pro</h3>
            <div className="text-7xl font-display font-bold mb-10 text-white">$29<span className="text-xl opacity-60 font-sans">/mo</span></div>
            <ul className="space-y-6 mb-12 flex-1 font-bold text-sm uppercase tracking-widest text-white/90">
              <li>✓ Unlimited Docs</li>
              <li>✓ 10k Queries/mo</li>
              <li>✓ Priority Support</li>
              <li>✓ Advanced Analytics</li>
              <li>✓ Eval Pipeline</li>
            </ul>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/signup" className="block text-center w-full py-6 bg-[#1A1A1A] text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-white hover:text-black transition-all">
                Go Pro
              </Link>
            </motion.div>
          </motion.div>

          {/* ENTERPRISE */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white border-2 border-[#1A1A1A] p-10 rounded-[40px] flex flex-col hover:border-[#D1D1F7] transition-colors duration-500"
          >
            <h3 className="text-2xl font-display font-bold uppercase tracking-tighter mb-4">Enterprise</h3>
            <div className="text-6xl font-display font-bold mb-10">$99<span className="text-xl opacity-30 font-sans">/mo</span></div>
            <ul className="space-y-6 mb-12 flex-1 font-bold text-sm uppercase tracking-widest opacity-70">
              <li>✓ Custom LLMs</li>
              <li>✓ SLA Guarantee</li>
              <li>✓ Dedicated Manager</li>
              <li>✓ On-premise option</li>
            </ul>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="#contact" className="block text-center w-full py-5 bg-transparent border-2 border-[#1A1A1A] font-black uppercase tracking-widest text-xs rounded-full hover:bg-[#1A1A1A] hover:text-white transition-all">
                Contact Sales
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 7 — CTA BANNER */}
      <section className="w-full bg-[#D1D1F7] py-32 px-8 relative overflow-hidden border-t border-[#1A1A1A]">
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
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl"
        />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-6xl md:text-8xl font-display font-bold uppercase mb-12 tracking-tighter leading-none"
          >
            Ready to talk <br/>to your data?
          </motion.h2>
          <motion.div whileHover={{ scale: 1.05, rotate: 2 }} whileTap={{ scale: 0.95 }}>
            <Link href="/signup" className="inline-block px-14 py-7 bg-[#1A1A1A] text-white font-black uppercase tracking-[0.2em] text-sm rounded-full shadow-[8px_8px_0px_0px_rgba(146,181,122,1)] transition-all">
              Start For Free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8 — FOOTER */}
      <footer className="w-full bg-white py-20 px-8 border-t border-[#1A1A1A]/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-20">
          <div className="space-y-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-4 cursor-pointer"
            >
              <div className="w-6 h-6 bg-[#92B57A] border-2 border-[#1A1A1A]"></div>
              <span className="font-display font-bold text-2xl uppercase tracking-tighter">
                RAG Explorer
              </span>
            </motion.div>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">
              © 2026 RAG Explorer Inc. <br/>Engineered for the future.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
            <div className="flex flex-col gap-4 text-[10px] font-bold uppercase tracking-[0.2em]">
               <span className="opacity-20 mb-2">Platform</span>
               <Link href="#product" className="hover:text-[#92B57A] transition-colors">Product</Link>
               <Link href="#features" className="hover:text-[#92B57A] transition-colors">Features</Link>
               <Link href="#pricing" className="hover:text-[#92B57A] transition-colors">Pricing</Link>
            </div>
            <div className="flex flex-col gap-4 text-[10px] font-bold uppercase tracking-[0.2em]">
               <span className="opacity-20 mb-2">Resources</span>
               <Link href="#" className="hover:text-[#92B57A] transition-colors">Documentation</Link>
               <Link href="#" className="hover:text-[#92B57A] transition-colors">API Reference</Link>
               <Link href="#" className="hover:text-[#92B57A] transition-colors">Community</Link>
            </div>
            <div className="flex flex-col gap-4 text-[10px] font-bold uppercase tracking-[0.2em]">
               <span className="opacity-20 mb-2">Social</span>
               <Link href="#" className="hover:text-[#92B57A] transition-colors">Twitter</Link>
               <Link href="#" className="hover:text-[#92B57A] transition-colors">GitHub</Link>
               <Link href="#" className="hover:text-[#92B57A] transition-colors">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>

      {isCalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 md:p-10">
          <div className="bg-white w-full h-full max-w-5xl max-h-[90vh] rounded-[32px] overflow-hidden relative border-2 border-[#1A1A1A] shadow-2xl">
            <button 
              onClick={() => setIsCalOpen(false)}
              className="absolute top-6 right-6 z-[101] w-12 h-12 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center font-bold border-2 border-[#1A1A1A] hover:bg-[#92B57A] transition-colors"
            >
              ×
            </button>
            <Cal 
              namespace="30min"
              calLink="saikat-dey-arschd/30min"
              style={{width:"100%",height:"100%",overflow:"scroll"}}
              config={{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}}
            />
          </div>
        </div>
      )}
    </div>
  );
}
