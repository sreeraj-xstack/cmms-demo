import { createClient } from '@/lib/supabase/client';
import { WorkProcedure, CreateProcedureInput } from '@/types/workProcedure';

export async function getWorkProcedures(categoryFilter?: string): Promise<WorkProcedure[]> {
  const supabase = createClient();
  let query = supabase
    .from('work_procedures')
    .select(`
      *,
      steps:work_procedure_steps(*)
    `)
    .order('created_at', { ascending: false });

  if (categoryFilter && categoryFilter !== 'all') {
    query = query.eq('machine_category', categoryFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching work procedures:', error);
    return [];
  }

  return (data || []).map((p: any) => ({
    ...p,
    steps: (p.steps || []).sort((a: any, b: any) => a.step_number - b.step_number),
  }));
}

export async function getWorkProcedureById(id: string): Promise<WorkProcedure | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('work_procedures')
    .select(`
      *,
      steps:work_procedure_steps(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    steps: (data.steps || []).sort((a: any, b: any) => a.step_number - b.step_number),
  };
}

export async function createWorkProcedure(input: CreateProcedureInput): Promise<WorkProcedure> {
  const supabase = createClient();

  // Generate procedure number SOP-2026-XXX
  const randomNum = Math.floor(100 + Math.random() * 900);
  const procedure_number = `SOP-2026-${randomNum}`;

  const total_estimated_minutes = input.steps.reduce(
    (acc, step) => acc + (step.estimated_minutes || 0),
    0
  );

  const { data: proc, error: procError } = await supabase
    .from('work_procedures')
    .insert({
      procedure_number,
      title: input.title,
      machine_category: input.machine_category,
      description: input.description,
      safety_ppe_notes: input.safety_ppe_notes || null,
      total_estimated_minutes,
      created_by_name: input.created_by_name,
    })
    .select()
    .single();

  if (procError || !proc) {
    throw new Error(`Failed to create work procedure: ${procError?.message}`);
  }

  if (input.steps && input.steps.length > 0) {
    const stepsToInsert = input.steps.map((s, idx) => ({
      procedure_id: proc.id,
      step_number: idx + 1,
      step_title: s.step_title,
      instructions: s.instructions,
      is_mandatory: s.is_mandatory,
      requires_photo_proof: s.requires_photo_proof,
      estimated_minutes: s.estimated_minutes || 10,
      reference_image_url: s.reference_image_url || null,
    }));

    const { error: stepsError } = await supabase
      .from('work_procedure_steps')
      .insert(stepsToInsert);

    if (stepsError) {
      console.error('Error inserting steps:', stepsError);
    }
  }

  return getWorkProcedureById(proc.id) as Promise<WorkProcedure>;
}
