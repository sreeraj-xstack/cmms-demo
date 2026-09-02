'use client';

import React, { useState } from 'react';
import { CreateAssetInput, AssetStatus, AssetCriticality } from '@/types/asset';
import { X, Plus } from 'lucide-react';

interface AssetModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAssetInput) => Promise<void>;
}

export function AssetModalForm({ isOpen, onClose, onSubmit }: AssetModalFormProps) {
  const [formData, setFormData] = useState<CreateAssetInput>({
    asset_tag: `AST-XSTACK-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    machine_type: 'CNC Processing Center',
    model: '',
    serial_number: '',
    manufacturer: 'HOMAG Group',
    location: 'Factory Floor A - Panel Line 1',
    department: 'Woodworking Production',
    status: 'operational',
    criticality: 'high',
    qr_code: '',
    installation_date: new Date().toISOString().split('T')[0],
    warranty_expiry: '',
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const finalTag = formData.asset_tag.trim() || `AST-XSTACK-${Date.now().toString().slice(-4)}`;
    
    await onSubmit({
      ...formData,
      asset_tag: finalTag,
      qr_code: `XSTACK-${finalTag}`,
      installation_date: formData.installation_date || '',
      warranty_expiry: formData.warranty_expiry || '',
    });
    
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add New Machinery Asset</h2>
            <p className="text-xs text-slate-500">Register an asset into Plant Master Catalog</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-stone-50 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Asset Tag & Machine Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Asset Tag Number *
              </label>
              <input
                type="text"
                value={formData.asset_tag}
                onChange={(e) => setFormData({ ...formData, asset_tag: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Machine Type Category *</label>
              <select
                value={formData.machine_type}
                onChange={(e) => setFormData({ ...formData, machine_type: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="CNC Processing Center">CNC Processing Center</option>
                <option value="Edgebander">Edgebander</option>
                <option value="Panel Saw">Panel Saw</option>
                <option value="Dust Extraction System">Dust Extraction System</option>
                <option value="Laminating Press">Laminating Press</option>
                <option value="Sanding Machine">Sanding Machine</option>
                <option value="Boiler & Utility System">Boiler & Utility System</option>
              </select>
            </div>
          </div>

          {/* Row 2: Asset Name */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Asset Name & Title *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Homag Centateq P-110 CNC Processing Center"
              required
              className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Row 3: Model & Serial Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Model Name / Number</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. Centateq P-110"
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Manufacturer Serial Number</label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                placeholder="e.g. SN-2024-HMG-8841"
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Row 4: Location & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Plant Location & Bay *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Factory Floor A - Panel Line 1"
                required
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Woodworking Production"
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Row 5: Status & Criticality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="operational">Operational</option>
                <option value="standing">Standing (Downtime)</option>
                <option value="maintenance">Maintenance</option>
                <option value="decommissioned">Decommissioned</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Operational Criticality</label>
              <select
                value={formData.criticality}
                onChange={(e) => setFormData({ ...formData, criticality: e.target.value as AssetCriticality })}
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="critical">Critical (Single Point of Failure)</option>
                <option value="high">High Impact</option>
                <option value="medium">Medium Impact</option>
                <option value="low">Low Impact</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-stone-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-xs transition-all disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {loading ? 'Registering Asset...' : 'Register Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
