import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Mail, Lock, UserPlus, User, Chrome, Apple, Check, X } from 'lucide-react';

const SignupForm = ({ onRegister, onSwitchToLogin, loading, error, onOpenModal }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailValid, setEmailValid] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });


  // Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (value.length > 0) {
      setEmailValid(validateEmail(value));
    } else {
      setEmailValid(null);
    }
  };

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, text: '', color: '' };

    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Determine strength
    if (score <= 2) return { score, text: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, text: 'Fair', color: 'bg-yellow-500' };
    if (score <= 5) return { score, text: 'Good', color: 'bg-blue-500' };
    return { score, text: 'Strong', color: 'bg-green-500' };
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!validateEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (passwordStrength.score < 3) {
      alert('Please choose a stronger password');
      return;
    }

    if (!agreedToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    await onRegister(username, password, email);
  };

  return (
    <div className="animate-fade-in-up">
      {/* Glass Morphism Card */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 transition-all duration-300 hover:shadow-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Create Account
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Join us and start managing your finances
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}



        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Username
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                className={`w-full pl-12 pr-12 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border ${
                  emailValid === false ? 'border-red-500' : emailValid === true ? 'border-green-500' : 'border-slate-300 dark:border-slate-600'
                } text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400`}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
              />
              {emailValid !== null && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {emailValid ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs font-semibold ${
                    passwordStrength.score <= 2 ? 'text-red-500' :
                    passwordStrength.score <= 4 ? 'text-yellow-500' :
                    passwordStrength.score <= 5 ? 'text-blue-500' : 'text-green-500'
                  }`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <li className={password.length >= 8 ? 'text-green-500' : ''}>
                    {password.length >= 8 ? '✓' : '○'} At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-500' : ''}>
                    {/[A-Z]/.test(password) && /[a-z]/.test(password) ? '✓' : '○'} Upper & lowercase letters
                  </li>
                  <li className={/[0-9]/.test(password) ? 'text-green-500' : ''}>
                    {/[0-9]/.test(password) ? '✓' : '○'} At least one number
                  </li>
                  <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-500' : ''}>
                    {/[^a-zA-Z0-9]/.test(password) ? '✓' : '○'} Special character (!@#$%)
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Confirm Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className={`w-full pl-12 pr-12 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border ${
                  confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                } text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          {/* Terms of Service */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
              I agree to the{' '}
              <button type="button" onClick={() => onOpenModal('terms')} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold bg-transparent border-none cursor-pointer">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" onClick={() => onOpenModal('privacy')} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold bg-transparent border-none cursor-pointer">
                Privacy Policy
              </button>
            </label>

            {/* Support link */}
            <div className="w-full text-sm mt-2 text-slate-500 dark:text-slate-400">
              Need help? <a href="mailto:ccholarajarp@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Support</a>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !agreedToTerms}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors hover:underline"
            >
              Sign in instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;

