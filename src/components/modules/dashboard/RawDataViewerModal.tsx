'use client';

import React, { useState } from 'react';
import { RawCalculationRecord } from '@/lib/services/dashboardService';
import { X, Table, Search, Download, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';

interface RawDataViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawRecords: RawCalculationRecord[];
}

export default function RawDataViewerModal({
  isOpen,
  onClose,
  rawRecords,
}: RawDataViewerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = rawRecords.filter(
    (r) =>
      r.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportRawCSV = () => {
    const headers = ['Ticket Number', 'Asset Name', 'Category', 'Technician', 'Date', 'Day of Week', 'Status', 'Downtime (Hrs)', 'Labor Cost (INR)', 'Parts Cost (INR)', 'Total Cost (INR)', 'Outlier Flag'];
    const rows = filtered.map((r) => [
      r.ticketNumber,
      `"${r.assetName}"`,
      `"${r.category}"`,
      `"${r.technician}"`,
      r.createdDate,
      r.dayOfWeek,
      r.status,
      r.downtimeHours,
      r.laborCost,
      r.partsCost,
      r.totalCost,
      r.isOutlier ? 'YES' : 'NO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Raw_Calculation_Data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl shadow-xs font-bold">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Visualisation of Raw Data Matrix</h2>
              <p className="text-xs text-slate-500">
                Inspect granular transaction rows feeding MTTR, MTBF, labor costs & backlog KPIs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportRawCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-stone-100 text-xs font-bold text-slate-700 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Export Raw CSV
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ticket #, asset, technician or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Showing {filtered.length} of {rawRecords.length} raw data records
          </span>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3">Ticket #</th>
                <th className="py-3 px-3">Asset Equipment</th>
                <th className="py-3 px-3">Issue Category</th>
                <th className="py-3 px-3">Technician</th>
                <th className="py-3 px-3">Day / Date</th>
                <th className="py-3 px-3 text-right">Downtime (Hrs)</th>
                <th className="py-3 px-3 text-right">Labor Cost (₹)</th>
                <th className="py-3 px-3 text-right">Parts Cost (₹)</th>
                <th className="py-3 px-3 text-right">Total Cost (₹)</th>
                <th className="py-3 px-3 text-center">Outlier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{r.ticketNumber}</td>
                  <td className="py-3 px-3 text-slate-800 font-semibold">{r.assetName}</td>
                  <td className="py-3 px-3 text-slate-600">{r.category}</td>
                  <td className="py-3 px-3 text-slate-700">{r.technician}</td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {r.dayOfWeek}, {r.createdDate}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{r.downtimeHours}h</td>
                  <td className="py-3 px-3 text-right text-blue-700 font-semibold">₹{r.laborCost.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right text-emerald-700 font-semibold">₹{r.partsCost.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right text-slate-950 font-bold">₹{r.totalCost.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-center">
                    {r.isOutlier ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <AlertOctagon className="w-3 h-3" /> Outlier
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-stone-50 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Raw data is used in real-time formula calculations for MTTR, MTBF, and Cost Allocations.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
