'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  fetchExecutiveDashboardData,
  DashboardFilterOptions,
  KPIOverview,
  ParetoItem,
  CostBreakdownItem,
  BacklogItem,
  RawCalculationRecord,
} from '@/lib/services/dashboardService';
import DashboardFiltersToolbar from '@/components/modules/dashboard/DashboardFiltersToolbar';
import CostOverviewChartComponent from '@/components/modules/dashboard/CostOverviewChartComponent';
import ParetoChartComponent from '@/components/modules/dashboard/ParetoChartComponent';
import BacklogOverviewChartComponent from '@/components/modules/dashboard/BacklogOverviewChartComponent';
import RawDataViewerModal from '@/components/modules/dashboard/RawDataViewerModal';
import ImportedDataModal from '@/components/modules/dashboard/ImportedDataModal';
import {
  BarChart3,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Layers,
  RefreshCw,
  Download,
  ShieldCheck,
  Zap,
  Activity,
  Award,
} from 'lucide-react';

export default function ExecutiveDashboardPage() {
  const [filters, setFilters] = useState<DashboardFilterOptions>({
    timeframe: '30d',
    technician: 'all',
    ticketStatus: 'all',
    dayOfWeek: 'all',
    excludeOutliers: false,
    selectedAssetIds: [],
    useImportedData: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIOverview | null>(null);
  const [paretoData, setParetoData] = useState<ParetoItem[]>([]);
  const [assetCostData, setAssetCostData] = useState<CostBreakdownItem[]>([]);
  const [trendCostData, setTrendCostData] = useState<CostBreakdownItem[]>([]);
  const [technicianBacklog, setTechnicianBacklog] = useState<BacklogItem[]>([]);
  const [assetBacklog, setAssetBacklog] = useState<BacklogItem[]>([]);
  const [rawRecords, setRawRecords] = useState<RawCalculationRecord[]>([]);
  const [allAssets, setAllAssets] = useState<{ id: string; name: string }[]>([]);

  // Modal States
  const [isRawModalOpen, setIsRawModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchExecutiveDashboardData(filters);
      setKpis(data.kpis);
      setParetoData(data.paretoData);
      setAssetCostData(data.costBreakdownByAsset);
      setTrendCostData(data.costTrendData);
      setTechnicianBacklog(data.backlogByTechnician);
      setAssetBacklog(data.backlogByAsset);
      setRawRecords(data.rawRecords);
      setAllAssets(data.allAssets.map((a: any) => ({ id: a.id, name: a.name })));
    } catch (err) {
      console.error('Error loading executive dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleExportPDFSummary = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 space-y-6 min-w-0 max-w-full overflow-x-hidden">
        {/* Top Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-amber-500" />
              Executive Maintenance & Engineering Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Plant breakdown telemetry, MTTR/MTBF KPIs, 80/20 Pareto wear analysis, repair labor & backlog overview
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDFSummary}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-stone-100 border border-slate-200 rounded-xl transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" /> Export Executive PDF
            </button>

            <button
              onClick={loadDashboardData}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-stone-100 border border-slate-200 rounded-xl transition-all shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Telemetry
            </button>
          </div>
        </div>

        {/* Global Filter Toolbar (Requirements 10.02, 10.10, 10.11, 10.13) */}
        <DashboardFiltersToolbar
          filters={filters}
          onFilterChange={setFilters}
          allAssets={allAssets}
          onOpenRawDataModal={() => setIsRawModalOpen(true)}
          onOpenImportModal={() => setIsImportModalOpen(true)}
        />

        {/* Requirement 10.01: Executive KPI Overview Row */}
        {kpis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Open & Overdue Breakdown Tickets */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Open Breakdown Tickets
                </span>
                <div className="text-2xl font-bold text-slate-900 mt-1 flex items-baseline gap-2">
                  {kpis.openBreakdowns}
                  {kpis.overdueTickets > 0 && (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      {kpis.overdueTickets} Overdue
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {kpis.resolvedToday} resolved today
                </span>
              </div>
              <div className="w-11 h-11 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* MTTR & MTBF Reliability Metrics */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Mean Time To Repair (MTTR)
                </span>
                <div className="text-2xl font-bold text-slate-900 mt-1 flex items-baseline gap-2">
                  {kpis.avgMTTRHours} hrs
                  <span className="text-xs font-semibold text-emerald-600 flex items-center">
                    <TrendingUp className="w-3 h-3 rotate-180 mr-0.5" /> -12% vs benchmark
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  MTBF: {kpis.avgMTBFHours} hrs between breakdowns
                </span>
              </div>
              <div className="w-11 h-11 bg-blue-50 text-blue-700 border border-blue-200 rounded-2xl flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* Total Maintenance Cost Attachment */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Maintenance Cost
                </span>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  ₹{kpis.totalCostINR.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Labor: ₹{kpis.laborCostINR.toLocaleString('en-IN')} • Parts: ₹{kpis.partsCostINR.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-11 h-11 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            {/* Maintenance Backlog Accumulation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Maintenance Backlog
                </span>
                <div className="text-2xl font-bold text-indigo-950 mt-1">
                  {kpis.totalBacklogHours} hrs
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Scope: {kpis.activeAssetsCount}/{kpis.totalAssetsCount} machines included
                </span>
              </div>
              <div className="w-11 h-11 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-2xl flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid Row 1: Cost Breakdown & Pareto Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requirements 10.06, 10.07, 10.09, 10.12 */}
          <CostOverviewChartComponent
            assetCostData={assetCostData}
            trendCostData={trendCostData}
          />

          {/* Requirement 10.05 */}
          <ParetoChartComponent data={paretoData} />
        </div>

        {/* Charts Grid Row 2: Maintenance Backlog & Machine Diagnostics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requirement 10.08 Maintenance Backlog Overview */}
          <div className="lg:col-span-2">
            <BacklogOverviewChartComponent
              technicianBacklog={technicianBacklog}
              assetBacklog={assetBacklog}
            />
          </div>

          {/* Plant Reliability Summary & First Time Fix Rate */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Plant Performance Scorecard</h3>
                  <p className="text-xs text-slate-500">First time fix rate & technician output</p>
                </div>
              </div>

              {/* First Time Fix Rate Gauge Card */}
              <div className="p-4 bg-stone-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span>First Time Fix Rate</span>
                  <span className="font-bold text-emerald-700">{kpis?.firstTimeFixRate || 92.4}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${kpis?.firstTimeFixRate || 92.4}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Target: &gt;90% • 9 out of 10 tickets resolved without repeat failure within 30 days
                </p>
              </div>

              {/* Machine Health Distribution */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-800">Operational Availability</span>
                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Operational Machinery
                  </span>
                  <span className="font-bold">{kpis?.activeAssetsCount || 5} Units</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Zap className="w-4 h-4 text-amber-600" /> Scheduled PM Maintenance
                  </span>
                  <span className="font-bold">1 Unit</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsRawModalOpen(true)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Activity className="w-4 h-4 text-amber-500" /> Inspect Detailed Audit Log
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        <RawDataViewerModal
          isOpen={isRawModalOpen}
          onClose={() => setIsRawModalOpen(false)}
          rawRecords={rawRecords}
        />

        <ImportedDataModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          isImportedActive={filters.useImportedData}
          onToggleImportedMode={(active) => setFilters({ ...filters, useImportedData: active })}
        />
      </main>
    </div>
  );
}
