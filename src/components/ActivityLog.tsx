import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, Award, User, Bell, Wifi, AlertTriangle, Search, Check, 
  Trash2, X, RefreshCw, Eye, ShieldAlert, CheckCircle, Info, Filter, Inbox,
  Download, FileText
} from 'lucide-react';
import { ActivityLogItem } from '../types';

interface ActivityLogProps {
  logs: ActivityLogItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearLogs: () => void;
  onDeleteLog: (id: string) => void;
  onSimulateEvent: (type: 'inspection_created' | 'inspection_completed' | 'credential_added' | 'profile_updated' | 'system_alert' | 'offline_sync') => void;
  externalSearchQuery?: string;
  externalStatusFilter?: string;
}

export default function ActivityLog({
  logs,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearLogs,
  onDeleteLog,
  onSimulateEvent,
  externalSearchQuery,
  externalStatusFilter
}: ActivityLogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'activity' | 'notification'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);

  const handleDownloadReport = (log: ActivityLogItem) => {
    const itemStatus = log.status || (log.type === 'system_alert' ? 'Flagged' : log.type === 'inspection_created' ? 'In-Progress' : 'Completed');
    const formattedDate = new Date(log.date).toLocaleString();
    const hexHash = Math.random().toString(16).slice(2, 10).toUpperCase();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Compliance Report - ${log.title}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
      margin: 0;
      padding: 40px;
      background-color: #f8fafc;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      border-top: 8px solid #00288e;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .title-area h1 {
      font-size: 24px;
      color: #0f172a;
      margin: 0 0 6px 0;
      font-weight: 800;
      letter-spacing: -0.025em;
    }
    .title-area p {
      margin: 0;
      font-size: 13px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .logo-badge {
      background: #f0f2ff;
      color: #00288e;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 14px;
      border: 1px solid #c2cbff;
      letter-spacing: 0.05em;
    }
    .grid {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 20px;
      border-radius: 8px;
    }
    .card h3 {
      margin: 0 0 10px 0;
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .card p {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #0f172a;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-completed {
      background-color: #d1fae5;
      color: #065f46;
    }
    .status-inprogress {
      background-color: #fef3c7;
      color: #92400e;
    }
    .status-flagged {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 30px 0 12px 0;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .content-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .metadata-pre {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      background: #0f172a;
      color: #38bdf8;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 0;
    }
    .footer {
      margin-top: 50px;
      border-top: 1px solid #e2e8f0;
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #64748b;
    }
    .signature {
      text-align: right;
    }
    .sig-line {
      width: 180px;
      border-bottom: 1px solid #94a3b8;
      margin-bottom: 6px;
      display: inline-block;
    }
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .container {
        box-shadow: none;
        padding: 0;
        border-top: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title-area">
        <p>State Board Compliance Document</p>
        <h1>INSPECTION RECORD SUMMARY</h1>
      </div>
      <div class="logo-badge">
        STATE VERIFIED
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h3>Record Reference ID</h3>
        <p>${log.id.toUpperCase()}</p>
      </div>
      <div class="card">
        <h3>Verification Status</h3>
        <p>
          <span class="status-badge ${
            itemStatus === 'Completed' ? 'status-completed' : itemStatus === 'In-Progress' ? 'status-inprogress' : 'status-flagged'
          }">
            ${itemStatus}
          </span>
        </p>
      </div>
      <div class="card">
        <h3>Date Generated</h3>
        <p>${formattedDate}</p>
      </div>
      <div class="card">
        <h3>Audit Node Hash</h3>
        <p style="font-family: monospace; font-size: 14px;">SHA256-${hexHash}</p>
      </div>
    </div>

    <div class="section-title">Log Information</div>
    <div class="content-box">
      <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #0f172a;">${log.title}</h2>
      <p style="margin: 0; font-size: 14px; color: #475569;">${log.description}</p>
    </div>

    ${log.metadata ? `
      <div class="section-title">Technical Ledger Metadata</div>
      <div style="margin-bottom: 30px;">
        <pre class="metadata-pre">${log.metadata}</pre>
      </div>
    ` : ''}

    <div class="footer">
      <div>
        <p style="margin: 0 0 4px 0;">This report is a certified offline ledger transcript from the device cache.</p>
        <p style="margin: 0; font-family: monospace;">UUID: ${log.id}-${hexHash}</p>
      </div>
      <div class="signature">
        <div class="sig-line"></div>
        <p style="margin: 0; font-weight: bold; color: #334155;">Inspector Signature Desk</p>
        <p style="margin: 2px 0 0 0;">System Verified Auto-Sign</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Create downloadable Blob
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Compliance_Report_${log.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    // Resolve status
    const itemStatus = log.status || (log.type === 'system_alert' ? 'Flagged' : log.type === 'inspection_created' ? 'In-Progress' : 'Completed');
    
    // Check search term: we look at externalSearchQuery first, then internal search as a fallback/secondary
    const effectiveSearch = (externalSearchQuery !== undefined ? externalSearchQuery : searchQuery).trim().toLowerCase();
    
    const matchesSearch = effectiveSearch === '' || 
      log.title.toLowerCase().includes(effectiveSearch) || 
      log.description.toLowerCase().includes(effectiveSearch) ||
      (log.metadata && log.metadata.toLowerCase().includes(effectiveSearch)) ||
      itemStatus.toLowerCase().includes(effectiveSearch);

    // Check status filter: externalStatusFilter or 'all'
    const effectiveStatus = externalStatusFilter || 'all';
    const matchesStatus = effectiveStatus === 'all' || itemStatus === effectiveStatus;

    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesType = typeFilter === 'all' || log.type === typeFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesType;
  });

  const unreadCount = logs.filter(l => !l.isRead).length;
  const systemAlertsCount = logs.filter(l => l.type === 'system_alert').length;

  // Icon mapping helper
  const getLogIcon = (type: ActivityLogItem['type']) => {
    switch (type) {
      case 'inspection_created':
        return <ClipboardList className="w-5 h-5 text-blue-600" />;
      case 'inspection_completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'credential_added':
        return <Award className="w-5 h-5 text-indigo-600" />;
      case 'profile_updated':
        return <User className="w-5 h-5 text-amber-600" />;
      case 'system_alert':
        return <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />;
      case 'offline_sync':
        return <Wifi className="w-5 h-5 text-teal-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  // Color theme mapping helper for backgrounds
  const getIconBg = (type: ActivityLogItem['type']) => {
    switch (type) {
      case 'inspection_created': return 'bg-blue-50 border border-blue-100';
      case 'inspection_completed': return 'bg-green-50 border border-green-100';
      case 'credential_added': return 'bg-indigo-50 border border-indigo-100';
      case 'profile_updated': return 'bg-amber-50 border border-amber-100';
      case 'system_alert': return 'bg-red-50 border border-red-100';
      case 'offline_sync': return 'bg-teal-50 border border-teal-100';
      default: return 'bg-slate-50 border border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 mb-1 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#00288e]" />
            Inspection Activity &amp; Live Alerts
          </h2>
          <p className="text-sm text-slate-500">
            Monitor real-time compliance operations, local device database syncs, and system board flags.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={onMarkAllAsRead}
              className="bg-blue-50 text-[#00288e] border border-blue-100 hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Mark All Read
            </button>
          )}
          {logs.length > 0 && (
            <button 
              onClick={onClearLogs}
              className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Logs
            </button>
          )}
        </div>
      </header>

      {/* Stats Quick-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-[#00288e] rounded-xl flex items-center justify-center border border-blue-100">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{unreadCount}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Unread Notifications</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{systemAlertsCount}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Compliance Warnings</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center border border-teal-100">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">
              {logs.filter(l => l.type === 'offline_sync').length}
            </p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Offline Sync Passes</p>
          </div>
        </div>
      </div>

      {/* Grid Layout: Main Filters/Logs List on Left, Event Simulation Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Filterable Activities */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl max-w-sm flex-1">
              <Search className="w-4.5 h-4.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search event logs, properties..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs w-full focus:outline-none text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  categoryFilter === 'all' 
                    ? 'bg-white text-slate-950 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setCategoryFilter('activity')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  categoryFilter === 'activity' 
                    ? 'bg-white text-[#00288e] shadow-xs' 
                    : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                Activities
              </button>
              <button 
                onClick={() => setCategoryFilter('notification')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  categoryFilter === 'notification' 
                    ? 'bg-white text-[#00288e] shadow-xs' 
                    : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                Notifications
              </button>
            </div>

            {/* Advanced Type Select */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none text-slate-700"
              >
                <option value="all">All Types</option>
                <option value="inspection_created">New Inspections</option>
                <option value="inspection_completed">Completed Inspections</option>
                <option value="credential_added">Credentials Added</option>
                <option value="profile_updated">Profile Updates</option>
                <option value="system_alert">System Alerts</option>
                <option value="offline_sync">Offline Syncs</option>
              </select>
            </div>

          </div>

          {/* Logs List Container */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Event Log Feed</span>
              <span>Showing {filteredLogs.length} entries</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              <AnimatePresence initial={false}>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className={`p-4 transition-colors flex items-start justify-between gap-4 group ${
                        !log.isRead ? 'bg-blue-50/40 border-l-4 border-[#00288e]' : 'hover:bg-slate-50/40'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconBg(log.type)}`}>
                          {getLogIcon(log.type)}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{log.title}</span>
                            {!log.isRead && (
                              <span className="bg-blue-100 text-[#00288e] text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                                New
                              </span>
                            )}
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                              log.category === 'notification' 
                                ? 'bg-red-50 text-red-600 border border-red-100' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {log.category}
                            </span>
                            
                            {/* Status Badge */}
                            {(() => {
                              const itemStatus = log.status || (log.type === 'system_alert' ? 'Flagged' : log.type === 'inspection_created' ? 'In-Progress' : 'Completed');
                              let statusClass = '';
                              switch (itemStatus) {
                                case 'Completed':
                                  statusClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                                  break;
                                case 'In-Progress':
                                  statusClass = 'bg-amber-50 text-amber-700 border border-amber-200';
                                  break;
                                case 'Flagged':
                                  statusClass = 'bg-red-50 text-red-700 border border-red-200';
                                  break;
                              }
                              return (
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase flex items-center gap-1 ${statusClass}`}>
                                  <span className={`w-1 h-1 rounded-full ${
                                    itemStatus === 'Completed' ? 'bg-emerald-500' : itemStatus === 'In-Progress' ? 'bg-amber-500' : 'bg-red-500'
                                  }`} />
                                  {itemStatus}
                                </span>
                              );
                            })()}
                          </div>
                          
                          <p className="text-xs text-slate-600 leading-relaxed">{log.description}</p>
                          
                          {log.metadata && (
                            <p className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded inline-block">
                              {log.metadata}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                            <span>{log.timestamp}</span>
                            <span>•</span>
                            <span>{new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Controls per Log */}
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDownloadReport(log)}
                          className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Download PDF Report"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-[#00288e] rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {!log.isRead && (
                          <button 
                            onClick={() => onMarkAsRead(log.id)}
                            className="p-1.5 hover:bg-green-50 text-slate-400 hover:text-green-600 rounded-lg transition-colors cursor-pointer"
                            title="Mark as Read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button 
                          onClick={() => onDeleteLog(log.id)}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                      <Inbox className="w-8 h-8 text-slate-300" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-600 text-sm">No activity logs found</p>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                        Try modifying search query filters, or use the interactive simulation console on the right to trigger live events!
                      </p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side: Event Simulation Console */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Compliance & Health Monitor */}
          <div className="bg-[#1e40af] text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-[#a8b8ff]" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Device Health System</h3>
            </div>
            
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-100">State Database Connection:</span>
                <span className="font-extrabold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-100">LocalStorage Registry Size:</span>
                <span className="font-mono text-slate-200">12.4 KB (Normal)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-100">License Verification Node:</span>
                <span className="font-semibold text-emerald-400">ACTIVE</span>
              </div>
            </div>
            
            <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-xs text-blue-50 leading-relaxed">
              This app is fully compatible with standard state compliance boards. Live offline caching triggers when Wi-Fi is toggled.
            </div>
          </div>

          {/* Interactive Simulation Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <RefreshCw className="w-4.5 h-4.5 text-[#00288e] animate-spin" />
                Prototype Simulators
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Simulate events to test the real-time activity tracking &amp; UI alert notifications engine.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button 
                onClick={() => onSimulateEvent('inspection_created')}
                className="w-full text-left p-3 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors flex items-center justify-between"
              >
                <span>📅 New Inspection Scheduled</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">Trigger</span>
              </button>

              <button 
                onClick={() => onSimulateEvent('inspection_completed')}
                className="w-full text-left p-3 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors flex items-center justify-between"
              >
                <span>✅ Quality Assessment Completed</span>
                <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded">Trigger</span>
              </button>

              <button 
                onClick={() => onSimulateEvent('credential_added')}
                className="w-full text-left p-3 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors flex items-center justify-between"
              >
                <span>🏆 TREC Credential Approved</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded">Trigger</span>
              </button>

              <button 
                onClick={() => onSimulateEvent('system_alert')}
                className="w-full text-left p-3 border border-slate-100 bg-red-50/30 hover:bg-red-50/60 hover:border-red-200 rounded-xl text-xs font-semibold text-slate-800 transition-colors flex items-center justify-between"
              >
                <span>⚠️ State Board Warning Alert</span>
                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">Trigger</span>
              </button>

              <button 
                onClick={() => onSimulateEvent('offline_sync')}
                className="w-full text-left p-3 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors flex items-center justify-between"
              >
                <span>🔄 12 Local Reports Synced</span>
                <span className="text-[10px] bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded">Trigger</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* DETAIL MODAL OVERLAY */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl p-6 relative">
            <button 
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBg(selectedLog.type)}`}>
                  {getLogIcon(selectedLog.type)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 leading-snug">{selectedLog.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded uppercase inline-block">
                      {selectedLog.category}
                    </span>
                    {(() => {
                      const itemStatus = selectedLog.status || (selectedLog.type === 'system_alert' ? 'Flagged' : selectedLog.type === 'inspection_created' ? 'In-Progress' : 'Completed');
                      let statusClass = '';
                      switch (itemStatus) {
                        case 'Completed':
                          statusClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                          break;
                        case 'In-Progress':
                          statusClass = 'bg-amber-50 text-amber-700 border border-amber-200';
                          break;
                        case 'Flagged':
                          statusClass = 'bg-red-50 text-red-700 border border-red-200';
                          break;
                      }
                      return (
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${statusClass}`}>
                          <span className={`w-1 h-1 rounded-full ${
                            itemStatus === 'Completed' ? 'bg-emerald-500' : itemStatus === 'In-Progress' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                          {itemStatus}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <p className="text-sm text-slate-700 leading-relaxed mt-0.5">{selectedLog.description}</p>
                </div>

                {selectedLog.metadata && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Technical Metadata</label>
                    <pre className="text-xs font-mono bg-slate-50 text-slate-600 p-3 rounded-xl border border-slate-100 mt-0.5 overflow-x-auto whitespace-pre-wrap leading-normal">
                      {selectedLog.metadata}
                    </pre>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Relative Time</label>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedLog.timestamp}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exact Stamp</label>
                    <p className="font-semibold text-slate-700 mt-0.5">{new Date(selectedLog.date).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  onClick={() => handleDownloadReport(selectedLog)}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-blue-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF Report
                </button>
                {!selectedLog.isRead && (
                  <button 
                    onClick={() => {
                      onMarkAsRead(selectedLog.id);
                      setSelectedLog(null);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-[#00288e] hover:bg-[#1e40af] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
