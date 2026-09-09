'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Building2,
  RotateCw,
  Zap,
  FileCheck,
  QrCode,
  Layers,
  CheckCircle2,
  AlertTriangle,
  History,
  Info,
  DollarSign,
  Wrench,
} from 'lucide-react';
import { Tool, ToolSharpeningLog, ToolStatus } from '@/types/tool';
import { TOOL_CATEGORY_LABELS, TOOL_STATUS_CONFIG } from './ToolFilters';
import {
  recordToolUsage,
  updateToolStatus,
  triggerToolERPRequisition,
  fetchToolSharpeningLogs,
} from '@/lib/services/toolService';
import { QRCodeSVG } from '@/components/common/QRCodeSVG';
import { generateQRPayload, parseQRPayload } from '@/lib/utils/qrUtils';

interface ToolDetailsDrawerProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
  onToolUpdated: () => void;
}

export default function ToolDetailsDrawer({
  tool,
  isOpen,
  onClose,
  onToolUpdated,
}: ToolDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'specs' | 'usage' | 'sharpening' | 'erp' | 'history'>('specs');
  const [logs, setLogs] = useState<ToolSharpeningLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Usage Telemetry Logger State
  const [metersToAdd, setMetersToAdd] = useState<number>(500);
  const [hoursToAdd, setHoursToAdd] = useState<number>(10);
  const [operatorName, setOperatorName] = useState<string>('Machinist Lead');
  const [isLoggingUsage, setIsLoggingUsage] = useState(false);
  const [usageSuccessMsg, setUsageSuccessMsg] = useState<string | null>(null);

  // Sharpening Action State
  const [grindingVendor, setGrindingVendor] = useState<string>('Leitz Grinding Workshop');
  const [sharpeningNotes, setSharpeningNotes] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // ERP State
  const [isTriggeringERP, setIsTriggeringERP] = useState(false);

  useEffect(() => {
    if (tool && isOpen) {
      loadLogs();
      setUsageSuccessMsg(null);
    }
  }, [tool, isOpen]);

  const loadLogs = async () => {
    if (!tool) return;
    try {
      setIsLoadingLogs(true);
      const data = await fetchToolSharpeningLogs(tool.id);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  if (!isOpen || !tool) return null;

  const statusCfg = TOOL_STATUS_CONFIG[tool.status as ToolStatus] || TOOL_STATUS_CONFIG.available;
  const StatusIcon = statusCfg.icon;

  const sharpeningCyclesCompleted = tool.sharpening_cycles_completed ?? 0;
  const maxSharpeningCycles = tool.max_sharpening_cycles ?? 5;
  const cuttingMeters = tool.cutting_meters ?? 0;
  const maxMetersPerCycle = tool.max_meters_per_cycle ?? 5000;
  const runningHours = tool.running_hours ?? 0;

  const isMaxSharpened = sharpeningCyclesCompleted >= maxSharpeningCycles;
  const isDullMeters = cuttingMeters >= maxMetersPerCycle;

  const handleRecordUsageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (metersToAdd <= 0) return;

    try {
      setIsLoggingUsage(true);
      const updated = await recordToolUsage(tool.id, metersToAdd, hoursToAdd, operatorName);
      setUsageSuccessMsg(
        updated?.status === 'dull'
          ? `Logged +${metersToAdd}m! Threshold exceeded: Tool status automatically updated to 'Dull'.`
          : `Logged +${metersToAdd}m cut telemetry successfully!`
      );
      onToolUpdated();
      loadLogs();
      setTimeout(() => setUsageSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Error recording usage:', err);
    } finally {
      setIsLoggingUsage(false);
    }
  };

  const handleSendToGrinding = async () => {
    try {
      setIsUpdatingStatus(true);
      await updateToolStatus(
        tool.id,
        'out_for_sharpening',
        `Dispatched to ${grindingVendor}. Notes: ${sharpeningNotes}`
      );
      onToolUpdated();
      loadLogs();
      setActiveTab('specs');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReceiveFromGrinding = async () => {
    try {
      setIsUpdatingStatus(true);
      await updateToolStatus(
        tool.id,
        'available',
        `Received back from grinding. Sharpening cycle completed. Cut meters reset.`
      );
      onToolUpdated();
      loadLogs();
      setActiveTab('specs');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleScrapTool = async () => {
    if (!confirm('Mark this tool as permanently broken / scrapped? This action is irreversible.')) return;
    try {
      setIsUpdatingStatus(true);
      await updateToolStatus(tool.id, 'broken_scrapped', 'Tool damaged / exhausted sharpening limit.');
      onToolUpdated();
      loadLogs();
      setActiveTab('specs');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleTriggerERP = async () => {
    try {
      setIsTriggeringERP(true);
      await triggerToolERPRequisition(tool.id);
      onToolUpdated();
      loadLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTriggeringERP(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header (Clean Light Stone Theme) */}
        <div className="bg-stone-50 border-b border-slate-200 p-6 flex items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                {tool.tool_number}
              </span>

              {/* Adapter Tag (Requirement 9.02) */}
              {tool.adapter_code && (
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-600" />
                  Adapter: {tool.adapter_code}
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.bg} ${statusCfg.text}`}
              >
                <StatusIcon className="w-3 h-3" /> {statusCfg.label}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 leading-snug">{tool.name}</h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600" /> Location: {tool.storage_location} • Machine: {tool.compatible_machine_type}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-white transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-xs font-bold border-b-2 px-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'specs'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Info className="w-3.5 h-3.5" /> Technical Specs
          </button>

          <button
            onClick={() => setActiveTab('usage')}
            className={`pb-3 text-xs font-bold border-b-2 px-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'usage'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Cut Telemetry
          </button>

          <button
            onClick={() => setActiveTab('sharpening')}
            className={`pb-3 text-xs font-bold border-b-2 px-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'sharpening'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" /> Sharpening
          </button>

          <button
            onClick={() => setActiveTab('erp')}
            className={`pb-3 text-xs font-bold border-b-2 px-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'erp'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" /> ERP Orders
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs font-bold border-b-2 px-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Audit Log
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Technical Specs */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              {/* Telemetry Progress Overview */}
              <div className="grid grid-cols-2 gap-4">
                {/* Sharpening Cycles Meter */}
                <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                    Sharpening Cycles Completed
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    {sharpeningCyclesCompleted} / {maxSharpeningCycles}
                  </div>
                  <span className="text-[10px] text-amber-800 font-semibold block mt-0.5">
                    {isMaxSharpened ? '⚠️ Max limit reached (Scrapped)' : `${maxSharpeningCycles - sharpeningCyclesCompleted} cycles remaining`}
                  </span>
                </div>

                {/* Cut Meters Gauge */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Cumulative Cut Meters
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    {cuttingMeters.toLocaleString()}m
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                    Max/Cycle: {maxMetersPerCycle.toLocaleString()}m
                  </span>
                </div>
              </div>

              {/* Physical Specifications Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Diameter</span>
                  <span className="text-xs font-bold text-slate-900">{tool.diameter_mm ? `Ø${tool.diameter_mm} mm` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Length</span>
                  <span className="text-xs font-bold text-slate-900">{tool.length_mm ? `${tool.length_mm} mm` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Bore</span>
                  <span className="text-xs font-bold text-slate-900">{tool.bore_mm ? `Ø${tool.bore_mm} mm` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Teeth / Flutes</span>
                  <span className="text-xs font-bold text-slate-900">{tool.teeth_count ? `${tool.teeth_count} Z` : 'N/A'}</span>
                </div>
              </div>

              {/* Stock & Supplier Specs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Available Stock & Min Threshold
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">
                    {tool.quantity_available ?? 0} Pcs Available (Min: {tool.min_quantity ?? 1})
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Supplier & Lead Time
                  </span>
                  <span className="text-xs font-bold text-slate-800 block">
                    {tool.vendor_name || 'Leitz Tooling India'} ({tool.lead_time_days ?? 7} days lead)
                  </span>
                </div>
              </div>

              {/* QR Tag (Requirement 9.06 & 9.02 - Clean Light Theme) */}
              <div className="p-4 bg-stone-50 border border-slate-200 text-slate-900 rounded-xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-amber-600" />
                    <div>
                      <span className="text-xs font-bold block text-slate-900">Tool & Adapter QR Identification Tag</span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">{tool.tool_number}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = parseQRPayload(tool.qr_code || '');
                      const payloadStr = parsed.isStructured
                        ? tool.qr_code!
                        : generateQRPayload('tool', {
                            id: tool.id,
                            tool_number: tool.tool_number,
                            name: tool.name,
                            storage_location: tool.storage_location,
                            category: tool.category,
                            adapter_code: tool.adapter_code || undefined,
                          });
                      navigator.clipboard.writeText(payloadStr);
                      alert(`Copied QR Payload URL for ${tool.tool_number} to clipboard!`);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-colors shadow-2xs"
                  >
                    Copy QR Link
                  </button>
                </div>

                <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <QRCodeSVG
                    value={
                      parseQRPayload(tool.qr_code || '').isStructured
                        ? tool.qr_code!
                        : generateQRPayload('tool', {
                            id: tool.id,
                            tool_number: tool.tool_number,
                            name: tool.name,
                            storage_location: tool.storage_location,
                            category: tool.category,
                            adapter_code: tool.adapter_code || undefined,
                          })
                    }
                    size={88}
                    className="shrink-0"
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-slate-900">{tool.tool_number}</p>
                    {tool.adapter_code && (
                      <p className="text-[11px] font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 inline-block">
                        Collet Adapter: {tool.adapter_code}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500">
                      Adapter collet code mapping allows shop-floor scanning when tool etchings are obscured inside holders.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Cut Telemetry Logger (Requirement 9.08) */}
          {activeTab === 'usage' && (
            <form onSubmit={handleRecordUsageSubmit} className="space-y-4">
              {usageSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{usageSuccessMsg}</span>
                </div>
              )}

              {isDullMeters && (
                <div className="p-3.5 bg-purple-50 border border-purple-200 text-purple-900 text-xs rounded-xl flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Threshold Exceeded ({cuttingMeters}m / {maxMetersPerCycle}m). Tool is dull and requires sharpening!</span>
                </div>
              )}

              <div className="bg-stone-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Current Usage: {cuttingMeters.toLocaleString()} meters cut • {runningHours} running hours
                </span>
                <p className="text-[11px] text-slate-500">
                  Log machine cut telemetry after production batches to maintain tool life accuracy.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Meters Cut (+Meters)
                </label>
                <input
                  type="number"
                  min={1}
                  step={50}
                  value={metersToAdd}
                  onChange={(e) => setMetersToAdd(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Running Hours (+Hours)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={hoursToAdd}
                  onChange={(e) => setHoursToAdd(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Logged By (Machinist / Operator)
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingUsage}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                {isLoggingUsage ? 'Updating Telemetry...' : 'Log Cut Telemetry'}
              </button>
            </form>
          )}

          {/* TAB 3: Sharpening Lifecycle (Requirement 9.04) */}
          {activeTab === 'sharpening' && (
            <div className="space-y-5">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <h4 className="text-xs font-bold text-amber-950">Sharpening Lifecycle Status</h4>
                <p className="text-xs text-amber-800">
                  Completed {tool.sharpening_cycles_completed} of {tool.max_sharpening_cycles} maximum allowed grinding cycles.
                </p>
              </div>

              {tool.status === 'out_for_sharpening' ? (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-teal-950 block">
                    Tool is currently with vendor for precision regrinding.
                  </span>
                  <button
                    type="button"
                    onClick={handleReceiveFromGrinding}
                    disabled={isUpdatingStatus}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Receive Sharpened Tool & Reset Meters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Grinding Vendor Name
                    </label>
                    <input
                      type="text"
                      value={grindingVendor}
                      onChange={(e) => setGrindingVendor(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dispatch Notes
                    </label>
                    <textarea
                      rows={2}
                      value={sharpeningNotes}
                      onChange={(e) => setSharpeningNotes(e.target.value)}
                      placeholder="e.g. Dispatched for 0.2mm edge regrinding & carbide tip inspection"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-900 resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendToGrinding}
                    disabled={isUpdatingStatus || !tool.can_be_sharpened}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCw className="w-4 h-4" /> Send Tool Out for Sharpening
                  </button>

                  <div className="pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleScrapTool}
                      disabled={isUpdatingStatus}
                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all"
                    >
                      Mark Tool as Damaged / Scrapped
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ERP Orders (Requirement 9.03) */}
          {activeTab === 'erp' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 border border-slate-200 rounded-xl space-y-1">
                <h4 className="text-xs font-bold text-slate-900">ERP Connectivity & Reorder Sync</h4>
                <p className="text-xs text-slate-600">
                  Automated Purchase Requisitions triggered when stock drops below threshold or tool is scrapped.
                </p>
              </div>

              {tool.erp_pr_number ? (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950">Active ERP Requisition</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded">
                      {tool.erp_pr_number}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Purchase order requisition generated automatically. Status: <strong>{tool.erp_sync_status}</strong>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    No active ERP PR generated for this SKU yet.
                  </p>
                  <button
                    type="button"
                    onClick={handleTriggerERP}
                    disabled={isTriggeringERP}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4 text-amber-400" />
                    {isTriggeringERP ? 'Triggering ERP...' : 'Trigger ERP Purchase Requisition'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Audit Log Trail */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Sharpening & Telemetry History Log
              </h4>

              {isLoadingLogs ? (
                <p className="text-xs text-slate-500">Loading audit history...</p>
              ) : logs.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No movement or sharpening logs recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((l) => (
                    <div
                      key={l.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 capitalize">
                          {l.event_type.replace('_', ' ')}
                        </span>
                        <p className="text-slate-600 mt-1">{l.notes || 'Routine log'}</p>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          By {l.performed_by} • {new Date(l.created_at).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-700">
                        {l.running_meters_at_event}m
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
