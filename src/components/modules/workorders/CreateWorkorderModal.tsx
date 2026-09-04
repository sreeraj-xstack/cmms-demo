'use client';

import React, { useState, useEffect } from 'react';
import { CreateWorkOrderInput, WorkOrderType, WorkOrderPriority, WorkShift, AssignedTechnician, SparePartItem, ToolItem } from '@/types/workorder';
import { Asset } from '@/types/asset';
import { BreakdownTicket } from '@/types/breakdownTicket';
import { WorkProcedure } from '@/types/workProcedure';
import { fetchAssets } from '@/lib/services/assetService';
import { fetchBreakdownTickets } from '@/lib/services/breakdownTicketService';
import { getWorkProcedures } from '@/lib/services/workProcedureService';
import { createWorkOrder } from '@/lib/services/workorderService';
import { generateAIPlanRecommendation } from '@/lib/services/aiPlannerService';
import { X, Sparkles, Clock, Calendar, Wrench, UserCheck, CheckSquare, Plus, Trash2, AlertCircle } from 'lucide-react';

interface CreateWorkorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkorderCreated: () => void;
  initialTicket?: BreakdownTicket;
}

export function CreateWorkorderModal({
  isOpen,
  onClose,
  onWorkorderCreated,
  initialTicket,
}: CreateWorkorderModalProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tickets, setTickets] = useState<BreakdownTicket[]>([]);
  const [procedures, setProcedures] = useState<WorkProcedure[]>([]);

  const [title, setTitle] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | undefined>(undefined);
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | undefined>(undefined);

  const [workType, setWorkType] = useState<WorkOrderType>('breakdown_repair');
  const [priority, setPriority] = useState<WorkOrderPriority>('medium');
  const [scheduledShift, setScheduledShift] = useState<WorkShift>('morning');

  const nowStr = new Date().toISOString().slice(0, 16);
  const laterStr = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
  const [scheduledStart, setScheduledStart] = useState(nowStr);
  const [scheduledEnd, setScheduledEnd] = useState(laterStr);
  const [targetDuration, setTargetDuration] = useState(60);

  const [assignedTechs, setAssignedTechs] = useState<AssignedTechnician[]>([
    { id: 'tech-1', name: 'Vikram Singh', role: 'Senior Maintenance Engineer' },
  ]);

  const [spareParts, setSpareParts] = useState<SparePartItem[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialTicket) {
      setSelectedTicketId(initialTicket.id);
      setSelectedAssetId(initialTicket.asset_id);
      setTitle(`Repair: ${initialTicket.issue_type} on ${initialTicket.asset_name || 'Machine'}`);
      setPriority(
        initialTicket.urgency_level === 'critical'
          ? 'critical'
          : initialTicket.urgency_level === 'high'
          ? 'high'
          : 'medium'
      );
      setWorkType('breakdown_repair');
    }
  }, [initialTicket]);

  const loadDropdownData = async () => {
    const [assetList, ticketList, procList] = await Promise.all([
      fetchAssets(),
      fetchBreakdownTickets(),
      getWorkProcedures(),
    ]);
    setAssets(assetList);
    setTickets(ticketList.filter((t) => t.status !== 'closed' && t.status !== 'rejected'));
    setProcedures(procList);

    if (assetList.length > 0 && !selectedAssetId) {
      setSelectedAssetId(assetList[0].id);
      setTitle(`Scheduled Maintenance for ${assetList[0].name}`);
    }
  };

  if (!isOpen) return null;

  const handleAssetChange = (assetId: string) => {
    setSelectedAssetId(assetId);
    const asset = assets.find((a) => a.id === assetId);
    if (asset && !title) {
      setTitle(`Maintenance Work for ${asset.name}`);
    }
  };

  const handleTicketChange = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    const t = tickets.find((tk) => tk.id === ticketId);
    if (t) {
      setSelectedAssetId(t.asset_id);
      setTitle(`Repair: ${t.issue_type} (${t.ticket_number})`);
      setPriority(
        t.urgency_level === 'critical' ? 'critical' : t.urgency_level === 'high' ? 'high' : 'medium'
      );
      setWorkType('breakdown_repair');
    }
  };

  const handleAIPlanAssist = async () => {
    const asset = assets.find((a) => a.id === selectedAssetId);
    if (!asset) {
      alert('Please select an asset first.');
      return;
    }

    setAiLoading(true);
    try {
      const proc = procedures.find((p) => p.id === selectedProcedureId);
      const recommendation = await generateAIPlanRecommendation(
        asset.id,
        asset.name,
        asset.machine_type || 'CNC Processing Center',
        proc
      );

      setScheduledStart(recommendation.suggestedStartTime);
      setScheduledEnd(recommendation.suggestedEndTime);
      setScheduledShift(recommendation.suggestedShift);
      setTargetDuration(recommendation.estimatedDurationMinutes);
      setAssignedTechs(recommendation.recommendedTechnicians);
      setAiReasoning(recommendation.reasoning);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddSparePart = () => {
    setSpareParts([
      ...spareParts,
      {
        id: `part-${Date.now()}`,
        part_name: 'Z-Axis Servo Encoder Relay 24V',
        part_number: 'SP-HOM-901',
        quantity: 1,
        unit_cost: 150,
      },
    ]);
  };

  const handleAddTool = () => {
    setTools([
      ...tools,
      {
        id: `tool-${Date.now()}`,
        tool_name: 'Digital Multimeter & Torque Wrench',
        quantity: 1,
        status: 'assigned',
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedAssetId) return;

    setLoading(true);
    try {
      const input: CreateWorkOrderInput = {
        title,
        asset_id: selectedAssetId,
        breakdown_ticket_id: selectedTicketId || undefined,
        procedure_id: selectedProcedureId || undefined,
        work_type: workType,
        priority,
        scheduled_start_time: new Date(scheduledStart).toISOString(),
        scheduled_end_time: new Date(scheduledEnd).toISOString(),
        scheduled_shift: scheduledShift,
        target_duration_minutes: targetDuration,
        assigned_technicians: assignedTechs,
        tools_required: tools,
        spare_parts_required: spareParts,
        created_by_name: 'Plant Maintenance Manager',
      };

      await createWorkOrder(input);
      onWorkorderCreated();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to create workorder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create New Work Order</h2>
              <p className="text-xs text-slate-500">Assign maintenance tasks, schedule time slots & SOP checklists</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* AI Assisted Planning Bar (3.04) */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-600 animate-pulse" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">AI Assisted Planning & Scheduling (3.04)</h3>
                  <p className="text-[11px] text-slate-600">
                    Auto-schedules optimal shift windows, duration estimates & technician recommendations
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAIPlanAssist}
                disabled={aiLoading}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5"
              >
                {aiLoading ? 'Analyzing Slots...' : '⚡ Generate AI Plan'}
              </button>
            </div>

            {aiReasoning.length > 0 && (
              <div className="space-y-1 bg-white/80 p-3 rounded-xl border border-amber-200/60 text-xs text-slate-700">
                <span className="font-bold text-amber-900 block mb-1">AI Recommendation Rationale:</span>
                {aiReasoning.map((r, i) => (
                  <p key={i} className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-amber-500 font-bold">•</span> {r}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Core Ticket & Asset Link (3.01) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Prior Breakdown Ticket (Optional - 3.01)</label>
              <select
                value={selectedTicketId || ''}
                onChange={(e) => handleTicketChange(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="">No Prior Ticket (Standalone Maintenance)</option>
                {tickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.ticket_number} - {t.issue_type} ({t.urgency_level.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Target Asset / Machine *</label>
              <select
                required
                value={selectedAssetId}
                onChange={(e) => handleAssetChange(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="">-- Select Equipment --</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.asset_tag || a.machine_type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Workorder Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. HOMAG CNC Spindle Alignment & Servo Encoder Check"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Work Order Type *</label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value as WorkOrderType)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="breakdown_repair">Breakdown Repair</option>
                <option value="preventive_maintenance">Preventive Maintenance</option>
                <option value="inspection">Planned Inspection</option>
                <option value="rework">Rework Ticket (3.08)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Priority Level *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as WorkOrderPriority)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical / Plant Down</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Work Procedure / Checklist (Module 4)</label>
              <select
                value={selectedProcedureId || ''}
                onChange={(e) => setSelectedProcedureId(e.target.value || undefined)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="">No SOP Procedure Attached</option>
                {procedures.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.procedure_number} - {p.title} ({p.total_estimated_minutes}m)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Slot Reservation (3.03) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-600" /> Reserving & Planning Time Slots (3.03)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Scheduled Start</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledStart}
                  onChange={(e) => setScheduledStart(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Scheduled End</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledEnd}
                  onChange={(e) => setScheduledEnd(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Target Shift</label>
                <select
                  value={scheduledShift}
                  onChange={(e) => setScheduledShift(e.target.value as WorkShift)}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="morning">Morning Shift (06:00 - 14:00)</option>
                  <option value="afternoon">Afternoon Shift (14:00 - 22:00)</option>
                  <option value="night">Night Shift (22:00 - 06:00)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Duration (Mins)</label>
                <input
                  type="number"
                  min={15}
                  max={1440}
                  value={targetDuration}
                  onChange={(e) => setTargetDuration(parseInt(e.target.value) || 60)}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Assigned Technicians (3.06) & Spare Parts / Tools (3.07) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tech Allocation */}
            <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-emerald-600" /> Assign Technicians (3.06)
              </h4>
              <div className="space-y-2">
                {assignedTechs.map((tech, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{tech.name}</p>
                      <p className="text-[10px] text-slate-500">{tech.role}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-xs">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spare Parts & Tools */}
            <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-amber-600" /> Spare Parts & Tools (3.07)
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleAddSparePart}
                    className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold hover:bg-amber-100"
                  >
                    + Part
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTool}
                    className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold hover:bg-amber-100"
                  >
                    + Tool
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {spareParts.map((part) => (
                  <div key={part.id} className="p-2 bg-white rounded-lg border border-slate-200 text-xs flex justify-between">
                    <span>⚙️ {part.part_name} ({part.part_number})</span>
                    <span className="font-bold text-slate-700">Qty: {part.quantity}</span>
                  </div>
                ))}

                {tools.map((tool) => (
                  <div key={tool.id} className="p-2 bg-white rounded-lg border border-slate-200 text-xs flex justify-between">
                    <span>🔧 {tool.tool_name}</span>
                    <span className="font-bold text-slate-700">Qty: {tool.quantity}</span>
                  </div>
                ))}

                {spareParts.length === 0 && tools.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic">No parts or special tools assigned yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              {loading ? 'Creating Workorder...' : 'Save & Schedule Workorder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
