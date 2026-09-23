'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';
import { Menu, Bell, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getUnreadCount } from '@/lib/services/notificationService';
import { UserRole } from '@/types/auth';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const { user } = useAuth();

  // Close mobile drawer whenever user navigates
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Load unread notification count
  useEffect(() => {
    if (user?.role) {
      getUnreadCount(user.role).then(setUnreadCount);
    }
  }, [user, pathname]);

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
    <div className="min-h-screen bg-stone-50 flex flex-col w-full max-w-full overflow-x-hidden">
      {/* 1. Mobile & Tablet Sticky Top App Bar (Visible on < lg screens) */}
      <header className="lg:hidden sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-3 sm:px-4 shadow-2xs">
        {/* Left: Hamburger Button & Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-stone-50 text-slate-700 hover:bg-stone-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            aria-label="Open Navigation Menu"
            title="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/xstack-logo.webp"
              alt="XStack Logo"
              width={30}
              height={30}
              className="h-7 w-7 object-contain"
              priority
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-slate-900">XStack</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-stone-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                CMMS
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Notification Bell & Role Badge */}
        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-all"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950 shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
            <Shield className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
            <span className="hidden sm:inline">{formatRoleLabel(user?.role)}</span>
            <span className="sm:hidden capitalize">{user?.role || 'User'}</span>
          </div>
        </div>
      </header>

      {/* 2. Responsive Sidebar (Desktop Fixed + Mobile Slide-Over Drawer) */}
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      {/* 3. Main Content Container (No mobile left-offset, lg:pl-64 on desktop) */}
      <main className="flex-1 lg:pl-64 min-w-0 w-full max-w-full flex flex-col">
        {children}
      </main>
    </div>
  );
}
