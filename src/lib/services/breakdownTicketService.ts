import { createClient } from '@/lib/supabase/client';
import {
  BreakdownTicket,
  CreateTicketInput,
  TicketFiltersState,
  TicketStatus,
  ManagerApprovalStatus,
  TicketComment,
} from '@/types/breakdownTicket';

export async function fetchBreakdownTickets(
  filters?: Partial<TicketFiltersState>
): Promise<BreakdownTicket[]> {
  const supabase = createClient();
  let query = supabase
    .from('breakdown_tickets')
    .select(`
      *,
      asset:assets!asset_id(*),
      attachments:breakdown_ticket_attachments(*),
      history:breakdown_ticket_history(*),
      comments:breakdown_ticket_comments(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('breakdown_category', filters.category);
  }
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.urgency && filters.urgency !== 'all') {
    query = query.eq('urgency_level', filters.urgency);
  }
  if (filters?.approvalStatus && filters.approvalStatus !== 'all') {
    query = query.eq('manager_approval_status', filters.approvalStatus);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching breakdown tickets:', error.message);
    return [];
  }

  let result = (data || []).map((t: any) => ({
    ...t,
    asset_name: t.asset?.name || 'Machine Equipment',
    asset_tag: t.asset?.asset_tag || 'TAG',
    asset_location: t.asset?.location || 'Plant Floor',
    attachments: t.attachments || [],
    comments: (t.comments || []).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
    history: (t.history || []).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  }));

  if (filters?.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.ticket_number.toLowerCase().includes(s) ||
        t.issue_type.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        t.asset_name.toLowerCase().includes(s)
    );
  }

  return result;
}

export async function fetchBreakdownTicketById(id: string): Promise<BreakdownTicket | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('breakdown_tickets')
    .select(`
      *,
      asset:assets!asset_id(*),
      attachments:breakdown_ticket_attachments(*),
      history:breakdown_ticket_history(*),
      comments:breakdown_ticket_comments(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    asset_name: data.asset?.name || 'Machine Equipment',
    asset_tag: data.asset?.asset_tag || 'TAG',
    asset_location: data.asset?.location || 'Plant Floor',
    attachments: data.attachments || [],
    comments: (data.comments || []).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
    history: (data.history || []).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  };
}

/**
 * Creates Breakdown Ticket via Transactional PostgreSQL RPC Procedure
 */
export async function createBreakdownTicket(input: CreateTicketInput): Promise<BreakdownTicket> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('rpc_create_breakdown_ticket', {
    p_asset_id: input.asset_id,
    p_issue_type: input.issue_type,
    p_breakdown_category: input.breakdown_category,
    p_urgency_level: input.urgency_level,
    p_description: input.description,
    p_reported_by_name: input.reported_by_name || 'Machine Operator',
    p_attachments_json: input.attachments || [],
  });

  if (error || !data) {
    console.error('Error in rpc_create_breakdown_ticket:', error);
    throw new Error(error?.message || 'Failed to create breakdown ticket');
  }

  const created = await fetchBreakdownTicketById(data.id);
  if (!created) throw new Error('Created ticket fetch failed');
  return created;
}

/**
 * Advances Ticket Status via Transactional PostgreSQL RPC Procedure
 */
export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  changedByName: string,
  notes?: string
): Promise<BreakdownTicket> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('rpc_advance_ticket_status', {
    p_ticket_id: ticketId,
    p_new_status: newStatus,
    p_changed_by_name: changedByName,
    p_notes: notes || null,
  });

  if (error || !data) {
    console.error('Error in rpc_advance_ticket_status:', error);
    throw new Error(error?.message || 'Failed to update ticket status');
  }

  const updated = await fetchBreakdownTicketById(ticketId);
  if (!updated) throw new Error('Updated ticket fetch failed');
  return updated;
}

/**
 * Manager Ticket Approval via Transactional PostgreSQL RPC Procedure
 */
export async function updateManagerApproval(
  ticketId: string,
  approvalStatus: ManagerApprovalStatus,
  managerNotes: string,
  assignedEngineer?: string
): Promise<BreakdownTicket> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('rpc_approve_breakdown_ticket', {
    p_ticket_id: ticketId,
    p_approval_status: approvalStatus,
    p_manager_notes: managerNotes,
    p_assigned_engineer: assignedEngineer || null,
  });

  if (error || !data) {
    console.error('Error in rpc_approve_breakdown_ticket:', error);
    throw new Error(error?.message || 'Failed to process manager approval');
  }

  const updated = await fetchBreakdownTicketById(ticketId);
  if (!updated) throw new Error('Approved ticket fetch failed');
  return updated;
}

/**
 * Adds a discussion comment to a breakdown ticket
 */
export async function addTicketComment(
  ticketId: string,
  commentText: string,
  userName: string,
  userRole: string = 'operator',
  userId?: string,
  commentType: 'general' | 'status_change' | 'manager_note' | 'diagnosis' = 'general'
): Promise<TicketComment> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('breakdown_ticket_comments')
    .insert({
      ticket_id: ticketId,
      user_id: userId || null,
      user_name: userName,
      user_role: userRole,
      comment_type: commentType,
      comment_text: commentText,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to add comment: ${error?.message}`);
  }

  return data as TicketComment;
}

/**
 * Uploads media attachment file to breakdown-attachments storage bucket
 */
export async function uploadAttachmentFile(file: File): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `ticket-media/${fileName}`;

  const { data, error } = await supabase.storage
    .from('breakdown-attachments')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Unable to upload breakdown attachment: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('breakdown-attachments')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
