import { createClient } from '@/lib/supabase/client';
import { AIRiskAnalysis, PMRecurrenceType } from '@/types/preventiveMaintenance';

export async function analyzeAssetFailureRisk(assetId: string): Promise<AIRiskAnalysis> {
  const supabase = createClient();

  try {
    // 1. Fetch asset details & criticality
    const { data: asset } = await supabase
      .from('assets')
      .select('name, criticality, machine_type')
      .eq('id', assetId)
      .single();

    const criticality = asset?.criticality?.toLowerCase() || 'medium';

    // 2. Fetch completed breakdown work orders & tickets for this asset
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id, title, created_at, status, priority, resolution_summary')
      .eq('asset_id', assetId);

    const ticketCount = tickets?.length || 0;

    // Filter tickets in last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentTickets = (tickets || []).filter(t => new Date(t.created_at) >= ninetyDaysAgo);
    const recentBreakdownCount = recentTickets.length;

    // 3. Compute Risk Score (0 - 100) based on breakdown frequency & asset criticality
    let baseRisk = 20;

    if (criticality === 'critical') baseRisk += 30;
    else if (criticality === 'high') baseRisk += 20;
    else if (criticality === 'medium') baseRisk += 10;

    baseRisk += Math.min(recentBreakdownCount * 15, 45);

    const failureRiskScore = Math.min(Math.max(baseRisk, 10), 98);

    // 4. Determine AI recommended PM recurrence interval
    let recommendedInterval: PMRecurrenceType = 'monthly';
    let rationale = '';

    if (failureRiskScore >= 75) {
      recommendedInterval = 'weekly';
      rationale = `CRITICAL RISK (${failureRiskScore}/100): ${recentBreakdownCount} breakdown(s) recorded in past 90 days on ${asset?.name || 'Asset'} (${criticality.toUpperCase()} criticality). Recommending weekly preventive inspection cycles to eliminate unplanned downtime.`;
    } else if (failureRiskScore >= 50) {
      recommendedInterval = 'biweekly';
      rationale = `ELEVATED RISK (${failureRiskScore}/100): Asset has ${recentBreakdownCount} recent failure event(s). Recommended bi-weekly PM cadence to monitor wear parameters and lubrication levels.`;
    } else if (failureRiskScore >= 30) {
      recommendedInterval = 'monthly';
      rationale = `MODERATE RISK (${failureRiskScore}/100): Standard operational degradation curve. Monthly PM cycle is optimal to verify alignment and sensor calibration.`;
    } else {
      recommendedInterval = 'quarterly';
      rationale = `LOW RISK (${failureRiskScore}/100): High operational stability with zero recent critical failures. Quarterly deep preventive overhaul is recommended.`;
    }

    return {
      asset_id: assetId,
      riskScore: failureRiskScore,
      failure_risk_score: failureRiskScore,
      recommended_recurrence_interval: recommendedInterval,
      rationale: rationale,
      ai_rationale: rationale,
      recent_breakdowns_count: recentBreakdownCount,
      recentBreakdownsCount: recentBreakdownCount,
      criticality: asset?.criticality || 'Medium',
    };
  } catch (err) {
    console.error('Error analyzing asset failure risk with AI:', err);
    return {
      asset_id: assetId,
      riskScore: 35,
      failure_risk_score: 35,
      recommended_recurrence_interval: 'monthly',
      rationale: 'Default baseline PM schedule applied. Insufficient historical telemetry available.',
      ai_rationale: 'Default baseline PM schedule applied. Insufficient historical telemetry available.',
      recent_breakdowns_count: 0,
      recentBreakdownsCount: 0,
      criticality: 'Medium',
    };
  }
}
