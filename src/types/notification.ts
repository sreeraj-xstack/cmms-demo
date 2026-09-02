export type NotificationType = 'major_breakdown' | 'ticket_approval' | 'status_update' | 'work_order';
export type RecipientRole = 'manager' | 'engineer' | 'operator' | 'all';

export interface AppNotification {
  id: string;
  recipient_role?: RecipientRole;
  recipient_user_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}
