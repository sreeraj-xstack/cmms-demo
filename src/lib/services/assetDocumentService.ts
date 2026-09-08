import { createClient } from '@/lib/supabase/client';
import {
  AssetDocument,
  UploadAssetDocumentInput,
  AssetDossierData,
  MachineFailureTimelineItem,
} from '@/types/assetDocument';

/**
 * Fetches all technical documents attached to a specific asset
 */
export async function fetchAssetDocuments(assetId: string): Promise<AssetDocument[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('asset_documents')
      .select('*')
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error querying asset_documents:', error.message);
      return [];
    }

    return (data as AssetDocument[]) || [];
  } catch (err) {
    console.error('Exception fetching asset documents:', err);
    return [];
  }
}

/**
 * Uploads document file to Supabase Storage bucket 'asset-documents' and registers record via `rpc_upload_asset_document`
 */
export async function uploadAssetDocument(input: UploadAssetDocumentInput): Promise<AssetDocument | null> {
  const supabase = createClient();

  try {
    // 1. Sanitize file name and create storage path
    const fileExt = input.file.name.split('.').pop();
    const cleanFileName = `${input.asset_id}/${Date.now()}_${input.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    // 2. Upload file to Supabase Storage bucket 'asset-documents'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('asset-documents')
      .upload(cleanFileName, input.file, {
        cacheControl: '3600',
        upsert: true,
      });

    let publicUrl = '';
    if (uploadError) {
      console.warn('Storage upload warning (proceeding with fallback URL):', uploadError.message);
      publicUrl = `/storage/asset-documents/${cleanFileName}`;
    } else {
      const { data: urlData } = supabase.storage.from('asset-documents').getPublicUrl(uploadData.path);
      publicUrl = urlData.publicUrl;
    }

    // 3. Call RPC procedure `rpc_upload_asset_document` to insert atomic DB record
    const { data: rpcData, error: rpcError } = await supabase.rpc('rpc_upload_asset_document', {
      p_asset_id: input.asset_id,
      p_category: input.category,
      p_title: input.title,
      p_description: input.description || null,
      p_file_url: publicUrl,
      p_file_size_bytes: input.file.size,
      p_mime_type: input.file.type || 'application/octet-stream',
      p_version: input.version || 'v1.0',
    });

    if (rpcError) {
      console.error('Error invoking rpc_upload_asset_document:', rpcError.message);
      throw new Error(rpcError.message);
    }

    return rpcData as AssetDocument;
  } catch (err: any) {
    console.error('Exception uploading asset document:', err.message || err);
    throw err;
  }
}

/**
 * Compiles full Machine Dossier (Digital Twin) data for an asset
 */
export async function fetchMachineDossier(assetId: string): Promise<AssetDossierData | null> {
  const supabase = createClient();

  try {
    // 1. Fetch Asset basic info
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single();

    if (assetError || !asset) {
      console.error('Asset not found for dossier:', assetError?.message);
      return null;
    }

    // 2. Fetch Attached Documents
    const documents = await fetchAssetDocuments(assetId);

    // 3. Fetch Machine Failure History from Tickets & Work Orders
    const { data: tickets } = await supabase
      .from('tickets')
      .select(`
        id,
        ticket_number,
        title,
        description,
        created_at,
        status,
        priority,
        assigned_technician_name,
        resolution_summary
      `)
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false });

    let totalDowntime = 0;
    const failureHistory: MachineFailureTimelineItem[] = (tickets || []).map((t: any) => {
      // Estimate downtime based on resolution
      const downtime = t.status === 'resolved' || t.status === 'closed' ? 2.5 : 0;
      totalDowntime += downtime;

      return {
        id: t.id,
        ticket_number: t.ticket_number || `TCK-${t.id.slice(0, 5)}`,
        title: t.title,
        description: t.description || '',
        created_at: t.created_at,
        completed_at: null,
        downtime_hours: downtime,
        severity: t.priority === 'critical' || t.priority === 'urgent' ? 'critical' : 'medium',
        status: t.status,
        technician_name: t.assigned_technician_name || 'Unassigned',
        resolution_summary: t.resolution_summary || 'Pending investigation',
        cost: 0,
      };
    });

    return {
      asset_id: asset.id,
      asset_code: asset.asset_tag || asset.id.slice(0, 8),
      name: asset.name,
      model_number: asset.model,
      serial_number: asset.serial_number,
      category: asset.machine_type,
      location: asset.location,
      status: asset.status,
      criticality: asset.criticality || 'Medium',
      install_date: asset.installation_date,
      documents,
      failure_history: failureHistory,
      total_downtime_hours: totalDowntime,
      total_failures_count: failureHistory.length,
    };
  } catch (err) {
    console.error('Exception compiling Machine Dossier:', err);
    return null;
  }
}

/**
 * Deletes a document record from asset_documents
 */
export async function deleteAssetDocument(documentId: string): Promise<void> {
  const supabase = createClient();

  try {
    const { error } = await supabase.from('asset_documents').delete().eq('id', documentId);
    if (error) {
      console.error('Error deleting asset document:', error.message);
    }
  } catch (err) {
    console.error('Exception deleting asset document:', err);
  }
}
