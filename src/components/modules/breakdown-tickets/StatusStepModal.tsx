'use client';

import React, { useState } from 'react';
import { TicketStatus } from '@/types/breakdownTicket';
import { useAuth } from '@/context/AuthContext';
import { X, ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';

interface StatusStepModalProps {
  isOpen: boolean;
  currentStatus: TicketStatus;
  ticketNumber: string;
  onClose: () => void;
  onConfirm: (newStatus: TicketStatus, notes: string) => Promise<void>;
}

const STAGES: { key: TicketStatus; label: string }[] = [
  { key: 'reported', label: '1. Reported' },
  { key: 'standing', label: '2. Machine Standing' },
  { key: 'diagnosed', label: '3. Diagnosed' },
  { key: 'waiting_spares', label: '4. Waiting Spares' },
  { key: 'ready_to_fix', label: '5. Ready to Fix' },
  { key: 'fixed', label: '6. Fixed' },
  { key: 'closed', label: '7. Closed' },
];

export function StatusStepModal({
  isOpen,
  currentStatus,
  ticketNumber,
  onClose,
  onConfirm,
}: StatusStepModalProps) {
  const { user } = useAuth();
  
  // Determine default next stage index
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);
  const nextStageIndex = Math.min(currentIndex + 1, STAGES.length - 1);
  
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(STAGES[nextStageIndex].key);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm(selectedStatus, notes);
    setLoading(false);
    setNotes('');
    onClose();
  };

  const formatRoleLabel = (role?: string) => {
    switch (role) {
      case 'manager':
        return 'Plant Manager';
      case 'engineer':
        return 'Maintenance Engineer';
      case 'operator':
        return 'Machine Operator';
      default:
        return 'User';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
              {ticketNumber}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Advance Pipeline Stage</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-stone-50 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User Attribution Banner */}
        <div className="rounded-xl bg-stone-50 border border-slate-200 p-3 text-xs flex items-center justify-between">
          <span className="text-slate-500">Action performed by:</span>
          <span className="font-bold text-slate-900">
            {user?.full_name || user?.email?.split('@')[0]} ({formatRoleLabel(user?.role)})
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Stage Selection */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Select Target Stage *</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
              className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
            >
              {STAGES.map((stage) => (
                <option key={stage.key} value={stage.key}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>

          {/* Step Note / Comment */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Step Note / Comment</span>
              <span className="text-[10px] text-slate-400">Optional / Recommended</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add observation, diagnosis detail, spare part status, or repair notes..."
              className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-stone-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 font-bold text-slate-950 shadow-xs transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {loading ? 'Updating Stage...' : 'Confirm & Change Stage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
