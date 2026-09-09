'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CostBreakdownItem } from '@/lib/services/dashboardService';
import { DollarSign, BarChart2, Layers, TrendingUp, PieChart as PieIcon, Eye } from 'lucide-react';

interface CostOverviewChartComponentProps {
  assetCostData: CostBreakdownItem[];
  trendCostData: CostBreakdownItem[];
}

export default function CostOverviewChartComponent({
  assetCostData,
  trendCostData,
}: CostOverviewChartComponentProps) {
  const [viewGroup, setViewGroup] = useState<'asset' | 'timeframe'>('asset');
  const [chartStyle, setChartStyle] = useState<'stacked' | 'clustered' | 'line' | 'pie'>('stacked');
  const [showOverlayTarget, setShowOverlayTarget] = useState<boolean>(true);

  const activeData = viewGroup === 'asset' ? assetCostData : trendCostData;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

  // Aggregate pie chart data if pie chart style is active
  const pieData = [
    { name: 'Technician Labor Worktime', value: activeData.reduce((acc, d) => acc + d.laborCost, 0), color: '#3b82f6' },
    { name: 'Spare Parts Consumed', value: activeData.reduce((acc, d) => acc + d.partsCost, 0), color: '#10b981' },
    { name: 'Tool Wear Expenses', value: activeData.reduce((acc, d) => acc + d.toolCost, 0), color: '#f59e0b' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-white space-y-1.5 z-50">
          <p className="font-bold text-amber-400">{d.periodOrAsset || d.name}</p>
          {d.laborCost !== undefined && (
            <div className="flex justify-between gap-4 text-slate-300">
              <span>Labor Worktime:</span>
              <span className="font-semibold text-blue-400">₹{d.laborCost.toLocaleString('en-IN')}</span>
            </div>
          )}
          {d.partsCost !== undefined && (
            <div className="flex justify-between gap-4 text-slate-300">
              <span>Spare Parts:</span>
              <span className="font-semibold text-emerald-400">₹{d.partsCost.toLocaleString('en-IN')}</span>
            </div>
          )}
          {d.toolCost !== undefined && (
            <div className="flex justify-between gap-4 text-slate-300">
              <span>Tool Wear:</span>
              <span className="font-semibold text-amber-400">₹{d.toolCost.toLocaleString('en-IN')}</span>
            </div>
          )}
          {d.totalCost !== undefined && (
            <div className="flex justify-between gap-4 border-t border-slate-800 pt-1 font-bold">
              <span>Total Cost:</span>
              <span className="text-white">₹{d.totalCost.toLocaleString('en-IN')}</span>
            </div>
          )}
          {d.comparisonTarget !== undefined && showOverlayTarget && (
            <div className="flex justify-between gap-4 text-slate-400 text-[11px]">
              <span>Target Baseline:</span>
              <span className="text-purple-300 font-semibold">₹{d.comparisonTarget.toLocaleString('en-IN')}</span>
            </div>
          )}
          {d.value !== undefined && (
            <div className="flex justify-between gap-4 font-bold">
              <span>Value:</span>
              <span>₹{d.value.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      {/* Top Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Maintenance Cost Overview & Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Labor worktime, spare parts & tool expense tracking
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Asset vs Timeframe toggle (Requirement 10.07) */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewGroup('asset')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewGroup === 'asset'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Asset Machinery
            </button>
            <button
              onClick={() => setViewGroup('timeframe')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewGroup === 'timeframe'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Timeframe (Daily Trend)
            </button>
          </div>

          {/* Overlapping graphics dataset overlay toggle (Requirement 10.09) */}
          <button
            onClick={() => setShowOverlayTarget(!showOverlayTarget)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              showOverlayTarget
                ? 'bg-purple-50 text-purple-900 border-purple-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-stone-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {showOverlayTarget ? 'Overlay Target Baseline ON' : 'Show Target Overlay'}
          </button>

          {/* Visualization Style Switcher (Requirement 10.12) */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-slate-200">
            <button
              title="Stacked Bars"
              onClick={() => setChartStyle('stacked')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                chartStyle === 'stacked' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              title="Clustered Bars"
              onClick={() => setChartStyle('clustered')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                chartStyle === 'clustered' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              title="Line Trend"
              onClick={() => setChartStyle('line')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                chartStyle === 'line' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              title="Donut / Pie Chart"
              onClick={() => setChartStyle('pie')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                chartStyle === 'pie' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              <PieIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartStyle === 'pie' ? (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          ) : chartStyle === 'line' ? (
            <LineChart data={activeData} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="periodOrAsset" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="laborCost" name="Labor Worktime Cost" stroke="#3b82f6" strokeWidth={3.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="partsCost" name="Spare Parts Consumed" stroke="#10b981" strokeWidth={3.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="toolCost" name="Tool Wear Expense" stroke="#f59e0b" strokeWidth={3.5} dot={{ r: 4 }} />
              {showOverlayTarget && (
                <Line type="monotone" dataKey="comparisonTarget" name="Target Budget Baseline" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              )}
            </LineChart>
          ) : (
            <BarChart data={activeData} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="periodOrAsset" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="laborCost" name="Labor Worktime Cost" stackId={chartStyle === 'stacked' ? 'a' : undefined} fill="#3b82f6" radius={chartStyle === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="partsCost" name="Spare Parts Consumed" stackId={chartStyle === 'stacked' ? 'a' : undefined} fill="#10b981" radius={chartStyle === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="toolCost" name="Tool Wear Expense" stackId={chartStyle === 'stacked' ? 'a' : undefined} fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* KPI Cost Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-medium">Labor Worktime Cost</span>
            <div className="text-sm font-bold text-blue-900 mt-0.5">
              ₹{activeData.reduce((acc, d) => acc + d.laborCost, 0).toLocaleString('en-IN')}
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
            ₹800/hr avg
          </span>
        </div>

        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-medium">Spare Parts Consumed</span>
            <div className="text-sm font-bold text-emerald-900 mt-0.5">
              ₹{activeData.reduce((acc, d) => acc + d.partsCost, 0).toLocaleString('en-IN')}
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Warehouse Store
          </span>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-medium">Tooling & Cutter Expenses</span>
            <div className="text-sm font-bold text-amber-900 mt-0.5">
              ₹{activeData.reduce((acc, d) => acc + d.toolCost, 0).toLocaleString('en-IN')}
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
            Crib & Sharpening
          </span>
        </div>
      </div>
    </div>
  );
}
