'use client';

import React, { useState } from 'react';
import { SolutionItem } from '@/types/solutionLibrary';
import { ShieldCheck, ThumbsUp, Image, Mic, Video, ArrowRight } from 'lucide-react';

interface SolutionCardProps {
  solution: SolutionItem;
  onSelect: (solution: SolutionItem) => void;
  onUpvote: (solutionId: string) => Promise<void>;
}

export function SolutionCard({ solution, onSelect, onUpvote }: SolutionCardProps) {
  const [upvoting, setUpvoting] = useState(false);

  const handleUpvoteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setUpvoting(true);
    await onUpvote(solution.id);
    setUpvoting(false);
  };

  const hasPhoto = solution.attachments?.some((a) => a.file_type === 'photo');
  const hasAudio = solution.attachments?.some((a) => a.file_type === 'audio');
  const hasVideo = solution.attachments?.some((a) => a.file_type === 'video');

  return (
    <div
      onClick={() => onSelect(solution)}
      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs hover:shadow-md hover:border-amber-400/60 transition-all cursor-pointer group"
    >
      {/* Top Bar: Solution Number & Badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
            {solution.solution_number}
          </span>
          <span className="text-[11px] font-bold text-slate-700 bg-stone-100 px-2 py-0.5 rounded">
            {solution.machine_type}
          </span>
        </div>

        {solution.verified_by_manager && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
            <ShieldCheck className="h-3 w-3 text-amber-600" />
            Verified
          </span>
        )}
      </div>

      {/* Title & Symptoms */}
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors leading-snug">
          {solution.title}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          <span className="font-semibold text-slate-700">Symptoms:</span> {solution.problem_symptoms}
        </p>
      </div>

      {/* Media Attachments Indicator & Upvote Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          {hasPhoto && (
            <span title="Photo Attached">
              <Image className="h-3.5 w-3.5 text-slate-600" />
            </span>
          )}
          {hasAudio && (
            <span title="Voice Audio Note Attached">
              <Mic className="h-3.5 w-3.5 text-slate-600" />
            </span>
          )}
          {hasVideo && (
            <span title="Video Clip Attached">
              <Video className="h-3.5 w-3.5 text-slate-600" />
            </span>
          )}
          <span className="text-[10px] text-slate-500 font-medium">
            {solution.attachments?.length || 0} media proof
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUpvoteClick}
            disabled={upvoting}
            className="flex items-center gap-1 font-bold text-[11px] text-slate-700 bg-stone-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 px-2.5 py-1 rounded-xl transition-all"
            title="Mark solution as helpful"
          >
            <ThumbsUp className="h-3.5 w-3.5 text-amber-600" />
            <span>{solution.success_count} Fixed</span>
          </button>

          <span className="text-amber-600 group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
