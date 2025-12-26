import React from 'react';
import { Wallet, Sparkles, X } from 'lucide-react';

const AuthLayout = ({ children, modalType, setModalType }) => {
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
              <button onClick={() => setModalType('privacy')} className="hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer text-sm text-slate-500 dark:text-slate-400">Privacy</button>
              <span>•</span>
              <button onClick={() => setModalType('terms')} className="hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer text-sm text-slate-500 dark:text-slate-400">Terms</button>
              <span>•</span>
              <a href="mailto:ccholarajarp@gmail.com" className="hover:text-blue-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{modalType === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}</h2>
              <button onClick={() => setModalType(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {modalType === 'privacy' ? (
                <div>
                  <p>Your privacy is important to us. This Privacy Policy explains how MyMoney Pro, a personal finance management application, collects, uses, and protects your personal information.</p>
                  <h3 className="font-semibold mt-2">Information We Collect</h3>
                  <p>We collect information you provide directly, such as when you create an account, add transactions, set budgets, or track investments. This includes financial data like transaction amounts, categories, dates, and account balances.</p>
                  <h3 className="font-semibold mt-2">How We Use Your Information</h3>
                  <p>We use your information to provide and improve our financial management services, including budgeting tools, expense tracking, investment monitoring, and personalized financial insights. We may also use aggregated, anonymized data to enhance app features.</p>
                  <h3 className="font-semibold mt-2">Data Security</h3>
                  <p>We implement appropriate security measures to protect your personal and financial information against unauthorized access, alteration, disclosure, or destruction. Your data is encrypted and stored securely.</p>
                  <h3 className="font-semibold mt-2">Data Sharing</h3>
                  <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or to provide the services you request.</p>
                  <p>For more details, contact us at ccholarajarp@gmail.com</p>
                </div>
              ) : (
                <div>
                  <p>By using MyMoney Pro, a comprehensive personal finance management application, you agree to these Terms of Service.</p>
                  <h3 className="font-semibold mt-2">Use of Service</h3>
                  <p>You agree to use the service only for lawful purposes and in accordance with these terms. MyMoney Pro is designed for personal financial tracking, budgeting, and investment monitoring.</p>
                  <h3 className="font-semibold mt-2">User Accounts</h3>
                  <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                  <h3 className="font-semibold mt-2">Financial Data</h3>
                  <p>You acknowledge that you are responsible for the accuracy of financial data entered into the app. MyMoney Pro provides tools to help manage your finances but does not guarantee financial outcomes.</p>
                  <h3 className="font-semibold mt-2">Limitation of Liability</h3>
                  <p>MyMoney Pro is provided "as is" without warranties. We are not liable for any financial losses, damages, or decisions made based on the information provided by the app.</p>
                  <p>For questions, contact us at ccholarajarp@gmail.com</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthLayout;

