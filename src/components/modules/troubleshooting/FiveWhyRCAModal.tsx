'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import {
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Cpu,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { CreateRCAInput, RootCauseCategory } from '@/types/troubleshooting';
import { createTroubleshootingRCA } from '@/lib/services/troubleshootingService';

interface FiveWhyRCAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ticketId?: string;
  workOrderId?: string;
  assetId?: string;
  initialProblemStatement?: string;
  assets: { id: string; name: string }[];
  procedures: { id: string; title: string; procedure_number: string }[];
}

export default function FiveWhyRCAModal({
  isOpen,
  onClose,
  onSuccess,
  ticketId,
  workOrderId,
  assetId: defaultAssetId,
  initialProblemStatement = '',
  assets,
  procedures,
}: FiveWhyRCAModalProps) {
  const { user } = useAuth();
  const [selectedAssetId, setSelectedAssetId] = useState(defaultAssetId || '');
  const [problemStatement, setProblemStatement] = useState(initialProblemStatement);
  const [why1, setWhy1] = useState('');
  const [why2, setWhy2] = useState('');
  const [why3, setWhy3] = useState('');
  const [why4, setWhy4] = useState('');
  const [why5RootCause, setWhy5RootCause] = useState('');
  const [category, setCategory] = useState<RootCauseCategory>('mechanical');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [linkedProcedureId, setLinkedProcedureId] = useState('');
  const [publishToLibrary, setPublishToLibrary] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (defaultAssetId) setSelectedAssetId(defaultAssetId);
    if (initialProblemStatement) setProblemStatement(initialProblemStatement);
  }, [defaultAssetId, initialProblemStatement, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !problemStatement || !why1 || !why5RootCause || !correctiveAction) {
      setErrorMsg('Please complete mandatory fields (Asset, Problem Statement, Why 1, Root Cause, Corrective Action).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload: CreateRCAInput = {
        ticket_id: ticketId,
        work_order_id: workOrderId,
        asset_id: selectedAssetId,
        problem_statement: problemStatement,
        why_1: why1,
        why_2: why2 || undefined,
        why_3: why3 || undefined,
        why_4: why4 || undefined,
        why_5_root_cause: why5RootCause,
        root_cause_category: category,
        corrective_action: correctiveAction,
        preventive_action: preventiveAction || undefined,
        linked_procedure_id: linkedProcedureId || undefined,
        publish_to_solution_library: publishToLibrary,
        created_by_name: user?.full_name || user?.email?.split('@')[0] || 'Maintenance Engineer',
      };

      await createTroubleshootingRCA(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record 5-Why RCA');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="5-Why Root Cause Analysis (RCA)"
      subtitle="Iterative problem-solving framework to identify underlying failure causes"
      icon={<HelpCircle className="w-5 h-5" />}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Asset & Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Asset <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500"
            >
              <option value="">Select Asset...</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Root Cause Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RootCauseCategory)}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-amber-900 font-bold uppercase focus:outline-none focus:border-amber-500"
            >
              <option value="mechanical">Mechanical Failure</option>
              <option value="electrical">Electrical / Sensor</option>
              <option value="hydraulic">Hydraulic System</option>
              <option value="pneumatic">Pneumatic System</option>
              <option value="operator_error">Operator Error / Handling</option>
              <option value="wear_and_tear">Normal Wear & Tear</option>
              <option value="software_firmware">PLC / Software Glitch</option>
              <option value="other">Other / Unclassified</option>
            </select>
          </div>
        </div>

        {/* Problem Statement */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Problem Statement / Initial Breakdown Symptom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Spindle motor over-current alarm triggered during high-speed routing"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* 5-Why Iterative Analysis Steps */}
        <div className="p-4 bg-stone-50/80 border border-slate-200 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            5-Why Iterative Diagnostic Ladder
          </h4>

          {/* Why 1 */}
          <div className="flex items-start gap-2">
            <span className="px-2 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-lg shrink-0 mt-0.5">
              WHY 1
            </span>
            <input
              type="text"
              placeholder="Why did the problem happen? (e.g. Motor drawing excess amperage)"
              value={why1}
              onChange={(e) => setWhy1(e.target.value)}
              required
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Why 2 */}
          <div className="flex items-start gap-2 pl-4">
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-2" />
            <span className="px-2 py-1 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-lg shrink-0 mt-0.5">
              WHY 2
            </span>
            <input
              type="text"
              placeholder="Why did Why 1 happen? (e.g. High friction on drive belt assembly)"
              value={why2}
              onChange={(e) => setWhy2(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Why 3 */}
          <div className="flex items-start gap-2 pl-8">
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-2" />
            <span className="px-2 py-1 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-lg shrink-0 mt-0.5">
              WHY 3
            </span>
            <input
              type="text"
              placeholder="Why did Why 2 happen? (e.g. Bearing lubrication ran dry)"
              value={why3}
              onChange={(e) => setWhy3(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Why 4 */}
          <div className="flex items-start gap-2 pl-12">
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-2" />
            <span className="px-2 py-1 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-lg shrink-0 mt-0.5">
              WHY 4
            </span>
            <input
              type="text"
              placeholder="Why did Why 3 happen? (e.g. Auto-lubricator reservoir port clogged)"
              value={why4}
              onChange={(e) => setWhy4(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Why 5 / Root Cause */}
          <div className="flex items-start gap-2 pl-16">
            <ArrowRight className="w-3.5 h-3.5 text-red-500 shrink-0 mt-2" />
            <span className="px-2 py-1 bg-red-500 text-white font-black text-[10px] rounded-lg shrink-0 mt-0.5">
              ROOT CAUSE
            </span>
            <input
              type="text"
              placeholder="Final Root Cause (Why 5) * (e.g. Missing dust seal on reservoir allowed wood shavings inside)"
              value={why5RootCause}
              onChange={(e) => setWhy5RootCause(e.target.value)}
              required
              className="flex-1 px-3 py-1.5 text-xs bg-red-50 border border-red-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Corrective & Preventive Action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Corrective Action (Immediate Fix) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="What immediate repair was executed?"
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Preventive Action (Long-term Prevention)
            </label>
            <textarea
              rows={2}
              placeholder="What changes prevent recurrence?"
              value={preventiveAction}
              onChange={(e) => setPreventiveAction(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Executable SOP Link & Solution Library Checkbox */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
          <div>
            <label className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              Link Standard SOP Fix Checklist
            </label>
            <select
              value={linkedProcedureId}
              onChange={(e) => setLinkedProcedureId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
            >
              <option value="">No SOP linked (Custom Fix)</option>
              {procedures.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.procedure_number} - {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="publish_sol"
              checked={publishToLibrary}
              onChange={(e) => setPublishToLibrary(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <label htmlFor="publish_sol" className="text-xs font-bold text-slate-800 cursor-pointer">
              Publish Fix to Solution Library for Enterprise AI Search (7.02)
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Saving RCA...' : 'Save & Attach 5-Why RCA'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
