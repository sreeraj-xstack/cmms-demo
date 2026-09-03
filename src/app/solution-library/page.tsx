'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  SolutionItem,
  MachineManual,
  SolutionFiltersState,
  CreateSolutionInput,
} from '@/types/solutionLibrary';
import {
  fetchSolutions,
  createSolution,
  incrementSolutionSuccessCount,
  verifySolutionByManager,
  fetchMachineManuals,
} from '@/lib/services/solutionLibraryService';
import { SolutionFilters } from '@/components/modules/solution-library/SolutionFilters';
import { SolutionCard } from '@/components/modules/solution-library/SolutionCard';
import { SolutionDetailsModal } from '@/components/modules/solution-library/SolutionDetailsModal';
import { CreateSolutionModal } from '@/components/modules/solution-library/CreateSolutionModal';
import { AISearchAssistantModal } from '@/components/modules/solution-library/AISearchAssistantModal';
import { MachineManualsSection } from '@/components/modules/solution-library/MachineManualsSection';

import {
  BookOpen,
  Plus,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';

function SolutionLibraryContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState<'solutions' | 'manuals'>('solutions');
  const [solutions, setSolutions] = useState<SolutionItem[]>([]);
  const [manuals, setManuals] = useState<MachineManual[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAISearchOpen, setIsAISearchOpen] = useState(Boolean(initialSearchQuery));
  const [selectedSolution, setSelectedSolution] = useState<SolutionItem | null>(null);

  const [filters, setFilters] = useState<SolutionFiltersState>({
    search: initialSearchQuery,
    machineType: 'all',
    issueCategory: 'all',
    verifiedOnly: false,
  });

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [solutionsData, manualsData] = await Promise.all([
        fetchSolutions(filters),
        fetchMachineManuals(),
      ]);
      setSolutions(solutionsData);
      setManuals(manualsData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load Solution Library data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  useEffect(() => {
    if (initialSearchQuery) {
      setIsAISearchOpen(true);
    }
  }, [initialSearchQuery]);

  const stats = useMemo(() => {
    return {
      totalSolutions: solutions.length,
      verifiedCount: solutions.filter((s) => s.verified_by_manager).length,
      totalManuals: manuals.length,
      totalUpvotes: solutions.reduce((acc, s) => acc + (s.success_count || 0), 0),
    };
  }, [solutions, manuals]);

  const handleCreateSolution = async (input: CreateSolutionInput) => {
    setErrorMessage(null);
    try {
      const userName = user?.full_name || user?.email?.split('@')[0] || 'Plant Engineer';
      const userRole = user?.role || 'engineer';
      await createSolution(input, userName, userRole, user?.id);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save solution.');
    }
  };

  const handleUpvote = async (solutionId: string) => {
    // Optimistically update local array state so cards don't re-render or shuffle position
    setSolutions((prev) =>
      prev.map((s) =>
        s.id === solutionId ? { ...s, success_count: (s.success_count || 0) + 1 } : s
      )
    );
    if (selectedSolution && selectedSolution.id === solutionId) {
      setSelectedSolution({
        ...selectedSolution,
        success_count: (selectedSolution.success_count || 0) + 1,
      });
    }

    // Persist in Supabase in background
    await incrementSolutionSuccessCount(solutionId);
  };

  const handleVerify = async (solutionId: string, managerName: string) => {
    // Optimistically update local state
    setSolutions((prev) =>
      prev.map((s) =>
        s.id === solutionId
          ? { ...s, verified_by_manager: true, verified_by_name: managerName }
          : s
      )
    );
    if (selectedSolution && selectedSolution.id === solutionId) {
      setSelectedSolution({
        ...selectedSolution,
        verified_by_manager: true,
        verified_by_name: managerName,
      });
    }

    await verifySolutionByManager(solutionId, managerName);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="pl-64">
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-6">
          {/* Header Title & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-500" />
                Solution Library & AI Knowledge Vault
              </h1>
              <p className="text-xs text-slate-500">
                Verified repair procedures, AI semantic solution matcher, and OEM machine manual repository
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-50 transition-all shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={() => setIsAISearchOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all"
              >
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                AI Solution Matcher
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-xs transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Solution
              </button>
            </div>
          </div>

          {/* Database Error Notice */}
          {errorMessage && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Database Notice</p>
                <p>{errorMessage}</p>
                <p className="text-[11px] text-amber-700">
                  Make sure you have executed <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">04_solution_library_schema.sql</code> in your Supabase SQL Editor.
                </p>
              </div>
            </div>
          )}

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Solutions</span>
              <p className="text-xl font-bold text-slate-900">{stats.totalSolutions}</p>
              <p className="text-[10px] text-slate-400">Verified Repair Fixes</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" /> Manager Verified
              </span>
              <p className="text-xl font-bold text-slate-900">{stats.verifiedCount}</p>
              <p className="text-[10px] text-slate-400">Signed Off Solutions</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider block flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" /> Total Fix Count
              </span>
              <p className="text-xl font-bold text-slate-900">{stats.totalUpvotes}</p>
              <p className="text-[10px] text-slate-400">Successful Repair Upvotes</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-slate-400" /> OEM Manuals
              </span>
              <p className="text-xl font-bold text-slate-900">{stats.totalManuals}</p>
              <p className="text-[10px] text-slate-400">PDF Technical Manuals</p>
            </div>
          </div>

          {/* Tab Navigation (Solution Vault vs OEM Machine Manuals) */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('solutions')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'solutions'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-stone-50'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Solution Knowledge Vault ({solutions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('manuals')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'manuals'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-stone-50'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>OEM Machine Manuals ({manuals.length})</span>
            </button>
          </div>

          {/* Main Tab Content */}
          {activeTab === 'solutions' ? (
            <div className="space-y-4">
              {/* Search & Multi-Filters */}
              <SolutionFilters
                filters={filters}
                onFilterChange={setFilters}
                onOpenAISearch={() => setIsAISearchOpen(true)}
              />

              {/* Solution Cards Grid */}
              {solutions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {solutions.map((s) => (
                    <SolutionCard
                      key={s.id}
                      solution={s}
                      onSelect={(sol) => setSelectedSolution(sol)}
                      onUpvote={handleUpvote}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 italic space-y-2 shadow-xs">
                  <p className="text-sm font-semibold text-slate-700">No solutions matched your search filters.</p>
                  <p className="text-xs text-slate-400">Click "Add Solution" or try using the AI Solution Matcher.</p>
                </div>
              )}
            </div>
          ) : (
            <MachineManualsSection
              manuals={manuals}
              onManualUploaded={loadData}
            />
          )}
        </div>
      </main>

      {/* Solution Details Drawer */}
      <SolutionDetailsModal
        solution={selectedSolution}
        onClose={() => setSelectedSolution(null)}
        onUpvote={handleUpvote}
        onVerify={handleVerify}
      />

      {/* Create Solution Modal */}
      <CreateSolutionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSolution}
      />

      {/* AI Search Assistant Drawer */}
      <AISearchAssistantModal
        isOpen={isAISearchOpen}
        initialQuery={initialSearchQuery}
        onClose={() => setIsAISearchOpen(false)}
      />
    </div>
  );
}

export default function SolutionLibraryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-semibold text-slate-500">Loading Solution Library...</div>}>
      <SolutionLibraryContent />
    </Suspense>
  );
}
