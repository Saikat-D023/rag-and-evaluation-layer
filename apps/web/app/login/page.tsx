"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4EC] p-4 text-black">
      <div className="w-full max-w-md bg-white border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl font-black uppercase text-center mb-8 tracking-wider">
          RAG EXPLORER
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-widest"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border-2 border-black p-3 bg-white focus:outline-none focus:ring-4 focus:ring-[#7AB547] transition-all rounded-none ${error ? "border-l-4 border-l-red-500" : ""
                }`}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-widest"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full border-2 border-black p-3 bg-white focus:outline-none focus:ring-4 focus:ring-[#7AB547] transition-all rounded-none ${error ? "border-l-4 border-l-red-500" : ""
                }`}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-600 font-bold text-sm tracking-wide">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B88A60] text-black border-2 border-black font-bold uppercase p-4 text-lg hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-[#7AB547] focus:ring-offset-2 focus:ring-offset-white disabled:opacity-75 disabled:cursor-not-allowed transition-all mt-6"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-bold tracking-wide">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="underline hover:bg-[#7AB547] px-1 py-0.5 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
