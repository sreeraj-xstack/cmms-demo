import { createClient } from '@/lib/supabase/client';
import { UserProfile, UserRole } from '@/types/auth';

export async function fetchMaintenanceUsers(
  roles: UserRole[] = ['engineer']
): Promise<UserProfile[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, department, avatar_url, created_at')
    .in('role', roles)
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching maintenance users:', error.message);
    return [];
  }

  return (data || []) as UserProfile[];
}
