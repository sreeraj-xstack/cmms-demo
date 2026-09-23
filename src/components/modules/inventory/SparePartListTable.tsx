'use client';

import React from 'react';
import { SparePart, SparePartCategory } from '@/types/sparePart';
import { CATEGORY_LABELS } from './SparePartFilters';
import {
  MapPin,
  Clock,
  AlertTriangle,
  Layers,
  PackageCheck,
  PackageX,
} from 'lucide-react';

interface SparePartListTableProps {
  parts: SparePart[];
  isLoading: boolean;
  onSelectPart: (part: SparePart) => void;
  onAdjustStock?: (part: SparePart) => void;
}

export default function SparePartListTable({
  parts,
  isLoading,
  onSelectPart,
  onAdjustStock,
}: SparePartListTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-3"></div>
        <p className="text-sm text-slate-500 font-medium">Loading inventory spare parts...</p>
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">No Spare Parts Found</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          No inventory items matched your selected filters. Try clearing your search query or selecting a different category.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden min-w-0 w-full max-w-full">
      {/* Mobile/Tablet Card View (< lg) */}
      <div className="lg:hidden divide-y divide-slate-100">
        {parts.map((part) => {
          const isOutOfStock = part.quantity_available <= 0;
          const isLowStock = !isOutOfStock && part.quantity_available <= part.min_quantity;
          const ratio = part.min_quantity > 0 ? (part.quantity_available / part.min_quantity) * 100 : 100;

          return (
            <div
              key={part.id}
              onClick={() => onSelectPart(part)}
              className="p-4 space-y-3 hover:bg-stone-50/80 active:bg-amber-50/40 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {part.part_number}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {part.name}
                  </h4>
                  {part.vendor_name && (
                    <p className="text-[11px] text-slate-400">Vendor: {part.vendor_name}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  {isOutOfStock ? (
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Low Stock
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      In Stock
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-900">
                    ₹{(part.unit_cost || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Stock Progress Bar */}
              <div className="space-y-1 bg-stone-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    Available: {part.quantity_available} {part.unit_of_measure}
                  </span>
                  <span className="text-[11px] text-slate-500">Min: {part.min_quantity}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(ratio, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-medium bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                  <MapPin className="w-3 h-3 text-amber-500" /> {part.storage_location}
                </span>
                <span className="text-[11px] text-slate-500">
                  Lead time: {part.lead_time_days} days
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (>= lg) */}
      <div className="hidden lg:block overflow-x-auto min-w-0 max-w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Part Info & Code</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Storage Location</th>
              <th className="py-3.5 px-4">Machine Compatibility</th>
              <th className="py-3.5 px-4">Lead Time</th>
              <th className="py-3.5 px-4">Stock Level</th>
              <th className="py-3.5 px-4 text-right">Unit Cost (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {parts.map((part) => {
              const isOutOfStock = part.quantity_available <= 0;
              const isLowStock = !isOutOfStock && part.quantity_available <= part.min_quantity;
              const ratio = part.min_quantity > 0 ? (part.quantity_available / part.min_quantity) * 100 : 100;

              return (
                <tr
                  key={part.id}
                  className="hover:bg-amber-50/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectPart(part)}
                >
                  {/* Part Info & Code */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {part.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {part.part_number}
                        </span>
                        {part.vendor_name && (
                          <span className="text-xs text-slate-500 truncate max-w-[140px]">
                            • {part.vendor_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {CATEGORY_LABELS[part.category as SparePartCategory] || part.category}
                    </span>
                  </td>

                  {/* Storage Location */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="font-medium text-xs bg-stone-50 border border-stone-200 px-2 py-0.5 rounded text-stone-800">
                        {part.storage_location}
                      </span>
                    </div>
                  </td>

                  {/* Machine Compatibility */}
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-slate-600 line-clamp-1">
                      {part.compatible_machine_type}
                    </span>
                  </td>

                  {/* Lead Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{part.lead_time_days} days</span>
                    </div>
                  </td>

                  {/* Stock Level with Progress Bar */}
                  <td className="py-3.5 px-4 min-w-[160px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">
                          {part.quantity_available} {part.unit_of_measure}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Min: {part.min_quantity}
                        </span>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/80">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOutOfStock
                              ? 'bg-rose-500'
                              : isLowStock
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, ratio)}%` }}
                        />
                      </div>

                      {/* Status pill badge */}
                      <div>
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                            <PackageX className="w-3 h-3" /> Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> Reorder Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <PackageCheck className="w-3 h-3" /> In Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Unit Cost & Stock Value */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-slate-900">
                        ₹{part.unit_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Total: ₹{(part.unit_cost * part.quantity_available).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
