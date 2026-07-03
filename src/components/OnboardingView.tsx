import React, { useState } from 'react';
import { 
  User, Palette, Building, Smartphone, HelpCircle, BookOpen, 
  PlayCircle, ArrowRight, CheckCircle2, MessageSquare, Sparkles, Upload, FileText, Check, AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { OnboardingState, PersonalInfo } from '../types';

interface OnboardingViewProps {
  profile: PersonalInfo;
  onNavigateToSettings: () => void;
  onNavigateToPricing: () => void;
}

export default function OnboardingView({ profile, onNavigateToSettings, onNavigateToPricing }: OnboardingViewProps) {
  // Global onboarding checklist state
  const [onboarding, setOnboarding] = useState<OnboardingState>({
    profileCompleted: true, // Step 1 starts Done to match Screen 3 25% spec!
    brandingConfigured: false, // Step 2 is in progress
    propertyImported: false,
    testInspectionPerformed: false,
    brandColor: '#00288e',
    brandLogo: null,
  });

  // Calculate Progress percentage based on completed steps
  const getProgressPercent = () => {
    let count = 0;
    if (onboarding.profileCompleted) count += 25;
    if (onboarding.brandingConfigured) count += 25;
    if (onboarding.propertyImported) count += 25;
    if (onboarding.testInspectionPerformed) count += 25;
    return count;
  };

  // Active sub-workflows
  const [activeWorkflow, setActiveWorkflow] = useState<'none' | 'branding' | 'import' | 'test'>('none');
  const [showDocModal, setShowDocModal] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [showChatPopup, setShowChatPopup] = useState<boolean>(false);

  // Branding builder values
  const [brandColor, setBrandColor] = useState<string>('#00288e');
  const [companyName, setCompanyName] = useState<string>('Apex Inspections');

  // Property CSV import simulator values
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [importedRows, setImportedRows] = useState<number>(0);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Test inspection worksheet values
  const [roomInspected, setRoomInspected] = useState<string>('Living Room');
  const [items, setItems] = useState([
    { id: 'item-1', name: 'Smoke Detector alarm response test', status: 'PENDING' as 'PENDING' | 'PASS' | 'FAIL' | 'REPAIR' },
    { id: 'item-2', name: 'Standard grounding sockets voltage match', status: 'PENDING' },
    { id: 'item-3', name: 'Plaster integrity & load bearing structural cracks', status: 'PENDING' },
  ]);

  // Handle Branding builder apply
  const handleApplyBranding = () => {
    setOnboarding(prev => ({
      ...prev,
      brandingConfigured: true,
      brandColor: brandColor,
    }));
    setActiveWorkflow('none');
  };

  // Handle CSV Import simulator apply
  const handleImportCSV = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setImportedRows(8);
      setOnboarding(prev => ({
        ...prev,
        propertyImported: true,
      }));
    }, 1500);
  };

  // Handle Test inspection status toggling
  const handleSetItemStatus = (id: string, status: 'PASS' | 'FAIL' | 'REPAIR') => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, status } : it));
  };

  const handleFinishInspection = () => {
    const allInspected = items.every(it => it.status !== 'PENDING');
    if (!allInspected) {
      alert("Please mark status for all three safety components first!");
      return;
    }
    setOnboarding(prev => ({
      ...prev,
      testInspectionPerformed: true,
    }));
    setActiveWorkflow('none');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto py-4">
      {/* Dynamic Progress Percentage Banner at the very top */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-slate-50/80 border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative glows */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 -mb-12 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold bg-[#00288e] text-white px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
                Checklist Progress
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {Math.round(getProgressPercent() / 25)} of 4 Milestones Checked
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#00288e] tracking-tight">
              Welcome to InspectPro Onboarding
            </h1>
            <p className="text-slate-600 text-xs md:text-sm max-w-xl leading-relaxed">
              Activate each milestone below by completing its step or directly checking the card status badge. Enjoy real-time progress calculations!
            </p>
          </div>

          <div className="w-full md:w-80 space-y-3 shrink-0 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Setup Completion
              </span>
              <span className="text-lg font-black text-[#00288e] transition-all">
                {getProgressPercent()}%
              </span>
            </div>
            {/* Elegant full percentage bar */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#00288e] to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercent()}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            
            {/* Step-by-Step interactive dots */}
            <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-100 mt-2">
              {[
                { name: 'Profile', active: onboarding.profileCompleted, toggle: () => setOnboarding(prev => ({ ...prev, profileCompleted: !prev.profileCompleted })) },
                { name: 'Branding', active: onboarding.brandingConfigured, toggle: () => setOnboarding(prev => ({ ...prev, brandingConfigured: !prev.brandingConfigured })) },
                { name: 'Import', active: onboarding.propertyImported, toggle: () => setOnboarding(prev => ({ ...prev, propertyImported: !prev.propertyImported })) },
                { name: 'Test', active: onboarding.testInspectionPerformed, toggle: () => setOnboarding(prev => ({ ...prev, testInspectionPerformed: !prev.testInspectionPerformed })) },
              ].map((step, idx) => (
                <button 
                  key={idx} 
                  onClick={step.toggle}
                  className="text-center space-y-1 hover:opacity-80 transition-opacity cursor-pointer group"
                  title={`Toggle ${step.name} completion`}
                >
                  <div className="flex justify-center">
                    <span className={`w-2 h-2 rounded-full transition-all ${
                      step.active ? 'bg-emerald-500 scale-110 shadow-xs' : 'bg-slate-200'
                    }`} />
                  </div>
                  <span className={`text-[9px] font-bold block truncate tracking-wide transition-colors ${
                    step.active ? 'text-[#00288e]' : 'text-slate-400 group-hover:text-slate-600'
                  }`}>
                    {step.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Section: Roadmap cards */}
        <div className="flex-1 space-y-6">
          
          {/* Active workflow overlay container */}
          {activeWorkflow === 'branding' && (
            <div className="bg-blue-50 border-2 border-[#00288e] p-6 rounded-2xl shadow-md space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Custom branding panel</h4>
                  <p className="text-xs text-slate-500">Choose colors and logotypes applied dynamically on PDF reports.</p>
                </div>
                <button onClick={() => setActiveWorkflow('none')} className="text-xs text-slate-400 hover:text-slate-600 font-bold">Cancel</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Registered Name</label>
                    <input 
                      type="text" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)} 
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Primary Brand Color</label>
                    <div className="flex gap-2">
                      {['#00288e', '#059669', '#dc2626', '#d97706', '#4f46e5'].map(color => (
                        <button 
                          key={color}
                          onClick={() => setBrandColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            brandColor === color ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mock Live preview */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: brandColor }} />
                      <span className="font-bold text-xs text-slate-800">{companyName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">PDF Report Mock</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-slate-100 rounded w-2/3" />
                    <div className="h-2 bg-slate-100 rounded w-1/2" />
                  </div>
                  <div className="h-10 rounded border-2 border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400">
                    Your Logo Placeholder
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleApplyBranding}
                  className="px-6 py-2.5 bg-[#00288e] hover:bg-[#1e40af] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md"
                >
                  Apply Brand Standards
                </button>
              </div>
            </div>
          )}

          {activeWorkflow === 'import' && (
            <div className="bg-blue-50 border-2 border-[#00288e] p-6 rounded-2xl shadow-md space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Interactive CSV Portfolio Importer</h4>
                  <p className="text-xs text-slate-500">Import spreadsheets with property addresses, serials, and dates.</p>
                </div>
                <button onClick={() => setActiveWorkflow('none')} className="text-xs text-slate-400 hover:text-slate-600 font-bold">Cancel</button>
              </div>

              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  dragOver ? 'border-[#00288e] bg-blue-50/50' : 'border-slate-200 bg-white'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImportCSV(); }}
                onClick={handleImportCSV}
              >
                {isImporting ? (
                  <div className="space-y-3">
                    <svg className="animate-spin h-8 w-8 text-[#00288e] mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-xs font-bold text-slate-600">Syncing structural cells...</p>
                  </div>
                ) : importedRows > 0 ? (
                  <div className="space-y-2 text-emerald-600">
                    <CheckCircle2 className="w-8 h-8 mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-wider">Successfully imported {importedRows} property nodes!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">Drag &amp; Drop portfolio.csv or click to simulate</p>
                    <p className="text-[10px] text-slate-400">Loads property list with state licenses automatically</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>CSV Template layout: [Property Name, Address, City, State, ZIP, Category]</span>
                <button 
                  onClick={handleImportCSV} 
                  className="text-[#00288e] font-bold hover:underline"
                >
                  Generate Dummy Portfolio
                </button>
              </div>
            </div>
          )}

          {activeWorkflow === 'test' && (
            <div className="bg-blue-50 border-2 border-[#00288e] p-6 rounded-2xl shadow-md space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">In-App test field inspection playground</h4>
                  <p className="text-xs text-slate-500">Experience the high stakes data sheet logging as an inspector.</p>
                </div>
                <button onClick={() => setActiveWorkflow('none')} className="text-xs text-slate-400 hover:text-slate-600 font-bold">Cancel</button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[9px] font-extrabold tracking-wider text-[#00288e] bg-blue-50 px-2 py-0.5 rounded uppercase">Current Location</span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1">{roomInspected} Worksheet</h5>
                  </div>
                  <span className="text-xs font-medium text-slate-500">Lead: {profile.fullName}</span>
                </div>

                <div className="space-y-3.5">
                  {items.map(it => (
                    <div key={it.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <span className="text-xs font-medium text-slate-800">{it.name}</span>
                      
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        <button 
                          onClick={() => handleSetItemStatus(it.id, 'PASS')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-all ${
                            it.status === 'PASS' 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          Pass
                        </button>
                        <button 
                          onClick={() => handleSetItemStatus(it.id, 'FAIL')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-all ${
                            it.status === 'FAIL' 
                              ? 'bg-red-500 border-red-500 text-white shadow-xs' 
                              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          Fail
                        </button>
                        <button 
                          onClick={() => handleSetItemStatus(it.id, 'REPAIR')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-all ${
                            it.status === 'REPAIR' 
                              ? 'bg-amber-500 border-amber-500 text-white shadow-xs' 
                              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          Repair
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleFinishInspection}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Log Field Checklist
                </button>
              </div>
            </div>
          )}


          {/* STEP 1: Complete Profile (Done) */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-5 relative overflow-hidden shadow-sm group">
            {/* Interactive Checkbox Button */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setOnboarding(prev => ({ ...prev, profileCompleted: !prev.profileCompleted }))}
                className={`flex items-center gap-1.5 font-bold text-[10px] tracking-wide px-3 py-1.5 rounded-full uppercase transition-all cursor-pointer border ${
                  onboarding.profileCompleted 
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' 
                    : 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
                title={onboarding.profileCompleted ? "Click to mark incomplete" : "Click to mark done"}
              >
                <Check className={`w-3.5 h-3.5 ${onboarding.profileCompleted ? 'text-emerald-600' : 'text-slate-300'}`} />
                {onboarding.profileCompleted ? 'DONE' : 'CHECK OFF'}
              </button>
            </div>

            {/* Left Icon */}
            <div className="w-12 h-12 rounded-xl bg-[#dde1ff] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <User className="w-6 h-6 text-[#00288e]" />
            </div>

            {/* Content info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-950 text-base">1. Complete Your Profile</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Provide your license details and upload a professional profile photo for inspection reports.
                </p>
              </div>
              <button 
                onClick={onNavigateToSettings}
                className="font-bold text-[11px] tracking-wider text-[#00288e] border border-[#00288e] px-4 py-2 rounded-lg uppercase hover:bg-[#dde1ff] transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* STEP 2: Configure Branding (In Progress / Toggleable) */}
          <div className={`bg-white border p-6 rounded-2xl flex gap-5 relative overflow-hidden transition-all shadow-sm group ${
            onboarding.brandingConfigured ? 'border-slate-200' : 'border-[#00288e] ring-1 ring-[#00288e]/40'
          }`}>
            {/* Interactive Checkbox Button */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setOnboarding(prev => ({ ...prev, brandingConfigured: !prev.brandingConfigured }))}
                className={`flex items-center gap-1.5 font-bold text-[10px] tracking-wide px-3 py-1.5 rounded-full uppercase transition-all cursor-pointer border ${
                  onboarding.brandingConfigured 
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' 
                    : 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                }`}
                title={onboarding.brandingConfigured ? "Click to mark incomplete" : "Click to mark done"}
              >
                {onboarding.brandingConfigured ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse animate-duration-1000" />
                )}
                {onboarding.brandingConfigured ? 'DONE' : 'CHECK OFF'}
              </button>
            </div>

            {/* Left Icon */}
            <div className="w-12 h-12 rounded-xl bg-[#1e40af] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Palette className="w-6 h-6" />
            </div>

            {/* Content info */}
            <div className="space-y-4">
              <div>
                <h3 className={`font-bold text-base ${onboarding.brandingConfigured ? 'text-slate-950' : 'text-[#00288e]'}`}>
                  2. Set Up Your Branding
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Upload your company logo and choose primary colors for your PDF reports to maintain brand consistency.
                </p>
              </div>
              <button 
                onClick={() => setActiveWorkflow('branding')}
                className={`font-bold text-[11px] tracking-wider px-5 py-2 rounded-lg uppercase shadow-sm transition-all ${
                  onboarding.brandingConfigured 
                    ? 'border border-slate-200 text-slate-500 hover:bg-slate-50' 
                    : 'bg-[#00288e] text-white hover:opacity-90 animate-pulse'
                }`}
              >
                Configure Branding
              </button>
            </div>
          </div>

          {/* STEP 3: Import Properties (Pending / Triggers when preceding steps are active) */}
          <div className={`bg-white border border-slate-200 p-6 rounded-2xl flex gap-5 relative shadow-sm group transition-all ${
            onboarding.propertyImported 
              ? 'opacity-100' 
              : onboarding.brandingConfigured 
              ? 'opacity-100' 
              : 'opacity-65 grayscale-[0.4]'
          }`}>
            {/* Interactive Checkbox Button */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setOnboarding(prev => ({ ...prev, propertyImported: !prev.propertyImported }))}
                className={`flex items-center gap-1.5 font-bold text-[10px] tracking-wide px-3 py-1.5 rounded-full uppercase transition-all cursor-pointer border ${
                  onboarding.propertyImported 
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' 
                    : 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
                title={onboarding.propertyImported ? "Click to mark incomplete" : "Click to mark done"}
              >
                <Check className={`w-3.5 h-3.5 ${onboarding.propertyImported ? 'text-emerald-600' : 'text-slate-300'}`} />
                {onboarding.propertyImported ? 'DONE' : 'CHECK OFF'}
              </button>
            </div>

            {/* Left Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              onboarding.brandingConfigured ? 'bg-indigo-100 text-[#00288e]' : 'bg-slate-100 text-slate-400'
            }`}>
              <Building className="w-6 h-6" />
            </div>

            {/* Content info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-950 text-base">3. Import Your First Property</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Manually add property addresses or sync your entire portfolio from a CSV file.
                </p>
              </div>
              <button 
                onClick={() => setActiveWorkflow('import')}
                disabled={!onboarding.brandingConfigured}
                className={`font-bold text-[11px] tracking-wider px-5 py-2 rounded-lg uppercase border shadow-xs ${
                  onboarding.propertyImported 
                    ? 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    : onboarding.brandingConfigured 
                    ? 'border-[#00288e] text-[#00288e] hover:bg-indigo-50' 
                    : 'border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
              >
                Import Now
              </button>
            </div>
          </div>

          {/* STEP 4: Test Inspection (Pending / Triggers when preceding steps are active) */}
          <div className={`bg-white border border-slate-200 p-6 rounded-2xl flex gap-5 relative shadow-sm group transition-all ${
            onboarding.testInspectionPerformed 
              ? 'opacity-100' 
              : onboarding.propertyImported 
              ? 'opacity-100' 
              : 'opacity-65 grayscale-[0.4]'
          }`}>
            {/* Interactive Checkbox Button */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setOnboarding(prev => ({ ...prev, testInspectionPerformed: !prev.testInspectionPerformed }))}
                className={`flex items-center gap-1.5 font-bold text-[10px] tracking-wide px-3 py-1.5 rounded-full uppercase transition-all cursor-pointer border ${
                  onboarding.testInspectionPerformed 
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' 
                    : 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
                title={onboarding.testInspectionPerformed ? "Click to mark incomplete" : "Click to mark done"}
              >
                <Check className={`w-3.5 h-3.5 ${onboarding.testInspectionPerformed ? 'text-emerald-600' : 'text-slate-300'}`} />
                {onboarding.testInspectionPerformed ? 'DONE' : 'CHECK OFF'}
              </button>
            </div>

            {/* Left Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              onboarding.propertyImported ? 'bg-indigo-100 text-[#00288e]' : 'bg-slate-100 text-slate-400'
            }`}>
              <Smartphone className="w-6 h-6" />
            </div>

            {/* Content info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-950 text-base">4. Perform a Test Inspection</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Download the InspectPro mobile app and try out the demo mode to familiarize yourself with the interface.
                </p>
              </div>
              <button 
                onClick={() => setActiveWorkflow('test')}
                disabled={!onboarding.propertyImported}
                className={`font-bold text-[11px] tracking-wider px-5 py-2 rounded-lg uppercase border shadow-xs ${
                  onboarding.testInspectionPerformed 
                    ? 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    : onboarding.propertyImported 
                    ? 'border-[#00288e] text-[#00288e] hover:bg-indigo-50' 
                    : 'border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
              >
                Try Demo
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar: Helpful Resources */}
        <aside className="w-full lg:w-[320px] shrink-0 space-y-6">
          <div className="bg-slate-100 border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
            <h2 className="font-bold text-slate-950 text-sm flex items-center gap-2 text-[#00288e]">
              <HelpCircle className="w-5 h-5" />
              Helpful Resources
            </h2>
            
            <div className="space-y-3">
              {/* Documentation link */}
              <button 
                onClick={() => setShowDocModal(true)}
                className="w-full flex items-center gap-3.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-[#00288e] transition-all group text-left"
              >
                <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-[#00288e]" />
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-xs text-slate-900">Documentation</p>
                  <p className="text-[10px] text-slate-400">Step-by-step feature guides</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#00288e] transition-colors" />
              </button>

              {/* Video tutorials */}
              <button 
                onClick={() => setShowVideoModal(true)}
                className="w-full flex items-center gap-3.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-[#00288e] transition-all group text-left"
              >
                <PlayCircle className="w-5 h-5 text-slate-400 group-hover:text-[#00288e]" />
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-xs text-slate-900">Video Tutorials</p>
                  <p className="text-[10px] text-slate-400">Watch our 5-minute setup video</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#00288e] transition-colors" />
              </button>
            </div>

            {/* Assistance Live Chat block */}
            <div className="pt-4 border-t border-slate-200 mt-2">
              <div className="bg-[#1e40af] p-4 rounded-xl text-white space-y-2">
                <p className="font-bold text-xs">Need real-time help?</p>
                <p className="text-[10px] text-slate-200 leading-normal">
                  Our support team is online and ready to assist you with your setup.
                </p>
                <button 
                  onClick={() => setShowChatPopup(true)}
                  className="w-full bg-white text-[#00288e] py-2 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Live Chat Now
                </button>
              </div>
            </div>
          </div>

          {/* Promo banner container with hotlinked image */}
          <div className="relative h-44 rounded-2xl overflow-hidden flex items-end p-5 group cursor-pointer shadow-sm">
            <div 
              className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBitYXBnRJ-LYti43d29l59U_7ssvf7ueKXwJ3-vcOwwONX1qdHAl2EZA882LojE-treHlM7_NwXm-WcfEDHluiH7cqd1H3lOhxZ7caD_ClbHz1oHIXHjhRfTvXu_mG5JyZmxRH8_-EiFGZUd34Ik4r3RTlRKnyNpCFoJH4JTP_IMctPmq-jfOBJxuWgzpGJuUEgEjoPjFPGo8UTKJWXl0H29cZuRrtkmfFxlXYAy3ghj-V8lvjgiGuDsSdCWgKkQ54PinT5JHYjOQ')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00288e]/95 via-[#00288e]/50 to-transparent" />
            <div className="relative z-10 text-white space-y-1">
              <p className="font-bold text-sm">Join the Inspector Community</p>
              <p className="text-[10px] text-slate-200">Get weekly tips on improving inspection speed.</p>
            </div>
          </div>
        </aside>
      </div>

      {/* MODAL 1: Documentation */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowDocModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#00288e]" />
                InspectPro Knowledge Ledger
              </h3>
              <div className="text-xs text-slate-600 space-y-3 h-64 overflow-y-auto pr-2">
                <p className="font-bold text-slate-800">1. Setup Regulatory Clearances</p>
                <p>Before launching templates, click on the "Clearances" panel and provide the State Board of Real Estate Inspectors credentials. All credentials undergo immediate cryptographic check matching signatures.</p>
                
                <p className="font-bold text-slate-800">2. Uploading Area Worksheets</p>
                <p>Area worksheets cover structured grids. You may inspect up to 5 properties in active offline queue before database sync holds.</p>
                
                <p className="font-bold text-slate-800">3. Customizing Brand Guidelines</p>
                <p>Upload a clean 300x300 PNG with alpha channel logotypes to set reports background margins.</p>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setShowDocModal(false)}
                  className="px-5 py-2 bg-[#00288e] text-white hover:bg-[#1e40af] text-xs font-bold uppercase tracking-wider rounded-xl"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Video Tutorial */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl border border-slate-200 shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">InspectPro 5-Minute Setup Video Tutorial</h3>
              
              {/* Playable simulator screen */}
              <div className="relative aspect-video rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center brightness-50" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBitYXBnRJ-LYti43d29l59U_7ssvf7ueKXwJ3-vcOwwONX1qdHAl2EZA882LojE-treHlM7_NwXm-WcfEDHluiH7cqd1H3lOhxZ7caD_ClbHz1oHIXHjhRfTvXu_mG5JyZmxRH8_-EiFGZUd34Ik4r3RTlRKnyNpCFoJH4JTP_IMctPmq-jfOBJxuWgzpGJuUEgEjoPjFPGo8UTKJWXl0H29cZuRrtkmfFxlXYAy3ghj-V8lvjgiGuDsSdCWgKkQ54PinT5JHYjOQ')` }} />
                <div className="relative z-10 text-center space-y-3">
                  <PlayCircle className="w-16 h-16 text-white hover:scale-110 cursor-pointer mx-auto transition-transform" />
                  <p className="text-white text-xs font-semibold">"Mastering Safety Protocols in Under 5 Minutes"</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Learn how to configure sync nodes, upload professional licenses, and generate legal PDF reports with digital signatures.</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Live Chat Popup */}
      {showChatPopup && (
        <div className="fixed bottom-4 right-4 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl w-80 p-5 space-y-4 animate-slide-up">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-[#00288e]">Live Support Agent</h4>
            <button onClick={() => setShowChatPopup(false)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <p className="text-xs text-slate-600">
            Hi! Marcus. Our live customer support is ready to guide you. Feel free to upgrade your plan or complete credentials registry checks.
          </p>
          <div className="flex gap-2">
            <button 
              onClick={onNavigateToPricing}
              className="flex-1 py-2 bg-[#00288e] text-white hover:bg-[#1e40af] text-[10px] font-bold uppercase rounded-lg text-center"
            >
              See Pricing
            </button>
            <button 
              onClick={() => {
                alert("We have sent a state registry verification override link to m.thompson@proinspect.com.");
                setShowChatPopup(false);
              }}
              className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-bold uppercase rounded-lg text-center"
            >
              Manual Code
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
