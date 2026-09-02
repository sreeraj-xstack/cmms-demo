'use client';

import React, { useState } from 'react';
import { BreakdownTicket, TicketStatus, ManagerApprovalStatus } from '@/types/breakdownTicket';
import { StatusProgressBar } from './StatusProgressBar';
import { StatusStepModal } from './StatusStepModal';
import { useAuth } from '@/context/AuthContext';
import { addTicketComment } from '@/lib/services/breakdownTicketService';
import { X, MapPin, Clock, CheckCircle2, XCircle, Paperclip, UserCheck, MessageSquare, Send, ArrowRight, User, MessageCircle } from 'lucide-react';

interface TicketDetailsDrawerProps {
  ticket: BreakdownTicket | null;
  onClose: () => void;
  onStatusChange: (ticketId: string, newStatus: TicketStatus, notes?: string) => Promise<void>;
  onManagerApproval: (ticketId: string, approvalStatus: ManagerApprovalStatus, notes?: string, assignedEngineer?: string) => Promise<void>;
}

export function TicketDetailsDrawer({
  ticket,
  onClose,
  onStatusChange,
  onManagerApproval,
}: TicketDetailsDrawerProps) {
  const { user } = useAuth();
  const [managerNotes, setManagerNotes] = useState('');
  const [assignedEngineer, setAssignedEngineer] = useState('');
  const [generalComment, setGeneralComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);

  if (!ticket) return null;

  const handleApprove = async () => {
    setActionLoading(true);
    await onManagerApproval(ticket.id, 'approved', managerNotes, assignedEngineer || 'Maintenance Engineer');
    setManagerNotes('');
    setAssignedEngineer('');
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!managerNotes.trim()) {
      alert('Please provide mandatory rejection comments.');
      return;
    }
    setActionLoading(true);
    await onManagerApproval(ticket.id, 'rejected', managerNotes);
    setManagerNotes('');
    setActionLoading(false);
  };

  const handleStepModalConfirm = async (newStatus: TicketStatus, notes: string) => {
    setActionLoading(true);
    await onStatusChange(ticket.id, newStatus, notes);
    setActionLoading(false);
  };

  const handleAddGeneralComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generalComment.trim()) return;

    setActionLoading(true);
    const userName = user?.full_name || user?.email?.split('@')[0] || 'Plant User';
    const userRole = user?.role || 'operator';

    await addTicketComment(ticket.id, generalComment, userName, userRole, user?.id, 'general');
    setGeneralComment('');
    setActionLoading(false);
  };

  // Only display general user comments in the comments box (stage changes go exclusively into Audit History)
  const generalComments = (ticket.comments || []).filter((c) => c.comment_type === 'general');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white border-l border-slate-200 shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
          {/* Top Bar Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="inline-block font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-500/30">
                {ticket.ticket_number}
              </span>
              <h2 className="text-base font-bold text-slate-900 leading-snug">{ticket.asset_name}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {ticket.asset_location} • Reported by <span className="font-semibold text-slate-700">{ticket.reported_by_name}</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-stone-50 transition-all flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 7-Stage Status Pipeline Visual Tracker */}
          <StatusProgressBar currentStatus={ticket.status} />

          {/* Action Row: Advance Pipeline Modal */}
          <div>
            <button
              onClick={() => setIsStepModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-xs transition-all shadow-xs"
            >
              <span>Advance Pipeline Stage / Add Step Note</span>
              <ArrowRight className="h-4 w-4 text-amber-400" />
            </button>
          </div>

          {/* Manager Approval Panel */}
          {ticket.manager_approval_status === 'pending' && (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-50/60 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-amber-600" />
                  Manager Review & Approval Controls
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-200/50 px-2 py-0.5 rounded">
                  Pending Sign-Off
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <input
                  type="text"
                  value={assignedEngineer}
                  onChange={(e) => setAssignedEngineer(e.target.value)}
                  placeholder="Assign Lead Engineer (e.g. Maintenance Engineer)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                />
                <textarea
                  rows={2}
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  placeholder="Mandatory / Optional Manager review comments..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 text-xs transition-all shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  Approve Ticket
                </button>

                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-stone-50 text-slate-700 font-semibold py-2 text-xs transition-all"
                >
                  <XCircle className="h-4 w-4 text-slate-500" />
                  Reject Ticket
                </button>
              </div>
            </div>
          )}

          {/* Description & Technical Specs */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Issue & Defect Specs</h3>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Issue Category</span>
                <span className="font-bold text-slate-900">{ticket.issue_type}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Breakdown Category</span>
                <span className={`font-bold capitalize ${ticket.breakdown_category === 'major' ? 'text-amber-900' : 'text-slate-700'}`}>
                  {ticket.breakdown_category} Breakdown
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Urgency Level</span>
                <span className="font-bold text-slate-900 capitalize">{ticket.urgency_level}</span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="font-semibold text-slate-500 block">Problem Description:</span>
                <p className="text-slate-800 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-slate-200 font-medium">
                  {ticket.description}
                </p>
              </div>
            </div>
          </div>

          {/* Media Attachments Viewer */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Paperclip className="h-4 w-4 text-amber-500" />
                Attached Media Proof ({ticket.attachments.length})
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {ticket.attachments.map((att) => (
                  <div key={att.id} className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 truncate text-[11px]">{att.file_name}</span>
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                        {att.file_type.toUpperCase()}
                      </span>
                    </div>

                    {att.file_type === 'photo' && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48 flex items-center justify-center">
                        <img src={att.file_url} alt={att.file_name} className="max-h-48 object-contain" />
                      </div>
                    )}

                    {att.file_type === 'audio' && (
                      <audio src={att.file_url} controls className="w-full h-10 rounded-xl" />
                    )}

                    {att.file_type === 'video' && (
                      <video src={att.file_url} controls className="w-full max-h-48 rounded-xl bg-slate-900" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Discussion Comments */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-amber-500" />
              General Discussion & Ticket Notes ({generalComments.length})
            </h3>

            {/* Post General Comment Form */}
            <form onSubmit={handleAddGeneralComment} className="flex items-center gap-2">
              <input
                type="text"
                value={generalComment}
                onChange={(e) => setGeneralComment(e.target.value)}
                placeholder="Type a general note or question on this ticket..."
                className="flex-1 rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={actionLoading || !generalComment.trim()}
                className="flex items-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-2 text-xs font-bold text-slate-950 transition-all disabled:opacity-50 flex-shrink-0"
              >
                <Send className="h-3.5 w-3.5" /> Post
              </button>
            </form>

            {/* Comments List */}
            {generalComments.length > 0 ? (
              <div className="space-y-2">
                {generalComments.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-3 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{c.user_name}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">({c.user_role})</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed bg-stone-50 p-2 rounded-xl border border-slate-100 font-medium">
                      "{c.comment_text}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-[11px] italic">No general discussion comments posted yet.</p>
            )}
          </div>

          {/* Timestamp & Step Audit History (Placed at the VERY END of the drawer) */}
          {ticket.history && ticket.history.length > 0 && (
            <div className="space-y-3 text-xs pt-4 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-500" />
                Timestamp & Step Audit History ({ticket.history.length})
              </h3>

              <div className="space-y-2.5">
                {ticket.history.map((h) => (
                  <div key={h.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        {h.status_to.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(h.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold">{h.changed_by_name}</span>
                    </div>

                    {h.notes && (
                      <div className="rounded-xl bg-amber-50/60 border border-amber-300/50 p-3 text-xs text-slate-900 space-y-1">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Step Note / Comment</span>
                        <p className="leading-relaxed font-medium text-slate-800">
                          "{h.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advance Stage Modal */}
      <StatusStepModal
        isOpen={isStepModalOpen}
        currentStatus={ticket.status}
        ticketNumber={ticket.ticket_number}
        onClose={() => setIsStepModalOpen(false)}
        onConfirm={handleStepModalConfirm}
      />
    </div>
  );
}
