import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#0A0A0A] font-sans selection:bg-[#E8FF00] selection:text-[#0A0A0A] overflow-x-hidden">
      {/* SECTION 1 — NAVBAR */}
      <nav className="fixed top-0 w-full bg-white border-b-2 border-[#0A0A0A] z-50 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#E8FF00] border-2 border-[#0A0A0A]"></div>
          <span className="font-black text-xl uppercase tracking-widest">
            RAG EXPLORER
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-wider">
          <Link href="#product" className="hover:underline hover:bg-[#E8FF00] px-1 transition-all">Product</Link>
          <Link href="#features" className="hover:underline hover:bg-[#E8FF00] px-1 transition-all">Features</Link>
          <Link href="#pricing" className="hover:underline hover:bg-[#E8FF00] px-1 transition-all">Pricing</Link>
          <Link href="#docs" className="hover:underline hover:bg-[#E8FF00] px-1 transition-all">Docs</Link>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-wider">
          {user ? (
            <Link
              href="/dashboard"
              className="px-5 py-2 bg-[#0A0A0A] text-[#E8FF00] border-2 border-[#0A0A0A] hover:bg-gray-800 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block px-5 py-2 bg-transparent border-2 border-[#0A0A0A] hover:bg-[#E8FF00] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 bg-[#E8FF00] border-2 border-[#0A0A0A] hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* SECTION 2 — HERO */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 space-y-8">
          <div className="inline-block bg-[#E8FF00] border-2 border-[#0A0A0A] px-3 py-1 text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            V2.0 NOW LIVE
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-black uppercase leading-[1.05] tracking-tight">
            Talk to your <span className="bg-[#E8FF00] inline-block px-2 border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2 transform">DATA</span> like never before.
          </h1>
          <p className="text-lg md:text-xl font-medium max-w-xl leading-relaxed">
            The ultimate tool for Retrieval-Augmented Generation. Connect your documents and query them with AI-powered precision in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <Link
              href="/signup"
              className="text-center px-8 py-4 bg-[#E8FF00] border-2 border-[#0A0A0A] text-lg font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Start Exploring
            </Link>
            <Link
              href="#demo"
              className="text-center px-8 py-4 bg-white border-2 border-[#0A0A0A] text-lg font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Book Demo
            </Link>
          </div>
          <p className="text-sm font-bold opacity-70 uppercase tracking-widest pt-2">
            No credit card required. Free plan available.
          </p>
        </div>
        
        <div className="flex-1 w-full max-w-lg relative perspective-1000">
          <div className="relative w-full aspect-square bg-[#1a2e1a] border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden">
            {/* Abstract visual elements */}
            <div className="absolute w-3/4 h-3/4 bg-white clip-polygon-hexagon border-2 border-[#0A0A0A] opacity-90 animate-pulse mix-blend-overlay"></div>
            <div className="absolute w-1/2 h-1/2 bg-[#0A0A0A] rounded-full blur-[2px] animate-bounce mix-blend-multiply"></div>
            <div className="absolute w-full h-full bg-[linear-gradient(45deg,transparent_45%,#E8FF00_50%,transparent_55%)] opacity-30"></div>
            
            {/* Sticker */}
            <div className="absolute bottom-6 right-6 bg-[#E8FF00] border-2 border-[#0A0A0A] px-4 py-2 font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-6 transform hover:rotate-12 transition-transform">
              NO CODE NEEDED
            </div>
            {/* Hexagon clip-path definition inline */}
            <style dangerouslySetInnerHTML={{__html: `
              .clip-polygon-hexagon { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
            `}} />
          </div>
        </div>
      </section>

      {/* SECTION 3 — SOCIAL PROOF BAR */}
      <section className="w-full bg-[#0A0A0A] text-white border-y-2 border-[#0A0A0A] py-6 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-black text-xl uppercase tracking-widest flex-shrink-0">
            TRUSTED BY 2,000+ TEAMS
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-50 font-mono text-xl uppercase font-bold tracking-[0.2em] overflow-hidden">
            <span>Vertex</span>
            <span>OmniCorp</span>
            <span>Nexus_Data</span>
            <span className="hidden sm:inline">Synthetica</span>
          </div>
        </div>
      </section>

      {/* SECTION 4 — FEATURES */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase inline-block border-b-8 border-[#E8FF00] pb-2 tracking-tight">
            Engineered for Scale
          </h2>
          <p className="mt-6 text-xl font-bold uppercase tracking-widest opacity-80">
            Experience the next generation of document intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: "⚡",
              title: "INSTANT INDEXING",
              desc: "Upload documents and have them ready for semantic querying in milliseconds.",
            },
            {
              icon: "🔍",
              title: "SEMANTIC SEARCH",
              desc: "Find exact meaning behind your data — not just keyword matches. We understand context.",
            },
            {
              icon: "❞",
              title: "AI CITATIONS",
              desc: "Every response includes direct citations from your source material. Trust but verify everything.",
            },
            {
              icon: "🔀",
              title: "HYBRID RETRIEVAL",
              desc: "Combines dense vector similarity (pgvector) with BM25 keyword matching for maximum recall accuracy.",
            },
            {
              icon: "📊",
              title: "EVAL PIPELINE",
              desc: "Built-in LLM-as-a-judge scoring. Know your bot's faithfulness score before it reaches users.",
            },
            {
              icon: "⚡",
              title: "STREAMING ANSWERS",
              desc: "Responses stream token-by-token in real time. No waiting. No spinners.",
            },
          ].map((feature, i) => (
            <div key={i} className="bg-white border-2 border-[#0A0A0A] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 bg-[#E8FF00] border-2 border-[#0A0A0A] flex items-center justify-center text-xl mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black uppercase mb-4 tracking-wider">
                {feature.title}
              </h3>
              <p className="font-medium text-[15px] leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — HOW IT WORKS */}
      <section id="product" className="py-24 px-6 bg-white border-y-2 border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase mb-20 text-center tracking-tight">
            How It Works
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-4 relative max-w-5xl mx-auto">
            <div className="flex-1 flex flex-col items-center text-center z-10 w-full">
              <div className="w-20 h-20 rounded-full bg-[#E8FF00] border-2 border-[#0A0A0A] flex items-center justify-center text-4xl font-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-3xl font-black uppercase mb-4 tracking-wider">UPLOAD</h3>
              <p className="font-medium text-lg max-w-xs">Drop your .txt or .pdf documents into RAG Explorer.</p>
            </div>
            
            <div className="hidden md:block text-5xl font-black mt-[-100px] z-0 opacity-40">→</div>
            
            <div className="flex-1 flex flex-col items-center text-center z-10 w-full">
              <div className="w-20 h-20 rounded-full bg-[#E8FF00] border-2 border-[#0A0A0A] flex items-center justify-center text-4xl font-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-3xl font-black uppercase mb-4 tracking-wider">INDEX</h3>
              <p className="font-medium text-lg max-w-xs">We chunk, embed, and store your docs in a vector database.</p>
            </div>
            
            <div className="hidden md:block text-5xl font-black mt-[-100px] z-0 opacity-40">→</div>
            
            <div className="flex-1 flex flex-col items-center text-center z-10 w-full">
              <div className="w-20 h-20 rounded-full bg-[#E8FF00] border-2 border-[#0A0A0A] flex items-center justify-center text-4xl font-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-3xl font-black uppercase mb-4 tracking-wider">ASK</h3>
              <p className="font-medium text-lg max-w-xs">Query in plain English. Get grounded, cited answers instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — PRICING */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase mb-6 tracking-tight">
            Simple Pricing
          </h2>
          <p className="text-xl font-bold uppercase tracking-widest opacity-80">
            No hidden fees. No nonsense.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-8 max-w-5xl mx-auto">
          {/* BASIC */}
          <div className="flex-1 bg-white border-2 border-[#0A0A0A] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col mt-4 lg:mt-8 hover:-translate-y-1 transition-transform">
            <h3 className="text-2xl font-black uppercase mb-2 tracking-wider">BASIC</h3>
            <div className="text-5xl font-black mb-8 border-b-2 border-black pb-8">$0<span className="text-xl opacity-60">/month</span></div>
            <ul className="space-y-4 mb-10 flex-1 font-bold">
              <li className="flex items-center gap-3">
                <span className="font-black text-[#E8FF00] text-xl" style={{WebkitTextStroke: "1px black"}}>✓</span>
                5 Documents
              </li>
              <li className="flex items-center gap-3">
                <span className="font-black text-[#E8FF00] text-xl" style={{WebkitTextStroke: "1px black"}}>✓</span>
                100 Queries/month
              </li>
              <li className="flex items-center gap-3">
                <span className="font-black text-[#E8FF00] text-xl" style={{WebkitTextStroke: "1px black"}}>✓</span>
                Community Support
              </li>
            </ul>
            <Link href="/signup" className="block text-center w-full py-4 bg-white border-2 border-[#0A0A0A] font-black uppercase tracking-wider hover:bg-[#E8FF00] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Get Started
            </Link>
          </div>

          {/* PRO */}
          <div className="flex-[1.15] bg-[#E8FF00] border-2 border-[#0A0A0A] p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col relative z-10 lg:-mt-4 hover:-translate-y-1 transition-transform">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white border-2 border-[#0A0A0A] px-6 py-2 font-black uppercase text-sm tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              POPULAR
            </div>
            <h3 className="text-3xl font-black uppercase mb-2 tracking-wider">PRO</h3>
            <div className="text-6xl font-black mb-8 border-b-2 border-black pb-8">$29<span className="text-2xl opacity-60">/month</span></div>
            <ul className="space-y-5 mb-10 flex-1 font-bold text-lg">
              <li className="flex items-center gap-3">
                <span className="font-black text-black text-2xl">✓</span>
                Unlimited Documents
              </li>
              <li className="flex items-center gap-3">
                <span className="font-black text-black text-2xl">✓</span>
                10k Queries/month
              </li>
              <li className="flex items-center gap-3">
                <span className="font-black text-black text-2xl">✓</span>
                Priority Support
              </li>
              <li className="flex items-center gap-3">
                <span className="font-black text-black text-2xl">✓</span>
                Advanced Analytics
              </li>
              <li className="flex items-center gap-3">
                <span className="font-black text-black text-2xl">✓</span>
                Eval Pipeline Access
              </li>
            </ul>
            <Link href="/signup" className="block text-center w-full py-5 bg-[#0A0A0A] text-[#E8FF00] border-2 border-[#0A0A0A] font-black uppercase tracking-widest hover:bg-white hover:text-[#0A0A0A] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-lg">
              Go Pro
            </Link>
          </div>

          {/* ENTERPRISE */}
          <div className="flex-1 bg-white border-2 border-[#0A0A0A] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col mt-4 lg:mt-8 hover:-translate-y-1 transition-transform">
            <h3 className="text-2xl font-black uppercase mb-2 tracking-wider">ENTERPRISE</h3>
            <div className="text-5xl font-black mb-8 border-b-2 border-black pb-8">$99<span className="text-xl opacity-60">/month</span></div>
            <ul className="space-y-4 mb-10 flex-1 font-bold">
              <li className="flex items-center gap-3">
                <span className="font-black text-[#E8FF00] text-xl" style={{WebkitTextStroke: "1px black"}}>✓</span>
                Custom LLMs
              </li>
              <li className="flex items-center gap-3">
                <span className="font-black text-[#E8FF00] text-xl" style={{WebkitTextStroke: "1px black"}}>✓</span>
                SLA Guarantee
              </li>
              <li className="flex items-center gap-3">
                <span className="font-black text-[#E8FF00] text-xl" style={{WebkitTextStroke: "1px black"}}>✓</span>
                Dedicated Manager
              </li>
              <li className="flex items-center gap-3">
                <span className="font-black text-[#E8FF00] text-xl" style={{WebkitTextStroke: "1px black"}}>✓</span>
                On-premise option
              </li>
            </ul>
            <Link href="#contact" className="block text-center w-full py-4 bg-transparent border-2 border-[#0A0A0A] font-black uppercase tracking-wider hover:bg-[#0A0A0A] hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 7 — CTA BANNER */}
      <section className="w-full bg-[#E8FF00] border-y-2 border-[#0A0A0A] py-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black uppercase mb-8 leading-tight tracking-tight">
            Ready to talk to your data?
          </h2>
          <p className="text-xl font-bold mb-12 uppercase tracking-widest opacity-80">
            Join thousands of teams using RAG Explorer.
          </p>
          <Link href="/signup" className="inline-block px-12 py-6 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] font-black uppercase tracking-wider text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-white hover:text-[#0A0A0A] hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            Start For Free
          </Link>
        </div>
      </section>

      {/* SECTION 8 — FOOTER */}
      <footer className="w-full bg-[#0A0A0A] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-5 h-5 bg-[#E8FF00]"></div>
              <span className="font-black text-2xl uppercase tracking-widest">
                RAG EXPLORER
              </span>
            </div>
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest">
              © 2024 RAG Explorer Inc. Built for speed.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 font-bold uppercase text-sm tracking-wider">
            <Link href="#product" className="hover:text-[#E8FF00] transition-colors">Product</Link>
            <Link href="#features" className="hover:text-[#E8FF00] transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-[#E8FF00] transition-colors">Pricing</Link>
            <Link href="#docs" className="hover:text-[#E8FF00] transition-colors">Docs</Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-xs font-bold uppercase opacity-60 tracking-wider">
            <Link href="#" className="hover:text-[#E8FF00] transition-colors">Twitter</Link>
            <span className="opacity-30">|</span>
            <Link href="#" className="hover:text-[#E8FF00] transition-colors">GitHub</Link>
            <span className="opacity-30">|</span>
            <Link href="#" className="hover:text-[#E8FF00] transition-colors">Privacy</Link>
            <span className="opacity-30">|</span>
            <Link href="#" className="hover:text-[#E8FF00] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
