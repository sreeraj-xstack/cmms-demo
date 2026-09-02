import { createClient } from '@/lib/supabase/client';
import {
  BreakdownTicket,
  TicketFiltersState,
  CreateTicketInput,
  TicketStatus,
  ManagerApprovalStatus,
  TicketAttachment,
  TicketHistory,
  TicketComment,
  CommentType,
} from '@/types/breakdownTicket';
import { createNotification } from './notificationService';

/**
 * Fetches breakdown tickets with joined asset details, attachments, history, and comments
 */
export async function fetchBreakdownTickets(filters?: Partial<TicketFiltersState>): Promise<BreakdownTicket[]> {
  const supabase = createClient();

  try {
    let query = supabase
      .from('breakdown_tickets')
      .select(`
        *,
        assets:asset_id (
          asset_tag,
          name,
          location
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.search && filters.search.trim() !== '') {
      const s = filters.search.trim().toLowerCase();
      query = query.or(`ticket_number.ilike.%${s}%,issue_type.ilike.%${s}%,description.ilike.%${s}%,reported_by_name.ilike.%${s}%`);
    }

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

    const { data: ticketsData, error } = await query;
    if (error) {
      console.error('Error fetching breakdown tickets:', error.message);
      return [];
    }

    if (!ticketsData || ticketsData.length === 0) {
      return [];
    }

    const ticketIds = ticketsData.map((t) => t.id);

    // Fetch Attachments, History, and Comments in parallel
    const [{ data: attachmentsData }, { data: historyData }, { data: commentsData }] = await Promise.all([
      supabase.from('breakdown_ticket_attachments').select('*').in('ticket_id', ticketIds),
      supabase.from('breakdown_ticket_history').select('*').in('ticket_id', ticketIds).order('created_at', { ascending: true }),
      supabase.from('breakdown_ticket_comments').select('*').in('ticket_id', ticketIds).order('created_at', { ascending: true }),
    ]);

    // Map joined fields
    const result: BreakdownTicket[] = ticketsData.map((item: any) => {
      const asset = item.assets;
      return {
        ...item,
        asset_tag: asset?.asset_tag || 'AST-N/A',
        asset_name: asset?.name || 'Machinery Asset',
        asset_location: asset?.location || 'Plant Floor',
        attachments: (attachmentsData || []).filter((a) => a.ticket_id === item.id) as TicketAttachment[],
        history: (historyData || []).filter((h) => h.ticket_id === item.id) as TicketHistory[],
        comments: (commentsData || []).filter((c) => c.ticket_id === item.id) as TicketComment[],
      };
    });

    return result;
  } catch (err) {
    console.error('Exception fetching breakdown tickets:', err);
    return [];
  }
}

/**
 * Creates a new breakdown ticket and triggers real-time in-app notifications
 */
export async function createBreakdownTicket(input: CreateTicketInput): Promise<BreakdownTicket | null> {
  const supabase = createClient();
  const ticketNumber = `TK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const payload = {
      ticket_number: ticketNumber,
      asset_id: input.asset_id,
      issue_type: input.issue_type,
      breakdown_category: input.breakdown_category,
      urgency_level: input.urgency_level,
      status: 'reported',
      description: input.description,
      reported_by: input.reported_by || null,
      reported_by_name: input.reported_by_name || 'Plant Operator',
      manager_approval_status: 'pending',
    };

    const { data: ticket, error } = await supabase.from('breakdown_tickets').insert([payload]).select().single();
    if (error) {
      console.error('Error inserting breakdown ticket:', error.message);
      throw new Error(error.message);
    }

    // Insert Attachments if provided
    if (input.attachments && input.attachments.length > 0) {
      const attachmentPayloads = input.attachments.map((att) => ({
        ticket_id: ticket.id,
        file_url: att.file_url,
        file_type: att.file_type,
        file_name: att.file_name,
      }));
      await supabase.from('breakdown_ticket_attachments').insert(attachmentPayloads);
    }

    // Insert initial status history & initial comment
    await supabase.from('breakdown_ticket_history').insert([
      {
        ticket_id: ticket.id,
        status_from: null,
        status_to: 'reported',
        changed_by_user_id: input.reported_by || null,
        changed_by_name: input.reported_by_name || 'Plant Operator',
        notes: `Ticket raised: "${input.description}"`,
      },
    ]);

    await supabase.from('breakdown_ticket_comments').insert([
      {
        ticket_id: ticket.id,
        user_id: input.reported_by || null,
        user_name: input.reported_by_name || 'Plant Operator',
        user_role: 'operator',
        comment_type: 'general',
        comment_text: `Ticket reported: "${input.description}"`,
      },
    ]);

    // EVENT-DRIVEN NOTIFICATION TRIGGER
    if (input.breakdown_category === 'major') {
      await createNotification({
        title: `🚨 Major Breakdown Alert: ${ticketNumber}`,
        message: `Major breakdown reported by ${input.reported_by_name}. Problem: "${input.description}". Machine is currently standing.`,
        type: 'major_breakdown',
        recipient_role: 'manager',
        reference_id: ticket.id,
      });
    } else {
      await createNotification({
        title: `📋 New Breakdown Ticket: ${ticketNumber}`,
        message: `Minor breakdown ticket reported by ${input.reported_by_name} for issue: "${input.issue_type}". Description: "${input.description}".`,
        type: 'status_update',
        recipient_role: 'engineer',
        reference_id: ticket.id,
      });
    }

    return ticket as BreakdownTicket;
  } catch (err: any) {
    console.error('Exception creating breakdown ticket:', err);
    throw err;
  }
}

/**
 * Adds a dedicated comment to a breakdown ticket
 */
export async function addTicketComment(
  ticketId: string,
  commentText: string,
  userName: string,
  userRole: string,
  userId?: string,
  commentType: CommentType = 'general'
): Promise<TicketComment | null> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('breakdown_ticket_comments')
      .insert([
        {
          ticket_id: ticketId,
          user_id: userId || null,
          user_name: userName,
          user_role: userRole,
          comment_type: commentType,
          comment_text: commentText,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting comment:', error.message);
      return null;
    }
    return data as TicketComment;
  } catch (err) {
    console.error('Exception adding comment:', err);
    return null;
  }
}

/**
 * Updates status state machine along the 7-stage pipeline and logs tagged step comments & author details
 */
export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  userName: string,
  userRole: string = 'engineer',
  notes?: string
): Promise<void> {
  const supabase = createClient();

  try {
    // Get current ticket status
    const { data: existing } = await supabase.from('breakdown_tickets').select('status, ticket_number').eq('id', ticketId).single();
    const oldStatus = existing?.status || 'reported';

    // Update status
    await supabase
      .from('breakdown_tickets')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    const formattedStage = newStatus.replace('_', ' ').toUpperCase();
    const formattedUserRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);
    const historyNote = notes && notes.trim() !== '' ? `Changed by ${userName} (${formattedUserRole}): "${notes}"` : `Changed by ${userName} (${formattedUserRole})`;

    // Insert Audit History
    await supabase.from('breakdown_ticket_history').insert([
      {
        ticket_id: ticketId,
        status_from: oldStatus,
        status_to: newStatus,
        changed_by_name: `${userName} (${formattedUserRole})`,
        notes: historyNote,
      },
    ]);

    // Insert Tagged Comment into public.breakdown_ticket_comments
    if (notes && notes.trim() !== '') {
      await addTicketComment(ticketId, notes, userName, userRole, undefined, 'status_change');
    }

    // Notification Event with explicit author & comment details
    await createNotification({
      title: `🔄 Pipeline Status Update: ${existing?.ticket_number || 'Ticket'}`,
      message: `Status advanced to "${formattedStage}" by ${userName} (${formattedUserRole}).${notes ? ` Comment: "${notes}"` : ''}`,
      type: 'status_update',
      recipient_role: 'all',
      reference_id: ticketId,
    });
  } catch (err) {
    console.error('Exception updating ticket status:', err);
  }
}

/**
 * Updates Manager Approval or Rejection status
 */
export async function updateManagerApproval(
  ticketId: string,
  approvalStatus: ManagerApprovalStatus,
  managerName: string,
  notes?: string,
  assignedEngineerName?: string
): Promise<void> {
  const supabase = createClient();

  try {
    const updateData: any = {
      manager_approval_status: approvalStatus,
      manager_notes: notes || null,
      updated_at: new Date().toISOString(),
    };

    if (assignedEngineerName) {
      updateData.assigned_engineer_name = assignedEngineerName;
    }

    await supabase.from('breakdown_tickets').update(updateData).eq('id', ticketId);

    // Audit History
    await supabase.from('breakdown_ticket_history').insert([
      {
        ticket_id: ticketId,
        status_from: 'pending_approval',
        status_to: approvalStatus,
        changed_by_name: `${managerName} (Plant Manager)`,
        notes: `Manager Approval Status set to ${approvalStatus.toUpperCase()}.${notes ? ` Comment: "${notes}"` : ''}`,
      },
    ]);

    // Tagged Comment
    if (notes && notes.trim() !== '') {
      await addTicketComment(ticketId, notes, managerName, 'manager', undefined, 'manager_note');
    }

    // Notification Event
    const isApproved = approvalStatus === 'approved';
    await createNotification({
      title: `${isApproved ? '✅' : '❌'} Manager ${approvalStatus.toUpperCase()}`,
      message: `Ticket reviewed by ${managerName} (Plant Manager). Decision: ${approvalStatus.toUpperCase()}.${
        assignedEngineerName ? ` Assigned Engineer: ${assignedEngineerName}.` : ''
      }${notes ? ` Comment: "${notes}"` : ''}`,
      type: 'ticket_approval',
      recipient_role: 'all',
      reference_id: ticketId,
    });
  } catch (err) {
    console.error('Exception updating manager approval:', err);
  }
}

/**
 * Uploads media file to Supabase Storage Bucket breakdown-attachments
 */
export async function uploadAttachmentFile(file: File): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `ticket-media/${fileName}`;

  try {
    const { data, error } = await supabase.storage.from('breakdown-attachments').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.warn('Supabase storage upload fallback, using Object URL:', error.message);
      return URL.createObjectURL(file);
    }

    const { data: publicUrlData } = supabase.storage.from('breakdown-attachments').getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Storage exception, fallback to Object URL:', err);
    return URL.createObjectURL(file);
  }
}
