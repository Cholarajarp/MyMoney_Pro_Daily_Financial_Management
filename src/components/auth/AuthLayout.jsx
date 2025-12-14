import React from 'react';
import { Wallet, Sparkles } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white dark:bg-slate-400 rounded-full opacity-30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo and Branding - ENHANCED WITH APP ICON */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="inline-flex items-center justify-center mb-4 relative group">
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 animate-pulse"></div>

              {/* Glass morphism container */}
              <div className="relative backdrop-blur-xl bg-white/10 dark:bg-slate-800/10 p-2 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 transform hover:scale-110 transition-all duration-500 group-hover:rotate-6">
                {/* App Icon */}
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="/app-icon.png"
                    alt="MyMoney Pro"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to Wallet icon if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center bg-gradient-to-tr from-blue-600 to-purple-600">
                    <Wallet className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Sparkle effects */}
              <Sparkles className="absolute -top-3 -right-3 w-7 h-7 text-yellow-400 animate-spin-slow drop-shadow-lg" />
              <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-blue-400 animate-spin-slow drop-shadow-lg" style={{ animationDelay: '1s' }} />
            </div>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 drop-shadow-sm">
              MyMoney Pro
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
              Master your finances with confidence
            </p>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Secure • Private • AI-Powered</span>
            </div>
          </div>

          {/* Auth Form Container */}
          {children}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>&copy; 2025 MyMoney Pro. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

