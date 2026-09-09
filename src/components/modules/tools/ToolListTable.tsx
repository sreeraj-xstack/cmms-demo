'use client';

import React from 'react';
import { Tool, ToolCategory, ToolStatus } from '@/types/tool';
import { TOOL_CATEGORY_LABELS, TOOL_STATUS_CONFIG } from './ToolFilters';
import {
  MapPin,
  Clock,
  Layers,
  RotateCw,
  AlertTriangle,
  Building2,
  FileCheck,
  Zap,
  QrCode,
} from 'lucide-react';

interface ToolListTableProps {
  tools: Tool[];
  isLoading: boolean;
  onSelectTool: (tool: Tool) => void;
  onRecordUsage?: (tool: Tool) => void;
  onSendSharpening?: (tool: Tool) => void;
  onOpenQR?: (tool: Tool) => void;
}

export default function ToolListTable({
  tools,
  isLoading,
  onSelectTool,
  onRecordUsage,
  onSendSharpening,
  onOpenQR,
}: ToolListTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-3"></div>
        <p className="text-sm text-slate-500 font-medium">Loading industrial tools & telemetry...</p>
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">No Tools Found</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          No tool inventory items matched your search query or adapter code filter. Try clearing filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Tool Specs & Adapter</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Visual Status</th>
              <th className="py-3.5 px-4">Location / Machine</th>
              <th className="py-3.5 px-4">Sharpening Cycles</th>
              <th className="py-3.5 px-4">Cut Meters Progress</th>
              <th className="py-3.5 px-4">ERP PR Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {tools.map((tool) => {
              const statusCfg = TOOL_STATUS_CONFIG[tool.status as ToolStatus] || TOOL_STATUS_CONFIG.available;
              const StatusIcon = statusCfg.icon;

              const quantityAvailable = tool.quantity_available ?? 0;
              const minQuantity = tool.min_quantity ?? 1;
              const sharpeningCyclesCompleted = tool.sharpening_cycles_completed ?? 0;
              const maxSharpeningCycles = tool.max_sharpening_cycles ?? 5;
              const cuttingMeters = tool.cutting_meters ?? 0;
              const maxMetersPerCycle = tool.max_meters_per_cycle ?? 5000;

              const isLowStock = quantityAvailable <= minQuantity;
              const isMaxSharpened = sharpeningCyclesCompleted >= maxSharpeningCycles;
              const meterRatio = maxMetersPerCycle > 0
                ? (cuttingMeters / maxMetersPerCycle) * 100
                : 0;

              return (
                <tr
                  key={tool.id}
                  className="hover:bg-amber-50/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectTool(tool)}
                >
                  {/* Tool Specs & Adapter Tag */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col space-y-1">
                      <span className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors text-sm">
                        {tool.name}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {tool.tool_number}
                        </span>

                        {/* Adapter Code Tag (Requirement 9.02) */}
                        {tool.adapter_code && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5 text-amber-600" />
                            Collet: {tool.adapter_code}
                          </span>
                        )}

                        {tool.diameter_mm && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            Ø{tool.diameter_mm}mm
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {TOOL_CATEGORY_LABELS[tool.category as ToolCategory] || tool.category}
                    </span>
                  </td>

                  {/* Visual Status (Requirement 9.07) */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Location / Machine (Requirement 9.11) */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{tool.storage_location || 'Tool Crib'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {tool.compatible_machine_type || 'General Machinery'}
                      </span>
                    </div>
                  </td>

                  {/* Sharpening Cycles Telemetry (Requirement 9.04) */}
                  <td className="py-3.5 px-4 min-w-[130px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">
                          {sharpeningCyclesCompleted} / {maxSharpeningCycles} cycles
                        </span>
                        {isMaxSharpened && (
                          <span className="text-[10px] font-bold text-rose-600">Limit</span>
                        )}
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full ${
                            isMaxSharpened ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (sharpeningCyclesCompleted / maxSharpeningCycles) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Cut Meters Progress (Requirement 9.08) */}
                  <td className="py-3.5 px-4 min-w-[150px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-900">
                          {cuttingMeters.toLocaleString()}m
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Max: {maxMetersPerCycle.toLocaleString()}m
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full ${
                            meterRatio >= 100
                              ? 'bg-purple-600 animate-pulse'
                              : meterRatio >= 80
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, meterRatio)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* ERP PR Status (Requirement 9.03) */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {tool.erp_pr_number ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        <FileCheck className="w-3 h-3 text-amber-700" />
                        {tool.erp_pr_number}
                      </span>
                    ) : isLowStock || !tool.can_be_sharpened ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Reorder Pending
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Synced</span>
                    )}
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
