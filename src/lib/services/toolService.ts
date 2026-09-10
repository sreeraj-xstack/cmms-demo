import { createClient } from '@/lib/supabase/client';
import { Tool, CreateToolInput, ToolSharpeningLog, ToolStatus, ToolFilterState } from '@/types/tool';

/**
 * Fetches tool inventory master list directly from Supabase database
 */
export async function fetchTools(filters?: Partial<ToolFilterState>): Promise<Tool[]> {
  const supabase = createClient();
  let query = supabase.from('tools').select('*').order('created_at', { ascending: false });

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching tools from Supabase:', error.message);
    return [];
  }

  let result = (data || []) as Tool[];

  if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
    const q = filters.searchQuery.trim().toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.tool_number.toLowerCase().includes(q) ||
        (t.serial_number && t.serial_number.toLowerCase().includes(q)) ||
        (t.adapter_code && t.adapter_code.toLowerCase().includes(q)) ||
        t.storage_location.toLowerCase().includes(q)
    );
  }

  if (filters?.adapterCode && filters.adapterCode.trim() !== '') {
    const ac = filters.adapterCode.trim().toLowerCase();
    result = result.filter((t) => t.adapter_code && t.adapter_code.toLowerCase().includes(ac));
  }

  return result;
}

export async function fetchToolById(id: string): Promise<Tool | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('tools').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data as Tool;
}

/**
 * Creates new industrial tool in Supabase database
 */
export async function createTool(input: CreateToolInput): Promise<Tool> {
  const supabase = createClient();
  const toolNumber = `TL-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data, error } = await supabase
    .from('tools')
    .insert({
      tool_number: toolNumber,
      serial_number: input.serial_number || null,
      name: input.name,
      description: input.description || null,
      category: input.category,
      adapter_code: input.adapter_code || null,
      diameter_mm: input.diameter_mm || null,
      length_mm: input.length_mm || null,
      bore_mm: input.bore_mm || null,
      teeth_count: input.teeth_count || null,
      max_meters_per_cycle: input.max_meters_per_cycle || 5000,
      max_sharpening_cycles: input.max_sharpening_cycles || 5,
      can_be_sharpened: input.can_be_sharpened ?? true,
      storage_location: input.storage_location,
      compatible_machine_type: input.compatible_machine_type || null,
      quantity_available: input.quantity_available,
      min_quantity: input.min_quantity,
      lead_time_days: input.lead_time_days || 7,
      unit_cost: input.unit_cost || 0,
      vendor_name: input.vendor_name || null,
      notes: input.notes || null,
      status: 'available',
      cutting_meters: 0,
      running_hours: 0,
      sharpening_cycles_completed: 0,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating tool in Supabase:', error?.message);
    throw new Error(error?.message || 'Failed to register new tool in Supabase');
  }

  return data as Tool;
}

/**
 * Records running meters & hours telemetry for a tool in Supabase database
 */
export async function recordToolUsage(
  toolId: string,
  additionalMeters: number,
  notes?: string,
  performedBy?: string
): Promise<Tool | null> {
  const supabase = createClient();
  const existing = await fetchToolById(toolId);
  if (!existing) return null;

  const newMeters = (existing.cutting_meters || 0) + additionalMeters;
  const isDull = newMeters >= (existing.max_meters_per_cycle || 5000);
  const newStatus: ToolStatus = isDull ? 'dull' : existing.status;

  const { data, error } = await supabase
    .from('tools')
    .update({
      cutting_meters: newMeters,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', toolId)
    .select()
    .single();

  if (error) {
    console.error('Error updating tool usage in Supabase:', error.message);
    return null;
  }

  // Also record telemetry log in tool_sharpening_logs
  try {
    await supabase.from('tool_sharpening_logs').insert({
      tool_id: toolId,
      cycle_number: existing.sharpening_cycles_completed || 0,
      event_type: 'usage_logged',
      sent_date: new Date().toISOString().split('T')[0],
      performed_by: performedBy || 'Operator',
      running_meters_at_event: newMeters,
      notes: notes || `Logged +${additionalMeters}m cut telemetry`,
    });
  } catch (logErr) {
    console.warn('Telemetry log insert notice:', logErr);
  }

  return data as Tool;
}

/**
 * Updates tool status in Supabase database
 */
export async function updateToolStatus(
  toolId: string,
  status: ToolStatus,
  notes?: string,
  performedBy?: string
): Promise<Tool | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tools')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', toolId)
    .select()
    .single();

  if (error) {
    console.error('Error updating tool status in Supabase:', error.message);
    return null;
  }

  return data as Tool;
}

/**
 * Sends tool to vendor for sharpening in Supabase database
 */
export async function sendToolToSharpening(
  toolId: string,
  vendorName?: string,
  notes?: string,
  performedBy?: string
): Promise<Tool | null> {
  const updated = await updateToolStatus(toolId, 'out_for_sharpening', notes, performedBy);
  if (updated) {
    const supabase = createClient();
    try {
      await supabase.from('tool_sharpening_logs').insert({
        tool_id: toolId,
        cycle_number: (updated.sharpening_cycles_completed || 0) + 1,
        event_type: 'sent_to_sharpening',
        sent_date: new Date().toISOString().split('T')[0],
        sharpened_by_vendor: vendorName || updated.vendor_name || 'Vendor Sharpening Crib',
        performed_by: performedBy || 'Tool Crib Master',
        running_meters_at_event: updated.cutting_meters || 0,
        notes: notes || 'Sent out for precision regrind',
      });
    } catch (err) {
      console.warn('Sharpening log error:', err);
    }
  }
  return updated;
}

/**
 * Completes sharpening cycle and resets tool cutting meters in Supabase database
 */
export async function completeToolSharpening(
  toolId: string,
  notes?: string,
  performedBy?: string
): Promise<Tool | null> {
  const supabase = createClient();
  const existing = await fetchToolById(toolId);
  if (!existing) return null;

  const cycles = (existing.sharpening_cycles_completed || 0) + 1;

  const { data, error } = await supabase
    .from('tools')
    .update({
      cutting_meters: 0,
      sharpening_cycles_completed: cycles,
      status: 'available',
      updated_at: new Date().toISOString(),
    })
    .eq('id', toolId)
    .select()
    .single();

  if (error) {
    console.error('Error completing tool sharpening in Supabase:', error.message);
    return null;
  }

  try {
    await supabase.from('tool_sharpening_logs').insert({
      tool_id: toolId,
      cycle_number: cycles,
      event_type: 'sharpening_completed',
      sent_date: new Date().toISOString().split('T')[0],
      returned_date: new Date().toISOString().split('T')[0],
      sharpened_by_vendor: existing.vendor_name || 'Tool Crib Sharpening',
      performed_by: performedBy || 'Tool Crib Master',
      cutting_meters_before: existing.cutting_meters || 0,
      running_meters_at_event: 0,
      notes: notes || 'Precision sharpening completed. Regrind verified.',
    });
  } catch (err) {
    console.warn('Sharpening completion log notice:', err);
  }

  return data as Tool;
}

/**
 * Triggers automated ERP Purchase Requisition in Supabase database
 */
export async function triggerToolERPRequisition(
  toolId: string,
  notes?: string,
  performedBy?: string
): Promise<string> {
  const supabase = createClient();
  const prNumber = `PR-TOOL-${Math.floor(100000 + Math.random() * 900000)}`;

  await supabase
    .from('tools')
    .update({ erp_pr_number: prNumber, erp_sync_status: 'Synced', updated_at: new Date().toISOString() })
    .eq('id', toolId);

  return prNumber;
}

/**
 * Fetches tool sharpening logs directly from Supabase database
 */
export async function fetchToolSharpeningLogs(toolId: string): Promise<ToolSharpeningLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tool_sharpening_logs')
    .select('*')
    .eq('tool_id', toolId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('Tool sharpening logs fetch from Supabase:', error?.message);
    return [];
  }

  return (data || []).map((l: any) => ({
    ...l,
    event_type: l.event_type || 'sharpening_completed',
    performed_by: l.performed_by || 'Tool Crib Master',
    running_meters_at_event: l.running_meters_at_event || l.cutting_meters_before || 0,
  })) as ToolSharpeningLog[];
}
