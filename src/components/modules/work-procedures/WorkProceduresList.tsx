'use client';

import React, { useEffect, useState } from 'react';
import { WorkProcedure } from '@/types/workProcedure';
import { getWorkProcedures } from '@/lib/services/workProcedureService';
import { CreateProcedureModal } from './CreateProcedureModal';
import { Search, Plus, CheckSquare, Clock, ShieldAlert, FileText, ChevronRight, Sparkles } from 'lucide-react';

export function WorkProceduresList() {
  const [procedures, setProcedures] = useState<WorkProcedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<WorkProcedure | null>(null);

  const loadProcedures = async () => {
    setLoading(true);
    const data = await getWorkProcedures(categoryFilter);
    setProcedures(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProcedures();
  }, [categoryFilter]);

  const filteredProcedures = procedures.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.procedure_number.toLowerCase().includes(search.toLowerCase()) ||
      p.machine_category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Work Procedures & Checklists</h1>
            <span className="bg-amber-500/10 text-amber-900 border border-amber-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Module 4 SOP Master
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard Operating Procedures (SOPs), mandatory checklists, and time estimation templates
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all"
        >
          <Plus className="h-4 w-4" /> Create Work Procedure
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search procedure title, SOP code, machine type..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Machine Categories</option>
          <option value="CNC Processing Center">CNC Processing Center</option>
          <option value="Edgebander">Edgebander</option>
          <option value="Panel Saw">Panel Saw</option>
          <option value="Boring & Drilling Machine">Boring & Drilling Machine</option>
        </select>
      </div>

      {/* Procedure Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading Work Procedures catalog...</div>
      ) : filteredProcedures.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
          <CheckSquare className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No Work Procedures found</p>
          <p className="text-xs text-slate-400">Create your first standard procedure to attach to work orders</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProcedures.map((proc) => (
            <div
              key={proc.id}
              onClick={() => setSelectedProcedure(proc)}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    {proc.procedure_number}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-stone-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" /> {proc.total_estimated_minutes} mins (4.05)
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                    {proc.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{proc.machine_category}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{proc.description}</p>

                {proc.safety_ppe_notes && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50/60 p-2 rounded-lg border border-amber-100 line-clamp-1">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>{proc.safety_ppe_notes}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium flex items-center gap-1">
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-500" /> {proc.steps?.length || 0} Standard Steps
                </span>
                <span className="font-semibold text-amber-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  View Steps <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Procedure Drawer Modal */}
      {selectedProcedure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-stone-50">
              <div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  {selectedProcedure.procedure_number}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">{selectedProcedure.title}</h2>
              </div>
              <button onClick={() => setSelectedProcedure(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span>Category: <strong className="text-slate-800">{selectedProcedure.machine_category}</strong></span>
                <span>Estimated Time: <strong className="text-slate-800">{selectedProcedure.total_estimated_minutes} minutes</strong></span>
                <span>Created by: <strong className="text-slate-800">{selectedProcedure.created_by_name}</strong></span>
              </div>

              <p className="text-xs text-slate-700 bg-stone-50 p-3 rounded-xl">{selectedProcedure.description}</p>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Step-by-Step Procedure Checklist</h3>
                <div className="space-y-2">
                  {(selectedProcedure.steps || []).map((step) => (
                    <div key={step.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          Step #{step.step_number}: {step.step_title}
                        </span>
                        <div className="flex items-center gap-2">
                          {step.is_mandatory && (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-xs">
                              MANDATORY (4.02)
                            </span>
                          )}
                          {step.requires_photo_proof && (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-xs">
                              PHOTO PROOF (4.03)
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-semibold">{step.estimated_minutes}m</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">{step.instructions}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-stone-50 flex justify-end">
              <button
                onClick={() => setSelectedProcedure(null)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateProcedureModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProcedureCreated={loadProcedures}
      />
    </div>
  );
}
