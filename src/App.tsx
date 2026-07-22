import React, { useState, useEffect } from 'react';
import { initialProfile } from './data';
import { PersonalInfo } from './types';
import ViewSelector from './components/ViewSelector';
import LandingView from './components/LandingView';
import SignInView from './components/SignInView';
import RegistrationView from './components/RegistrationView';
import DashboardView from './components/DashboardView';
import OnboardingView from './components/OnboardingView';
import PricingView from './components/PricingView';
import { Sparkles, Trophy, CheckCircle, Shield, Bell, X } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'signin' | 'registration' | 'dashboard' | 'onboarding' | 'pricing'>('landing');
  const [profile, setProfile] = useState<PersonalInfo>(initialProfile);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleToggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return nextTheme;
    });
  };

  // When a user successfully registers / verifies their license in Screen 1
  const handleRegisterSuccess = (info: Partial<PersonalInfo>) => {
    setProfile(prev => ({
      ...prev,
      fullName: info.fullName || prev.fullName,
      email: info.email || prev.email,
    }));
    // Take them to the Onboarding Checklist (Screen 3) to guide them further!
    setCurrentView('onboarding');
  };

  // When the user edits their profile details in Screen 2 settings
  const handleUpdateProfile = (updated: PersonalInfo) => {
    setProfile(updated);
  };

  // When a plan is selected from the pricing view
  const handlePlanSelected = (planName: string) => {
    setSelectedPlan(planName);
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      // Automatically send them to the active Dashboard
      setCurrentView('dashboard');
    }, 2500);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-[#030712] text-slate-100' : 'bg-[#fbf8ff]'}`}>
      {/* Visual Workspace Controller Selector */}
      <ViewSelector 
        currentView={currentView} 
        onViewChange={(view) => setCurrentView(view)} 
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main viewport */}
      <div className="flex-1 w-full animate-fade-in">
        {currentView === 'landing' && (
          <LandingView 
            onStartFreeTrial={() => setCurrentView('registration')}
            onNavigateToPricing={() => setCurrentView('pricing')}
            onSignIn={() => setCurrentView('signin')}
            onTriggerToast={(msg) => setToastMessage(msg)}
          />
        )}

        {currentView === 'signin' && (
          <SignInView 
            onSignInSuccess={(info) => {
              setProfile(prev => ({
                ...prev,
                fullName: info.fullName || prev.fullName,
                email: info.email || prev.email,
              }));
              setCurrentView('dashboard');
            }}
            onNavigateToLanding={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'registration' && (
          <div className="py-12 px-4 md:px-6">
            <RegistrationView onRegisterSuccess={handleRegisterSuccess} />
          </div>
        )}

        {currentView === 'onboarding' && (
          <div className="py-8 px-4 md:px-8">
            <OnboardingView 
              profile={profile} 
              onNavigateToSettings={() => setCurrentView('dashboard')}
              onNavigateToPricing={() => setCurrentView('pricing')}
            />
          </div>
        )}

        {currentView === 'dashboard' && (
          <DashboardView 
            profile={profile} 
            onUpdateProfile={handleUpdateProfile}
            onSignOut={() => {
              setProfile(initialProfile);
              setCurrentView('landing');
            }}
          />
        )}

        {currentView === 'pricing' && (
          <div className="py-12 px-4 md:px-8 lg:px-12">
            <PricingView onPlanSelected={handlePlanSelected} />
          </div>
        )}
      </div>

      {/* Interactive Plan Purchase Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm text-center space-y-5 border border-slate-200 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-blue-100 rounded-full blur-xl" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-green-100 rounded-full blur-xl" />
            
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#00288e] animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
            
            <div className="space-y-2 relative z-10">
              <h3 className="text-xl font-black text-slate-900">Congratulations!</h3>
              <p className="text-sm text-slate-500">
                You've successfully subscribed to the <strong>{selectedPlan} Plan</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 border border-slate-100 space-y-1 text-left">
              <div className="flex justify-between font-medium">
                <span>Account Sync:</span>
                <span className="text-green-600 font-bold">ACTIVE</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Cloud Storage:</span>
                <span className="text-slate-900 font-bold">10GB Provisioned</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 animate-pulse">
              Redirecting to your active Workspace dashboard...
            </p>
          </div>
        </div>
      )}
      {/* Success Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[200] max-w-sm bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-slide-in">
          <div className="p-1.5 bg-blue-950/80 text-[#dde1ff] rounded-lg shrink-0 border border-blue-900/40">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex-1 space-y-0.5">
            <p className="text-xs font-black tracking-wide uppercase text-blue-300">System Dispatch Alert</p>
            <p className="text-xs text-slate-200 leading-normal font-medium">{toastMessage}</p>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
