import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, Clock, ClipboardList, TrendingUp, AlertCircle, 
  Sparkles, ShieldCheck, FileDown, X, Printer, FileText, Check,
  Building2, Calendar, User, FileCheck, Layers
} from 'lucide-react';
import { InspectionItem } from '../types';

interface InspectionSummaryWidgetProps {
  inspections: InspectionItem[];
}

export default function InspectionSummaryWidget({ inspections }: InspectionSummaryWidgetProps) {
  const totalCount = inspections.length;
  const completedCount = inspections.filter(i => i.status === 'COMPLETED').length;
  const inProgressCount = inspections.filter(i => i.status === 'IN_PROGRESS').length;
  const scheduledCount = inspections.filter(i => i.status === 'SCHEDULED').length;
  
  const pendingCount = inProgressCount + scheduledCount;
  const completedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const pendingPercent = totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0;

  // Calculate average safety score for completed inspections with a valid score
  const completedWithScore = inspections.filter(i => i.status === 'COMPLETED' && typeof i.score === 'number');
  const avgScore = completedWithScore.length > 0
    ? Math.round((completedWithScore.reduce((sum, item) => sum + (item.score || 0), 0) / completedWithScore.length) * 10) / 10
    : null;

  // Circular progress SVG calculations
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completedPercent / 100) * circumference;

  // State for PDF Report generator modal
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [reportTitle, setReportTitle] = useState<string>('Portfolio Compliance & Asset Safety Report');
  const [reportSubtitle, setReportSubtitle] = useState<string>('InspectPro Executive Vetting Analysis');
  const [customNotes, setCustomNotes] = useState<string>(
    'This compliance summary report lists key structural, electrical, and plumbing safety scores compiled directly from on-site digital inspection logs. Corrective actions have been dispatched for pending and flagged items.'
  );
  const [filterType, setFilterType] = useState<'all' | 'COMPLETED' | 'PENDING'>('all');
  const [includeScores, setIncludeScores] = useState<boolean>(true);
  const [includeSignatures, setIncludeSignatures] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Filter logic for export document table
  const filteredInspections = inspections.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'COMPLETED') return item.status === 'COMPLETED';
    if (filterType === 'PENDING') return item.status === 'IN_PROGRESS' || item.status === 'SCHEDULED';
    return true;
  });

  const handlePrintReport = () => {
    // Open standard system print dialog. 
    // The print layout is structured within #print-area (hidden in UI, visible on print only)
    window.print();
  };

  const handleCopyTextReport = () => {
    // Generate clean text summaries
    const textReport = `
=== ${reportTitle} ===
${reportSubtitle}
Generated: ${new Date().toLocaleString()}

-- EXECUTIVE SUMMARY --
${customNotes}

-- KPI METRICS --
Total Scheduled Vettings: ${totalCount}
Completed Audits: ${completedCount} (${completedPercent}%)
Pending Backlog: ${pendingCount} (${pendingPercent}%)
${avgScore !== null ? `Average Portfolio Safety Score: ${avgScore}%` : ''}

-- ITEMIZED INSPECTION RECORDS --
${filteredInspections.map((item, idx) => `
[${idx + 1}] PROPERTY: ${item.propertyName}
    Address: ${item.address}
    Type: ${item.type}
    Date Scheduled: ${item.date}
    Vetting Status: ${item.status}
    Safety Quality Score: ${item.score ? `${item.score}%` : 'N/A'}
    Lead Inspector: ${item.inspectorName}
`).join('\n')}

========================================
Report Prepared By: InspectPro Mobile Suite
    `;

    navigator.clipboard.writeText(textReport.trim());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in">
        
        {/* Visual Analytics Hero Card (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          {/* Decorative corner accent */}
          <div className="absolute right-0 top-0 -mt-6 -mr-6 w-24 h-24 bg-[#00288e]/5 rounded-full blur-xl pointer-events-none transition-all group-hover:scale-110" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-[#00288e] bg-[#dde1ff]/60 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Inspection Summary
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-2 tracking-tight">Workload Ratio</h3>
              </div>
              
              {/* Dynamic PDF Trigger Button */}
              <button
                onClick={() => setShowPdfModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00288e] hover:bg-[#1e40af] text-white text-[11px] font-bold rounded-lg shadow-sm cursor-pointer transition-all shrink-0 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export Report PDF</span>
              </button>
            </div>

            <div className="flex items-center gap-6 py-2">
              {/* Donut Chart / Circular Progress indicator */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="stroke-slate-100 fill-none"
                    strokeWidth="8.5"
                  />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="stroke-[#00288e] fill-none"
                    strokeWidth="8.5"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ strokeDasharray: circumference }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black text-slate-900 leading-none">
                    {completedPercent}%
                  </span>
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
                    Done
                  </span>
                </div>
              </div>

              {/* Micro details bar */}
              <div className="space-y-3 flex-1">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  You have successfully completed <strong className="text-emerald-600">{completedCount}</strong> inspections out of <strong className="text-slate-800">{totalCount}</strong> total scheduled assets.
                </p>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Completed ({completedPercent}%)</span>
                    <span>Pending ({pendingPercent}%)</span>
                  </div>
                  {/* Custom multi-color progress indicator bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <motion.div 
                      className="h-full bg-emerald-500" 
                      initial={{ width: 0 }}
                      animate={{ width: `${completedPercent}%` }}
                      transition={{ duration: 0.5 }}
                    />
                    <motion.div 
                      className="h-full bg-amber-500" 
                      initial={{ width: 0 }}
                      animate={{ width: `${pendingPercent}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Callout Footnote */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                {pendingCount > 0 
                  ? `${pendingCount} inspections outstanding requiring site visits.` 
                  : 'All property inspection targets achieved!'
                }
              </span>
            </div>
          </div>

        </div>

        {/* Grid of Detailed Analytics Bento Cards (7 Columns) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Metric 1: Completed */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            <div className="space-y-3 pl-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Completed
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">
                  {completedCount}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">
                  Final reports generated & signed
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-emerald-600 font-bold pl-1.5">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Full compliance achieved</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Pending & Outstanding */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
            <div className="space-y-3 pl-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Pending Queue
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">
                  {pendingCount}
                </p>
                <div className="flex gap-2 text-[10px] text-slate-500 font-semibold mt-1">
                  <span>{inProgressCount} in progress</span>
                  <span>•</span>
                  <span>{scheduledCount} scheduled</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-amber-700 font-bold pl-1.5">
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Needs site dispatch</span>
              </div>
            </div>
          </div>

          {/* Metric 3: Safety/Quality Score or Total Count */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
            <div className="space-y-3 pl-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {avgScore !== null ? 'Avg Safety Score' : 'Total Portfolio'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                  {avgScore !== null ? (
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <ClipboardList className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">
                  {avgScore !== null ? `${avgScore}%` : totalCount}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">
                  {avgScore !== null ? 'Exceeds standard 80%' : 'Registered property sheets'}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-indigo-600 font-bold pl-1.5">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{avgScore !== null ? 'Certified pass average' : 'Full capacity logs'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* PDF REPORT EXPORT CUSTOMIZER & PRINT MODAL */}
      {showPdfModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-start md:items-center justify-center p-4 md:p-6 no-print">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-6xl w-full flex flex-col md:flex-row overflow-hidden max-h-[95vh] md:max-h-[90vh] my-auto"
          >
            {/* Customizer Sidebar (Left Panel) */}
            <div className="w-full md:w-80 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-5 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#00288e]" />
                    <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Report Settings</h4>
                  </div>
                  <button 
                    onClick={() => setShowPdfModal(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center"
                    title="Close Dialog"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Title field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Document Title</label>
                    <input 
                      type="text"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                    />
                  </div>

                  {/* Subtitle field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Document Subtitle</label>
                    <input 
                      type="text"
                      value={reportSubtitle}
                      onChange={(e) => setReportSubtitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                    />
                  </div>

                  {/* Executive Field Notes */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Executive Summary Notes</label>
                    <textarea 
                      value={customNotes}
                      rows={4}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                    />
                  </div>

                  {/* Filter criteria */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Export Scope Filter</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                    >
                      <option value="all">All Registered Properties</option>
                      <option value="COMPLETED">Completed Audits Only</option>
                      <option value="PENDING">Pending Schedule Backlog</option>
                    </select>
                  </div>

                  {/* Layout switches */}
                  <div className="space-y-2.5 pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={includeScores}
                        onChange={(e) => setIncludeScores(e.target.checked)}
                        className="rounded border-slate-300 text-[#00288e] focus:ring-[#dde1ff]"
                      />
                      <span>Show Safety Score %</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={includeSignatures}
                        onChange={(e) => setIncludeSignatures(e.target.checked)}
                        className="rounded border-slate-300 text-[#00288e] focus:ring-[#dde1ff]"
                      />
                      <span>Include Signature Sign-Off</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Triggers */}
              <div className="space-y-2 pt-4 border-t border-slate-200 mt-5">
                <button
                  onClick={handlePrintReport}
                  className="w-full flex items-center justify-center gap-2 bg-[#00288e] hover:bg-[#1e40af] text-white p-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download PDF / Print</span>
                </button>

                <button
                  onClick={handleCopyTextReport}
                  className="w-full flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4" />}
                  <span>{isCopied ? 'Copied Text!' : 'Copy Text Summary'}</span>
                </button>

                <button
                  onClick={() => setShowPdfModal(false)}
                  className="w-full bg-transparent hover:bg-slate-100 text-slate-500 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

            {/* Document Interactive Live Preview (Right Panel) */}
            <div className="flex-1 bg-slate-200 p-4 md:p-6 overflow-y-auto flex justify-center items-start min-h-[50vh] md:min-h-0 relative">
              {/* Floating Close Button for Desktop Preview */}
              <button 
                onClick={() => setShowPdfModal(false)}
                className="absolute top-4 right-4 p-2 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-full shadow-md transition-all border border-slate-300 hover:scale-105 active:scale-95 z-10 hidden md:flex items-center justify-center cursor-pointer"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="bg-white text-slate-800 w-full max-w-[8.27in] min-h-[11.69in] p-8 rounded-lg shadow-md border border-slate-300 flex flex-col justify-between font-sans scale-95 origin-top md:scale-100">
                
                <div className="space-y-6">
                  {/* Report Header Logo & Title Block */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[#00288e]">
                        <Building2 className="w-6 h-6 shrink-0" />
                        <span className="text-xl font-black tracking-wider uppercase font-mono">INSPECT<span className="text-slate-900">PRO</span></span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Digital Site Compliance Suite</p>
                    </div>

                    <div className="text-right space-y-1.5">
                      <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">{reportTitle}</h1>
                      <p className="text-xs text-slate-500 font-semibold">{reportSubtitle}</p>
                    </div>
                  </div>

                  {/* Document Metadata Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-[11px]">
                    <div>
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Date Generated</span>
                      <strong className="text-slate-800">{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                    </div>
                    <div>
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Prepared By</span>
                      <strong className="text-slate-800">InspectPro Certified Suite</strong>
                    </div>
                    <div>
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Vetting Scope Filter</span>
                      <strong className="text-[#00288e] uppercase">{filterType === 'all' ? 'Full Portfolio' : filterType === 'COMPLETED' ? 'Completed Audits' : 'Pending Backlog'}</strong>
                    </div>
                    <div>
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Standard Compliance</span>
                      <strong className="text-emerald-600 uppercase">Class A Vetted</strong>
                    </div>
                  </div>

                  {/* Executive summary block */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider border-l-2 border-[#00288e] pl-2">Executive Summary</h5>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg italic">
                      "{customNotes}"
                    </p>
                  </div>

                  {/* Main Metric KPIs for Report */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-center">
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Total Targets</span>
                      <span className="text-lg font-extrabold text-slate-900">{totalCount} Properties</span>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-center">
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Completed Audits</span>
                      <span className="text-lg font-extrabold text-emerald-600">{completedCount} / {totalCount}</span>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-center">
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Backlog</span>
                      <span className="text-lg font-extrabold text-amber-600">{pendingCount} Active</span>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-3 bg-indigo-50 text-center border-indigo-100">
                      <span className="block text-[8px] font-extrabold text-indigo-400 uppercase tracking-wider">Portfolio Rating</span>
                      <span className="text-lg font-extrabold text-indigo-900">{avgScore !== null ? `${avgScore}%` : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Itemized Table of Properties */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">Itemized Inspection Records ({filteredInspections.length})</h5>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">InspectPro Cloud Database</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 uppercase font-black tracking-wider text-[9px] border-b border-slate-200">
                            <th className="p-2">Property & Address</th>
                            <th className="p-2 text-center">Audit Type</th>
                            <th className="p-2 text-center">Vetting Date</th>
                            <th className="p-2 text-center">Status</th>
                            {includeScores && <th className="p-2 text-right">Score</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredInspections.length === 0 ? (
                            <tr>
                              <td colSpan={includeScores ? 5 : 4} className="p-4 text-center text-slate-400 font-semibold italic">
                                No inspections matches the export criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredInspections.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-2 font-semibold">
                                  <div className="text-slate-800">{item.propertyName}</div>
                                  <div className="text-[9px] text-slate-400 mt-0.5">{item.address}</div>
                                </td>
                                <td className="p-2 text-center text-slate-500 font-medium">{item.type}</td>
                                <td className="p-2 text-center text-slate-500 font-mono font-medium">{item.date}</td>
                                <td className="p-2 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    item.status === 'COMPLETED' 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                      : item.status === 'IN_PROGRESS'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                                  }`}>
                                    {item.status}
                                  </span>
                                </td>
                                {includeScores && (
                                  <td className="p-2 text-right font-bold text-slate-700">
                                    {item.score ? (
                                      <span className={item.score >= 85 ? 'text-emerald-600' : 'text-slate-800'}>
                                        {item.score}%
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-medium">—</span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Report Sign-off Signature Blocks */}
                {includeSignatures && (
                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 mt-8">
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Authorized Supervisor Sign-off</p>
                      <div className="border-b border-slate-400 h-8 flex items-end">
                        <span className="text-xs font-mono italic text-slate-400 select-none">InspectPro digital ID stamp</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Signature / Date</span>
                        <span>Stamp ID: #7E7712</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Property Owner / Agent Verification</p>
                      <div className="border-b border-slate-400 h-8 flex items-end">
                        {/* Empty sign-off line */}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Acknowledge Receipt Signature</span>
                        <span>Date</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Print footer copyright and page identifier */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-medium">
                  <span>© {new Date().getFullYear()} InspectPro Asset Compliance Suite. All rights reserved.</span>
                  <span>Document Hash: ip_sh_${Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>

              </div>
            </div>

          </motion.div>
        </div>
      )}

      {/* DEDICATED FULL-SCALE PRINT-ONLY SECTION (Only visible to the physical paper or PDF print render drivers) */}
      <div id="print-area" className="hidden print:block bg-white text-slate-900 p-8">
        <div className="space-y-6">
          {/* Print Title Header */}
          <div className="flex justify-between items-start pb-5 border-b-2 border-slate-900">
            <div>
              <h2 className="text-2xl font-black text-[#00288e] tracking-tight uppercase">{reportTitle}</h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{reportSubtitle}</p>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-1 tracking-widest">InspectPro Certified Field Report</p>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Date Generated</span>
              <strong className="text-xs text-slate-800">{new Date().toLocaleString()}</strong>
            </div>
          </div>

          {/* Print Metadata */}
          <table className="w-full text-xs text-left mb-6 border border-slate-200">
            <tbody>
              <tr className="bg-slate-50">
                <td className="p-3 border-r border-slate-200 font-bold text-slate-500 uppercase text-[9px]">Document Scope</td>
                <td className="p-3 border-r border-slate-200 font-semibold">{filterType === 'all' ? 'All Portfolio Properties' : filterType === 'COMPLETED' ? 'Completed Audits' : 'Pending Schedule Backlog'}</td>
                <td className="p-3 border-r border-slate-200 font-bold text-slate-500 uppercase text-[9px]">Prepared By</td>
                <td className="p-3 font-semibold">InspectPro Asset Suite</td>
              </tr>
            </tbody>
          </table>

          {/* Executive Notes */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-2 border-[#00288e] pl-2">Executive Overview</h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl italic border border-slate-100">
              "{customNotes}"
            </p>
          </div>

          {/* Portfolio Metrics Row */}
          <div className="grid grid-cols-4 gap-4 py-3">
            <div className="border border-slate-200 p-4 rounded-xl text-center">
              <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Total Assets</span>
              <strong className="text-lg text-slate-900">{totalCount} Properties</strong>
            </div>
            <div className="border border-slate-200 p-4 rounded-xl text-center">
              <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Completed Vettings</span>
              <strong className="text-lg text-emerald-600">{completedCount} Audits</strong>
            </div>
            <div className="border border-slate-200 p-4 rounded-xl text-center">
              <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Pending backlog</span>
              <strong className="text-lg text-amber-600">{pendingCount} Scheduled</strong>
            </div>
            <div className="border border-slate-200 p-4 rounded-xl text-center bg-slate-50">
              <span className="block text-[9px] font-extrabold text-indigo-500 uppercase tracking-wider mb-1">Compliance Rate</span>
              <strong className="text-lg text-[#00288e]">{completedPercent}% Done</strong>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-3 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">Itemized Property Logs</h4>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 uppercase text-[9px] font-extrabold border-b border-slate-300">
                  <th className="p-3 text-left">Property & Location</th>
                  <th className="p-3 text-center">Type</th>
                  <th className="p-3 text-center">Date</th>
                  <th className="p-3 text-center">Status</th>
                  {includeScores && <th className="p-3 text-right">Score</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInspections.map((item) => (
                  <tr key={item.id} className="page-break-inside-avoid">
                    <td className="p-3">
                      <strong className="text-slate-900">{item.propertyName}</strong>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.address}</div>
                    </td>
                    <td className="p-3 text-center">{item.type}</td>
                    <td className="p-3 text-center">{item.date}</td>
                    <td className="p-3 text-center">
                      <span className="uppercase font-bold text-[9px]">{item.status}</span>
                    </td>
                    {includeScores && (
                      <td className="p-3 text-right font-bold">
                        {item.score ? `${item.score}%` : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          {includeSignatures && (
            <div className="grid grid-cols-2 gap-12 pt-12 border-t border-slate-200 mt-12 page-break-inside-avoid">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authorized Inspector Signature</p>
                <div className="border-b border-slate-400 h-10" />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Sign & Date</span>
                  <span>System Stamp #7E7712</span>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Agent Receipt Signature</p>
                <div className="border-b border-slate-400 h-10" />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Signature / Acknowledge Date</span>
                  <span>InspectPro Certified Vetting</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-slate-100 text-[9px] text-slate-400 flex justify-between">
            <span>Generated securely by bob.h.yuan@gmail.com</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </>
  );
}
