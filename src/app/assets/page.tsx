'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Asset, AssetFiltersState, CreateAssetInput, AssetStatus } from '@/types/asset';
import { fetchAssets, createAsset, updateAssetStatus } from '@/lib/services/assetService';
import { AssetFilters } from '@/components/modules/assets/AssetFilters';
import { AssetListTable } from '@/components/modules/assets/AssetListTable';
import { AssetModalForm } from '@/components/modules/assets/AssetModalForm';
import { AssetDetailsDrawer } from '@/components/modules/assets/AssetDetailsDrawer';
import { QRCodeModal } from '@/components/modules/assets/QRCodeModal';
import { Plus, Cpu, CheckCircle2, AlertTriangle, ShieldAlert, RefreshCw, AlertCircle } from 'lucide-react';

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);

  const [filters, setFilters] = useState<AssetFiltersState>({
    search: '',
    machineType: 'all',
    status: 'all',
    criticality: 'all',
  });

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchAssets(filters);
      setAssets(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch assets from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const uniqueMachineTypes = useMemo(() => {
    const types = new Set(assets.map((a) => a.machine_type));
    return Array.from(types);
  }, [assets]);

  const stats = useMemo(() => {
    return {
      total: assets.length,
      operational: assets.filter((a) => a.status === 'operational').length,
      standing: assets.filter((a) => a.status === 'standing').length,
      critical: assets.filter((a) => a.criticality === 'critical').length,
    };
  }, [assets]);

  const handleCreateAsset = async (input: CreateAssetInput) => {
    setErrorMessage(null);
    try {
      await createAsset(input);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create asset in database.');
    }
  };

  const handleStatusChange = async (assetId: string, newStatus: AssetStatus) => {
    await updateAssetStatus(assetId, newStatus);
    if (selectedAsset && selectedAsset.id === assetId) {
      setSelectedAsset({ ...selectedAsset, status: newStatus });
    }
    await loadData();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="pl-64">
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-6">
          {/* Header Title & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-amber-500" />
                Asset Master Catalog
              </h1>
              <p className="text-xs text-slate-500">
                Plant machinery, location mapping, specifications, and QR code tags
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-50 transition-all shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-xs transition-all"
              >
                <Plus className="h-4 w-4" />
                Register New Asset
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Database Action Error</p>
                <p>{errorMessage}</p>
                <p className="text-[11px] text-amber-700">
                  Make sure you have executed <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">01_assets_schema.sql</code> in your Supabase SQL Editor.
                </p>
              </div>
            </div>
          )}

          {/* Plant Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Assets</span>
              <p className="text-xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-[10px] text-slate-400">Registered Plant Machinery</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" /> Operational
              </span>
              <p className="text-xl font-bold text-slate-900">{stats.operational}</p>
              <p className="text-[10px] text-slate-400">Running on Production Line</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider block flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-slate-800" /> Standing (Downtime)
              </span>
              <p className="text-xl font-bold text-slate-900">{stats.standing}</p>
              <p className="text-[10px] text-slate-400">Awaiting Repair or Spares</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" /> Critical Assets
              </span>
              <p className="text-xl font-bold text-slate-900">{stats.critical}</p>
              <p className="text-[10px] text-slate-400">High Line Impact</p>
            </div>
          </div>

          {/* Search & Multi-Filter Controls */}
          <AssetFilters
            filters={filters}
            onFilterChange={setFilters}
            machineTypes={uniqueMachineTypes}
          />

          {/* Asset List Table */}
          <AssetListTable
            assets={assets}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
            onOpenQRCode={(asset) => setQrAsset(asset)}
          />
        </div>
      </main>

      {/* Register Asset Modal */}
      <AssetModalForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAsset}
      />

      {/* Asset Specifications Details Drawer */}
      <AssetDetailsDrawer
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onStatusChange={handleStatusChange}
      />

      {/* Printable QR Code Modal */}
      <QRCodeModal
        asset={qrAsset}
        onClose={() => setQrAsset(null)}
      />
    </div>
  );
}
