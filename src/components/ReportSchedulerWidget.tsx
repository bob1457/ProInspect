import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Mail, FileText, CheckCircle2, AlertTriangle, Play,
  Settings, Clock, Sparkles, Send, Bell, RefreshCw, Eye, ClipboardList
} from 'lucide-react';

interface ReportSchedulerWidgetProps {
  onTriggerToast: (message: string) => void;
}

interface ScheduledConfig {
  isEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  emails: string;
  scope: 'all' | 'COMPLETED' | 'PENDING';
  dayOfWeek: string;
  timeOfDay: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ReportSchedulerWidget({ onTriggerToast }: ReportSchedulerWidgetProps) {
  const [config, setConfig] = useState<ScheduledConfig>({
    isEnabled: true,
    frequency: 'weekly',
    emails: 'bob.h.yuan@gmail.com, admin@inspectpro.com',
    scope: 'all',
    dayOfWeek: 'Monday',
    timeOfDay: '08:00'
  });

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [nextTrigger, setNextTrigger] = useState<string>('');

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('inspectpro_report_schedule');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        // use default
      }
    }
  }, []);

  // Compute Next Trigger Date
  useEffect(() => {
    calculateNextTrigger();
  }, [config]);

  const calculateNextTrigger = () => {
    if (!config.isEnabled) {
      setNextTrigger('Scheduler Inactive');
      return;
    }

    const now = new Date('2026-06-28T17:31:17-07:00'); // current mock time
    let target = new Date(now);

    if (config.frequency === 'daily') {
      target.setDate(now.getDate() + 1);
    } else if (config.frequency === 'weekly' || config.frequency === 'bi-weekly') {
      const targetDayIndex = DAYS_OF_WEEK.indexOf(config.dayOfWeek) + 1; // 1-7
      let currentDayIndex = now.getDay(); // 0 (Sun) to 6 (Sat)
      if (currentDayIndex === 0) currentDayIndex = 7; // Align Sun to 7

      let daysToAdd = targetDayIndex - currentDayIndex;
      if (daysToAdd <= 0) {
        daysToAdd += config.frequency === 'bi-weekly' ? 14 : 7;
      }
      target.setDate(now.getDate() + daysToAdd);
    } else if (config.frequency === 'monthly') {
      target.setMonth(now.getMonth() + 1);
      target.setDate(1); // First of next month
    }

    // Set custom time
    const [hrs, mins] = config.timeOfDay.split(':').map(Number);
    target.setHours(hrs || 8, mins || 0, 0, 0);

    setNextTrigger(target.toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Quick validation of emails
    const emailList = config.emails.split(',').map(e => e.trim());
    const validEmails = emailList.filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    
    if (validEmails.length === 0 && config.isEnabled) {
      onTriggerToast('⚠️ Please enter at least one valid email address.');
      return;
    }

    localStorage.setItem('inspectpro_report_schedule', JSON.stringify(config));
    setIsSaved(true);
    onTriggerToast('💾 Inspection status report frequency saved successfully!');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSimulateDispatch = () => {
    setIsSimulating(true);
    setSimulationLogs([]);
    
    // Simulate steps of report compiler & email SMTP agent
    const logSteps = [
      '🔍 Querying active properties from cloud-state database...',
      `📄 Constructing PDF document: [Scope = ${config.scope.toUpperCase()}]`,
      '📊 Computing compliance rates and average site safety metrics...',
      '🛠️ Compiling interactive checklist status rows and inspectors credentials...',
      '🔒 Attaching secure cryptographic MD5 signature audit-block...',
      '✉️ Initializing SMTP relay handshake protocol...',
      `🚀 Broadcasting compliance PDF report to: [${config.emails}]`,
      '🎉 All emails routed safely! Logs dispatched to audit terminal.'
    ];

    logSteps.forEach((step, idx) => {
      setTimeout(() => {
        setSimulationLogs(prev => [...prev, step]);
        if (idx === logSteps.length - 1) {
          setIsSimulating(false);
          onTriggerToast(`📬 Simulated automated status report emailed to ${config.emails.split(',')[0]}!`);
          playChime();
        }
      }, (idx + 1) * 700);
    });
  };

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Ignored browser blocking
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#dde1ff]/60 rounded-xl text-[#00288e]">
            <Clock className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-[#00288e]" />
              Automated Compliance Despatches
            </h3>
            <h2 className="text-lg font-black text-slate-900 mt-1 tracking-tight">Recurring PDF & Email Scheduler</h2>
          </div>
        </div>

        {/* Enabled State indicator */}
        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl border ${
          config.isEnabled 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
            : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          {config.isEnabled ? '● Automation Active' : '○ Disabled'}
        </span>
      </div>

      {/* Grid: Form config (left) & Live simulation simulator logs (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form setup */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-4">
          
          {/* Active automation switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-slate-800">Recurring Status Deliveries</span>
              <span className="text-[10px] text-slate-500">Auto-generate PDF reports and email to specified stakeholders</span>
            </div>
            <button
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center shrink-0 cursor-pointer ${
                config.isEnabled ? 'bg-[#00288e]' : 'bg-slate-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-all absolute shadow-sm ${
                config.isEnabled ? 'left-[22px]' : 'left-0.5'
              }`} />
            </button>
          </div>

          <AnimatePresence>
            {config.isEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Frequency & Scope row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Delivery Cycle</label>
                    <select
                      value={config.frequency}
                      onChange={(e) => setConfig(prev => ({ ...prev, frequency: e.target.value as any }))}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                    >
                      <option value="daily">Daily Recap</option>
                      <option value="weekly">Weekly Status Digest</option>
                      <option value="bi-weekly">Bi-weekly Portfolio Assessment</option>
                      <option value="monthly">Monthly Compliance Audit</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Report Scope Filter</label>
                    <select
                      value={config.scope}
                      onChange={(e) => setConfig(prev => ({ ...prev, scope: e.target.value as any }))}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                    >
                      <option value="all">Full Portfolio List</option>
                      <option value="COMPLETED">Completed Audits Only</option>
                      <option value="PENDING">Pending backlogs Only</option>
                    </select>
                  </div>
                </div>

                {/* Day of week & Time parameters */}
                <div className="grid grid-cols-2 gap-4">
                  {config.frequency !== 'daily' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Target Weekday</label>
                      <select
                        value={config.dayOfWeek}
                        onChange={(e) => setConfig(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                      >
                        {DAYS_OF_WEEK.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Dispatch Time</label>
                    <input
                      type="time"
                      value={config.timeOfDay}
                      onChange={(e) => setConfig(prev => ({ ...prev, timeOfDay: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                    />
                  </div>
                </div>

                {/* Email inputs */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>Recipients Emails (comma separated)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. inspector@gmail.com, admin@propertyowner.com"
                    value={config.emails}
                    onChange={(e) => setConfig(prev => ({ ...prev, emails: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                  />
                  <p className="text-[9px] text-slate-400 font-medium">Automatic system will compile, attach PDF, and email instantly.</p>
                </div>

                {/* Live Next Trigger Date Banner */}
                <div className="p-3 bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-xl text-[11px] flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-0.5">
                    <span className="block font-black uppercase text-[8px] tracking-wider text-indigo-400">Next Scheduled Run Time</span>
                    <strong className="text-indigo-900 font-extrabold">{nextTrigger}</strong>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Form save CTA */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#00288e] hover:bg-[#1e40af] text-white p-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Configuration Saved Successfully!</span>
              </>
            ) : (
              <span>Save Scheduling Parameters</span>
            )}
          </button>
        </form>

        {/* Live Simulation Audit logs / test trigger panel (5 columns) */}
        <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-indigo-500" />
              Automated Dispatch Sandbox
            </span>
            <span className="text-[8px] text-slate-400 font-bold font-mono">SMTP Port: 25 (SSL)</span>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Test your configuration immediately without waiting for the next scheduled trigger window.
            </p>
            
            <button
              type="button"
              onClick={handleSimulateDispatch}
              disabled={isSimulating}
              className="w-full flex items-center justify-center gap-1.5 bg-slate-200 hover:bg-slate-300 disabled:opacity-60 text-slate-800 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00288e]" />
                  <span>Generating Compliance PDF...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#00288e] fill-current" />
                  <span>Trigger Simulated Deliver Now</span>
                </>
              )}
            </button>
          </div>

          {/* Simulation Output Area */}
          <div className="h-[148px] bg-slate-900 rounded-xl p-3 text-[10px] font-mono text-slate-300 overflow-y-auto space-y-1.5 border border-slate-800 shadow-inner">
            {simulationLogs.length === 0 ? (
              <p className="text-slate-500 italic text-center pt-10">Click "Trigger Simulated Deliver Now" above to stream execution audit logs...</p>
            ) : (
              <div className="space-y-1">
                {simulationLogs.map((log, idx) => (
                  <p key={idx} className={idx === simulationLogs.length - 1 ? 'text-emerald-400 font-bold' : ''}>
                    {log}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-start gap-1.5 bg-white p-2 rounded-xl border border-slate-100 text-[10px] text-slate-400 font-medium leading-relaxed">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Note: This compiles registered field properties, signs them electronically with timestamp hash, and sends an alert.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
