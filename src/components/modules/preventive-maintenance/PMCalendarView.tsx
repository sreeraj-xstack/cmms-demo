'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Wrench,
  User,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  ExternalLink
} from 'lucide-react';
import { PMCalendarEvent, PMCalendarFilterState } from '@/types/preventiveMaintenance';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface PMCalendarViewProps {
  events: PMCalendarEvent[];
  filters: PMCalendarFilterState;
  onEventClick?: (event: PMCalendarEvent) => void;
}

export default function PMCalendarView({ events, filters, onEventClick }: PMCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<PMCalendarEvent | null>(null);

  const activeViewMode = filters.viewMode || filters.view_mode || 'month';
  const searchQ = (filters.search || filters.search_query || '').toLowerCase();

  // 1. Filter events by search query
  const filteredEvents = events.filter((evt) => {
    if (searchQ) {
      const matchTitle = evt.title.toLowerCase().includes(searchQ);
      const matchAsset = evt.asset_name.toLowerCase().includes(searchQ);
      if (!matchTitle && !matchAsset) return false;
    }
    return true;
  });

  // 2. Navigation Handlers per View Mode
  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (activeViewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (activeViewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (activeViewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (activeViewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Helper: Format Date String YYYY-MM-DD
  const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Helper: Get Events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return filteredEvents.filter((evt) => evt.start_date.startsWith(dateKey));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper: Badge styling by work type
  const getWorkTypeBadge = (type: string) => {
    switch (type) {
      case 'preventive_maintenance':
        return (
          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 rounded-md">
            Preventive PM
          </span>
        );
      case 'breakdown_repair':
        return (
          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-100 text-red-900 border border-red-300 rounded-md">
            Breakdown Repair
          </span>
        );
      case 'inspection':
        return (
          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300 rounded-md">
            Inspection
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300 rounded-md">
            {type}
          </span>
        );
    }
  };

  // ============================================================================
  // CALENDAR VIEW RENDERERS
  // ============================================================================

  // --- A. MONTH VIEW ---
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    return (
      <div className="space-y-2">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {daysOfWeek.map((d) => (
            <div key={d} className="py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Blank Padding Cells */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[110px] bg-stone-50/50 rounded-xl border border-slate-100 opacity-40" />
          ))}

          {/* Month Day Cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateObj = new Date(year, month, dayNum);
            const dayEvents = getEventsForDate(dateObj);
            const isToday = formatDateKey(new Date()) === formatDateKey(dateObj);

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[115px] p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isToday
                    ? 'bg-amber-50/90 border-amber-400 shadow-xs'
                    : 'bg-stone-50/60 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] text-amber-900 font-extrabold bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-300">
                      {dayEvents.length} Event{dayEvents.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Day Events Stack */}
                <div className="space-y-1 overflow-y-auto max-h-[85px] custom-scrollbar">
                  {dayEvents.slice(0, 3).map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => {
                        setSelectedEvent(evt);
                        if (onEventClick) onEventClick(evt);
                      }}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-[10px] cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all shadow-2xs"
                    >
                      <p className="font-bold text-slate-900 truncate leading-tight">{evt.title}</p>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 mt-0.5">
                        <span className="truncate max-w-[60%] font-medium">{evt.asset_name}</span>
                        <span className="font-bold uppercase text-amber-700">{evt.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-[9px] text-slate-500 font-bold text-center">
                      +{dayEvents.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- B. WEEK VIEW ---
  const renderWeekView = () => {
    // Compute current week's 7 days (Starting Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((dayDate, idx) => {
          const dayEvents = getEventsForDate(dayDate);
          const isToday = formatDateKey(new Date()) === formatDateKey(dayDate);

          return (
            <div
              key={idx}
              className={`rounded-2xl border p-3 flex flex-col min-h-[350px] ${
                isToday
                  ? 'bg-amber-50/60 border-amber-400 shadow-xs'
                  : 'bg-stone-50/50 border-slate-200'
              }`}
            >
              {/* Day Column Header */}
              <div className="pb-2 mb-3 border-b border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {daysOfWeek[dayDate.getDay()]}
                </span>
                <span
                  className={`inline-block mt-0.5 text-sm font-black px-2 py-0.5 rounded-full ${
                    isToday ? 'bg-amber-500 text-slate-950' : 'text-slate-900'
                  }`}
                >
                  {dayDate.getDate()} {monthNames[dayDate.getMonth()].slice(0, 3)}
                </span>
              </div>

              {/* Day Events Stack */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {dayEvents.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic text-center py-6">No routines</p>
                ) : (
                  dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => {
                        setSelectedEvent(evt);
                        if (onEventClick) onEventClick(evt);
                      }}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1.5 cursor-pointer hover:border-amber-400 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {evt.id.startsWith('wo-') ? 'WO' : 'PM'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 capitalize">
                          {evt.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="font-bold text-slate-900 leading-snug line-clamp-2">{evt.title}</p>

                      <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                        <p className="font-semibold text-slate-700 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate">{evt.asset_name}</span>
                        </p>
                        <p className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{evt.assigned_technician_name}</span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // --- C. DAY VIEW (Hour-by-Hour Agenda) ---
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 AM to 7:00 PM

    return (
      <div className="space-y-4">
        {/* Day Summary Card */}
        <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Agenda for {daysOfWeek[currentDate.getDay()]}, {currentDate.getDate()}{' '}
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            <p className="text-xs text-slate-600">
              {dayEvents.length} maintenance task{dayEvents.length !== 1 ? 's' : ''} scheduled for today
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-black bg-amber-500 text-slate-950 rounded-xl shadow-2xs">
            {dayEvents.length} Scheduled
          </span>
        </div>

        {/* Hourly Timeline */}
        <div className="bg-stone-50/50 border border-slate-200 rounded-2xl p-4 divide-y divide-slate-200">
          {hours.map((hour) => {
            const timeLabel = `${String(hour).padStart(2, '0')}:00`;
            // Map events loosely across morning/afternoon slots
            const slotEvents = dayEvents.filter((_, idx) => (idx % 12) === (hour - 8));

            return (
              <div key={hour} className="py-3 flex items-start gap-4">
                <div className="w-16 font-mono text-xs font-bold text-slate-400 shrink-0">
                  {timeLabel}
                </div>

                <div className="flex-1 min-h-[40px] space-y-2">
                  {slotEvents.length === 0 ? (
                    <div className="h-full border-b border-dashed border-slate-200 text-[11px] text-slate-300 py-1">
                      No active task block
                    </div>
                  ) : (
                    slotEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => {
                          setSelectedEvent(evt);
                          if (onEventClick) onEventClick(evt);
                        }}
                        className="p-3 bg-white border border-amber-300 rounded-xl shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-amber-500 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getWorkTypeBadge(evt.work_type)}
                            <h5 className="text-xs font-bold text-slate-900">{evt.title}</h5>
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-3">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <Cpu className="w-3 h-3 text-amber-600" /> {evt.asset_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" /> {evt.assigned_technician_name}
                            </span>
                          </p>
                        </div>

                        <span className="px-2.5 py-1 text-[11px] font-bold text-amber-900 bg-amber-100 rounded-lg border border-amber-300 capitalize">
                          {evt.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Header Title Text depending on View Mode
  const getHeaderTitle = () => {
    if (activeViewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (activeViewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `Week of ${startOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()].slice(0, 3)} - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()].slice(0, 3)} ${endOfWeek.getFullYear()}`;
    } else {
      return `${daysOfWeek[currentDate.getDay()]}, ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Calendar Top Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {getHeaderTitle()}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Sobha Industrial PM & Maintenance Work Order Calendar • Active Mode: <span className="capitalize font-bold text-amber-700">{activeViewMode}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={navigateToday}
            className="px-3 py-1.5 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-slate-700 border border-slate-200 rounded-xl transition-colors"
          >
            Today
          </button>
          <div className="inline-flex rounded-xl border border-slate-200 bg-stone-50">
            <button
              onClick={navigatePrev}
              title="Previous"
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-stone-200 rounded-l-xl transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={navigateNext}
              title="Next"
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-stone-200 rounded-r-xl transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main View Renderer */}
      {activeViewMode === 'month' && renderMonthView()}
      {activeViewMode === 'week' && renderWeekView()}
      {activeViewMode === 'day' && renderDayView()}

      {/* Calendar Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          subtitle={`Execution Date: ${selectedEvent.start_date}`}
          icon={<Clock className="w-5 h-5" />}
          maxWidth="md"
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              {getWorkTypeBadge(selectedEvent.work_type)}
              <StatusBadge status={selectedEvent.status} />
            </div>

            <div className="p-4 bg-stone-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Target Asset:</span>
                <span className="font-bold text-slate-900">{selectedEvent.asset_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Assigned Personnel:</span>
                <span className="font-bold text-slate-900">{selectedEvent.assigned_technician_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Schedule ID:</span>
                <span className="font-mono font-bold text-amber-800">{selectedEvent.reference_id}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-600 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
