'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  HelpCircle,
  Sparkles,
  Cpu,
  FileCheck,
  ThumbsUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { TroubleshootingRCA } from '@/types/troubleshooting';

interface RCADetailsModalProps {
  rca: TroubleshootingRCA | null;
  isOpen: boolean;
  onClose: () => void;
  onUpvote?: (rcaId: string) => void;
}

export default function RCADetailsModal({ rca, isOpen, onClose, onUpvote }: RCADetailsModalProps) {
  if (!rca || !isOpen) return null;

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'mechanical':
        return <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 rounded-md">Mechanical</span>;
      case 'electrical':
        return <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase bg-blue-100 text-blue-900 border border-blue-300 rounded-md">Electrical</span>;
      case 'hydraulic':
        return <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase bg-cyan-100 text-cyan-900 border border-cyan-300 rounded-md">Hydraulic</span>;
      case 'pneumatic':
        return <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-md">Pneumatic</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase bg-stone-100 text-slate-700 border border-slate-300 rounded-md">{cat}</span>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={rca.problem_statement}
      subtitle={`RCA #: ${rca.rca_number} • Target Machine: ${rca.asset_name || 'Asset'}`}
      icon={<HelpCircle className="w-5 h-5 text-amber-500" />}
      maxWidth="3xl"
    >
      <div className="p-6 space-y-5">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-3 p-3 bg-stone-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2">
            {getCategoryBadge(rca.root_cause_category)}
            <span className="px-2.5 py-0.5 text-xs font-black bg-amber-500 text-slate-950 rounded-md">
              {rca.ai_hit_rate_score}% AI Hit Rate
            </span>
          </div>

          <button
            onClick={() => onUpvote && onUpvote(rca.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white hover:bg-stone-100 text-slate-700 border border-slate-200 rounded-lg transition-colors"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
            <span>{rca.feedback_upvotes} Upvotes</span>
          </button>
        </div>

        {/* 5-Why Visual Breakdown */}
        <div className="p-4 bg-stone-50/80 border border-slate-200 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Structured 5-Why Diagnostic Progression
          </h4>

          {/* Why 1 */}
          <div className="flex items-start gap-2 text-xs">
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-lg shrink-0">
              WHY 1
            </span>
            <p className="font-semibold text-slate-800">{rca.why_1}</p>
          </div>

          {/* Why 2 */}
          {rca.why_2 && (
            <div className="flex items-start gap-2 text-xs pl-4">
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-lg shrink-0">
                WHY 2
              </span>
              <p className="font-semibold text-slate-800">{rca.why_2}</p>
            </div>
          )}

          {/* Why 3 */}
          {rca.why_3 && (
            <div className="flex items-start gap-2 text-xs pl-8">
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-lg shrink-0">
                WHY 3
              </span>
              <p className="font-semibold text-slate-800">{rca.why_3}</p>
            </div>
          )}

          {/* Why 4 */}
          {rca.why_4 && (
            <div className="flex items-start gap-2 text-xs pl-12">
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-lg shrink-0">
                WHY 4
              </span>
              <p className="font-semibold text-slate-800">{rca.why_4}</p>
            </div>
          )}

          {/* Why 5 / Root Cause */}
          <div className="flex items-start gap-2 text-xs pl-16 p-2.5 bg-red-50 border border-red-200 rounded-xl">
            <ArrowRight className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
            <span className="px-2 py-0.5 bg-red-500 text-white font-black text-[10px] rounded-lg shrink-0">
              ROOT CAUSE
            </span>
            <p className="font-bold text-slate-900">{rca.why_5_root_cause}</p>
          </div>
        </div>

        {/* Corrective & Preventive Action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block">
              Immediate Corrective Action
            </span>
            <p className="text-slate-800 font-medium leading-relaxed">{rca.corrective_action}</p>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block">
              Long-term Preventive Action
            </span>
            <p className="text-slate-800 font-medium leading-relaxed">
              {rca.preventive_action || 'Standard maintenance monitoring enforced.'}
            </p>
          </div>
        </div>

        {/* Linked SOP Procedure */}
        {rca.linked_procedure && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white text-emerald-600 rounded-lg border border-emerald-200">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Executable SOP Fix (Module 4)</span>
                <h5 className="text-xs font-bold text-emerald-950">{rca.linked_procedure.title}</h5>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
              {rca.linked_procedure.procedure_number}
            </span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
          >
            Close RCA Details
          </button>
        </div>
      </div>
    </Modal>
  );
}
