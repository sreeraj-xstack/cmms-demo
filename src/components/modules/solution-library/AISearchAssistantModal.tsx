'use client';

import React, { useState, useEffect } from 'react';
import { AISearchResult } from '@/types/solutionLibrary';
import { queryAISolutions } from '@/lib/services/aiSolutionService';
import { X, Sparkles, Search, CheckCircle2, BookOpen, Wrench, ShieldCheck, Tag, Cpu, Check } from 'lucide-react';

interface AISearchAssistantModalProps {
  isOpen: boolean;
  initialQuery?: string;
  onClose: () => void;
  onSelectResult?: (result: AISearchResult) => void;
}

export function AISearchAssistantModal({
  isOpen,
  initialQuery = '',
  onClose,
  onSelectResult,
}: AISearchAssistantModalProps) {
  const [promptQuery, setPromptQuery] = useState(initialQuery);
  const [targetMachine, setTargetMachine] = useState('all');
  const [results, setResults] = useState<AISearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = async (queryText: string, machine: string) => {
    if (!queryText.trim()) return;
    setSearching(true);
    setHasSearched(true);
    const aiResults = await queryAISolutions(queryText, machine);
    setResults(aiResults);
    setSearching(false);
  };

  useEffect(() => {
    if (isOpen && initialQuery) {
      setPromptQuery(initialQuery);
      runSearch(initialQuery, 'all');
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(promptQuery, targetMachine);
  };

  const getSourceTypeBadge = (type: string) => {
    switch (type) {
      case 'solution':
        return (
          <span className="flex items-center gap-1 font-bold text-[10px] text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
            <CheckCircle2 className="h-3 w-3 text-amber-600" />
            Verified Solution
          </span>
        );
      case 'manual':
        return (
          <span className="flex items-center gap-1 font-bold text-[10px] text-slate-800 bg-stone-100 border border-slate-300 px-2 py-0.5 rounded">
            <BookOpen className="h-3 w-3 text-slate-600" />
            OEM Manual Page
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 font-bold text-[10px] text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
            <Wrench className="h-3 w-3 text-slate-500" />
            Closed Ticket Fix
          </span>
        );
    }
  };

  // Collect all matched entities for filter pills
  const allMatchedErrorCodes = Array.from(new Set(results.flatMap((r) => r.matched_error_codes || [])));
  const allMatchedComponents = Array.from(new Set(results.flatMap((r) => r.matched_components || [])));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white border-l border-slate-200 shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                <h2 className="text-base font-bold text-slate-900">CMMS Industrial AI Matcher</h2>
              </div>
              <p className="text-xs text-slate-500">
                Domain-aware NLP engine matching fault codes, sub-assemblies & OEM manuals
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-stone-50 transition-all flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* AI Search Prompt Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">
                Describe Machine Defect, Fault Code, or Sub-assembly Symptoms *
              </label>
              <textarea
                rows={3}
                value={promptQuery}
                onChange={(e) => setPromptQuery(e.target.value)}
                placeholder="e.g. HOMAG CNC Z-axis servo drive trips with Error E-404 during heavy milling cut or Edgebander PT100 glue pot trip..."
                required
                className="w-full rounded-2xl border border-slate-200 bg-stone-50 p-3.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={targetMachine}
                onChange={(e) => setTargetMachine(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Machine Categories</option>
                <option value="CNC Processing Center">CNC Processing Center</option>
                <option value="Edgebander">Edgebander</option>
                <option value="Panel Saw">Panel Saw</option>
                <option value="Dust Extraction System">Dust Extraction System</option>
                <option value="Laminating Press">Laminating Press</option>
              </select>

              <button
                type="submit"
                disabled={searching || !promptQuery.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 text-xs shadow-xs transition-all disabled:opacity-50 flex-shrink-0"
              >
                <Search className="h-3.5 w-3.5 text-amber-400" />
                {searching ? 'Analyzing AI Database...' : 'Run Production AI Matcher'}
              </button>
            </div>
          </form>

          {/* Matched Entities Filter Pills */}
          {hasSearched && (allMatchedErrorCodes.length > 0 || allMatchedComponents.length > 0) && (
            <div className="bg-stone-50 border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Extracted Industrial Entities Identified by AI:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allMatchedErrorCodes.map((code) => (
                  <span key={code} className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Tag className="h-3 w-3 text-amber-600" />
                    FAULT CODE: {code}
                  </span>
                ))}

                {allMatchedComponents.map((comp) => (
                  <span key={comp} className="font-mono text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-amber-400" />
                    SUB-ASSEMBLY: {comp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Search Results List */}
          {hasSearched && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  AI Diagnostic Ranked Matches ({results.length})
                </h3>
                <span className="text-[10px] text-slate-400 italic">Ranked by Multi-Factor Confidence Score</span>
              </div>

              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((res) => (
                    <div
                      key={res.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs hover:border-amber-400 transition-all"
                    >
                      {/* Confidence Score Header */}
                      <div className="flex items-center justify-between">
                        {getSourceTypeBadge(res.source_type)}
                        <span className="font-bold text-xs text-amber-900 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-xs">
                          {res.confidence_score}% Confidence Match
                        </span>
                      </div>

                      {/* Solution Title & Machine */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-xs">{res.title}</h4>
                          <span className="text-[10px] font-semibold text-slate-600 bg-stone-100 px-2 py-0.5 rounded">
                            {res.machine_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">
                          <span className="font-semibold text-slate-700">Symptoms:</span> {res.symptoms_or_excerpt}
                        </p>
                      </div>

                      {/* AI Match Justification Box */}
                      <div className="rounded-xl bg-amber-50/50 border border-amber-300/40 p-2.5 space-y-1.5 text-[11px]">
                        <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px] block">
                          Why AI Matched This Solution:
                        </span>

                        <div className="flex flex-wrap gap-2 text-slate-800">
                          {res.matched_error_codes && res.matched_error_codes.length > 0 && (
                            <span className="font-bold text-amber-800 flex items-center gap-1">
                              <Check className="h-3 w-3 text-amber-600" />
                              Matched Code: {res.matched_error_codes.join(', ')}
                            </span>
                          )}

                          {res.matched_components && res.matched_components.length > 0 && (
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <Check className="h-3 w-3 text-amber-600" />
                              Components: {res.matched_components.join(', ')}
                            </span>
                          )}

                          <span className="text-slate-600">
                            • Score Breakdown: Error Code ({res.score_breakdown?.errorCodeScore || 0} pts), Component ({res.score_breakdown?.componentScore || 0} pts)
                          </span>
                        </div>
                      </div>

                      {/* Step-by-Step Fix Procedure */}
                      <div className="rounded-xl bg-stone-50 border border-slate-100 p-3 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Verified Resolution Procedure:</span>
                        <p className="text-[11px] text-slate-900 whitespace-pre-line leading-relaxed font-medium">
                          {res.resolution_steps}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-stone-50 p-6 text-center text-slate-500 italic space-y-1">
                  <p>No high-confidence AI matches found for this query.</p>
                  <p className="text-[11px]">Try entering exact fault codes (e.g. E-404, PT100) or sub-assembly names.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
