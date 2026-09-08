'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Building2,
  SlidersHorizontal,
  PackageCheck,
  PackageX,
  History,
  Info,
  QrCode,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { SparePart, SparePartCategory, StockMovement, StockMovementType } from '@/types/sparePart';
import { CATEGORY_LABELS } from './SparePartFilters';
import { fetchStockMovements, adjustSparePartStock } from '@/lib/services/sparePartService';

interface SparePartDetailsDrawerProps {
  part: SparePart | null;
  isOpen: boolean;
  onClose: () => void;
  onStockUpdated: () => void;
}

export default function SparePartDetailsDrawer({
  part,
  isOpen,
  onClose,
  onStockUpdated,
}: SparePartDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'specs' | 'adjust' | 'history'>('specs');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);

  // Stock adjustment state
  const [adjustmentQty, setAdjustmentQty] = useState<number>(1);
  const [movementType, setMovementType] = useState<StockMovementType>('inbound_receipt');
  const [performedBy, setPerformedBy] = useState<string>('Storekeeper');
  const [notes, setNotes] = useState<string>('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState(false);

  useEffect(() => {
    if (part && isOpen) {
      loadHistory();
      setAdjustSuccess(false);
    }
  }, [part, isOpen]);

  const loadHistory = async () => {
    if (!part) return;
    try {
      setIsLoadingMovements(true);
      const data = await fetchStockMovements(part.id);
      setMovements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMovements(false);
    }
  };

  if (!isOpen || !part) return null;

  const isOutOfStock = part.quantity_available <= 0;
  const isLowStock = !isOutOfStock && part.quantity_available <= part.min_quantity;

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustmentQty === 0) return;

    try {
      setIsAdjusting(true);
      const qtyChange = movementType === 'outbound_workorder' ? -Math.abs(adjustmentQty) : Math.abs(adjustmentQty);

      await adjustSparePartStock(part.id, qtyChange, movementType, notes, performedBy);
      setAdjustSuccess(true);
      onStockUpdated();
      loadHistory();
      setTimeout(() => {
        setAdjustSuccess(false);
        setActiveTab('history');
      }, 1200);
    } catch (err) {
      console.error('Error adjusting stock:', err);
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {part.part_number}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {CATEGORY_LABELS[part.category as SparePartCategory] || part.category}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{part.name}</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Storage: {part.storage_location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-xs font-semibold border-b-2 px-3 transition-colors flex items-center gap-1.5 ${
              activeTab === 'specs'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Info className="w-3.5 h-3.5" /> Technical Specs
          </button>

          <button
            onClick={() => setActiveTab('adjust')}
            className={`pb-3 text-xs font-semibold border-b-2 px-3 transition-colors flex items-center gap-1.5 ${
              activeTab === 'adjust'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust Stock
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs font-semibold border-b-2 px-3 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Audit Trail
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Technical Specs */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              {/* Stock Overview Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Available Quantity</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-bold text-slate-900">
                      {part.quantity_available}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {part.unit_of_measure}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Min Threshold: {part.min_quantity} {part.unit_of_measure}
                  </span>
                </div>

                <div className="text-right">
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      <PackageX className="w-3.5 h-3.5" /> Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      <PackageX className="w-3.5 h-3.5" /> Low Stock Alert
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <PackageCheck className="w-3.5 h-3.5" /> Healthy Level
                    </span>
                  )}
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Machine Compatibility
                  </span>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {part.compatible_machine_type}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Lead Time (PR to Delivery)
                  </span>
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> {part.lead_time_days} Days
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Unit Price & Stock Value
                  </span>
                  <span className="text-xs font-semibold text-slate-900 block">
                    ₹{part.unit_cost.toLocaleString('en-IN')} / {part.unit_of_measure}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Valuation: ₹{(part.unit_cost * part.quantity_available).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Vendor / Supplier
                  </span>
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" /> {part.vendor_name}
                  </span>
                </div>
              </div>

              {/* Description */}
              {part.description && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Part Description & Notes
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {part.description}
                  </p>
                </div>
              )}

              {/* QR Tag */}
              <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-xl">
                <div className="flex items-center gap-3">
                  <QrCode className="w-8 h-8 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold block text-white">Warehouse QR Tag</span>
                    <span className="text-[11px] font-mono text-slate-400">{part.qr_code || `QR-${part.part_number}`}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Printing QR Label for ${part.part_number}...`)}
                  className="px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors"
                >
                  Print QR Tag
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Adjust Stock */}
          {activeTab === 'adjust' && (
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              {adjustSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Stock quantity adjusted successfully!
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
                <span className="text-xs text-amber-900 font-medium block">
                  Current Stock: <strong>{part.quantity_available} {part.unit_of_measure}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Movement Type
                </label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as StockMovementType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white text-slate-900"
                >
                  <option value="inbound_receipt">+ Inbound Stock Receipt</option>
                  <option value="outbound_workorder">- Outbound Work Order Issue</option>
                  <option value="manual_adjustment">Manual Adjustment / Stock Audit</option>
                  <option value="return">+ Return to Store</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity ({part.unit_of_measure})
                </label>
                <input
                  type="number"
                  min={1}
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Performed By
                </label>
                <input
                  type="text"
                  value={performedBy}
                  onChange={(e) => setPerformedBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Work Order Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Issued for Breakdown Ticket WO-2026-8801 or annual store audit"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white text-slate-900 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isAdjusting}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isAdjusting ? 'Recording Movement...' : 'Confirm Stock Adjustment'}
              </button>
            </form>
          )}

          {/* TAB 3: Audit Trail */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Stock Movement History
              </h4>

              {isLoadingMovements ? (
                <p className="text-xs text-slate-500">Loading audit history...</p>
              ) : movements.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No stock movement logs recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {movements.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 capitalize">
                            {m.movement_type.replace('_', ' ')}
                          </span>
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                              m.quantity_change > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change} {part.unit_of_measure}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">{m.notes || 'Routine movement'}</p>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          By {m.performed_by_name} • {new Date(m.created_at).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="text-right text-[11px] text-slate-500">
                        <span>Prev: {m.previous_quantity}</span>
                        <br />
                        <span className="font-bold text-slate-800">New: {m.new_quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
