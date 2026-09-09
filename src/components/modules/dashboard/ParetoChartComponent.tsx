'use client';

import React, { useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ParetoItem } from '@/lib/services/dashboardService';
import { Layers, Percent, DollarSign, Wrench } from 'lucide-react';

interface ParetoChartComponentProps {
  data: ParetoItem[];
}

export default function ParetoChartComponent({ data }: ParetoChartComponentProps) {
  const [metric, setMetric] = useState<'cost' | 'frequency'>('cost');

  const formattedData = data.map((item) => ({
    ...item,
    displayName: item.name.length > 18 ? item.name.substring(0, 16) + '...' : item.name,
    displayValue: metric === 'cost' ? item.cost : item.frequency,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const row = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-white space-y-1.5 z-50">
          <p className="font-bold text-amber-400">{row.name}</p>
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span>Category:</span>
            <span className="capitalize font-semibold text-slate-100">{row.category.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span>Total Cost:</span>
            <span className="font-semibold text-amber-300">₹{row.cost.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span>Usage Frequency:</span>
            <span className="font-semibold text-emerald-400">{row.frequency} incidents</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-1 text-slate-300">
            <span className="font-medium text-amber-500">Cumulative Share:</span>
            <span className="font-bold text-amber-400">{row.cumulativePercent}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pareto Analysis (80/20 Rule)
              </h3>
              <p className="text-xs text-slate-500">
                Identifies top 20% of tools & parts driving 80% of consumption expenses
              </p>
            </div>
          </div>
        </div>

        {/* View Metric Switcher */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setMetric('cost')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              metric === 'cost'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Total Cost (₹)
          </button>
          <button
            onClick={() => setMetric('frequency')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              metric === 'frequency'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" /> Incident Count
          </button>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={formattedData} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="displayName"
              tick={{ fill: '#64748b', fontSize: 11 }}
              angle={-20}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => (metric === 'cost' ? `₹${(v / 1000).toFixed(0)}k` : v)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fill: '#d97706', fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span className="text-slate-700 font-medium">{value}</span>}
            />

            {/* Reference line for 80% Pareto Threshold */}
            <ReferenceLine
              yAxisId="right"
              y={80}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{
                value: '80% Vital Threshold',
                fill: '#ef4444',
                fontSize: 10,
                fontWeight: 'bold',
                position: 'top',
              }}
            />

            <Bar
              yAxisId="left"
              dataKey="displayValue"
              name={metric === 'cost' ? 'Wear Expense (₹)' : 'Incident Count'}
              fill="#f59e0b"
              radius={[6, 6, 0, 0]}
              barSize={28}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulativePercent"
              name="Cumulative Share (%)"
              stroke="#b45309"
              strokeWidth={3}
              dot={{ r: 4, fill: '#b45309', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between text-xs text-amber-950">
        <span className="font-semibold flex items-center gap-1.5">
          <Percent className="w-4 h-4 text-amber-600" />
          Pareto Finding: Top 3 SKUs account for 68.4% of total inventory expenses.
        </span>
        <span className="text-[11px] font-bold text-amber-800 bg-white border border-amber-300 px-2.5 py-1 rounded-lg">
          Targeted Purchasing Focus
        </span>
      </div>
    </div>
  );
}
