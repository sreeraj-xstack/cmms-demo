'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  Cpu,
  FileCheck,
  Clock,
  ArrowRight,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { AIMatchHitRateResult } from '@/types/troubleshooting';
import { matchAIFixesForBreakdown } from '@/lib/services/aiTroubleshootingEngine';
import { upvoteRCAFeedback } from '@/lib/services/troubleshootingService';

interface AIFixMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId?: string;
  problemStatement: string;
  assetId?: string;
  assetName?: string;
  machineCategory?: string;
  onApplyFix?: (fix: AIMatchHitRateResult) => void;
}

export default function AIFixMatcherModal({
  isOpen,
  onClose,
  ticketId,
  problemStatement,
  assetId,
  assetName,
  machineCategory,
  onApplyFix,
}: AIFixMatcherModalProps) {
  const [matches, setMatches] = useState<AIMatchHitRateResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen && problemStatement) {
      loadMatches();
    }
  }, [isOpen, problemStatement]);

  const loadMatches = async () => {
    setIsLoading(true);
    try {
      const results = await matchAIFixesForBreakdown(problemStatement, assetId, machineCategory);
      setMatches(results);
    } catch (err) {
      console.error('Error matching AI fixes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async (rcaId: string) => {
    if (upvotedIds[rcaId]) return;
    try {
      await upvoteRCAFeedback(rcaId);
      setUpvotedIds((prev) => ({ ...prev, [rcaId]: true }));
      setMatches((prev) =>
        prev.map((m) => (m.rca_id === rcaId ? { ...m, feedback_upvotes: m.feedback_upvotes + 1 } : m))
      );
    } catch (err) {
      console.error('Error upvoting match:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Diagnostic Hit-Rate Fix Matcher"
      subtitle={assetName ? `AI troubleshooting analysis for asset: ${assetName}` : 'Symptom-to-Cause-to-Fix AI Engine'}
      icon={<Bot className="w-5 h-5 text-amber-500" />}
      maxWidth="3xl"
    >
      <div className="p-6 space-y-4">
        {/* Symptom Query Banner */}
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-amber-900 uppercase">Target Breakdown Query</span>
            <p className="font-bold text-slate-900">{problemStatement}</p>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-extrabold bg-amber-500 text-slate-950 rounded-lg shrink-0">
            AI Diagnostic Engine
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
            Analyzing historical 5-Why RCAs, error N-grams, and asset MTBF data...
          </div>
        ) : matches.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500 bg-stone-50 rounded-2xl border border-dashed border-slate-200">
            No exact historical RCA match found. Click &quot;Run 5-Why RCA&quot; to record the root cause for future AI matching.
          </div>
        ) : (
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
            {matches.map((item, idx) => (
              <div
                key={item.rca_id || idx}
                className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 hover:border-amber-400 transition-all shadow-xs"
              >
                {/* Match Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-black bg-amber-500 text-slate-950 rounded-lg shadow-2xs">
                      {item.hit_rate_score}% AI Hit Rate
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-stone-100 text-slate-700 border border-slate-200 rounded-md">
                      {item.root_cause_category}
                    </span>
                  </div>

                  <button
                    onClick={() => handleUpvote(item.rca_id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      upvotedIds[item.rca_id]
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-100 hover:bg-stone-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{item.feedback_upvotes} Upvotes</span>
                  </button>
                </div>

                {/* Root Cause & Fix Body */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Identified Root Cause:</span>
                    <p className="font-bold text-slate-900">{item.why_5_root_cause}</p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-slate-200 text-slate-700">
                    <span className="font-bold text-slate-900 block mb-0.5">Verified Corrective Action:</span>
                    <p>{item.corrective_action}</p>
                  </div>

                  {item.procedure_title && (
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-semibold">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Executable SOP: {item.procedure_title}</span>
                    </div>
                  )}
                </div>

                {/* Apply Action */}
                <div className="flex justify-end pt-1">
                  {onApplyFix && (
                    <button
                      onClick={() => onApplyFix(item)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Apply Fix & Connect SOP
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
