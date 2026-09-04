'use client';

import React, { useState } from 'react';
import { WorkOrder } from '@/types/workorder';
import { updateWorkOrderStatus } from '@/lib/services/workorderService';
import { publishSolutionFromTicket } from '@/lib/services/solutionLibraryService';
import { X, CheckCircle2, Upload, Camera, BookOpen, AlertCircle } from 'lucide-react';

interface CloseWorkorderModalProps {
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CloseWorkorderModal({
  workOrder,
  isOpen,
  onClose,
  onSuccess,
}: CloseWorkorderModalProps) {
  const [closureNotes, setClosureNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [publishToLibrary, setPublishToLibrary] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const uncompletedMandatory = (workOrder.procedure_steps || []).filter(
    (s) => s.is_mandatory && !s.is_completed
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uncompletedMandatory.length > 0) {
      setErrorMessage(
        `Cannot close workorder. ${uncompletedMandatory.length} mandatory SOP steps are incomplete!`
      );
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      // 1. Update Work Order status to 'closed'
      await updateWorkOrderStatus(
        workOrder.id,
        'closed',
        'Senior Maintenance Engineer',
        closureNotes || 'Work completed successfully with proof of work.'
      );

      // 2. If requested and breakdown ticket linked, publish to Solution Library (Module 2 integration)
      if (publishToLibrary && workOrder.breakdown_ticket) {
        await publishSolutionFromTicket(
          workOrder.breakdown_ticket,
          closureNotes || 'Work procedure completed and verified.',
          'Senior Maintenance Engineer',
          'engineer'
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to close workorder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Close Work Order & Work Proof (3.13)</h2>
              <p className="text-xs text-slate-500">{workOrder.work_order_number} - Submit final proof & logs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {uncompletedMandatory.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl space-y-1">
              <span className="font-bold block">⚠️ Incomplete Mandatory SOP Steps ({uncompletedMandatory.length}):</span>
              {uncompletedMandatory.map((s) => (
                <p key={s.id} className="text-[11px] font-medium">
                  • Step #{s.step_number}: {s.step_title}
                </p>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Completion Summary & Technical Notes *</label>
            <textarea
              required
              rows={3}
              value={closureNotes}
              onChange={(e) => setClosureNotes(e.target.value)}
              placeholder="Describe exact resolution, parts replaced, and post-repair test results..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Camera className="h-3.5 w-3.5 text-slate-500" /> Proof of Work Attachment URL (Photos - 3.13 / 4.03)
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://... (e.g. Photo of replaced Z-axis relay or clean glue pot)"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={publishToLibrary}
                onChange={(e) => setPublishToLibrary(e.target.checked)}
                className="rounded-xs text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-amber-600" /> Publish Solution to Solution Library Vault (Module 2)
              </span>
            </label>
            <p className="text-[11px] text-amber-800 pl-6">
              Saves this verified repair procedure into the central plant knowledge base for future AI diagnostics.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uncompletedMandatory.length > 0}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? 'Closing Workorder...' : 'Submit & Close Workorder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
