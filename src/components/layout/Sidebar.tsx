'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { Shield, LogOut, LayoutDashboard, ShieldCheck, Cpu, Wrench, Bell } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getUnreadCount } from '@/lib/services/notificationService';

export function Sidebar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    getUnreadCount(user?.role).then((count) => setUnreadNotifications(count));
  }, [user, pathname]);

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

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Asset Master', href: '/assets', icon: Cpu },
    { label: 'Breakdown Tickets', href: '/breakdown-tickets', icon: Wrench },
    { label: 'Notifications', href: '/notifications', icon: Bell, badge: unreadNotifications },
    { label: 'RBAC Permissions', href: '/rbac-permissions', icon: ShieldCheck },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-5 shadow-xs">
      {/* Top Section: Organization Details Heading */}
      <div className="space-y-6">
        <div className="space-y-1 pb-4 border-b border-slate-100">
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            XStack CMMS
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-snug">
            Plant Maintenance & Asset Management
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-900'
                    : 'text-slate-600 hover:bg-stone-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 shadow-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Role, Personal Information & Logout */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        {/* Role Badge */}
        <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 w-full">
          <Shield className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span className="truncate">{formatRoleLabel(user?.role)}</span>
        </div>

        {/* Personal Information & Logout Button */}
        <div className="flex items-center justify-between gap-2 bg-stone-50 border border-slate-200 rounded-xl p-3">
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.full_name || user?.email?.split('@')[0] || 'User Profile'}
            </p>
            <p className="text-[11px] text-slate-500 truncate" title={user?.email}>
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-all flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
