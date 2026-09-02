export type AssetStatus = 'operational' | 'standing' | 'maintenance' | 'decommissioned';
export type AssetCriticality = 'low' | 'medium' | 'high' | 'critical';

export interface Asset {
  id: string;
  asset_tag: string;
  name: string;
  machine_type: string;
  model?: string;
  serial_number?: string;
  manufacturer?: string;
  location: string;
  department: string;
  status: AssetStatus;
  criticality: AssetCriticality;
  qr_code: string;
  installation_date?: string;
  warranty_expiry?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssetFiltersState {
  search: string;
  machineType: string;
  status: string;
  criticality: string;
}

export type CreateAssetInput = Omit<Asset, 'id' | 'created_at' | 'updated_at'>;
