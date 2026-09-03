'use client';

import React, { useState } from 'react';
import { MachineManual } from '@/types/solutionLibrary';
import { uploadMachineManual } from '@/lib/services/solutionLibraryService';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Upload, FileText, ExternalLink, Plus } from 'lucide-react';

interface MachineManualsSectionProps {
  manuals: MachineManual[];
  onManualUploaded: () => Promise<void>;
}

export function MachineManualsSection({ manuals, onManualUploaded }: MachineManualsSectionProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [machineType, setMachineType] = useState('CNC Processing Center');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const uploaderName = user?.full_name || user?.email?.split('@')[0] || 'Plant Engineer';
    await uploadMachineManual(selectedFile, title, machineType, uploaderName);
    
    setTitle('');
    setSelectedFile(null);
    setUploading(false);
    await onManualUploaded();
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Upload Form Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-amber-500" />
              Upload OEM Machine Manual or Schematic PDF
            </h3>
            <p className="text-[11px] text-slate-500">
              Technical operating manuals ingested into AI Knowledge Assistant for torque & electrical reference
            </p>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Manual Document Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. HOMAG Centateq P-110 Maintenance Manual"
                required
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Machine Type *</label>
              <select
                value={machineType}
                onChange={(e) => setMachineType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="CNC Processing Center">CNC Processing Center</option>
                <option value="Edgebander">Edgebander</option>
                <option value="Panel Saw">Panel Saw</option>
                <option value="Dust Extraction System">Dust Extraction System</option>
                <option value="Laminating Press">Laminating Press</option>
                <option value="Sanding Machine">Sanding Machine</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              required
              className="hidden"
              id="manual-pdf-input"
            />
            <label
              htmlFor="manual-pdf-input"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-stone-50 hover:bg-stone-100 px-3.5 py-2 font-bold text-slate-700 cursor-pointer shadow-xs transition-all"
            >
              <FileText className="h-4 w-4 text-amber-600" />
              <span>{selectedFile ? selectedFile.name : 'Select PDF Manual File'}</span>
            </label>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 shadow-xs transition-all disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {uploading ? 'Uploading PDF...' : 'Upload Manual to Vault'}
            </button>
          </div>
        </form>
      </div>

      {/* Manuals List Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-slate-400" />
          Ingested Machine Manuals ({manuals.length})
        </h3>

        {manuals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {manuals.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                      {m.manual_number}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{m.title}</h4>
                  <p className="text-[11px] text-slate-500">Machine Type: {m.machine_type}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">By: {m.uploaded_by_name}</span>
                  <a
                    href={m.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-bold text-[11px] text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl transition-all"
                  >
                    <span>View PDF</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-[11px] italic">No OEM machine manuals uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
