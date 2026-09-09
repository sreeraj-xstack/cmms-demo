'use client';

import React, { useState } from 'react';
import { BreakdownTicket, TicketStatus, ManagerApprovalStatus } from '@/types/breakdownTicket';
import { StatusProgressBar } from './StatusProgressBar';
import { StatusStepModal } from './StatusStepModal';
import { PublishTicketSolutionModal } from './PublishTicketSolutionModal';
import { CreateWorkorderModal } from '../workorders/CreateWorkorderModal';
import { useAuth } from '@/context/AuthContext';
import { addTicketComment } from '@/lib/services/breakdownTicketService';
import { Drawer } from '@/components/ui/Drawer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import FiveWhyRCAModal from '../troubleshooting/FiveWhyRCAModal';
import AIFixMatcherModal from '../troubleshooting/AIFixMatcherModal';
import { HelpCircle, Bot, MapPin, Clock, CheckCircle2, XCircle, Paperclip, UserCheck, MessageSquare, Send, ArrowRight, User, Sparkles, BookOpen, Lock, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [managerNotes, setManagerNotes] = useState('');
  const [assignedEngineer, setAssignedEngineer] = useState('');
  const [generalComment, setGeneralComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isCreateWoModalOpen, setIsCreateWoModalOpen] = useState(false);
  const [isRcaModalOpen, setIsRcaModalOpen] = useState(false);
  const [isAiFixMatcherOpen, setIsAiFixMatcherOpen] = useState(false);

  if (!ticket) return null;

  const isFixedOrClosed = ticket.status === 'fixed' || ticket.status === 'closed';

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

  const handleFindAISolution = () => {
    router.push(`/solution-library?search=${encodeURIComponent(ticket.issue_type || ticket.description)}`);
  };

  // Only display general user comments in the comments box (stage changes go exclusively into Audit History)
  const generalComments = (ticket.comments || []).filter((c) => c.comment_type === 'general');

  const badgeElement = (
    <div className="flex items-center gap-2">
      <span className="inline-block font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-500/30">
        {ticket.ticket_number}
      </span>
      <StatusBadge status={ticket.status} module="ticket" />
      {ticket.manager_approval_status && (
        <StatusBadge status={ticket.manager_approval_status} module="approval" />
      )}
    </div>
  );

  return (
    <>
      <Drawer
        isOpen={Boolean(ticket)}
        onClose={onClose}
        title={ticket.asset_name || 'Breakdown Ticket Details'}
        subtitle={`${ticket.asset_location || 'Shop Floor'} • Reported by ${ticket.reported_by_name}`}
        badge={badgeElement}
        maxWidth="xl"
      >
        <div className="space-y-6">
          {/* 7-Stage Status Pipeline Visual Tracker */}
          <StatusProgressBar currentStatus={ticket.status} />

          {/* Action Row: Advance Pipeline Modal & Solution Actions */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsStepModalOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-xs transition-all shadow-xs"
              >
                <span>Advance Pipeline Stage</span>
                <ArrowRight className="h-4 w-4 text-amber-400" />
              </button>

              <button
                onClick={() => setIsCreateWoModalOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 text-xs transition-all shadow-xs"
              >
                <Calendar className="h-4 w-4 text-slate-950" />
                <span>Create Work Order</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFindAISolution}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-stone-50 hover:bg-stone-100 text-slate-800 font-bold py-2 text-xs transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                Find AI Solution
              </button>

              <button
                onClick={() => setIsAiFixMatcherOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold py-2 text-xs transition-all"
              >
                <Bot className="h-3.5 w-3.5 text-amber-600" />
                AI Fix Matcher
              </button>

              <button
                onClick={() => setIsRcaModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 text-xs shadow-xs transition-all"
              >
                <HelpCircle className="h-3.5 w-3.5 text-slate-950" />
                5-Why RCA
              </button>
            </div>
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
                      &quot;{c.comment_text}&quot;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-[11px] italic">No general discussion comments posted yet.</p>
            )}
          </div>

          {/* Timestamp & Step Audit History */}
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
                          &quot;{h.notes}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* Advance Stage Modal */}
      <StatusStepModal
        isOpen={isStepModalOpen}
        currentStatus={ticket.status}
        ticketNumber={ticket.ticket_number}
        onClose={() => setIsStepModalOpen(false)}
        onConfirm={handleStepModalConfirm}
      />

      {/* Publish Ticket Solution Modal */}
      <PublishTicketSolutionModal
        isOpen={isPublishModalOpen}
        ticket={ticket}
        onClose={() => setIsPublishModalOpen(false)}
      />

      {/* Create Work Order Modal */}
      <CreateWorkorderModal
        isOpen={isCreateWoModalOpen}
        initialTicket={ticket}
        onClose={() => setIsCreateWoModalOpen(false)}
        onWorkorderCreated={async () => {
          setIsCreateWoModalOpen(false);
          onClose();
        }}
      />

      {/* 5-Why Root Cause Analysis Modal */}
      <FiveWhyRCAModal
        isOpen={isRcaModalOpen}
        onClose={() => setIsRcaModalOpen(false)}
        onSuccess={() => {
          setIsRcaModalOpen(false);
          onClose();
        }}
        ticketId={ticket.id}
        assetId={ticket.asset_id}
        initialProblemStatement={ticket.issue_type || ticket.description}
        assets={[{ id: ticket.asset_id, name: ticket.asset_name || 'Asset' }]}
        procedures={[]}
      />

      {/* AI Diagnostic Fix Matcher Modal */}
      <AIFixMatcherModal
        isOpen={isAiFixMatcherOpen}
        onClose={() => setIsAiFixMatcherOpen(false)}
        ticketId={ticket.id}
        problemStatement={ticket.issue_type || ticket.description}
        assetId={ticket.asset_id}
        assetName={ticket.asset_name}
        onApplyFix={(fix) => {
          setIsAiFixMatcherOpen(false);
          setIsRcaModalOpen(true);
        }}
      />
    </>
  );
}
