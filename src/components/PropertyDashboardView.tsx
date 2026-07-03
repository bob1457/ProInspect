import React, { useState, useEffect, useRef } from 'react';
import { 
  Building, Check, CheckCircle2, AlertTriangle, Clock, ArrowRight, Search, 
  Filter, Download, RefreshCw, FileText, MapPin, User, Home, Utensils, 
  Bath, Tv, Cloud, Sliders, X, ChevronRight, ChevronLeft, Sparkles, Mic, MicOff, Send, Save, ClipboardList, LogOut,
  PenTool, Trash2, Camera, Upload, Image, Eye
} from 'lucide-react';
import { InspectionItem, PersonalInfo, ActivityLogItem } from '../types';

interface PropertyDashboardViewProps {
  property: InspectionItem;
  profile: PersonalInfo;
  onBack: () => void;
  onSaveInspection: (id: string, updatedFields: Partial<InspectionItem>) => void;
  onTriggerToast: (message: string) => void;
}

// Sub-checklist templates for interactive room inspection
interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  status: 'passed' | 'failed' | 'pending';
  notes: string;
  roomName: string;
}

export default function PropertyDashboardView({
  property,
  profile,
  onBack,
  onSaveInspection,
  onTriggerToast
}: PropertyDashboardViewProps) {
  const [propertyTab, setPropertyTab] = useState<'dashboard' | 'bedroom' | 'kitchen' | 'bathroom' | 'living' | 'exterior' | 'summary'>('dashboard');
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
    return false;
  });
  
  // Dynamic room instances track per category
  const [rooms, setRooms] = useState<{ [category: string]: string[] }>({
    bedroom: ['Bedroom 1'],
    kitchen: ['Kitchen 1'],
    bathroom: ['Bathroom 1'],
    living: ['Living Room 1'],
    exterior: ['Exterior 1'],
  });

  // Current selected tab for each category
  const [activeRoomInstances, setActiveRoomInstances] = useState<{ [category: string]: string }>({
    bedroom: 'Bedroom 1',
    kitchen: 'Kitchen 1',
    bathroom: 'Bathroom 1',
    living: 'Living Room 1',
    exterior: 'Exterior 1',
  });

  // Checklist template to duplicate when adding new rooms
  const templates: { [category: string]: string[] } = {
    bedroom: [
      'Egress windows opening & locking properly',
      'GFCI outlets grounded and functional',
      'Smoke detector testing and battery verification',
      'Ceiling fan balance and speed controllers',
    ],
    kitchen: [
      'GFCI outlet within 6 feet of primary sink',
      'Sink water flow, pressure, and hot/cold line indicators',
      'Dishwasher air gap and anti-siphon loop secure',
      'Oven bake/broil elements heat validation',
    ],
    bathroom: [
      'Ventilation exhaust fan operational',
      'Toilet base sealing and mounting bolts check',
      'Shower tile backing moisture survey',
    ],
    living: [
      'Wall plaster cracks or foundation shifting clues',
      'Thermostat and central HVAC air flow register',
    ],
    exterior: [
      'Rainwater gutter clearing and downspout splash blocks',
      'Siding damage or pest invasion indicators',
      'Exterior electrical sockets weatherproof covers',
    ],
  };

  // Custom states for interactive simulation
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Room check lists
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    // Bedroom 1
    { id: 'bed-1', label: 'Egress windows opening & locking properly', category: 'bedroom', status: 'passed', notes: '', roomName: 'Bedroom 1' },
    { id: 'bed-2', label: 'GFCI outlets grounded and functional', category: 'bedroom', status: 'passed', notes: '', roomName: 'Bedroom 1' },
    { id: 'bed-3', label: 'Smoke detector testing and battery verification', category: 'bedroom', status: 'pending', notes: '', roomName: 'Bedroom 1' },
    { id: 'bed-4', label: 'Ceiling fan balance and speed controllers', category: 'bedroom', status: 'passed', notes: '', roomName: 'Bedroom 1' },
    
    // Kitchen
    { id: 'kit-1', label: 'GFCI outlet within 6 feet of primary sink', category: 'kitchen', status: 'passed', notes: '', roomName: 'Kitchen 1' },
    { id: 'kit-2', label: 'Sink water flow, pressure, and hot/cold line indicators', category: 'kitchen', status: 'failed', notes: 'Leaking under the P-trap valve.', roomName: 'Kitchen 1' },
    { id: 'kit-3', label: 'Dishwasher air gap and anti-siphon loop secure', category: 'kitchen', status: 'passed', notes: '', roomName: 'Kitchen 1' },
    { id: 'kit-4', label: 'Oven bake/broil elements heat validation', category: 'kitchen', status: 'passed', notes: '', roomName: 'Kitchen 1' },

    // Bathroom
    { id: 'bath-1', label: 'Ventilation exhaust fan operational', category: 'bathroom', status: 'passed', notes: '', roomName: 'Bathroom 1' },
    { id: 'bath-2', label: 'Toilet base sealing and mounting bolts check', category: 'bathroom', status: 'passed', notes: '', roomName: 'Bathroom 1' },
    { id: 'bath-3', label: 'Shower tile backing moisture survey', category: 'bathroom', status: 'pending', notes: '', roomName: 'Bathroom 1' },
    
    // Living Room
    { id: 'liv-1', label: 'Wall plaster cracks or foundation shifting clues', category: 'living', status: 'passed', notes: '', roomName: 'Living Room 1' },
    { id: 'liv-2', label: 'Thermostat and central HVAC air flow register', category: 'living', status: 'passed', notes: '', roomName: 'Living Room 1' },
    
    // Exterior
    { id: 'ext-1', label: 'Rainwater gutter clearing and downspout splash blocks', category: 'exterior', status: 'passed', notes: '', roomName: 'Exterior 1' },
    { id: 'ext-2', label: 'Siding damage or pest invasion indicators', category: 'exterior', status: 'failed', notes: 'Wood rot spotted on siding near north window frame.', roomName: 'Exterior 1' },
    { id: 'ext-3', label: 'Exterior electrical sockets weatherproof covers', category: 'exterior', status: 'passed', notes: '', roomName: 'Exterior 1' },
  ]);

  // States for custom in-app inline Rename and Delete
  const [editingRoomName, setEditingRoomName] = useState<string | null>(null);
  const [roomRenameValue, setRoomRenameValue] = useState<string>('');
  const [deletingRoomName, setDeletingRoomName] = useState<string | null>(null);

  const handleSaveRename = (oldName: string) => {
    const trimmed = roomRenameValue.trim();
    if (!trimmed) {
      setEditingRoomName(null);
      return;
    }
    if (trimmed === oldName) {
      setEditingRoomName(null);
      return;
    }
    if (rooms[propertyTab].includes(trimmed)) {
      onTriggerToast(`⚠️ A room with the name "${trimmed}" already exists.`);
      return;
    }
    // Update roomName for checklist items
    setChecklist(prev => prev.map(item => {
      if (item.category === propertyTab && item.roomName === oldName) {
        return { ...item, roomName: trimmed };
      }
      return item;
    }));
    // Update rooms list
    setRooms(prev => ({
      ...prev,
      [propertyTab]: prev[propertyTab].map(r => r === oldName ? trimmed : r)
    }));
    // Set active room to newName
    setActiveRoomInstances(prev => ({ ...prev, [propertyTab]: trimmed }));
    setEditingRoomName(null);
    onTriggerToast(`✏️ Renamed room to "${trimmed}"`);
  };

  const handleDeleteRoom = (roomName: string) => {
    // Delete checklist items
    setChecklist(prev => prev.filter(item => !(item.category === propertyTab && item.roomName === roomName)));
    // Update rooms list
    const remaining = rooms[propertyTab].filter(r => r !== roomName);
    setRooms(prev => ({ ...prev, [propertyTab]: remaining }));
    // Select first remaining room
    setActiveRoomInstances(prev => ({ ...prev, [propertyTab]: remaining[0] }));
    setDeletingRoomName(null);
    onTriggerToast(`🗑️ Deleted "${roomName}" successfully.`);
  };

  // General findings notes (can be updated via Voice or quick taps)
  const [findings, setFindings] = useState<string>(property.findings || '');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Signature States for the summary
  const [signatureName, setSignatureName] = useState(profile.fullName);
  const [isSigned, setIsSigned] = useState(false);

  // Photo & Camera States for active room audit
  const [photos, setPhotos] = useState<string[]>(property.photos || []);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedZoomPhoto, setSelectedZoomPhoto] = useState<string | null>(null);
  const [photoTargetItemId, setPhotoTargetItemId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async (targetItemId?: string) => {
    setPhotoTargetItemId(targetItemId || null);
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      setStream(mediaStream);
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Unable to access camera. Please check browser permissions or upload an image file.");
      onTriggerToast("⚠️ Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPhotos(prev => [...prev, dataUrl]);
          
          if (photoTargetItemId) {
            // Append a note that a photo proof was attached for this item
            setChecklist(prev => prev.map(item => {
              if (item.id === photoTargetItemId) {
                const currentNotes = item.notes ? item.notes.trim() : '';
                const proofLabel = `[📸 Defect Photo Proof Attached]`;
                const nextNotes = currentNotes.includes(proofLabel) ? currentNotes : `${currentNotes} ${proofLabel}`.trim();
                return { ...item, notes: nextNotes };
              }
              return item;
            }));
            onTriggerToast("📸 Photo captured and associated with this defect checklist item!");
          } else {
            onTriggerToast("📸 Property photo captured and attached!");
          }
          
          stopCamera();
        } catch (error) {
          console.error("Failed to capture image:", error);
          onTriggerToast("❌ Failed to capture image.");
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPhotos(prev => [...prev, reader.result as string]);
            onTriggerToast(`📎 Photo "${file.name}" attached!`);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const deletePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    onTriggerToast("🗑️ Photo removed from attachments.");
  };

  // Derive dynamic calculations
  const totalItems = checklist.length;
  const passedItems = checklist.filter(item => item.status === 'passed').length;
  const progressPercent = Math.round((passedItems / totalItems) * 100);

  const getCategoryStatusBadge = (category: string) => {
    const items = checklist.filter(item => item.category === category);
    const failed = items.filter(item => item.status === 'failed').length;
    const pending = items.filter(item => item.status === 'pending').length;
    
    if (failed > 0) {
      return (
        <span className="text-[9px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md font-extrabold shrink-0">
          Failed ({failed})
        </span>
      );
    }
    if (pending > 0) {
      return (
        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-extrabold shrink-0">
          Pending
        </span>
      );
    }
    return (
      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-extrabold shrink-0">
        Passed
      </span>
    );
  };

  const getCategoryStatusDot = (category: string) => {
    const items = checklist.filter(item => item.category === category);
    const failed = items.filter(item => item.status === 'failed').length;
    const pending = items.filter(item => item.status === 'pending').length;
    
    if (failed > 0) return 'bg-rose-500';
    if (pending > 0) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  const handleSyncData = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      onTriggerToast("🔄 Real-time data sync completed successfully! All records verified.");
    }, 1500);
  };

  const handleToggleChecklistStatus = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus: 'passed' | 'failed' | 'pending' = 
          item.status === 'pending' ? 'passed' : item.status === 'passed' ? 'failed' : 'pending';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleUpdateChecklistNotes = (id: string, notes: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, notes };
      }
      return item;
    }));
  };

  // Mock voice recognition for local testing
  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      if (transcript) {
        setFindings(prev => prev ? `${prev} ${transcript}` : transcript);
        setTranscript('');
      }
    } else {
      setIsListening(true);
      setTranscript('Listening for observations...');
      
      const phrases = [
        "Tested electrical panel, main breaker is fully certified at 200 Amps with no double taps.",
        "Detected no elevated ambient moisture levels near main plumbing stack.",
        "Confirmed fire-rated entry door between garage and residence operates and self-closes correctly."
      ];
      
      setTimeout(() => {
        setTranscript(phrases[Math.floor(Math.random() * phrases.length)]);
      }, 1800);
    }
  };

  const handleExitAudit = () => {
    onSaveInspection(property.id, {
      photos: photos,
      findings: findings
    });
    onBack();
  };

  const handleSubmitFinalReport = () => {
    onSaveInspection(property.id, {
      status: 'COMPLETED',
      score: Math.max(70, Math.round(100 - (checklist.filter(i => i.status === 'failed').length * 8))),
      findings: findings,
      photos: photos
    });
    onTriggerToast(`🎉 Inspection Report for "${property.propertyName}" has been finalized and submitted to State Records.`);
    setPropertyTab('dashboard');
  };

  // Static reports list under the selected property context
  const subReports = [
    { unit: "Unit 4A - Residence", date: "Oct 24, 2023", inspector: "S. Mitchell", status: "Sent", score: 98 },
    { unit: "Unit 4B - Active Portfolio", date: property.date, inspector: profile.fullName, status: property.status === 'COMPLETED' ? "Sent" : "Draft", score: property.score || 85 },
    { unit: "Commercial Suite 12", date: "Oct 22, 2023", inspector: "L. Chen", status: "Action Required", score: 62 },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      
      {/* Property-Scoped Sidebar Navigation */}
      <aside className={`w-full md:flex flex-col shrink-0 border-r border-indigo-950 shadow-2xl relative transition-all duration-300 ease-in-out bg-[#001c66] text-slate-100 ${isSidebarCollapsed ? 'md:w-[76px]' : 'md:w-[280px]'}`}>
        
        {/* Sidebar Header */}
        {isSidebarCollapsed ? (
          <div className="p-4 border-b border-indigo-900 flex flex-col items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-950 transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <Building className="w-6 h-6 text-indigo-300" title="Rental Inspect Pro" />
          </div>
        ) : (
          <div className="p-6 border-b border-indigo-900">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handleExitAudit}
                className="flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white font-bold tracking-wide uppercase transition-colors"
              >
                <span>← Back to Portfolio</span>
              </button>
              <button 
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-950 transition-colors hidden md:block"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-300" />
              Rental Inspect Pro
            </h2>
            <p className="text-[10px] font-extrabold text-indigo-300 tracking-wider uppercase mt-1">
              Active Inspection Area
            </p>
          </div>
        )}

        {/* Sidebar Navigation items */}
        <nav className={`flex-1 p-4 ${isSidebarCollapsed ? 'space-y-4 px-2' : 'space-y-1.5'}`}>
          {isSidebarCollapsed ? (
            <>
              <button
                onClick={() => setPropertyTab('dashboard')}
                title="Dashboard"
                className={`w-full text-center py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${
                  propertyTab === 'dashboard' 
                    ? 'bg-indigo-600/50 text-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-950 hover:text-white'
                }`}
              >
                <Sliders className="w-5 h-5 shrink-0" />
              </button>

              <button
                onClick={() => setPropertyTab('bedroom')}
                title={`Bedrooms (${rooms.bedroom.length})`}
                className={`w-full text-center py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${
                  propertyTab === 'bedroom' 
                    ? 'bg-indigo-600/50 text-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-950 hover:text-white'
                }`}
              >
                <div className="relative">
                  <Home className="w-5 h-5 text-indigo-300" />
                  <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#001c66] ${getCategoryStatusDot('bedroom')}`} />
                </div>
              </button>

              <button
                onClick={() => setPropertyTab('kitchen')}
                title={`Kitchens (${rooms.kitchen.length})`}
                className={`w-full text-center py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${
                  propertyTab === 'kitchen' 
                    ? 'bg-indigo-600/50 text-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-950 hover:text-white'
                }`}
              >
                <div className="relative">
                  <Utensils className="w-5 h-5 text-indigo-300" />
                  <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#001c66] ${getCategoryStatusDot('kitchen')}`} />
                </div>
              </button>

              <button
                onClick={() => setPropertyTab('bathroom')}
                title={`Bathrooms (${rooms.bathroom.length})`}
                className={`w-full text-center py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${
                  propertyTab === 'bathroom' 
                    ? 'bg-indigo-600/50 text-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-950 hover:text-white'
                }`}
              >
                <div className="relative">
                  <Bath className="w-5 h-5 text-indigo-300" />
                  <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#001c66] ${getCategoryStatusDot('bathroom')}`} />
                </div>
              </button>

              <button
                onClick={() => setPropertyTab('living')}
                title={`Living Rooms (${rooms.living.length})`}
                className={`w-full text-center py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${
                  propertyTab === 'living' 
                    ? 'bg-indigo-600/50 text-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-950 hover:text-white'
                }`}
              >
                <div className="relative">
                  <Tv className="w-5 h-5 text-indigo-300" />
                  <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#001c66] ${getCategoryStatusDot('living')}`} />
                </div>
              </button>

              <button
                onClick={() => setPropertyTab('exterior')}
                title={`Exteriors (${rooms.exterior.length})`}
                className={`w-full text-center py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${
                  propertyTab === 'exterior' 
                    ? 'bg-indigo-600/50 text-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-950 hover:text-white'
                }`}
              >
                <div className="relative">
                  <Cloud className="w-5 h-5 text-indigo-300" />
                  <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#001c66] ${getCategoryStatusDot('exterior')}`} />
                </div>
              </button>

              <button
                onClick={() => setPropertyTab('summary')}
                title="Report Summary"
                className={`w-full text-center py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${
                  propertyTab === 'summary' 
                    ? 'bg-indigo-600/50 text-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-950 hover:text-white'
                }`}
              >
                <FileText className="w-5 h-5 text-indigo-300" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setPropertyTab('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
                  propertyTab === 'dashboard' 
                    ? 'bg-indigo-600/50 text-white border-l-4 border-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-950 hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <div className="pt-3 pb-1.5 px-4">
                <span className="text-[9px] font-extrabold tracking-widest text-indigo-400 uppercase">Room-By-Room Audits</span>
              </div>

              <button
                onClick={() => setPropertyTab('bedroom')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  propertyTab === 'bedroom' 
                    ? 'bg-indigo-600/50 text-white border-l-4 border-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-950 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-indigo-300" />
                  <span>Bedrooms ({rooms.bedroom.length})</span>
                </div>
                {getCategoryStatusBadge('bedroom')}
              </button>

              <button
                onClick={() => setPropertyTab('kitchen')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  propertyTab === 'kitchen' 
                    ? 'bg-indigo-600/50 text-white border-l-4 border-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-950 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Utensils className="w-4 h-4 text-indigo-300" />
                  <span>Kitchens ({rooms.kitchen.length})</span>
                </div>
                {getCategoryStatusBadge('kitchen')}
              </button>

              <button
                onClick={() => setPropertyTab('bathroom')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  propertyTab === 'bathroom' 
                    ? 'bg-indigo-600/50 text-white border-l-4 border-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-950 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bath className="w-4 h-4 text-indigo-300" />
                  <span>Bathrooms ({rooms.bathroom.length})</span>
                </div>
                {getCategoryStatusBadge('bathroom')}
              </button>

              <button
                onClick={() => setPropertyTab('living')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  propertyTab === 'living' 
                    ? 'bg-indigo-600/50 text-white border-l-4 border-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-950 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Tv className="w-4 h-4 text-indigo-300" />
                  <span>Living Rooms ({rooms.living.length})</span>
                </div>
                {getCategoryStatusBadge('living')}
              </button>

              <button
                onClick={() => setPropertyTab('exterior')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  propertyTab === 'exterior' 
                    ? 'bg-indigo-600/50 text-white border-l-4 border-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-950 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Cloud className="w-4 h-4 text-indigo-300" />
                  <span>Exteriors ({rooms.exterior.length})</span>
                </div>
                {getCategoryStatusBadge('exterior')}
              </button>

              <div className="pt-3 pb-1.5 px-4">
                <span className="text-[9px] font-extrabold tracking-widest text-indigo-400 uppercase">Final Certification</span>
              </div>

              <button
                onClick={() => setPropertyTab('summary')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
                  propertyTab === 'summary' 
                    ? 'bg-indigo-600/50 text-white border-l-4 border-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-950 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-300" />
                <span>Report Summary</span>
              </button>
            </>
          )}
        </nav>

        {/* Sidebar Footer Action */}
        <div className="p-4 border-t border-indigo-900 bg-[#001347]">
          {isSidebarCollapsed ? (
            <button
              onClick={() => setPropertyTab('summary')}
              title="Submit Report"
              className="w-11 h-11 bg-white hover:bg-indigo-50 text-[#00288e] rounded-xl transition-all shadow-lg hover:shadow-white/10 active:scale-[0.98] cursor-pointer flex items-center justify-center mx-auto"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            </button>
          ) : (
            <button
              onClick={() => setPropertyTab('summary')}
              className="w-full h-11 bg-white hover:bg-indigo-50 text-[#00288e] text-xs font-extrabold rounded-xl transition-all shadow-lg hover:shadow-white/10 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Submit Report</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 sm:p-8 md:p-10 max-h-screen overflow-y-auto">
        
        {/* TOP PROPERTY ROW HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-2">
              Property Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Welcome back, Inspector {profile.fullName}
            </p>
          </div>

          {/* Sync & Avatar Controls */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button 
              onClick={handleSyncData}
              disabled={syncing}
              className="px-4 h-11 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#00288e] ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Data'}</span>
            </button>
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-200 ring-2 ring-indigo-100 flex-shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7Xp4VxLGrte8hgcQHWNF75dZHLet1-pAjY8Uk6GMrNj7O9kfh6-l34bIcHkKbLTINyYWrEpL3B7YTMKRZ6sdkDW8gIayCcAiNf-jTXzf1qoX2pWeyXoQeBK7LtGbPERNgsmk70Ha5kSivRDvLQocjt7m-7OTHvCuqVdoUoPh2JPhkqoMIvPaP4H0l6jiL9k4Tp2wI-1OMJktHCtk-fleHKUPKxJGX9eiU1CnocIYK6H3uWnz45ccw_hDjel2nx-a47dNPqN6LA_E" 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* CONDITION-BASED SUB-VIEWS */}
        {propertyTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* ROW 1: Active Inspection Info & Quick Actions Column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Active Inspection Primary Card */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col sm:flex-row">
                {/* Photo block */}
                <div className="w-full sm:w-[45%] relative min-h-[220px] bg-slate-100 shrink-0">
                  <img 
                    src={photos && photos.length > 0 ? photos[0] : "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80"} 
                    alt="Active Property" 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 left-4 text-[10px] font-black tracking-wider text-white bg-blue-600 px-3 py-1.5 rounded-lg uppercase shadow-md">
                    {property.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                {/* Info Block */}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-1">
                      {property.propertyName}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold tracking-wide flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {property.address}
                    </p>

                    {/* Evidence Photos strip */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">
                          Evidence Attachments ({photos.length})
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => startCamera()}
                            className="p-1 bg-indigo-50 hover:bg-indigo-100 text-[#00288e] rounded-md transition-colors cursor-pointer flex items-center gap-0.5"
                            title="Take Property Photo"
                          >
                            <Camera className="w-2.5 h-2.5" />
                            <span className="text-[8px] font-black uppercase">Snap</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer flex items-center gap-0.5"
                            title="Upload Property Photo"
                          >
                            <Upload className="w-2.5 h-2.5" />
                            <span className="text-[8px] font-black uppercase">Upload</span>
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            accept="image/*" 
                            multiple 
                            onChange={handleFileUpload} 
                            className="hidden" 
                          />
                        </div>
                      </div>

                      {photos.length > 0 ? (
                        <div className="flex gap-1.5 overflow-x-auto py-1 max-w-[320px]">
                          {photos.map((photo, index) => (
                            <div 
                              key={index} 
                              onClick={() => setSelectedZoomPhoto(photo)}
                              className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50 group cursor-pointer"
                            >
                              <img src={photo} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye className="w-2.5 h-2.5 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[9px] font-bold text-slate-400 italic">No evidence photos attached yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-extrabold">
                      <span className="text-indigo-900">Inspection Progress</span>
                      <span className="text-indigo-900 text-base">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div 
                        className="h-full bg-indigo-600 transition-all duration-500 rounded-full" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-3 pt-2">
                    <button 
                      onClick={() => setPropertyTab('bedroom')}
                      className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-6 rounded-xl shadow-lg shadow-indigo-900/10 flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => onTriggerToast("📍 Pinning property to regional safety sector map...")}
                      className="w-11 h-11 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                      title="View Regional Location Code"
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions Column */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                  Quick Actions
                </span>

                <button
                  onClick={() => {
                    setPropertyTab('bedroom');
                    onTriggerToast("🚀 Switched focus to room audit checklists!");
                  }}
                  className="w-full p-4 bg-[#1e3a8a] hover:bg-indigo-950 text-white text-left rounded-2xl border border-indigo-900/50 flex items-center gap-4 transition-all hover:translate-x-1 cursor-pointer"
                >
                  <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-indigo-200" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-wide uppercase">Start New Inspection</h4>
                    <p className="text-[10px] text-indigo-200/90 font-semibold mt-0.5">Select room and checklist type</p>
                  </div>
                </button>

                <button
                  onClick={handleExitAudit}
                  className="w-full p-4 bg-white hover:bg-slate-50 text-slate-800 text-left rounded-2xl border border-slate-200 flex items-center gap-4 transition-all hover:translate-x-1 cursor-pointer"
                >
                  <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <Building className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-wide uppercase text-slate-900">Manage Properties</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5 font-medium">Database, history, and records</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onTriggerToast("📂 Opening master safety board reports database...");
                  }}
                  className="w-full p-4 bg-white hover:bg-slate-50 text-slate-800 text-left rounded-2xl border border-slate-200 flex items-center gap-4 transition-all hover:translate-x-1 cursor-pointer"
                >
                  <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-wide uppercase text-slate-900">View All Reports</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5 font-medium">Archived, verified & signed PDFs</p>
                  </div>
                </button>

              </div>
            </div>

            {/* ROW 2: Statistics & Mock Location Map */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Stats Cards grid */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-5">
                
                {/* Stat 1 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Total Inspections
                  </span>
                  <div className="flex items-baseline gap-2 mt-4">
                    <strong className="text-3xl font-black text-slate-900">24</strong>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black">
                      +4 this week
                    </span>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Pending
                  </span>
                  <div className="flex items-baseline gap-2 mt-4">
                    <strong className="text-3xl font-black text-slate-900">3</strong>
                    <Clock className="w-4 h-4 text-[#00288e]" />
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Completed Month
                  </span>
                  <div className="flex items-baseline gap-2 mt-4">
                    <strong className="text-3xl font-black text-slate-900">12</strong>
                    <span className="text-xs text-slate-400 font-bold">/ 15 Goal</span>
                  </div>
                </div>

              </div>

              {/* Map Location Placeholder Card */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
                <div className="h-32 bg-slate-100 relative shrink-0">
                  {/* Grid layout mockup with SVGs to simulate Map */}
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:12px_12px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" />
                  
                  {/* Streets */}
                  <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-300 transform -translate-y-1/2" />
                  <div className="absolute top-0 left-1/3 w-1.5 h-full bg-slate-300" />
                  <div className="absolute top-0 left-2/3 w-1.5 h-full bg-slate-300" />
                  
                  {/* Pins */}
                  <div className="absolute top-8 left-1/4 w-3 h-3 bg-indigo-600 rounded-full animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-800 rounded-full flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  <div className="absolute bottom-6 right-1/4 w-3.5 h-3.5 bg-emerald-500 rounded-full" />
                </div>
                <div className="p-4 bg-white flex-1 flex flex-col justify-center">
                  <h4 className="text-xs font-extrabold text-slate-900">Properties Nearby</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">4 items require attention in your area</p>
                </div>
              </div>

            </div>

            {/* ROW 3: Recent Reports Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <h4 className="font-extrabold text-slate-950 text-base">Recent Reports</h4>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onTriggerToast("📂 Filtering report entries...")}
                    className="h-9 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter</span>
                  </button>
                  <button 
                    onClick={() => onTriggerToast("📥 Compiling master Excel export of logs...")}
                    className="h-9 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black tracking-widest text-slate-400 uppercase border-b border-slate-100">
                      <th className="p-4 pl-6">Property Address</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Inspector</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {subReports.map((rep, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          <div>
                            <p className="font-bold text-slate-900">{rep.unit}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{property.address}</p>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 font-medium">{rep.date}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-indigo-900 shrink-0">
                              {rep.inspector.charAt(0)}
                            </div>
                            <span className="text-slate-700 font-semibold">{rep.inspector}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                            rep.status === 'Sent' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : rep.status === 'Draft' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {rep.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button 
                            onClick={() => onTriggerToast(`📂 Loaded details for "${rep.unit}"`)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ROOM CHECKLIST AUDIT PAGES */}
        {(propertyTab === 'bedroom' || propertyTab === 'kitchen' || propertyTab === 'bathroom' || propertyTab === 'living' || propertyTab === 'exterior') && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Active Audit Area
                </span>
                <h2 className="text-2xl font-black text-slate-950 mt-2 uppercase tracking-tight">
                  {propertyTab === 'bedroom' ? 'Bedroom' : propertyTab === 'kitchen' ? 'Kitchen' : propertyTab === 'bathroom' ? 'Bathroom' : propertyTab === 'living' ? 'Living Room' : 'Exterior'} Audits
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Tap any task below to toggle certification status. Add notes directly. Use tabs below to manage dynamic rooms.
                </p>
              </div>

              {/* Progress Summary Widget */}
              <div className="flex gap-4">
                <div className="text-right bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-600 block uppercase">Selected Room</span>
                  <strong className="text-sm font-black text-[#00288e] block">
                    {activeRoomInstances[propertyTab]}: {checklist.filter(i => i.category === propertyTab && i.roomName === activeRoomInstances[propertyTab] && i.status === 'passed').length} / {checklist.filter(i => i.category === propertyTab && i.roomName === activeRoomInstances[propertyTab]).length}
                  </strong>
                </div>
                <div className="text-right bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Category Scope</span>
                  <strong className="text-sm font-black text-slate-700 block">
                    {checklist.filter(i => i.category === propertyTab && i.status === 'passed').length} / {checklist.filter(i => i.category === propertyTab).length} Certified
                  </strong>
                </div>
              </div>
            </div>

            {/* Dynamic Room Tabs Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                {rooms[propertyTab].map((roomName) => {
                  const isActive = activeRoomInstances[propertyTab] === roomName;
                  const roomItems = checklist.filter(i => i.category === propertyTab && i.roomName === roomName);
                  const roomPassed = roomItems.filter(i => i.status === 'passed').length;
                  const roomFailed = roomItems.filter(i => i.status === 'failed').length;
                  const roomPending = roomItems.filter(i => i.status === 'pending').length;

                  const isEditing = editingRoomName === roomName;
                  const isDeleting = deletingRoomName === roomName;

                  return (
                    <div 
                      key={roomName}
                      onClick={() => {
                        if (!isEditing && !isDeleting) {
                          setActiveRoomInstances(prev => ({ ...prev, [propertyTab]: roomName }));
                        }
                      }}
                      className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={roomRenameValue}
                            onChange={(e) => setRoomRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(roomName);
                              if (e.key === 'Escape') setEditingRoomName(null);
                            }}
                            className="bg-white text-slate-800 px-2 py-1 rounded-lg text-xs font-bold w-28 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-300"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(roomName)}
                            className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRoomName(null)}
                            className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : isDeleting ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <span className={isActive ? 'text-indigo-100' : 'text-slate-500'}>Delete?</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteRoom(roomName)}
                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-black text-[10px] transition-colors cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingRoomName(null)}
                            className={`px-2 py-0.5 rounded font-black text-[10px] transition-colors cursor-pointer ${
                              isActive ? 'bg-indigo-700 text-white hover:bg-indigo-800' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <span>{roomName}</span>

                          {/* Micro inline dot indicator */}
                          <span className={`w-2 h-2 rounded-full ${
                            roomFailed > 0 
                              ? 'bg-rose-500' 
                              : roomPending > 0 
                              ? 'bg-amber-400' 
                              : 'bg-emerald-500'
                          }`} />

                          {/* Tool Actions inside the tab */}
                          <div className="flex items-center gap-1.5 ml-1.5 pl-1.5 border-l border-slate-200/30">
                            <button
                              type="button"
                              title="Rename Room"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRoomRenameValue(roomName);
                                setEditingRoomName(roomName);
                                setDeletingRoomName(null);
                              }}
                              className={`p-1 rounded-md transition-all text-xs flex items-center justify-center border ${
                                isActive 
                                  ? 'bg-indigo-700 hover:bg-indigo-800 border-indigo-500 text-indigo-100 hover:text-white' 
                                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              <PenTool className="w-3 h-3" />
                            </button>

                            {rooms[propertyTab].length > 1 && (
                              <button
                                type="button"
                                title="Delete Room"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingRoomName(roomName);
                                  setEditingRoomName(null);
                                }}
                                className={`p-1 rounded-md transition-all text-xs flex items-center justify-center border ${
                                  isActive 
                                    ? 'bg-rose-700 hover:bg-rose-800 border-rose-500 text-rose-100 hover:text-white' 
                                    : 'bg-rose-50 hover:bg-rose-100 border-rose-100 text-rose-500 hover:text-rose-700'
                                }`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Room Button */}
              <button
                type="button"
                onClick={() => {
                  const labelMap: { [key: string]: string } = {
                    bedroom: 'Bedroom',
                    kitchen: 'Kitchen',
                    bathroom: 'Bathroom',
                    living: 'Living Room',
                    exterior: 'Exterior'
                  };
                  const baseLabel = labelMap[propertyTab] || 'Room';
                  // Calculate next suffix number
                  let nextNum = 1;
                  while (rooms[propertyTab].includes(`${baseLabel} ${nextNum}`)) {
                    nextNum++;
                  }
                  const newName = `${baseLabel} ${nextNum}`;

                  // Duplicate checklist items from templates
                  const newItems = templates[propertyTab].map((label, index) => ({
                    id: `${propertyTab}-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
                    label,
                    category: propertyTab,
                    status: 'pending' as const,
                    notes: '',
                    roomName: newName
                  }));

                  setChecklist(prev => [...prev, ...newItems]);
                  setRooms(prev => ({
                    ...prev,
                    [propertyTab]: [...prev[propertyTab], newName]
                  }));
                  setActiveRoomInstances(prev => ({
                    ...prev,
                    [propertyTab]: newName
                  }));
                  onTriggerToast(`➕ Added and opened "${newName}"!`);
                }}
                className="h-9 px-4 bg-indigo-50 hover:bg-indigo-100 text-[#00288e] text-xs font-black rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-100 shrink-0"
              >
                <span>+ Add {propertyTab === 'bedroom' ? 'Bedroom' : propertyTab === 'kitchen' ? 'Kitchen' : propertyTab === 'bathroom' ? 'Bathroom' : propertyTab === 'living' ? 'Living Room' : 'Exterior'}</span>
              </button>
            </div>

            {/* Checklist Loop */}
            <div className="space-y-4">
              {checklist
                .filter(item => item.category === propertyTab && item.roomName === activeRoomInstances[propertyTab])
                .map(item => (
                  <div 
                    key={item.id}
                    className="bg-white border border-slate-200 hover:border-indigo-100 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Check box indicator */}
                      <button
                        onClick={() => handleToggleChecklistStatus(item.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                          item.status === 'passed'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : item.status === 'failed'
                            ? 'bg-rose-500 border-rose-500 text-white'
                            : 'bg-white border-slate-300 text-slate-300'
                        }`}
                      >
                        {item.status === 'passed' && <Check className="w-4 h-4" />}
                        {item.status === 'failed' && <X className="w-4 h-4" />}
                        {item.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <p className="font-bold text-slate-900 text-sm sm:text-base">{item.label}</p>
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider mt-1.5 px-2 py-0.5 rounded ${
                          item.status === 'passed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'failed'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Quick input notes & defect photo attachment */}
                    <div className="w-full md:w-96 shrink-0 flex items-center gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleUpdateChecklistNotes(item.id, e.target.value)}
                          placeholder="Add inspection notes / findings..."
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
                        />
                        {item.notes && item.notes.includes("📸") && (
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500 text-xs" title="Photo Attached">
                            📸
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => startCamera(item.id)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                          item.status === 'failed'
                            ? 'bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-600'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500'
                        }`}
                        title="Snap photo proof of defect"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">Snap</span>
                      </button>
                    </div>
                  </div>
                ))}

              {checklist.filter(item => item.category === propertyTab && item.roomName === activeRoomInstances[propertyTab]).length === 0 && (
                <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl">
                  <p className="text-sm font-bold text-slate-400">No checklist items defined for this tab.</p>
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-200">
              <button
                onClick={() => setPropertyTab('dashboard')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                ← Back to Dashboard
              </button>

              <button
                onClick={() => {
                  const tabs: ('bedroom' | 'kitchen' | 'bathroom' | 'living' | 'exterior' | 'summary')[] = 
                    ['bedroom', 'kitchen', 'bathroom', 'living', 'exterior', 'summary'];
                  const currentIndex = tabs.indexOf(propertyTab);
                  const nextTab = tabs[currentIndex + 1] || 'summary';
                  setPropertyTab(nextTab);
                  onTriggerToast("💾 Progress saved. Advancing checklist...");
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Save & Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* MASTER REPORT SUMMARY & VOICE ENGINE DICTATION */}
        {propertyTab === 'summary' && (
          <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
            
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 pb-5">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-widest">
                  Compilation & Verification
                </span>
                <h2 className="text-2xl font-black text-slate-950 mt-3 leading-none tracking-tight">
                  Master Inspection Report
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-2">
                  Review calculated audit results and finalize findings to submit official records to the State Board.
                </p>
              </div>

              {/* Grid of issues */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Total Checks */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-indigo-100 text-[#00288e] rounded-xl flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Audit Scope Size</span>
                    <strong className="block text-lg font-black text-slate-900 mt-0.5">{totalItems} Total Areas Checked</strong>
                  </div>
                </div>

                {/* Failed Areas */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Compliance Flags</span>
                    <strong className="block text-lg font-black text-rose-600 mt-0.5">
                      {checklist.filter(i => i.status === 'failed').length} Demerits Spotted
                    </strong>
                  </div>
                </div>

              </div>

              {/* LIST OF DEMERITS */}
              {checklist.filter(i => i.status === 'failed').length > 0 && (
                <div className="border border-rose-100 bg-rose-50/30 rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-black text-rose-600 uppercase tracking-widest block">
                    Failed Compliance Flag Details
                  </span>
                  <div className="space-y-2">
                    {checklist.filter(i => i.status === 'failed').map(item => (
                      <div key={item.id} className="text-xs text-slate-700 font-semibold flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-slate-900">{item.label} ({item.roomName})</p>
                          <p className="text-slate-500 font-medium italic mt-0.5">Notes: "{item.notes || 'No description provided'}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MICROPHONE VOICE-TO-TEXT WRITER */}
              <div className="space-y-3 bg-[#f8f9ff] border border-indigo-50 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5" />
                    Hands-Free Master Dictation
                  </span>
                  
                  <button 
                    type="button"
                    onClick={handleToggleVoice}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-black tracking-wide uppercase cursor-pointer flex items-center gap-1 transition-all ${
                      isListening 
                        ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isListening ? 'Stop Mic' : 'Start Mic'}
                  </button>
                </div>

                <textarea
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="Review dictated text here. You can edit, delete, or append typed notes as required..."
                  className="w-full h-32 bg-white border border-slate-200 rounded-xl p-4 text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />

                {transcript && (
                  <div className="p-3 bg-blue-50 text-[#00288e] rounded-lg text-xs italic font-semibold border border-blue-100 animate-pulse">
                    🎙️ "... {transcript}"
                  </div>
                )}
                
                <p className="text-[10px] text-slate-400 font-semibold">
                  All dictate transcripts are parsed through natural language algorithms and compiled securely into the final legal PDF certificate.
                </p>
              </div>

              {/* Legal Inspector Signature */}
              <div className="p-5 border border-slate-200 rounded-2xl space-y-4 bg-slate-50/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Legal Sign-off & Verification
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">Inspector Legal Name</label>
                    <input 
                      type="text" 
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">Legal Agreement Sign-off</label>
                    <button
                      onClick={() => setIsSigned(!isSigned)}
                      className={`w-full h-11 border rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer ${
                        isSigned
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isSigned ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Officially Signed Off</span>
                        </>
                      ) : (
                        <span>Sign & Attest Accuracy</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Sticky Actions Row */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setPropertyTab('dashboard')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                ← Back to Dashboard
              </button>

              <button
                onClick={handleSubmitFinalReport}
                className="px-7 py-3 bg-[#00288e] hover:bg-blue-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg hover:shadow-indigo-900/10 hover:translate-y-[-1px] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit & Publish Final PDF Report</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Live Camera Viewfinder Modal/Overlay */}
      {cameraActive && (
        <div className="fixed inset-0 bg-slate-950 z-[200] flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              Live Inspection Camera
            </span>
            <button
              type="button"
              onClick={stopCamera}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Viewfinder Area */}
          <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            
            {/* Guides / Crosshairs */}
            <div className="absolute inset-6 border border-white/20 pointer-events-none rounded-xl">
              <div className="absolute top-1/2 left-0 w-full h-px bg-white/10" />
              <div className="absolute top-0 left-1/2 w-px h-full bg-white/10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-indigo-400/40 rounded-full" />
            </div>

            {cameraError && (
              <div className="absolute inset-x-6 bottom-6 p-4 bg-rose-950/90 border border-rose-800/50 text-rose-200 rounded-xl text-xs font-semibold backdrop-blur-md text-center">
                {cameraError}
              </div>
            )}
          </div>

          {/* Controls Footer */}
          <div className="p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>

            {/* Shutter Button */}
            <button
              type="button"
              onClick={capturePhoto}
              disabled={!!cameraError}
              className="w-16 h-16 bg-white active:scale-95 border-4 border-slate-300 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-white rounded-full border border-slate-950/10 hover:bg-slate-50 transition-colors" />
            </button>

            <div className="w-12" /> {/* Spacer */}
          </div>
        </div>
      )}

      {/* Zoom Photo Overlay */}
      {selectedZoomPhoto && (
        <div className="fixed inset-0 bg-slate-950/95 z-[210] flex flex-col overflow-hidden animate-fade-in p-4 justify-center items-center">
          <div className="absolute top-4 right-4 shrink-0 z-10">
            <button
              type="button"
              onClick={() => setSelectedZoomPhoto(null)}
              className="p-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 min-h-0">
            <img 
              src={selectedZoomPhoto} 
              alt="Zoomed Evidence" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
          <div className="text-center pb-4 text-xs text-slate-400 font-bold shrink-0 uppercase tracking-widest">
            Evidence Photo Preview
          </div>
        </div>
      )}
    </div>
  );
}
