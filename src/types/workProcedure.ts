export interface WorkProcedureStep {
  id: string;
  procedure_id: string;
  step_number: number;
  step_title: string;
  instructions: string;
  is_mandatory: boolean;
  requires_photo_proof: boolean;
  estimated_minutes: number;
  reference_image_url?: string;
  created_at?: string;
}

export interface WorkProcedure {
  id: string;
  procedure_number: string;
  title: string;
  machine_category: string;
  description: string;
  safety_ppe_notes?: string;
  total_estimated_minutes: number;
  created_by_user_id?: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  steps?: WorkProcedureStep[];
}

export interface CreateStepInput {
  step_number: number;
  step_title: string;
  instructions: string;
  is_mandatory: boolean;
  requires_photo_proof: boolean;
  estimated_minutes: number;
  reference_image_url?: string;
}

export interface CreateProcedureInput {
  title: string;
  machine_category: string;
  description: string;
  safety_ppe_notes?: string;
  created_by_name: string;
  steps: CreateStepInput[];
}
