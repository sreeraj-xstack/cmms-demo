'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Clock,
  FileCheck,
  Cpu
} from 'lucide-react';
import PMFilterBar from '@/components/modules/preventive-maintenance/PMFilterBar';
import PMCalendarView from '@/components/modules/preventive-maintenance/PMCalendarView';
import CreatePMScheduleModal from '@/components/modules/preventive-maintenance/CreatePMScheduleModal';
import {
  PMSchedule,
  PMCalendarEvent,
  PMCalendarFilterState
} from '@/types/preventiveMaintenance';
import {
  fetchPMSchedules,
  createPMSchedule,
  generatePMWorkOrders,
  fetchPMCalendarEvents
} from '@/lib/services/preventiveMaintenanceService';
import { fetchAssets } from '@/lib/services/assetService';
import { getWorkProcedures } from '@/lib/services/workProcedureService';

export default function PreventiveMaintenancePage() {
  const [schedules, setSchedules] = useState<PMSchedule[]>([]);
  const [events, setEvents] = useState<PMCalendarEvent[]>([]);
  const [assets, setAssets] = useState<{ id: string; name: string }[]>([]);
  const [procedures, setProcedures] = useState<{ id: string; title: string; procedure_number: string }[]>([]);
  const [technicians] = useState<{ id: string; name: string }[]>([
    { id: 'tech-1', name: 'Rajesh Kumar' },
    { id: 'tech-2', name: 'Suresh Patel' },
    { id: 'tech-3', name: 'Amit Verma' },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingWOs, setIsGeneratingWOs] = useState(false);
  const [generationNotice, setGenerationNotice] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [filters, setFilters] = useState<PMCalendarFilterState>({
    viewMode: 'month',
    view_mode: 'month',
    workType: 'all',
    work_type: 'all',
    technician: 'all',
    technician_id: 'all',
    assetId: 'all',
    asset_id: 'all',
    search: '',
    search_query: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pmList, calEvents, assetList, procList] = await Promise.all([
        fetchPMSchedules(),
        fetchPMCalendarEvents(filters),
        fetchAssets(),
        getWorkProcedures(),
      ]);

      setSchedules(pmList);
      setEvents(calEvents);
      setAssets(assetList.map((a) => ({ id: a.id, name: a.name })));
      setProcedures(procList.map((p) => ({ id: p.id, title: p.title, procedure_number: p.procedure_number })));
    } catch (err) {
      console.error('Error loading PM page data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.workType, filters.work_type, filters.technician, filters.technician_id, filters.assetId, filters.asset_id]);

  const handleGenerateWOs = async () => {
    setIsGeneratingWOs(true);
    setGenerationNotice('');
    try {
      const result = await generatePMWorkOrders();
      setGenerationNotice(
        `Successfully generated ${result.created_count} Work Order(s) from due PM routines!`
      );
      await loadData();
    } catch (err: any) {
      setGenerationNotice(`Generation failed: ${err.message || err}`);
    } finally {
      setIsGeneratingWOs(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 space-y-6">
        {/* Header & Title Section */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-amber-500" />
              Preventive Maintenance & Calendar
            </h1>
            <p className="text-xs text-slate-500">
              AI-powered interval optimization, SOP checklist attachment & automated PM work order generation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateWOs}
              disabled={isGeneratingWOs}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-stone-50 border border-slate-200 rounded-xl transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-amber-600 ${isGeneratingWOs ? 'animate-spin' : ''}`} />
              {isGeneratingWOs ? 'Generating...' : 'Run Auto-PM Engine'}
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              New PM Routine Schedule
            </button>
          </div>
        </div>

        {/* Auto Generation Notification Banner */}
        {generationNotice && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{generationNotice}</span>
            </div>
            <button
              onClick={() => setGenerationNotice('')}
              className="text-amber-800 hover:text-amber-950 text-[11px] font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats KPI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active PM Routines</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <CalendarIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{schedules.length}</p>
            <p className="text-[10px] text-slate-400">Configured recurring schedules</p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">AI Risk-Optimized</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-800">
              {schedules.filter((s) => s.ai_risk_score && s.ai_risk_score >= 50).length}
            </p>
            <p className="text-[10px] text-slate-400">Schedules adjusted for MTBF risk</p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Calendar Events</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{events.length}</p>
            <p className="text-[10px] text-slate-400">PM & Work Orders scheduled</p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Attached SOP Checklists</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {schedules.filter((s) => s.procedure_id).length}
            </p>
            <p className="text-[10px] text-slate-400">Module 4 SOPs linked</p>
          </div>
        </div>

        {/* Interactive Filter Bar */}
        <PMFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={() =>
            setFilters({
              viewMode: 'month',
              view_mode: 'month',
              workType: 'all',
              work_type: 'all',
              technician: 'all',
              technician_id: 'all',
              assetId: 'all',
              asset_id: 'all',
              search: '',
              search_query: '',
            })
          }
          onGeneratePMWorkOrders={handleGenerateWOs}
          isGenerating={isGeneratingWOs}
          technicians={technicians}
          assets={assets}
        />

        {/* PM Interactive Calendar View */}
        <PMCalendarView events={events} filters={filters} />

        {/* PM Routines Data Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active PM Routine Schedules</h3>
              <p className="text-xs text-slate-500">
                Detailed listing of recurring preventive maintenance schedules and AI telemetry scores
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
              Loading PM schedules from Supabase PostgreSQL...
            </div>
          ) : schedules.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
              No active PM routines found. Click &quot;New PM Routine Schedule&quot; to configure your first schedule.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-stone-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Schedule Tag & Title</th>
                    <th className="py-3 px-4">Target Machine</th>
                    <th className="py-3 px-4">Recurrence Cadence</th>
                    <th className="py-3 px-4">Attached SOP</th>
                    <th className="py-3 px-4">AI Risk Score</th>
                    <th className="py-3 px-4">Next Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {schedules.map((sch) => (
                    <tr key={sch.id} className="hover:bg-amber-500/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                            {sch.schedule_number || `PM-${sch.id.slice(0, 6)}`}
                          </span>
                          <p className="font-bold text-slate-900">{sch.title}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Cpu className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-semibold">{sch.asset_name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-50 text-amber-900 border border-amber-300 rounded-md">
                          {sch.recurrence_interval || sch.recurrence_type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {sch.procedure_title ? (
                          <span className="text-slate-800 font-semibold flex items-center gap-1">
                            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                            {sch.procedure_title}
                          </span>
                        ) : (
                          <span className="text-slate-400">Standard Check</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {sch.ai_risk_score !== undefined ? (
                          <span
                            className={`font-extrabold text-xs px-2 py-0.5 rounded-md border ${
                              sch.ai_risk_score >= 70
                                ? 'bg-red-50 text-red-900 border-red-300'
                                : sch.ai_risk_score >= 40
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            }`}
                          >
                            {sch.ai_risk_score} / 100
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {sch.next_due_date ? new Date(sch.next_due_date).toLocaleDateString() : 'Pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal for Creating PM Schedule */}
      <CreatePMScheduleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadData}
        onSubmit={createPMSchedule}
        assets={assets}
        procedures={procedures}
        technicians={technicians}
      />
    </div>
  );
}
