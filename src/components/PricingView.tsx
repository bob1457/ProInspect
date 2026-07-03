import React, { useState } from 'react';
import { Check, ArrowRight, Play, Info, Sparkles, HelpCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { faqs, comparisonFeatures } from '../data';

interface PricingViewProps {
  onPlanSelected: (planName: string) => void;
}

export default function PricingView({ onPlanSelected }: PricingViewProps) {
  const [isAnnual, setIsAnnual] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);

  // Toggle active pricing values
  const getSoloPrice = () => (isAnnual ? 23 : 29);
  const getTeamPrice = () => (isAnnual ? 63 : 79);

  return (
    <div className="space-y-16 animate-fade-in max-w-7xl mx-auto py-4">
      
      {/* Hero & Toggle Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-[#00288e] tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-slate-500 text-sm md:text-base leading-relaxed">
          Choose the plan that fits your inspection volume. Scaling professional property reports without the digital paperwork fatigue.
        </p>

        {/* Billing Switcher Toggle */}
        <div className="flex items-center justify-center gap-4 pt-4 select-none">
          <span className={`text-xs font-bold tracking-wider uppercase transition-colors ${!isAnnual ? 'text-[#00288e]' : 'text-slate-400'}`}>
            Monthly
          </span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 bg-blue-100 rounded-full p-1 transition-all duration-300 relative flex items-center shadow-inner"
          >
            <div className={`w-6 h-6 bg-[#00288e] rounded-full transition-transform duration-300 transform shadow ${
              isAnnual ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
          <span className={`text-xs font-bold tracking-wider uppercase transition-colors ${isAnnual ? 'text-[#00288e]' : 'text-slate-400'}`}>
            Annual <span className="text-[#00288e] font-extrabold">(Save 20%)</span>
          </span>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Card 1: Solo */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between hover:border-[#00288e] transition-colors shadow-sm relative">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Solo</h3>
              <p className="text-xs text-slate-400">Ideal for independent inspectors.</p>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#00288e]">$</span>
              <span className="text-5xl font-extrabold text-[#00288e] transition-all duration-300">
                {getSoloPrice()}
              </span>
              <span className="text-slate-400 text-sm">/mo</span>
            </div>

            <ul className="space-y-4 text-xs text-slate-600 border-t border-slate-100 pt-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00288e] shrink-0" />
                <span>10 reports per month</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00288e] shrink-0" />
                <span>Basic PDF exports</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00288e] shrink-0" />
                <span>1GB cloud storage</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00288e] shrink-0" />
                <span>Mobile app access</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={() => onPlanSelected('Solo')}
            className="w-full mt-8 py-3 bg-white hover:bg-slate-50 text-[#00288e] font-bold text-xs uppercase tracking-wider rounded-xl border border-[#00288e] transition-colors"
          >
            Get Started
          </button>
        </div>

        {/* Card 2: Team (Most Popular) */}
        <div className="bg-white border-2 border-[#00288e] rounded-2xl p-8 flex flex-col justify-between relative transform md:scale-105 shadow-xl shadow-[#00288e]/5">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00288e] text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
            Most Popular
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Team</h3>
              <p className="text-xs text-slate-400">Best for small agencies.</p>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#00288e]">$</span>
              <span className="text-5xl font-extrabold text-[#00288e] transition-all duration-300">
                {getTeamPrice()}
              </span>
              <span className="text-slate-400 text-sm">/mo</span>
            </div>

            <ul className="space-y-4 text-xs text-slate-600 border-t border-slate-100 pt-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00288e] shrink-0" />
                <span>Unlimited reports</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00288e] shrink-0" />
                <span>Team collaboration (up to 5)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00288e] shrink-0" />
                <span>Custom brand styling</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00288e] shrink-0" />
                <span>10GB cloud storage</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00288e] shrink-0" />
                <span>Advanced photo markup</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={() => onPlanSelected('Team')}
            className="w-full mt-8 py-3.5 bg-[#00288e] hover:bg-[#1e40af] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-colors"
          >
            Start 14-Day Trial
          </button>
        </div>

        {/* Card 3: Enterprise */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between hover:border-[#00288e] transition-colors shadow-sm">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Enterprise</h3>
              <p className="text-xs text-slate-400">Large-scale operations.</p>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#00288e]">Custom</span>
            </div>

            <ul className="space-y-4 text-xs text-slate-600 border-t border-slate-100 pt-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00288e] shrink-0" />
                <span>API access &amp; Webhooks</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00288e] shrink-0" />
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00288e] shrink-0" />
                <span>Single Sign-On (SSO)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00288e] shrink-0" />
                <span>Unlimited cloud storage</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={() => onPlanSelected('Enterprise')}
            className="w-full mt-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            Contact Sales
          </button>
        </div>

      </section>

      {/* Compare Features Section */}
      <section className="bg-slate-100 border border-slate-200 rounded-3xl p-6 md:p-8 overflow-x-auto shadow-sm">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">Compare Features</h2>
        <table className="w-full min-w-[600px] border-collapse bg-white rounded-2xl overflow-hidden shadow-xs">
          <thead>
            <tr className="bg-[#1e40af] text-white">
              <th className="p-5 text-left text-xs font-bold tracking-wider uppercase">Features</th>
              <th className="p-5 text-center text-xs font-bold tracking-wider uppercase">Solo</th>
              <th className="p-5 text-center text-xs font-bold tracking-wider uppercase">Team</th>
              <th className="p-5 text-center text-xs font-bold tracking-wider uppercase">Enterprise</th>
            </tr>
          </thead>
          <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
            {comparisonFeatures.map((feat, index) => (
              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5 font-bold text-slate-800">{feat.name}</td>
                <td className="p-5 text-center text-slate-500 font-semibold">{feat.solo}</td>
                <td className="p-5 text-center text-slate-500 font-semibold">{feat.team}</td>
                <td className="p-5 text-center text-slate-500 font-semibold">{feat.enterprise}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FAQs Section */}
      <section className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-center text-slate-950 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`bg-slate-100 border rounded-2xl p-5 transition-all cursor-pointer ${
                activeFaq === idx ? 'border-[#00288e] ring-1 ring-[#00288e]' : 'border-slate-200'
              }`}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="flex justify-between items-center select-none">
                <h4 className="font-bold text-slate-900 text-sm">{faq.question}</h4>
                {activeFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-[#00288e] shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </div>
              
              {activeFaq === idx && (
                <div className="mt-4 text-xs text-slate-600 leading-relaxed pr-6 border-t border-slate-200/50 pt-3 animate-fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Hero Image Section */}
      <section className="relative rounded-3xl overflow-hidden py-24 px-6 md:px-12 text-center text-white shadow-xl">
        {/* Background Image of Inspector holding tablet */}
        <div 
          className="absolute inset-0 bg-cover bg-center brightness-35"
          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDmJPCkoYOJIOM6Vc_6Q-bpz2buaQgP0io94ittcd7M2dKOjiVpyXwUSFBODuRhRBFoFyIauF-E4tgMO4B11vi_vuACZhbzVUPtIeJpyTGADHkTusImrBSK4guiLQpW5TWXLXzfk-4PDKnl5j1gUQ-p7Ob4CtzBI6TNBWwIpGbW_a57kZHWICPhrJShdGJND7TGwJsRf66kFTZ6D-lC7mWDlH3QSZEEHzwHRlcGd354dtJ2ziOj1I84EGzPIFHtAVHbpjfUNrlTAqU')` }}
        />
        {/* Gradient Layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#00288e]/90 to-transparent" />
        
        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Ready to digitize your workflow?</h2>
          <p className="text-slate-200 text-xs md:text-sm leading-relaxed font-light">
            Join 2,000+ property professionals who have eliminated physical paperwork with InspectPro. Set up compliant sheets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <button 
              onClick={() => onPlanSelected('Team')}
              className="px-8 py-3.5 bg-[#00288e] hover:bg-[#1e40af] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-95"
            >
              Get Started Now
            </button>
            <button 
              onClick={() => setShowDemoModal(true)}
              className="px-8 py-3.5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/20 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-white" />
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* DEMO MODAL VIDEO PLAYER */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">InspectPro Live Demonstration Walkthrough</h3>
              
              <div className="relative aspect-video rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center brightness-40" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDmJPCkoYOJIOM6Vc_6Q-bpz2buaQgP0io94ittcd7M2dKOjiVpyXwUSFBODuRhRBFoFyIauF-E4tgMO4B11vi_vuACZhbzVUPtIeJpyTGADHkTusImrBSK4guiLQpW5TWXLXzfk-4PDKnl5j1gUQ-p7Ob4CtzBI6TNBWwIpGbW_a57kZHWICPhrJShdGJND7TGwJsRf66kFTZ6D-lC7mWDlH3QSZEEHzwHRlcGd354dtJ2ziOj1I84EGzPIFHtAVHbpjfUNrlTAqU')` }} />
                <div className="relative z-10 text-center space-y-3">
                  <Play className="w-16 h-16 text-white fill-white hover:scale-110 cursor-pointer mx-auto transition-transform" />
                  <p className="text-white text-xs font-semibold">"Interactive Checklist Generation &amp; 256-bit Sync"</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Discover how Apex inspectors sync real-time clearances, execute safety checkmarks, and sign inspection reports.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
