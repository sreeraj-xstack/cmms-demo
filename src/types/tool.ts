export type ToolCategory =
  | 'milling_cutter'
  | 'saw_blade'
  | 'saw_blades'
  | 'drill_bit'
  | 'router_bit'
  | 'router_bits'
  | 'planer_knife'
  | 'insert'
  | 'collet'
  | 'other';

export type ToolStatus =
  | 'available'
  | 'assigned'
  | 'on_machine'
  | 'out_for_sharpening'
  | 'dull'
  | 'broken'
  | 'scrapped'
  | 'received'
  | 'broken_scrapped';

export interface Tool {
  id: string;
  tool_number: string;
  serial_number?: string | null;
  name: string;
  description?: string | null;
  category: ToolCategory | string;
  adapter_code?: string | null;
  diameter_mm?: number | null;
  length_mm?: number | null;
  bore_mm?: number | null;
  teeth_count?: number | null;
  cutting_meters?: number | null;
  running_hours?: number | null;
  max_meters_per_cycle?: number | null;
  sharpening_cycles_completed?: number | null;
  max_sharpening_cycles?: number | null;
  can_be_sharpened?: boolean;
  storage_location: string;
  compatible_machine_type?: string | null;
  quantity_available: number;
  min_quantity: number;
  lead_time_days?: number;
  unit_cost?: number;
  vendor_name?: string | null;
  erp_pr_number?: string | null;
  erp_sync_status?: string | null;
  qr_code?: string | null;
  status: ToolStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateToolInput {
  name: string;
  description?: string;
  category: ToolCategory | string;
  serial_number?: string;
  adapter_code?: string;
  tool_type_spec?: string;
  diameter_mm?: number;
  length_mm?: number;
  bore_mm?: number;
  teeth_count?: number;
  max_meters_per_cycle?: number;
  max_sharpening_cycles?: number;
  can_be_sharpened?: boolean;
  storage_location: string;
  compatible_machine_type?: string;
  quantity_available: number;
  min_quantity: number;
  lead_time_days?: number;
  unit_cost?: number;
  vendor_name?: string;
  notes?: string;
}

export interface ToolSharpeningLog {
  id: string;
  tool_id: string;
  cycle_number: number;
  event_type?: string;
  sent_date: string;
  returned_date?: string | null;
  sharpened_by_vendor?: string | null;
  performed_by?: string;
  cutting_meters_before?: number;
  running_meters_at_event?: number;
  notes?: string | null;
  created_at?: string;
}

export interface ToolFilterState {
  searchQuery: string;
  category: string;
  status: string;
  machineType: string;
  adapterCode?: string;
  sortBy?: 'meters' | 'sharpening' | 'name' | 'tool_number';
}
