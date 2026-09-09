'use client';

import React, { useState } from 'react';
import { DashboardFilterOptions } from '@/lib/services/dashboardService';
import {
  Filter,
  Calendar,
  User,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Database,
  CalendarDays,
  X,
  RotateCcw,
} from 'lucide-react';

interface DashboardFiltersToolbarProps {
  filters: DashboardFilterOptions;
  onFilterChange: (filters: DashboardFilterOptions) => void;
  allAssets: { id: string; name: string }[];
  onOpenRawDataModal: () => void;
  onOpenImportModal: () => void;
}

export default function DashboardFiltersToolbar({
  filters,
  onFilterChange,
  allAssets,
  onOpenRawDataModal,
  onOpenImportModal,
}: DashboardFiltersToolbarProps) {
  const [isAssetSelectorOpen, setIsAssetSelectorOpen] = useState(false);

  const handleTimeframeChange = (timeframe: DashboardFilterOptions['timeframe']) => {
    onFilterChange({ ...filters, timeframe });
  };

  const handleTechnicianChange = (technician: string) => {
    onFilterChange({ ...filters, technician });
  };

  const handleStatusChange = (ticketStatus: string) => {
    onFilterChange({ ...filters, ticketStatus });
  };

  const handleDayOfWeekChange = (dayOfWeek: string) => {
    onFilterChange({ ...filters, dayOfWeek });
  };

  const toggleAssetInclusion = (assetId: string) => {
    let updated: string[] = [];
    if (filters.selectedAssetIds.includes(assetId)) {
      updated = filters.selectedAssetIds.filter((id) => id !== assetId);
    } else {
      updated = [...filters.selectedAssetIds, assetId];
    }
    onFilterChange({ ...filters, selectedAssetIds: updated });
  };

  const selectAllAssets = () => {
    onFilterChange({ ...filters, selectedAssetIds: allAssets.map((a) => a.id) });
  };

  const deselectAllAssets = () => {
    onFilterChange({ ...filters, selectedAssetIds: [] });
  };

  const resetFilters = () => {
    onFilterChange({
      timeframe: '30d',
      technician: 'all',
      ticketStatus: 'all',
      dayOfWeek: 'all',
      excludeOutliers: false,
      selectedAssetIds: allAssets.map((a) => a.id),
      useImportedData: false,
    });
  };

  const activeFilterCount =
    (filters.technician !== 'all' ? 1 : 0) +
    (filters.ticketStatus !== 'all' ? 1 : 0) +
    (filters.dayOfWeek !== 'all' ? 1 : 0) +
    (filters.excludeOutliers ? 1 : 0) +
    (filters.useImportedData ? 1 : 0) +
    (filters.selectedAssetIds.length > 0 && filters.selectedAssetIds.length < allAssets.length ? 1 : 0);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      {/* Top Filter Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        {/* Left: Timeframe Tabs (Requirement 10.02) */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <Calendar className="w-4 h-4 text-slate-400 ml-2 mr-1" />
          <button
            onClick={() => handleTimeframeChange('today')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filters.timeframe === 'today'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handleTimeframeChange('7d')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filters.timeframe === '7d'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleTimeframeChange('30d')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filters.timeframe === '30d'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => handleTimeframeChange('quarter')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filters.timeframe === 'quarter'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Quarter
          </button>
          <button
            onClick={() => handleTimeframeChange('ytd')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filters.timeframe === 'ytd'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Year to Date
          </button>
        </div>

        {/* Right: Data Engine Switcher & Raw Data Buttons (Requirement 10.03 & 10.04) */}
        <div className="flex items-center gap-2">
          {/* Imported Data Mode Toggle (Requirement 10.04) */}
          <button
            onClick={onOpenImportModal}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              filters.useImportedData
                ? 'bg-purple-100 text-purple-950 border-purple-300 ring-2 ring-purple-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-stone-50'
            }`}
          >
            <Database className="w-4 h-4 text-purple-600" />
            {filters.useImportedData ? 'Imported Benchmark Data (Active)' : 'Use Imported Data'}
          </button>

          {/* View Raw Data Calculation Matrix (Requirement 10.03) */}
          <button
            onClick={onOpenRawDataModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-stone-50 shadow-xs transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
            View Raw Data Records
          </button>
        </div>
      </div>

      {/* Second Row: Specific Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
        {/* Repair Engineer Filter (Requirement 10.02) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <User className="w-3 h-3 text-amber-500" /> Repair Engineer
          </label>
          <select
            value={filters.technician}
            onChange={(e) => handleTechnicianChange(e.target.value)}
            className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Technicians</option>
            <option value="Ramesh Kumar">Ramesh Kumar</option>
            <option value="Suresh V">Suresh V</option>
            <option value="Vikram Singh">Vikram Singh</option>
            <option value="Anil Mehta">Anil Mehta</option>
          </select>
        </div>

        {/* Breakdown Ticket Status Filter (Requirement 10.02) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-amber-500" /> Ticket Status
          </label>
          <select
            value={filters.ticketStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Ticket Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Day-of-Week Specific Filter (Requirement 10.10) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <CalendarDays className="w-3 h-3 text-amber-500" /> Day of Week Filter
          </label>
          <select
            value={filters.dayOfWeek}
            onChange={(e) => handleDayOfWeekChange(e.target.value)}
            className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Days (Mon - Sun)</option>
            <option value="monday">Mondays Only</option>
            <option value="tuesday">Tuesdays Only</option>
            <option value="wednesday">Wednesdays Only</option>
            <option value="thursday">Thursdays Only</option>
            <option value="friday">Fridays Only</option>
            <option value="saturday">Saturdays Only</option>
            <option value="sunday">Sundays Only</option>
          </select>
        </div>

        {/* Outlier Exclusion Switcher (Requirement 10.11) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Data Manipulation
          </label>
          <button
            onClick={() => onFilterChange({ ...filters, excludeOutliers: !filters.excludeOutliers })}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
              filters.excludeOutliers
                ? 'bg-rose-50 text-rose-950 border-rose-300 ring-2 ring-rose-500/20'
                : 'bg-stone-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>{filters.excludeOutliers ? 'Outliers Excluded' : 'Exclude Outliers'}</span>
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                filters.excludeOutliers ? 'bg-rose-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}
            >
              {filters.excludeOutliers ? '✓' : '×'}
            </div>
          </button>
        </div>

        {/* Multi-Asset Inclusions/Exclusions Dropdown (Requirement 10.13) */}
        <div className="relative">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-500" /> Plant Assets Scope
            </span>
            <span className="text-[10px] text-amber-700 font-bold">
              {filters.selectedAssetIds.length}/{allAssets.length} Active
            </span>
          </label>
          <button
            onClick={() => setIsAssetSelectorOpen(!isAssetSelectorOpen)}
            className="w-full flex items-center justify-between bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 hover:border-slate-300"
          >
            <span className="truncate">
              {filters.selectedAssetIds.length === allAssets.length
                ? 'All Plant Machinery'
                : `${filters.selectedAssetIds.length} Assets Selected`}
            </span>
            <span className="text-slate-400">▼</span>
          </button>

          {/* Asset Selection Popover */}
          {isAssetSelectorOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Include/Exclude Assets</span>
                <div className="flex items-center gap-2 text-[11px]">
                  <button onClick={selectAllAssets} className="text-amber-700 font-semibold hover:underline">
                    All
                  </button>
                  <span>•</span>
                  <button onClick={deselectAllAssets} className="text-slate-500 hover:underline">
                    Clear
                  </button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {allAssets.map((asset) => {
                  const isChecked = filters.selectedAssetIds.includes(asset.id);
                  return (
                    <label
                      key={asset.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-stone-50 cursor-pointer text-xs text-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAssetInclusion(asset.id)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="truncate font-medium">{asset.name}</span>
                    </label>
                  );
                })}
              </div>

              <button
                onClick={() => setIsAssetSelectorOpen(false)}
                className="w-full py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Apply Asset Scope
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-500 font-medium">Active Filters:</span>
          {filters.technician !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-semibold">
              Engineer: {filters.technician}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleTechnicianChange('all')} />
            </span>
          )}
          {filters.ticketStatus !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-semibold">
              Status: {filters.ticketStatus}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleStatusChange('all')} />
            </span>
          )}
          {filters.dayOfWeek !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-semibold">
              Day: {filters.dayOfWeek}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleDayOfWeekChange('all')} />
            </span>
          )}
          {filters.excludeOutliers && (
            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded-full font-semibold">
              Outliers Excluded
              <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange({ ...filters, excludeOutliers: false })} />
            </span>
          )}
          {filters.useImportedData && (
            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full font-semibold">
              Imported Mode
              <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange({ ...filters, useImportedData: false })} />
            </span>
          )}

          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 ml-auto font-semibold"
          >
            <RotateCcw className="w-3 h-3" /> Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
