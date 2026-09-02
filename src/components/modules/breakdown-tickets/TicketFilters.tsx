'use client';

import React from 'react';
import { TicketFiltersState } from '@/types/breakdownTicket';
import { Search, RotateCcw } from 'lucide-react';

interface TicketFiltersProps {
  filters: TicketFiltersState;
  onFilterChange: (newFilters: TicketFiltersState) => void;
}

export function TicketFilters({ filters, onFilterChange }: TicketFiltersProps) {
  const handleReset = () => {
    onFilterChange({
      search: '',
      category: 'all',
      status: 'all',
      urgency: 'all',
      approvalStatus: 'all',
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search by ticket number, issue, asset, or reporter..."
            className="w-full rounded-xl border border-slate-200 bg-stone-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter (Major / Minor) */}
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            className="rounded-xl border border-slate-200 bg-stone-50 px-3 py-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">All Categories (Major/Minor)</option>
            <option value="major">🚨 Major Breakdown</option>
            <option value="minor">Minor Breakdown</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="rounded-xl border border-slate-200 bg-stone-50 px-3 py-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="standing">Machine Standing</option>
            <option value="diagnosed">Diagnosed</option>
            <option value="waiting_spares">Waiting Spares</option>
            <option value="ready_to_fix">Ready to Fix</option>
            <option value="fixed">Fixed</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Manager Approval Filter */}
          <select
            value={filters.approvalStatus}
            onChange={(e) => onFilterChange({ ...filters, approvalStatus: e.target.value })}
            className="rounded-xl border border-slate-200 bg-stone-50 px-3 py-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">All Approvals</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Reset Filters */}
          <button
            onClick={handleReset}
            title="Reset Filters"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
