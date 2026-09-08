import { createClient } from '@/lib/supabase/client';
import { AISearchResult, SolutionItem, MachineManual } from '@/types/solutionLibrary';

// Domain-Specific Industrial Sub-Assemblies & Technical N-Grams
const TECHNICAL_NGRAMS = [
  'z-axis servo',
  'glue pot',
  'vacuum pod',
  'ball screw',
  'thermocouple',
  'pt100',
  'spindle drive',
  'encoder offset',
  'solenoid valve',
  'feed belt',
  'pressure transducer',
  'servo drive',
];

/**
 * Extracts exact error/fault codes (e.g. E-404, PT100, V-12) from raw query text
 */
export function extractErrorCodes(text: string): string[] {
  const codeRegex = /\b([a-z0-9]+-[0-9]+|pt100|alm-[0-9]+|err-[0-9]+)\b/gi;
  const matches = text.match(codeRegex) || [];
  return Array.from(new Set(matches.map((m) => m.toUpperCase())));
}

/**
 * Extracts sub-assembly N-grams from raw query text
 */
export function extractTechnicalComponents(text: string): string[] {
  const lowerText = text.toLowerCase();
  return TECHNICAL_NGRAMS.filter((ngram) => lowerText.includes(ngram));
}

/**
 * Production-Grade Industrial Diagnostic Search Engine calling PostgreSQL FTS RPCProcedure
 */
export async function queryAISolutions(
  problemQuery: string,
  targetMachineType?: string
): Promise<AISearchResult[]> {
  const supabase = createClient();

  if (!problemQuery || problemQuery.trim() === '') {
    return [];
  }

  const queryLower = problemQuery.toLowerCase();
  const errorCodesInQuery = extractErrorCodes(problemQuery);
  const componentsInQuery = extractTechnicalComponents(problemQuery);

  try {
    // 1. Query PostgreSQL FTS Stored Procedure `rpc_search_solutions`
    const { data: dbSolutions, error } = await supabase.rpc('rpc_search_solutions', {
      p_query_text: problemQuery,
      p_machine_type: targetMachineType || null,
    });

    if (error) {
      console.error('Error executing rpc_search_solutions:', error.message);
    }

    const solutionsList = (dbSolutions || []) as SolutionItem[];

    // 2. Score & Rank results with diagnostic justifications
    const results: AISearchResult[] = [];

    for (const sol of solutionsList) {
      const solText = `${sol.title} ${sol.problem_symptoms} ${sol.resolution_steps} ${(sol.tags || []).join(' ')}`.toLowerCase();

      let errorCodeScore = 0;
      let componentScore = 0;
      let machineTypeScore = 0;
      let verificationBoost = 0;

      const matchedCodesForSol: string[] = [];
      const matchedComponentsForSol: string[] = [];

      // Factor 1: Error Code Exact Match (Max 40 pts)
      errorCodesInQuery.forEach((code) => {
        if (solText.includes(code.toLowerCase())) {
          errorCodeScore = 40;
          matchedCodesForSol.push(code);
        }
      });

      // Factor 2: Sub-Assembly / Component N-Gram Match (Max 35 pts)
      componentsInQuery.forEach((comp) => {
        if (solText.includes(comp.toLowerCase())) {
          componentScore += 17.5;
          matchedComponentsForSol.push(comp);
        }
      });
      componentScore = Math.min(35, componentScore);

      // Factor 3: Target Machine Type Match (Max 15 pts)
      if (targetMachineType && targetMachineType !== 'all') {
        if (sol.machine_type.toLowerCase().includes(targetMachineType.toLowerCase())) {
          machineTypeScore = 15;
        }
      } else {
        machineTypeScore = 10;
      }

      // Factor 4: Manager Verification Boost (Max 10 pts)
      if (sol.verified_by_manager) {
        verificationBoost = 10;
      }

      // Compute Total Combined Score
      let score = errorCodeScore + componentScore + machineTypeScore + verificationBoost;

      // Symptom Keyword fallback match
      if (score === 0 || score < 15) {
        const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 3);
        let keywordHits = 0;
        queryWords.forEach((word) => {
          if (solText.includes(word)) keywordHits++;
        });
        if (keywordHits > 0) {
          score = Math.min(65, 20 + keywordHits * 15);
        }
      }

      if (score >= 15) {
        results.push({
          id: sol.id,
          title: sol.title,
          source_type: 'solution',
          confidence_score: Math.min(99, Math.round(score)),
          machine_type: sol.machine_type,
          issue_category: sol.issue_category,
          symptoms_or_excerpt: sol.problem_symptoms,
          resolution_steps: sol.resolution_steps,
          tags: sol.tags || [],
          matched_error_codes: matchedCodesForSol,
          matched_components: matchedComponentsForSol,
          score_breakdown: {
            errorCodeScore: errorCodeScore,
            componentScore: Math.round(componentScore),
            machineTypeScore: machineTypeScore,
            verificationBoost: verificationBoost,
          },
          original_item: sol,
        });
      }
    }

    // Sort by confidence score descending
    results.sort((a, b) => b.confidence_score - a.confidence_score);
    return results;
  } catch (err) {
    console.error('Exception executing AI Solution Matcher:', err);
    return [];
  }
}
