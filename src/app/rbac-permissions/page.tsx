'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Shield, UserCheck, Key, CheckCircle2, Lock } from 'lucide-react';
import { UserRole } from '@/types/auth';

export default function RbacPermissionsPage() {
  const { loading, role } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 pl-64">
        <div className="text-xs text-slate-500 animate-pulse font-medium">
          Connecting to Supabase Session...
        </div>
      </div>
    );
  }

  const formatRoleName = (r?: UserRole | null) => {
    switch (r) {
      case 'manager':
        return 'Plant Manager';
      case 'engineer':
        return 'Maintenance Engineer';
      case 'operator':
        return 'Machine Operator';
      default:
        return 'User Account';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="pl-64">
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-6">
          {/* Role Permissions Matrix */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-500" />
                Role-Based Access Control (RBAC) Permissions
              </h3>
              <span className="text-xs text-slate-500">
                Authenticated as: <strong className="text-slate-800">{formatRoleName(role)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Manager Permissions Card */}
              <div
                className={`rounded-2xl border p-5 transition-all ${
                  role === 'manager'
                    ? 'border-amber-500/50 bg-amber-50/50 ring-1 ring-amber-500/30 shadow-xs'
                    : 'border-slate-200 bg-white opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-amber-500" /> Plant Manager
                  </span>
                  {role === 'manager' && (
                    <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                      ACTIVE ROLE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Full administrative control across breakdown tickets, workorder approvals, rework tickets, and plant KPI calculations.
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    <span>Breakdown Ticket Approvals</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    <span>Assign Workorders & Engineers</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    <span>Issue Rework Tickets</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    <span>OEE & Executive Dashboards</span>
                  </div>
                </div>
              </div>

              {/* Engineer Permissions Card */}
              <div
                className={`rounded-2xl border p-5 transition-all ${
                  role === 'engineer'
                    ? 'border-amber-500/50 bg-amber-50/50 ring-1 ring-amber-500/30 shadow-xs'
                    : 'border-slate-200 bg-white opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-amber-500" /> Maintenance Engineer
                  </span>
                  {role === 'engineer' && (
                    <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                      ACTIVE ROLE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Technical execution, 5-Why root cause troubleshooting, workorder time logging, tool sharpening, and spare part usage.
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    <span>Execute Workorders & Track Time</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    <span>5-Why Root Cause Troubleshooting</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    <span>Log Spare Parts & Tool Sharpening</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Lock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="line-through">Manager Ticket Approvals</span>
                  </div>
                </div>
              </div>

              {/* Operator Permissions Card */}
              <div
                className={`rounded-2xl border p-5 transition-all ${
                  role === 'operator'
                    ? 'border-amber-500/50 bg-amber-50/50 ring-1 ring-amber-500/30 shadow-xs'
                    : 'border-slate-200 bg-white opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-amber-500" /> Machine Operator
                  </span>
                  {role === 'operator' && (
                    <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                      ACTIVE ROLE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Line breakdown reporting, media attachment uploads, asset QR code scanning, and daily preventive checklist execution.
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    <span>Raise Breakdown Tickets + Photos</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    <span>Scan Asset QR Codes</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    <span>Operator Daily PM Checklists</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Lock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="line-through">Spare Parts Inventory Control</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
