'use client';

import React, { useState, useEffect } from 'react';
import { CreateTicketInput, BreakdownCategory, TicketUrgency, AttachmentFileType } from '@/types/breakdownTicket';
import { Asset } from '@/types/asset';
import { fetchAssets } from '@/lib/services/assetService';
import { MediaUploader } from './MediaUploader';
import { X, Plus, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface TicketCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTicketInput) => Promise<void>;
}

export function TicketCreateModal({ isOpen, onClose, onSubmit }: TicketCreateModalProps) {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  const [formData, setFormData] = useState<CreateTicketInput>({
    asset_id: '',
    issue_type: 'Mechanical Failure',
    breakdown_category: 'major',
    urgency_level: 'high',
    description: '',
    reported_by_name: user?.full_name || user?.email?.split('@')[0] || 'Plant User',
    reported_by: user?.id,
    attachments: [],
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAssets().then((data) => {
        setAssets(data);
        if (data.length > 0 && !formData.asset_id) {
          setFormData((prev) => ({ ...prev, asset_id: data[0].id }));
        }
        setLoadingAssets(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.asset_id) {
      alert('Please select a machinery asset from Asset Master.');
      return;
    }
    setSubmitting(true);
    await onSubmit({
      ...formData,
      reported_by_name: user?.full_name || user?.email?.split('@')[0] || 'Plant User',
      reported_by: user?.id,
    });
    setSubmitting(false);
    onClose();
  };

  const handleMediaUploaded = (media: { file_url: string; file_type: AttachmentFileType; file_name: string }) => {
    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), media],
    }));
  };

  const handleRemoveMedia = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 my-8 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Raise Breakdown Ticket
            </h2>
            <p className="text-xs text-slate-500">Report line failure or machine defect to maintenance team</p>
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
          {/* Asset Selection */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Select Machinery Asset *</label>
            {loadingAssets ? (
              <div className="text-slate-400 animate-pulse text-xs">Loading machinery assets...</div>
            ) : assets.length === 0 ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-800 text-xs">
                No assets found in Asset Master. Please create an asset first in Asset Master catalog.
              </div>
            ) : (
              <select
                value={formData.asset_id}
                onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    [{asset.asset_tag}] {asset.name} - ({asset.location})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Row 2: Category & Issue Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Breakdown Category *</label>
              <select
                value={formData.breakdown_category}
                onChange={(e) => setFormData({ ...formData, breakdown_category: e.target.value as BreakdownCategory })}
                required
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
              >
                <option value="major">🚨 Major Breakdown (Machine Standing / Line Stopped)</option>
                <option value="minor">Minor Breakdown (Line Running / Minor Defect)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Issue Type *</label>
              <select
                value={formData.issue_type}
                onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="Mechanical Failure">Mechanical Failure</option>
                <option value="Electrical Fault">Electrical Fault</option>
                <option value="Pneumatic Leak">Pneumatic Leak</option>
                <option value="Sensor Calibration">Sensor Calibration</option>
                <option value="Blade / Cutter Wear">Blade / Cutter Wear</option>
                <option value="Spindle Overheating">Spindle Overheating</option>
                <option value="Hydraulic Pressure Drop">Hydraulic Pressure Drop</option>
              </select>
            </div>
          </div>

          {/* Row 3: Urgency Level */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Urgency Level</label>
            <select
              value={formData.urgency_level}
              onChange={(e) => setFormData({ ...formData, urgency_level: e.target.value as TicketUrgency })}
              className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="critical">Critical (Immediate Stop)</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Problem Description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Problem Description *</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe exact symptoms, error codes, noise, or observed defects on the machine line..."
              required
              className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Media File Dropzone */}
          <MediaUploader
            uploadedMedia={formData.attachments || []}
            onMediaUploaded={handleMediaUploaded}
            onRemoveMedia={handleRemoveMedia}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-stone-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || assets.length === 0}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-xs transition-all disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {submitting ? 'Submitting Ticket...' : 'Submit Breakdown Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
