import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, CheckCircle2, Lock, Mail, User } from 'lucide-react';
import { PersonalInfo } from '../types';

interface SignInViewProps {
  onSignInSuccess: (info: Partial<PersonalInfo>) => void;
  onNavigateToLanding: () => void;
}

export default function SignInView({ onSignInSuccess, onNavigateToLanding }: SignInViewProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (isSignUp && !fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (isSignUp && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (isSignUp && !agreeToTerms) {
      newErrors.terms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignInSuccess({
        fullName: isSignUp ? fullName : email.split('@')[0],
        email,
      });
    }, 1500);
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFullName('');
    setEmail('');
    setPassword('');
    setAgreeToTerms(false);
  };

  return (
    <div className="min-h-screen bg-[#fbf9ff] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 md:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#dde1ff] rounded-xl mb-4">
              <Lock className="w-6 h-6 text-[#00288e]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#00288e] mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-500 text-sm">
              {isSignUp 
                ? 'Join thousands of property inspectors' 
                : 'Sign in to your account to continue'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name Field - Only show in sign up */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl font-medium transition-all focus:outline-none ${
                      errors.fullName
                        ? 'border-red-300 bg-red-50 focus:border-red-500'
                        : 'border-slate-200 focus:border-[#00288e] focus:bg-blue-50/30'
                    }`}
                  />
                </div>
                {errors.fullName && <p className="text-red-600 text-xs mt-1.5 font-medium">{errors.fullName}</p>}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl font-medium transition-all focus:outline-none ${
                    errors.email
                      ? 'border-red-300 bg-red-50 focus:border-red-500'
                      : 'border-slate-200 focus:border-[#00288e] focus:bg-blue-50/30'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-600 text-xs mt-1.5 font-medium">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 border-2 rounded-xl font-medium transition-all focus:outline-none ${
                    errors.password
                      ? 'border-red-300 bg-red-50 focus:border-red-500'
                      : 'border-slate-200 focus:border-[#00288e] focus:bg-blue-50/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-xs mt-1.5 font-medium">{errors.password}</p>}
            </div>

            {/* Terms Checkbox - Only show in sign up */}
            {isSignUp && (
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 cursor-pointer accent-[#00288e] border-2 border-slate-300 rounded"
                />
                <label htmlFor="terms" className="flex-1 text-xs text-slate-600 font-medium cursor-pointer">
                  I agree to the{' '}
                  <a href="#" className="text-[#00288e] font-bold hover:underline">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-[#00288e] font-bold hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}
            {errors.terms && <p className="text-red-600 text-xs mt-1.5 font-medium">{errors.terms}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-[#00288e] hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-900/10 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600 mb-3">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={handleToggleMode}
              className="text-[#00288e] font-bold hover:underline transition-colors cursor-pointer"
            >
              {isSignUp ? 'Sign In' : 'Create One'}
            </button>
          </div>

          {/* Back to Landing */}
          <div className="mt-4 text-center">
            <button
              onClick={onNavigateToLanding}
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
