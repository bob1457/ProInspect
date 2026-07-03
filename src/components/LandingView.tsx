import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, ArrowRight, CheckCircle2, ShieldCheck, ClipboardList, 
  Camera, FileText, ChevronRight, Tablet, Phone, Star, Play, X, Mail
} from 'lucide-react';

interface LandingViewProps {
  onStartFreeTrial: () => void;
  onNavigateToPricing: () => void;
  onTriggerToast: (message: string) => void;
}

export default function LandingView({ 
  onStartFreeTrial, 
  onNavigateToPricing, 
  onTriggerToast 
}: LandingViewProps) {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoCompany, setDemoCompany] = useState('');

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerToast(`🎉 Demo scheduled! We have sent a calendar invitation to ${demoEmail}.`);
    setShowDemoModal(false);
    setDemoName('');
    setDemoEmail('');
    setDemoCompany('');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#fbf9ff] text-slate-900 font-sans selection:bg-indigo-100 antialiased overflow-x-hidden">
      
      {/* 1. Header/Navigation */}
      <header className="sticky top-0 z-[60] bg-[#fbf9ff]/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 bg-[#00288e] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-900/10">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-[#00288e]">
              Rental Inspect Pro
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-sm font-semibold text-slate-600 hover:text-[#00288e] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('device-ready')} 
              className="text-sm font-semibold text-slate-600 hover:text-[#00288e] transition-colors cursor-pointer"
            >
              Solutions
            </button>
            <button 
              onClick={onNavigateToPricing} 
              className="text-sm font-semibold text-slate-600 hover:text-[#00288e] transition-colors cursor-pointer"
            >
              Pricing
            </button>
          </nav>

          {/* CTA Group */}
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => setShowDemoModal(true)}
              className="text-sm font-bold text-slate-600 hover:text-[#00288e] px-4 py-2 transition-colors cursor-pointer"
            >
              Get a Demo
            </button>
            <button 
              onClick={onStartFreeTrial}
              className="bg-[#00288e] hover:bg-blue-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-900/10 hover:shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <span>Start Free Trial</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-8 pb-16 sm:py-20 lg:py-28 overflow-hidden">
        {/* Abstract light background gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 right-10 w-[300px] h-[300px] bg-blue-100/30 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero text (5 cols) */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8 text-center lg:text-left relative z-10">
            
            {/* Live indicator badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#dde1ff]/60 border border-blue-200/50 rounded-full text-[11px] font-extrabold text-[#00288e] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping" />
              <span>V2.4 Now Live</span>
            </div>

            {/* Headline */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[46px] font-black tracking-tight text-[#00288e] leading-[1.12]">
                Professional Property <br className="hidden sm:inline" />
                <span className="text-slate-900 font-extrabold">Inspections Made Simple</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Streamline your field operations with our utility-first inspection toolkit. 
                Eliminate paperwork, reduce reporting errors by 40%, and reclaim your team's valuable time.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <button 
                onClick={onStartFreeTrial}
                className="w-full sm:w-auto px-7 py-4 bg-[#00288e] hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-900/15 hover:shadow-xl hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setShowDemoModal(true)}
                className="w-full sm:w-auto px-7 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200/60 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Book a Demo</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <div className="flex -space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-[#fbf9ff] flex items-center justify-center text-[10px] text-white font-bold">M</div>
                <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-[#fbf9ff] flex items-center justify-center text-[10px] text-white font-bold">S</div>
                <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-[#fbf9ff] flex items-center justify-center text-[10px] text-white font-bold">J</div>
              </div>
              <span className="text-xs sm:text-sm text-slate-500 font-semibold tracking-wide">
                Trusted by <strong className="text-slate-900">5,000+</strong> property managers globally
              </span>
            </div>

          </div>

          {/* Hero tablet mockup (7 cols) */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end relative">
            
            {/* Tablet wrapper containing standard dashboard elements mimicking the actual inspection software dark theme */}
            <div className="relative w-full max-w-[580px] h-[380px] sm:h-[440px] bg-slate-900 rounded-[28px] border-4 border-slate-950 p-2 shadow-2xl shadow-blue-900/30 transform lg:rotate-[-3deg] lg:translate-x-4 transition-transform hover:rotate-0 duration-500 overflow-hidden">
              
              {/* Inner content simulating the actual inspector portal screen */}
              <div className="w-full h-full bg-[#0d1527] rounded-[20px] p-4 flex flex-col text-white font-mono text-[11px] select-none">
                
                {/* Simulated Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] text-slate-400 font-bold ml-1">ProInspect v2.4</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="text-[9px] bg-[#1e293b] px-2 py-0.5 rounded">Active State</span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Dashboard layout */}
                <div className="flex-1 grid grid-cols-12 gap-3.5 mt-3">
                  
                  {/* Left panel */}
                  <div className="col-span-4 bg-slate-900/80 rounded-xl border border-slate-800 p-3 space-y-3">
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 font-black">ACTIVE TECHNICIAN</p>
                      <p className="font-sans font-bold text-white text-[11px]">Marcus Thompson</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <p className="text-[9px] text-slate-500 font-black">DISPATCH QUEUE</p>
                      
                      <div className="p-1.5 bg-blue-950/40 border border-blue-900/50 rounded-lg space-y-1">
                        <p className="text-[9px] font-sans font-bold text-blue-300">Oakwood Residences</p>
                        <p className="text-[8px] text-slate-400">10:00 AM • Structural</p>
                      </div>

                      <div className="p-1.5 bg-slate-950/40 border border-slate-800 rounded-lg space-y-1">
                        <p className="text-[9px] font-sans font-bold text-slate-300">Westside Commerce</p>
                        <p className="text-[8px] text-slate-400">01:30 PM • Termite</p>
                      </div>
                    </div>
                  </div>

                  {/* Main screen area mimicking inspections checklist */}
                  <div className="col-span-8 bg-slate-900/40 rounded-xl border border-slate-800 p-3.5 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <h4 className="font-sans font-bold text-white text-xs">Real-time Inspection Builder</h4>
                        <span className="text-[8px] bg-amber-900/30 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800/50">IN-PROGRESS</span>
                      </div>

                      <div className="space-y-1.5 font-sans">
                        <div className="flex items-center justify-between p-2 bg-[#131f38] border border-slate-800 rounded-lg text-xs">
                          <span className="font-medium text-slate-300">Foundation Stability</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/50 font-mono font-bold">PASS</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-[#131f38] border border-slate-800 rounded-lg text-xs">
                          <span className="font-medium text-slate-300">Electrical Mains Grounding</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/50 font-mono font-bold">PASS</span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-[#131f38] border border-slate-800 rounded-lg text-xs">
                          <span className="font-medium text-slate-300">Roof Shingle Weathering</span>
                          <span className="text-[10px] text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-900/50 font-mono font-bold font-bold">FLAGGED</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom stats inside mockup */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 font-sans">
                      <div className="text-center p-1 bg-[#122240] rounded border border-blue-900/30">
                        <span className="block text-[8px] text-slate-400">Checked</span>
                        <strong className="text-[11px] text-blue-300">14 / 22</strong>
                      </div>
                      <div className="text-center p-1 bg-[#122240] rounded border border-blue-900/30">
                        <span className="block text-[8px] text-slate-400">Score</span>
                        <strong className="text-[11px] text-emerald-400">92%</strong>
                      </div>
                      <div className="text-center p-1 bg-[#122240] rounded border border-blue-900/30">
                        <span className="block text-[8px] text-slate-400">Photos</span>
                        <strong className="text-[11px] text-amber-400">18</strong>
                      </div>
                      <div className="text-center p-1 bg-[#122240] rounded border border-blue-900/30">
                        <span className="block text-[8px] text-slate-400">GPS Status</span>
                        <strong className="text-[10px] text-emerald-400">LOCKED</strong>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Live Demo Status disclaimer inside tablet */}
                <div className="mt-3 bg-slate-900 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    PDF compliance standard document ready to generate.
                  </span>
                  <span className="text-[9px] font-sans font-extrabold text-[#dde1ff]">Preview Active</span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. Logos Marquee Section */}
      <section className="bg-[#f0eaff]/40 border-y border-indigo-100/50 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] sm:text-xs font-bold text-[#00288e]/80 uppercase tracking-widest mb-6">
            Powering Leading Real Estate Agencies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 lg:gap-20 opacity-70">
            <span className="text-sm sm:text-base font-black tracking-wider text-slate-500">ESTATECORE</span>
            <span className="text-sm sm:text-base font-black tracking-wider text-slate-500">PROP-LY</span>
            <span className="text-sm sm:text-base font-black tracking-wider text-slate-500">MANAGEX</span>
            <span className="text-sm sm:text-base font-black tracking-wider text-slate-500">VERIFIDE</span>
            <span className="text-sm sm:text-base font-black tracking-wider text-slate-500">DWELLSYNC</span>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Title */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Precision-Engineered Features
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              Everything you need to conduct airtight property inspections directly from the field.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Card 1 */}
            <div className="bg-[#fbf9ff] border border-slate-100 p-8 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-5">
              <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Room-by-Room Checklists</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Structured data entry tailored for every property type. Our smart logic adapts to the environment as you move through the space.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#fbf9ff] border border-slate-100 p-8 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-5">
              <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Instant Photo Evidence</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Capture and tag photos instantly. Our system automatically timestamps and geo-locates every piece of visual evidence for total accountability.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#fbf9ff] border border-slate-100 p-8 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-5">
              <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Professional PDF Reports</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Generate beautiful, white-labeled reports with a single tap. Ready to send to owners, tenants, or insurance adjusters immediately.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Device Ready Section (Tablet & Mobile overlap layout) */}
      <section id="device-ready" className="py-16 sm:py-24 bg-[#f4f1fa]/60 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8 relative z-10">
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Tablet & Mobile Ready
              </h2>
              <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                Your work doesn't happen at a desk. Rental Inspect Pro is built for the field, providing a seamless experience across all your devices.
              </p>
            </div>

            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#00288e] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Offline sync for remote areas</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#00288e] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Native camera integration</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#00288e] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Touch-optimized interfaces</span>
              </li>
            </ul>

            {/* Small platform store buttons */}
            <div className="pt-2 flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-900 rounded-xl text-white text-[11px] font-bold tracking-tight cursor-pointer hover:bg-slate-800 transition-all flex items-center gap-2">
                <Tablet className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="block text-[8px] text-slate-400">Download for</span>
                  <span>iPad App</span>
                </div>
              </div>

              <div className="px-4 py-2 bg-slate-900 rounded-xl text-white text-[11px] font-bold tracking-tight cursor-pointer hover:bg-slate-800 transition-all flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="block text-[8px] text-slate-400">Download for</span>
                  <span>iPhone App</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Mobile Overlap Mockup */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end relative h-[380px] sm:h-[420px]">
            
            {/* Tablet background layout */}
            <div className="absolute top-10 right-20 w-[380px] h-[260px] bg-slate-800 rounded-2xl border border-slate-700 shadow-xl opacity-60 hidden sm:block">
              <div className="w-full h-10 bg-slate-900 rounded-t-2xl border-b border-slate-700 flex items-center px-4 gap-2">
                <span className="w-2 h-2 bg-slate-600 rounded-full" />
                <span className="w-2 h-2 bg-slate-600 rounded-full" />
                <span className="w-2 h-2 bg-slate-600 rounded-full" />
              </div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-1/3" />
                <div className="h-3 bg-slate-700/60 rounded w-full" />
                <div className="h-3 bg-slate-700/60 rounded w-5/6" />
                <div className="h-3 bg-slate-700/60 rounded w-4/5" />
              </div>
            </div>

            {/* Smartphone Overlapping mockup in the foreground */}
            <div className="relative z-10 w-[240px] h-[370px] bg-slate-900 rounded-[38px] border-4 border-slate-950 p-2 shadow-2xl shadow-blue-900/40">
              
              {/* Speaker pill top */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-800 rounded-full" />
              </div>

              {/* iPhone screen mimicking mobile checklist */}
              <div className="w-full h-full bg-white rounded-[32px] overflow-hidden flex flex-col pt-6 font-sans text-[10px] select-none text-slate-800">
                
                {/* Header */}
                <div className="bg-[#fbf9ff] border-b border-slate-100 p-2.5 flex items-center justify-between">
                  <span className="font-extrabold text-[#00288e] text-[9px]">Rental Inspect</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-[#00288e] font-black uppercase text-[7px] tracking-wider rounded">ROOM 2B</span>
                </div>

                {/* Checklist Body */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                  
                  <div className="space-y-1">
                    <span className="block text-[8px] font-bold text-slate-400">BEDROOM SUITE 1</span>
                    <strong className="block text-slate-900 text-[11px] font-black leading-tight">Master Wall Finishing</strong>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    
                    {/* Item 1 */}
                    <div className="p-2 border border-slate-100 bg-slate-50/50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <input type="checkbox" defaultChecked className="rounded text-[#00288e] focus:ring-0" />
                        <span className="font-semibold text-[9px]">Verify baseboard trim</span>
                      </div>
                      <span className="text-emerald-600 font-extrabold text-[8px]">PASS</span>
                    </div>

                    {/* Item 2 */}
                    <div className="p-2 border border-slate-100 bg-slate-50/50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <input type="checkbox" className="rounded text-[#00288e] focus:ring-0" />
                        <span className="font-semibold text-[9px]">Check window latches</span>
                      </div>
                      <span className="text-amber-600 font-extrabold text-[8px]">PENDING</span>
                    </div>

                    {/* Item 3 */}
                    <div className="p-2 border border-slate-100 bg-slate-50/50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <input type="checkbox" defaultChecked className="rounded text-[#00288e] focus:ring-0" />
                        <span className="font-semibold text-[9px]">Test closet slider track</span>
                      </div>
                      <span className="text-emerald-600 font-extrabold text-[8px]">PASS</span>
                    </div>

                  </div>

                </div>

                {/* Bottom navigation of the mock mobile screen */}
                <div className="bg-slate-50 border-t border-slate-100 p-2 text-center text-[8px] font-bold text-slate-400">
                  <span>TAP TO LOG DEFECT PHOTO</span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 6. Testimonial Section */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
          
          {/* Double quote symbol */}
          <span className="text-6xl sm:text-7xl font-serif text-[#00288e] block leading-[0]">“</span>
          
          <blockquote className="text-xl sm:text-2xl font-serif italic text-slate-800 leading-relaxed max-w-3xl mx-auto">
            "Rental Inspect Pro has transformed our internal workflow. What used to take two hours of data entry after a walk-through now happens instantly in the field. Our owners love the clarity of the reports."
          </blockquote>

          <div className="space-y-1">
            <cite className="not-italic text-sm sm:text-base font-extrabold text-slate-900 block">
              Sarah J. Miller
            </cite>
            <span className="text-xs sm:text-sm text-slate-500 font-semibold tracking-wide block">
              Director of Operations, Metro Residential
            </span>
          </div>

        </div>
      </section>

      {/* 7. Bottom blue Call-To-Action Block */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#00288e] text-white relative overflow-hidden">
        {/* Abstract background points */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8 relative z-10">
          
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight leading-tight">
              Transform your inspection workflow today.
            </h2>
            <p className="text-sm sm:text-base text-blue-100 font-medium max-w-2xl mx-auto">
              Join thousands of property professionals who have already made the switch to the industry standard for digital inspections.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStartFreeTrial}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#00288e] font-extrabold rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-black/10 hover:shadow-xl cursor-pointer text-sm"
            >
              Start Your 14-Day Free Trial
            </button>
            <button 
              onClick={() => setShowDemoModal(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-white text-white font-extrabold rounded-xl hover:bg-white/10 transition-all cursor-pointer text-sm"
            >
              Schedule a Personal Demo
            </button>
          </div>

          <p className="text-[10px] sm:text-xs text-blue-200/80 font-bold uppercase tracking-wider">
            NO CREDIT CARD REQUIRED • INSTANT SETUP
          </p>

        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-white border-t border-slate-100 py-10 sm:py-14 text-xs font-semibold text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-[#00288e] rounded-lg flex items-center justify-center text-white shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-base font-black tracking-tight text-[#00288e]">
              Rental Inspect Pro
            </span>
          </div>

          {/* Policy Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-slate-500 text-[11px] sm:text-xs">
            <span className="hover:text-slate-800 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-800 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-800 cursor-pointer">Support</span>
            <span className="hover:text-slate-800 cursor-pointer">Contact</span>
          </div>

          {/* Copyright text */}
          <div className="text-slate-400 font-medium text-[11px] sm:text-xs">
            © 2026 Rental Inspect Pro. All rights reserved.
          </div>

        </div>
      </footer>

      {/* Demo Modal overlay */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Schedule Your Live Demo</h3>
                  <p className="text-xs text-slate-500 font-medium">See how Rental Inspect Pro works tailored to your team's workflow.</p>
                </div>

                <form onSubmit={handleDemoSubmit} className="space-y-3.5 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Your Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sarah Jenkins"
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Business Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. sarah@metroresidential.com"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Company / Office Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Metro Residential PM"
                      value={demoCompany}
                      onChange={(e) => setDemoCompany(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-4 bg-[#00288e] hover:bg-blue-800 text-white font-bold p-3 rounded-xl text-xs transition-all shadow-md shadow-blue-900/10 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Schedule 1-on-1 Session</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
