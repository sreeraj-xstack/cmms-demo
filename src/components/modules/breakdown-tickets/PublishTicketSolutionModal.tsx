'use client';

import React, { useState } from 'react';
import { BreakdownTicket } from '@/types/breakdownTicket';
import { publishSolutionFromTicket } from '@/lib/services/solutionLibraryService';
import { useAuth } from '@/context/AuthContext';
import { X, BookOpen, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PublishTicketSolutionModalProps {
  isOpen: boolean;
  ticket: BreakdownTicket | null;
  onClose: () => void;
}

export function PublishTicketSolutionModal({
  isOpen,
  ticket,
  onClose,
}: PublishTicketSolutionModalProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [resolutionSteps, setResolutionSteps] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Pre-fill fields when ticket changes or modal opens
  React.useEffect(() => {
    if (ticket) {
      setTitle(`${ticket.asset_name} - ${ticket.issue_type} Resolution`);
      // Find latest step notes from audit history if available
      const latestNotes = ticket.history?.find((h) => h.notes && h.notes.trim() !== '')?.notes || '';
      setResolutionSteps(
        latestNotes
          ? `1. ${latestNotes}`
          : '1. Diagnosed defect and isolated root cause.\n2. Replaced faulty component.\n3. Recalibrated machine and verified operational tolerances.'
      );
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !resolutionSteps.trim()) return;

    setPublishing(true);
    const userName = user?.full_name || user?.email?.split('@')[0] || 'Plant Engineer';
    const userRole = user?.role || 'engineer';

    try {
      await publishSolutionFromTicket(ticket, resolutionSteps.trim(), userName, userRole);
      setPublishing(false);
      onClose();
      alert('Verified Solution published to Solution Knowledge Vault!');
      router.push('/solution-library');
    } catch (err) {
      console.error('Error publishing solution:', err);
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                {ticket.ticket_number}
              </span>
              <span className="text-xs font-bold text-slate-800 bg-stone-100 px-2 py-0.5 rounded">
                Verified Ticket Solution
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">Publish Fix to Solution Vault</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-stone-50 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Solution Title */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Solution Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Problem Symptoms (Read-Only Copy from Ticket Description) */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-500 block">Problem Symptoms & Description</label>
            <div className="rounded-xl border border-slate-200 bg-stone-50 p-2.5 text-slate-800 font-medium">
              {ticket.description}
            </div>
          </div>

          {/* Mandatory Verified Resolution Steps Textbox */}
          <div className="space-y-1">
            <label className="font-bold text-slate-900 flex items-center justify-between">
              <span>Verified Step-by-Step Resolution Procedure *</span>
              <span className="text-[10px] text-amber-700 font-normal">Mandatory Field</span>
            </label>
            <textarea
              rows={5}
              value={resolutionSteps}
              onChange={(e) => setResolutionSteps(e.target.value)}
              placeholder="Enter exact step-by-step resolution procedure that permanently fixed the failure..."
              required
              className="w-full rounded-xl border border-slate-200 bg-stone-50 p-3 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Media Attachments Count Notice */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="rounded-xl bg-amber-50/60 border border-amber-300/40 p-2.5 text-[11px] text-amber-900 font-semibold flex items-center justify-between">
              <span>Carrying over {ticket.attachments.length} attached media proof file(s)</span>
              <span className="font-mono text-[10px]">Photo / Audio / Video</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-stone-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={publishing || !resolutionSteps.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 font-bold text-slate-950 shadow-xs transition-all disabled:opacity-50"
            >
              <BookOpen className="h-4 w-4" />
              {publishing ? 'Publishing Solution...' : 'Confirm & Publish to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
