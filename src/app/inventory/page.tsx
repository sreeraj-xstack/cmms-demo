'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  Package,
  Plus,
  AlertTriangle,
  Layers,
  IndianRupee,
  ShieldCheck,
  Download,
  ArrowRight,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import {
  SparePart,
  SparePartCategory,
  CreateSparePartInput,
  SparePartFilterState,
} from '@/types/sparePart';
import { fetchSpareParts, createSparePart } from '@/lib/services/sparePartService';
import SparePartFilters from '@/components/modules/inventory/SparePartFilters';
import SparePartListTable from '@/components/modules/inventory/SparePartListTable';
import SparePartModalForm from '@/components/modules/inventory/SparePartModalForm';
import SparePartDetailsDrawer from '@/components/modules/inventory/SparePartDetailsDrawer';

export default function SparePartInventoryPage() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState<SparePartFilterState>({
    searchQuery: '',
    category: 'all',
    stockAlert: 'all',
    machineType: 'all',
    sortBy: 'lowest_stock_ratio',
  });

  // Modal & Drawer State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchSpareParts(filters);
      setParts(data);
    } catch (err) {
      console.error('Error fetching spare parts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Derive unique categories and machine types for filter dropdowns
  const categories = useMemo(() => {
    const cats = new Set<SparePartCategory>();
    parts.forEach((p) => cats.add(p.category));
    return Array.from(cats);
  }, [parts]);

  const machineTypes = useMemo(() => {
    const mts = new Set<string>();
    parts.forEach((p) => {
      if (p.compatible_machine_type) mts.add(p.compatible_machine_type);
    });
    return Array.from(mts);
  }, [parts]);

  // Compute KPI Stats
  const kpis = useMemo(() => {
    const totalItems = parts.length;
    const healthyItems = parts.filter((p) => p.quantity_available > p.min_quantity).length;
    const lowStockItems = parts.filter(
      (p) => p.quantity_available > 0 && p.quantity_available <= p.min_quantity
    );
    const outOfStockItems = parts.filter((p) => p.quantity_available <= 0);
    const totalReorderAlerts = lowStockItems.length + outOfStockItems.length;

    const totalValuation = parts.reduce(
      (acc, p) => acc + p.unit_cost * Math.max(0, p.quantity_available),
      0
    );

    return {
      totalItems,
      healthyItems,
      lowStockItems,
      outOfStockItems,
      totalReorderAlerts,
      totalValuation,
      criticalReorderList: [...outOfStockItems, ...lowStockItems],
    };
  }, [parts]);

  const handleCreateSubmit = async (input: CreateSparePartInput) => {
    await createSparePart(input);
    await loadData();
  };

  const handleSelectPart = (part: SparePart) => {
    setSelectedPart(part);
    setIsDrawerOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      'Part Number',
      'Name',
      'Category',
      'Storage Location',
      'Machine Compatibility',
      'Available Qty',
      'Min Qty',
      'Lead Time (Days)',
      'Unit Cost (INR)',
      'Vendor Name',
    ];
    const rows = parts.map((p) => [
      p.part_number,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      `"${p.storage_location}"`,
      `"${p.compatible_machine_type}"`,
      p.quantity_available,
      p.min_quantity,
      p.lead_time_days,
      p.unit_cost,
      `"${p.vendor_name}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Spare_Parts_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-500" />
              Spare Part Inventory Vault
            </h1>
            <p className="text-xs text-slate-500">
              Module 8 • Warehouse storekeeping, stock reorder thresholds & machine location mapping
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-stone-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" /> Export CSV
            </button>

            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-stone-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Register New Spare Part
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Parts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Catalog Parts
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{kpis.totalItems}</div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Active SKUs registered</span>
            </div>
            <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          {/* Healthy Stock */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Healthy Stock Level
              </span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{kpis.healthyItems}</div>
              <span className="text-[11px] text-emerald-600 mt-0.5 block">Above min threshold</span>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Reorder Alerts */}
          <div
            className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition-all ${
              kpis.totalReorderAlerts > 0
                ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20'
                : 'bg-white border-slate-200'
            }`}
            onClick={() => setFilters({ ...filters, stockAlert: 'low_stock' })}
          >
            <div>
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                Critical Reorder Alerts
              </span>
              <div className="text-2xl font-bold text-amber-900 mt-1">
                {kpis.totalReorderAlerts}
              </div>
              <span className="text-[11px] text-amber-800 font-medium mt-0.5 block">
                {kpis.outOfStockItems.length} out of stock • {kpis.lowStockItems.length} low stock
              </span>
            </div>
            <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center border border-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          {/* Total Valuation */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Inventory Valuation
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                ₹{kpis.totalValuation.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Total asset stock value</span>
            </div>
            <div className="w-10 h-10 bg-stone-100 text-stone-700 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Automatic "Reorder Needed" Notification Banner */}
        {kpis.criticalReorderList.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500 text-slate-950 rounded-xl mt-0.5">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  Reorder Required: {kpis.criticalReorderList.length} Items Below Minimum Threshold
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  The following spare parts require purchase requisitions to prevent maintenance downtime:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {kpis.criticalReorderList.slice(0, 4).map((p) => (
                    <span
                      key={p.id}
                      onClick={() => handleSelectPart(p)}
                      className="cursor-pointer text-xs font-semibold px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded-lg shadow-2xs hover:bg-amber-100 transition-colors"
                    >
                      {p.name} ({p.quantity_available}/{p.min_quantity} {p.unit_of_measure}) — Lead Time: {p.lead_time_days}d
                    </span>
                  ))}
                  {kpis.criticalReorderList.length > 4 && (
                    <span className="text-xs text-amber-800 font-semibold py-1">
                      +{kpis.criticalReorderList.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setFilters({ ...filters, stockAlert: 'low_stock' })}
              className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-300 rounded-xl transition-all whitespace-nowrap self-start md:self-center flex items-center gap-1.5"
            >
              Filter Reorder List <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Multi-Factor Filters */}
        <SparePartFilters
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
          machineTypes={machineTypes}
        />

        {/* Inventory Data Table */}
        <SparePartListTable
          parts={parts}
          isLoading={isLoading}
          onSelectPart={handleSelectPart}
          onAdjustStock={handleSelectPart}
        />
      </main>

      {/* Item Creation Modal */}
      <SparePartModalForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        machineTypes={machineTypes}
      />

      {/* Item Details & Stock Adjustment Drawer */}
      <SparePartDetailsDrawer
        part={selectedPart}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStockUpdated={loadData}
      />
    </div>
  );
}
