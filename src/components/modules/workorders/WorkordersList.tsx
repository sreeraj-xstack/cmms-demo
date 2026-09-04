'use client';

import React, { useEffect, useState } from 'react';
import { WorkOrder, WorkOrderFiltersState } from '@/types/workorder';
import { getWorkOrders } from '@/lib/services/workorderService';
import { CreateWorkorderModal } from './CreateWorkorderModal';
import { WorkorderDetailsDrawer } from './WorkorderDetailsDrawer';
import { WorkorderCalendarView } from './WorkorderCalendarView';
import {
  Search,
  Plus,
  Calendar,
  LayoutGrid,
  List,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  RefreshCw,
  UserCheck,
} from 'lucide-react';

export function WorkordersList() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');

  const [filters, setFilters] = useState<WorkOrderFiltersState>({
    search: '',
    status: 'all',
    priority: 'all',
    workType: 'all',
    assetId: 'all',
    technician: 'all',
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedWo, setSelectedWo] = useState<WorkOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadWorkOrders = async () => {
    setLoading(true);
    const data = await getWorkOrders(filters);
    setWorkOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadWorkOrders();
  }, [filters]);

  const handleOpenDrawer = (wo: WorkOrder) => {
    setSelectedWo(wo);
    setIsDrawerOpen(true);
  };

  // Metrics computation
  const totalCount = workOrders.length;
  const activeCount = workOrders.filter((w) => w.status === 'repairing' || w.status === 'troubleshooting').length;
  const waitingSparesCount = workOrders.filter((w) => w.status === 'waiting_on_sparepart').length;
  const overdueCount = workOrders.filter(
    (w) => new Date(w.scheduled_end_time).getTime() < Date.now() && w.status !== 'closed'
  ).length;
  const closedCount = workOrders.filter((w) => w.status === 'closed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'troubleshooting':
        return <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full text-[11px]">Troubleshooting</span>;
      case 'repairing':
        return <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full text-[11px]">Repairing</span>;
      case 'waiting_on_sparepart':
        return <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[11px]">Waiting Spares</span>;
      case 'on_hold':
        return <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full text-[11px]">On Hold</span>;
      case 'closed':
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[11px]">Closed</span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <span className="text-[10px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-xs">CRITICAL</span>;
      case 'high':
        return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-xs">HIGH</span>;
      case 'medium':
        return <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-xs">MEDIUM</span>;
      default:
        return <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-xs">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Work Orders Engine</h1>
            <span className="bg-amber-500/10 text-amber-900 border border-amber-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Module 3 Production Grade
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reserving time slots, AI assisted planning, SOP checklists, live time logs & calendar scheduling
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Kanban
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'calendar' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" /> Calendar (3.12)
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all shrink-0"
          >
            <Plus className="h-4 w-4" /> Create Work Order
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics Header (3.02) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Work Orders</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</p>
        </div>

        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/60 shadow-xs">
          <p className="text-xs font-semibold text-blue-700">Active Repairing</p>
          <p className="text-2xl font-extrabold text-blue-900 mt-1">{activeCount}</p>
        </div>

        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60 shadow-xs">
          <p className="text-xs font-semibold text-amber-800">Waiting Spares</p>
          <p className="text-2xl font-extrabold text-amber-950 mt-1">{waitingSparesCount}</p>
        </div>

        <div className="p-4 bg-red-50/50 rounded-2xl border border-red-200/60 shadow-xs">
          <p className="text-xs font-bold text-red-700 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> Overdue (3.09)
          </p>
          <p className="text-2xl font-extrabold text-red-900 mt-1">{overdueCount}</p>
        </div>

        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/60 shadow-xs">
          <p className="text-xs font-semibold text-emerald-700">Closed & Verified</p>
          <p className="text-2xl font-extrabold text-emerald-900 mt-1">{closedCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search WO number, title, asset name, breakdown ticket..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Statuses</option>
          <option value="troubleshooting">Troubleshooting</option>
          <option value="repairing">Repairing</option>
          <option value="waiting_on_sparepart">Waiting Spares</option>
          <option value="on_hold">On Hold</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={filters.workType}
          onChange={(e) => setFilters({ ...filters, workType: e.target.value })}
          className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Work Types</option>
          <option value="breakdown_repair">Breakdown Repair</option>
          <option value="preventive_maintenance">Preventive Maintenance</option>
          <option value="inspection">Planned Inspection</option>
          <option value="rework">Rework Ticket (3.08)</option>
        </select>
      </div>

      {/* VIEW 1: CALENDAR VIEW (3.12) */}
      {viewMode === 'calendar' ? (
        <WorkorderCalendarView workOrders={workOrders} onSelectWorkOrder={handleOpenDrawer} />
      ) : loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading Work Orders dataset...</div>
      ) : workOrders.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
          <Wrench className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No Work Orders found</p>
          <p className="text-xs text-slate-400">Schedule your first work order or convert a breakdown ticket</p>
        </div>
      ) : viewMode === 'list' ? (
        /* VIEW 2: TABLE LIST VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-stone-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">WO Number</th>
                  <th className="p-4">Title & Asset</th>
                  <th className="p-4">Priority & Type</th>
                  <th className="p-4">Status (3.05)</th>
                  <th className="p-4">Time Slot & Shift (3.03)</th>
                  <th className="p-4">Technicians (3.06)</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workOrders.map((wo) => {
                  const isOverdue =
                    new Date(wo.scheduled_end_time).getTime() < Date.now() && wo.status !== 'closed';

                  return (
                    <tr
                      key={wo.id}
                      onClick={() => handleOpenDrawer(wo)}
                      className={`hover:bg-amber-50/30 transition-colors cursor-pointer ${
                        isOverdue ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="p-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{wo.work_order_number}</span>
                          {wo.is_rework && (
                            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs">
                              REWORK
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-slate-900 line-clamp-1">{wo.title}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {wo.asset?.name || 'Machine Equipment'}
                        </p>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {getPriorityBadge(wo.priority)}
                          <span className="text-[11px] text-slate-500 font-semibold uppercase">{wo.work_type.replace('_', ' ')}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {getStatusBadge(wo.status)}
                          {isOverdue && (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1 py-0.5 rounded-xs flex items-center gap-0.5">
                              <AlertTriangle className="h-3 w-3" /> OVERDUE
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 font-medium text-slate-700">
                        <p>{new Date(wo.scheduled_start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">{wo.scheduled_shift} Shift</p>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {(wo.assigned_technicians || []).map((t, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {t.name.split(' ')[0]}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <span className="text-amber-600 font-bold inline-flex items-center gap-0.5 hover:translate-x-1 transition-transform">
                          Details <ChevronRight className="h-4 w-4" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW 3: KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['troubleshooting', 'repairing', 'waiting_on_sparepart', 'closed'].map((colStatus) => {
            const colWos = workOrders.filter((w) => w.status === colStatus);
            return (
              <div key={colStatus} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {colStatus.replace(/_/g, ' ')} ({colWos.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {colWos.map((wo) => (
                    <div
                      key={wo.id}
                      onClick={() => handleOpenDrawer(wo)}
                      className="p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-400 shadow-2xs transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-700">{wo.work_order_number}</span>
                        {getPriorityBadge(wo.priority)}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{wo.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{wo.asset?.name}</p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-slate-600">
                          <Clock className="h-3 w-3" /> {wo.target_duration_minutes}m
                        </span>
                        <span className="text-amber-600 font-bold">Open Drawer →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Work Order Details Drawer */}
      <WorkorderDetailsDrawer
        workOrder={selectedWo}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onRefresh={loadWorkOrders}
      />

      {/* Creation Modal */}
      <CreateWorkorderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWorkorderCreated={loadWorkOrders}
      />
    </div>
  );
}
