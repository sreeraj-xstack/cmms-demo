import { createClient } from '@/lib/supabase/client';
import {
  WorkOrder,
  WorkOrderFiltersState,
  CreateWorkOrderInput,
  WorkOrderStatus,
  WorkOrderTimeLog,
} from '@/types/workorder';

export async function uploadWorkOrderProof(file: File): Promise<string> {
  const supabase = createClient();
  const extension = file.name.split('.').pop() || 'bin';
  const path = `closure-proof/${Date.now()}_${crypto.randomUUID()}.${extension}`;

  const { data, error } = await supabase.storage
    .from('workorder-attachments')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error || !data) {
    throw new Error(error?.message || 'Unable to upload work-order proof.');
  }

  return supabase.storage.from('workorder-attachments').getPublicUrl(data.path).data.publicUrl;
}

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
      parts:work_order_parts(*),
      tools:work_order_tools(*),
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
    console.error('Error fetching work orders:', error.message);
    return [];
  }

  let result = (data || []).map((wo: any) => ({
    ...wo,
    assigned_technicians: wo.assigned_technicians || [],
    tools_required: wo.tools_required || [],
    spare_parts_required: wo.spare_parts_required || [],
    parts: wo.parts || [],
    tools: wo.tools || [],
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
      parts:work_order_parts(*),
      tools:work_order_tools(*),
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
    parts: data.parts || [],
    tools: data.tools || [],
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

/**
 * Creates Work Order via Transactional PostgreSQL RPC Stored Procedure
 */
export async function createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrder> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('rpc_create_work_order', {
    p_title: input.title,
    p_asset_id: input.asset_id,
    p_breakdown_ticket_id: input.breakdown_ticket_id || null,
    p_procedure_id: input.procedure_id || null,
    p_work_type: input.work_type,
    p_priority: input.priority,
    p_scheduled_start: input.scheduled_start_time,
    p_scheduled_end: input.scheduled_end_time,
    p_scheduled_shift: input.scheduled_shift,
    p_target_duration: input.target_duration_minutes,
    p_assigned_techs_json: input.assigned_technicians || [],
    p_parts_json: input.spare_parts_required || [],
    p_tools_json: input.tools_required || [],
    p_created_by_name: input.created_by_name || 'Maintenance Manager',
    p_is_rework: input.is_rework || false,
    p_parent_work_order_id: input.parent_work_order_id || null,
  });

  if (error || !data) {
    console.error('Error in rpc_create_work_order:', error);
    throw new Error(error?.message || 'Failed to create workorder');
  }

  const created = await getWorkOrderById(data.id);
  if (!created) throw new Error('Created workorder fetch failed');
  return created;
}

/**
 * Updates Work Order Status or Closes with Proof via Transactional RPC Procedure
 */
export async function updateWorkOrderStatus(
  workOrderId: string,
  newStatus: WorkOrderStatus,
  changedByName: string,
  notes?: string,
  closurePhotoUrl?: string,
  publishToLibrary: boolean = true
): Promise<WorkOrder> {
  const supabase = createClient();

  const currentWo = await getWorkOrderById(workOrderId);
  if (!currentWo) throw new Error('Workorder not found');

  if (newStatus === 'closed') {
    const { data, error } = await supabase.rpc('rpc_close_work_order', {
      p_work_order_id: workOrderId,
      p_closure_notes: notes || 'Work procedure completed and verified.',
      p_closure_photo_url: closurePhotoUrl || null,
      p_publish_to_library: publishToLibrary,
      p_closed_by_name: changedByName,
    });

    if (error) {
      console.error('Error in rpc_close_work_order:', error);
      throw new Error(error.message || 'Failed to close workorder');
    }
  } else {
    const allowedTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
      troubleshooting: ['repairing', 'waiting_on_sparepart', 'on_hold'],
      repairing: ['waiting_on_sparepart', 'on_hold'],
      waiting_on_sparepart: ['troubleshooting', 'repairing', 'on_hold'],
      on_hold: ['troubleshooting', 'repairing'],
      closed: [],
    };

    if (!allowedTransitions[currentWo.status].includes(newStatus)) {
      throw new Error(`Invalid work-order transition from ${currentWo.status} to ${newStatus}.`);
    }

    const { error } = await supabase
      .from('work_orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workOrderId);

    if (error) throw new Error(`Failed to update status: ${error.message}`);

    await supabase.from('work_order_history').insert({
      work_order_id: workOrderId,
      status_from: currentWo.status,
      status_to: newStatus,
      action_type: 'status_change',
      changed_by_name: changedByName,
      notes: notes || `Status changed from ${currentWo.status} to ${newStatus}`,
    });
  }

  const updated = await getWorkOrderById(workOrderId);
  if (!updated) throw new Error('Updated workorder fetch failed');
  return updated;
}

/**
 * Toggles SOP Checklist Step Completion
 */
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

/**
 * Starts Live Labor Work Timer via RPC Procedure (Guards against duplicate active timers)
 */
export async function startWorkTimer(
  workOrderId: string,
  technicianName: string,
  activityType: string = 'repairing'
): Promise<WorkOrderTimeLog> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('rpc_start_work_timer', {
    p_work_order_id: workOrderId,
    p_technician_name: technicianName,
    p_activity_type: activityType,
  });

  if (error || !data) {
    console.error('Error in rpc_start_work_timer:', error);
    throw new Error(error?.message || 'Failed to start work timer');
  }

  return data as WorkOrderTimeLog;
}

/**
 * Stops Live Labor Work Timer via RPC Procedure (Calculates server timestamps)
 */
export async function stopWorkTimer(
  timeLogId: string,
  notes?: string
): Promise<WorkOrderTimeLog> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('rpc_stop_work_timer', {
    p_time_log_id: timeLogId,
    p_notes: notes || null,
  });

  if (error || !data) {
    console.error('Error in rpc_stop_work_timer:', error);
    throw new Error(error?.message || 'Failed to stop work timer');
  }

  return data as WorkOrderTimeLog;
}

/**
 * Manager Issues Rework Ticket via Transactional RPC Procedure
 */
export async function createReworkTicket(
  parentWorkOrderId: string,
  reworkNotes: string,
  createdByName: string
): Promise<WorkOrder> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('rpc_issue_rework_ticket', {
    p_parent_work_order_id: parentWorkOrderId,
    p_rework_notes: reworkNotes,
    p_created_by_name: createdByName,
  });

  if (error || !data) {
    console.error('Error in rpc_issue_rework_ticket:', error);
    throw new Error(error?.message || 'Failed to issue rework ticket');
  }

  const created = await getWorkOrderById(data.id);
  if (!created) throw new Error('Rework workorder fetch failed');
  return created;
}
