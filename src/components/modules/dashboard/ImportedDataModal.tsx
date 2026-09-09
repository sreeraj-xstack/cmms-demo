'use client';

import React, { useState } from 'react';
import { X, Database, Upload, CheckCircle2, FileText, Sparkles } from 'lucide-react';

interface ImportedDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  isImportedActive: boolean;
  onToggleImportedMode: (active: boolean) => void;
}

export default function ImportedDataModal({
  isOpen,
  onClose,
  isImportedActive,
  onToggleImportedMode,
}: ImportedDataModalProps) {
  const [importedFileName, setImportedFileName] = useState<string | null>(
    isImportedActive ? 'Benchmark_Factory_Metrics_2026.csv' : null
  );

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportedFileName(e.target.files[0].name);
      onToggleImportedMode(true);
    }
  };

  const handleLoadSampleBenchmark = () => {
    setImportedFileName('Plant_A_Benchmark_Target_Data_Q3.csv');
    onToggleImportedMode(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Use Imported Data & Custom Calculations</h2>
              <p className="text-xs text-slate-500">Load external datasets to calculate custom KPIs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Engine Status */}
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between transition-all ${
            isImportedActive
              ? 'bg-purple-50/80 border-purple-200 text-purple-950'
              : 'bg-stone-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3 h-3 rounded-full ${
                isImportedActive ? 'bg-purple-600 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <div>
              <span className="font-bold">
                {isImportedActive ? 'Imported Benchmark Engine Active' : 'Live Supabase Engine Active'}
              </span>
              <p className="text-[11px] text-slate-500">
                {isImportedActive
                  ? `Active File: ${importedFileName}`
                  : 'Dashboard calculations are reading directly from production DB tables.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onToggleImportedMode(!isImportedActive)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              isImportedActive
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isImportedActive ? 'Switch to Live DB' : 'Enable Imported Mode'}
          </button>
        </div>

        {/* Upload Custom CSV File */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">Upload External CSV / Excel Dataset</label>
          <div className="border-2 border-dashed border-slate-200 hover:border-purple-400 bg-stone-50/60 p-6 rounded-2xl text-center space-y-2 transition-all cursor-pointer relative">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-800">Drop your CSV file here or click to browse</p>
            <p className="text-[11px] text-slate-400">Supports breakdown tickets, work orders, tool wear & cost data (.csv, .xlsx)</p>
          </div>
        </div>

        {/* Preset Benchmark Dataset */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Or Load Industry Standard Benchmark Dataset
          </span>
          <button
            onClick={handleLoadSampleBenchmark}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-xs font-bold text-purple-950 transition-all text-left"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <div>
                <span>Load Q3 Benchmark Target Dataset</span>
                <p className="text-[11px] font-normal text-purple-700">Pre-configured German Industry 4.0 CMMS benchmarks</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-[10px]">Load Dataset</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
