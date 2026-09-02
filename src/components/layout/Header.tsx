'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { Shield, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const formatRoleLabel = (role?: UserRole) => {
    switch (role) {
      case 'manager':
        return 'Plant Manager';
      case 'engineer':
        return 'Maintenance Engineer';
      case 'operator':
        return 'Machine Operator';
      default:
        return 'User';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 md:px-8 shadow-xs">
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold text-base shadow-sm">
          S
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-slate-900">
            Sobha Furniture CMMS
          </h1>
          <p className="text-[11px] text-slate-500">
            Plant Maintenance & Asset Management
          </p>
        </div>
      </div>

      {/* User Info & Sign Out */}
      <div className="flex items-center gap-4">
        {/* Role Badge */}
        <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          <Shield className="h-3.5 w-3.5 text-amber-600" />
          <span>{formatRoleLabel(user?.role)}</span>
        </div>

        {/* User Details */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-900">
            {user?.full_name || user?.email?.split('@')[0]}
          </span>
          <span className="text-[11px] text-slate-500">
            {user?.email}
          </span>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-all"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
