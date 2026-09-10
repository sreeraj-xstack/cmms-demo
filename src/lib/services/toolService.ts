import { createClient } from '@/lib/supabase/client';
import { Tool } from '@/types/tool';

export async function fetchTools(): Promise<Tool[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('status', 'available')
    .gt('quantity_available', 0)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching available tools:', error.message);
    return [];
  }

  return (data || []) as Tool[];
}
