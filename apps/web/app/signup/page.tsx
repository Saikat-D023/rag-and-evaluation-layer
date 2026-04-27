"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sign up');
      }

      setSuccess(true);
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
            whileHover={{ rotate: -180 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 bg-[#D1D1F7] border-2 border-[#1A1A1A] flex items-center justify-center text-[#1A1A1A]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          </motion.div>
        </div>

        <h1 className="text-4xl font-display font-black uppercase text-center mb-10 tracking-tighter leading-none">
          JOIN THE <br/><span className="text-[#92B57A]">EXPLORERS</span>
        </h1>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8"
            >
              <div className="bg-[#92B57A] border-2 border-[#1A1A1A] p-8 font-bold shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] text-white rounded-2xl">
                <div className="text-[10px] uppercase tracking-[0.4em] mb-4 opacity-70">account_created</div>
                <div className="text-xl uppercase tracking-tighter">SUCCESSFULLY REGISTERED</div>
                <div className="text-[10px] mt-4 opacity-90 normal-case">{email}</div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/login"
                  className="inline-block w-full bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] font-black uppercase p-5 text-sm tracking-widest rounded-full transition-all"
                >
                  Return to Login
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              onSubmit={handleSignup} 
              className="space-y-6"
            >
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="block text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border-2 border-[#1A1A1A] p-4 bg-white focus:outline-none focus:ring-4 focus:ring-[#92B57A]/20 transition-all rounded-2xl font-bold"
                  placeholder="YOUR NAME"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-[#1A1A1A] p-4 bg-white focus:outline-none focus:ring-4 focus:ring-[#92B57A]/20 transition-all rounded-2xl font-bold"
                  placeholder="YOU@DOMAIN.COM"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-[#1A1A1A] p-4 bg-white focus:outline-none focus:ring-4 focus:ring-[#92B57A]/20 transition-all rounded-2xl font-bold"
                  placeholder="MIN_8_CHARS"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border-2 border-[#1A1A1A] p-4 bg-white focus:outline-none focus:ring-4 focus:ring-[#92B57A]/20 transition-all rounded-2xl font-bold"
                  placeholder="REPEAT_PASSWORD"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-red-50 border-2 border-red-500 p-4 text-red-600 font-bold text-[10px] uppercase tracking-wider rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02, x: 2, y: 2, boxShadow: "0px 0px 0px 0px rgba(26,26,26,1)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A1A1A] text-white font-black uppercase p-5 text-sm tracking-widest rounded-full shadow-[6px_6px_0px_0px_rgba(146,181,122,1)] disabled:opacity-50 transition-all mt-4"
              >
                {loading ? "PROCESSING..." : "REGISTER_IDENTITY"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {!success && (
          <div className="mt-10 text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
            Already Registered?{" "}
            <Link
              href="/login"
              className="text-[#92B57A] underline decoration-2 underline-offset-4 hover:bg-[#92B57A] hover:text-white px-1 transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
