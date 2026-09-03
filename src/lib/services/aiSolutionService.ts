import { createClient } from '@/lib/supabase/client';
import { AISearchResult, SolutionItem, MachineManual } from '@/types/solutionLibrary';

// Domain-Specific Industrial Sub-Assemblies & Technical N-Grams
const TECHNICAL_NGRAMS = [
  'z-axis servo',
  'servo drive',
  'ball screw',
  'glue pot',
  'heating cartridge',
  'pt100 sensor',
  'thermal fuse',
  'vacuum pod',
  'vacuum pressure',
  'pneumatic solenoid',
  'solenoid valve',
  'spindle encoder',
  'spindle drive',
  'feed belt',
  'rip cut',
  'pressure drop',
  'thermal trip',
  'overload trip',
  'panel line',
  'mdf panel',
];

// Stop Words Filter
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'for', 'with', 'when', 'during', 'and', 'or', 'to', 'in',
  'on', 'at', 'of', 'by', 'from', 'this', 'that', 'machine', 'center', 'line', 'system', 'heavy', 'cut', 'trips', 'trip'
]);

/**
 * Extracts error codes (e.g. E-404, PT100, V-12, ALM-101) from raw text
 */
function extractErrorCodes(text: string): string[] {
  const regex = /[a-z0-9]+-[0-9]+/gi;
  const matches = text.match(regex) || [];
  
  // Also check explicit standalone codes like PT100, E404
  const standaloneRegex = /\b(pt100|e404|v12)\b/gi;
  const standaloneMatches = text.match(standaloneRegex) || [];
  
  const combined = Array.from(new Set([...matches, ...standaloneMatches]));
  return combined.map((code) => code.toUpperCase());
}

/**
 * Extracts matched technical components & N-Grams from query
 */
function extractTechnicalComponents(text: string): string[] {
  const clean = text.toLowerCase();
  const matched: string[] = [];

  TECHNICAL_NGRAMS.forEach((ngram) => {
    if (clean.includes(ngram)) {
      matched.push(ngram.toUpperCase());
    }
  });

  // Fallback single-token technical terms
  const singleTerms = ['servo', 'spindle', 'encoder', 'relay', 'valve', 'fuse', 'thermocouple', 'gasket', 'solenoid', 'bearing'];
  singleTerms.forEach((term) => {
    if (clean.includes(term) && !matched.some((m) => m.toLowerCase().includes(term))) {
      matched.push(term.toUpperCase());
    }
  });

  return Array.from(new Set(matched));
}

/**
 * Production-Grade AI Semantic Search Engine
 * Performs domain-aware NLP entity extraction and weighted multi-factor scoring.
 */
export async function queryAISolutions(
  problemQuery: string,
  targetMachineType?: string
): Promise<AISearchResult[]> {
  const supabase = createClient();
  const results: AISearchResult[] = [];

  if (!problemQuery || problemQuery.trim() === '') {
    return [];
  }

  const queryClean = problemQuery.trim().toLowerCase();
  const errorCodesInQuery = extractErrorCodes(problemQuery);
  const componentsInQuery = extractTechnicalComponents(problemQuery);

  // Tokenize & strip stop words
  const queryTokens = queryClean
    .split(/[\s,._\-/]+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

  try {
    // 1. Scan Solution Library Database Entries
    const { data: solutions } = await supabase.from('solution_library').select('*');
    if (solutions && solutions.length > 0) {
      for (const sol of solutions) {
        const solText = `${sol.title} ${sol.problem_symptoms} ${sol.resolution_steps} ${(sol.tags || []).join(' ')}`.toLowerCase();
        
        let errorCodeScore = 0;
        let componentScore = 0;
        let machineTypeScore = 0;
        let verificationBoost = 0;

        const matchedCodesForSol: string[] = [];
        const matchedComponentsForSol: string[] = [];

        // Factor 1: Error Code Exact Match (Max 40 pts)
        errorCodesInQuery.forEach((code) => {
          if (solText.includes(code.toLowerCase()) || (sol.tags || []).some((t: string) => t.toUpperCase().includes(code))) {
            errorCodeScore = 40;
            matchedCodesForSol.push(code);
          }
        });

        // Factor 2: Technical Sub-Assembly Component N-Gram Match (Max 35 pts)
        let compMatches = 0;
        componentsInQuery.forEach((comp) => {
          if (solText.includes(comp.toLowerCase())) {
            compMatches += 1;
            matchedComponentsForSol.push(comp);
          }
        });
        if (componentsInQuery.length > 0) {
          componentScore = Math.min(35, Math.round((compMatches / componentsInQuery.length) * 35));
        } else {
          // Token fallback overlap
          let tokenMatches = 0;
          queryTokens.forEach((tok) => {
            if (solText.includes(tok)) tokenMatches += 1;
          });
          if (queryTokens.length > 0) {
            componentScore = Math.min(30, Math.round((tokenMatches / queryTokens.length) * 30));
          }
        }

        // Factor 3: Machine Category Alignment (Max 15 pts)
        if (targetMachineType && targetMachineType !== 'all') {
          if (sol.machine_type.toLowerCase() === targetMachineType.toLowerCase()) {
            machineTypeScore = 15;
          }
        } else if (queryClean.includes(sol.machine_type.toLowerCase())) {
          machineTypeScore = 15;
        }

        // Factor 4: Manager Verification & Success Counter Boost (Max 10 pts)
        if (sol.verified_by_manager) verificationBoost += 5;
        if ((sol.success_count || 0) >= 5) verificationBoost += 5;

        const totalScore = errorCodeScore + componentScore + machineTypeScore + verificationBoost;
        const confidenceScore = Math.min(99, Math.max(35, totalScore));

        if (totalScore >= 30 || matchedCodesForSol.length > 0 || matchedComponentsForSol.length > 0) {
          results.push({
            id: sol.id,
            title: sol.title,
            source_type: 'solution',
            confidence_score: confidenceScore,
            machine_type: sol.machine_type,
            issue_category: sol.issue_category,
            symptoms_or_excerpt: sol.problem_symptoms,
            resolution_steps: sol.resolution_steps,
            tags: sol.tags || [],
            matched_error_codes: Array.from(new Set(matchedCodesForSol)),
            matched_components: Array.from(new Set(matchedComponentsForSol)),
            score_breakdown: {
              errorCodeScore,
              componentScore,
              machineTypeScore,
              verificationBoost,
            },
            original_item: sol as SolutionItem,
          });
        }
      }
    }

    // 2. Scan Closed Breakdown Tickets
    const { data: tickets } = await supabase
      .from('breakdown_tickets')
      .select('*, assets:asset_id(name, machine_type)')
      .or('status.eq.fixed,status.eq.closed');

    if (tickets && tickets.length > 0) {
      for (const t of tickets) {
        const ticketText = `${t.ticket_number} ${t.issue_type} ${t.description}`.toLowerCase();
        let errorCodeScore = 0;
        let componentScore = 0;
        let machineTypeScore = 0;

        const matchedCodes: string[] = [];
        const matchedComps: string[] = [];

        errorCodesInQuery.forEach((code) => {
          if (ticketText.includes(code.toLowerCase())) {
            errorCodeScore = 35;
            matchedCodes.push(code);
          }
        });

        componentsInQuery.forEach((comp) => {
          if (ticketText.includes(comp.toLowerCase())) {
            componentScore += 15;
            matchedComps.push(comp);
          }
        });

        if (queryTokens.length > 0) {
          let tokCount = 0;
          queryTokens.forEach((tok) => {
            if (ticketText.includes(tok)) tokCount += 1;
          });
          componentScore = Math.max(componentScore, Math.min(25, Math.round((tokCount / queryTokens.length) * 25)));
        }

        const totalScore = errorCodeScore + Math.min(30, componentScore) + machineTypeScore;
        const confidenceScore = Math.min(94, Math.max(30, totalScore));

        if (totalScore >= 25 || matchedCodes.length > 0) {
          results.push({
            id: t.id,
            title: `Closed Ticket ${t.ticket_number}: ${t.issue_type}`,
            source_type: 'historical_ticket',
            confidence_score: confidenceScore,
            machine_type: t.assets?.machine_type || 'Machinery Asset',
            issue_category: t.issue_type,
            symptoms_or_excerpt: t.description,
            resolution_steps: `Resolved by ${t.assigned_engineer_name || 'Maintenance Team'}. Check audit history step notes for exact fix procedure.`,
            tags: [t.ticket_number, t.issue_type],
            matched_error_codes: Array.from(new Set(matchedCodes)),
            matched_components: Array.from(new Set(matchedComps)),
            score_breakdown: {
              errorCodeScore,
              componentScore: Math.min(30, componentScore),
              machineTypeScore: 0,
              verificationBoost: 5,
            },
            original_item: t,
          });
        }
      }
    }

    // 3. Scan Machine Manuals
    const { data: manuals } = await supabase.from('machine_manuals').select('*');
    if (manuals && manuals.length > 0) {
      for (const m of manuals) {
        const manualText = `${m.title} ${m.machine_type} ${m.extracted_text || ''}`.toLowerCase();
        let componentScore = 0;
        const matchedComps: string[] = [];

        componentsInQuery.forEach((comp) => {
          if (manualText.includes(comp.toLowerCase())) {
            componentScore += 20;
            matchedComps.push(comp);
          }
        });

        const totalScore = Math.min(90, Math.max(30, 20 + componentScore));

        if (componentScore > 0 || queryTokens.some((tok) => manualText.includes(tok))) {
          results.push({
            id: m.id,
            title: `OEM Manual: ${m.title}`,
            source_type: 'manual',
            confidence_score: totalScore,
            machine_type: m.machine_type,
            symptoms_or_excerpt: m.extracted_text || `Official OEM manual document for ${m.machine_type}`,
            resolution_steps: `Refer to official operating procedures in PDF file: ${m.file_name}`,
            tags: ['OEM Manual', m.machine_type],
            matched_error_codes: [],
            matched_components: Array.from(new Set(matchedComps)),
            score_breakdown: {
              errorCodeScore: 0,
              componentScore: Math.min(40, componentScore),
              machineTypeScore: 10,
              verificationBoost: 0,
            },
            original_item: m as MachineManual,
          });
        }
      }
    }

    // Sort descending by confidence score
    return results.sort((a, b) => b.confidence_score - a.confidence_score);
  } catch (err) {
    console.error('Exception running AI solution search:', err);
    return [];
  }
}
