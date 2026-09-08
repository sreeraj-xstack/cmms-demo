import { Asset } from './asset';
import { WorkProcedure } from './workProcedure';

export type RootCauseCategory = 
  | 'mechanical'
  | 'electrical'
  | 'hydraulic'
  | 'pneumatic'
  | 'operator_error'
  | 'wear_and_tear'
  | 'software_firmware'
  | 'other';

export interface TroubleshootingRCA {
  id: string;
  rca_number: string;
  ticket_id?: string | null;
  work_order_id?: string | null;
  asset_id: string;
  asset_name?: string;
  asset?: Asset;
  problem_statement: string;
  why_1: string;
  why_2?: string | null;
  why_3?: string | null;
  why_4?: string | null;
  why_5_root_cause: string;
  root_cause_category: RootCauseCategory;
  corrective_action: string;
  preventive_action?: string | null;
  linked_procedure_id?: string | null;
  linked_procedure?: WorkProcedure | null;
  linked_solution_id?: string | null;
  ai_hit_rate_score: number;
  feedback_upvotes: number;
  created_by_name: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateRCAInput {
  ticket_id?: string;
  work_order_id?: string;
  asset_id: string;
  problem_statement: string;
  why_1: string;
  why_2?: string;
  why_3?: string;
  why_4?: string;
  why_5_root_cause: string;
  root_cause_category: RootCauseCategory;
  corrective_action: string;
  preventive_action?: string;
  linked_procedure_id?: string;
  publish_to_solution_library?: boolean;
  created_by_name?: string;
}

export interface AIMatchHitRateResult {
  rca_id: string;
  rca_number: string;
  problem_statement: string;
  why_5_root_cause: string;
  corrective_action: string;
  root_cause_category: RootCauseCategory;
  asset_id: string;
  asset_name: string;
  linked_procedure_id?: string | null;
  procedure_title?: string | null;
  hit_rate_score: number; // 0 to 100%
  feedback_upvotes: number;
}

export interface TroubleshootingFilterState {
  search: string;
  category: string;
  assetId: string;
}
