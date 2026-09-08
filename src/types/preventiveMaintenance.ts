import { Asset } from './asset';
import { WorkProcedure } from './workProcedure';

export type PMRecurrenceType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'custom_days';
export type WorkTypeFilter = 'all' | 'preventive_maintenance' | 'breakdown_repair' | 'inspection' | 'rework';

export interface PMCalendarEvent {
  id: string;
  title: string;
  start_date: string;
  work_type: string;
  status: string;
  asset_id: string;
  asset_name: string;
  assigned_technician_name: string;
  reference_id: string;
}

export interface PMSchedule {
  id: string;
  schedule_number: string;
  title: string;
  description?: string | null;
  asset_id: string;
  asset_name?: string;
  asset_tag?: string;
  asset?: Asset;
  procedure_id?: string | null;
  procedure_title?: string;
  procedure_number?: string;
  procedure?: WorkProcedure | null;
  recurrence_type?: PMRecurrenceType;
  recurrence_interval?: PMRecurrenceType;
  interval_days?: number;
  last_performed_date?: string | null;
  next_due_date: string;
  estimated_duration_minutes?: number;
  assigned_technician_id?: string | null;
  assigned_technician_name?: string | null;
  assigned_shift?: 'morning' | 'afternoon' | 'night' | 'custom';
  is_active?: boolean;
  is_ai_optimized?: boolean;
  ai_risk_score?: number; // 0 to 100
  ai_recommended_interval?: PMRecurrenceType;
  ai_recommended_interval_days?: number | null;
  ai_optimization_rationale?: string | null;
  ai_rationale?: string | null;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePMScheduleInput {
  title: string;
  description?: string;
  asset_id: string;
  procedure_id?: string;
  recurrence_type?: PMRecurrenceType;
  recurrence_interval?: PMRecurrenceType;
  interval_days?: number;
  next_due_date: string;
  estimated_duration_minutes?: number;
  assigned_technician_id?: string;
  assigned_technician_name?: string;
  assigned_shift?: 'morning' | 'afternoon' | 'night' | 'custom';
  is_ai_optimized?: boolean;
  ai_risk_score?: number;
  ai_recommended_interval?: PMRecurrenceType;
  ai_optimization_rationale?: string;
}

export interface PMCalendarFilterState {
  search?: string;
  search_query?: string;
  technician?: string;
  technician_id?: string;
  assetId?: string;
  asset_id?: string;
  workType?: WorkTypeFilter;
  work_type?: WorkTypeFilter;
  viewMode?: 'month' | 'week' | 'day';
  view_mode?: 'month' | 'week' | 'day';
}

export interface AIRiskAnalysis {
  asset_id?: string;
  riskScore?: number;
  failure_risk_score?: number;
  recommendedIntervalDays?: number;
  recommended_recurrence_interval?: PMRecurrenceType;
  rationale?: string;
  ai_rationale?: string;
  breakdownFrequency?: number;
  recentBreakdownsCount?: number;
  recent_breakdowns_count?: number;
  criticality?: string;
}
