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
          No breakdown tickets match your current filters. Click "Raise Breakdown Ticket" to report a machine issue.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
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
