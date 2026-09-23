'use client';

import React from 'react';
import { BreakdownTicket, TicketStatus, BreakdownCategory, ManagerApprovalStatus } from '@/types/breakdownTicket';
import { Eye, AlertTriangle, Paperclip, CheckCircle2, XCircle, Clock, ShieldAlert } from 'lucide-react';

interface TicketListTableProps {
  tickets: BreakdownTicket[];
  onSelectTicket: (ticket: BreakdownTicket) => void;
}

export function TicketListTable({ tickets, onSelectTicket }: TicketListTableProps) {
  const getCategoryBadge = (category: BreakdownCategory) => {
    if (category === 'major') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white border border-slate-900 px-2.5 py-0.5 text-[11px] font-bold">
          <ShieldAlert className="h-3 w-3 text-amber-400" />
          Major Breakdown
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 text-slate-700 border border-slate-300 px-2.5 py-0.5 text-[11px] font-semibold">
        Minor Breakdown
      </span>
    );
  };

  const getApprovalBadge = (status: ManagerApprovalStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-800 border border-amber-400/40 px-2 py-0.5 text-[11px] font-semibold">
            <Clock className="h-3 w-3 text-amber-600" />
            Pending Approval
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 text-slate-900 border border-slate-300 px-2 py-0.5 text-[11px] font-bold">
            <CheckCircle2 className="h-3 w-3 text-amber-600" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-stone-200 text-slate-600 px-2 py-0.5 text-[11px] font-semibold">
            <XCircle className="h-3 w-3 text-slate-500" />
            Rejected
          </span>
        );
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'reported':
      case 'standing':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-2.5 py-0.5 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            {status === 'standing' ? 'Machine Standing' : 'Reported'}
          </span>
        );
      case 'diagnosed':
      case 'waiting_spares':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[11px] font-semibold">
            {status === 'waiting_spares' ? 'Waiting Spares' : 'Diagnosed'}
          </span>
        );
      case 'ready_to_fix':
      case 'fixed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-slate-950 font-bold px-2.5 py-0.5 text-[11px]">
            {status === 'fixed' ? 'Repaired / Fixed' : 'Ready to Fix'}
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold">
            Closed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 text-slate-500 px-2.5 py-0.5 text-[11px]">
            Rejected
          </span>
        );
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
        <AlertTriangle className="h-8 w-8 text-slate-300 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">No Breakdown Tickets Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No breakdown tickets match your current filters. Click &quot;Raise Breakdown Ticket&quot; to report a machine issue.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs min-w-0 w-full max-w-full">
      {/* Mobile/Tablet Card View (< lg) */}
      <div className="lg:hidden divide-y divide-slate-100">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => onSelectTicket(ticket)}
            className="p-4 space-y-3 hover:bg-stone-50/80 active:bg-amber-50/40 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="inline-block font-mono text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-500/20">
                  {ticket.ticket_number}
                </span>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">
                  {ticket.asset_name}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">Tag: {ticket.asset_tag}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {getStatusBadge(ticket.status)}
                {getCategoryBadge(ticket.breakdown_category)}
              </div>
            </div>

            <div className="bg-stone-50 rounded-xl p-2.5 border border-slate-100 space-y-1">
              <p className="text-xs font-bold text-slate-800">{ticket.issue_type}</p>
              <p className="text-[11px] text-slate-500 line-clamp-2">{ticket.description}</p>
              <p className="text-[10px] text-slate-400 pt-0.5">Reported by: {ticket.reported_by_name}</p>
            </div>

            <div
              className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                {getApprovalBadge(ticket.manager_approval_status)}
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    <Paperclip className="h-3 w-3 text-amber-600" />
                    {ticket.attachments.length} media
                  </span>
                )}
              </div>

              <button
                onClick={() => onSelectTicket(ticket)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 text-slate-700 text-xs font-semibold shadow-2xs"
              >
                <Eye className="h-3.5 w-3.5 text-amber-600" /> Triage
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= lg) */}
      <div className="hidden lg:block overflow-x-auto min-w-0 max-w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-stone-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Ticket # & Asset</th>
              <th className="py-3 px-4">Issue Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Manager Approval</th>
              <th className="py-3 px-4">Pipeline Status</th>
              <th className="py-3 px-4 text-right">Media & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className="hover:bg-amber-500/5 transition-colors cursor-pointer group"
              >
                {/* Ticket Number & Asset */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <span className="inline-block font-mono text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-500/20">
                      {ticket.ticket_number}
                    </span>
                    <p className="font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      {ticket.asset_name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">Tag: {ticket.asset_tag}</p>
                  </div>
                </td>

                {/* Issue Description */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5 max-w-xs">
                    <span className="font-bold text-slate-800 block truncate">{ticket.issue_type}</span>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{ticket.description}</p>
                    <p className="text-[10px] text-slate-400">By: {ticket.reported_by_name}</p>
                  </div>
                </td>

                {/* Breakdown Category */}
                <td className="py-3.5 px-4">{getCategoryBadge(ticket.breakdown_category)}</td>

                {/* Manager Approval Status */}
                <td className="py-3.5 px-4">{getApprovalBadge(ticket.manager_approval_status)}</td>

                {/* Status Pipeline Badge */}
                <td className="py-3.5 px-4">{getStatusBadge(ticket.status)}</td>

                {/* Media Counter & View Action */}
                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    {ticket.attachments && ticket.attachments.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-stone-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
                        <Paperclip className="h-3 w-3 text-amber-600" />
                        {ticket.attachments.length}
                      </span>
                    )}

                    <button
                      onClick={() => onSelectTicket(ticket)}
                      title="View Breakdown Ticket Details"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-700 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
