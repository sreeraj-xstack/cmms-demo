'use client';

import React from 'react';
import { Asset, AssetStatus, AssetCriticality } from '@/types/asset';
import { QrCode, Eye, MapPin, Tag, AlertTriangle, ShieldAlert } from 'lucide-react';

interface AssetListTableProps {
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  onOpenQRCode: (asset: Asset) => void;
}

export function AssetListTable({ assets, onSelectAsset, onOpenQRCode }: AssetListTableProps) {
  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Operational
          </span>
        );
      case 'standing':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            Standing (Downtime)
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800">
            <span className="h-1.5 w-1.5 rounded-full bg-stone-500" />
            Under Maintenance
          </span>
        );
      case 'decommissioned':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
            Decommissioned
          </span>
        );
    }
  };

  const getCriticalityBadge = (criticality: AssetCriticality) => {
    switch (criticality) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-400/40 px-2 py-0.5 rounded-md">
            <ShieldAlert className="h-3 w-3 text-amber-600" />
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800 bg-stone-100 border border-slate-200 px-2 py-0.5 rounded-md">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            High
          </span>
        );
      case 'medium':
        return (
          <span className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="text-[11px] font-normal text-slate-400 border border-slate-100 px-2 py-0.5 rounded-md">
            Low
          </span>
        );
    }
  };

  if (assets.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
        <Tag className="h-8 w-8 text-slate-300 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">No Assets Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No matching machinery assets found in the plant master database. Try adjusting your search query or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-stone-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Asset Tag & Name</th>
              <th className="py-3 px-4">Machine Type</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Criticality</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">QR & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {assets.map((asset) => (
              <tr
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className="hover:bg-amber-500/5 transition-colors cursor-pointer group"
              >
                {/* Asset Tag & Name */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <span className="inline-block font-mono text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-500/20">
                      {asset.asset_tag}
                    </span>
                    <p className="font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      {asset.name}
                    </p>
                    {asset.model && (
                      <p className="text-[11px] text-slate-400">Model: {asset.model}</p>
                    )}
                  </div>
                </td>

                {/* Machine Type */}
                <td className="py-3.5 px-4 text-slate-700 font-medium">
                  {asset.machine_type}
                </td>

                {/* Location */}
                <td className="py-3.5 px-4 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate max-w-[200px]">{asset.location}</span>
                  </div>
                </td>

                {/* Criticality */}
                <td className="py-3.5 px-4">{getCriticalityBadge(asset.criticality)}</td>

                {/* Status */}
                <td className="py-3.5 px-4">{getStatusBadge(asset.status)}</td>

                {/* QR Code & Action Drawer Button */}
                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onOpenQRCode(asset)}
                      title="View Asset QR Code Tag"
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-stone-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 transition-all"
                    >
                      <QrCode className="h-3.5 w-3.5 text-amber-600" />
                      <span>QR Tag</span>
                    </button>

                    <button
                      onClick={() => onSelectAsset(asset)}
                      title="View Full Specifications Drawer"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-700 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
