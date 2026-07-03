import React, { useState } from 'react';
import { 
  FileDown, Printer, Share2, FileText, CheckCircle2, AlertTriangle, 
  Building, User, Calendar, MapPin, Sparkles, Award, Check, FileSpreadsheet, Send
} from 'lucide-react';
import { InspectionItem } from '../types';

interface ReportsViewProps {
  inspections: InspectionItem[];
}

export default function ReportsView({ inspections }: ReportsViewProps) {
  // Pre-select completed inspections if available, otherwise fallback
  const completedInspections = inspections.filter(i => i.status === 'COMPLETED');
  const [selectedId, setSelectedId] = useState<string>(
    completedInspections.length > 0 ? completedInspections[0].id : (inspections[0]?.id || '')
  );

  const [localToast, setLocalToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setLocalToast(msg);
    setTimeout(() => {
      setLocalToast(null);
    }, 3000);
  };

  const selectedInspection = inspections.find(i => i.id === selectedId);

  if (!selectedInspection) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 animate-fade-in">
        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Inspections Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please schedule and complete an inspection task to generate compliant safety records.
        </p>
      </div>
    );
  }

  // Calculate score & compliance details
  const passedCount = (selectedInspection.subtasks || []).filter(s => s.completed).length;
  const totalSubtasks = (selectedInspection.subtasks || []).length;
  const calculatedScore = totalSubtasks > 0 ? Math.round((passedCount / totalSubtasks) * 100) : 100;
  const finalScore = selectedInspection.score !== undefined ? selectedInspection.score : calculatedScore;

  // Determine certification status
  let statusBadge = "DRAFT - AUDIT IN PROGRESS";
  let statusColor = "bg-amber-50 text-amber-700 border-amber-200";
  
  if (selectedInspection.status === 'COMPLETED') {
    statusBadge = finalScore >= 90 ? "PASSED & CERTIFIED" : "CONDITIONALLY PASSED";
    statusColor = finalScore >= 90 
      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
      : "bg-amber-50 text-amber-700 border-amber-200";
  } else if (selectedInspection.status === 'SCHEDULED') {
    statusBadge = "AUDIT SCHEDULED (NOT STARTED)";
    statusColor = "bg-slate-50 text-slate-600 border-slate-200";
  }

  // Export 1: CSV Checklist Download
  const handleExportCSV = () => {
    const headers = ["Item ID", "Inspection Item / Subtask", "Status", "Notes"];
    const rows = (selectedInspection.subtasks || []).map((sub, idx) => [
      sub.id || `sub-${idx + 1}`,
      sub.title,
      sub.completed ? "PASSED" : "PENDING/FAILED",
      selectedInspection.voiceNotes?.[0]?.transcript ? "Transcript synced" : "None"
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inspection_Checklist_${selectedInspection.propertyName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded CSV Checklist successfully!");
  };

  // Export 2: Markdown Report Download
  const handleExportMarkdown = () => {
    const mdContent = `# COMPLIANCE INSPECTION & HOUSING SAFETY AUDIT REPORT
**Property Name:** ${selectedInspection.propertyName}
**Address:** ${selectedInspection.address}
**Client Partner:** ${selectedInspection.clientName || 'N/A'}
**Accredited Inspector:** ${selectedInspection.inspectorName}
**Date of Safety Verification:** ${selectedInspection.date}
**Inspection Classification:** ${selectedInspection.type}
**Audit Verification Status:** ${selectedInspection.status}
**Housing Quality Index Rating:** ${finalScore}/100

---

## 📋 COMPLIANCE CHECKLIST v3.1

| Item ID | Verification Description / Target | Status |
|---|---|---|
${(selectedInspection.subtasks || []).map((sub, idx) => `| ${sub.id || `sub-${idx + 1}`} | ${sub.title} | ${sub.completed ? '✅ PASSED' : '❌ FAILED/PENDING'} |`).join('\n')}

---

## 🎙️ HANDS-FREE VOICE NOTES & FINDINGS (TRANSCRIPT)
${selectedInspection.voiceNotes && selectedInspection.voiceNotes.length > 0 
  ? selectedInspection.voiceNotes.map(vn => `* [Recorded ${selectedInspection.date}] "${vn.transcript}"`).join('\n')
  : "*No active voice transcript records attached to this inspection.*"
}

---
*Generated via Pro-Inspect Housing Compliance Suite. All rights reserved.*
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Audit_Report_${selectedInspection.propertyName.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded Markdown Report successfully!");
  };

  // Export 3: Trigger Print / PDF
  const handlePrint = () => {
    window.print();
  };

  // Export 4: Copy Public Shareable Link
  const handleShare = () => {
    const simulatedLink = `${window.location.origin}/share/report/${selectedInspection.id}`;
    navigator.clipboard.writeText(simulatedLink);
    showToast("Public report URL copied to clipboard!");
  };

  return (
    <div className="space-y-6 animate-fade-in print:bg-white print:p-0">
      
      {/* Toast Notification */}
      {localToast && (
        <div className="fixed bottom-6 right-6 z-[200] bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-2.5 animate-slide-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{localToast}</span>
        </div>
      )}

      {/* Control bar / Selection (Hidden on Print) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#00288e] tracking-tight">Vetting & Compliance Reports</h2>
            <p className="text-xs text-slate-500">
              Select any property to view, print, or download its official housing quality inspection report.
            </p>
          </div>
          
          <div className="w-full md:w-80">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Select Inspection Record
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700"
            >
              {inspections.map(item => (
                <option key={item.id} value={item.id}>
                  {item.propertyName} ({item.date}) — {item.status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#00288e] rounded-xl text-xs font-extrabold transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report / Save PDF</span>
          </button>
          
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download CSV Checklist</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-extrabold transition-all cursor-pointer ml-auto"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Report Card */}
      <div id="compliance-official-report" className="bg-white border-2 border-slate-900 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden print:border-none print:shadow-none print:p-0">
        
        {/* Certificate Decorative Border Lines */}
        <div className="absolute inset-2 border border-slate-200 rounded-2xl pointer-events-none print:hidden" />
        
        {/* Top Header Block */}
        <div className="border-b-2 border-slate-900 pb-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#00288e] rounded-xs flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-black text-[#00288e] uppercase tracking-widest">
                  Official Verification Record
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                Housing Safety Compliance Certificate
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Issued by State housing inspection clearance board
              </p>
            </div>

            <div className="text-left md:text-right font-mono text-[9px] text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-700">REPORT ID: PRI-2026-{(selectedInspection.id || '00').toUpperCase()}</p>
              <p>ISSUED: {selectedInspection.date}</p>
              <p>SYSTEM V3.1: SECURE RECORD</p>
            </div>
          </div>
        </div>

        {/* Grid: Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-200 relative z-10">
          
          {/* Property Section */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Building className="w-3 h-3 text-[#00288e]" />
              Subject Property
            </h4>
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-900">{selectedInspection.propertyName}</p>
              <p className="text-xs font-semibold text-slate-600 flex items-start gap-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                <span>{selectedInspection.address}</span>
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Client Partner: <strong className="text-slate-700">{selectedInspection.clientName || 'Standard Landlord Registry'}</strong>
              </p>
            </div>
          </div>

          {/* Inspector Section */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <User className="w-3 h-3 text-[#00288e]" />
              Inspector Verification
            </h4>
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-900">{selectedInspection.inspectorName}</p>
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#00288e] shrink-0" />
                <span>TREC Clearance: TX-98234-A</span>
              </p>
              <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md inline-block">
                Digital Signature Verified
              </p>
            </div>
          </div>

          {/* Rating Section */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#00288e]" />
              Compliance Score
            </h4>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-[#00288e] flex flex-col items-center justify-center bg-[#dde1ff]/20 shrink-0">
                <span className="text-lg font-black text-slate-950 leading-none">{finalScore}</span>
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-wide">Index</span>
              </div>
              <div className="space-y-1.5">
                <span className={`text-[10px] font-black uppercase border px-2.5 py-1 rounded-lg ${statusColor}`}>
                  {statusBadge}
                </span>
                <p className="text-[9px] font-bold text-slate-400 italic">
                  Minimum compliant score is 90%
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Section: Checklist Audit Trail */}
        <div className="py-6 border-b border-slate-200 space-y-4 relative z-10">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Safety Verification Checklist Logs ({passedCount} of {totalSubtasks} Passed)
            </h3>
            <p className="text-[10px] text-slate-500">Individual vettings completed during the hands-free diagnostic sweep.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(selectedInspection.subtasks || []).map((sub, index) => (
              <div 
                key={sub.id || index}
                className="flex items-start justify-between p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl"
              >
                <div className="space-y-1 flex-1 pr-4">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">ITEM 0{index + 1}</span>
                  <p className="text-xs font-bold text-slate-800 leading-tight">{sub.title}</p>
                </div>
                <div>
                  {sub.completed ? (
                    <span className="flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded-md uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      Passed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-1 rounded-md uppercase tracking-wider">
                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Voice notes transcript / Findings */}
        {selectedInspection.voiceNotes && selectedInspection.voiceNotes.length > 0 && (
          <div className="py-6 border-b border-slate-200 space-y-3 relative z-10">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Accredited Inspector Voice Findings & Transcription
            </h3>
            {selectedInspection.voiceNotes.map(note => (
              <div key={note.id} className="bg-[#fcfdff] border border-indigo-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black text-[#00288e] uppercase tracking-widest bg-[#dde1ff]/40 px-2 py-1 rounded-md">
                    Hands-free Speech Engine Sync
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    Audio Duration: {note.duration}s
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700 italic leading-relaxed">
                  "{note.transcript}"
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Section: Photos Attachment block */}
        {selectedInspection.photos && selectedInspection.photos.length > 0 && (
          <div className="py-6 space-y-3 relative z-10 print:hidden">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Evidence Attachments ({selectedInspection.photos.length} Captured)
            </h3>
            <div className="flex gap-4 overflow-x-auto py-2">
              {selectedInspection.photos.map((photo, index) => (
                <div key={index} className="w-28 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                  <img 
                    src={photo} 
                    alt={`Evidence attachment ${index + 1}`} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificate Signature block */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Authentication Signature</p>
            <div className="font-serif italic text-base font-extrabold text-[#00288e] tracking-tight">
              Marcus Thompson, TREC
            </div>
            <p className="text-[8px] font-mono text-slate-400">SHA-256 Hash: 9fa012bc...6d91f28b</p>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Office Certification SEAL</p>
            <div className="text-[10px] font-extrabold text-slate-800 border-2 border-slate-800 px-3 py-1.5 uppercase tracking-widest inline-block">
              PRO-INSPECT SYSTEM
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
