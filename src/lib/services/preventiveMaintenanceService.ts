import { createClient } from '@/lib/supabase/client';
import {
  PMSchedule,
  CreatePMScheduleInput,
  PMCalendarEvent,
  PMCalendarFilterState,
} from '@/types/preventiveMaintenance';

/**
 * Fetches all PM schedules with asset and procedure titles
 */
export async function fetchPMSchedules(): Promise<PMSchedule[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('pm_schedules')
      .select(`
        *,
        asset:assets ( id, name, asset_tag, location ),
        procedure:work_procedures ( id, procedure_number, title )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pm_schedules:', error.message);
      return [];
    }

    return (data as any[])?.map((row) => ({
      ...row,
      asset_name: row.asset?.name || 'Unknown Asset',
      asset_tag: row.asset?.asset_tag || '',
      procedure_title: row.procedure?.title || 'Standard PM Procedure',
      procedure_number: row.procedure?.procedure_number || '',
    })) || [];
  } catch (err) {
    console.error('Exception fetching pm_schedules:', err);
    return [];
  }
}

/**
 * Creates a new PM Schedule using Supabase RPC `rpc_create_pm_schedule`
 */
export async function createPMSchedule(input: CreatePMScheduleInput): Promise<PMSchedule | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc('rpc_create_pm_schedule', {
      p_title: input.title,
      p_asset_id: input.asset_id,
      p_procedure_id: input.procedure_id || null,
      p_description: input.description || null,
      p_recurrence_interval: input.recurrence_interval || input.recurrence_type || 'monthly',
      p_recurrence_type: input.recurrence_type || input.recurrence_interval || 'monthly',
      p_next_due_date: input.next_due_date,
      p_estimated_duration_minutes: input.estimated_duration_minutes || 60,
      p_assigned_technician_id: input.assigned_technician_id || null,
      p_assigned_technician_name: input.assigned_technician_name || null,
      p_assigned_shift: input.assigned_shift || 'morning',
      p_is_ai_optimized: input.is_ai_optimized ?? true,
      p_ai_risk_score: input.ai_risk_score || 35,
      p_ai_recommended_interval: input.ai_recommended_interval || 'monthly',
      p_ai_optimization_rationale: input.ai_optimization_rationale || null,
    });

    if (error) {
      console.error('Error calling rpc_create_pm_schedule:', error.message);
      throw new Error(error.message);
    }

    return data as PMSchedule;
  } catch (err: any) {
    console.error('Exception creating PM schedule:', err.message || err);
    throw err;
  }
}

/**
 * Executes RPC procedure to scan due PM routines and generate PM Work Orders
 */
export async function generatePMWorkOrders(): Promise<{ created_count: number; work_order_ids: string[] }> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc('rpc_generate_pm_work_orders');
    if (error) {
      console.error('Error calling rpc_generate_pm_work_orders:', error.message);
      return { created_count: 0, work_order_ids: [] };
    }

    const res = data as any;
    return {
      created_count: res?.created_count ?? res?.generated_count ?? 0,
      work_order_ids: res?.work_order_ids ?? [],
    };
  } catch (err) {
    console.error('Exception triggering rpc_generate_pm_work_orders:', err);
    return { created_count: 0, work_order_ids: [] };
  }
}

/**
 * Fetches and transforms Work Orders and PM Schedules into unified PM Calendar Events
 */
export async function fetchPMCalendarEvents(
  filters?: Partial<PMCalendarFilterState>
): Promise<PMCalendarEvent[]> {
  const supabase = createClient();

  const targetWorkType = filters?.workType || filters?.work_type;
  const targetAssetId = filters?.assetId || filters?.asset_id;

  try {
    // 1. Fetch work orders with assets
    let woQuery = supabase
      .from('work_orders')
      .select('id, work_order_number, title, work_type, status, priority, scheduled_start_time, scheduled_end_time, assigned_technicians, asset_id, asset:assets(name, location)');

    if (targetWorkType && targetWorkType !== 'all') {
      woQuery = woQuery.eq('work_type', targetWorkType);
    }

    if (targetAssetId && targetAssetId !== 'all') {
      woQuery = woQuery.eq('asset_id', targetAssetId);
    }

    const { data: woData, error: woError } = await woQuery;

    if (woError) {
      console.error('Error fetching work orders for calendar:', woError.message);
    }

    // 2. Fetch PM schedules
    let pmQuery = supabase
      .from('pm_schedules')
      .select('id, schedule_number, title, recurrence_interval, next_due_date, is_active, assigned_technician_id, assigned_technician_name, asset_id, asset:assets(name, location)');

    if (targetAssetId && targetAssetId !== 'all') {
      pmQuery = pmQuery.eq('asset_id', targetAssetId);
    }

    const { data: pmData, error: pmError } = await pmQuery;

    if (pmError) {
      console.error('Error fetching PM schedules for calendar:', pmError.message);
    }

    const events: PMCalendarEvent[] = [];

    // Map Work Orders to Calendar Events
    (woData || []).forEach((wo: any) => {
      const dateStr = wo.scheduled_start_time
        ? new Date(wo.scheduled_start_time).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const techName =
        wo.assigned_technicians && Array.isArray(wo.assigned_technicians) && wo.assigned_technicians.length > 0
          ? wo.assigned_technicians[0]?.name || 'Assigned Engineer'
          : 'Unassigned';

      events.push({
        id: `wo-${wo.id}`,
        title: `${wo.work_order_number || 'WO'}: ${wo.title}`,
        start_date: dateStr,
        work_type: wo.work_type || 'preventive_maintenance',
        status: wo.status || 'troubleshooting',
        asset_id: wo.asset_id,
        asset_name: wo.asset?.name || 'Asset',
        assigned_technician_name: techName,
        reference_id: wo.id,
      });
    });

    // Map Active PM Schedules to Calendar Events if not redundant
    (pmData || []).forEach((pm: any) => {
      if (pm.is_active && pm.next_due_date) {
        const pmDateStr = new Date(pm.next_due_date).toISOString().split('T')[0];

        events.push({
          id: `pm-${pm.id}`,
          title: `[PM Routine] ${pm.title}`,
          start_date: pmDateStr,
          work_type: 'preventive_maintenance',
          status: 'scheduled',
          asset_id: pm.asset_id,
          asset_name: pm.asset?.name || 'Asset',
          assigned_technician_name: pm.assigned_technician_name || 'Automated Scheduler',
          reference_id: pm.id,
        });
      }
    });

    return events;
  } catch (err) {
    console.error('Exception fetching PM calendar events:', err);
    return [];
  }
}
