'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  Calendar,
  Sparkles,
  Cpu,
  FileCheck,
  User,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Bot
} from 'lucide-react';
import { PMSchedule } from '@/types/preventiveMaintenance';

interface PMDetailsModalProps {
  schedule: PMSchedule | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PMDetailsModal({ schedule, isOpen, onClose }: PMDetailsModalProps) {
  if (!schedule || !isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={schedule.title}
      subtitle={`Schedule #: ${schedule.schedule_number || `PM-${schedule.id.slice(0, 6)}`}`}
      icon={<Calendar className="w-5 h-5 text-amber-500" />}
      maxWidth="2xl"
    >
      <div className="p-6 space-y-5">
        {/* Basic Meta Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-stone-50 border border-slate-200 rounded-xl">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Machine</span>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1 mt-0.5">
              <Cpu className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {schedule.asset_name || 'Asset'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Recurrence Cadence</span>
            <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md inline-block mt-0.5 uppercase">
              {schedule.recurrence_interval || schedule.recurrence_type || 'Monthly'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Next Due Date</span>
            <span className="text-xs font-mono font-bold text-slate-800 block mt-0.5">
              {schedule.next_due_date ? new Date(schedule.next_due_date).toLocaleDateString() : 'Pending'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Lead</span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              {schedule.assigned_technician_name || 'Automated Scheduler'}
            </span>
          </div>
        </div>

        {/* AI Failure Risk Scoring & Interval Optimization Box */}
        {schedule.ai_risk_score !== undefined && (
          <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  AI Failure Risk Analysis & Optimization Telemetry
                </h4>
              </div>

              <span
                className={`text-sm font-black px-2.5 py-1 rounded-lg border ${
                  schedule.ai_risk_score >= 70
                    ? 'bg-red-100 text-red-900 border-red-300'
                    : schedule.ai_risk_score >= 40
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}
              >
                {schedule.ai_risk_score} / 100 Risk Score
              </span>
            </div>

            {schedule.ai_optimization_rationale || schedule.ai_rationale ? (
              <p className="text-xs text-slate-700 bg-white/80 p-3 rounded-xl border border-amber-200 leading-relaxed font-medium">
                <Bot className="w-3.5 h-3.5 text-amber-600 inline mr-1.5" />
                {schedule.ai_optimization_rationale || schedule.ai_rationale}
              </p>
            ) : null}
          </div>
        )}

        {/* Routine Description / Notes */}
        {schedule.description && (
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-700">Routine Instructions / Notes</span>
            <p className="text-xs text-slate-800 bg-stone-50 p-3 rounded-xl border border-slate-200 font-medium leading-relaxed">
              {schedule.description}
            </p>
          </div>
        )}

        {/* Attached SOP Checklist */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Attached SOP Checklist (Module 4)</span>
              <h5 className="text-xs font-bold text-slate-900">
                {schedule.procedure_title || 'Standard PM Inspection Protocol'}
              </h5>
            </div>
          </div>
          {schedule.procedure_number && (
            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
              {schedule.procedure_number}
            </span>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
}
