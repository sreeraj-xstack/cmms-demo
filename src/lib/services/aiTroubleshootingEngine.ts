import { createClient } from '@/lib/supabase/client';
import { AIMatchHitRateResult } from '@/types/troubleshooting';

/**
 * AI Diagnostic Hit-Rate Engine (Requirement 7.04)
 * Connects active breakdown symptoms to historical root causes and executable SOP fixes
 */
export async function matchAIFixesForBreakdown(
  problemQuery: string,
  assetId?: string,
  machineCategory?: string
): Promise<AIMatchHitRateResult[]> {
  const supabase = createClient();

  if (!problemQuery || problemQuery.trim() === '') {
    return [];
  }

  try {
    const { data, error } = await supabase.rpc('rpc_match_ai_troubleshooting_cause_fix', {
      p_query_text: problemQuery.trim(),
      p_asset_id: assetId || null,
      p_machine_category: machineCategory || null,
    });

    if (error) {
      console.error('Error invoking rpc_match_ai_troubleshooting_cause_fix:', error.message);
      return [];
    }

    return (data as AIMatchHitRateResult[]) || [];
  } catch (err) {
    console.error('Exception executing AI Troubleshooting Matcher:', err);
    return [];
  }
}
