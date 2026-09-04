'use client';

import React, { useState } from 'react';
import { CreateProcedureInput, CreateStepInput } from '@/types/workProcedure';
import { createWorkProcedure } from '@/lib/services/workProcedureService';
import { X, Plus, Trash2, CheckSquare, Clock, ShieldAlert, Sparkles } from 'lucide-react';

interface CreateProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcedureCreated: () => void;
}

export function CreateProcedureModal({
  isOpen,
  onClose,
  onProcedureCreated,
}: CreateProcedureModalProps) {
  const [title, setTitle] = useState('');
  const [machineCategory, setMachineCategory] = useState('CNC Processing Center');
  const [description, setDescription] = useState('');
  const [safetyPpeNotes, setSafetyPpeNotes] = useState('');
  const [steps, setSteps] = useState<CreateStepInput[]>([
    {
      step_number: 1,
      step_title: 'Lockout & Electrical Isolation',
      instructions: 'Switch off main isolator and attach LOTO safety lock.',
      is_mandatory: true,
      requires_photo_proof: false,
      estimated_minutes: 5,
    },
    {
      step_number: 2,
      step_title: 'Component Inspection & Cleaning',
      instructions: 'Inspect linear guides and clean with compressed air.',
      is_mandatory: true,
      requires_photo_proof: true,
      estimated_minutes: 15,
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        step_number: steps.length + 1,
        step_title: '',
        instructions: '',
        is_mandatory: true,
        requires_photo_proof: false,
        estimated_minutes: 10,
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index);
    setSteps(updated.map((s, idx) => ({ ...s, step_number: idx + 1 })));
  };

  const handleStepChange = (index: number, field: keyof CreateStepInput, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || steps.length === 0) return;

    setLoading(true);
    try {
      const input: CreateProcedureInput = {
        title,
        machine_category: machineCategory,
        description,
        safety_ppe_notes: safetyPpeNotes,
        created_by_name: 'Maintenance Engineer',
        steps,
      };
      await createWorkProcedure(input);
      onProcedureCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create procedure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create Work Procedure / SOP</h2>
              <p className="text-xs text-slate-500">Define step-by-step checklists & mandatory verification rules</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Top Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Procedure Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. HOMAG CNC Spindle Alignment SOP"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Machine Category *</label>
              <select
                value={machineCategory}
                onChange={(e) => setMachineCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="CNC Processing Center">CNC Processing Center</option>
                <option value="Edgebander">Edgebander</option>
                <option value="Panel Saw">Panel Saw</option>
                <option value="Boring & Drilling Machine">Boring & Drilling Machine</option>
                <option value="Dust Extraction & Utilities">Dust Extraction & Utilities</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Procedure Description & Scope *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the operational goal and equipment scope..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 text-amber-700">
              <ShieldAlert className="h-4 w-4" /> Safety Precautions & PPE Notes
            </label>
            <input
              type="text"
              value={safetyPpeNotes}
              onChange={(e) => setSafetyPpeNotes(e.target.value)}
              placeholder="e.g. Safety goggles required. Lockout main isolator before entry."
              className="w-full text-xs px-3 py-2 border border-amber-200 bg-amber-50/30 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Procedure Steps Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" /> Procedure Execution Steps ({steps.length})
              </h3>
              <button
                type="button"
                onClick={handleAddStep}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add Step
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      Step #{idx + 1}
                    </span>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="Step Title (e.g. Clean Z-axis ball screw)"
                        value={step.step_title}
                        onChange={(e) => handleStepChange(idx, 'step_title', e.target.value)}
                        className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="number"
                          min={1}
                          max={300}
                          value={step.estimated_minutes}
                          onChange={(e) => handleStepChange(idx, 'estimated_minutes', parseInt(e.target.value) || 5)}
                          className="w-full text-xs bg-transparent focus:outline-hidden"
                        />
                        <span className="text-[10px] text-slate-400 font-semibold">mins</span>
                      </div>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Detailed instructions for maintenance engineer..."
                    value={step.instructions}
                    onChange={(e) => handleStepChange(idx, 'instructions', e.target.value)}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />

                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={step.is_mandatory}
                        onChange={(e) => handleStepChange(idx, 'is_mandatory', e.target.checked)}
                        className="rounded-xs text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs font-semibold text-slate-700">Mandatory Step (4.02)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={step.requires_photo_proof}
                        onChange={(e) => handleStepChange(idx, 'requires_photo_proof', e.target.checked)}
                        className="rounded-xs text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs font-semibold text-slate-700">Requires Photo Proof (4.03)</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              {loading ? 'Creating SOP...' : 'Save & Publish Procedure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
