'use client';

import React, { useState } from 'react';
import { X, Plus, Wrench, MapPin, DollarSign, Clock, Layers, ShieldCheck, Tag } from 'lucide-react';
import { CreateToolInput, ToolCategory } from '@/types/tool';
import { TOOL_CATEGORY_LABELS } from './ToolFilters';

interface ToolModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateToolInput) => Promise<void>;
  machineTypes: string[];
}

export default function ToolModalForm({
  isOpen,
  onClose,
  onSubmit,
  machineTypes,
}: ToolModalFormProps) {
  const [formData, setFormData] = useState<CreateToolInput>({
    name: '',
    description: '',
    category: 'saw_blades',
    compatible_machine_type: 'CNC Panel Saw',
    storage_location: 'Tool Crib Rack T-01 / Bin 04',
    adapter_code: '',
    serial_number: '',
    tool_type_spec: 'Carbide Tipped (HW)',
    diameter_mm: 300,
    length_mm: 3.2,
    bore_mm: 30,
    teeth_count: 72,
    quantity_available: 2,
    min_quantity: 2,
    lead_time_days: 7,
    unit_cost: 8500,
    max_sharpening_cycles: 6,
    max_meters_per_cycle: 6000,
    vendor_name: 'Leitz Tooling India',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Tool name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save cutting tool.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header (Clean Light Theme) */}
        <div className="bg-stone-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center text-amber-600 font-bold">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Register New Industrial Tool</h3>
              <p className="text-xs text-slate-500">
                Configure tool specs, adapter mapping, sharpening limits & ERP threshold
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-white transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tool Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Homag Main Saw Blade 300x30 Z72"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 font-medium"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tool Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as ToolCategory })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 font-semibold"
              >
                {(Object.keys(TOOL_CATEGORY_LABELS) as ToolCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {TOOL_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            {/* Machine Compatibility */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Compatible Machine
              </label>
              <input
                type="text"
                list="machine-list-tools"
                value={formData.compatible_machine_type}
                onChange={(e) =>
                  setFormData({ ...formData, compatible_machine_type: e.target.value })
                }
                placeholder="e.g. CNC Panel Saw"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
              />
              <datalist id="machine-list-tools">
                {machineTypes.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Adapter Code & Serial (Requirement 9.02) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-600" /> Adapter / Collet Code (Optional)
              </label>
              <input
                type="text"
                value={formData.adapter_code || ''}
                onChange={(e) => setFormData({ ...formData, adapter_code: e.target.value })}
                placeholder="e.g. ADP-5012"
                className="w-full px-3 py-1.5 border border-amber-300 rounded-lg text-xs bg-white text-slate-900 font-mono font-bold"
              />
              <span className="text-[10px] text-amber-800 mt-1 block">
                Allows scanning adapter code when tool markings are obscured inside collet.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" /> Serial Number / Tool Spec
              </label>
              <input
                type="text"
                value={formData.serial_number || ''}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                placeholder="e.g. SN-HW-9901"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Dimensions (Requirement 9.04) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Diameter (mm)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.diameter_mm || ''}
                onChange={(e) =>
                  setFormData({ ...formData, diameter_mm: parseFloat(e.target.value) || undefined })
                }
                placeholder="300"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Length (mm)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.length_mm || ''}
                onChange={(e) =>
                  setFormData({ ...formData, length_mm: parseFloat(e.target.value) || undefined })
                }
                placeholder="3.2"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Bore (mm)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.bore_mm || ''}
                onChange={(e) =>
                  setFormData({ ...formData, bore_mm: parseFloat(e.target.value) || undefined })
                }
                placeholder="30"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Teeth / Flutes
              </label>
              <input
                type="number"
                value={formData.teeth_count || ''}
                onChange={(e) =>
                  setFormData({ ...formData, teeth_count: parseInt(e.target.value) || undefined })
                }
                placeholder="72"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-900"
              />
            </div>
          </div>

          {/* Sharpening Telemetry Config (Requirement 9.04 & 9.08) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Sharpening Cycles Allowed
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={formData.max_sharpening_cycles}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_sharpening_cycles: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-900 font-bold"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Tool is flagged as scrapped once this limit is reached.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Cut Meters Per Cycle (Threshold)
              </label>
              <input
                type="number"
                min={500}
                step={500}
                value={formData.max_meters_per_cycle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_meters_per_cycle: parseFloat(e.target.value) || 1000,
                  })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-900 font-bold"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                System automatically flags tool as &apos;dull&apos; when meters reach this limit.
              </span>
            </div>
          </div>

          {/* Quantities & Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Qty Available
              </label>
              <input
                type="number"
                min={0}
                value={formData.quantity_available}
                onChange={(e) =>
                  setFormData({ ...formData, quantity_available: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Reorder Threshold
              </label>
              <input
                type="number"
                min={1}
                value={formData.min_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Price (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.unit_cost}
                onChange={(e) =>
                  setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          {/* Location & Vendor (Requirement 9.11) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" /> Storage Location
              </label>
              <input
                type="text"
                value={formData.storage_location}
                onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                placeholder="Tool Crib Rack T-01 / Bin 04"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Vendor & Delivery Lead Time
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                  placeholder="Vendor Name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white text-slate-900"
                />
                <input
                  type="number"
                  min={1}
                  value={formData.lead_time_days}
                  onChange={(e) =>
                    setFormData({ ...formData, lead_time_days: parseInt(e.target.value) || 1 })
                  }
                  className="w-20 px-2 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-900 text-center font-bold"
                  title="Lead time in days"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving Tool...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Save Industrial Tool
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
