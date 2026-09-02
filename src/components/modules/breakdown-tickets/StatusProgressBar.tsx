'use client';

import React from 'react';
import { TicketStatus } from '@/types/breakdownTicket';
import { CheckCircle2, Clock, Wrench, AlertCircle, PackageCheck, CheckCheck, XCircle } from 'lucide-react';

interface StatusProgressBarProps {
  currentStatus: TicketStatus;
}

const STAGES: { key: TicketStatus; label: string; icon: any }[] = [
  { key: 'reported', label: 'Reported', icon: AlertCircle },
  { key: 'standing', label: 'Machine Standing', icon: Clock },
  { key: 'diagnosed', label: 'Diagnosed', icon: Wrench },
  { key: 'waiting_spares', label: 'Waiting Spares', icon: PackageCheck },
  { key: 'ready_to_fix', label: 'Ready to Fix', icon: CheckCircle2 },
  { key: 'fixed', label: 'Fixed', icon: CheckCheck },
  { key: 'closed', label: 'Closed', icon: CheckCircle2 },
];

export function StatusProgressBar({ currentStatus }: StatusProgressBarProps) {
  if (currentStatus === 'rejected') {
    return (
      <div className="rounded-xl border border-stone-300 bg-stone-100 p-3 text-center flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
        <XCircle className="h-4 w-4 text-slate-500" />
        Ticket Rejected by Manager
      </div>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
        <span>Status Progression Pipeline</span>
        <span className="text-amber-800 font-mono">Stage {currentIndex + 1} of 7</span>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = stage.icon;

          return (
            <div
              key={stage.key}
              title={stage.label}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                isCurrent
                  ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-xs'
                  : isCompleted
                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold'
                  : 'bg-stone-50 text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 mb-1 ${isCurrent ? 'text-slate-950' : isCompleted ? 'text-amber-700' : 'text-slate-400'}`} />
              <span className="text-[9px] leading-tight truncate w-full">{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
