'use client';

import React, { useState } from 'react';
import { WorkOrder } from '@/types/workorder';
import { createReworkTicket } from '@/lib/services/workorderService';
import { Modal } from '@/components/ui/Modal';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ReworkTicketModalProps {
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReworkTicketModal({
  workOrder,
  isOpen,
  onClose,
  onSuccess,
}: ReworkTicketModalProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes) return;

    setLoading(true);
    try {
      await createReworkTicket(workOrder.id, notes, 'Plant Maintenance Manager');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to issue rework ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Rework Ticket"
      subtitle={`Linked to ${workOrder.work_order_number}`}
      icon={<RefreshCw className="h-5 w-5 text-red-600" />}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600" /> Manager QA Override
          </div>
          <p className="text-[11px] text-red-700">
            Issuing a Rework Ticket will create a high-priority work order tagged with <strong>REWORK</strong> and re-open maintenance verification for this asset.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Rework Failure Reason & Manager Notes *</label>
          <textarea
            required
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Z-axis positioning fault recurred within 2 hours of repair. Servo recalibration failed QA tolerance test..."
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
          />
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
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            {loading ? 'Issuing Rework...' : 'Issue Rework Ticket'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
