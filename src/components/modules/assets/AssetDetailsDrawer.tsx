'use client';

import React from 'react';
import { Asset, AssetStatus } from '@/types/asset';
import { X, QrCode, MapPin, Calendar, Wrench, AlertOctagon, FileText, CheckCircle2, ShieldAlert, Copy, Check } from 'lucide-react';

interface AssetDetailsDrawerProps {
  asset: Asset | null;
  onClose: () => void;
  onStatusChange: (assetId: string, newStatus: AssetStatus) => void;
}

export function AssetDetailsDrawer({ asset, onClose, onStatusChange }: AssetDetailsDrawerProps) {
  const [copied, setCopied] = React.useState(false);

  if (!asset) return null;

  const handleCopyQR = () => {
    navigator.clipboard.writeText(asset.qr_code || asset.asset_tag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white border-l border-slate-200 shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
          {/* Top Bar Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="inline-block font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-500/30">
                {asset.asset_tag}
              </span>
              <h2 className="text-base font-bold text-slate-900 leading-snug">{asset.name}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {asset.location}
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-stone-50 transition-all flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Status Control */}
          <div className="rounded-2xl border border-slate-200 bg-stone-50 p-4 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Operational Status</label>
            <div className="flex items-center gap-2">
              <select
                value={asset.status}
                onChange={(e) => onStatusChange(asset.id, e.target.value as AssetStatus)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
              >
                <option value="operational">Operational</option>
                <option value="standing">Standing (Downtime)</option>
                <option value="maintenance">Maintenance</option>
                <option value="decommissioned">Decommissioned</option>
              </select>

              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                asset.status === 'operational'
                  ? 'bg-amber-500/10 text-amber-800 border-amber-500/30'
                  : asset.status === 'standing'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-stone-200 text-slate-800 border-stone-300'
              }`}>
                {asset.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Technical Specifications</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-0.5">
                <span className="text-[10px] text-slate-400 font-semibold block">Machine Type</span>
                <span className="font-bold text-slate-800">{asset.machine_type}</span>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-0.5">
                <span className="text-[10px] text-slate-400 font-semibold block">Manufacturer</span>
                <span className="font-bold text-slate-800">{asset.manufacturer || 'HOMAG Group'}</span>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-0.5">
                <span className="text-[10px] text-slate-400 font-semibold block">Model</span>
                <span className="font-bold text-slate-800">{asset.model || 'N/A'}</span>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-0.5">
                <span className="text-[10px] text-slate-400 font-semibold block">Serial Number</span>
                <span className="font-mono font-bold text-slate-800">{asset.serial_number || 'N/A'}</span>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-0.5">
                <span className="text-[10px] text-slate-400 font-semibold block">Department</span>
                <span className="font-bold text-slate-800">{asset.department}</span>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-0.5">
                <span className="text-[10px] text-slate-400 font-semibold block">Criticality Rating</span>
                <span className="font-bold text-amber-800 capitalize">{asset.criticality}</span>
              </div>
            </div>
          </div>

          {/* QR Code Tag Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-amber-500" />
                Asset QR Code Identifier
              </span>

              <button
                onClick={handleCopyQR}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:underline"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-amber-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>

            <div className="flex items-center gap-4 bg-stone-50 border border-slate-200 p-3 rounded-xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white border border-slate-200 font-mono font-bold text-[10px] text-slate-800 shadow-xs text-center p-1">
                [QR TAG]
              </div>
              <div className="space-y-1 overflow-hidden">
                <p className="text-xs font-mono font-bold text-slate-900 truncate">{asset.qr_code}</p>
                <p className="text-[11px] text-slate-500">Scan at machine line to report breakdown or execute mobile checklists.</p>
              </div>
            </div>
          </div>

          {/* Asset Timeline Dates */}
          <div className="rounded-2xl border border-slate-200 p-4 bg-white space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Installation Date
              </span>
              <span className="font-semibold text-slate-800">{asset.installation_date || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Warranty Expiry
              </span>
              <span className="font-semibold text-slate-800">{asset.warranty_expiry || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
