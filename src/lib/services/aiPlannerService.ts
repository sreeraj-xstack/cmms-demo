import { createClient } from '@/lib/supabase/client';
import { WorkShift, AssignedTechnician } from '@/types/workorder';
import { WorkProcedure } from '@/types/workProcedure';

export interface AIPlanRecommendation {
  suggestedStartTime: string;
  suggestedEndTime: string;
  suggestedShift: WorkShift;
  estimatedDurationMinutes: number;
  recommendedTechnicians: AssignedTechnician[];
  conflictWarning?: string;
  reasoning: string[];
}

// Available factory technicians pool
const TECHNICIAN_POOL: (AssignedTechnician & { expertise: string[] })[] = [
  { id: 'tech-1', name: 'Vikram Singh', role: 'Senior Maintenance Engineer', expertise: ['CNC Processing Center', 'Spindle', 'Servo'] },
  { id: 'tech-2', name: 'Rajesh Kumar', role: 'Mechanical Technician', expertise: ['Edgebander', 'Glue Pot', 'Heater'] },
  { id: 'tech-3', name: 'Amit Sharma', role: 'Pneumatics & Hydraulics Specialist', expertise: ['Panel Saw', 'Vacuum', 'Pneumatic'] },
  { id: 'tech-4', name: 'Suresh Patel', role: 'Electrical Specialist', expertise: ['PLC', 'Sensors', 'Boring Machine'] },
];

export async function generateAIPlanRecommendation(
  assetId: string,
  assetName: string,
  machineCategory: string,
  procedure?: WorkProcedure | null
): Promise<AIPlanRecommendation> {
  const supabase = createClient();
  const reasoning: string[] = [];

  // 1. Calculate Duration
  let duration = 60;
  if (procedure && procedure.steps && procedure.steps.length > 0) {
    duration = procedure.steps.reduce((acc, step) => acc + (step.estimated_minutes || 10), 0);
    reasoning.push(`Estimated duration set to ${duration} mins based on ${procedure.steps.length} SOP checklist steps in "${procedure.title}".`);
  } else {
    duration = 45;
    reasoning.push(`Standard diagnostic duration of 45 mins allocated for ${machineCategory} repair.`);
  }

  // 2. Fetch existing active Work Orders for this asset to prevent overlapping time slot
  const { data: existingWos } = await supabase
    .from('work_orders')
    .select('scheduled_start_time, scheduled_end_time, status')
    .eq('asset_id', assetId)
    .neq('status', 'closed');

  const now = new Date();
  let proposedStart = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins from now
  // Round to nearest 15 mins
  proposedStart.setMinutes(Math.ceil(proposedStart.getMinutes() / 15) * 15, 0, 0);

  let conflictFound = false;
  if (existingWos && existingWos.length > 0) {
    for (const wo of existingWos) {
      const woStart = new Date(wo.scheduled_start_time);
      const woEnd = new Date(wo.scheduled_end_time);
      if (proposedStart >= woStart && proposedStart < woEnd) {
        // Shift start time to after existing WO finishes
        proposedStart = new Date(woEnd.getTime() + 15 * 60 * 1000);
        conflictFound = true;
      }
    }
  }

  const proposedEnd = new Date(proposedStart.getTime() + duration * 60 * 1000);

  if (conflictFound) {
    reasoning.push(`Adjusted time slot to avoid active scheduled maintenance window on ${assetName}.`);
  } else {
    reasoning.push(`Optimal immediate maintenance window available on ${assetName}.`);
  }

  // Determine shift
  const hour = proposedStart.getHours();
  let shift: WorkShift = 'morning';
  if (hour >= 6 && hour < 14) shift = 'morning';
  else if (hour >= 14 && hour < 22) shift = 'afternoon';
  else shift = 'night';

  reasoning.push(`Selected ${shift.toUpperCase()} production shift window (${proposedStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`);

  // 3. Match Technicians by expertise
  const matchedTechs = TECHNICIAN_POOL.filter((t) =>
    t.expertise.some((exp) => machineCategory.toLowerCase().includes(exp.toLowerCase()))
  );

  const finalTechs = matchedTechs.length > 0 ? matchedTechs : [TECHNICIAN_POOL[0]];
  const recommendedTechs: AssignedTechnician[] = finalTechs.slice(0, 2).map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
  }));

  reasoning.push(
    `Recommended lead technician ${recommendedTechs[0].name} (${recommendedTechs[0].role}) based on category match: "${machineCategory}".`
  );

  return {
    suggestedStartTime: proposedStart.toISOString().slice(0, 16), // YYYY-MM-THH:mm format for datetime-local input
    suggestedEndTime: proposedEnd.toISOString().slice(0, 16),
    suggestedShift: shift,
    estimatedDurationMinutes: duration,
    recommendedTechnicians: recommendedTechs,
    conflictWarning: conflictFound ? `Asset ${assetName} has prior active bookings. Time slot automatically shifted.` : undefined,
    reasoning,
  };
}
