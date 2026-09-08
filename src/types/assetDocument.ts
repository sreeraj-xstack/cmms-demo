export type DocumentCategory = 
  | 'manual'
  | 'electrical_plan'
  | 'hydraulic_plan'
  | 'photo'
  | 'failure_report'
  | 'compliance_doc';

export interface AssetDocument {
  id: string;
  document_number: string;
  asset_id: string;
  category: DocumentCategory;
  title: string;
  description?: string | null;
  file_url: string;
  file_size_bytes?: number | null;
  mime_type?: string | null;
  version?: string | null;
  uploaded_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UploadAssetDocumentInput {
  asset_id: string;
  category: DocumentCategory;
  title: string;
  description?: string;
  file: File;
  version?: string;
}

export interface MachineFailureTimelineItem {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  created_at: string;
  completed_at?: string | null;
  downtime_hours?: number | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  technician_name?: string | null;
  resolution_summary?: string | null;
  cost?: number | null;
}

export interface AssetDossierData {
  asset_id: string;
  asset_code: string;
  name: string;
  model_number?: string | null;
  serial_number?: string | null;
  category?: string | null;
  location?: string | null;
  status: string;
  criticality: string;
  install_date?: string | null;
  documents: AssetDocument[];
  failure_history: MachineFailureTimelineItem[];
  total_downtime_hours: number;
  total_failures_count: number;
}
