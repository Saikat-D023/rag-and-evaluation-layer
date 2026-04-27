"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Invalid credentials');
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message ?? 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F8F3] p-4 text-[#1A1A1A] font-sans selection:bg-[#92B57A] selection:text-white">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-md bg-white border-2 border-[#1A1A1A] p-10 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(209,209,247,1)]"
      >
        <div className="flex justify-center mb-8">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 bg-[#92B57A] border-2 border-[#1A1A1A] flex items-center justify-center text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
          </motion.div>
        </div>
        
        <h1 className="text-4xl font-display font-black uppercase text-center mb-10 tracking-tighter leading-none">
          WELCOME <br/><span className="text-[#92B57A]">BACK</span>
        </h1>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-3">
            <label
              htmlFor="email"
              className="block text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1"
            >
              Identification
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-[#1A1A1A] p-4 bg-white focus:outline-none focus:ring-4 focus:ring-[#92B57A]/20 transition-all rounded-2xl font-bold"
              placeholder="YOUR_EMAIL@DOMAIN.COM"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="password"
              className="block text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1"
            >
              Secret Key
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-[#1A1A1A] p-4 bg-white focus:outline-none focus:ring-4 focus:ring-[#92B57A]/20 transition-all rounded-2xl font-bold"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <motion.div 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-red-50 border-2 border-red-500 p-4 text-red-600 font-bold text-xs uppercase tracking-wider rounded-xl"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02, x: 2, y: 2, boxShadow: "0px 0px 0px 0px rgba(26,26,26,1)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-white font-black uppercase p-5 text-sm tracking-widest rounded-full shadow-[6px_6px_0px_0px_rgba(146,181,122,1)] disabled:opacity-50 transition-all"
          >
            {loading ? "INITIALIZING..." : "ACCESS_SYSTEM"}
          </motion.button>
        </form>

        <div className="mt-10 text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
          New Explorer?{" "}
          <Link
            href="/signup"
            className="text-[#92B57A] underline decoration-2 underline-offset-4 hover:bg-[#92B57A] hover:text-white px-1 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
