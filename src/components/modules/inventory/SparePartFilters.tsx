'use client';

import React from 'react';
import { Search, Filter, ArrowUpDown, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';
import {
  SparePartCategory,
  SparePartFilterState,
  SparePartSortOption,
  StockAlertLevel,
} from '@/types/sparePart';

interface SparePartFiltersProps {
  filters: SparePartFilterState;
  onFilterChange: (newFilters: SparePartFilterState) => void;
  categories: SparePartCategory[];
  machineTypes: string[];
}

export const CATEGORY_LABELS: Record<SparePartCategory, string> = {
  mechanical: 'Mechanical',
  electrical: 'Electrical',
  pneumatic: 'Pneumatic',
  hydraulic: 'Hydraulic',
  bearings: 'Bearings & Bushings',
  fasteners: 'Fasteners & Hardware',
  drives_motors: 'Drives & Motors',
  consumables: 'Consumables & Lubricants',
  other: 'Other Parts',
};

export default function SparePartFilters({
  filters,
  onFilterChange,
  categories,
  machineTypes,
}: SparePartFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  const handleStockAlertChange = (alert: StockAlertLevel) => {
    onFilterChange({ ...filters, stockAlert: alert });
  };

  const handleMachineTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, machineType: e.target.value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sortBy: e.target.value as SparePartSortOption });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search part name, PRT#, location, vendor..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <select
            value={filters.category}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800"
          >
            <option value="all">All Part Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat] || cat}
              </option>
            ))}
          </select>
        </div>

        {/* Machine Type Filter */}
        <div className="md:col-span-3">
          <select
            value={filters.machineType}
            onChange={handleMachineTypeChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800"
          >
            <option value="all">All Machine Compatibility</option>
            {machineTypes.map((mt) => (
              <option key={mt} value={mt}>
                {mt}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="md:col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="w-full pl-8 pr-2 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800 font-medium"
            >
              <option value="lowest_stock_ratio">Sort: Stock Ratio (Lowest First)</option>
              <option value="lead_time">Sort: Lead Time (Fastest to Slowest)</option>
              <option value="vendor">Sort: Vendor Name (A-Z)</option>
              <option value="unit_cost">Sort: Unit Cost (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock Status Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-3 h-3 text-slate-400" /> Stock Level:
        </span>

        <button
          type="button"
          onClick={() => handleStockAlertChange('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            filters.stockAlert === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Inventory
        </button>

        <button
          type="button"
          onClick={() => handleStockAlertChange('in_stock')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
            filters.stockAlert === 'in_stock'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <ShieldCheck className="w-3 h-3" /> Healthy Stock
        </button>

        <button
          type="button"
          onClick={() => handleStockAlertChange('low_stock')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
            filters.stockAlert === 'low_stock'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <AlertTriangle className="w-3 h-3" /> Low Stock Alert
        </button>

        <button
          type="button"
          onClick={() => handleStockAlertChange('out_of_stock')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
            filters.stockAlert === 'out_of_stock'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <XCircle className="w-3 h-3" /> Out of Stock
        </button>
      </div>
    </div>
  );
}
