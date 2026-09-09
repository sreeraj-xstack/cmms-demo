'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Calendar, Bot, ShieldAlert, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { CreatePMScheduleInput, PMRecurrenceType, AIRiskAnalysis } from '@/types/preventiveMaintenance';
import { analyzeAssetFailureRisk } from '@/lib/services/aiPmSchedulerService';

interface CreatePMScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (input: CreatePMScheduleInput) => Promise<any>;
  assets: { id: string; name: string }[];
  procedures: { id: string; title: string; procedure_number: string }[];
  technicians: { id: string; name: string }[];
}

export default function CreatePMScheduleModal({
  isOpen,
  onClose,
  onSuccess,
  onSubmit,
  assets,
  procedures,
  technicians,
}: CreatePMScheduleModalProps) {
  const [assetId, setAssetId] = useState('');
  const [procedureId, setProcedureId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recurrenceInterval, setRecurrenceInterval] = useState<PMRecurrenceType>('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('60');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState('');

  // AI Optimization State
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIRiskAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAssetSelect = async (selectedAssetId: string) => {
    setAssetId(selectedAssetId);
    if (!selectedAssetId) {
      setAiAnalysis(null);
      return;
    }

    // Automatically trigger AI Risk Scoring for the selected asset
    setIsAnalyzingRisk(true);
    try {
      const analysis = await analyzeAssetFailureRisk(selectedAssetId);
      setAiAnalysis(analysis);
      if (analysis.recommended_recurrence_interval) {
        setRecurrenceInterval(analysis.recommended_recurrence_interval);
      }
    } catch (err) {
      console.error('Error triggering AI risk analysis:', err);
    } finally {
      setIsAnalyzingRisk(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !title || !nextDueDate) {
      setErrorMsg('Please complete all required fields (Asset, Schedule Title, Next Due Date).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const selectedTech = technicians.find((t) => t.id === assignedTechnicianId);

      const payload: CreatePMScheduleInput = {
        asset_id: assetId,
        procedure_id: procedureId || undefined,
        title,
        description: description || undefined,
        recurrence_interval: recurrenceInterval,
        next_due_date: nextDueDate,
        estimated_duration_minutes: parseInt(estimatedDuration, 10) || 60,
        assigned_technician_id: assignedTechnicianId || undefined,
        assigned_technician_name: selectedTech?.name || undefined,
        ai_risk_score: aiAnalysis?.failure_risk_score || 35,
        ai_recommended_interval: aiAnalysis?.recommended_recurrence_interval || recurrenceInterval,
        ai_optimization_rationale: aiAnalysis?.ai_rationale || undefined,
      };

      await onSubmit(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create PM Schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create PM Routine Schedule"
      subtitle="Configure AI-enhanced recurring preventive maintenance routine"
      icon={<Calendar className="w-5 h-5" />}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-[#121826] space-y-5">
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Asset Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Machine / Asset <span className="text-red-500">*</span>
            </label>
            <select
              value={assetId}
              onChange={(e) => handleAssetSelect(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
            >
              <option value="">Select Asset...</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* SOP Procedure Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attached SOP Checklist
            </label>
            <select
              value={procedureId}
              onChange={(e) => setProcedureId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
            >
              <option value="">No SOP attached (Standard PM)</option>
              {procedures.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.procedure_number} - {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Failure Risk Scoring Card */}
        {assetId && (
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-600">
                  <Sparkles className={`w-4 h-4 ${isAnalyzingRisk ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    AI Preventive Optimization Engine
                    <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-black font-extrabold rounded-full uppercase">
                      AI Optimizer
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Calculates breakdown risk score from historical failure data and MTBF
                  </p>
                </div>
              </div>

              {aiAnalysis && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Risk Score</span>
                  <span
                    className={`text-lg font-black ${
                      (aiAnalysis.failure_risk_score ?? 35) >= 70
                        ? 'text-red-600'
                        : (aiAnalysis.failure_risk_score ?? 35) >= 40
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {aiAnalysis.failure_risk_score ?? 35} / 100
                  </span>
                </div>
              )}
            </div>

            {isAnalyzingRisk ? (
              <div className="mt-3 text-xs text-amber-700 font-medium flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                Analyzing asset telemetry and breakdown logs...
              </div>
            ) : aiAnalysis ? (
              <div className="mt-3 p-3 bg-white/80 backdrop-blur-xs border border-amber-500/20 rounded-lg text-xs text-slate-700">
                <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-amber-600" />
                  AI Recurrence Recommendation:
                  <span className="text-amber-700 font-bold uppercase underline">
                    {aiAnalysis.recommended_recurrence_interval}
                  </span>
                </p>
                <p className="text-slate-600 leading-relaxed">{aiAnalysis.ai_rationale}</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Schedule Title & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Routine Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly Spindle Motor Overhaul & Belt Alignment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Duration (Mins)</label>
            <input
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Recurrence & Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recurrence Cadence <span className="text-red-500">*</span>
            </label>
            <select
              value={recurrenceInterval}
              onChange={(e) => setRecurrenceInterval(e.target.value as PMRecurrenceType)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500 font-semibold text-amber-700"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semi_annual">Semi-Annual</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Next Scheduled Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Lead Technician</label>
            <select
              value={assignedTechnicianId}
              onChange={(e) => setAssignedTechnicianId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
            >
              <option value="">Unassigned (Auto-assign on due)</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scope Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">PM Routine Instructions / Notes</label>
          <textarea
            rows={3}
            placeholder="Detailed instructions for technicians during PM execution..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Saving Routine...' : 'Save & Activate Routine'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
