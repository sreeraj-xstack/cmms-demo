import { createClient } from '@/lib/supabase/client';
import {
  SparePart,
  CreateSparePartInput,
  SparePartFilterState,
  StockMovement,
  StockMovementType,
} from '@/types/sparePart';

/**
 * Fetches spare parts with multi-factor filtering & sorting
 */
export async function fetchSpareParts(
  filters?: Partial<SparePartFilterState>
): Promise<SparePart[]> {
  const supabase = createClient();

  try {
    let query = supabase.from('spare_parts').select('*');

    if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.trim().toLowerCase();
      query = query.or(
        `name.ilike.%${q}%,part_number.ilike.%${q}%,storage_location.ilike.%${q}%,vendor_name.ilike.%${q}%,compatible_machine_type.ilike.%${q}%`
      );
    }

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.machineType && filters.machineType !== 'all') {
      query = query.ilike('compatible_machine_type', `%${filters.machineType}%`);
    }

    const { data, error } = await query;

    let items: SparePart[] = [];

    if (error) {
      console.error('Error fetching spare parts from database:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    } else {
      items = data as SparePart[];
    }

    // Filter by Stock Alert level
    if (filters?.stockAlert && filters.stockAlert !== 'all') {
      if (filters.stockAlert === 'out_of_stock') {
        items = items.filter((p) => p.quantity_available <= 0);
      } else if (filters.stockAlert === 'low_stock') {
        items = items.filter((p) => p.quantity_available > 0 && p.quantity_available <= p.min_quantity);
      } else if (filters.stockAlert === 'in_stock') {
        items = items.filter((p) => p.quantity_available > p.min_quantity);
      }
    }

    // Apply Sorting
    const sortBy = filters?.sortBy || 'lowest_stock_ratio';
    items.sort((a, b) => {
      if (sortBy === 'lowest_stock_ratio') {
        const ratioA = a.min_quantity > 0 ? a.quantity_available / a.min_quantity : 999;
        const ratioB = b.min_quantity > 0 ? b.quantity_available / b.min_quantity : 999;
        return ratioA - ratioB;
      }
      if (sortBy === 'lead_time') {
        return a.lead_time_days - b.lead_time_days;
      }
      if (sortBy === 'vendor') {
        return a.vendor_name.localeCompare(b.vendor_name);
      }
      if (sortBy === 'unit_cost') {
        return b.unit_cost - a.unit_cost;
      }
      return 0;
    });

    return items;
  } catch (err) {
    console.error('Exception in fetchSpareParts:', err);
    return [];
  }
}

/**
 * Registers a new spare part via RPC or direct insert
 */
export async function createSparePart(input: CreateSparePartInput): Promise<SparePart> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc('rpc_create_spare_part', {
      p_name: input.name,
      p_description: input.description || null,
      p_category: input.category,
      p_compatible_asset_id: input.compatible_asset_id || null,
      p_compatible_machine_type: input.compatible_machine_type || 'General Machinery',
      p_storage_location: input.storage_location || 'Rack A-01',
      p_unit_of_measure: input.unit_of_measure || 'Pcs',
      p_quantity_available: input.quantity_available ?? 0,
      p_min_quantity: input.min_quantity ?? 5,
      p_lead_time_days: input.lead_time_days ?? 7,
      p_unit_cost: input.unit_cost ?? 0.0,
      p_vendor_name: input.vendor_name || 'Sobha Approved Vendor',
      p_vendor_code: input.vendor_code || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data as SparePart;
  } catch (err: any) {
    console.error('Error creating spare part:', err.message || err);
    throw new Error(err.message || 'Unable to create spare part in database.');
  }
}

export async function issueWorkOrderPart(
  workOrderId: string,
  sparePartId: string,
  quantity: number,
  performedBy: string
): Promise<SparePart> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('rpc_issue_work_order_part', {
    p_work_order_id: workOrderId,
    p_spare_part_id: sparePartId,
    p_quantity: quantity,
    p_performed_by: performedBy,
  });

  if (error || !data) {
    throw new Error(error?.message || 'Unable to issue spare part to work order.');
  }

  return data as SparePart;
}

/**
 * Adjusts spare part stock level and logs movement history
 */
export async function adjustSparePartStock(
  partId: string,
  quantityChange: number,
  movementType: StockMovementType,
  notes?: string,
  performedBy?: string
): Promise<SparePart | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc('rpc_adjust_spare_part_stock', {
      p_spare_part_id: partId,
      p_quantity_change: quantityChange,
      p_movement_type: movementType,
      p_performed_by: performedBy || 'Storekeeper',
      p_notes: notes || null,
    });

    if (error) {
      console.warn('RPC stock adjustment failed:', error.message);
    }
    return data as SparePart;
  } catch (err) {
    console.error('Exception adjusting stock:', err);
    return null;
  }
}

/**
 * Fetches stock movement history log for a spare part
 */
export async function fetchStockMovements(partId: string): Promise<StockMovement[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('spare_part_stock_movements')
      .select('*')
      .eq('spare_part_id', partId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as StockMovement[];
  } catch (err) {
    console.error('Exception fetching stock movements:', err);
    return [];
  }
}

/**
 * Fetches compatible spare parts for a specific asset or machine type
 */
export async function fetchSparePartsForAsset(
  assetId?: string,
  machineType?: string
): Promise<SparePart[]> {
  const allParts = await fetchSpareParts();
  return allParts.filter((p) => {
    if (assetId && p.compatible_asset_id === assetId) return true;
    if (
      machineType &&
      (p.compatible_machine_type.toLowerCase().includes(machineType.toLowerCase()) ||
        p.compatible_machine_type === 'General Machinery')
    ) {
      return true;
    }
    return false;
  });
}
