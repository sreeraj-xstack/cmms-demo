export type ToolStatus = 'available' | 'assigned' | 'on_machine' | 'out_for_sharpening' | 'dull' | 'broken';

export interface Tool {
  id: string;
  tool_number: string;
  name: string;
  category: string;
  compatible_machine_type?: string | null;
  storage_location: string;
  quantity_available: number;
  status: ToolStatus;
  created_at?: string;
  updated_at?: string;
}
