'use client';

import React from 'react';
import { AssetFiltersState } from '@/types/asset';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface AssetFiltersProps {
  filters: AssetFiltersState;
  onFilterChange: (newFilters: AssetFiltersState) => void;
  machineTypes: string[];
}

export function AssetFilters({ filters, onFilterChange, machineTypes }: AssetFiltersProps) {
  const handleReset = () => {
    onFilterChange({
      search: '',
      machineType: 'all',
      status: 'all',
      criticality: 'all',
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
            placeholder="Search by asset tag, name, location, or serial number..."
            className="w-full rounded-xl border border-slate-200 bg-stone-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Machine Type Filter */}
          <select
            value={filters.machineType}
            onChange={(e) => onFilterChange({ ...filters, machineType: e.target.value })}
            className="rounded-xl border border-slate-200 bg-stone-50 px-3 py-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">All Machine Types</option>
            {machineTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="rounded-xl border border-slate-200 bg-stone-50 px-3 py-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="operational">Operational</option>
            <option value="standing">Standing (Downtime)</option>
            <option value="maintenance">Maintenance</option>
            <option value="decommissioned">Decommissioned</option>
          </select>

          {/* Criticality Filter */}
          <select
            value={filters.criticality}
            onChange={(e) => onFilterChange({ ...filters, criticality: e.target.value })}
            className="rounded-xl border border-slate-200 bg-stone-50 px-3 py-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">All Criticalities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
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
