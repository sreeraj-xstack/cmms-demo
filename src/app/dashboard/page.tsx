'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Clock, Hammer } from 'lucide-react';

export default function DashboardPage() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 pl-64">
        <div className="text-xs text-slate-500 animate-pulse font-medium">
          Connecting to Supabase Session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="pl-64 flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-4 shadow-xs">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600">
            <Hammer className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Dashboard
            </h2>
            <p className="text-xs font-semibold text-amber-700 flex items-center justify-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Development In Progress
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Module-by-module feature implementation is ready to begin. Select options from the navigation menu.
          </p>
        </div>
      </main>
    </div>
  );
}
