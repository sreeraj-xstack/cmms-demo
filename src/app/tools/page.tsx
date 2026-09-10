'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  Wrench,
  Plus,
  AlertTriangle,
  Layers,
  IndianRupee,
  ShieldCheck,
  Download,
  RotateCw,
  QrCode,
  TrendingDown,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { Tool, ToolCategory, CreateToolInput, ToolFilterState } from '@/types/tool';
import { fetchTools, createTool } from '@/lib/services/toolService';
import ToolFilters from '@/components/modules/tools/ToolFilters';
import ToolListTable from '@/components/modules/tools/ToolListTable';
import ToolModalForm from '@/components/modules/tools/ToolModalForm';
import ToolDetailsDrawer from '@/components/modules/tools/ToolDetailsDrawer';
import ToolQRScannerModal from '@/components/modules/tools/ToolQRScannerModal';
import { ItemQRModal } from '@/components/common/ItemQRModal';

export default function ToolManagementPage() {
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState<ToolFilterState>({
    searchQuery: '',
    category: 'all',
    status: 'all',
    machineType: 'all',
    adapterCode: '',
    sortBy: 'name',
  });

  // Modal & Drawer State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [qrTool, setQrTool] = useState<Tool | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Listen for dynamic QR URL parameters (e.g. /tools?toolId=TL-2026-1001)
  useEffect(() => {
    if (typeof window !== 'undefined' && allTools.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const toolIdParam = urlParams.get('toolId');
      if (toolIdParam) {
        const query = toolIdParam.trim().toLowerCase();
        const found = allTools.find(
          (t) =>
            t.id.toLowerCase() === query ||
            t.tool_number.toLowerCase() === query ||
            (t.adapter_code && t.adapter_code.toLowerCase() === query)
        );
        if (found) {
          setSelectedTool(found);
          setIsDrawerOpen(true);
        }
      }
    }
  }, [allTools]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTools(); // Fetch master catalog
      setAllTools(data);
    } catch (err) {
      console.error('Error fetching tools:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Derive unique categories and machine types from overall master catalog
  const categories = useMemo(() => {
    const cats = new Set<ToolCategory>();
    allTools.forEach((t) => cats.add(t.category as ToolCategory));
    return Array.from(cats);
  }, [allTools]);

  const machineTypes = useMemo(() => {
    const mts = new Set<string>();
    allTools.forEach((t) => {
      if (t.compatible_machine_type) mts.add(t.compatible_machine_type);
    });
    return Array.from(mts);
  }, [allTools]);

  // Compute Overall Plant KPI Stats (Constant regardless of active filters)
  const kpis = useMemo(() => {
    const totalItems = allTools.length;
    const availableItems = allTools.filter((t) => t.status === 'available').length;
    const dullOrSharpeningItems = allTools.filter(
      (t) => t.status === 'dull' || t.status === 'out_for_sharpening'
    ).length;
    const scrappedItems = allTools.filter((t) => t.status === 'scrapped' || t.status === 'broken' || !t.can_be_sharpened).length;
    const lowStockItems = allTools.filter((t) => t.quantity_available <= t.min_quantity);

    const totalValuation = allTools.reduce(
      (acc, t) => acc + (t.unit_cost || 0) * Math.max(0, t.quantity_available || 0),
      0
    );

    return {
      totalItems,
      availableItems,
      dullOrSharpeningItems,
      scrappedItems,
      lowStockItems,
      totalValuation,
    };
  }, [allTools]);

  // Filtered Tools for Data Table
  const displayedTools = useMemo(() => {
    let result = [...allTools];

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tool_number.toLowerCase().includes(q) ||
          (t.storage_location && t.storage_location.toLowerCase().includes(q)) ||
          (t.vendor_name && t.vendor_name.toLowerCase().includes(q)) ||
          (t.compatible_machine_type && t.compatible_machine_type.toLowerCase().includes(q)) ||
          (t.adapter_code && t.adapter_code.toLowerCase().includes(q)) ||
          (t.serial_number && t.serial_number.toLowerCase().includes(q))
      );
    }

    if (filters.category && filters.category !== 'all') {
      result = result.filter((t) => t.category === filters.category);
    }

    if (filters.status && filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters.machineType && filters.machineType !== 'all') {
      result = result.filter((t) =>
        t.compatible_machine_type && t.compatible_machine_type.toLowerCase().includes(filters.machineType.toLowerCase())
      );
    }

    if (filters.adapterCode && filters.adapterCode.trim() !== '') {
      const ac = filters.adapterCode.trim().toLowerCase();
      result = result.filter((t) => t.adapter_code && t.adapter_code.toLowerCase().includes(ac));
    }

    return result;
  }, [allTools, filters]);

  const handleCreateSubmit = async (input: CreateToolInput) => {
    await createTool(input);
    await loadData();
  };

  const handleSelectTool = (tool: Tool) => {
    setSelectedTool(tool);
    setIsDrawerOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      'Tool Number',
      'Name',
      'Category',
      'Adapter Code',
      'Serial Number',
      'Status',
      'Storage Location',
      'Machine Compatibility',
      'Sharpening Cycles Completed',
      'Max Cycles',
      'Cut Meters',
      'Available Qty',
      'Min Qty',
      'Unit Cost (INR)',
      'Vendor Name',
    ];

    const rows = displayedTools.map((t) => [
      t.tool_number,
      `"${t.name.replace(/"/g, '""')}"`,
      t.category,
      t.adapter_code || '',
      t.serial_number || '',
      t.status,
      `"${t.storage_location}"`,
      `"${t.compatible_machine_type}"`,
      t.sharpening_cycles_completed,
      t.max_sharpening_cycles,
      t.cutting_meters,
      t.quantity_available,
      t.min_quantity,
      t.unit_cost,
      `"${t.vendor_name}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Industrial_Tools_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 space-y-6 min-w-0 max-w-full overflow-x-hidden">
        {/* Top Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Wrench className="w-6 h-6 text-amber-500" />
              Industrial Tool Management & Sharpening Telemetry
            </h1>
            <p className="text-xs text-slate-500">
              Cutting tool crib inventory, adapter collet mapping, running meter tracking & automated ERP orders
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-stone-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" /> Export CSV
            </button>

            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-stone-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Register New Tool
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Tool Catalog
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{kpis.totalItems}</div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Active SKUs registered</span>
            </div>
            <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Available in Tool Crib
              </span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{kpis.availableItems}</div>
              <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">Ready for production</span>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Dull / Sharpening Lifecycle
              </span>
              <div className="text-2xl font-bold text-amber-800 mt-1">{kpis.dullOrSharpeningItems}</div>
              <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">Out for grinding service</span>
            </div>
            <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center border border-amber-200">
              <RotateCw className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tooling Valuation
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                ₹{kpis.totalValuation.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Crib stock valuation</span>
            </div>
            <div className="w-10 h-10 bg-stone-100 text-stone-700 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Low Stock & ERP Reorder Alert Banner (Requirement 9.03 & 9.09) */}
        {kpis.lowStockItems.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500 text-slate-950 rounded-xl mt-0.5">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  Low Stock & Reorder Alert: {kpis.lowStockItems.length} Tools Below Threshold
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  ERP Purchase Requisitions generated for items reaching minimum crib inventory:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {kpis.lowStockItems.slice(0, 4).map((t) => (
                    <span
                      key={t.id}
                      onClick={() => handleSelectTool(t)}
                      className="cursor-pointer text-xs font-semibold px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded-lg shadow-2xs hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                    >
                      {t.name} ({t.quantity_available}/{t.min_quantity} Pcs)
                      {t.erp_pr_number && (
                        <span className="font-mono text-[10px] font-bold text-amber-800">
                          [{t.erp_pr_number}]
                        </span>
                      )}
                    </span>
                  ))}
                  {kpis.lowStockItems.length > 4 && (
                    <span className="text-xs text-amber-800 font-bold py-1">
                      +{kpis.lowStockItems.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setFilters({ ...filters, status: 'dull' })}
              className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-300 rounded-xl transition-all whitespace-nowrap self-start md:self-center flex items-center gap-1.5"
            >
              Filter Reorder & Dull Tools
            </button>
          </div>
        )}

        {/* Multi-Factor Filter Bar */}
        <ToolFilters
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
          machineTypes={machineTypes}
        />

        {/* Tool Inventory Data Table */}
        <ToolListTable
          tools={displayedTools}
          isLoading={isLoading}
          onSelectTool={handleSelectTool}
          onRecordUsage={handleSelectTool}
          onSendSharpening={handleSelectTool}
          onOpenQR={(tool) => setQrTool(tool)}
        />
      </main>

      {/* Tool Item Creation Modal */}
      <ToolModalForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        machineTypes={machineTypes}
      />

      {/* Tool Specifications & Telemetry Drawer */}
      <ToolDetailsDrawer
        tool={selectedTool}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onToolUpdated={loadData}
      />

      {/* Scannable Printable QR Tag Modal */}
      <ItemQRModal
        isOpen={!!qrTool}
        onClose={() => setQrTool(null)}
        title="Industrial Tool QR Identification Tag"
        itemCode={qrTool?.tool_number || ''}
        itemName={qrTool?.name || ''}
        location={qrTool?.storage_location || ''}
        itemType="tool"
        itemId={qrTool?.id || qrTool?.tool_number || ''}
        subText={qrTool?.adapter_code ? `Adapter Collet: ${qrTool.adapter_code}` : undefined}
      />

      {/* QR Code Scanner Modal */}
      <ToolQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        tools={displayedTools}
        onSelectTool={handleSelectTool}
      />
    </div>
  );
}
