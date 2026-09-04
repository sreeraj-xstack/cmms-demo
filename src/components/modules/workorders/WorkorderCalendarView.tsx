'use client';

import React, { useState } from 'react';
import { WorkOrder } from '@/types/workorder';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, AlertTriangle, UserCheck } from 'lucide-react';

interface WorkorderCalendarViewProps {
  workOrders: WorkOrder[];
  onSelectWorkOrder: (wo: WorkOrder) => void;
}

export function WorkorderCalendarView({
  workOrders,
  onSelectWorkOrder,
}: WorkorderCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfWeek = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getStatusColor = (status: string, isOverdue: boolean) => {
    if (isOverdue && status !== 'closed') return 'bg-red-500 text-white border-red-600';
    switch (status) {
      case 'repairing':
        return 'bg-blue-600 text-white border-blue-700';
      case 'waiting_on_sparepart':
        return 'bg-amber-500 text-slate-950 border-amber-600';
      case 'troubleshooting':
        return 'bg-purple-600 text-white border-purple-700';
      case 'on_hold':
        return 'bg-slate-500 text-white border-slate-600';
      case 'closed':
        return 'bg-emerald-600 text-white border-emerald-700';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
      {/* Calendar Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Workorder Calendar View (3.12)
            </h2>
            <p className="text-xs text-slate-500 font-medium">Interactive monthly machine reservation & schedule grid</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={prevMonth}
              className="p-1 text-slate-600 hover:bg-white rounded-lg transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 min-w-[140px] text-center text-slate-900">{monthName}</span>
            <button
              onClick={nextMonth}
              className="p-1 text-slate-600 hover:bg-white rounded-lg transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty padding cells before first day of month */}
        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-28 bg-slate-50/50 rounded-xl border border-slate-100" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNumber = idx + 1;
          const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);

          // Find work orders scheduled on this date
          const dayWorkOrders = workOrders.filter((wo) => {
            const start = new Date(wo.scheduled_start_time);
            return (
              start.getDate() === dayNumber &&
              start.getMonth() === currentDate.getMonth() &&
              start.getFullYear() === currentDate.getFullYear()
            );
          });

          const isToday =
            new Date().getDate() === dayNumber &&
            new Date().getMonth() === currentDate.getMonth() &&
            new Date().getFullYear() === currentDate.getFullYear();

          return (
            <div
              key={dayNumber}
              className={`h-32 p-1.5 rounded-xl border flex flex-col justify-between overflow-hidden transition-all ${
                isToday
                  ? 'border-amber-400 bg-amber-50/20 shadow-xs ring-1 ring-amber-400/50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                    isToday ? 'bg-amber-500 text-slate-950' : 'text-slate-700'
                  }`}
                >
                  {dayNumber}
                </span>
                {dayWorkOrders.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1 rounded-xs">
                    {dayWorkOrders.length} WOs
                  </span>
                )}
              </div>

              {/* Work Orders List on Day */}
              <div className="flex-1 space-y-1 overflow-y-auto pr-0.5">
                {dayWorkOrders.map((wo) => {
                  const isOverdue =
                    new Date(wo.scheduled_end_time).getTime() < Date.now() && wo.status !== 'closed';

                  return (
                    <div
                      key={wo.id}
                      onClick={() => onSelectWorkOrder(wo)}
                      className={`text-[10px] p-1.5 rounded-lg border font-semibold cursor-pointer truncate hover:opacity-90 transition-all ${getStatusColor(
                        wo.status,
                        isOverdue
                      )}`}

                      title={`${wo.work_order_number}: ${wo.title} (${wo.status})`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="truncate">{wo.work_order_number}</span>
                        {isOverdue && <AlertTriangle className="h-3 w-3 shrink-0" />}
                      </div>
                      <p className="truncate font-medium opacity-90">{wo.asset?.name || wo.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
