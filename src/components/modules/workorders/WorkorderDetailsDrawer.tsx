'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { WorkOrder, WorkOrderStatus } from '@/types/workorder';
import {
  updateWorkOrderStatus,
  toggleProcedureStepCompletion,
  startWorkTimer,
  stopWorkTimer,
  getWorkOrderById,
  uploadWorkOrderProof,
} from '@/lib/services/workorderService';
import { issueWorkOrderPart } from '@/lib/services/sparePartService';
import { CloseWorkorderModal } from './CloseWorkorderModal';
import { ReworkTicketModal } from './ReworkTicketModal';
import { Drawer } from '@/components/ui/Drawer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Wrench,
  UserCheck,
  History,
  FileCheck,
  Camera,
  RefreshCw,
} from 'lucide-react';

interface WorkorderDetailsDrawerProps {
  workOrder: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function WorkorderDetailsDrawer({
  workOrder: initialWo,
  isOpen,
  onClose,
  onRefresh,
}: WorkorderDetailsDrawerProps) {
  const { user } = useAuth();
  const [wo, setWo] = useState<WorkOrder | null>(initialWo);
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timelog' | 'parts' | 'history'>('overview');

  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [proofUploadStepId, setProofUploadStepId] = useState<string | null>(null);
  const [issueLoadingPartId, setIssueLoadingPartId] = useState<string | null>(null);
  const actorName = user?.full_name || user?.email?.split('@')[0] || 'Maintenance Engineer';

  React.useEffect(() => {
    setWo(initialWo);
  }, [initialWo]);

  if (!isOpen || !wo) return null;

  const isOverdue =
    new Date(wo.scheduled_end_time).getTime() < Date.now() && wo.status !== 'closed';

  const reloadWo = async () => {
    const updated = await getWorkOrderById(wo.id);
    if (updated) setWo(updated);
    onRefresh();
  };

  const handleStatusChange = async (newStatus: WorkOrderStatus) => {
    if (newStatus === 'closed') {
      setIsCloseModalOpen(true);
      return;
    }

    setActionLoading(true);
    try {
      await updateWorkOrderStatus(wo.id, newStatus, actorName);
      await reloadWo();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStep = async (stepId: string, currentCompleted: boolean) => {
    try {
      await toggleProcedureStepCompletion(stepId, !currentCompleted, actorName);
      await reloadWo();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStepProofUpload = async (stepId: string, file?: File) => {
    if (!file) return;

    setProofUploadStepId(stepId);
    try {
      const proofUrl = await uploadWorkOrderProof(file);
      const step = wo?.procedure_steps?.find((item) => item.id === stepId);
      if (step) {
        await toggleProcedureStepCompletion(
          step.id,
          step.is_completed,
          step.completed_by_name || actorName,
          proofUrl,
          step.step_notes
        );
        await reloadWo();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unable to upload step proof.');
    } finally {
      setProofUploadStepId(null);
    }
  };

  const handleIssuePart = async (partId: string, sparePartId: string, quantity: number) => {
    setIssueLoadingPartId(partId);
    try {
      await issueWorkOrderPart(wo?.id || '', sparePartId, quantity, actorName);
      await reloadWo();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unable to issue spare part.');
    } finally {
      setIssueLoadingPartId(null);
    }
  };

  const handleStartTimer = async () => {
    setActionLoading(true);
    try {
      const log = await startWorkTimer(wo.id, actorName, 'repairing');
      setActiveTimerId(log.id);
      await reloadWo();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimerId && wo.time_logs && wo.time_logs.length > 0) {
      const openLog = wo.time_logs.find((l) => !l.end_time);
      if (openLog) {
        await stopWorkTimer(openLog.id, 'Work phase paused');
        setActiveTimerId(null);
        await reloadWo();
        return;
      }
    }

    if (activeTimerId) {
      await stopWorkTimer(activeTimerId, 'Work timer stopped');
      setActiveTimerId(null);
      await reloadWo();
    }
  };

  const totalLoggedMinutes = (wo.time_logs || []).reduce(
    (acc, log) => acc + (log.duration_minutes || 0),
    0
  );

  const badgeElement = (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg">
        {wo.work_order_number}
      </span>
      <StatusBadge status={wo.status} module="workorder" isRework={wo.is_rework} />
    </div>
  );

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={wo.title}
        subtitle={`Asset: ${wo.asset?.name || 'Equipment'} (${wo.asset?.machine_type || 'CNC'})`}
        badge={badgeElement}
        maxWidth="3xl"
      >
        <div className="space-y-6">
          {/* Overdue Warning Banner */}
          {isOverdue && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <span>WARNING: This work order is OVERDUE past scheduled completion time!</span>
            </div>
          )}

          {/* Status Action Buttons Bar */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-2 border-b border-slate-100">
            {wo.status !== 'closed' && (
              <>
                <button
                  onClick={() => handleStatusChange('repairing')}
                  disabled={actionLoading}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    wo.status === 'repairing'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  ▶ Start Repairing
                </button>

                <button
                  onClick={() => handleStatusChange('waiting_on_sparepart')}
                  disabled={actionLoading}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    wo.status === 'waiting_on_sparepart'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  ⚙️ Waiting Spares
                </button>

                <button
                  onClick={() => handleStatusChange('closed')}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Close Work Order
                </button>
              </>
            )}

            {/* Manager Issue Rework Button */}
            <button
              onClick={() => setIsReworkModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-red-50 hover:text-red-700 text-slate-700 border border-slate-200 transition-all flex items-center gap-1 ml-auto"
            >
              <RefreshCw className="h-3.5 w-3.5 text-red-500" /> Issue Rework
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-white">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'overview' ? 'border-amber-500 text-amber-900' : 'border-transparent text-slate-500'
              }`}
            >
              Overview & Details
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'checklist' ? 'border-amber-500 text-amber-900' : 'border-transparent text-slate-500'
              }`}
            >
              <FileCheck className="h-3.5 w-3.5 text-amber-600" /> SOP Checklist ({wo.procedure_steps?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('timelog')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'timelog' ? 'border-amber-500 text-amber-900' : 'border-transparent text-slate-500'
              }`}
            >
              <Clock className="h-3.5 w-3.5 text-amber-600" /> Time Keeping
            </button>
            <button
              onClick={() => setActiveTab('parts')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'parts' ? 'border-amber-500 text-amber-900' : 'border-transparent text-slate-500'
              }`}
            >
              <Wrench className="h-3.5 w-3.5 text-amber-600" /> Parts & Tools
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'history' ? 'border-amber-500 text-amber-900' : 'border-transparent text-slate-500'
              }`}
            >
              <History className="h-3.5 w-3.5 text-amber-600" /> History Log
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="space-y-6">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500">Scheduled Time Slot</span>
                    <p className="text-xs font-bold text-slate-800">
                      {new Date(wo.scheduled_start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">{wo.scheduled_shift} Shift</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500">Target Duration vs Actual</span>
                    <p className="text-xs font-bold text-slate-800">
                      {wo.target_duration_minutes} mins target | <span className="text-amber-700">{totalLoggedMinutes} mins logged</span>
                    </p>
                  </div>
                </div>

                {/* Linked Breakdown Ticket Card */}
                {wo.breakdown_ticket && (
                  <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900">Linked Breakdown Ticket</span>
                      <span className="text-xs font-bold text-amber-800">{wo.breakdown_ticket.ticket_number}</span>
                    </div>
                    <p className="text-xs text-slate-700">{wo.breakdown_ticket.description}</p>
                  </div>
                )}

                {/* Assigned Technicians */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Assigned Technicians</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(wo.assigned_technicians || []).map((t, i) => (
                      <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                          <UserCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{t.name}</p>
                          <p className="text-[11px] text-slate-500">{t.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SOP CHECKLIST */}
            {activeTab === 'checklist' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Standard Procedure Execution Steps
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {wo.procedure_steps?.filter((s) => s.is_completed).length || 0} / {wo.procedure_steps?.length || 0} Completed
                  </span>
                </div>

                {(!wo.procedure_steps || wo.procedure_steps.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                    No step-by-step SOP checklist attached to this workorder.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wo.procedure_steps.map((step) => (
                      <div
                        key={step.id}
                        className={`p-4 rounded-xl border transition-all ${
                          step.is_completed
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={step.is_completed}
                            onChange={() => handleToggleStep(step.id, step.is_completed)}
                            className="mt-1 h-4 w-4 rounded-xs text-amber-600 focus:ring-amber-500"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`text-xs font-bold ${
                                  step.is_completed ? 'line-through text-slate-500' : 'text-slate-900'
                                }`}
                              >
                                Step #{step.step_number}: {step.step_title}
                              </h4>
                              <div className="flex items-center gap-1.5">
                                {step.is_mandatory && (
                                  <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-xs">
                                    MANDATORY
                                  </span>
                                )}
                                {step.requires_photo_proof && (
                                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-xs flex items-center gap-0.5">
                                    <Camera className="h-3 w-3" /> PHOTO PROOF
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-slate-600">{step.instructions}</p>

                            {step.requires_photo_proof && (
                              <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 cursor-pointer">
                                <Camera className="h-3.5 w-3.5" />
                                {proofUploadStepId === step.id ? 'Uploading proof...' : step.proof_photo_url ? 'Replace photo proof' : 'Upload photo proof'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={proofUploadStepId !== null}
                                  onChange={(event) => handleStepProofUpload(step.id, event.target.files?.[0])}
                                />
                              </label>
                            )}

                            {step.completed_at && (
                              <p className="text-[10px] text-emerald-700 font-semibold pt-1">
                                ✓ Completed by {step.completed_by_name || 'Engineer'} at{' '}
                                {new Date(step.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TIME KEEPING */}
            {activeTab === 'timelog' && (
              <div className="space-y-6">
                <div className="p-5 bg-stone-900 text-white rounded-2xl space-y-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-400" />
                      <div>
                        <h3 className="text-xs font-bold">Live Work Order Time Keeper</h3>
                        <p className="text-[11px] text-slate-400">Actual logged labor hours based on exact timestamps</p>
                      </div>
                    </div>

                    <span className="text-lg font-mono font-bold text-amber-400">
                      {totalLoggedMinutes} mins logged
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleStartTimer}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Play className="h-4 w-4" /> Start Work Timer
                    </button>

                    <button
                      onClick={handleStopTimer}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Square className="h-4 w-4" /> Pause / Stop Timer
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Logged Timestamp Entries</h4>
                  {(!wo.time_logs || wo.time_logs.length === 0) ? (
                    <p className="text-xs text-slate-400 italic">No time log entries recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {wo.time_logs.map((log) => (
                        <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between">
                          <div>
                            <p className="font-bold text-slate-800">{log.technician_name}</p>
                            <p className="text-[11px] text-slate-500">
                              Start: {new Date(log.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                              {log.end_time && `➔ End: ${new Date(log.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                            {log.duration_minutes ? `${log.duration_minutes} mins` : 'In Progress...'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: PARTS & TOOLS */}
            {activeTab === 'parts' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Allocated Spare Parts & Tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-800">Required Spare Parts</span>
                    {(wo.parts || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No spare parts allocated.</p>
                    ) : (
                      (wo.parts || []).map((part) => (
                        <div key={part.id} className="p-2 bg-white rounded-lg border border-slate-200 text-xs space-y-2">
                          <div className="flex justify-between gap-2">
                            <span>⚙️ {part.part_name}</span>
                            <span className="font-bold text-slate-800">{part.issued_quantity}/{part.quantity} issued</span>
                          </div>
                          {part.spare_part_id && part.issued_quantity < part.quantity && (
                            <button
                              type="button"
                              onClick={() => handleIssuePart(part.id, part.spare_part_id || '', part.quantity - part.issued_quantity)}
                              disabled={issueLoadingPartId === part.id}
                              className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 disabled:opacity-50"
                            >
                              {issueLoadingPartId === part.id ? 'Issuing...' : `Issue remaining ${part.quantity - part.issued_quantity}`}
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-800">Assigned Special Tools</span>
                    {(wo.tools_required || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No special tools assigned.</p>
                    ) : (
                      wo.tools_required.map((t, idx) => (
                        <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 text-xs flex justify-between">
                          <span>🔧 {t.tool_name}</span>
                          <span className="font-bold text-slate-800">x{t.quantity}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: HISTORY LOG */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Immutable History Audit Trail</h3>
                <div className="space-y-2">
                  {(wo.history || []).map((h) => (
                    <div key={h.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{h.changed_by_name}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(h.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">{h.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Drawer>

      {/* Close Modal */}
      {isCloseModalOpen && (
        <CloseWorkorderModal
          workOrder={wo}
          isOpen={isCloseModalOpen}
          onClose={() => setIsCloseModalOpen(false)}
          onSuccess={reloadWo}
        />
      )}

      {/* Rework Modal */}
      {isReworkModalOpen && (
        <ReworkTicketModal
          workOrder={wo}
          isOpen={isReworkModalOpen}
          onClose={() => setIsReworkModalOpen(false)}
          onSuccess={reloadWo}
        />
      )}
    </>
  );
}
