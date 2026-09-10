'use client';

import React from 'react';
import { Search, Filter, Wrench, ShieldCheck, AlertTriangle, Layers, RotateCw, XCircle } from 'lucide-react';
import { ToolCategory, ToolFilterState, ToolStatus } from '@/types/tool';

interface ToolFiltersProps {
  filters: ToolFilterState;
  onFilterChange: (newFilters: ToolFilterState) => void;
  categories: ToolCategory[];
  machineTypes: string[];
}

export const TOOL_CATEGORY_LABELS: Record<string, string> = {
  saw_blade: 'Saw Blades',
  saw_blades: 'Saw Blades',
  router_bit: 'Router Bits',
  router_bits: 'Router Bits',
  drill_bit: 'Drill Bits',
  milling_cutter: 'Milling Cutters',
  planer_knife: 'Planer Knives',
  insert: 'Carbide Knife Inserts',
  collet: 'Adapters & Collets',
  other: 'Other Special Tooling',
};

export const TOOL_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  available: {
    label: 'Available in Crib',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: ShieldCheck,
  },
  assigned: {
    label: 'Assigned to Operator',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: Wrench,
  },
  on_machine: {
    label: 'Mounted on Machine',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Wrench,
  },
  dull: {
    label: 'Dull (Needs Grinding)',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: AlertTriangle,
  },
  out_for_sharpening: {
    label: 'Out for Sharpening',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: RotateCw,
  },
  received: {
    label: 'Received from Vendor',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
    icon: ShieldCheck,
  },
  broken: {
    label: 'Broken',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    icon: XCircle,
  },
  scrapped: {
    label: 'Scrapped',
    bg: 'bg-rose-100',
    text: 'text-rose-900',
    border: 'border-rose-300',
    icon: XCircle,
  },
  broken_scrapped: {
    label: 'Scrapped / Retired',
    bg: 'bg-rose-100',
    text: 'text-rose-900',
    border: 'border-rose-300',
    icon: XCircle,
  },
};

export default function ToolFilters({
  filters,
  onFilterChange,
  categories,
  machineTypes,
}: ToolFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleAdapterCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, adapterCode: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status });
  };

  const handleMachineTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, machineType: e.target.value });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="md:col-span-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search tool name, TL# code, serial#, location..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Adapter Code Quick Lookup (Requirement 9.02) */}
        <div className="md:col-span-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Layers className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <input
            type="text"
            value={filters.adapterCode}
            onChange={handleAdapterCodeChange}
            placeholder="Filter by Adapter Code (e.g. ADP-5012)"
            className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 font-mono font-semibold"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-2">
          <select
            value={filters.category}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800 font-semibold"
          >
            <option value="all">All Tool Types</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {TOOL_CATEGORY_LABELS[cat] || cat}
              </option>
            ))}
          </select>
        </div>

        {/* Machine Type Filter */}
        <div className="md:col-span-2">
          <select
            value={filters.machineType}
            onChange={handleMachineTypeChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800 font-semibold"
          >
            <option value="all">All Machines</option>
            {machineTypes.map((mt) => (
              <option key={mt} value={mt}>
                {mt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Status Filter Pills (Requirement 9.07) */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-3 h-3 text-slate-400" /> Tool Status:
        </span>

        <button
          type="button"
          onClick={() => handleStatusChange('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            filters.status === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Tools
        </button>

        {(Object.keys(TOOL_STATUS_CONFIG) as ToolStatus[]).map((st) => {
          const cfg = TOOL_STATUS_CONFIG[st];
          const Icon = cfg.icon;
          const isSelected = filters.status === st;

          return (
            <button
              key={st}
              type="button"
              onClick={() => handleStatusChange(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : `${cfg.bg} ${cfg.text} ${cfg.border} hover:opacity-80`
              }`}
            >
              <Icon className="w-3 h-3" /> {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
