export type ToolCategory =
  | 'saw_blades'
  | 'router_bits'
  | 'drill_bits'
  | 'milling_cutters'
  | 'shaper_cutters'
  | 'carbide_inserts'
  | 'adapters_collets'
  | 'hand_powertools'
  | 'measuring_gauges'
  | 'other';

export type ToolStatus =
  | 'available'
  | 'on_machine'
  | 'dull'
  | 'out_for_sharpening'
  | 'received'
  | 'broken_scrapped';

export type ERPSyncStatus = 'synced' | 'pending_pr' | 'pr_issued';

export interface Tool {
  id: string;
  tool_number: string;
  name: string;
  description?: string | null;
  category: ToolCategory;
  compatible_asset_id?: string | null;
  compatible_machine_type: string;
  storage_location: string;
  adapter_code?: string | null;
  serial_number?: string | null;
  tool_type_spec?: string | null;
  diameter_mm?: number | null;
  length_mm?: number | null;
  bore_mm?: number | null;
  teeth_count?: number | null;
  quantity_available: number;
  min_quantity: number;
  lead_time_days: number;
  unit_cost: number;
  status: ToolStatus;
  sharpening_cycles_completed: number;
  max_sharpening_cycles: number;
  can_be_sharpened: boolean;
  running_hours: number;
  cutting_meters: number;
  max_meters_per_cycle: number;
  vendor_name: string;
  erp_pr_number?: string | null;
  erp_sync_status: ERPSyncStatus;
  qr_code?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolSharpeningLog {
  id: string;
  tool_id: string;
  event_type: 'sent_for_sharpening' | 'received_from_sharpening' | 'meters_logged' | 'adapter_attached' | 'scrapped';
  running_meters_at_event: number;
  sharpening_cycle_index: number;
  grinding_vendor?: string | null;
  performed_by: string;
  notes?: string | null;
  created_at: string;
}

export interface CreateToolInput {
  name: string;
  description?: string;
  category: ToolCategory;
  compatible_machine_type?: string;
  storage_location?: string;
  adapter_code?: string;
  serial_number?: string;
  tool_type_spec?: string;
  diameter_mm?: number;
  length_mm?: number;
  bore_mm?: number;
  teeth_count?: number;
  quantity_available?: number;
  min_quantity?: number;
  lead_time_days?: number;
  unit_cost?: number;
  max_sharpening_cycles?: number;
  max_meters_per_cycle?: number;
  vendor_name?: string;
}

export interface ToolFilterState {
  searchQuery: string;
  category: string;
  status: string;
  machineType: string;
  adapterCode: string;
}
