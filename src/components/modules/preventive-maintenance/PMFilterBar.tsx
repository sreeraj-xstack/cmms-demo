'use client';

import React from 'react';
import { Search, RefreshCw, Wrench, User } from 'lucide-react';
import { PMCalendarFilterState, WorkTypeFilter } from '@/types/preventiveMaintenance';

interface PMFilterBarProps {
  filters: PMCalendarFilterState;
  onFilterChange: (filters: PMCalendarFilterState) => void;
  onReset: () => void;
  onGeneratePMWorkOrders?: () => void;
  isGenerating?: boolean;
  technicians: { id: string; name: string }[];
  assets: { id: string; name: string }[];
}

export default function PMFilterBar({
  filters,
  onFilterChange,
  onReset,
  onGeneratePMWorkOrders,
  isGenerating = false,
  technicians,
  assets,
}: PMFilterBarProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: View Mode Selection & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl p-1 bg-stone-100 border border-slate-200">
            {(['month', 'week', 'day'] as const).map((view) => (
              <button
                key={view}
                onClick={() => onFilterChange({ ...filters, viewMode: view, view_mode: view })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  (filters.viewMode === view || filters.view_mode === view)
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {view} View
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search schedule / asset..."
              value={filters.search || filters.search_query || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, search: e.target.value, search_query: e.target.value })
              }
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Work Type Filter */}
          <div className="flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <select
              value={filters.workType || filters.work_type || 'all'}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  workType: e.target.value as WorkTypeFilter,
                  work_type: e.target.value as WorkTypeFilter,
                })
              }
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Work Types</option>
              <option value="preventive_maintenance">Preventive Maintenance</option>
              <option value="breakdown_repair">Breakdown Repair</option>
              <option value="inspection">Inspection</option>
              <option value="rework">Rework</option>
            </select>
          </div>

          {/* Technician Filter */}
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={filters.technician || filters.technician_id || 'all'}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  technician: e.target.value,
                  technician_id: e.target.value,
                })
              }
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Technicians</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
          </div>

          {/* Asset Filter */}
          <select
            value={filters.assetId || filters.asset_id || 'all'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                assetId: e.target.value,
                asset_id: e.target.value,
              })
            }
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Machines</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2">
          {onGeneratePMWorkOrders && (
            <button
              onClick={onGeneratePMWorkOrders}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Auto Generating WOs...' : 'Run Auto-PM Engine'}
            </button>
          )}

          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-stone-100 hover:bg-stone-200 rounded-xl border border-slate-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
