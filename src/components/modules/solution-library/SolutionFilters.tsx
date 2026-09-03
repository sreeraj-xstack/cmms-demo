'use client';

import React from 'react';
import { SolutionFiltersState } from '@/types/solutionLibrary';
import { Search, Filter, ShieldCheck, Sparkles } from 'lucide-react';

interface SolutionFiltersProps {
  filters: SolutionFiltersState;
  onFilterChange: (newFilters: SolutionFiltersState) => void;
  onOpenAISearch: () => void;
}

const MACHINE_TYPES = [
  'all',
  'CNC Processing Center',
  'Edgebander',
  'Panel Saw',
  'Dust Extraction System',
  'Laminating Press',
  'Sanding Machine',
  'Boiler & Utility System',
];

const ISSUE_CATEGORIES = [
  'all',
  'Spindle & Drive Failure',
  'Electrical Trip',
  'Pneumatic & Vacuum Leak',
  'Temperature & Heater Trip',
  'Mechanical Wear',
  'Hydraulic Pressure Drop',
  'Sensor Calibration',
];

export function SolutionFilters({ filters, onFilterChange, onOpenAISearch }: SolutionFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Searchbar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search solutions by title, error code (e.g. E-404, PT100), symptoms, or steps..."
            className="w-full rounded-xl border border-slate-200 bg-stone-50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
          />
        </div>

        {/* AI Solution Assistant Launcher Button */}
        <button
          onClick={onOpenAISearch}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-xs transition-all flex-shrink-0"
        >
          <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
          <span>AI Solution Matcher</span>
        </button>
      </div>

      {/* Dropdown Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
        {/* Machine Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <select
            value={filters.machineType}
            onChange={(e) => onFilterChange({ ...filters, machineType: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Machine Types</option>
            {MACHINE_TYPES.filter((m) => m !== 'all').map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Issue Category Filter */}
        <div className="flex items-center gap-2">
          <select
            value={filters.issueCategory}
            onChange={(e) => onFilterChange({ ...filters, issueCategory: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Issue Categories</option>
            {ISSUE_CATEGORIES.filter((c) => c !== 'all').map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Verified Only Toggle */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
            className={`w-full flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 font-bold transition-all ${
              filters.verifiedOnly
                ? 'bg-amber-50 border-amber-400 text-amber-900'
                : 'bg-stone-50 border-slate-200 text-slate-600 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className={`h-4 w-4 ${filters.verifiedOnly ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>Manager Verified Only</span>
          </button>
        </div>
      </div>
    </div>
  );
}
