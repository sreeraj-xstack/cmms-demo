'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  module?: 'ticket' | 'workorder' | 'approval';
  isRework?: boolean;
}

export function StatusBadge({ status, module = 'ticket', isRework }: StatusBadgeProps) {
  if (isRework) {
    return (
      <span className="bg-red-500 text-white font-extrabold px-2.5 py-0.5 rounded-full text-[11px] animate-pulse">
        REWORK
      </span>
    );
  }

  if (module === 'approval') {
    switch (status) {
      case 'approved':
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[11px]">Approved</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-md text-[11px]">Rejected</span>;
      default:
        return <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md text-[11px]">Pending Approval</span>;
    }
  }

  if (module === 'workorder') {
    switch (status) {
      case 'troubleshooting':
        return <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">Troubleshooting</span>;
      case 'repairing':
        return <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">Repairing</span>;
      case 'waiting_on_sparepart':
        return <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full text-[11px]">Waiting Spares</span>;
      case 'on_hold':
        return <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">On Hold</span>;
      case 'closed':
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">Closed</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full text-[11px]">{status}</span>;
    }
  }

  // Ticket Statuses
  switch (status) {
    case 'reported':
      return <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full text-[11px]">Reported</span>;
    case 'standing':
      return <span className="bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">Machine Standing</span>;
    case 'diagnosed':
      return <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">Diagnosed</span>;
    case 'waiting_spares':
      return <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full text-[11px]">Waiting Spares</span>;
    case 'ready_to_fix':
      return <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">Ready to Fix</span>;
    case 'fixed':
      return <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">Fixed</span>;
    case 'closed':
      return <span className="bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full text-[11px]">Closed</span>;
    case 'rejected':
      return <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full text-[11px]">Rejected</span>;
    default:
      return <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full text-[11px]">{status}</span>;
  }
}
