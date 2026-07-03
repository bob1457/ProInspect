import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Calendar, MapPin, Clock, User, 
  CheckCircle2, AlertCircle, CalendarDays, ArrowRight, ShieldAlert, ClipboardList 
} from 'lucide-react';
import { InspectionItem } from '../types';

interface InspectionCalendarProps {
  inspections: InspectionItem[];
  onAddInspectionClick: () => void;
}

export default function InspectionCalendar({ inspections, onAddInspectionClick }: InspectionCalendarProps) {
  // We'll default to June 2026 since the initial data is centered around June/July 2026
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 1)); // June 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 5, 28)); // Select June 28, 2026 by default

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to parse string dates like "Jun 25, 2026" or ISO strings
  const parseDate = (dateStr: string): Date | null => {
    const timestamp = Date.parse(dateStr);
    if (isNaN(timestamp)) return null;
    return new Date(timestamp);
  };

  // Get total days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get starting day index of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Generate list of days for current month grid
  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null); // padding for empty days at the start of the grid
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  // Get inspections for a given calendar day
  const getInspectionsForDay = (day: number, year: number, month: number): InspectionItem[] => {
    return inspections.filter(item => {
      const d = parseDate(item.date);
      if (!d) return false;
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  // Handle month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Reset to today / default date
  const resetToCurrent = () => {
    const today = new Date();
    // If our data is 2026, let's keep it in 2026 for a good demo, but support actual today
    setCurrentDate(new Date(2026, 5, 1));
    setSelectedDate(new Date(2026, 5, 28));
  };

  // Selected date inspections list
  const selectedDayInspections = selectedDate 
    ? inspections.filter(item => {
        const d = parseDate(item.date);
        if (!d) return false;
        return d.getFullYear() === selectedDate.getFullYear() && 
               d.getMonth() === selectedDate.getMonth() && 
               d.getDate() === selectedDate.getDate();
      })
    : [];

  // All upcoming scheduled inspections (ordered by date)
  const upcomingInspections = inspections
    .filter(item => {
      const d = parseDate(item.date);
      // Scheduled or In-Progress inspections in current or future days
      return item.status !== 'COMPLETED' && d !== null;
    })
    .sort((a, b) => {
      const dateA = parseDate(a.date)?.getTime() || 0;
      const dateB = parseDate(b.date)?.getTime() || 0;
      return dateA - dateB;
    });

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
      {/* Visual Header Panel */}
      <div className="p-6 bg-gradient-to-r from-slate-50 via-white to-blue-50/20 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-[#00288e]" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Inspection Schedule</h3>
            <p className="text-xs text-slate-500 font-medium">Interactive monthly tracking & assignment timeline.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={resetToCurrent}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-600 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            Demo Month (Jun '26)
          </button>
          <button 
            onClick={onAddInspectionClick}
            className="px-3.5 py-1.5 bg-[#00288e] hover:bg-[#1e40af] text-[11px] font-bold text-white rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
          >
            Schedule Item
          </button>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-150">
        
        {/* Calendar Left Panel (8 Columns) */}
        <div className="lg:col-span-7 p-6 space-y-4">
          
          {/* Calendar Controller bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 font-sans tracking-tight">
                {monthNames[currentMonth]}
              </span>
              <span className="font-bold text-slate-400 text-lg font-mono">
                {currentYear}
              </span>
            </div>
            
            <div className="flex items-center gap-1 border border-slate-200 rounded-xl bg-slate-50/50 p-1">
              <button 
                onClick={prevMonth}
                className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 text-center border-b border-slate-100 pb-2.5">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
              <span key={idx} className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                {day}
              </span>
            ))}
          </div>

          {/* Monthly Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-y-2.5 gap-x-1.5">
            {daysArray.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="h-10 md:h-12" />;
              }

              const isToday = new Date().getDate() === dayNum && 
                              new Date().getMonth() === currentMonth && 
                              new Date().getFullYear() === currentYear;

              const isSelected = selectedDate !== null && 
                                 selectedDate.getDate() === dayNum && 
                                 selectedDate.getMonth() === currentMonth && 
                                 selectedDate.getFullYear() === currentYear;

              const dayInspections = getInspectionsForDay(dayNum, currentYear, currentMonth);
              const hasInspections = dayInspections.length > 0;

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(new Date(currentYear, currentMonth, dayNum))}
                  className={`h-11 md:h-14 rounded-xl flex flex-col items-center justify-between p-1.5 transition-all relative border cursor-pointer ${
                    isSelected 
                      ? 'bg-[#00288e] border-[#00288e] text-white shadow-md shadow-[#00288e]/15 scale-102 z-10' 
                      : isToday 
                      ? 'bg-blue-50/50 border-blue-200 text-blue-900 font-black' 
                      : hasInspections
                      ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100/80 font-bold'
                      : 'bg-white border-transparent text-slate-600 hover:bg-slate-50/80'
                  }`}
                >
                  {/* Calendar Day Digit */}
                  <span className={`text-xs md:text-sm font-mono leading-none ${
                    isSelected ? 'font-black' : isToday ? 'text-[#00288e] font-extrabold' : ''
                  }`}>
                    {dayNum}
                  </span>

                  {/* Indicator Pills / Badges */}
                  <div className="flex gap-0.5 justify-center w-full min-h-[4px] mt-1 overflow-hidden">
                    {dayInspections.map((insp, iIndex) => {
                      // Color dot by status
                      let dotBg = 'bg-slate-400';
                      if (insp.status === 'COMPLETED') dotBg = 'bg-emerald-500';
                      else if (insp.status === 'IN_PROGRESS') dotBg = 'bg-blue-500';
                      else if (insp.status === 'SCHEDULED') dotBg = 'bg-amber-500';

                      return (
                        <span 
                          key={iIndex} 
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : dotBg} shrink-0`} 
                          title={`${insp.propertyName} (${insp.status})`}
                        />
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Status Color Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-slate-100 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00288e]" />
              <span>Selected Day</span>
            </div>
          </div>

        </div>

        {/* Selected Day Panel Right (5 Columns) */}
        <div className="lg:col-span-5 p-6 bg-slate-50/50 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            {/* Header specifying selected day */}
            <div className="pb-3 border-b border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block font-mono">
                  Agenda Timeline
                </span>
                <span className="text-sm font-extrabold text-slate-800">
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Select a date'}
                </span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-extrabold px-2 py-0.5 rounded-md font-mono">
                {selectedDayInspections.length} {selectedDayInspections.length === 1 ? 'Job' : 'Jobs'}
              </span>
            </div>

            {/* List of jobs */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {selectedDayInspections.length > 0 ? (
                  selectedDayInspections.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white border border-slate-200/60 rounded-xl p-3.5 shadow-xs space-y-2.5 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-extrabold text-[#00288e] uppercase tracking-wider bg-[#dde1ff]/60 px-2 py-0.5 rounded">
                            {job.type}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs md:text-sm mt-1.5 leading-snug">
                            {job.propertyName}
                          </h4>
                        </div>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                          job.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-700' 
                            : job.status === 'IN_PROGRESS' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{job.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{job.inspectorName}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-10 text-center space-y-2"
                  >
                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100">
                      <ClipboardList className="w-4.5 h-4.5 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 font-semibold px-4">
                      No inspections scheduled for this date.
                    </p>
                    <p className="text-[10px] text-slate-400 px-6">
                      Select a highlighted day on the calendar or click "Schedule Item" above to add.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Upcoming highlights feed */}
          <div className="pt-4 border-t border-slate-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Upcoming Queue Summary
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                {upcomingInspections.length} Pending
              </span>
            </div>

            <div className="space-y-2">
              {upcomingInspections.slice(0, 2).map((upJob) => (
                <div key={upJob.id} className="flex items-center justify-between bg-white border border-slate-100 p-2.5 rounded-lg text-xs hover:bg-slate-50/50 transition-colors">
                  <div className="truncate pr-2">
                    <span className="font-extrabold text-slate-800 text-[11px] truncate block">{upJob.propertyName}</span>
                    <span className="text-[10px] text-slate-400 font-medium truncate block">{upJob.type} • {upJob.date}</span>
                  </div>
                  <button 
                    onClick={() => {
                      const d = parseDate(upJob.date);
                      if (d) {
                        setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
                        setSelectedDate(d);
                      }
                    }}
                    className="p-1 text-[#00288e] hover:bg-blue-50 rounded-lg shrink-0 cursor-pointer transition-colors"
                    title="Jump to date on calendar"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {upcomingInspections.length === 0 && (
                <p className="text-[11px] text-slate-400 italic font-medium py-1">No upcoming scheduled jobs left in the queue.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
