'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  BreakdownTicket,
  TicketFiltersState,
  CreateTicketInput,
  TicketStatus,
  ManagerApprovalStatus,
} from '@/types/breakdownTicket';
import {
  fetchBreakdownTickets,
  createBreakdownTicket,
  updateTicketStatus,
  updateManagerApproval,
} from '@/lib/services/breakdownTicketService';
import { TicketFilters } from '@/components/modules/breakdown-tickets/TicketFilters';
import { TicketListTable } from '@/components/modules/breakdown-tickets/TicketListTable';
import { TicketCreateModal } from '@/components/modules/breakdown-tickets/TicketCreateModal';
import { TicketDetailsDrawer } from '@/components/modules/breakdown-tickets/TicketDetailsDrawer';
import { Plus, Wrench, AlertTriangle, ShieldAlert, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function BreakdownTicketsPage() {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<BreakdownTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<BreakdownTicket | null>(null);

  const [filters, setFilters] = useState<TicketFiltersState>({
    search: '',
    category: 'all',
    status: 'all',
    urgency: 'all',
    approvalStatus: 'all',
  });

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchBreakdownTickets(filters);
      setTickets(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch breakdown tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      major: tickets.filter((t) => t.breakdown_category === 'major').length,
      standing: tickets.filter((t) => t.status === 'standing' || t.status === 'reported').length,
      pendingApproval: tickets.filter((t) => t.manager_approval_status === 'pending').length,
    };
  }, [tickets]);

  const handleCreateTicket = async (input: CreateTicketInput) => {
    setErrorMessage(null);
    try {
      await createBreakdownTicket(input);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create breakdown ticket.');
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus, notes?: string) => {
    const userName = user?.full_name || user?.email?.split('@')[0] || 'Maintenance User';
    const userRole = user?.role || 'engineer';
    await updateTicketStatus(ticketId, newStatus, userName, userRole, notes);
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
    await loadData();
  };

  const handleManagerApproval = async (
    ticketId: string,
    approvalStatus: ManagerApprovalStatus,
    notes?: string,
    assignedEngineer?: string
  ) => {
    const mgrName = user?.full_name || user?.email?.split('@')[0] || 'Plant Manager';
    await updateManagerApproval(ticketId, approvalStatus, mgrName, notes, assignedEngineer);
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({
        ...selectedTicket,
        manager_approval_status: approvalStatus,
        assigned_engineer_name: assignedEngineer || selectedTicket.assigned_engineer_name,
      });
    }
    await loadData();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="pl-64">
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-6">
          {/* Header Title & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-500" />
                Breakdown Tickets Module
              </h1>
              <p className="text-xs text-slate-500">
                Machine failure reporting, 7-stage status pipeline, media attachments, and manager approvals
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-50 transition-all shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-xs transition-all"
              >
                <Plus className="h-4 w-4" />
                Raise Breakdown Ticket
              </button>
            </div>
          </div>

          {/* Database Error Notice */}
          {errorMessage && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Database Error</p>
                <p>{errorMessage}</p>
                <p className="text-[11px] text-amber-700">
                  Make sure you have executed <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">03_breakdown_tickets_schema.sql</code> in your Supabase SQL Editor.
                </p>
              </div>
            </div>
          )}

          {/* KPI Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Tickets</span>
              <p className="text-xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-[10px] text-slate-400">Total Breakdown Records</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" /> Major Breakdowns
              </span>
              <p className="text-xl font-bold text-slate-900">{stats.major}</p>
              <p className="text-[10px] text-slate-400">Line Downtime Active</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider block flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-slate-800" /> Machine Standing
              </span>
              <p className="text-xl font-bold text-slate-900">{stats.standing}</p>
              <p className="text-[10px] text-slate-400">Reported / Standing</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> Pending Approval
              </span>
              <p className="text-xl font-bold text-slate-900">{stats.pendingApproval}</p>
              <p className="text-[10px] text-slate-400">Awaiting Manager Sign-off</p>
            </div>
          </div>

          {/* Search & Multi-Filter Controls */}
          <TicketFilters filters={filters} onFilterChange={setFilters} />

          {/* Ticket List Table */}
          <TicketListTable
            tickets={tickets}
            onSelectTicket={(ticket) => setSelectedTicket(ticket)}
          />
        </div>
      </main>

      {/* Raise Ticket Modal */}
      <TicketCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTicket}
      />

      {/* Ticket Details & Pipeline Drawer */}
      <TicketDetailsDrawer
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onStatusChange={handleStatusChange}
        onManagerApproval={handleManagerApproval}
      />
    </div>
  );
}
