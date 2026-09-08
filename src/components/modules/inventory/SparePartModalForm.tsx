'use client';

import React, { useState } from 'react';
import { X, Plus, Package, MapPin, DollarSign, Clock, Building2, Layers } from 'lucide-react';
import { CreateSparePartInput, SparePartCategory, UnitOfMeasure } from '@/types/sparePart';
import { CATEGORY_LABELS } from './SparePartFilters';

interface SparePartModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateSparePartInput) => Promise<void>;
  machineTypes: string[];
}

export default function SparePartModalForm({
  isOpen,
  onClose,
  onSubmit,
  machineTypes,
}: SparePartModalFormProps) {
  const [formData, setFormData] = useState<CreateSparePartInput>({
    name: '',
    description: '',
    category: 'mechanical',
    compatible_machine_type: 'General Machinery',
    storage_location: 'Rack A-01',
    unit_of_measure: 'Pcs',
    quantity_available: 10,
    min_quantity: 5,
    lead_time_days: 7,
    unit_cost: 500,
    vendor_name: 'Sobha Approved Vendor',
    vendor_code: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Part name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save spare part.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center text-amber-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Register New Spare Part</h3>
              <p className="text-xs text-slate-400">
                Add warehouse inventory item with reorder specs & location mapping
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Part Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. SKF Deep Groove Ball Bearing 6205-2RS"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Classification <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as SparePartCategory })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
              >
                {(Object.keys(CATEGORY_LABELS) as SparePartCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            {/* Machine Compatibility */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Compatible Machine / Asset Type
              </label>
              <input
                type="text"
                list="machine-types-list"
                value={formData.compatible_machine_type}
                onChange={(e) =>
                  setFormData({ ...formData, compatible_machine_type: e.target.value })
                }
                placeholder="e.g. CNC Milling Machine"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
              />
              <datalist id="machine-types-list">
                {machineTypes.map((mt) => (
                  <option key={mt} value={mt} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Storage & Lead Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            {/* Storage Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" /> Storage Location
              </label>
              <input
                type="text"
                value={formData.storage_location}
                onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                placeholder="Rack A-04 / Bin 12"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 font-medium"
              />
            </div>

            {/* Unit of Measure */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-500" /> Unit of Measure
              </label>
              <select
                value={formData.unit_of_measure}
                onChange={(e) =>
                  setFormData({ ...formData, unit_of_measure: e.target.value as UnitOfMeasure })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
              >
                <option value="Pcs">Pcs (Pieces)</option>
                <option value="Set">Set</option>
                <option value="Meters">Meters</option>
                <option value="Liters">Liters</option>
                <option value="Kg">Kg (Kilograms)</option>
                <option value="Boxes">Boxes</option>
              </select>
            </div>

            {/* Lead Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Lead Time (PR to Delivery)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={formData.lead_time_days}
                  onChange={(e) =>
                    setFormData({ ...formData, lead_time_days: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
                />
                <span className="text-xs text-slate-500 font-medium">Days</span>
              </div>
            </div>
          </div>

          {/* Quantities & Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Initial Available Qty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Available Qty
              </label>
              <input
                type="number"
                min={0}
                value={formData.quantity_available}
                onChange={(e) =>
                  setFormData({ ...formData, quantity_available: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
              />
            </div>

            {/* Minimum Reorder Qty */}
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
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
              />
            </div>

            {/* Unit Cost */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Unit Price (₹)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={formData.unit_cost}
                onChange={(e) =>
                  setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
              />
            </div>
          </div>

          {/* Vendor Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" /> Vendor / Supplier Name
              </label>
              <input
                type="text"
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                placeholder="e.g. SKF India Ltd"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor Code (Optional)
              </label>
              <input
                type="text"
                value={formData.vendor_code || ''}
                onChange={(e) => setFormData({ ...formData, vendor_code: e.target.value })}
                placeholder="e.g. VEND-8802"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Part Description & Technical Specs
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter dimensions, rating, tolerances, or replacement notes..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving Part...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Save Spare Part
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
