'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  HelpCircle,
  Plus,
  RefreshCw,
  Sparkles,
  Search,
  CheckCircle2,
  FileCheck,
  Cpu,
  ThumbsUp
} from 'lucide-react';
import RCAListTable from '@/components/modules/troubleshooting/RCAListTable';
import FiveWhyRCAModal from '@/components/modules/troubleshooting/FiveWhyRCAModal';
import RCADetailsModal from '@/components/modules/troubleshooting/RCADetailsModal';
import { TroubleshootingRCA, TroubleshootingFilterState } from '@/types/troubleshooting';
import { fetchTroubleshootingRCAs, upvoteRCAFeedback } from '@/lib/services/troubleshootingService';
import { fetchAssets } from '@/lib/services/assetService';
import { getWorkProcedures } from '@/lib/services/workProcedureService';

export default function TroubleshootingPage() {
  const [rcas, setRcas] = useState<TroubleshootingRCA[]>([]);
  const [selectedRca, setSelectedRca] = useState<TroubleshootingRCA | null>(null);
  const [assets, setAssets] = useState<{ id: string; name: string }[]>([]);
  const [procedures, setProcedures] = useState<{ id: string; title: string; procedure_number: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRCAModalOpen, setIsRCAModalOpen] = useState(false);

  const [filters, setFilters] = useState<TroubleshootingFilterState>({
    search: '',
    category: 'all',
    assetId: 'all',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rcaData, assetData, procData] = await Promise.all([
        fetchTroubleshootingRCAs(filters),
        fetchAssets(),
        getWorkProcedures(),
      ]);

      setRcas(rcaData);
      setAssets(assetData.map((a) => ({ id: a.id, name: a.name })));
      setProcedures(procData.map((p) => ({ id: p.id, title: p.title, procedure_number: p.procedure_number })));
    } catch (err) {
      console.error('Error loading Troubleshooting RCA page data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 space-y-6">
        {/* Header Title Section */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-amber-500" />
              Troubleshooting & 5-Why RCA Knowledge Base
            </h1>
            <p className="text-xs text-slate-500">
              Root Cause Analysis framework, AI Hit-Rate diagnostic matching & SOP procedure linking
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-stone-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={() => setIsRCAModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              New 5-Why RCA Entry
            </button>
          </div>
        </div>



        {/* Filter Controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search problem, root cause, or tag..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Categories</option>
              <option value="mechanical">Mechanical</option>
              <option value="electrical">Electrical / Sensor</option>
              <option value="hydraulic">Hydraulic</option>
              <option value="pneumatic">Pneumatic</option>
              <option value="operator_error">Operator Error</option>
              <option value="wear_and_tear">Wear & Tear</option>
              <option value="software_firmware">Software / PLC</option>
            </select>

            {/* Asset Filter */}
            <select
              value={filters.assetId}
              onChange={(e) => setFilters({ ...filters, assetId: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Assets</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setFilters({ search: '', category: 'all', assetId: 'all' })}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-stone-100 hover:bg-stone-200 rounded-xl border border-slate-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>

        {/* RCA Master Table */}
        <RCAListTable rcas={rcas} onSelectRCA={(rca) => setSelectedRca(rca)} />
      </main>

      {/* 5-Why RCA Modal Form */}
      <FiveWhyRCAModal
        isOpen={isRCAModalOpen}
        onClose={() => setIsRCAModalOpen(false)}
        onSuccess={loadData}
        assets={assets}
        procedures={procedures}
      />

      {/* RCA Specifications & 5-Why Details Modal */}
      <RCADetailsModal
        isOpen={Boolean(selectedRca)}
        rca={selectedRca}
        onClose={() => setSelectedRca(null)}
        onUpvote={async (rcaId) => {
          await upvoteRCAFeedback(rcaId);
          await loadData();
        }}
      />
    </div>
  );
}
