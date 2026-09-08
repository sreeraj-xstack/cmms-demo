'use client';

import React from 'react';
import { TroubleshootingRCA } from '@/types/troubleshooting';
import { HelpCircle, FileCheck, Cpu, ThumbsUp, ArrowRight } from 'lucide-react';

interface RCAListTableProps {
  rcas: TroubleshootingRCA[];
  onSelectRCA?: (rca: TroubleshootingRCA) => void;
}

export default function RCAListTable({ rcas, onSelectRCA }: RCAListTableProps) {
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'mechanical':
        return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 rounded-md">Mechanical</span>;
      case 'electrical':
        return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-100 text-blue-900 border border-blue-300 rounded-md">Electrical</span>;
      case 'hydraulic':
        return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-cyan-100 text-cyan-900 border border-cyan-300 rounded-md">Hydraulic</span>;
      case 'pneumatic':
        return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-md">Pneumatic</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-stone-100 text-slate-700 border border-slate-300 rounded-md">{cat}</span>;
    }
  };

  if (rcas.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
        <HelpCircle className="h-8 w-8 text-slate-300 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">No Root Cause Analyses Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No 5-Why troubleshooting records found. Conduct 5-Why RCAs on breakdown tickets to populate the database.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-stone-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">RCA Tag & Problem</th>
              <th className="py-3 px-4">Target Machine</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Root Cause (Why 5)</th>
              <th className="py-3 px-4">Linked SOP Fix</th>
              <th className="py-3 px-4 text-right">Hit Rate & Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {rcas.map((rca) => (
              <tr
                key={rca.id}
                onClick={() => onSelectRCA && onSelectRCA(rca)}
                className="hover:bg-amber-500/5 transition-colors cursor-pointer group"
              >
                {/* Tag & Problem */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5 max-w-[260px]">
                    <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                      {rca.rca_number}
                    </span>
                    <p className="font-bold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-2">
                      {rca.problem_statement}
                    </p>
                  </div>
                </td>

                {/* Target Machine */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Cpu className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-semibold">{rca.asset_name}</span>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4">{getCategoryBadge(rca.root_cause_category)}</td>

                {/* Root Cause */}
                <td className="py-3.5 px-4 text-slate-700 font-medium max-w-[240px]">
                  <p className="line-clamp-2">{rca.why_5_root_cause}</p>
                </td>

                {/* Linked SOP */}
                <td className="py-3.5 px-4">
                  {rca.linked_procedure ? (
                    <span className="text-slate-800 font-semibold flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-[150px]">{rca.linked_procedure.title}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">Custom Repair</span>
                  )}
                </td>

                {/* Hit Rate & Feedback */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500 text-slate-950 rounded-md">
                      {rca.ai_hit_rate_score}% Hit Rate
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-slate-400" /> {rca.feedback_upvotes} Upvotes
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
