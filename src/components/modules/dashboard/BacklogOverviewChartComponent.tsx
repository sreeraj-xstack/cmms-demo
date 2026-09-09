'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BacklogItem } from '@/lib/services/dashboardService';
import { Clock, ShieldAlert, AlertTriangle, Layers, BarChart2 } from 'lucide-react';

interface BacklogOverviewChartComponentProps {
  technicianBacklog: BacklogItem[];
  assetBacklog: BacklogItem[];
}

export default function BacklogOverviewChartComponent({
  technicianBacklog,
  assetBacklog,
}: BacklogOverviewChartComponentProps) {
  const [groupBy, setGroupBy] = useState<'technician' | 'asset'>('technician');
  const [stacked, setStacked] = useState<boolean>(true);

  const activeData = groupBy === 'technician' ? technicianBacklog : assetBacklog;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-white space-y-1.5 z-50">
          <p className="font-bold text-amber-400">{d.label}</p>
          <div className="flex justify-between gap-4 text-slate-300">
            <span className="text-rose-400 font-semibold">Critical Priority:</span>
            <span className="font-bold text-rose-400">{d.criticalCount} work orders</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span className="text-amber-400 font-semibold">High Priority:</span>
            <span className="font-bold text-amber-400">{d.highCount} work orders</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span className="text-blue-400 font-semibold">Medium Priority:</span>
            <span className="font-bold text-blue-400">{d.mediumCount} work orders</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span className="text-slate-400 font-semibold">Low Priority:</span>
            <span className="font-bold text-slate-300">{d.lowCount} work orders</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-800 pt-1 font-bold">
            <span className="text-amber-500">Accumulated Backlog Hours:</span>
            <span className="text-amber-300">{d.totalHours} hrs</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalCritical = activeData.reduce((acc, d) => acc + d.criticalCount, 0);
  const totalHigh = activeData.reduce((acc, d) => acc + d.highCount, 0);
  const totalHours = activeData.reduce((acc, d) => acc + d.totalHours, 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Maintenance Backlog & Workload Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Backlog breakdown by technician, machine asset & priority severity
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Group By Toggle */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setGroupBy('technician')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                groupBy === 'technician'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Technician Workload
            </button>
            <button
              onClick={() => setGroupBy('asset')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                groupBy === 'asset'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Machine Asset
            </button>
          </div>

          {/* Stacked vs Clustered Toggle */}
          <button
            onClick={() => setStacked(!stacked)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-stone-50 transition-all"
          >
            {stacked ? <Layers className="w-3.5 h-3.5" /> : <BarChart2 className="w-3.5 h-3.5" />}
            {stacked ? 'Stacked View' : 'Clustered View'}
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activeData} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: 'Pending Tickets', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 10 } }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />

            <Bar dataKey="criticalCount" name="Critical Priority" stackId={stacked ? 'b' : undefined} fill="#f43f5e" radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]} barSize={26} />
            <Bar dataKey="highCount" name="High Priority" stackId={stacked ? 'b' : undefined} fill="#f59e0b" radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]} barSize={26} />
            <Bar dataKey="mediumCount" name="Medium Priority" stackId={stacked ? 'b' : undefined} fill="#3b82f6" radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]} barSize={26} />
            <Bar dataKey="lowCount" name="Low Priority" stackId={stacked ? 'b' : undefined} fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Backlog Summary Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <div>
              <span className="font-semibold text-rose-950">Critical Urgent Backlog</span>
              <p className="text-[11px] text-rose-700">{totalCritical} emergency work orders</p>
            </div>
          </div>
          <span className="font-bold text-rose-900 text-sm">{totalCritical}</span>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <div>
              <span className="font-semibold text-amber-950">High Priority Pending</span>
              <p className="text-[11px] text-amber-700">{totalHigh} scheduled jobs</p>
            </div>
          </div>
          <span className="font-bold text-amber-900 text-sm">{totalHigh}</span>
        </div>

        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="font-semibold text-indigo-950">Total Backlog Accumulation</span>
              <p className="text-[11px] text-indigo-700">Estimated repair labor</p>
            </div>
          </div>
          <span className="font-bold text-indigo-900 text-sm">{totalHours} hrs</span>
        </div>
      </div>
    </div>
  );
}
