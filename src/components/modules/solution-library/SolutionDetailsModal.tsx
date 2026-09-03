'use client';

import React, { useState } from 'react';
import { SolutionItem } from '@/types/solutionLibrary';
import { useAuth } from '@/context/AuthContext';
import { X, ShieldCheck, ThumbsUp, Paperclip, CheckCircle2, User } from 'lucide-react';

interface SolutionDetailsModalProps {
  solution: SolutionItem | null;
  onClose: () => void;
  onUpvote: (solutionId: string) => Promise<void>;
  onVerify: (solutionId: string, managerName: string) => Promise<void>;
}

export function SolutionDetailsModal({
  solution,
  onClose,
  onUpvote,
  onVerify,
}: SolutionDetailsModalProps) {
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  if (!solution) return null;

  const handleVerifyClick = async () => {
    setVerifying(true);
    const managerName = user?.full_name || user?.email?.split('@')[0] || 'Plant Manager';
    await onVerify(solution.id, managerName);
    setVerifying(false);
  };

  const handleUpvoteClick = async () => {
    setUpvoting(true);
    await onUpvote(solution.id);
    setUpvoting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white border-l border-slate-200 shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                  {solution.solution_number}
                </span>
                <span className="text-xs font-bold text-slate-700 bg-stone-100 px-2 py-0.5 rounded">
                  {solution.machine_type}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">{solution.title}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                Created by <span className="font-semibold text-slate-700">{solution.created_by_name}</span> ({solution.created_by_role})
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-stone-50 transition-all flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Action Row: Verification & Upvotes */}
          <div className="flex items-center justify-between bg-stone-50 border border-slate-200 rounded-2xl p-3 text-xs">
            <div className="flex items-center gap-2">
              {solution.verified_by_manager ? (
                <span className="flex items-center gap-1.5 font-bold text-slate-900 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  Verified by {solution.verified_by_name || 'Plant Manager'}
                </span>
              ) : (
                user?.role === 'manager' && (
                  <button
                    onClick={handleVerifyClick}
                    disabled={verifying}
                    className="flex items-center gap-1.5 font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-xl shadow-xs transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4 text-slate-950" />
                    {verifying ? 'Verifying...' : 'Verify Solution Sign-off'}
                  </button>
                )
              )}
            </div>

            <button
              onClick={handleUpvoteClick}
              disabled={upvoting}
              className="flex items-center gap-1.5 font-bold text-slate-800 bg-white border border-slate-200 hover:border-amber-400 px-3 py-1.5 rounded-xl shadow-xs transition-all"
            >
              <ThumbsUp className="h-4 w-4 text-amber-600" />
              <span>{solution.success_count} Verified Fixes</span>
            </button>
          </div>

          {/* Problem Symptoms Box */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Problem Symptoms & Failure Mode</h3>
            <div className="rounded-2xl border border-slate-200 bg-stone-50 p-4 font-medium text-slate-800 leading-relaxed">
              {solution.problem_symptoms}
            </div>
          </div>

          {/* Step-by-Step Resolution Procedure */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Step-by-Step Resolution Procedure</h3>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
              {solution.resolution_steps.split('\n').map((step, idx) => (
                <p key={idx} className="text-slate-900 leading-relaxed font-medium">
                  {step}
                </p>
              ))}
            </div>
          </div>

          {/* Media Proof Attachments */}
          {solution.attachments && solution.attachments.length > 0 && (
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Paperclip className="h-4 w-4 text-amber-500" />
                Media Proof & Repair Reference ({solution.attachments.length})
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {solution.attachments.map((att) => (
                  <div key={att.id} className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 truncate text-[11px]">{att.file_name}</span>
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                        {att.file_type.toUpperCase()}
                      </span>
                    </div>

                    {att.file_type === 'photo' && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48 flex items-center justify-center">
                        <img src={att.file_url} alt={att.file_name} className="max-h-48 object-contain" />
                      </div>
                    )}

                    {att.file_type === 'audio' && (
                      <audio src={att.file_url} controls className="w-full h-10 rounded-xl" />
                    )}

                    {att.file_type === 'video' && (
                      <video src={att.file_url} controls className="w-full max-h-48 rounded-xl bg-slate-900" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {solution.tags && solution.tags.length > 0 && (
            <div className="space-y-2 text-xs pt-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Tags & Identifiers</h3>
              <div className="flex flex-wrap gap-1.5">
                {solution.tags.map((tag, idx) => (
                  <span key={idx} className="font-mono text-[10px] font-semibold bg-stone-100 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
