import { createClient } from '@/lib/supabase/client';
import {
  SolutionItem,
  SolutionAttachment,
  MachineManual,
  SolutionFiltersState,
  CreateSolutionInput,
} from '@/types/solutionLibrary';
import { BreakdownTicket } from '@/types/breakdownTicket';

/**
 * Fetches solution library entries with joined attachments and filters
 */
export async function fetchSolutions(filters?: Partial<SolutionFiltersState>): Promise<SolutionItem[]> {
  const supabase = createClient();

  try {
    let query = supabase
      .from('solution_library')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.search && filters.search.trim() !== '') {
      const s = filters.search.trim().toLowerCase();
      query = query.or(`title.ilike.%${s}%,problem_symptoms.ilike.%${s}%,resolution_steps.ilike.%${s}%,solution_number.ilike.%${s}%`);
    }

    if (filters?.machineType && filters.machineType !== 'all') {
      query = query.eq('machine_type', filters.machineType);
    }

    if (filters?.issueCategory && filters.issueCategory !== 'all') {
      query = query.eq('issue_category', filters.issueCategory);
    }

    if (filters?.verifiedOnly) {
      query = query.eq('verified_by_manager', true);
    }

    const { data: solutionsData, error } = await query;
    if (error) {
      console.error('Error fetching solution library:', error.message);
      return [];
    }

    if (!solutionsData || solutionsData.length === 0) {
      return [];
    }

    const solutionIds = solutionsData.map((s) => s.id);
    const { data: attachmentsData } = await supabase
      .from('solution_attachments')
      .select('*')
      .in('solution_id', solutionIds);

    const result: SolutionItem[] = solutionsData.map((item: any) => ({
      ...item,
      attachments: (attachmentsData || []).filter((a) => a.solution_id === item.id) as SolutionAttachment[],
    }));

    return result;
  } catch (err) {
    console.error('Exception fetching solutions:', err);
    return [];
  }
}

/**
 * Creates a new standalone solution entry in the central library
 */
export async function createSolution(
  input: CreateSolutionInput,
  userName: string,
  userRole: string,
  userId?: string
): Promise<SolutionItem | null> {
  const supabase = createClient();
  const solutionNumber = `SOL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const payload = {
      solution_number: solutionNumber,
      title: input.title,
      machine_type: input.machine_type,
      issue_category: input.issue_category,
      problem_symptoms: input.problem_symptoms,
      resolution_steps: input.resolution_steps,
      tags: input.tags || [input.machine_type, input.issue_category],
      linked_ticket_id: input.linked_ticket_id || null,
      created_by_user_id: userId || null,
      created_by_name: userName,
      created_by_role: userRole,
      verified_by_manager: userRole === 'manager',
      verified_by_name: userRole === 'manager' ? userName : null,
      success_count: 1,
    };

    const { data: solution, error } = await supabase
      .from('solution_library')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error inserting solution:', error.message);
      throw new Error(error.message);
    }

    // Insert Attachments if provided
    if (input.attachments && input.attachments.length > 0) {
      const attachmentPayloads = input.attachments.map((att) => ({
        solution_id: solution.id,
        file_url: att.file_url,
        file_type: att.file_type,
        file_name: att.file_name,
      }));
      await supabase.from('solution_attachments').insert(attachmentPayloads);
    }

    return solution as SolutionItem;
  } catch (err: any) {
    console.error('Exception creating solution:', err);
    throw err;
  }
}

/**
 * 1-Click Publishes a solution directly from a resolved Breakdown Ticket into the Library
 */
export async function publishSolutionFromTicket(
  ticket: BreakdownTicket,
  resolutionSteps: string,
  userName: string,
  userRole: string
): Promise<SolutionItem | null> {
  const assetTag = ticket.asset_tag || 'AST-N/A';
  return createSolution(
    {
      title: `${ticket.asset_name || 'Machine Asset'} - ${ticket.issue_type} Resolution`,
      machine_type: 'CNC Processing Center', // Defaults or maps from ticket asset
      issue_category: ticket.issue_type,
      problem_symptoms: ticket.description,
      resolution_steps: resolutionSteps,
      tags: [ticket.ticket_number, assetTag, ticket.issue_type],
      linked_ticket_id: ticket.id,
      attachments: ticket.attachments?.map((a) => ({
        file_url: a.file_url,
        file_type: a.file_type,
        file_name: a.file_name,
      })),
    },
    userName,
    userRole
  );
}

/**
 * Upvotes / increments success counter when an engineer verifies the solution worked
 */
export async function incrementSolutionSuccessCount(solutionId: string): Promise<number> {
  const supabase = createClient();
  try {
    const { data: existing } = await supabase
      .from('solution_library')
      .select('success_count')
      .eq('id', solutionId)
      .single();

    const newCount = (existing?.success_count || 0) + 1;

    await supabase
      .from('solution_library')
      .update({ success_count: newCount, updated_at: new Date().toISOString() })
      .eq('id', solutionId);

    return newCount;
  } catch (err) {
    console.error('Exception incrementing success count:', err);
    return 1;
  }
}

/**
 * Marks a solution as verified sign-off by Plant Manager
 */
export async function verifySolutionByManager(solutionId: string, managerName: string): Promise<void> {
  const supabase = createClient();
  try {
    await supabase
      .from('solution_library')
      .update({
        verified_by_manager: true,
        verified_by_name: managerName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', solutionId);
  } catch (err) {
    console.error('Exception verifying solution:', err);
  }
}

/**
 * Fetches OEM machine manuals repository
 */
export async function fetchMachineManuals(machineType?: string): Promise<MachineManual[]> {
  const supabase = createClient();
  try {
    let query = supabase
      .from('machine_manuals')
      .select('*')
      .order('created_at', { ascending: false });

    if (machineType && machineType !== 'all') {
      query = query.eq('machine_type', machineType);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching machine manuals:', error.message);
      return [];
    }
    return (data || []) as MachineManual[];
  } catch (err) {
    console.error('Exception fetching machine manuals:', err);
    return [];
  }
}

/**
 * Uploads OEM Machine Manual PDF to machine-manuals storage bucket
 */
export async function uploadMachineManual(
  file: File,
  title: string,
  machineType: string,
  uploaderName: string
): Promise<MachineManual | null> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `manuals/${fileName}`;
  const manualNumber = `MNL-${Date.now().toString().slice(-6)}`;

  try {
    let publicUrl = '';
    const { data, error } = await supabase.storage.from('machine-manuals').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.warn('Fallback object URL for manual upload:', error.message);
      publicUrl = URL.createObjectURL(file);
    } else {
      const { data: publicUrlData } = supabase.storage.from('machine-manuals').getPublicUrl(data.path);
      publicUrl = publicUrlData.publicUrl;
    }

    const payload = {
      manual_number: manualNumber,
      title: title || file.name,
      machine_type: machineType,
      file_url: publicUrl,
      file_name: file.name,
      extracted_text: `Technical operating manual for ${machineType} (${title}). Troubleshooting guide, maintenance torque specs, and electrical circuit diagrams.`,
      uploaded_by_name: uploaderName,
    };

    const { data: record, error: dbError } = await supabase
      .from('machine_manuals')
      .insert([payload])
      .select()
      .single();

    if (dbError) {
      console.error('Error inserting machine manual record:', dbError.message);
      throw new Error(dbError.message);
    }

    return record as MachineManual;
  } catch (err: any) {
    console.error('Exception uploading machine manual:', err);
    throw err;
  }
}

/**
 * Uploads media attachment file to solution-attachments storage bucket
 */
export async function uploadSolutionMediaFile(file: File): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `solution-media/${fileName}`;

  try {
    const { data, error } = await supabase.storage.from('solution-attachments').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.warn('Fallback object URL for solution media:', error.message);
      return URL.createObjectURL(file);
    }

    const { data: publicUrlData } = supabase.storage.from('solution-attachments').getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Storage exception for solution media, fallback to Object URL:', err);
    return URL.createObjectURL(file);
  }
}
