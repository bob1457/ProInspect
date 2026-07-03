import React, { useState } from 'react';
import { User, Shield, KeyRound, Award, ArrowRight, Eye, EyeOff, CheckCircle2, Lock, FileBadge, Mail } from 'lucide-react';
import { PersonalInfo } from '../types';

interface RegistrationViewProps {
  onRegisterSuccess: (info: Partial<PersonalInfo>) => void;
}

export default function RegistrationView({ onRegisterSuccess }: RegistrationViewProps) {
  const [step, setStep] = useState<number>(2); // Start at Step 2 to match Screen 1 screenshot perfectly!
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('Johnathan Doe');
  const [license, setLicense] = useState<string>('TX-12345678');
  const [email, setEmail] = useState<string>('j.doe@agency.com');
  const [password, setPassword] = useState<string>('password123');
  
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationDone, setVerificationDone] = useState<boolean>(false);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        setVerificationDone(true);
        setStep(3);
      }, 1500);
    } else if (step === 3) {
      // Execute registration callback
      onRegisterSuccess({
        fullName,
        email,
      });
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
      setVerificationDone(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row mx-auto transition-all">
      {/* Left Sidebar - Desktop Only */}
      <div className="hidden md:block w-1/3 bg-[#1e40af] relative overflow-hidden">
        {/* Background Graphic Blueprint */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNWjPlH2_1CBBxVfWrviK8EzqCGSQ9VprCGT5Y4GjNLjpriD7dAZpethDMirekKwqCeorsE6b5--ebZIAeg3tYcq6-Omn4cLKrS4wLuBB56CW_CRsRAUYV6K1m0okWKvEk0ZshN2FBmd-yyOMTXhYq7p9WxZ6QGRDEKPez_FWoMiFcHRyIvtO1oz1mhtvImUm7hP1a-TO8ZV0qdJ9XzwcJpO99mn6sN1R0P2x9DhWsNK_geO7uHZHpv4iO8kZ4qNR-q5GLSNWMo28')` }}
        />
        {/* Branding Overlay */}
        <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white">
          <Shield className="w-10 h-10 mb-4 text-[#a8b8ff] fill-[#a8b8ff]/20" />
          <h2 className="text-xl font-bold tracking-tight leading-tight mb-2">Verify Your Expertise</h2>
          <p className="text-xs text-[#a8b8ff] leading-relaxed opacity-90">
            Join 15,000+ certified inspectors delivering accurate reports every day.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
        {/* Progress Stepper */}
        <div className="mb-8 select-none">
          <div className="flex items-center justify-between relative">
            {/* Progress line background */}
            <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-100 -translate-y-1/2" />
            
            {/* Active colored line */}
            <div 
              className="absolute top-5 left-0 h-[2px] bg-[#00288e] -translate-y-1/2 transition-all duration-500 ease-in-out"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />

            {/* Step 1 indicator */}
            <div className="relative z-10 flex flex-col items-center">
              <button 
                onClick={() => setStep(1)}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step >= 1 
                    ? 'bg-[#00288e] border-[#00288e] text-white' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <User className="w-5 h-5" />
              </button>
              <span className={`absolute -bottom-6 text-[10px] font-bold tracking-wide uppercase whitespace-nowrap transition-colors ${
                step >= 1 ? 'text-[#00288e]' : 'text-slate-400'
              }`}>
                Account Details
              </span>
            </div>

            {/* Step 2 indicator */}
            <div className="relative z-10 flex flex-col items-center">
              <button 
                onClick={() => setStep(2)}
                disabled={step < 2 && !fullName}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step >= 2 
                    ? 'bg-[#1e40af] border-[#00288e] text-white font-semibold' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <FileBadge className="w-5 h-5" />
              </button>
              <span className={`absolute -bottom-6 text-[10px] font-bold tracking-wide uppercase whitespace-nowrap transition-colors ${
                step >= 2 ? 'text-[#00288e]' : 'text-slate-400'
              }`}>
                Credentials
              </span>
            </div>

            {/* Step 3 indicator */}
            <div className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step === 3 
                    ? 'bg-[#00288e] border-[#00288e] text-white' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className={`absolute -bottom-6 text-[10px] font-bold tracking-wide uppercase whitespace-nowrap transition-colors ${
                step === 3 ? 'text-[#00288e]' : 'text-slate-400'
              }`}>
                Finish
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="mt-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Create Business Account</h3>
                <p className="text-sm text-slate-500">Provide basic agency details to launch your ProInspect setup.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Apex Property Inspections" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#dde1ff] focus:border-[#00288e] outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Monthly Volume</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#dde1ff] focus:border-[#00288e] outline-none transition-all">
                    <option>1 - 10 inspections / month</option>
                    <option>11 - 50 inspections / month</option>
                    <option>50+ inspections / month</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleContinue} className="space-y-5">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">Professional Credentials</h3>
                <p className="text-sm text-slate-500">Please provide your official license information for identity verification.</p>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="full-name">Full Name</label>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-1 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#dde1ff] focus-within:border-[#00288e] transition-all">
                    <User className="w-5 h-5 text-slate-400 shrink-0" />
                    <input 
                      id="full-name"
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Johnathan Doe" 
                      required
                      className="w-full bg-transparent border-none py-3 text-sm text-slate-900 focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>

                {/* License Number */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="license">License Number</label>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-1 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#dde1ff] focus-within:border-[#00288e] transition-all">
                    <Award className="w-5 h-5 text-slate-400 shrink-0" />
                    <input 
                      id="license"
                      type="text" 
                      value={license}
                      onChange={(e) => setLicense(e.target.value)}
                      placeholder="TX-12345678" 
                      required
                      className="w-full bg-transparent border-none py-3 text-sm text-slate-900 focus:outline-none focus:ring-0"
                    />
                  </div>
                  <span className="block text-[11px] text-slate-400 pl-1">
                    Verification is performed against state board registries.
                  </span>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="email">Business Email</label>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-1 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#dde1ff] focus-within:border-[#00288e] transition-all">
                    <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                    <input 
                      id="email"
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="j.doe@agency.com" 
                      required
                      className="w-full bg-transparent border-none py-3 text-sm text-slate-900 focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">Password</label>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-1 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#dde1ff] focus-within:border-[#00288e] transition-all">
                    <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                    <input 
                      id="password"
                      type={showPassword ? 'text' : 'password'} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••" 
                      required
                      className="w-full bg-transparent border-none py-3 text-sm text-slate-900 focus:outline-none focus:ring-0"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-2">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">License Successfully Verified!</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                We've matched <strong>{fullName}</strong> (License: <strong>{license}</strong>) with the State Board Registry.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-md mx-auto text-left space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Registry Status:</span>
                  <span className="font-semibold text-green-600">ACTIVE &amp; STANDING</span>
                </div>
                <div className="flex justify-between">
                  <span>Inspector Tier:</span>
                  <span className="font-semibold text-slate-800">Lead Certified Inspector</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Button Block */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row-reverse items-center justify-between gap-4">
          <button 
            type="button"
            onClick={handleContinue}
            disabled={isVerifying}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#00288e] hover:bg-[#1e40af] disabled:bg-slate-400 text-white font-medium rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying State Registry...
              </>
            ) : step === 3 ? (
              <>
                Enter Inspect Workspace
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {step > 1 && (
            <button 
              type="button"
              onClick={handlePrevious}
              className="w-full sm:w-auto px-6 py-3.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all rounded-xl border border-transparent hover:border-slate-200"
            >
              Previous Step
            </button>
          )}
        </div>

        {/* Footer sign in fallback */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Already have a professional account?{' '}
          <button 
            onClick={() => onRegisterSuccess({ fullName: 'Marcus Thompson', email: 'm.thompson@proinspect.com' })}
            className="text-[#00288e] font-bold hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
