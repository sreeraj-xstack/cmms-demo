import { createClient } from '@/lib/supabase/client';
import {
  TroubleshootingRCA,
  CreateRCAInput,
  TroubleshootingFilterState,
} from '@/types/troubleshooting';

/**
 * Fetches RCA records with joined Asset & Work Procedure titles
 */
export async function fetchTroubleshootingRCAs(
  filters?: Partial<TroubleshootingFilterState>
): Promise<TroubleshootingRCA[]> {
  const supabase = createClient();

  try {
    let query = supabase
      .from('troubleshooting_rca')
      .select(`
        *,
        asset:assets(id, name, asset_tag, location),
        linked_procedure:work_procedures(id, procedure_number, title)
      `)
      .order('created_at', { ascending: false });

    if (filters?.search && filters.search.trim() !== '') {
      const s = filters.search.trim().toLowerCase();
      query = query.or(
        `problem_statement.ilike.%${s}%,why_5_root_cause.ilike.%${s}%,rca_number.ilike.%${s}%,corrective_action.ilike.%${s}%`
      );
    }

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('root_cause_category', filters.category);
    }

    if (filters?.assetId && filters.assetId !== 'all') {
      query = query.eq('asset_id', filters.assetId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching troubleshooting_rca:', error.message);
      return [];
    }

    return (data as any[])?.map((r) => ({
      ...r,
      asset_name: r.asset?.name || 'Unknown Asset',
    })) || [];
  } catch (err) {
    console.error('Exception fetching RCA records:', err);
    return [];
  }
}

/**
 * Creates a new 5-Why RCA entry using Supabase RPC `rpc_create_troubleshooting_rca`
 */
export async function createTroubleshootingRCA(input: CreateRCAInput): Promise<TroubleshootingRCA | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc('rpc_create_troubleshooting_rca', {
      p_ticket_id: input.ticket_id || null,
      p_work_order_id: input.work_order_id || null,
      p_asset_id: input.asset_id || null,
      p_problem_statement: input.problem_statement,
      p_why_1: input.why_1,
      p_why_2: input.why_2 || null,
      p_why_3: input.why_3 || null,
      p_why_4: input.why_4 || null,
      p_why_5_root_cause: input.why_5_root_cause,
      p_root_cause_category: input.root_cause_category,
      p_corrective_action: input.corrective_action,
      p_preventive_action: input.preventive_action || null,
      p_linked_procedure_id: input.linked_procedure_id || null,
      p_publish_to_solution_library: input.publish_to_solution_library ?? true,
      p_created_by_name: input.created_by_name || 'Maintenance Engineer',
    });

    if (error) {
      console.error('Error executing rpc_create_troubleshooting_rca:', error.message);
      throw new Error(error.message);
    }

    return data as TroubleshootingRCA;
  } catch (err: any) {
    console.error('Exception creating RCA:', err.message || err);
    throw err;
  }
}

/**
 * Fetches existing RCA associated with a Breakdown Ticket
 */
export async function fetchRCAByTicketId(ticketId: string): Promise<TroubleshootingRCA | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('troubleshooting_rca')
      .select(`
        *,
        asset:assets(id, name, asset_tag, location),
        linked_procedure:work_procedures(id, procedure_number, title)
      `)
      .eq('ticket_id', ticketId)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      asset_name: data.asset?.name || 'Asset',
    } as TroubleshootingRCA;
  } catch (err) {
    return null;
  }
}

/**
 * Increments helpful upvote count for an RCA solution (Requirement 7.04 feedback learning)
 */
export async function upvoteRCAFeedback(rcaId: string): Promise<void> {
  const supabase = createClient();

  try {
    const { data: rca } = await supabase
      .from('troubleshooting_rca')
      .select('feedback_upvotes')
      .eq('id', rcaId)
      .single();

    if (rca) {
      await supabase
        .from('troubleshooting_rca')
        .update({
          feedback_upvotes: (rca.feedback_upvotes || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', rcaId);
    }
  } catch (err) {
    console.error('Error upvoting RCA feedback:', err);
  }
}
