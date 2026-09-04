import { Asset } from './asset';
import { BreakdownTicket } from './breakdownTicket';
import { WorkProcedure } from './workProcedure';

export type WorkOrderType = 'breakdown_repair' | 'preventive_maintenance' | 'inspection' | 'rework';
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical';
export type WorkOrderStatus = 'troubleshooting' | 'repairing' | 'waiting_on_sparepart' | 'on_hold' | 'closed';
export type WorkShift = 'morning' | 'afternoon' | 'night' | 'custom';

export interface AssignedTechnician {
  id: string;
  name: string;
  role: string;
}

export interface SparePartItem {
  id: string;
  part_name: string;
  part_number: string;
  quantity: number;
  unit_cost?: number;
}

export interface ToolItem {
  id: string;
  tool_name: string;
  quantity: number;
  status: 'assigned' | 'returned';
}

export interface WorkOrderProcedureStep {
  id: string;
  work_order_id: string;
  step_number: number;
  step_title: string;
  instructions: string;
  is_mandatory: boolean;
  requires_photo_proof: boolean;
  estimated_minutes: number;
  is_completed: boolean;
  completed_at?: string;
  completed_by_name?: string;
  proof_photo_url?: string;
  step_notes?: string;
}

export interface WorkOrderTimeLog {
  id: string;
  work_order_id: string;
  technician_id?: string;
  technician_name: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  activity_type?: string;
  notes?: string;
  created_at: string;
}

export interface WorkOrderAttachment {
  id: string;
  work_order_id: string;
  file_url: string;
  file_type: string;
  file_name: string;
  uploaded_at?: string;
}

export interface WorkOrderHistory {
  id: string;
  work_order_id: string;
  status_from?: string;
  status_to: string;
  action_type: string;
  changed_by_name: string;
  notes?: string;
  created_at: string;
}

export interface WorkOrder {
  id: string;
  work_order_number: string;
  title: string;
  asset_id: string;
  asset?: Asset;
  breakdown_ticket_id?: string;
  breakdown_ticket?: BreakdownTicket;
  procedure_id?: string;
  procedure?: WorkProcedure;
  work_type: WorkOrderType;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  scheduled_start_time: string;
  scheduled_end_time: string;
  scheduled_shift: WorkShift;
  target_duration_minutes: number;
  assigned_technicians: AssignedTechnician[];
  tools_required: ToolItem[];
  spare_parts_required: SparePartItem[];
  is_rework: boolean;
  parent_work_order_id?: string;
  created_by_user_id?: string;
  created_by_name: string;
  closed_at?: string;
  closure_notes?: string;
  created_at: string;
  updated_at: string;
  procedure_steps?: WorkOrderProcedureStep[];
  time_logs?: WorkOrderTimeLog[];
  attachments?: WorkOrderAttachment[];
  history?: WorkOrderHistory[];
}

export interface WorkOrderFiltersState {
  search: string;
  status: string;
  priority: string;
  workType: string;
  assetId: string;
  technician: string;
}

export interface CreateWorkOrderInput {
  title: string;
  asset_id: string;
  breakdown_ticket_id?: string;
  procedure_id?: string;
  work_type: WorkOrderType;
  priority: WorkOrderPriority;
  scheduled_start_time: string;
  scheduled_end_time: string;
  scheduled_shift: WorkShift;
  target_duration_minutes: number;
  assigned_technicians: AssignedTechnician[];
  tools_required: ToolItem[];
  spare_parts_required: SparePartItem[];
  created_by_name: string;
  is_rework?: boolean;
  parent_work_order_id?: string;
}
