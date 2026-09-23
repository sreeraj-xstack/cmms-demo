'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: loginError } = await signIn(email, password);
      if (loginError) {
        const msg = typeof loginError === 'string' ? loginError : (loginError as any).message || 'Invalid credentials';
        setError(msg);
        setLoading(false);
        return;
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('XStack@123');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        {/* Organization Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <Image
            src="/xstack-logo.webp"
            alt="XStack Logo"
            width={72}
            height={72}
            className="h-16 w-16 object-contain"
            priority
          />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-100 border border-slate-200 text-xs font-black tracking-widest text-slate-700 uppercase">
            CMMS
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Plant Maintenance & Asset Management System
          </p>
        </div>

        {/* Quick Filler Buttons */}
        <div className="bg-stone-50 border border-slate-200 rounded-2xl p-3 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Quick Demo Login Fillers
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('manager@xstack.ae')}
              className="py-1.5 px-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 font-semibold text-slate-700 hover:text-amber-800 transition-all text-center truncate"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('engineer@xstack.ae')}
              className="py-1.5 px-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 font-semibold text-slate-700 hover:text-amber-800 transition-all text-center truncate"
            >
              Engineer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('operator@xstack.ae')}
              className="py-1.5 px-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 font-semibold text-slate-700 hover:text-amber-800 transition-all text-center truncate"
            >
              Operator
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl p-3 text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. manager@xstack.ae"
              required
              className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3.5 py-2.5 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full rounded-xl border border-slate-200 bg-stone-50 pl-3.5 pr-10 py-2.5 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 text-xs shadow-xs transition-all disabled:opacity-50 mt-2"
          >
            <LogIn className="h-4 w-4" />
            {loading ? 'Signing In...' : 'Sign In to Account'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Need a new account?{' '}
            <Link
              href="/signup"
              className="font-bold text-slate-900 hover:text-amber-600 transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Powered by XStack Minimal Footer */}
      <footer className="mt-6 text-center">
        <a
          href="https://xstack.ae/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <span>powered by</span>
          <span className="font-semibold text-slate-600 hover:text-amber-600 transition-colors underline decoration-slate-300 underline-offset-2">xstack</span>
        </a>
      </footer>
    </div>
  );
}
