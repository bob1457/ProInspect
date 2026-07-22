import React from 'react';
import { Layers, ShieldCheck, UserCheck, Milestone, DollarSign, Sun, Moon, Home, Lock } from 'lucide-react';

interface ViewSelectorProps {
  currentView: 'landing' | 'signin' | 'registration' | 'dashboard' | 'onboarding' | 'pricing';
  onViewChange: (view: 'landing' | 'signin' | 'registration' | 'dashboard' | 'onboarding' | 'pricing') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function ViewSelector({ currentView, onViewChange, theme, onToggleTheme }: ViewSelectorProps) {
  return (
    <div id="view-selector-container" className="w-full bg-slate-900 text-white border-b border-slate-800 py-3.5 px-4 sticky top-0 z-[70] no-print print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        
        {/* Branding indicator */}
        <div className="flex items-center gap-2.5">
          <div className="bg-[#1e40af] p-1.5 rounded text-white font-extrabold flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold tracking-tight text-slate-100">ProInspect Prototype Workspace</p>
            <p className="text-[10px] text-slate-400">Jump directly to verify each screenshot screen:</p>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
          <button 
            onClick={() => onViewChange('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all cursor-pointer ${
              currentView === 'landing' 
                ? 'bg-[#00288e] text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            {/* Landing Page (5) */}
            Home
          </button>

          {/* <button 
            onClick={() => onViewChange('registration')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all cursor-pointer ${
              currentView === 'registration' 
                ? 'bg-[#00288e] text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Registration (1)
          </button> */}

          {/* <button 
            onClick={() => onViewChange('onboarding')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all cursor-pointer ${
              currentView === 'onboarding' 
                ? 'bg-[#00288e] text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Milestone className="w-4 h-4 shrink-0" />
            Onboarding (3)
          </button> */}

          {/* <button 
            onClick={() => onViewChange('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all cursor-pointer ${
              currentView === 'dashboard' 
                ? 'bg-[#00288e] text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            Inspector (2)
          </button> */}

          <button 
            onClick={() => onViewChange('pricing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all cursor-pointer ${
              currentView === 'pricing' 
                ? 'bg-[#00288e] text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <DollarSign className="w-4 h-4 shrink-0" />
            Pricing
          </button>
        </div>

        {/* High-contrast Field Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl border border-slate-700/50 font-bold transition-all shrink-0 cursor-pointer text-[11px]"
          title="Toggle high-contrast field lighting mode"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>High-Contrast Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Daylight Mode</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
