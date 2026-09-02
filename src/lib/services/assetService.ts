import { createClient } from '@/lib/supabase/client';
import { Asset, AssetFiltersState, CreateAssetInput } from '@/types/asset';

/**
 * Fetches assets directly from Supabase PostgreSQL public.assets table
 */
export async function fetchAssets(filters?: Partial<AssetFiltersState>): Promise<Asset[]> {
  const supabase = createClient();

  try {
    let query = supabase.from('assets').select('*').order('created_at', { ascending: false });

    if (filters?.search && filters.search.trim() !== '') {
      const s = filters.search.trim().toLowerCase();
      query = query.or(`name.ilike.%${s}%,asset_tag.ilike.%${s}%,serial_number.ilike.%${s}%,location.ilike.%${s}%`);
    }

    if (filters?.machineType && filters.machineType !== 'all') {
      query = query.eq('machine_type', filters.machineType);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.criticality && filters.criticality !== 'all') {
      query = query.eq('criticality', filters.criticality);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error querying Supabase assets table:', error.message);
      return [];
    }

    return (data as Asset[]) || [];
  } catch (err) {
    console.error('Exception fetching assets from Supabase:', err);
    return [];
  }
}

/**
 * Creates a new asset directly in Supabase PostgreSQL public.assets table
 */
export async function createAsset(input: CreateAssetInput): Promise<Asset | null> {
  const supabase = createClient();
  const tag = input.asset_tag.trim();
  
  // Sanitize empty string values for PostgreSQL DATE and optional fields to NULL
  const payload = {
    ...input,
    asset_tag: tag,
    qr_code: input.qr_code || `SOBHA-${tag}`,
    installation_date: input.installation_date && input.installation_date.trim() !== '' ? input.installation_date : null,
    warranty_expiry: input.warranty_expiry && input.warranty_expiry.trim() !== '' ? input.warranty_expiry : null,
    model: input.model && input.model.trim() !== '' ? input.model : null,
    serial_number: input.serial_number && input.serial_number.trim() !== '' ? input.serial_number : null,
  };

  try {
    const { data, error } = await supabase.from('assets').insert([payload]).select().single();
    if (error) {
      console.error('Error inserting asset into Supabase:', error.message);
      throw new Error(error.message);
    }
    return data as Asset;
  } catch (err: any) {
    console.error('Exception creating asset in Supabase:', err.message || err);
    throw err;
  }
}

/**
 * Updates asset operational status directly in Supabase PostgreSQL
 */
export async function updateAssetStatus(id: string, newStatus: Asset['status']): Promise<void> {
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from('assets')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating asset status in Supabase:', error.message);
    }
  } catch (err) {
    console.error('Exception updating asset status:', err);
  }
}

/**
 * Deletes an asset directly from Supabase PostgreSQL
 */
export async function deleteAsset(id: string): Promise<void> {
  const supabase = createClient();
  try {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) {
      console.error('Error deleting asset from Supabase:', error.message);
    }
  } catch (err) {
    console.error('Exception deleting asset:', err);
  }
}
