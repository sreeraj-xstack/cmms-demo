export interface SolutionAttachment {
  id: string;
  solution_id: string;
  file_url: string;
  file_type: 'photo' | 'audio' | 'video';
  file_name: string;
  created_at: string;
}

export interface SolutionItem {
  id: string;
  solution_number: string;
  title: string;
  machine_type: string;
  issue_category: string;
  problem_symptoms: string;
  resolution_steps: string;
  linked_ticket_id?: string | null;
  created_by_user_id?: string | null;
  created_by_name: string;
  created_by_role: 'manager' | 'engineer' | 'operator' | string;
  verified_by_manager: boolean;
  verified_by_name?: string | null;
  success_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  attachments?: SolutionAttachment[];
}

export interface MachineManual {
  id: string;
  manual_number: string;
  title: string;
  machine_type: string;
  file_url: string;
  file_name: string;
  extracted_text?: string | null;
  uploaded_by_name: string;
  created_at: string;
}

export interface AISearchResult {
  id: string;
  title: string;
  source_type: 'solution' | 'manual' | 'historical_ticket';
  confidence_score: number; // Percentage 0 - 100
  machine_type: string;
  issue_category?: string;
  symptoms_or_excerpt: string;
  resolution_steps: string;
  tags: string[];
  // Diagnostic Justification Fields
  matched_error_codes: string[];
  matched_components: string[];
  score_breakdown: {
    errorCodeScore: number;
    componentScore: number;
    machineTypeScore: number;
    verificationBoost: number;
  };
  original_item: SolutionItem | MachineManual | any;
}

export interface SolutionFiltersState {
  search: string;
  machineType: string;
  issueCategory: string;
  verifiedOnly: boolean;
}

export interface CreateSolutionInput {
  title: string;
  machine_type: string;
  issue_category: string;
  problem_symptoms: string;
  resolution_steps: string;
  tags?: string[];
  linked_ticket_id?: string;
  attachments?: {
    file_url: string;
    file_type: 'photo' | 'audio' | 'video';
    file_name: string;
  }[];
}
