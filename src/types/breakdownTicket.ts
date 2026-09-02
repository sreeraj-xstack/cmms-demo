export type BreakdownCategory = 'major' | 'minor';
export type TicketUrgency = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus =
  | 'reported'
  | 'standing'
  | 'diagnosed'
  | 'waiting_spares'
  | 'ready_to_fix'
  | 'fixed'
  | 'closed'
  | 'rejected';

export type ManagerApprovalStatus = 'pending' | 'approved' | 'rejected';
export type AttachmentFileType = 'photo' | 'audio' | 'video';
export type CommentType = 'general' | 'status_change' | 'manager_note' | 'diagnosis';

export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id?: string;
  user_name: string;
  user_role: string;
  comment_type: CommentType;
  comment_text: string;
  created_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_url: string;
  file_type: AttachmentFileType;
  file_name: string;
  file_size_bytes?: number;
  uploaded_at?: string;
}

export interface TicketHistory {
  id: string;
  ticket_id: string;
  status_from?: string;
  status_to: string;
  changed_by_user_id?: string;
  changed_by_name: string;
  notes?: string;
  created_at: string;
}

export interface BreakdownTicket {
  id: string;
  ticket_number: string;
  asset_id: string;
  asset_name?: string;
  asset_tag?: string;
  asset_location?: string;
  issue_type: string;
  breakdown_category: BreakdownCategory;
  urgency_level: TicketUrgency;
  status: TicketStatus;
  description: string;
  reported_by?: string;
  reported_by_name: string;
  assigned_engineer_id?: string;
  assigned_engineer_name?: string;
  manager_approval_status: ManagerApprovalStatus;
  manager_notes?: string;
  work_order_id?: string;
  created_at: string;
  updated_at: string;
  attachments?: TicketAttachment[];
  history?: TicketHistory[];
  comments?: TicketComment[];
}

export interface TicketFiltersState {
  search: string;
  category: string;
  status: string;
  urgency: string;
  approvalStatus: string;
}

export type CreateTicketInput = {
  asset_id: string;
  issue_type: string;
  breakdown_category: BreakdownCategory;
  urgency_level: TicketUrgency;
  description: string;
  reported_by_name: string;
  reported_by?: string;
  attachments?: {
    file_url: string;
    file_type: AttachmentFileType;
    file_name: string;
  }[];
};
