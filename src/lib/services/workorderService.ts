import { createClient } from '@/lib/supabase/client';
import {
  WorkOrder,
  WorkOrderFiltersState,
  CreateWorkOrderInput,
  WorkOrderStatus,
  WorkOrderTimeLog,
} from '@/types/workorder';
import { createNotification } from './notificationService';
import { getWorkProcedureById } from './workProcedureService';

export async function getWorkOrders(filters?: Partial<WorkOrderFiltersState>): Promise<WorkOrder[]> {
  const supabase = createClient();
  let query = supabase
    .from('work_orders')
    .select(`
      *,
      asset:assets!asset_id(*),
      breakdown_ticket:breakdown_tickets!breakdown_ticket_id(*),
      procedure:work_procedures!procedure_id(*),
      procedure_steps:work_order_procedure_steps(*),
      time_logs:work_order_time_logs(*),
      attachments:work_order_attachments(*),
      history:work_order_history(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority);
  }
  if (filters?.workType && filters.workType !== 'all') {
    query = query.eq('work_type', filters.workType);
  }
  if (filters?.assetId && filters.assetId !== 'all') {
    query = query.eq('asset_id', filters.assetId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching work orders:', error);
    return [];
  }

  let result = (data || []).map((wo: any) => ({
    ...wo,
    assigned_technicians: wo.assigned_technicians || [],
    tools_required: wo.tools_required || [],
    spare_parts_required: wo.spare_parts_required || [],
    procedure_steps: (wo.procedure_steps || []).sort((a: any, b: any) => a.step_number - b.step_number),
    time_logs: (wo.time_logs || []).sort(
      (a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    ),
    attachments: wo.attachments || [],
    history: (wo.history || []).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  }));

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (w) =>
        w.work_order_number.toLowerCase().includes(searchLower) ||
        w.title.toLowerCase().includes(searchLower) ||
        (w.asset?.name && w.asset.name.toLowerCase().includes(searchLower)) ||
        (w.breakdown_ticket?.ticket_number &&
          w.breakdown_ticket.ticket_number.toLowerCase().includes(searchLower))
    );
  }

  return result;
}

export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      asset:assets!asset_id(*),
      breakdown_ticket:breakdown_tickets!breakdown_ticket_id(*),
      procedure:work_procedures!procedure_id(*),
      procedure_steps:work_order_procedure_steps(*),
      time_logs:work_order_time_logs(*),
      attachments:work_order_attachments(*),
      history:work_order_history(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    assigned_technicians: data.assigned_technicians || [],
    tools_required: data.tools_required || [],
    spare_parts_required: data.spare_parts_required || [],
    procedure_steps: (data.procedure_steps || []).sort((a: any, b: any) => a.step_number - b.step_number),
    time_logs: (data.time_logs || []).sort(
      (a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    ),
    attachments: data.attachments || [],
    history: (data.history || []).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  };
}

export async function createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrder> {
  const supabase = createClient();

  const randomNum = Math.floor(100 + Math.random() * 900);
  const work_order_number = input.is_rework
    ? `WO-REWORK-${randomNum}`
    : `WO-2026-${randomNum}`;

  const { data: wo, error } = await supabase
    .from('work_orders')
    .insert({
      work_order_number,
      title: input.title,
      asset_id: input.asset_id,
      breakdown_ticket_id: input.breakdown_ticket_id || null,
      procedure_id: input.procedure_id || null,
      work_type: input.work_type,
      priority: input.priority,
      status: 'troubleshooting',
      scheduled_start_time: input.scheduled_start_time,
      scheduled_end_time: input.scheduled_end_time,
      scheduled_shift: input.scheduled_shift,
      target_duration_minutes: input.target_duration_minutes,
      assigned_technicians: input.assigned_technicians || [],
      tools_required: input.tools_required || [],
      spare_parts_required: input.spare_parts_required || [],
      is_rework: input.is_rework || false,
      parent_work_order_id: input.parent_work_order_id || null,
      created_by_name: input.created_by_name,
    })
    .select()
    .single();

  if (error || !wo) {
    throw new Error(`Failed to create Workorder: ${error?.message}`);
  }

  // If Breakdown Ticket is linked, update Breakdown Ticket status to 'ready_to_fix' and set work_order_id
  if (input.breakdown_ticket_id) {
    await supabase
      .from('breakdown_tickets')
      .update({
        work_order_id: wo.id,
        status: 'ready_to_fix',
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.breakdown_ticket_id);
  }

  // If a master Procedure SOP is linked, copy its template steps into instantiated work_order_procedure_steps
  if (input.procedure_id) {
    const procedure = await getWorkProcedureById(input.procedure_id);
    if (procedure && procedure.steps && procedure.steps.length > 0) {
      const stepsToInsert = procedure.steps.map((s) => ({
        work_order_id: wo.id,
        step_number: s.step_number,
        step_title: s.step_title,
        instructions: s.instructions,
        is_mandatory: s.is_mandatory,
        requires_photo_proof: s.requires_photo_proof,
        estimated_minutes: s.estimated_minutes,
        is_completed: false,
      }));

      await supabase.from('work_order_procedure_steps').insert(stepsToInsert);
    }
  }

  // Insert initial audit history entry
  await supabase.from('work_order_history').insert({
    work_order_id: wo.id,
    status_from: null,
    status_to: 'troubleshooting',
    action_type: 'created',
    changed_by_name: input.created_by_name,
    notes: `Work order created${input.is_rework ? ' as Rework Ticket' : ''}.`,
  });

  // Trigger event notification to engineers
  await createNotification({
    recipient_role: 'engineer',
    title: `New Work Order ${work_order_number}`,
    message: `Workorder "${input.title}" has been created and assigned to maintenance team.`,
    type: 'work_order',
    reference_id: wo.id,
  });

  return (await getWorkOrderById(wo.id)) as WorkOrder;
}

export async function updateWorkOrderStatus(
  workOrderId: string,
  newStatus: WorkOrderStatus,
  changedByName: string,
  notes?: string
): Promise<WorkOrder> {
  const supabase = createClient();
  const currentWo = await getWorkOrderById(workOrderId);
  if (!currentWo) throw new Error('Workorder not found');

  // Check mandatory steps completion if trying to close
  if (newStatus === 'closed') {
    const uncompletedMandatory = (currentWo.procedure_steps || []).filter(
      (s) => s.is_mandatory && !s.is_completed
    );
    if (uncompletedMandatory.length > 0) {
      throw new Error(
        `Cannot close work order. Mandatory SOP steps incomplete: ${uncompletedMandatory
          .map((s) => `Step ${s.step_number}: ${s.step_title}`)
          .join(', ')}`
      );
    }
  }

  const { error } = await supabase
    .from('work_orders')
    .update({
      status: newStatus,
      closed_at: newStatus === 'closed' ? new Date().toISOString() : currentWo.closed_at,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workOrderId);

  if (error) throw new Error(`Failed to update status: ${error.message}`);

  // Insert history log
  await supabase.from('work_order_history').insert({
    work_order_id: workOrderId,
    status_from: currentWo.status,
    status_to: newStatus,
    action_type: 'status_change',
    changed_by_name: changedByName,
    notes: notes || `Status changed from ${currentWo.status} to ${newStatus}`,
  });

  // If breakdown ticket linked and closing workorder, update ticket status to 'fixed'
  if (newStatus === 'closed' && currentWo.breakdown_ticket_id) {
    await supabase
      .from('breakdown_tickets')
      .update({
        status: 'fixed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentWo.breakdown_ticket_id);
  }

  return (await getWorkOrderById(workOrderId)) as WorkOrder;
}

export async function toggleProcedureStepCompletion(
  stepId: string,
  isCompleted: boolean,
  completedByName: string,
  proofPhotoUrl?: string,
  stepNotes?: string
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('work_order_procedure_steps')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      completed_by_name: isCompleted ? completedByName : null,
      proof_photo_url: proofPhotoUrl || null,
      step_notes: stepNotes || null,
    })
    .eq('id', stepId);
}

export async function startWorkTimer(
  workOrderId: string,
  technicianName: string,
  activityType: string = 'repairing'
): Promise<WorkOrderTimeLog> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('work_order_time_logs')
    .insert({
      work_order_id: workOrderId,
      technician_name: technicianName,
      start_time: new Date().toISOString(),
      activity_type: activityType,
    })
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to start work timer: ${error?.message}`);
  return data as WorkOrderTimeLog;
}

export async function stopWorkTimer(
  timeLogId: string,
  notes?: string
): Promise<WorkOrderTimeLog> {
  const supabase = createClient();
  const { data: log } = await supabase
    .from('work_order_time_logs')
    .select('*')
    .eq('id', timeLogId)
    .single();

  if (!log) throw new Error('Time log not found');

  const startTime = new Date(log.start_time);
  const endTime = new Date();
  const duration_minutes = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 60000));

  const { data, error } = await supabase
    .from('work_order_time_logs')
    .update({
      end_time: endTime.toISOString(),
      duration_minutes,
      notes: notes || null,
    })
    .eq('id', timeLogId)
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to stop work timer: ${error?.message}`);
  return data as WorkOrderTimeLog;
}

export async function createReworkTicket(
  parentWorkOrderId: string,
  reworkNotes: string,
  createdByName: string
): Promise<WorkOrder> {
  const parentWo = await getWorkOrderById(parentWorkOrderId);
  if (!parentWo) throw new Error('Parent workorder not found');

  return await createWorkOrder({
    title: `[REWORK] ${parentWo.title}`,
    asset_id: parentWo.asset_id,
    breakdown_ticket_id: parentWo.breakdown_ticket_id || undefined,
    procedure_id: parentWo.procedure_id || undefined,
    work_type: 'rework',
    priority: 'critical',
    scheduled_start_time: new Date().toISOString().slice(0, 16),
    scheduled_end_time: new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 16),
    scheduled_shift: 'morning',
    target_duration_minutes: parentWo.target_duration_minutes,
    assigned_technicians: parentWo.assigned_technicians,
    tools_required: parentWo.tools_required,
    spare_parts_required: parentWo.spare_parts_required,
    created_by_name: createdByName,
    is_rework: true,
    parent_work_order_id: parentWorkOrderId,
  });
}
