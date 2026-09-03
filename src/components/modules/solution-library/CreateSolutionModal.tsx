'use client';

import React, { useState } from 'react';
import { CreateSolutionInput } from '@/types/solutionLibrary';
import { uploadSolutionMediaFile } from '@/lib/services/solutionLibraryService';
import { X, Plus, Upload, Trash2, Mic, Image, Video } from 'lucide-react';

interface CreateSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateSolutionInput) => Promise<void>;
}

const MACHINE_TYPES = [
  'CNC Processing Center',
  'Edgebander',
  'Panel Saw',
  'Dust Extraction System',
  'Laminating Press',
  'Sanding Machine',
  'Boiler & Utility System',
];

const ISSUE_CATEGORIES = [
  'Spindle & Drive Failure',
  'Electrical Trip',
  'Pneumatic & Vacuum Leak',
  'Temperature & Heater Trip',
  'Mechanical Wear',
  'Hydraulic Pressure Drop',
  'Sensor Calibration',
];

export function CreateSolutionModal({ isOpen, onClose, onSubmit }: CreateSolutionModalProps) {
  const [title, setTitle] = useState('');
  const [machineType, setMachineType] = useState('CNC Processing Center');
  const [issueCategory, setIssueCategory] = useState('Spindle & Drive Failure');
  const [problemSymptoms, setProblemSymptoms] = useState('');
  const [resolutionSteps, setResolutionSteps] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  const [attachments, setAttachments] = useState<
    { file_url: string; file_type: 'photo' | 'audio' | 'video'; file_name: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mime = file.type.toLowerCase();
      let file_type: 'photo' | 'audio' | 'video' = 'photo';

      if (mime.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav')) {
        file_type = 'audio';
      } else if (mime.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm')) {
        file_type = 'video';
      }

      const file_url = await uploadSolutionMediaFile(file);
      setAttachments((prev) => [...prev, { file_url, file_type, file_name: file.name }]);
    }
    setUploading(false);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !problemSymptoms.trim() || !resolutionSteps.trim()) return;

    setSubmitting(true);
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await onSubmit({
      title: title.trim(),
      machine_type: machineType,
      issue_category: issueCategory,
      problem_symptoms: problemSymptoms.trim(),
      resolution_steps: resolutionSteps.trim(),
      tags: parsedTags.length > 0 ? parsedTags : [machineType, issueCategory],
      attachments,
    });

    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add Solution to Knowledge Vault</h2>
            <p className="text-xs text-slate-500">Document a verified repair fix for future engineering reference</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-stone-50 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Solution Title */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Solution Title & Fix Summary *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. HOMAG CNC Z-Axis Servo Overload & Encoder Recalibration"
              required
              className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Machine Type & Issue Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Machine Type *</label>
              <select
                value={machineType}
                onChange={(e) => setMachineType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
              >
                {MACHINE_TYPES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Issue Category *</label>
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
              >
                {ISSUE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Symptoms & Error Codes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Problem Symptoms & Error Codes *</label>
            <textarea
              rows={3}
              value={problemSymptoms}
              onChange={(e) => setProblemSymptoms(e.target.value)}
              placeholder="Describe symptoms, trip codes (e.g. Error E-404, PT100 sensor fault, 24V trip)..."
              required
              className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Step-by-Step Resolution */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Step-by-Step Resolution Procedure *</label>
            <textarea
              rows={4}
              value={resolutionSteps}
              onChange={(e) => setResolutionSteps(e.target.value)}
              placeholder="1. Clean Z-axis ball screw...\n2. Check PT100 resistance...\n3. Replace 24V relay..."
              required
              className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Tags (Comma Separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. HOMAG, CNC, Servo, Error E-404, PT100"
              className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Media Attachments Dropzone */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 block">Attach Media Proof (Photos, Voice Notes, Videos)</label>
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-stone-50 p-4 text-center space-y-2">
              <Upload className="h-5 w-5 text-slate-400 mx-auto" />
              <p className="text-slate-500 text-[11px]">
                Upload photos, audio notes (`.mp3`, `.wav`), or video clips (`.mp4`)
              </p>
              <input
                type="file"
                multiple
                accept="image/*,audio/*,video/*,.heic,.mp3,.wav,.mp4"
                onChange={handleFileUpload}
                className="hidden"
                id="solution-file-input"
              />
              <label
                htmlFor="solution-file-input"
                className="inline-block rounded-xl bg-white border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-stone-100 cursor-pointer shadow-xs transition-all"
              >
                {uploading ? 'Uploading Files...' : 'Browse Media Files'}
              </label>
            </div>

            {/* Uploaded Files Preview */}
            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-stone-100 rounded-xl p-2 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      {att.file_type === 'photo' && <Image className="h-4 w-4 text-slate-600" />}
                      {att.file_type === 'audio' && <Mic className="h-4 w-4 text-slate-600" />}
                      {att.file_type === 'video' && <Video className="h-4 w-4 text-slate-600" />}
                      <span className="font-medium text-slate-800 truncate">{att.file_name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-stone-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 font-bold text-slate-950 shadow-xs transition-all disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {submitting ? 'Saving Solution...' : 'Save to Solution Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
