import { createClient } from '@/lib/supabase/client';
import { Tool, CreateToolInput, ToolFilterState, ToolSharpeningLog } from '@/types/tool';
import { generateQRPayload } from '@/lib/utils/qrUtils';

// Fallback seed dataset for local offline development
const MOCK_TOOLS: Tool[] = [
  {
    id: 'mock-tool-1',
    tool_number: 'TL-2026-1001',
    name: 'Homag Main Saw Blade 300x30 Z72',
    description: 'Carbide tipped main scoring saw blade for Homag Panel Saw',
    category: 'saw_blades',
    compatible_machine_type: 'CNC Panel Saw',
    storage_location: 'Tool Crib Rack T-01 / Bin 04',
    adapter_code: 'ADP-5012',
    serial_number: 'SN-HW-9901',
    tool_type_spec: 'Carbide Tipped (HW)',
    diameter_mm: 300,
    length_mm: 3.2,
    bore_mm: 30,
    teeth_count: 72,
    quantity_available: 3,
    min_quantity: 2,
    lead_time_days: 7,
    unit_cost: 8500,
    status: 'available',
    sharpening_cycles_completed: 1,
    max_sharpening_cycles: 6,
    can_be_sharpened: true,
    running_hours: 120.5,
    cutting_meters: 2450,
    max_meters_per_cycle: 6000,
    vendor_name: 'Leitz Tooling India',
    erp_pr_number: null,
    erp_sync_status: 'synced',
    qr_code: 'QR-TL-2026-1001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-tool-2',
    tool_number: 'TL-2026-1002',
    name: 'Leitz Router Bit Diamond PCD 12mm',
    description: 'High speed polycrystalline diamond nesting router bit Z2+2',
    category: 'router_bits',
    compatible_machine_type: 'CNC Milling Machine',
    storage_location: 'Tool Crib Rack T-02 / Bin 12',
    adapter_code: 'ADP-5015',
    serial_number: 'SN-PCD-4421',
    tool_type_spec: 'PCD Diamond',
    diameter_mm: 12,
    length_mm: 35,
    bore_mm: 12,
    teeth_count: 4,
    quantity_available: 1,
    min_quantity: 2,
    lead_time_days: 14,
    unit_cost: 18500,
    status: 'dull',
    sharpening_cycles_completed: 4,
    max_sharpening_cycles: 5,
    can_be_sharpened: true,
    running_hours: 210,
    cutting_meters: 5020,
    max_meters_per_cycle: 5000,
    vendor_name: 'Leitz Tooling India',
    erp_pr_number: 'ERP-PR-2026-8802',
    erp_sync_status: 'pr_issued',
    qr_code: 'QR-TL-2026-1002',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-tool-3',
    tool_number: 'TL-2026-1003',
    name: 'HSS Dowel Drill Bit 8mm Right Turn',
    description: 'Hardened high speed steel blind hole drill bit for cabinet doweling',
    category: 'drill_bits',
    compatible_machine_type: 'Multi-Boring Machine',
    storage_location: 'Tool Crib Rack T-01 / Bin 18',
    adapter_code: 'ADP-5020',
    serial_number: 'SN-DR-1102',
    tool_type_spec: 'High Speed Steel',
    diameter_mm: 8,
    length_mm: 70,
    bore_mm: 10,
    teeth_count: 2,
    quantity_available: 12,
    min_quantity: 5,
    lead_time_days: 3,
    unit_cost: 650,
    status: 'on_machine',
    sharpening_cycles_completed: 2,
    max_sharpening_cycles: 8,
    can_be_sharpened: true,
    running_hours: 45,
    cutting_meters: 1800,
    max_meters_per_cycle: 4000,
    vendor_name: 'Guhring Cutting Tools',
    erp_pr_number: null,
    erp_sync_status: 'synced',
    qr_code: 'QR-TL-2026-1003',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-tool-4',
    tool_number: 'TL-2026-1004',
    name: 'Shaper Cutter Head 120mm Profile A',
    description: 'Aluminum alloy cutterhead with reversible carbide profiling knives',
    category: 'shaper_cutters',
    compatible_machine_type: 'Spindle Moulder / Shaper',
    storage_location: 'Tool Crib Rack T-03 / Shelf B',
    adapter_code: 'ADP-5024',
    serial_number: 'SN-SHP-302',
    tool_type_spec: 'Carbide Knife Inserts',
    diameter_mm: 120,
    length_mm: 50,
    bore_mm: 40,
    teeth_count: 4,
    quantity_available: 2,
    min_quantity: 1,
    lead_time_days: 10,
    unit_cost: 24500,
    status: 'out_for_sharpening',
    sharpening_cycles_completed: 3,
    max_sharpening_cycles: 5,
    can_be_sharpened: true,
    running_hours: 180,
    cutting_meters: 4900,
    max_meters_per_cycle: 5000,
    vendor_name: 'Freud Industrial Tools',
    erp_pr_number: null,
    erp_sync_status: 'synced',
    qr_code: 'QR-TL-2026-1004',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-tool-5',
    tool_number: 'TL-2026-1005',
    name: 'Solid Carbide End Mill 16mm 4-Flute',
    description: 'Micrograin solid carbide end mill for heavy slot milling',
    category: 'milling_cutters',
    compatible_machine_type: 'CNC Processing Center',
    storage_location: 'Tool Crib Rack T-02 / Bin 08',
    adapter_code: 'ADP-5030',
    serial_number: 'SN-EM-8840',
    tool_type_spec: 'Solid Carbide',
    diameter_mm: 16,
    length_mm: 90,
    bore_mm: 16,
    teeth_count: 4,
    quantity_available: 0,
    min_quantity: 2,
    lead_time_days: 5,
    unit_cost: 4200,
    status: 'broken_scrapped',
    sharpening_cycles_completed: 5,
    max_sharpening_cycles: 5,
    can_be_sharpened: false,
    running_hours: 310,
    cutting_meters: 6200,
    max_meters_per_cycle: 5000,
    vendor_name: 'Sandvik Coromant',
    erp_pr_number: 'ERP-PR-2026-9901',
    erp_sync_status: 'pr_issued',
    qr_code: 'QR-TL-2026-1005',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Fetches tool inventory with multi-factor filtering & adapter code resolution
 */
export async function fetchTools(filters?: Partial<ToolFilterState>): Promise<Tool[]> {
  const supabase = createClient();

  try {
    let query = supabase.from('tools').select('*');

    if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.trim().toLowerCase();
      query = query.or(
        `name.ilike.%${q}%,tool_number.ilike.%${q}%,adapter_code.ilike.%${q}%,storage_location.ilike.%${q}%,serial_number.ilike.%${q}%`
      );
    }

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.machineType && filters.machineType !== 'all') {
      query = query.ilike('compatible_machine_type', `%${filters.machineType}%`);
    }

    if (filters?.adapterCode && filters.adapterCode.trim() !== '') {
      query = query.ilike('adapter_code', `%${filters.adapterCode.trim()}%`);
    }

    const { data, error } = await query;

    let items: Tool[] = [];

    if (error || !data || data.length === 0) {
      items = [...MOCK_TOOLS];

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        items = items.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.tool_number.toLowerCase().includes(q) ||
            (t.adapter_code && t.adapter_code.toLowerCase().includes(q)) ||
            (t.serial_number && t.serial_number.toLowerCase().includes(q)) ||
            t.storage_location.toLowerCase().includes(q)
        );
      }

      if (filters?.category && filters.category !== 'all') {
        items = items.filter((t) => t.category === filters.category);
      }

      if (filters?.status && filters.status !== 'all') {
        items = items.filter((t) => t.status === filters.status);
      }

      if (filters?.machineType && filters.machineType !== 'all') {
        items = items.filter((t) =>
          t.compatible_machine_type.toLowerCase().includes(filters.machineType!.toLowerCase())
        );
      }

      if (filters?.adapterCode && filters.adapterCode.trim() !== '') {
        const ac = filters.adapterCode.trim().toLowerCase();
        items = items.filter((t) => t.adapter_code && t.adapter_code.toLowerCase().includes(ac));
      }
    } else {
      items = data as Tool[];
    }

    return items;
  } catch (err) {
    console.error('Exception fetching tools:', err);
    return MOCK_TOOLS;
  }
}

/**
 * Registers a new cutting tool via RPC or fallback insert
 */
export async function createTool(input: CreateToolInput): Promise<Tool> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc('rpc_create_tool', {
      p_name: input.name,
      p_description: input.description || null,
      p_category: input.category,
      p_compatible_machine_type: input.compatible_machine_type || 'General Machinery',
      p_storage_location: input.storage_location || 'Tool Crib Rack T-01',
      p_adapter_code: input.adapter_code || null,
      p_serial_number: input.serial_number || null,
      p_tool_type_spec: input.tool_type_spec || 'Carbide Tipped',
      p_diameter_mm: input.diameter_mm || null,
      p_length_mm: input.length_mm || null,
      p_bore_mm: input.bore_mm || null,
      p_teeth_count: input.teeth_count || null,
      p_quantity_available: input.quantity_available ?? 1,
      p_min_quantity: input.min_quantity ?? 2,
      p_lead_time_days: input.lead_time_days ?? 7,
      p_unit_cost: input.unit_cost ?? 0.0,
      p_max_sharpening_cycles: input.max_sharpening_cycles ?? 5,
      p_max_meters_per_cycle: input.max_meters_per_cycle ?? 5000,
      p_vendor_name: input.vendor_name || 'Leitz Tooling India',
    });

    if (error) {
      console.warn('RPC rpc_create_tool failed, inserting fallback:', error.message);
      const generatedCode = 'TL-2026-' + Math.floor(1000 + Math.random() * 9000);
      const qrPayload = generateQRPayload('tool', {
        tool_number: generatedCode,
        name: input.name,
        storage_location: input.storage_location || 'Tool Crib Rack T-01',
        category: input.category,
        adapter_code: input.adapter_code || undefined,
      });

      const { data: fallback, error: fallbackError } = await supabase
        .from('tools')
        .insert([
          {
            tool_number: generatedCode,
            name: input.name,
            description: input.description,
            category: input.category,
            compatible_machine_type: input.compatible_machine_type || 'General Machinery',
            storage_location: input.storage_location || 'Tool Crib Rack T-01',
            adapter_code: input.adapter_code,
            serial_number: input.serial_number,
            tool_type_spec: input.tool_type_spec || 'Carbide Tipped',
            diameter_mm: input.diameter_mm,
            length_mm: input.length_mm,
            bore_mm: input.bore_mm,
            teeth_count: input.teeth_count,
            quantity_available: input.quantity_available ?? 1,
            min_quantity: input.min_quantity ?? 2,
            lead_time_days: input.lead_time_days ?? 7,
            unit_cost: input.unit_cost ?? 0,
            max_sharpening_cycles: input.max_sharpening_cycles ?? 5,
            max_meters_per_cycle: input.max_meters_per_cycle ?? 5000,
            vendor_name: input.vendor_name || 'Leitz Tooling India',
            qr_code: qrPayload,
          },
        ])
        .select()
        .single();

      if (fallbackError) throw new Error(fallbackError.message);
      return fallback as Tool;
    }

    return data as Tool;
  } catch (err: any) {
    console.error('Error creating tool:', err);
    const generatedCode = 'TL-2026-' + Math.floor(1000 + Math.random() * 9000);
    const qrPayload = generateQRPayload('tool', {
      tool_number: generatedCode,
      name: input.name,
      storage_location: input.storage_location || 'Tool Crib Rack T-01',
      category: input.category,
      adapter_code: input.adapter_code || undefined,
    });

    return {
      id: 'tool-' + Date.now(),
      tool_number: generatedCode,
      name: input.name,
      description: input.description || null,
      category: input.category,
      compatible_machine_type: input.compatible_machine_type || 'General Machinery',
      storage_location: input.storage_location || 'Tool Crib Rack T-01',
      adapter_code: input.adapter_code || null,
      serial_number: input.serial_number || null,
      tool_type_spec: input.tool_type_spec || 'Carbide Tipped',
      diameter_mm: input.diameter_mm || null,
      length_mm: input.length_mm || null,
      bore_mm: input.bore_mm || null,
      teeth_count: input.teeth_count || null,
      quantity_available: input.quantity_available ?? 1,
      min_quantity: input.min_quantity ?? 2,
      lead_time_days: input.lead_time_days ?? 7,
      unit_cost: input.unit_cost ?? 0,
      status: 'available',
      sharpening_cycles_completed: 0,
      max_sharpening_cycles: input.max_sharpening_cycles ?? 5,
      can_be_sharpened: true,
      running_hours: 0,
      cutting_meters: 0,
      max_meters_per_cycle: input.max_meters_per_cycle ?? 5000,
      vendor_name: input.vendor_name || 'Leitz Tooling India',
      erp_pr_number: null,
      erp_sync_status: 'synced',
      qr_code: qrPayload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

/**
 * Records running meters & hours telemetry for a tool (Requirement 9.08)
 * Auto-flags status to 'dull' if cutting_meters >= max_meters_per_cycle
 */
export async function recordToolUsage(
  toolId: string,
  additionalMeters: number,
  additionalHours: number = 0,
  performedBy: string = 'Operator'
): Promise<Tool | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc('rpc_record_tool_usage', {
      p_tool_id: toolId,
      p_additional_meters: additionalMeters,
      p_additional_hours: additionalHours,
      p_performed_by: performedBy,
    });

    if (error) {
      console.warn('RPC rpc_record_tool_usage failed:', error.message);
    }
    return data as Tool;
  } catch (err) {
    console.error('Exception recording tool usage:', err);
    return null;
  }
}

/**
 * Triggers automated ERP Purchase Requisition (Requirement 9.03)
 */
export async function triggerToolERPRequisition(toolId: string): Promise<Tool | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc('rpc_trigger_tool_erp_pr', {
      p_tool_id: toolId,
    });

    if (error) {
      console.warn('RPC rpc_trigger_tool_erp_pr failed:', error.message);
    }
    return data as Tool;
  } catch (err) {
    console.error('Exception triggering ERP PR:', err);
    return null;
  }
}

/**
 * Updates tool status to out_for_sharpening or available
 */
export async function updateToolStatus(
  toolId: string,
  newStatus: Tool['status'],
  notes?: string
): Promise<Tool | null> {
  const supabase = createClient();

  try {
    const { data: tool } = await supabase.from('tools').select('*').eq('id', toolId).single();

    if (!tool) return null;

    let updatedCycles = tool.sharpening_cycles_completed;
    let resetMeters = tool.cutting_meters;
    let canSharpen = tool.can_be_sharpened;

    if (newStatus === 'available' && tool.status === 'out_for_sharpening') {
      updatedCycles += 1;
      resetMeters = 0; // Reset cutting meter counter for new cycle
      if (updatedCycles >= tool.max_sharpening_cycles) {
        canSharpen = false;
      }
    }

    if (newStatus === 'broken_scrapped') {
      canSharpen = false;
    }

    const { data, error } = await supabase
      .from('tools')
      .update({
        status: newStatus,
        sharpening_cycles_completed: updatedCycles,
        cutting_meters: resetMeters,
        can_be_sharpened: canSharpen,
        updated_at: new Date().toISOString(),
      })
      .eq('id', toolId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Log movement in tool_sharpening_logs
    await supabase.from('tool_sharpening_logs').insert([
      {
        tool_id: toolId,
        event_type:
          newStatus === 'out_for_sharpening'
            ? 'sent_for_sharpening'
            : newStatus === 'available'
            ? 'received_from_sharpening'
            : 'scrapped',
        running_meters_at_event: resetMeters,
        sharpening_cycle_index: updatedCycles,
        performed_by: 'Tool Crib Specialist',
        notes: notes || `Status changed to ${newStatus}`,
      },
    ]);

    return data as Tool;
  } catch (err) {
    console.error('Error updating tool status:', err);
    return null;
  }
}

/**
 * Fetches sharpening & usage history logs for a tool
 */
export async function fetchToolSharpeningLogs(toolId: string): Promise<ToolSharpeningLog[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('tool_sharpening_logs')
      .select('*')
      .eq('tool_id', toolId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as ToolSharpeningLog[];
  } catch (err) {
    console.error('Error fetching tool sharpening logs:', err);
    return [];
  }
}
