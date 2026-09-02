'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRole } from '@/types/auth';
import { Shield, ArrowRight, User, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('operator');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    const res = await signUp(email, password, fullName, role);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-bold text-xl shadow-sm">
            S
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Create Plant Account
          </h1>
          <p className="text-xs text-slate-500">
            Register a new team profile with role-based access
          </p>
        </div>

        {/* Signup Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-stone-50 pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@sobha.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-stone-50 pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-stone-50 pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Select User Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('manager')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all text-xs ${
                    role === 'manager'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-semibold shadow-xs'
                      : 'border-slate-200 bg-stone-50 text-slate-600'
                  }`}
                >
                  <Shield className="h-4 w-4 mb-1 text-amber-500" />
                  Manager
                </button>

                <button
                  type="button"
                  onClick={() => setRole('engineer')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all text-xs ${
                    role === 'engineer'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-semibold shadow-xs'
                      : 'border-slate-200 bg-stone-50 text-slate-600'
                  }`}
                >
                  <Shield className="h-4 w-4 mb-1 text-amber-500" />
                  Engineer
                </button>

                <button
                  type="button"
                  onClick={() => setRole('operator')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all text-xs ${
                    role === 'operator'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-semibold shadow-xs'
                      : 'border-slate-200 bg-stone-50 text-slate-600'
                  }`}
                >
                  <Shield className="h-4 w-4 mb-1 text-amber-500" />
                  Operator
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 py-2.5 text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
            >
              {loading ? 'Registering Account...' : 'Create Account'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Already registered? </span>
            <Link
              href="/login"
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
