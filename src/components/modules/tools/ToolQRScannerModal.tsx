'use client';

import React, { useState } from 'react';
import { X, QrCode, Search, Layers, CheckCircle2 } from 'lucide-react';
import { Tool } from '@/types/tool';

import { parseQRPayload } from '@/lib/utils/qrUtils';

interface ToolQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: Tool[];
  onSelectTool: (tool: Tool) => void;
}

export default function ToolQRScannerModal({
  isOpen,
  onClose,
  tools,
  onSelectTool,
}: ToolQRScannerModalProps) {
  const [scanInput, setScanInput] = useState('');
  const [matchedTool, setMatchedTool] = useState<Tool | null>(null);
  const [notFound, setNotFound] = useState(false);

  if (!isOpen) return null;

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawInput = scanInput.trim();
    if (!rawInput) return;

    const parsed = parseQRPayload(rawInput);
    const targetCode = (parsed.code || parsed.adapter_code || rawInput).toLowerCase();

    const found = tools.find((t) => {
      if (parsed.id && t.id === parsed.id) return true;
      if (t.tool_number.toLowerCase() === targetCode) return true;
      if (t.adapter_code && t.adapter_code.toLowerCase() === targetCode) return true;
      if (t.serial_number && t.serial_number.toLowerCase() === targetCode) return true;
      if (t.qr_code && (t.qr_code.toLowerCase() === rawInput.toLowerCase() || t.qr_code.toLowerCase() === targetCode)) return true;
      return false;
    });

    if (found) {
      setMatchedTool(found);
      setNotFound(false);
    } else {
      setMatchedTool(null);
      setNotFound(true);
    }
  };

  const handleConfirmSelect = () => {
    if (matchedTool) {
      onSelectTool(matchedTool);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header (Clean Light Theme) */}
        <div className="bg-stone-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center text-amber-600 font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">QR / Barcode Tool Scanner</h3>
              <p className="text-xs text-slate-500">
                Scan Tool QR Code or enter Adapter Collet Code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-white transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanner Content */}
        <div className="p-6 space-y-5">
          {/* Simulated Scanner Viewport (Light Theme) */}
          <div className="relative bg-stone-50 rounded-xl p-8 text-center text-slate-900 border-2 border-dashed border-amber-500/50 overflow-hidden shadow-inner">
            <div className="w-16 h-16 border-2 border-amber-500 rounded-xl flex items-center justify-center mx-auto mb-2 bg-white shadow-2xs animate-pulse">
              <QrCode className="w-8 h-8 text-amber-600" />
            </div>
            <p className="text-xs font-bold text-amber-900">Camera Scanner Active</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Position tool QR tag or adapter collet barcode in frame
            </p>
          </div>

          {/* Form / Manual Entry */}
          <form onSubmit={handleScanSubmit} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Manual Barcode or Adapter Code Input
            </label>
            <div className="relative">
              <input
                type="text"
                value={scanInput}
                onChange={(e) => {
                  setScanInput(e.target.value);
                  setNotFound(false);
                }}
                placeholder="e.g. QR-TL-2026-1001 or ADP-5012"
                className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-600"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Scan Shortcuts */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Scan Examples
            </span>
            <div className="flex flex-wrap gap-2">
              {tools.slice(0, 3).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setScanInput(t.adapter_code || t.tool_number);
                    setMatchedTool(t);
                    setNotFound(false);
                  }}
                  className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1"
                >
                  <Layers className="w-3 h-3 text-amber-600" />
                  {t.adapter_code || t.tool_number}
                </button>
              ))}
            </div>
          </div>

          {/* Matched Result Preview */}
          {matchedTool && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Matched Tool Found!
                </span>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-white border border-emerald-200 text-emerald-800 rounded">
                  {matchedTool.tool_number}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900">{matchedTool.name}</p>
              <p className="text-[11px] text-slate-600">
                Location: {matchedTool.storage_location} • Machine: {matchedTool.compatible_machine_type}
              </p>
              <button
                type="button"
                onClick={handleConfirmSelect}
                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
              >
                Inspect Tool Specifications & Telemetry
              </button>
            </div>
          )}

          {notFound && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold text-center">
              No matching tool found for code &quot;{scanInput}&quot;. Please verify adapter barcode.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
