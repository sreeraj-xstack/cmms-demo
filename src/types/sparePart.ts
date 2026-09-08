export type SparePartCategory =
  | 'mechanical'
  | 'electrical'
  | 'pneumatic'
  | 'hydraulic'
  | 'bearings'
  | 'fasteners'
  | 'drives_motors'
  | 'consumables'
  | 'other';

export type UnitOfMeasure = 'Pcs' | 'Set' | 'Meters' | 'Liters' | 'Kg' | 'Boxes';

export type StockMovementType = 'inbound_receipt' | 'outbound_workorder' | 'manual_adjustment' | 'return';

export interface SparePart {
  id: string;
  part_number: string;
  name: string;
  description?: string | null;
  category: SparePartCategory;
  compatible_asset_id?: string | null;
  compatible_machine_type: string;
  storage_location: string;
  unit_of_measure: UnitOfMeasure;
  quantity_available: number;
  min_quantity: number;
  lead_time_days: number;
  unit_cost: number;
  vendor_name: string;
  vendor_code?: string | null;
  qr_code?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  spare_part_id: string;
  movement_type: StockMovementType;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reference_work_order_id?: string | null;
  performed_by_name: string;
  notes?: string | null;
  created_at: string;
}

export interface CreateSparePartInput {
  name: string;
  description?: string;
  category: SparePartCategory;
  compatible_asset_id?: string | null;
  compatible_machine_type?: string;
  storage_location?: string;
  unit_of_measure?: UnitOfMeasure;
  quantity_available?: number;
  min_quantity?: number;
  lead_time_days?: number;
  unit_cost?: number;
  vendor_name?: string;
  vendor_code?: string;
}

export type StockAlertLevel = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
export type SparePartSortOption = 'lowest_stock_ratio' | 'lead_time' | 'vendor' | 'unit_cost';

export interface SparePartFilterState {
  searchQuery: string;
  category: string;
  stockAlert: StockAlertLevel;
  machineType: string;
  sortBy: SparePartSortOption;
}
