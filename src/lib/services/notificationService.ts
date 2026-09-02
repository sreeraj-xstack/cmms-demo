import { createClient } from '@/lib/supabase/client';
import { AppNotification, NotificationType, RecipientRole } from '@/types/notification';

export async function fetchNotifications(userRole?: string): Promise<AppNotification[]> {
  const supabase = createClient();
  try {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });

    if (userRole && userRole !== 'manager') {
      query = query.or(`recipient_role.eq.${userRole},recipient_role.eq.all`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching notifications:', error.message);
      return [];
    }
    return (data as AppNotification[]) || [];
  } catch (err) {
    console.error('Exception fetching notifications:', err);
    return [];
  }
}

export async function createNotification(input: {
  title: string;
  message: string;
  type: NotificationType;
  recipient_role?: RecipientRole;
  recipient_user_id?: string;
  reference_id?: string;
}): Promise<void> {
  const supabase = createClient();
  try {
    const { error } = await supabase.from('notifications').insert([
      {
        ...input,
        is_read: false,
      },
    ]);

    if (error) {
      console.error('Error creating notification:', error.message);
    }
  } catch (err) {
    console.error('Exception creating notification:', err);
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const supabase = createClient();
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  } catch (err) {
    console.error('Exception marking notification as read:', err);
  }
}

export async function getUnreadCount(userRole?: string): Promise<number> {
  const supabase = createClient();
  try {
    let query = supabase.from('notifications').select('id', { count: 'exact' }).eq('is_read', false);

    if (userRole && userRole !== 'manager') {
      query = query.or(`recipient_role.eq.${userRole},recipient_role.eq.all`);
    }

    const { count, error } = await query;
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}
