import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Award, Settings, LogOut, ClipboardList, Building, Plus, Upload, BookOpen,
  Bell, Wifi, WifiOff, PenTool, KeyRound, Fingerprint, HelpCircle, Check, Trash2, Search, X,
  Image, MessageSquare, Sparkles, Clock, CheckCircle2, AlertTriangle, Mic,
  ChevronLeft, ChevronRight, Menu, Calendar, MapPin, ArrowRight, CheckSquare,
  FileDown, Printer, FileText, FileCheck, Share2, RefreshCw, Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PersonalInfo, CredentialItem, InspectionItem, Message, ActivityLogItem } from '../types';
import { initialProfile, initialCredentials, initialInspections } from '../data';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import ActivityLog from './ActivityLog';
import InspectionCalendar from './InspectionCalendar';
import InspectionSummaryWidget from './InspectionSummaryWidget';
import InspectionNotificationCenter from './InspectionNotificationCenter';
import QuickNotesWidget from './QuickNotesWidget';
import ReportSchedulerWidget from './ReportSchedulerWidget';
import InspectionFieldMap from './InspectionFieldMap';
import InspectionDetailsModal from './InspectionDetailsModal';
import PropertyDashboardView from './PropertyDashboardView';
import ReportsView from './ReportsView';
import KnowledgeBaseView from './KnowledgeBaseView';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const completedVal = payload.find((p: any) => p.name === 'Completed' || p.dataKey === 'Completed')?.value || 0;
    const pendingVal = payload.find((p: any) => p.name === 'Pending' || p.dataKey === 'Pending')?.value || 0;
    const totalVal = completedVal + pendingVal;
    
    return (
      <div className="bg-white/95 p-3 rounded-xl border border-slate-200 shadow-xl backdrop-blur-md">
        <p className="text-[11px] font-black text-slate-800 mb-1.5 tracking-tight">{label}</p>
        <div className="space-y-1.5 text-[10px]">
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-slate-500 font-bold">
              <span className="w-1.5 h-1.5 bg-[#00288e] rounded-full" />
              Completed
            </span>
            <strong className="text-slate-800 font-extrabold">{completedVal}</strong>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-slate-500 font-bold">
              <span className="w-1.5 h-1.5 bg-[#818cf8] rounded-full" />
              Pending
            </span>
            <strong className="text-slate-800 font-extrabold">{pendingVal}</strong>
          </div>
          <div className="border-t border-slate-100 pt-1.5 mt-1 flex items-center justify-between gap-6 font-bold">
            <span className="text-slate-800 uppercase tracking-wider text-[9px]">Total Vettings</span>
            <span className="text-[#00288e]">{totalVal}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface DashboardViewProps {
  profile: PersonalInfo;
  onUpdateProfile: (updated: PersonalInfo) => void;
  onSignOut: () => void;
}

export default function DashboardView({ profile, onUpdateProfile, onSignOut }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'inspections' | 'properties' | 'settings' | 'activity' | 'schedule' | 'reports' | 'knowledge'>('schedule');
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
    return false;
  });
  
  // Profile edit states
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(profile.fullName);
  const [editEmail, setEditEmail] = useState<string>(profile.email);
  const [editPhone, setEditPhone] = useState<string>(profile.phone);
  const [editTimezone, setEditTimezone] = useState<string>(profile.timezone);

  // App preferences states
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [offlineMode, setOfflineMode] = useState<boolean>(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(false);

  // Auto-refresh interval preferences
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('proinspect_auto_refresh_enabled');
      return saved !== 'false'; // Default to true
    }
    return true;
  });
  const [refreshInterval, setRefreshInterval] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('proinspect_refresh_interval');
      return saved ? parseInt(saved, 10) : 60; // Default to 60 seconds
    }
    return 60;
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Credentials list
  const [credentials, setCredentials] = useState<CredentialItem[]>(initialCredentials);
  const [showAddCredModal, setShowAddCredModal] = useState<boolean>(false);
  const [newCredType, setNewCredType] = useState<string>('TREC Property Inspector');
  const [newCredId, setNewCredId] = useState<string>('');
  const [newCredExpiry, setNewCredExpiry] = useState<string>('');

  // Inspections list & modal
  const [inspections, setInspections] = useState<InspectionItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('proinspect_inspections');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error('Error parsing cached inspections:', e);
        }
      }
    }
    return initialInspections;
  });
  const [showAddInspectionModal, setShowAddInspectionModal] = useState<boolean>(false);
  const [newInspProperty, setNewInspProperty] = useState<string>('');
  const [newInspAddress, setNewInspAddress] = useState<string>('');
  const [newInspClientName, setNewInspClientName] = useState<string>('');
  const [newInspType, setNewInspType] = useState<string>('Full Structural');
  const [newInspDate, setNewInspDate] = useState<string>('');
  const [selectedInspection, setSelectedInspection] = useState<InspectionItem | null>(null);
  const [selectedPropertyForDashboard, setSelectedPropertyForDashboard] = useState<InspectionItem | null>(null);

  // Property filter for inspections page
  const [selectedProperty, setSelectedProperty] = useState<string>('All Properties');

  // Helper: Extract unique property names from inspections
  const getUniqueProperties = (): string[] => {
    const uniqueProps = Array.from(
      new Set<string>(inspections.map(insp => insp.propertyName))
    );
    return uniqueProps.sort();
  };

  // Generate 7-day activity data dynamically based on the current date (July 2, 2026)
  const last7DaysData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    // Anchor to July 2, 2026, which is the current date from metadata, to capture mock data nicely
    d.setFullYear(2026, 6, 2); // July 2, 2026 (Month is 0-indexed, so 6 is July)
    d.setDate(d.getDate() - (6 - idx)); // from 6 days ago up to today
    
    // Format for matching
    const matchStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); // e.g. "Jun 28, 2026"
    // Format for display
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // e.g. "Jun 28"
    
    // Count by status
    const completedCount = inspections.filter(item => item.date === matchStr && item.status === 'COMPLETED').length;
    const pendingCount = inspections.filter(item => item.date === matchStr && (item.status === 'IN_PROGRESS' || item.status === 'SCHEDULED')).length;
    
    return {
      name: label,
      Completed: completedCount,
      Pending: pendingCount,
    };
  });

  const handleSaveInspectionDetails = (id: string, updatedFields: Partial<InspectionItem>) => {
    setInspections(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedFields,
          isOfflineDraft: !effectiveOnline ? true : item.isOfflineDraft
        };
      }
      return item;
    }));
    
    // Also log this in activity logs so it reflects in the feed!
    const updatedItem = inspections.find(item => item.id === id);
    if (updatedItem) {
      const finalItem = { ...updatedItem, ...updatedFields };
      const isCompleted = updatedFields.status === 'COMPLETED';
      const offlineSuffix = !effectiveOnline ? ' (Offline Saved)' : '';
      const newLog: ActivityLogItem = {
        id: `log-${Date.now()}`,
        type: isCompleted ? 'inspection_completed' : 'profile_updated',
        category: 'activity',
        title: (isCompleted ? 'Inspection Verified & Completed' : 'Inspection Updated') + offlineSuffix,
        description: `Inspection findings updated for "${finalItem.propertyName}".` + (!effectiveOnline ? ' Saved locally to offline device storage.' : ' Sync completed.'),
        timestamp: 'Just now',
        date: new Date().toISOString().split('T')[0],
        isRead: false
      };
      setLogs(prev => [newLog, ...prev]);
      if (!effectiveOnline) {
        setToastMessage(`Inspection saved locally to your device's offline cache!`);
      }
    }
  };

  // Expanded checklists state for inline view
  const [expandedChecklists, setExpandedChecklists] = useState<Record<string, boolean>>({});

  const toggleChecklistExpanded = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedChecklists(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleSubtaskFromList = (inspectionId: string, subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInspections(prev => prev.map(insp => {
      if (insp.id === inspectionId) {
        const updatedSubtasks = (insp.subtasks || []).map(task => 
          task.id === subtaskId ? { ...task, completed: !task.completed } : task
        );
        return {
          ...insp,
          subtasks: updatedSubtasks
        };
      }
      return insp;
    }));
  };

  // Search filter for lists
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectionsViewMode, setInspectionsViewMode] = useState<'list' | 'map'>('list');
  
  // Web Speech API Voice Search states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for web speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          const cleanedText = transcript.trim().replace(/\.$/, '');
          setSearchQuery(cleanedText);
          setToastMessage(`Voice search: "${cleanedText}"`);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech detected.');
        } else {
          setSpeechError(`Voice error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      setSpeechError('Voice search not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
        setIsListening(false);
      }
    }
  };
  
  // Filtered inspections based on search query and selected property
  const filteredInspections = inspections
    .filter(item => {
      // Filter by selected property
      if (selectedProperty !== 'All Properties' && item.propertyName !== selectedProperty) {
        return false;
      }
      // Filter by search query
      return (
        item.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.inspectorName && item.inspectorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.clientName && item.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

  // Activity Log Search & Status Filter
  const [activitySearchText, setActivitySearchText] = useState<string>('');
  const [activityStatusFilter, setActivityStatusFilter] = useState<string>('all');

  // Quick Action Speed-Dial States
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const imageUploadInputRef = useRef<HTMLInputElement>(null);

  // Auto-clear toast after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newLog: ActivityLogItem = {
        id: `log-${Date.now()}`,
        type: 'profile_updated',
        category: 'activity',
        title: 'Image Uploaded',
        description: `Successfully uploaded and verified photo "${file.name}" (${(file.size / 1024).toFixed(1)} KB) to state registry database.`,
        timestamp: 'Just now',
        date: new Date().toISOString(),
        isRead: false,
        metadata: `FILE_NAME: ${file.name}\nFILE_SIZE: ${(file.size / 1024).toFixed(1)} KB\nMIME_TYPE: ${file.type}`,
        status: 'Completed'
      };
      setLogs(prev => [newLog, ...prev]);
      setToastMessage(`Successfully uploaded and verified photo: "${file.name}"!`);
    }
  };

  // Activity & Notification logs state
  const [logs, setLogs] = useState<ActivityLogItem[]>([
    {
      id: 'log-1',
      type: 'system_alert',
      category: 'notification',
      title: 'Compliance Review Pending',
      description: 'Lead-Based Paint Cert (LBP-11029) expires in under 30 days. Action recommended.',
      timestamp: '3 hours ago',
      date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      metadata: 'LEDGER_STATUS: EXPIRING_SOON\nREASON: EXPIRED_GRACE_PERIOD_NEARING\nNODE_ID: TX_LEDGER_981',
      status: 'Flagged'
    },
    {
      id: 'log-2',
      type: 'offline_sync',
      category: 'activity',
      title: 'Offline Database Reconciled',
      description: 'Successfully verified and synced cached local draft inspection reports with state board records.',
      timestamp: 'Yesterday',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      metadata: 'SYNC_RECORDS: 3\nCONNECTION_QUALITY: EXCELLENT\nSYNC_HASH: sha256-bd910e828a',
      status: 'Completed'
    },
    {
      id: 'log-3',
      type: 'inspection_completed',
      category: 'activity',
      title: 'Oakwood Apartments Report Approved',
      description: 'Full Structural Assessment complete. Quality safety index score registered at 94/100.',
      timestamp: '2 days ago',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      metadata: 'PROPERTY: Oakwood Luxury Apartments\nINSPECTOR: Marcus Thompson\nSCORE: 94',
      status: 'Completed'
    },
    {
      id: 'log-4',
      type: 'credential_added',
      category: 'activity',
      title: 'TREC Inspector Clearance Verified',
      description: 'Active license TX-98234-A successfully authenticated on official Texas registries ledger.',
      timestamp: '4 days ago',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      metadata: 'LICENSE: TX-98234-A\nVERIFIED_DATE: 2026-06-24\nSTATUS: COMPLIANT',
      status: 'Completed'
    },
    {
      id: 'log-5',
      type: 'profile_updated',
      category: 'activity',
      title: 'Lead Inspector Profile Updated',
      description: 'System user profile fields (phone number and email) modified successfully.',
      timestamp: '5 days ago',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      status: 'Completed'
    }
  ]);

  // Offline sync & connection status states
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const effectiveOnline = isOnline && !isSimulatedOffline;
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync to localStorage whenever inspections changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('proinspect_inspections', JSON.stringify(inspections));
    }
  }, [inspections]);

  // Sync auto-refresh settings to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('proinspect_auto_refresh_enabled', String(isAutoRefreshEnabled));
      localStorage.setItem('proinspect_refresh_interval', String(refreshInterval));
    }
  }, [isAutoRefreshEnabled, refreshInterval]);

  // Handler to fetch updates from compliance data source
  const handleRefreshFromDataSource = (isAuto = false) => {
    if (isRefreshing) return;
    
    // If offline (simulated or real), show appropriate error or ignore auto-refresh silently
    if (!effectiveOnline) {
      if (!isAuto) {
        setToastMessage("Cannot refresh: Device is currently offline.");
      }
      return;
    }

    setIsRefreshing(true);
    
    // Simulate API network latency
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedAt(new Date());

      // Simulate pulling new real-time inspections or progression of existing ones
      setInspections(prev => {
        let updated = false;
        const newInspections = prev.map(item => {
          // If scheduled, 20% chance of starting
          if (item.status === 'SCHEDULED' && Math.random() > 0.8) {
            updated = true;
            return {
              ...item,
              status: 'IN_PROGRESS' as const,
              subtasks: item.subtasks?.map((st, idx) => idx === 0 ? { ...st, completed: true } : st)
            };
          }
          // If in progress, 15% chance of completing
          if (item.status === 'IN_PROGRESS' && Math.random() > 0.85) {
            updated = true;
            return {
              ...item,
              status: 'COMPLETED' as const,
              score: Math.floor(Math.random() * 10) + 90, // score 90-99
              subtasks: item.subtasks?.map(st => ({ ...st, completed: true }))
            };
          }
          return item;
        });

        // 25% chance of a new inspection assigned from board registry
        if (Math.random() > 0.75 && prev.length < 12) {
          const mockPool = [
            { name: 'Canyon View Estates', address: '1504 Canyon Rd, Austin, TX', type: 'WDI / Termite', client: 'Sarah Connor (Property Owner)' },
            { name: 'North Loop Retail', address: '5512 North Loop Blvd, Austin, TX', type: 'Full Structural', client: 'James Hall (Retail Management)' },
            { name: 'Barton Springs Bungalow', address: '2204 Barton Hills Dr, Austin, TX', type: 'Lead-Based Paint', client: 'Lydia Bennett (HOA Board)' }
          ];
          const choice = mockPool[Math.floor(Math.random() * mockPool.length)];
          if (!prev.some(p => p.propertyName === choice.name)) {
            updated = true;
            const newInsp: InspectionItem = {
              id: `insp-${Date.now()}`,
              propertyName: choice.name,
              address: choice.address,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              inspectorName: 'Marcus Thompson',
              status: 'SCHEDULED',
              type: choice.type,
              clientName: choice.client,
              photos: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'],
              subtasks: [
                { id: `sub-${Date.now()}-1`, title: 'Check exterior barriers', completed: false },
                { id: `sub-${Date.now()}-2`, title: 'Inspect moisture logs', completed: false }
              ],
              voiceNotes: []
            };
            return [newInsp, ...newInspections];
          }
        }

        return newInspections;
      });

      // Log the action to system logs so the user sees it in notifications/activity feed
      const newLog: ActivityLogItem = {
        id: `log-${Date.now()}`,
        type: 'offline_sync',
        category: 'activity',
        title: isAuto ? 'Automated Sync Refresh' : 'Manual Registry Refresh',
        description: 'Synchronized database with Texas State Board compliance registry. List is up to date.',
        timestamp: 'Just now',
        date: new Date().toISOString().split('T')[0],
        isRead: false
      };
      setLogs(prev => [newLog, ...prev]);

      setToastMessage(isAuto ? "Registry automatically synchronized." : "Compliance registry updated successfully.");
    }, 850);
  };

  // Timer logic for Auto-Refresh from data source
  useEffect(() => {
    if (!isAutoRefreshEnabled || !effectiveOnline) return;

    const intervalId = setInterval(() => {
      handleRefreshFromDataSource(true);
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [isAutoRefreshEnabled, refreshInterval, effectiveOnline, isRefreshing]);

  // Synchronize local cached draft inspection reports with simulated backend
  const handleSyncNow = () => {
    if (isSyncing) return;
    setIsSyncing(true);

    const unsyncedCount = inspections.filter(item => item.isOfflineDraft).length;

    setTimeout(() => {
      setInspections(prev => {
        return prev.map(item => {
          if (item.isOfflineDraft) {
            return { ...item, isOfflineDraft: false };
          }
          return item;
        });
      });

      // Add a sync reconciled log
      const newLog: ActivityLogItem = {
        id: `log-${Date.now()}`,
        type: 'offline_sync',
        category: 'activity',
        title: 'Offline Database Reconciled',
        description: `Successfully synchronized ${unsyncedCount || 1} cached local draft inspection reports with state board compliance systems.`,
        timestamp: 'Just now',
        date: new Date().toISOString(),
        isRead: false,
        metadata: `SYNC_RECORDS: ${unsyncedCount || 1}\nCONNECTION_QUALITY: EXCELLENT\nSYNC_HASH: sha256-${Math.random().toString(16).slice(2, 10)}`,
        status: 'Completed'
      };
      setLogs(prev => [newLog, ...prev]);
      setIsSyncing(false);
      setToastMessage(`Successfully synced ${unsyncedCount || 1} cached local draft report(s) with state board!`);
    }, 1800);
  };

  const handleMarkAsRead = (id: string) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, isRead: true } : log));
  };

  const handleMarkAllAsRead = () => {
    setLogs(prev => prev.map(log => ({ ...log, isRead: true })));
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleOnDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleSimulateEvent = (type: 'inspection_created' | 'inspection_completed' | 'credential_added' | 'profile_updated' | 'system_alert' | 'offline_sync') => {
    let title = '';
    let description = '';
    let category: 'activity' | 'notification' = 'activity';
    let metadata = '';

    let status: 'Completed' | 'In-Progress' | 'Flagged' = 'Completed';

    switch (type) {
      case 'inspection_created':
        title = 'Inspection Area Assigned';
        description = 'A newly scheduled inspection task has been assigned to your workspace profile.';
        category = 'activity';
        metadata = 'JOB_ID: SCHEDULE-9102\nPRIORITY: NORMAL\nTYPE: Structural Checklist';
        status = 'In-Progress';
        break;
      case 'inspection_completed':
        title = 'Quality Index Audited';
        description = 'Completed structural assessment draft has been successfully validated with 98% scoring.';
        category = 'activity';
        metadata = 'PROPERTY: Summit Ridge Complex\nRESULT: HIGH_SCORE\nQUALITY_INDEX: 98%';
        status = 'Completed';
        break;
      case 'credential_added':
        title = 'Certificate approved by Board';
        description = 'Your uploaded lead-paint and HVAC safety clearances have passed automated board rules checks.';
        category = 'activity';
        metadata = 'BOARD: TREC\nREGISTRATION_CODE: COMPLY-TX-883\nSTATUS: ACTIVE';
        status = 'Completed';
        break;
      case 'profile_updated':
        title = 'Authentication Security Upgraded';
        description = 'Account password modified. Advanced 256-bit hash encryption algorithm successfully validated.';
        category = 'activity';
        metadata = 'ALGORITHM: SHA-256\nSALT_SYNC: SUCCESS';
        status = 'Completed';
        break;
      case 'system_alert':
        title = 'System Compliance Rule Notice';
        description = 'Important update: New Texas environmental regulations for lead inspections take effect next month.';
        category = 'notification';
        metadata = 'REGULATION: COMP-ENV-2026\nAUTHORITY: STATE_BOARD_REGISTRY\nSEVERITY: CRITICAL';
        status = 'Flagged';
        break;
      case 'offline_sync':
        title = 'Local Cache Reconciled';
        description = 'All locally drafted offline reports have successfully synchronized with cloud database ingress.';
        category = 'activity';
        metadata = 'OFFLINE_PASS: APPROVED\nLOCAL_RECORDS_MERGED: 12\nHOST: CLOUD_RUN_INGRESS';
        status = 'Completed';
        break;
    }

    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      type,
      category,
      title,
      description,
      timestamp: 'Just now',
      date: new Date().toISOString(),
      isRead: false,
      metadata,
      status
    };

    setLogs(prev => [newLog, ...prev]);
  };

  // Support/Help Chat overlay state
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [supportMessages, setSupportMessages] = useState<Message[]>([
    { sender: 'support', text: 'Hi! Marcus. How can I assist you with your professional license or reports today?', timestamp: 'Just now' }
  ]);
  const [newMsgText, setNewMsgText] = useState<string>('');

  // Password reset modal
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  // Signature Pad state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);

  // Handle Edit profile submission
  const handleSaveProfile = () => {
    onUpdateProfile({
      ...profile,
      fullName: editName,
      email: editEmail,
      phone: editPhone,
      timezone: editTimezone
    });
    
    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      type: 'profile_updated',
      category: 'activity',
      title: 'Profile Updated',
      description: `Inspector details for ${editName} saved successfully.`,
      timestamp: 'Just now',
      date: new Date().toISOString(),
      isRead: false,
      metadata: `NAME: ${editName}\nEMAIL: ${editEmail}\nPHONE: ${editPhone}\nTIMEZONE: ${editTimezone}`,
      status: 'Completed'
    };
    setLogs(prev => [newLog, ...prev]);
    setIsEditingProfile(false);
  };

  // Sync edit fields when profile prop changes
  useEffect(() => {
    setEditName(profile.fullName);
    setEditEmail(profile.email);
    setEditPhone(profile.phone);
    setEditTimezone(profile.timezone);
  }, [profile]);

  // Handle cert creation
  const handleAddCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCredId || !newCredExpiry) return;
    const newCred: CredentialItem = {
      id: `cred-${Date.now()}`,
      type: newCredType,
      licenseId: newCredId,
      expiryDate: newCredExpiry,
      status: 'ACTIVE',
    };
    setCredentials([newCred, ...credentials]);
    
    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      type: 'credential_added',
      category: 'activity',
      title: 'Credential Added',
      description: `New "${newCredType}" with license ID "${newCredId}" uploaded.`,
      timestamp: 'Just now',
      date: new Date().toISOString(),
      isRead: false,
      metadata: `CREDENTIAL: ${newCredType}\nLICENSE: ${newCredId}\nEXPIRY: ${newCredExpiry}`,
      status: 'Completed'
    };
    setLogs(prev => [newLog, ...prev]);

    setNewCredId('');
    setNewCredExpiry('');
    setShowAddCredModal(false);
  };

  // Helper to generate standard sub-tasks depending on the inspection type
  const getStandardSubtasks = (type: string) => {
    const timestamp = Date.now();
    switch (type) {
      case 'Full Structural':
        return [
          { id: `sub-${timestamp}-1`, title: 'Verify load-bearing walls integrity', completed: false },
          { id: `sub-${timestamp}-2`, title: 'Assess foundation alignment & cracks', completed: false },
          { id: `sub-${timestamp}-3`, title: 'Inspect roof truss & support columns', completed: false },
          { id: `sub-${timestamp}-4`, title: 'Test structural concrete moisture levels', completed: false },
        ];
      case 'WDI / Termite':
        return [
          { id: `sub-${timestamp}-1`, title: 'Check perimeter soil and mulch beds', completed: false },
          { id: `sub-${timestamp}-2`, title: 'Probe sub-floor wood frames & joists', completed: false },
          { id: `sub-${timestamp}-3`, title: 'Inspect wall voids near plumbing penetrations', completed: false },
          { id: `sub-${timestamp}-4`, title: 'Set up moisture monitoring sensors', completed: false },
        ];
      case 'Lead-Based Paint':
        return [
          { id: `sub-${timestamp}-1`, title: 'Calibrate XRF analyzer gun', completed: false },
          { id: `sub-${timestamp}-2`, title: 'Take core paint samples from window sills', completed: false },
          { id: `sub-${timestamp}-3`, title: 'Test kitchen trim and cabinet finishes', completed: false },
          { id: `sub-${timestamp}-4`, title: 'Assess exterior door frame paint layers', completed: false },
        ];
      case 'Mold & Moisture':
        return [
          { id: `sub-${timestamp}-1`, title: 'Perform thermal imaging of bathroom walls', completed: false },
          { id: `sub-${timestamp}-2`, title: 'Measure relative humidity in attic & basement', completed: false },
          { id: `sub-${timestamp}-3`, title: 'Inspect HVAC drain pans & condensate lines', completed: false },
          { id: `sub-${timestamp}-4`, title: 'Collect air spore sample for lab analysis', completed: false },
        ];
      case 'Electrical Safety':
        return [
          { id: `sub-${timestamp}-1`, title: 'Test GFCI outlet trip-times & wiring', completed: false },
          { id: `sub-${timestamp}-2`, title: 'Thermographic scan of breaker panel', completed: false },
          { id: `sub-${timestamp}-3`, title: 'Verify grounding electrode conductor', completed: false },
          { id: `sub-${timestamp}-4`, title: 'Check outdoor receptacle weatherproof covers', completed: false },
        ];
      case 'HVAC Audit':
        return [
          { id: `sub-${timestamp}-1`, title: 'Measure static pressure across indoor coil', completed: false },
          { id: `sub-${timestamp}-2`, title: 'Test furnace heat exchanger carbon monoxide', completed: false },
          { id: `sub-${timestamp}-3`, title: 'Verify outdoor condenser amp draw & fan', completed: false },
          { id: `sub-${timestamp}-4`, title: 'Inspect air filter rating and plenum seal', completed: false },
        ];
      default:
        return [
          { id: `sub-${timestamp}-1`, title: 'General visual inspection of exterior', completed: false },
          { id: `sub-${timestamp}-2`, title: 'Verify interior safety systems & alarms', completed: false },
          { id: `sub-${timestamp}-3`, title: 'Test plumbing water flow & main shutoff', completed: false },
          { id: `sub-${timestamp}-4`, title: 'Document noted defects with photo proof', completed: false },
        ];
    }
  };

  // Handle inspection creation
  const handleAddInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInspProperty || !newInspAddress) return;
    
    // Parse custom date picker value, if none selected, default to today
    const rawDate = newInspDate ? new Date(newInspDate + 'T12:00:00') : new Date();
    const formattedDate = rawDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const newInsp: InspectionItem = {
      id: `insp-${Date.now()}`,
      propertyName: newInspProperty,
      address: newInspAddress,
      date: formattedDate,
      inspectorName: profile.fullName,
      status: 'SCHEDULED',
      type: newInspType,
      clientName: newInspClientName.trim() || 'Unassigned Client',
      subtasks: getStandardSubtasks(newInspType),
      isOfflineDraft: !effectiveOnline
    };
    setInspections([newInsp, ...inspections]);

    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      type: 'inspection_created',
      category: 'activity',
      title: 'Inspection Task Created' + (!effectiveOnline ? ' (Offline Draft)' : ''),
      description: `Scheduled "${newInspType}" checklist for "${newInspProperty}".` + (!effectiveOnline ? ' Cached locally.' : ''),
      timestamp: 'Just now',
      date: new Date().toISOString(),
      isRead: false,
      metadata: `PROPERTY: ${newInspProperty}\nADDRESS: ${newInspAddress}\nCLIENT: ${newInsp.clientName}\nTYPE: ${newInspType}\nDATE: ${formattedDate}\nSTATUS: ${!effectiveOnline ? 'LOCAL_CACHE' : 'SYNCED'}`,
      status: 'In-Progress'
    };
    setLogs(prev => [newLog, ...prev]);

    if (!effectiveOnline) {
      setToastMessage(`Inspection created & saved to local offline cache!`);
    } else {
      setToastMessage(`Inspection successfully created and synced!`);
    }

    setNewInspProperty('');
    setNewInspAddress('');
    setNewInspClientName('');
    setNewInspDate('');
    setShowAddInspectionModal(false);
  };

  const handleConvertNoteToInspection = (noteTitle: string, noteContent: string) => {
    setNewInspProperty(noteTitle);
    setNewInspAddress('');
    setNewInspClientName('');
    setNewInspType('Full Structural');
    setShowAddInspectionModal(true);
    setToastMessage(`Converted note: "${noteTitle}"! Specify address and date to finalize.`);
  };


  // Support Chat message send
  const handleSendMessage = () => {
    if (!newMsgText.trim()) return;
    const userMsg: Message = { sender: 'user', text: newMsgText, timestamp: '1s ago' };
    setSupportMessages(prev => [...prev, userMsg]);
    setNewMsgText('');

    setTimeout(() => {
      const responses = [
        "That's noted. I am updating your agency account details.",
        "Your license check with the state board is still 100% green. No action is required.",
        "I have alerted our technical support team. We will call you at " + profile.phone + " shortly.",
        "Your offline database is successfully synced on our cloud nodes."
      ];
      const botMsg: Message = {
        sender: 'support',
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: 'Just now'
      };
      setSupportMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  // Signature Pad Drawing Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#00288e';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Initialize signature canvas size on modal/render
  useEffect(() => {
    if (activeTab === 'settings') {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.parentElement?.clientWidth || 300;
        canvas.height = 120;
      }
    }
  }, [activeTab]);

  // Analytics for top summary card row - filtered by selected property
  const getPropertyFilteredInspections = () => {
    if (selectedProperty === 'All Properties') {
      return inspections;
    }
    return inspections.filter(i => i.propertyName === selectedProperty);
  };

  const propertyFilteredInspections = getPropertyFilteredInspections();

  const pendingInspectionsCount = propertyFilteredInspections.filter(i => i.status === 'IN_PROGRESS' || i.status === 'SCHEDULED').length;
  
  const completedThisWeekCount = propertyFilteredInspections.filter(i => {
    if (i.status !== 'COMPLETED') return false;
    try {
      const inspDate = new Date(i.date);
      const currentDate = new Date('2026-06-30'); // System local date is 2026-06-30
      const diffTime = Math.abs(currentDate.getTime() - inspDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    } catch (e) {
      return true; // fallback
    }
  }).length;

  const activeAlertsCount = logs.filter(l => l.status === 'Flagged').length;

  if (selectedPropertyForDashboard) {
    return (
      <PropertyDashboardView 
        property={selectedPropertyForDashboard}
        profile={profile}
        onBack={() => setSelectedPropertyForDashboard(null)}
        onSaveInspection={handleSaveInspectionDetails}
        onTriggerToast={(msg) => setToastMessage(msg)}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800 antialiased">
      
      {/* Top Header Navigation (Mobile Only) */}
      <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-4 h-14 bg-white border-b border-slate-200 md:hidden">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-[#00288e] tracking-tight">ProInspect</span>
          <span className={`w-2 h-2 rounded-full ${effectiveOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
            {effectiveOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSupportModal(true)} className="p-1.5 text-slate-500 hover:text-[#00288e]">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button onClick={() => setShowAddInspectionModal(true)} className="p-1 text-white bg-[#00288e] rounded-full">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Persistent Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col py-8 gap-6 fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out z-30 overflow-x-hidden ${isSidebarCollapsed ? 'w-[76px] px-3' : 'w-[300px] px-6'}`}>
        {isSidebarCollapsed ? (
          <div className="flex flex-col items-center justify-center mb-2 gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(false)} 
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#00288e] hover:bg-slate-50 transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div title="ProInspect">
              <ClipboardList className="w-7 h-7 text-[#00288e]" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-[#00288e] tracking-tight flex items-center gap-2 truncate">
              <ClipboardList className="w-7 h-7 text-[#00288e] shrink-0" />
              <span>ProInspect</span>
            </h1>
            <button 
              onClick={() => setIsSidebarCollapsed(true)} 
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#00288e] hover:bg-slate-100 transition-colors hidden md:block"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Lead Inspector Profile Badge */}
        {isSidebarCollapsed ? (
          <div className="flex justify-center" title={`${profile.fullName} (License #TX-98234)`}>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 ring-2 ring-[#00288e]/20 shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7Xp4VxLGrte8hgcQHWNF75dZHLet1-pAjY8Uk6GMrNj7O9kfh6-l34bIcHkKbLTINyYWrEpL3B7YTMKRZ6sdkDW8gIayCcAiNf-jTXzf1qoX2pWeyXoQeBK7LtGbPERNgsmk70Ha5kSivRDvLQocjt7m-7OTHvCuqVdoUoPh2JPhkqoMIvPaP4H0l6jiL9k4Tp2wI-1OMJktHCtk-fleHKUPKxJGX9eiU1CnocIYK6H3uWnz45ccw_hDjel2nx-a47dNPqN6LA_E" 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 bg-slate-100 rounded-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 ring-2 ring-[#00288e]/20 shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7Xp4VxLGrte8hgcQHWNF75dZHLet1-pAjY8Uk6GMrNj7O9kfh6-l34bIcHkKbLTINyYWrEpL3B7YTMKRZ6sdkDW8gIayCcAiNf-jTXzf1qoX2pWeyXoQeBK7LtGbPERNgsmk70Ha5kSivRDvLQocjt7m-7OTHvCuqVdoUoPh2JPhkqoMIvPaP4H0l6jiL9k4Tp2wI-1OMJktHCtk-fleHKUPKxJGX9eiU1CnocIYK6H3uWnz45ccw_hDjel2nx-a47dNPqN6LA_E" 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-slate-900 text-sm truncate">{profile.fullName}</p>
              <p className="text-xs text-slate-500 truncate">License #TX-98234</p>
            </div>
          </div>
        )}

        {/* Connection Status Widget */}
        {isSidebarCollapsed ? (
          <div className="flex justify-center my-1">
            <button
              onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
              title={effectiveOnline ? 'Online (Click to Simulate Offline)' : 'Offline Draft Mode (Click to Go Online)'}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                effectiveOnline 
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                  : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
              }`}
            >
              {effectiveOnline ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-500" />
              )}
            </button>
          </div>
        ) : (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${effectiveOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider truncate">
                  {effectiveOnline ? 'Live Network' : 'Offline Mode'}
                </span>
              </div>
              <button
                onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
                className="text-[9px] font-extrabold text-[#00288e] bg-[#dde1ff]/60 px-2 py-1 rounded hover:bg-[#dde1ff] transition-all cursor-pointer shrink-0 uppercase tracking-wider"
              >
                {isSimulatedOffline ? 'Connect' : 'Disconnect'}
              </button>
            </div>
            {inspections.some(i => i.isOfflineDraft) && (
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#00288e] hover:bg-[#1e40af] disabled:bg-slate-350 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                {isSyncing ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3 h-3 shrink-0" />
                    <span>Sync {inspections.filter(i => i.isOfflineDraft).length} Draft(s)</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {isSidebarCollapsed ? (
            <>
              <button 
                onClick={() => setActiveTab('inspections')}
                title="Inspections"
                className={`flex items-center justify-center p-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'inspections' 
                    ? 'bg-[#dde1ff] text-[#00288e]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="w-5 h-5 shrink-0" />
              </button>

              <button 
                onClick={() => setActiveTab('schedule')}
                title="Inspection Schedule"
                className={`flex items-center justify-center p-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'schedule' 
                    ? 'bg-[#dde1ff] text-[#00288e]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-5 h-5 shrink-0" />
              </button>

              <button 
                onClick={() => setActiveTab('properties')}
                title="Properties"
                className={`flex items-center justify-center p-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'properties' 
                    ? 'bg-[#dde1ff] text-[#00288e]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Building className="w-5 h-5 shrink-0" />
              </button>

              <button 
                onClick={() => setActiveTab('reports')}
                title="Reports & Compliance"
                className={`flex items-center justify-center p-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'reports' 
                    ? 'bg-[#dde1ff] text-[#00288e]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <FileText className="w-5 h-5 shrink-0" />
              </button>

              {/* <button 
                onClick={() => setActiveTab('credentials')}
                title="Credentials"
                className={`flex items-center justify-center p-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'credentials' 
                    ? 'bg-[#dde1ff] text-[#00288e]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Award className="w-5 h-5 shrink-0" />
              </button> */}

              <button 
                onClick={() => setActiveTab('activity')}
                title="Activity Log"
                className={`flex items-center justify-center p-3 text-sm font-medium rounded-xl transition-all cursor-pointer relative ${
                  activeTab === 'activity' 
                    ? 'bg-[#dde1ff] text-[#00288e]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Bell className="w-5 h-5 shrink-0" />
                {logs.filter(l => !l.isRead).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              <button 
                onClick={() => setActiveTab('knowledge')}
                title="Knowledge Base & RAG"
                className={`flex items-center justify-center p-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'knowledge' 
                    ? 'bg-[#dde1ff] text-[#00288e]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-5 h-5 shrink-0" />
              </button>

              <button 
                onClick={() => setActiveTab('settings')}
                title="Settings"
                className={`flex items-center justify-center p-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'settings' 
                    ? 'bg-[#00288e] text-white font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Settings className="w-5 h-5 shrink-0" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setActiveTab('inspections')}
                className={`flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'inspections' 
                    ? 'bg-[#dde1ff] text-[#00288e]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="w-5 h-5 shrink-0" />
                Inspections
              </button>

              <button 
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'schedule' 
                    ? 'bg-[#dde1ff] text-[#00288e]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-5 h-5 shrink-0" />
                Inspection Schedule
              </button>

              <button 
                onClick={() => setActiveTab('properties')}
                className={`flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'properties' 
                    ? 'bg-[#dde1ff] text-[#00288e]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Building className="w-5 h-5 shrink-0" />
                Properties
              </button>

              <button 
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'reports' 
                    ? 'bg-[#dde1ff] text-[#00288e]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <FileText className="w-5 h-5 shrink-0" />
                Reports & Compliance
              </button>

              <button 
                onClick={() => setActiveTab('activity')}
                className={`flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'activity' 
                    ? 'bg-[#dde1ff] text-[#00288e]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Bell className="w-5 h-5 shrink-0" />
                <span>Activity Log</span>
                {logs.filter(l => !l.isRead).length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {logs.filter(l => !l.isRead).length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setActiveTab('knowledge')}
                className={`flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'knowledge' 
                    ? 'bg-[#dde1ff] text-[#00288e]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-5 h-5 shrink-0" />
                Knowledge Base & RAG
              </button>

              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'settings' 
                    ? 'bg-[#00288e] text-white font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Settings className="w-5 h-5 shrink-0" />
                Settings
              </button>
            </>
          )}
        </nav>

        {/* Action Button: New Inspection */}
        {isSidebarCollapsed ? (
          <button 
            onClick={() => setShowAddInspectionModal(true)}
            title="New Inspection"
            className="bg-[#00288e] hover:bg-[#1e40af] text-white h-11 w-11 rounded-xl flex items-center justify-center shadow-md transition-all active:scale-[0.98] mx-auto shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={() => setShowAddInspectionModal(true)}
            className="bg-[#00288e] hover:bg-[#1e40af] text-white text-sm font-semibold h-11 rounded-xl flex items-center justify-center gap-2 px-6 shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New Inspection
          </button>
        )}

        <div className="border-t border-slate-200 pt-4 mt-auto">
          {isSidebarCollapsed ? (
            <button 
              onClick={onSignOut}
              title="Sign Out"
              className="w-full flex items-center justify-center p-3 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5 shrink-0" />
            </button>
          ) : (
            <button 
              onClick={onSignOut}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ease-in-out pt-14 md:pt-0 pb-20 md:pb-8 px-4 md:px-10 lg:px-12 ${isSidebarCollapsed ? 'md:ml-[76px]' : 'md:ml-[300px]'}`}>
        <div className="max-w-5xl mx-auto py-8">
          
          {/* Desktop Header / Top-bar with Sidebar Collapse/Expand Toggle */}
          <div className="hidden md:flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 text-slate-500 hover:text-[#00288e] hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200 shadow-xs flex items-center justify-center bg-white hover:scale-105 active:scale-95"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                )}
              </button>
              
              <div className="h-4 w-[1px] bg-slate-300 mx-1" />
              
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Workspace View</span>
                <h2 className="text-base font-black text-slate-900 leading-none capitalize">
                  {activeTab === 'schedule' ? 'Auditing Schedule' : activeTab === 'reports' ? 'Vetting & Compliance Reports' : activeTab}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Active Refresh Indicator / Timer status */}
              {isAutoRefreshEnabled && effectiveOnline && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-bold text-[#00288e] uppercase tracking-wider animate-pulse">
                  <Clock className="w-3.5 h-3.5 text-[#00288e]" />
                  <span>Auto-Refresh: {refreshInterval}s</span>
                </div>
              )}

              {/* Manual Refresh Action */}
              <button
                onClick={() => handleRefreshFromDataSource(false)}
                disabled={isRefreshing}
                className="p-1.5 text-slate-500 hover:text-[#00288e] hover:bg-slate-100 rounded-lg transition-all cursor-pointer border border-slate-200 shadow-xs flex items-center justify-center bg-white hover:scale-105 active:scale-95 disabled:opacity-50"
                title="Refresh Registry Data"
              >
                <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? 'animate-spin text-[#00288e]' : ''}`} />
              </button>

              {/* Extra connection indicator or actions in the header */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                <span className={`w-2 h-2 rounded-full ${effectiveOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {effectiveOnline ? 'Cloud Synced' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Offline Sync Banner */}
          {(!effectiveOnline || inspections.some(i => i.isOfflineDraft)) && (
            <div className={`mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-fade-in ${
              !effectiveOnline 
                ? 'bg-amber-50 border-amber-200 text-amber-900' 
                : 'bg-indigo-50 border-indigo-200 text-[#00288e]'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl mt-0.5 ${!effectiveOnline ? 'bg-amber-100 text-amber-700' : 'bg-[#dde1ff] text-[#00288e]'}`}>
                  {!effectiveOnline ? <WifiOff className="w-5 h-5 shrink-0" /> : <Wifi className="w-5 h-5 shrink-0" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm">
                    {!effectiveOnline ? 'Offline Mode Active' : 'Unsynced Local Drafts Available'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {!effectiveOnline 
                      ? 'You are currently disconnected. All new inspections or findings will be cached locally on your browser.'
                      : `You have ${inspections.filter(i => i.isOfflineDraft).length} locally cached report(s) ready to synchronize with the Texas State Board registry.`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5 shrink-0">
                {effectiveOnline && inspections.some(i => i.isOfflineDraft) && (
                  <button 
                    onClick={handleSyncNow}
                    disabled={isSyncing}
                    className="px-4 py-2 bg-[#00288e] text-white hover:bg-[#1e40af] disabled:bg-slate-300 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSyncing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Reconciling...</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="w-3.5 h-3.5" />
                        <span>Synchronize Now ({inspections.filter(i => i.isOfflineDraft).length})</span>
                      </>
                    )}
                  </button>
                )}
                
                {!effectiveOnline && (
                  <button 
                    onClick={() => setIsSimulatedOffline(false)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Go Online
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Reports & Compliance Tab */}
          {activeTab === 'reports' && (
            <ReportsView inspections={inspections} />
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6 animate-fade-in">
              {/* Dashboard-level search and status filtering for Activity Logs */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Dashboard Search
                  </label>
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Search activity logs by title, metadata, or status..." 
                      value={activitySearchText}
                      onChange={(e) => setActivitySearchText(e.target.value)}
                      className="bg-transparent border-none text-xs md:text-sm w-full focus:outline-none text-slate-800 placeholder-slate-400"
                    />
                    {activitySearchText && (
                      <button 
                        onClick={() => setActivitySearchText('')}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Filter by Status Badge
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'Completed', label: 'Completed' },
                      { key: 'In-Progress', label: 'In-Progress' },
                      { key: 'Flagged', label: 'Flagged' }
                    ].map((statusOpt) => (
                      <button
                        key={statusOpt.key}
                        onClick={() => setActivityStatusFilter(statusOpt.key)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          activityStatusFilter === statusOpt.key
                            ? 'bg-[#00288e] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                        }`}
                      >
                        {statusOpt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <ActivityLog 
                logs={logs}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearLogs={handleClearLogs}
                onDeleteLog={handleOnDeleteLog}
                onSimulateEvent={handleSimulateEvent}
                externalSearchQuery={activitySearchText}
                externalStatusFilter={activityStatusFilter}
              />
            </div>
          )}

          {/* Inspection Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#00288e] mb-1">Inspection Schedule</h2>
                  <p className="text-sm text-slate-500">View upcoming appointments, schedule new site audits, and track locations.</p>
                </div>
              </div>

              {/* Dynamic Schedule Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN (5 Columns): Add Inspection & Upcoming Appointments Timeline */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Inline Form: Schedule New Site Inspection */}
                  <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
                      <div className="p-2 rounded-lg bg-indigo-50 text-[#00288e]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">Schedule Site Inspection</h3>
                    </div>

                    <form onSubmit={handleAddInspection} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Property Name</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Oakwood Luxury Apartments"
                          value={newInspProperty}
                          onChange={(e) => setNewInspProperty(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff] text-slate-800 font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Site Location / Address</label>
                        <div className="relative">
                          <input 
                            type="text"
                            required
                            placeholder="e.g. 402 Oakwood Dr, Suite 100, Austin, TX"
                            value={newInspAddress}
                            onChange={(e) => setNewInspAddress(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff] text-slate-800 font-medium"
                          />
                          <MapPin className="absolute left-2.5 top-3 w-4 h-4 text-slate-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date</label>
                          <input 
                            type="date"
                            required
                            value={newInspDate}
                            onChange={(e) => setNewInspDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff] text-slate-800 font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inspection Type</label>
                          <select 
                            value={newInspType}
                            onChange={(e) => setNewInspType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff] text-slate-800 font-medium"
                          >
                            <option value="Full Structural">Full Structural</option>
                            <option value="WDI / Termite">WDI / Termite</option>
                            <option value="Lead-Based Paint">Lead-Based Paint</option>
                            <option value="Mold & Moisture">Mold & Moisture</option>
                            <option value="Electrical Safety">Electrical Safety</option>
                            <option value="HVAC Audit">HVAC Audit</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Client Name (Optional)</label>
                        <div className="relative">
                          <input 
                            type="text"
                            placeholder="e.g. John Doe (Property Owner)"
                            value={newInspClientName}
                            onChange={(e) => setNewInspClientName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff] text-slate-800 font-medium"
                          />
                          <User className="absolute left-2.5 top-3 w-4 h-4 text-slate-400" />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-[#00288e] text-white font-bold text-xs rounded-xl hover:bg-[#1e40af] transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-indigo-100 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Schedule Appointment</span>
                      </button>
                    </form>
                  </div>

                  {/* Upcoming Appointments Timeline / List */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <h3 className="font-extrabold text-slate-900 text-sm">Upcoming Appointments</h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg">
                        {inspections.filter(item => item.status !== 'COMPLETED').length} scheduled
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {inspections.filter(item => item.status !== 'COMPLETED').length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-xs text-slate-400 font-medium">No upcoming inspections scheduled.</p>
                        </div>
                      ) : (
                        inspections
                          .filter(item => item.status !== 'COMPLETED')
                          .map((item) => (
                            <div key={item.id} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all relative group">
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div>
                                  <h4 className="font-bold text-xs text-slate-950 group-hover:text-[#00288e] transition-colors">{item.propertyName}</h4>
                                  <div className="flex flex-wrap gap-1 items-center mt-0.5">
                                    <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#dde1ff] text-[#00288e] uppercase">
                                      {item.type}
                                    </span>
                                    {item.isOfflineDraft && (
                                      <span className="inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 uppercase">
                                        Offline Draft
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full ${
                                  item.status === 'IN_PROGRESS' 
                                    ? 'bg-amber-100 text-amber-800' 
                                    : 'bg-indigo-100 text-[#00288e]'
                                }`}>
                                  {item.status}
                                </span>
                              </div>

                              <div className="space-y-1.5 text-slate-500 text-[11px] font-medium">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{item.address}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{item.date}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{item.clientName}</span>
                                </div>
                              </div>

                              {/* Subtask checklist progress bar & dropdown toggle */}
                              {item.subtasks && item.subtasks.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-slate-100 space-y-2">
                                  <div 
                                    className="flex items-center justify-between text-[10px] font-bold text-slate-500 cursor-pointer hover:text-[#00288e] transition-colors"
                                    onClick={(e) => toggleChecklistExpanded(item.id, e)}
                                  >
                                    <span className="flex items-center gap-1">
                                      <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                                      <span>On-site checklist ({item.subtasks.filter(t => t.completed).length}/{item.subtasks.length})</span>
                                    </span>
                                    <span className="text-[#00288e] underline">
                                      {expandedChecklists[item.id] ? 'Hide' : 'Show Checklist'}
                                    </span>
                                  </div>
                                  
                                  {/* Small inline progress bar */}
                                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-indigo-600 h-full transition-all duration-300"
                                      style={{ width: `${(item.subtasks.filter(t => t.completed).length / item.subtasks.length) * 100}%` }}
                                    />
                                  </div>

                                  {/* Expanded checklists */}
                                  {expandedChecklists[item.id] && (
                                    <div className="space-y-1.5 pt-1 animate-fade-in max-h-40 overflow-y-auto pr-1">
                                      {item.subtasks.map(task => (
                                        <div 
                                          key={task.id} 
                                          className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                                          onClick={(e) => handleToggleSubtaskFromList(item.id, task.id, e)}
                                        >
                                          <input 
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={(e) => {}} // handled by parent div click
                                            className="w-3.5 h-3.5 text-[#00288e] focus:ring-indigo-400 border-slate-300 rounded cursor-pointer"
                                          />
                                          <span className={`text-[10px] text-slate-600 font-bold leading-normal cursor-pointer ${task.completed ? 'line-through text-slate-400 font-medium' : ''}`}>
                                            {task.title}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPropertyForDashboard(item);
                                  }}
                                  className="text-[10px] font-extrabold text-[#00288e] hover:text-[#1e40af] transition-colors flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>Start Audit</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInspections(prev => prev.filter(x => x.id !== item.id));
                                    setToastMessage(`Cancelled and deleted inspection appointment for "${item.propertyName}"`);
                                  }}
                                  className="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                                >
                                  Cancel Appointment
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (7 Columns): Full Interactive Calendar Component */}
                <div className="lg:col-span-7">
                  <InspectionCalendar 
                    inspections={inspections}
                    onAddInspectionClick={() => {
                      // Just focus the Property Name input field
                      const propInput = document.querySelector('input[placeholder="e.g. Oakwood Luxury Apartments"]');
                      if (propInput) {
                        (propInput as HTMLInputElement).focus();
                        propInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                  />
                </div>

              </div>
            </div>
          )}

          {/* Settings Tab - MATCHES SCREEN 2 SPECIFICALLY */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in">
              <header className="mb-8">
                <h2 className="text-2xl font-bold text-slate-950 mb-2">Profile &amp; Settings</h2>
                <p className="text-slate-500 text-sm md:text-base">
                  Manage your personal details, professional credentials, and application preferences.
                </p>
              </header>

              {/* Dynamic Settings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: Personal Info & Credentials Table */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Personal Info Card */}
                  <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                        <User className="w-5 h-5 text-[#00288e]" />
                        Personal Information
                      </h3>
                      {!isEditingProfile ? (
                        <button 
                          onClick={() => setIsEditingProfile(true)}
                          className="text-[#00288e] text-xs font-bold tracking-wider uppercase hover:underline"
                        >
                          Edit
                        </button>
                      ) : (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setIsEditingProfile(false)}
                            className="text-slate-400 text-xs font-bold tracking-wider uppercase hover:underline"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleSaveProfile}
                            className="text-[#00288e] text-xs font-bold tracking-wider uppercase hover:underline"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      {/* Avatar Frame */}
                      <div className="flex flex-col items-center gap-3 shrink-0 mx-auto md:mx-0">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 relative group cursor-pointer">
                          <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAbo2K_N_Ec9ACPbwE3mhSiczHJ-PbLOLj7N8ofTbVJesncyYu0cZuImuj3f1clu6Xyo-LWwUD_WOuLF1BxNvsNdPOS-4viE8LbpjT0zC3d_w_ojX1L72O7HjTS_Npz72QrlgBTdtG3Sl3XqWTdDUS2rb9B0Fbnr-oG6VMUEykZ-T0Mu1hdHr7p_7_z8Ij-pwuGDWp72kx73sELA0X8mnsSH77V8eCpFchbjNcRbtkzGjKpV-wGFTaZ2NpvBoAk8G1yYJ60CZ78No" 
                            alt="Personal Portrait" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-[#00288e]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#00288e] hover:underline cursor-pointer">Update Photo</span>
                      </div>

                      {/* Info Form */}
                      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                          {isEditingProfile ? (
                            <input 
                              type="text" 
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="font-medium text-slate-800 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff] focus:border-[#00288e]"
                            />
                          ) : (
                            <p className="font-medium text-slate-800 p-3 bg-slate-50 rounded-xl text-sm border border-transparent truncate">
                              {profile.fullName}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                          {isEditingProfile ? (
                            <input 
                              type="email" 
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="font-medium text-slate-800 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff] focus:border-[#00288e]"
                            />
                          ) : (
                            <p className="font-medium text-slate-800 p-3 bg-slate-50 rounded-xl text-sm border border-transparent truncate">
                              {profile.email}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                          {isEditingProfile ? (
                            <input 
                              type="text" 
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="font-medium text-slate-800 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff] focus:border-[#00288e]"
                            />
                          ) : (
                            <p className="font-medium text-slate-800 p-3 bg-slate-50 rounded-xl text-sm border border-transparent truncate">
                              {profile.phone}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Timezone</label>
                          {isEditingProfile ? (
                            <select 
                              value={editTimezone}
                              onChange={(e) => setEditTimezone(e.target.value)}
                              className="font-medium text-slate-800 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff] focus:border-[#00288e]"
                            >
                              <option>Central Standard Time (CST)</option>
                              <option>Eastern Standard Time (EST)</option>
                              <option>Pacific Standard Time (PST)</option>
                              <option>Mountain Standard Time (MST)</option>
                            </select>
                          ) : (
                            <p className="font-medium text-slate-800 p-3 bg-slate-50 rounded-xl text-sm border border-transparent truncate">
                              {profile.timezone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Professional Credentials Table Card */}
                  <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#00288e]" />
                        Professional Credentials
                      </h3>
                      <button 
                        onClick={() => setShowAddCredModal(true)}
                        className="bg-blue-50 text-[#00288e] border border-blue-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload New
                      </button>
                    </div>

                    <div className="overflow-x-auto scrollbar-hide">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase">
                            <th className="pb-4">Type</th>
                            <th className="pb-4 pl-4">License ID</th>
                            <th className="pb-4 pl-4">Expiry Date</th>
                            <th className="pb-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100">
                          {credentials.map((cred) => (
                            <tr key={cred.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 font-medium text-slate-900">{cred.type}</td>
                              <td className="py-4 pl-4 font-mono text-xs text-slate-600">{cred.licenseId}</td>
                              <td className="py-4 pl-4 text-slate-600">{cred.expiryDate}</td>
                              <td className="py-4 text-right">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                                  cred.status === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-700' 
                                    : cred.status === 'EXPIRING SOON' 
                                    ? 'bg-amber-100 text-amber-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {cred.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Automated Compliance & PDF dispatch scheduler widget */}
                  <ReportSchedulerWidget onTriggerToast={(msg) => setToastMessage(msg)} />
                </div>

                {/* RIGHT COLUMN: Preferences & Assistance Support */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Preferences Card */}
                  <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                    <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2 mb-2">
                      <Settings className="w-5 h-5 text-[#00288e]" />
                      App Preferences
                    </h3>

                    {/* Notification toggle */}
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="font-semibold text-slate-950 text-sm">Push Notifications</p>
                        <p className="text-xs text-slate-500">Alerts for new assignments</p>
                      </div>
                      <button 
                        onClick={() => setPushNotifications(!pushNotifications)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                          pushNotifications ? 'bg-[#00288e]' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-all absolute shadow-sm ${
                          pushNotifications ? 'left-[22px]' : 'left-0.5'
                        }`} />
                      </button>
                    </div>

                    {/* Offline mode toggle */}
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="font-semibold text-slate-950 text-sm">Offline Mode</p>
                        <p className="text-xs text-slate-500">Sync data when Wi-Fi returns</p>
                      </div>
                      <button 
                        onClick={() => setOfflineMode(!offlineMode)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                          offlineMode ? 'bg-[#00288e]' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-all absolute shadow-sm ${
                          offlineMode ? 'left-[22px]' : 'left-0.5'
                        }`} />
                      </button>
                    </div>

                    {/* Auto-Refresh Dashboard toggle */}
                    <div className="flex items-center justify-between py-1 border-t border-slate-50 pt-2 mt-2">
                      <div>
                        <p className="font-semibold text-slate-950 text-sm">Auto-Refresh Dashboard</p>
                        <p className="text-xs text-slate-500">Keep registry up-to-date automatically</p>
                      </div>
                      <button 
                        onClick={() => setIsAutoRefreshEnabled(!isAutoRefreshEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                          isAutoRefreshEnabled ? 'bg-[#00288e]' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-all absolute shadow-sm ${
                          isAutoRefreshEnabled ? 'left-[22px]' : 'left-0.5'
                        }`} />
                      </button>
                    </div>

                    {/* Auto-Refresh Interval selection */}
                    {isAutoRefreshEnabled && (
                      <div className="flex flex-col gap-1.5 py-1 animate-fade-in pl-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Refresh Interval</label>
                        <select
                          value={refreshInterval}
                          onChange={(e) => setRefreshInterval(parseInt(e.target.value, 10))}
                          className="font-semibold text-slate-800 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#dde1ff] focus:border-[#00288e] cursor-pointer"
                        >
                          <option value={30}>30 seconds</option>
                          <option value={60}>60 seconds (Default)</option>
                          <option value={120}>2 minutes</option>
                          <option value={300}>5 minutes</option>
                        </select>
                      </div>
                    )}

                    <hr className="border-slate-100" />

                    {/* Digital Signature Pad */}
                    <div className="flex flex-col gap-3">
                      <p className="font-semibold text-slate-950 text-sm flex items-center justify-between">
                        <span>Digital Signature</span>
                        {hasSignature && (
                          <button 
                            onClick={clearSignature} 
                            className="text-xs text-slate-400 hover:text-red-500 font-semibold"
                          >
                            Clear
                          </button>
                        )}
                      </p>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative group hover:border-[#00288e] transition-colors h-32 flex flex-col items-center justify-center">
                        <canvas 
                          ref={canvasRef}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                        />
                        {!hasSignature && (
                          <div className="text-center p-4 pointer-events-none select-none z-0">
                            <PenTool className="w-5 h-5 text-slate-400 mx-auto mb-2 group-hover:text-[#00288e] transition-colors" />
                            <p className="text-xs font-bold text-slate-500">Draw signature here</p>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 text-center italic">
                        Automatically applied to report finals.
                      </p>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Password & Biometrics Security Block */}
                    <div className="space-y-3">
                      <p className="font-semibold text-slate-950 text-sm">Account Security</p>
                      <button 
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full py-2.5 px-4 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                      >
                        <KeyRound className="w-4 h-4" />
                        Change Password
                      </button>
                      <button 
                        onClick={() => setBiometricsEnabled(!biometricsEnabled)}
                        className={`w-full py-2.5 px-4 border text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                          biometricsEnabled 
                            ? 'bg-blue-50 border-blue-200 text-[#00288e]' 
                            : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Fingerprint className="w-4 h-4" />
                        {biometricsEnabled ? 'Biometrics Active' : 'Enable Biometrics'}
                      </button>
                    </div>
                  </section>

                  {/* Support Card */}
                  <section className="bg-[#1e40af] text-white rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-8 h-8 text-[#a8b8ff]" />
                      <h3 className="font-semibold text-base">Need Assistance?</h3>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Our support team is available 24/7 for license verification issues or app technical support.
                    </p>
                    <button 
                      onClick={() => setShowSupportModal(true)}
                      className="w-full py-2.5 bg-white text-[#00288e] font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      Contact Support
                    </button>
                  </section>
                </div>
              </div>
            </div>
          )}

          {/* Inspections Tab View */}
          {activeTab === 'inspections' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#00288e] mb-1">Your Property Inspections</h2>
                  <p className="text-sm text-slate-500">View checklist sheets, safety scores, and generated PDF reports.</p>
                </div>
                <button 
                  onClick={() => setShowAddInspectionModal(true)}
                  className="bg-[#00288e] text-white hover:bg-[#1e40af] px-5 py-2.5 text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  New Inspection
                </button>
              </div>

              {/* High-level Summary Card Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
                {/* Pending Inspections Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-[#00288e] rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Pending Inspections
                    </span>
                    <strong className="block text-2xl font-black text-slate-900 mt-0.5">
                      {pendingInspectionsCount}
                    </strong>
                    <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">
                      Scheduled & in-progress
                    </span>
                  </div>
                </div>

                {/* Completed This Week Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Completed This Week
                    </span>
                    <strong className="block text-2xl font-black text-slate-900 mt-0.5">
                      {completedThisWeekCount}
                    </strong>
                    <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">
                      Verified safety audits
                    </span>
                  </div>
                </div>

                {/* Active Alerts Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Active Alerts
                    </span>
                    <strong className="block text-2xl font-black text-slate-900 mt-0.5">
                      {activeAlertsCount}
                    </strong>
                    <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">
                      Requires priority action
                    </span>
                  </div>
                </div>
              </div>

              {/* Property Filter Dropdown */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                      📍 Filter by Property
                    </label>
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#dde1ff] focus:border-[#00288e] transition-all cursor-pointer hover:border-slate-300"
                    >
                      <option value="All Properties">All Properties</option>
                      {getUniqueProperties().map(prop => (
                        <option key={prop} value={prop}>
                          {prop}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedProperty !== 'All Properties' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl shrink-0">
                      <span className="text-[10px] font-bold text-[#00288e] uppercase tracking-wider">
                        Viewing: {selectedProperty}
                      </span>
                      <button
                        onClick={() => setSelectedProperty('All Properties')}
                        className="text-[#00288e] hover:text-[#1e40af] font-bold text-xs ml-1 underline transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Inspection Summary Analytics Widget */}
              <InspectionSummaryWidget inspections={inspections} />

              {/* 7-Day Inspection Activity Chart Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm animate-fade-in space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#00288e] bg-[#dde1ff]/60 px-2.5 py-1 rounded-md uppercase tracking-wider animate-pulse">
                      Live Analytics
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-2 tracking-tight">Inspection Activity (Last 7 Days)</h3>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-[#00288e] rounded-xs" />
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-[#818cf8] rounded-xs" />
                      <span>Pending / Scheduled</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={last7DaysData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        fontWeight={600}
                        tickLine={false} 
                        axisLine={false}
                        dy={8}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        fontWeight={600}
                        tickLine={false} 
                        axisLine={false}
                        allowDecimals={false}
                        dx={-8}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Bar 
                        dataKey="Completed" 
                        stackId="a" 
                        fill="#00288e" 
                        radius={[0, 0, 0, 0]} 
                        maxBarSize={40}
                      />
                      <Bar 
                        dataKey="Pending" 
                        stackId="a" 
                        fill="#818cf8" 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Active Calendar Inspection Notifications & Reminders Center */}
              <InspectionNotificationCenter 
                inspections={inspections}
                onTriggerToast={(msg) => setToastMessage(msg)}
                pushNotificationsEnabled={pushNotifications}
                onTogglePushNotifications={(val) => setPushNotifications(val)}
              />

              {/* Inspector Quick Notes & Scratchpad Widget */}
              <QuickNotesWidget 
                onConvertNoteToInspection={handleConvertNoteToInspection}
                onTriggerToast={(msg) => setToastMessage(msg)}
              />


              {/* Dynamic Interactive Calendar Component */}
              <InspectionCalendar 
                inspections={inspections}
                onAddInspectionClick={() => setShowAddInspectionModal(true)}
              />

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">All Inspection Records</h3>
                    <p className="text-xs text-slate-500 font-medium">Keep track of and locate key upcoming property inspections</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                    {/* View Mode Toggle Button Group */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => setInspectionsViewMode('list')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          inspectionsViewMode === 'list'
                            ? 'bg-white text-[#00288e] shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>List</span>
                      </button>
                      <button
                        onClick={() => setInspectionsViewMode('map')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          inspectionsViewMode === 'map'
                            ? 'bg-white text-[#00288e] shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Map className="w-3.5 h-3.5" />
                        <span>Field Map</span>
                      </button>
                    </div>

                    <span className="text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                      {inspections.length} Total Logs
                    </span>
                  </div>
                </div>

                {/* Search bar */}
                <div className="space-y-2 max-w-md">
                  <div className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-2.5 shadow-xs transition-all ${
                    isListening 
                      ? 'border-red-300 ring-2 ring-rose-100 bg-rose-50/10' 
                      : 'border-slate-200 focus-within:ring-2 focus-within:ring-[#dde1ff] focus-within:border-[#00288e]/40'
                  }`}>
                    <Search className={`w-5 h-5 shrink-0 transition-colors duration-250 ${isListening ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                    <input 
                      type="text" 
                      placeholder={isListening ? "Listening... Speak now!" : "Search by site, inspector, client, or address..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none text-sm focus:outline-none text-slate-800 font-medium placeholder:transition-colors placeholder:duration-200"
                    />
                    
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold transition-colors shrink-0 mr-1"
                        title="Clear search"
                      >
                        Clear
                      </button>
                    )}

                    {/* Microphone Voice Search Button */}
                    <button
                      onClick={toggleVoiceSearch}
                      type="button"
                      className={`p-1.5 rounded-lg transition-all relative group cursor-pointer shrink-0 ${
                        isListening 
                          ? 'bg-rose-100 text-rose-600 animate-pulse scale-105' 
                          : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                      }`}
                      title={isListening ? "Listening (Click to stop)" : "Search by voice"}
                    >
                      <Mic className={`w-4 h-4 ${isListening ? 'stroke-[2.5px]' : ''}`} />
                      
                      {/* Active Recording Aura */}
                      {isListening && (
                        <span className="absolute inset-0 rounded-lg bg-rose-400/20 animate-ping" />
                      )}
                    </button>
                  </div>

                  {/* Voice Feedback Tooltips / Errors */}
                  <AnimatePresence>
                    {(isListening || speechError) && (
                      <motion.div 
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-2 px-1.5"
                      >
                        {speechError ? (
                          <span className="text-xs text-rose-600 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {speechError}
                          </span>
                        ) : (
                          <span className="text-xs text-[#00288e] font-bold flex items-center gap-1.5 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            <span>Listening... Say property name or inspector's name.</span>
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Inspections List/Grid or Empty State */}
              {inspectionsViewMode === 'map' ? (
                <InspectionFieldMap 
                  inspections={filteredInspections} 
                  onSelectInspection={setSelectedInspection} 
                />
              ) : filteredInspections.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl py-14 px-8 text-center flex flex-col items-center justify-center space-y-5 shadow-xs animate-fade-in">
                  <div className="w-16 h-16 bg-white rounded-2xl border border-slate-150 flex items-center justify-center shadow-xs text-slate-400 relative">
                    <Search className="w-7 h-7 text-slate-400" />
                    <X className="w-3.5 h-3.5 text-rose-500 absolute bottom-3.5 right-3.5 stroke-[3px]" />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h3 className="font-bold text-slate-900 text-lg">No Inspection Records Found</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      We couldn't find any listings matching <span className="font-semibold text-slate-800">"{searchQuery}"</span>. Try adjusting your site names, inspector IDs, client names, or property addresses.
                    </p>
                  </div>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-5 py-2.5 bg-[#00288e] text-white hover:bg-[#1e40af] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Clear Search Query</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredInspections.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedInspection(item)}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group relative"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
                              {item.type}
                            </span>
                            {item.isOfflineDraft && (
                              <span className="text-[10px] font-extrabold tracking-wider text-amber-700 uppercase bg-amber-100/90 px-2 py-0.5 rounded border border-amber-200/50 flex items-center gap-1 shrink-0">
                                <WifiOff className="w-3 h-3 shrink-0 text-amber-600" />
                                <span>Offline Draft</span>
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-950 mt-2 text-base leading-snug group-hover:text-[#00288e] transition-colors">{item.propertyName}</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-normal">{item.address}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {/* Client Name Badge */}
                            {item.clientName && (
                              <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                <User className="w-3 h-3 text-indigo-500 shrink-0" />
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Client: <strong className="text-slate-700 font-bold">{item.clientName}</strong>
                                </span>
                              </div>
                            )}

                            {/* Inspector Name Badge */}
                            {item.inspectorName && (
                              <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                <Award className="w-3 h-3 text-[#00288e] shrink-0" />
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Inspector: <strong className="text-slate-700 font-bold">{item.inspectorName}</strong>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shrink-0 ${
                          item.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-700' 
                            : item.status === 'IN_PROGRESS' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Subtask checklist progress bar & dropdown toggle */}
                      {item.subtasks && item.subtasks.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100 space-y-2">
                          <div 
                            className="flex items-center justify-between text-[10px] font-bold text-slate-500 cursor-pointer hover:text-[#00288e] transition-colors"
                            onClick={(e) => toggleChecklistExpanded(item.id, e)}
                          >
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                              <span>On-site checklist ({item.subtasks.filter(t => t.completed).length}/{item.subtasks.length})</span>
                            </span>
                            <span className="text-[#00288e] underline">
                              {expandedChecklists[item.id] ? 'Hide' : 'Show Checklist'}
                            </span>
                          </div>
                          
                          {/* Small inline progress bar */}
                          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-full transition-all duration-300"
                              style={{ width: `${(item.subtasks.filter(t => t.completed).length / item.subtasks.length) * 100}%` }}
                            />
                          </div>

                          {/* Expanded checklists */}
                          {expandedChecklists[item.id] && (
                            <div className="space-y-1.5 pt-1 animate-fade-in max-h-40 overflow-y-auto pr-1">
                              {item.subtasks.map(task => (
                                <div 
                                  key={task.id} 
                                  className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                                  onClick={(e) => handleToggleSubtaskFromList(item.id, task.id, e)}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={(e) => {}} // handled by parent div click
                                    className="w-3.5 h-3.5 text-[#00288e] focus:ring-indigo-400 border-slate-300 rounded cursor-pointer"
                                  />
                                  <span className={`text-[10px] text-slate-600 font-bold leading-normal cursor-pointer ${task.completed ? 'line-through text-slate-400 font-medium' : ''}`}>
                                    {task.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                        <span>Scheduled: <strong>{item.date}</strong></span>
                        <div className="flex items-center gap-2">
                          {item.score && (
                            <span className="font-bold text-green-600">Score: {item.score}/100</span>
                          )}
                          {item.voiceNotes && item.voiceNotes.length > 0 && (
                            <span className="flex items-center gap-1 bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-lg text-[9px] font-black border border-rose-100">
                              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping shrink-0" />
                              <span>{item.voiceNotes.length} Note{item.voiceNotes.length > 1 ? 's' : ''}</span>
                            </span>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInspection(item);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-[#00288e] group-hover:bg-[#00288e] group-hover:text-white transition-all rounded-lg text-[9px] font-black cursor-pointer"
                          >
                            <Mic className="w-3 h-3 shrink-0 animate-pulse" />
                            <span>Voice Audit</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Properties Tab View */}
          {activeTab === 'properties' && (() => {
            const uniqueProperties: { propertyName: string; address: string; clientName?: string; inspection: InspectionItem }[] = [];
            const propertyNamesSeen = new Set<string>();
            inspections.forEach(item => {
              if (!propertyNamesSeen.has(item.propertyName)) {
                propertyNamesSeen.add(item.propertyName);
                uniqueProperties.push({
                  propertyName: item.propertyName,
                  address: item.address,
                  clientName: item.clientName,
                  inspection: item
                });
              }
            });

            return (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950 mb-1">Managed Portfolios</h2>
                  <p className="text-sm text-slate-500">View properties currently linked to apex state board registry codes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 text-[#00288e] rounded-xl flex items-center justify-center mx-auto">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-slate-950">{uniqueProperties.length}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Total Buildings</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-3">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-[#00288e]">247</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Units Certified</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-3">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-slate-950">
                        {inspections.filter(i => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS').length}
                      </p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Pending Syncs</p>
                    </div>
                  </div>
                </div>

                {/* Properties List Block */}
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-950">Registered Property Assets</h3>
                      <p className="text-xs text-slate-500 font-medium">Click any registered asset card to inspect or compile audits.</p>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {uniqueProperties.length} Assets
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {uniqueProperties.map((prop, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedPropertyForDashboard(prop.inspection)}
                        className="bg-white border border-slate-200 hover:border-[#00288e]/30 hover:shadow-lg rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between space-y-4 group active:scale-[0.99]"
                      >
                        <div className="flex gap-4 items-start">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#00288e] flex items-center justify-center shrink-0 group-hover:bg-[#dde1ff] transition-colors">
                            <Building className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 group-hover:text-[#00288e] transition-colors text-sm sm:text-base">
                              {prop.propertyName}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                              {prop.address}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
                          <div>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase">Client Contact</span>
                            <span className="font-semibold text-slate-700">{prop.clientName || 'Private Portfolio'}</span>
                          </div>
                          <span className="text-[#00288e] font-black group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Launch Dashboard →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })()}

          {/* Knowledge Base Tab View */}
          {activeTab === 'knowledge' && (
            <div className="animate-fade-in">
              <KnowledgeBaseView />
            </div>
          )}

        </div>
      </main>

      {/* Floating Bottom Navigation Bar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-40 md:hidden flex justify-around items-center h-16 bg-white border-t border-slate-200 px-1 shadow-xl">
        <button 
          onClick={() => setActiveTab('inspections')} 
          className={`flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-semibold transition-all ${
            activeTab === 'inspections' ? 'text-[#00288e]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          Tasks
        </button>
        <button 
          onClick={() => setActiveTab('schedule')} 
          className={`flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-semibold transition-all ${
            activeTab === 'schedule' ? 'text-[#00288e]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-5 h-5" />
          Schedule
        </button>
        <button 
          onClick={() => setActiveTab('properties')} 
          className={`flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-semibold transition-all ${
            activeTab === 'properties' ? 'text-[#00288e]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Building className="w-5 h-5" />
          Home
        </button>
        <button 
          onClick={() => setActiveTab('reports')} 
          className={`flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-semibold transition-all ${
            activeTab === 'reports' ? 'text-[#00288e]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-5 h-5" />
          Reports
        </button>
        <button 
          onClick={() => setActiveTab('activity')} 
          className={`flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-semibold transition-all relative ${
            activeTab === 'activity' ? 'text-[#00288e]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Bell className="w-5 h-5" />
          {logs.filter(l => !l.isRead).length > 0 && (
            <span className="absolute top-1 right-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white" />
          )}
          Activity
        </button>
        <button 
          onClick={() => setActiveTab('knowledge')} 
          className={`flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-semibold transition-all ${
            activeTab === 'knowledge' ? 'text-[#00288e]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          RAG KB
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-semibold transition-all ${
            activeTab === 'settings' ? 'text-[#00288e]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </nav>

      {/* MODAL 1: Upload New Credentials */}
      {showAddCredModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowAddCredModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <form onSubmit={handleAddCredential} className="space-y-5">
              <h3 className="text-lg font-bold text-slate-950">Add Certification Registry</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credential Type</label>
                  <select 
                    value={newCredType}
                    onChange={(e) => setNewCredType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                  >
                    <option>TREC Property Inspector</option>
                    <option>Lead-Based Paint Certification</option>
                    <option>WDI/Termite Technician</option>
                    <option>HVAC Safety Certification</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">License ID / Cert Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. LBP-12948" 
                    value={newCredId}
                    onChange={(e) => setNewCredId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Date</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dec 15, 2027" 
                    value={newCredExpiry}
                    onChange={(e) => setNewCredExpiry(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddCredModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#00288e] text-white hover:bg-[#1e40af] rounded-xl text-sm font-semibold"
                >
                  Add Cert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create New Inspection */}
      {showAddInspectionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowAddInspectionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <form onSubmit={handleAddInspection} className="space-y-5">
              <h3 className="text-lg font-bold text-slate-950">Schedule Inspection Area</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Austin Heights Residences" 
                    value={newInspProperty}
                    onChange={(e) => setNewInspProperty(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Physical Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 104 West Loop Rd, Austin, TX" 
                    value={newInspAddress}
                    onChange={(e) => setNewInspAddress(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client Name / Association</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sarah Jenkins (Oakwood PM)" 
                    value={newInspClientName}
                    onChange={(e) => setNewInspClientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inspection Category</label>
                  <select 
                    value={newInspType}
                    onChange={(e) => setNewInspType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                  >
                    <option>Full Structural</option>
                    <option>WDI / Termite</option>
                    <option>Lead-Based Paint</option>
                    <option>Electrical Grounding</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Date</label>
                  <input 
                    type="date" 
                    value={newInspDate}
                    onChange={(e) => setNewInspDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddInspectionModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#00288e] text-white hover:bg-[#1e40af] rounded-xl text-sm font-semibold shadow-md"
                >
                  Confirm Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Reset Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#00288e]" />
                Update Security Credentials
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Old Password</label>
                  <input 
                    type="password" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Secure Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-slate-500 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert("Password successfully upgraded via 256-bit protocol.");
                    setShowPasswordModal(false);
                  }}
                  className="px-4 py-2 bg-[#00288e] text-white hover:bg-[#1e40af] text-xs font-bold uppercase tracking-wider rounded-xl"
                >
                  Verify Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT MODAL (Live Chat dialog representation) */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end md:items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl flex flex-col h-[450px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-[#1e40af] text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-[#a8b8ff]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">ProInspect Assistant</h4>
                  <p className="text-[10px] text-emerald-400">● Live Support Online</p>
                </div>
              </div>
              <button onClick={() => setShowSupportModal(false)} className="text-white hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
              {supportMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div className={`p-3 rounded-xl text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#00288e] text-white rounded-br-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 pl-1">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Inputs Footer */}
            <div className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white rounded-b-2xl">
              <input 
                type="text" 
                placeholder="Ask support anything..."
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#00288e]"
              />
              <button 
                onClick={handleSendMessage}
                className="bg-[#00288e] hover:bg-[#1e40af] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop overlay for quick action dismiss */}
      {isQuickActionOpen && (
        <div 
          onClick={() => setIsQuickActionOpen(false)} 
          className="fixed inset-0 bg-slate-900/15 backdrop-blur-[2px] z-[95]"
        />
      )}

      {/* Floating Quick Actions Speed-Dial Stack */}
      <AnimatePresence>
        {isQuickActionOpen && (
          <div className="fixed bottom-[150px] right-6 md:bottom-[96px] md:right-8 z-[100] flex flex-col items-end gap-3.5">
            {[
              {
                label: 'New Inspection',
                icon: <ClipboardList className="w-5 h-5 text-[#00288e]" />,
                bgColor: 'bg-blue-50 hover:bg-blue-100 border border-blue-200',
                action: () => {
                  setShowAddInspectionModal(true);
                  setIsQuickActionOpen(false);
                }
              },
              {
                label: 'Upload Photo',
                icon: <Upload className="w-5 h-5 text-emerald-600" />,
                bgColor: 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200',
                action: () => {
                  imageUploadInputRef.current?.click();
                  setIsQuickActionOpen(false);
                }
              },
              {
                label: 'Contact Support',
                icon: <HelpCircle className="w-5 h-5 text-indigo-600" />,
                bgColor: 'bg-indigo-50 hover:bg-indigo-100 border border-indigo-200',
                action: () => {
                  setShowSupportModal(true);
                  setIsQuickActionOpen(false);
                }
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.9 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
                className="flex items-center gap-3.5"
              >
                {/* Tooltip Label */}
                <span className="bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg border border-slate-800 tracking-wide select-none">
                  {item.label}
                </span>
                {/* Round Action Button */}
                <button
                  onClick={item.action}
                  className={`w-12 h-12 rounded-full ${item.bgColor} flex items-center justify-center shadow-lg transition-all cursor-pointer transform hover:scale-105 active:scale-95`}
                >
                  {item.icon}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Floating Main Quick Action Trigger Button */}
      <div className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-[100]">
        <button
          onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
          className={`w-14 h-14 rounded-full bg-[#00288e] text-white flex items-center justify-center shadow-xl hover:bg-[#1e40af] transition-all transform hover:scale-105 active:scale-95 z-[100] cursor-pointer ${
            isQuickActionOpen ? 'ring-4 ring-blue-100' : ''
          }`}
          title="Quick Actions"
        >
          <motion.div
            animate={{ rotate: isQuickActionOpen ? 135 : 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <Plus className="w-6 h-6" />
          </motion.div>
        </button>
      </div>

      {/* Success Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 z-[100] max-w-sm w-full"
          >
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold leading-relaxed">{toastMessage}</span>
            <button 
              onClick={() => setToastMessage(null)}
              className="ml-auto text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inspection Details & Microphone Dictation Modal */}
      <AnimatePresence>
        {selectedInspection && (
          <InspectionDetailsModal 
            inspection={selectedInspection}
            onClose={() => setSelectedInspection(null)}
            onSave={handleSaveInspectionDetails}
            onTriggerToast={(msg) => setToastMessage(msg)}
          />
        )}
      </AnimatePresence>

      {/* Hidden file input for Upload Image */}
      <input 
        type="file" 
        ref={imageUploadInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageFileChange} 
      />

    </div>
  );
}
