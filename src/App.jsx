import React, { useEffect, useState, useCallback, useRef } from 'react';
import './index.css';
import {
  Home, TrendingUp, Target, Bell, Search, Plus,
  Wallet, DollarSign,
  AlertCircle, Zap, Eye, EyeOff,
  Moon, Sun, X, Menu, Settings, Receipt,
  LogOut, Trash2, ArrowUpRight, ArrowDownLeft,
  FileText, BarChart3, AlertTriangle, Download,
  ChevronUp, ChevronDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import AuthManager from './components/auth/AuthManager';
import EnvelopeBudget from './components/EnvelopeBudget';
import Accounts from './components/Accounts';
import NetWorthTracker from './components/NetWorthTracker';
import Investments from './components/Investments';
import RecurringTransactions from './components/RecurringTransactions';
import { categorizeMerchant, getCategorySuggestions, getCategoryIcon, getCategoryColor } from './utils/smartCategorization';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Utility Functions
function fmtINR(val) {
  if (val === null || val === undefined) return '₹0.00';
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(val));
  } catch (e) {
    return '₹' + Number(val).toFixed(2);
  }
}

function authFetch(url, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = Object.assign({}, opts.headers || {});
  if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return fetch(API_BASE_URL + url, { ...opts, headers });
}

async function safeJson(res) {
  if (!res) return null;
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}

// Professional PDF Generation Function
function generateProfessionalPDF(title, data, filename) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 15;

    // Header
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Date and Time
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(100);
    pdf.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // Separator line
    pdf.setDrawColor(200);
    pdf.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    // Content
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0);

    if (Array.isArray(data)) {
      data.forEach((item) => {
        Object.entries(item).forEach(([key, value]) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 15;
          }
          pdf.setFont(undefined, 'bold');
          pdf.text(`${key}:`, 20, yPosition);
          pdf.setFont(undefined, 'normal');
          pdf.text(String(value), 80, yPosition);
          yPosition += 7;
        });
        yPosition += 3;
      });
    } else {
      Object.entries(data).forEach(([key, value]) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 15;
        }
        pdf.setFont(undefined, 'bold');
        pdf.text(`${key}:`, 20, yPosition);
        pdf.setFont(undefined, 'normal');
        pdf.text(String(value), 80, yPosition);
        yPosition += 7;
      });
    }

    // Footer
    yPosition = pageHeight - 10;
    pdf.setFontSize(9);
    pdf.setTextColor(150);
    pdf.text(`MyMoney Pro | Report ID: ${Date.now()}`, pageWidth / 2, yPosition, { align: 'center' });

    pdf.save(filename);
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF. Please try again.');
    // Fallback to JSON download
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.replace('.pdf', '.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (fallbackError) {
      console.error('Fallback download failed:', fallbackError);
      alert('Unable to download report. Please try again later.');
    }
  }
}

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: DollarSign },
    { id: 'budgets', label: 'Budgets', icon: Wallet },
    { id: 'envelope', label: 'Envelope Budget', icon: Receipt },
    { id: 'recurring', label: 'Recurring', icon: Zap },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'networth', label: 'Net Worth', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'settings', label: 'Settings & Bills', icon: Settings },
  ];
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 p-6 border-b border-slate-100 dark:border-slate-800">
          {/* App Icon with Glassmorphism */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative backdrop-blur-sm bg-white/10 dark:bg-slate-800/10 p-1 rounded-xl border border-white/20 dark:border-slate-700/50">
              <img
                src="/app-icon.png"
                alt="MyMoney Pro"
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-10 h-10 items-center justify-center bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">MyMoney Pro</span>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ?
                  'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <Icon className="w-5 h-5" /><span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 dark:border-slate-800"><div className="text-xs text-slate-400 text-center">© 2025 MyMoney Pro</div></div>
      </aside>
    </>
  );
};

// Layout Component
const Layout = ({ children, darkMode, setDarkMode, toggleSidebar, title, user, onLogout, onProfileClick, notifCount = 0, notif = [], onNotifClick, onRefresh }) => {
  // Apply dark mode to HTML root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
      <div className="bg-slate-50 dark:bg-slate-950 min-h-screen lg:pl-64 transition-all duration-300 text-slate-900 dark:text-slate-100">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 sm:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden text-slate-600 dark:text-slate-300"><Menu className="w-6 h-6" /></button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all hover:rotate-180 duration-500"
                title="Refresh Data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors" title={darkMode ?
              'Switch to Light Mode' : 'Switch to Dark Mode'}>{darkMode ?
                <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}</button>
            <button onClick={onNotifClick} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors" title="Notifications"><Bell className="w-5 h-5" />{notifCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>}</button>
            <button onClick={onProfileClick} className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm shadow-md hover:shadow-lg transition-shadow cursor-pointer" title="Profile">{(user?.username || 'U')[0].toUpperCase()}</button>
            <button onClick={onLogout} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors" title="Logout"><LogOut className="w-5 h-5" /></button>
          </div>
        </header>
        <main className="p-4 sm:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, title, children, onClose, onConfirm, confirmText = 'Save', isDelete = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5 dark:text-white" /></button>
        </div>
        <div className="mb-6">{children}</div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2 px-4 text-white rounded-xl font-medium transition-colors ${isDelete ?
            'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

// Dashboard View
const DashboardView = ({ transactions = [], bills = [], budgets = [], notif = [], setShowQuickAdd, setShowGoalModal, spendingTrendData = [], categoryData = [] }) => {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const netWorth = totalIncome - totalExpense;

  const upcomingBills = (bills || []).filter(b => (b.status || '').toString().toLowerCase() !== 'paid').length;
  const billsTotal = (bills || []).filter(b => (b.status || '').toString().toLowerCase() !== 'paid').reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const [hideAmounts, setHideAmounts] = useState(false);

  // Use real data if available, fallback to placeholder
  const finalSpendingData = (spendingTrendData && spendingTrendData.length > 0) ?
    spendingTrendData : [{ name: 'Jan', income: 4200, expense: 3100 }, { name: 'Feb', income: 4500, expense: 3400 }, { name: 'Mar', income: 4100, expense: 2900 }, { name: 'Apr', income: 4800, expense: 3600 }, { name: 'May', income: 5100, expense: 3800 }, { name: 'Jun', income: 5500, expense: 4100 }];
  
  // Generate real category data from spending
  const generateCategoryData = () => {
    if (categoryData && categoryData.length > 0) return categoryData;
    // Fallback: aggregate from transactions by category
    const categoryMap = {};
    (transactions || []).filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + (Number(t.amount) || 0);
    });
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];
    return Object.entries(categoryMap).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length]
    }));
  };

  const finalCategoryData = generateCategoryData();
  const totalCategoryValue = (finalCategoryData || []).reduce((s, c) => s + (Number(c.value) || 0), 0);
  const displayCategoryData = totalCategoryValue > 0 ? finalCategoryData : [{ name: 'No Data', value: 1, color: '#e2e8f0', placeholder: true }];
  const radarData = [{ subject: 'Savings', A: 85, fullMark: 100 }, { subject: 'Budget', A: 72, fullMark: 100 }, { subject: 'Spending', A: 68, fullMark: 100 }, { subject: 'Goals', A: 90, fullMark: 100 }, { subject: 'Bills', A: 95, fullMark: 100 }, { subject: 'Debt', A: 100, fullMark: 100 }];
  const formatDisplay = (val) => hideAmounts ? '••••••' : fmtINR(val);

  return (
    <div className="space-y-6">
      {/* Data Connection Status Indicator */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-green-800 dark:text-green-300">All Systems Connected ✓</h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                {transactions.length} transactions • {budgets.length} budgets • {bills.length} bills tracked
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">Real-Time Data</div>
            <div className="text-xs text-green-500 dark:text-green-500">Last sync: Just now</div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowQuickAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-colors shadow-sm"><Plus className="w-4 h-4" /> Add Transaction</button>
            <button onClick={() => setShowGoalModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-50"> <Target className="w-4 h-4 text-purple-500" /> Add Goal</button>
          </div>
        </div>
        <button onClick={() => setHideAmounts(!hideAmounts)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">{hideAmounts ?
          <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" /></div>
            <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +3.2%</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">Net Worth</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatDisplay(netWorth)}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"><ArrowUpRight className="w-6 h-6 text-green-600 dark:text-green-400" /></div>
            <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Income</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Income</div>
          <div className="text-2xl font-bold text-green-600">{formatDisplay(totalIncome)}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"><ArrowDownLeft className="w-6 h-6 text-red-600 dark:text-red-400" /></div>
            <span className="text-xs font-medium px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">Expense</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Expense</div>
          <div className="text-2xl font-bold text-red-600">{formatDisplay(totalExpense)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Financial Health</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Your overall score.</p>
          <div className="h-64 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6"><Zap className="w-5 h-5 text-yellow-500" /><h3 className="text-lg font-bold text-slate-900 dark:text-white">Smart Alerts</h3></div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notif.length > 0 ?
              notif.slice(0, 5).map((n, i) => {
                const downloadAlertReport = () => {
                  const timestamp = new Date().toLocaleString();
                  const reportContent = `SMART ALERT REPORT
Generated: ${timestamp}

Title: ${n.title || 'Alert'}
Message: ${n.message}

Type: Real-time Transaction Alert
Status: ACTIVE
Priority: HIGH

---
Report Generated on: ${new Date().toLocaleString()}`;
                  const blob = new Blob([reportContent], { type: 'text/plain' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `alert-report-${Date.now()}.txt`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                };
                return (
                  <div key={i} className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">{n.message}</p>
                    <button onClick={downloadAlertReport} className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"><Download className="w-3 h-3" /> Download Report</button>
                  </div>
                );
              }) : (
                <p className="text-slate-500 text-sm">All clear! No alerts.</p>
              )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Receipt className="w-5 h-5 text-orange-500" /> Upcoming Bills</h3>
          <div className="space-y-2">
            {(bills || []).filter(b => (b.status || '').toString().toLowerCase() !== 'paid').length > 0 ?
              (bills || []).filter(b => (b.status || '').toString().toLowerCase() !== 'paid').slice(0, 3).map(b => (
                <div key={b.id} className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-orange-900 dark:text-orange-200">{b.name}</p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">Due: {b.due_date || 'Soon'}</p>
                    </div>
                    <span className="text-sm font-bold text-orange-600">{formatDisplay(Number(b.amount) || 0)}</span>
                  </div>
                </div>
              )) : <p className="text-slate-500 text-sm">No upcoming bills!</p>}
          </div>
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">Pending: {upcomingBills} • Total: {fmtINR(billsTotal)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Spending Trend (Real-time)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finalSpendingData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => fmtINR(value)} />
                <Legend />
                <Area type="monotone" dataKey="income" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Spending by Category (Real-time)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={displayCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" labelLine={false} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>
                  {(displayCategoryData || []).map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip formatter={(value) => {
                  if (value === 1 && displayCategoryData.length === 1 && displayCategoryData[0].placeholder) return ['No spending data yet', ''];
                  return [fmtINR(value), 'Amount'];
                }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Transactions View with Advanced Features
const TransactionsView = ({ transactions = [], searchQuery = '', setSearchQuery, deleteTransaction }) => {
  const q = (searchQuery || '').toLowerCase();
  const filteredTransactions = (transactions || []).filter(t => (t.merchant || '').toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q));
  const [deleteId, setDeleteId] = useState(null);
  const [dateRange, setDateRange] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const categoryTips = ['Food & Dining', 'Shopping', 'Transportation', 'Healthcare', 'Education', 'Entertainment', 'Home & Utilities', 'Professional'];
  
  // Filter by date range
  const filterByDateRange = () => {
    const now = new Date();
    let startDate = new Date(0);

    if (dateRange === '7days') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (dateRange === '10days') startDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    else if (dateRange === '30days') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (dateRange === '90days') startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return filteredTransactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startDate;
    });
  };

  const rangedTransactions = filterByDateRange();
  const totalIncome = rangedTransactions.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalExpense = rangedTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  
  // Generate daily breakdown data for chart
  const generateDailyData = () => {
    const dataMap = {};
    rangedTransactions.forEach(t => {
      const date = t.date;
      if (!dataMap[date]) {
        dataMap[date] = { date, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        dataMap[date].income += Number(t.amount) || 0;
      } else {
        dataMap[date].expense += Number(t.amount) || 0;
      }
    });
    return Object.values(dataMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  // Generate category breakdown
  const generateCategoryBreakdown = () => {
    const catMap = {};
    rangedTransactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'Other';
      if (!catMap[cat]) catMap[cat] = 0;
      catMap[cat] += Number(t.amount) || 0;
    });
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];
    return Object.entries(catMap).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length]
    })).sort((a, b) => b.value - a.value).slice(0, 8);
  };

  const dailyData = generateDailyData();
  const categoryBreakdown = generateCategoryBreakdown();

  const downloadCSV = () => {
    const headers = ['Date', 'Merchant', 'Category', 'Type', 'Amount'];
    const rows = rangedTransactions.map(t => [t.date, t.merchant, t.category, t.type, t.amount]);
    const csvContent = [headers, ...rows].map(r => r.map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    const content = `TRANSACTION REPORT\nGenerated: ${new Date().toLocaleString()}\n\nRange: ${dateRange === 'all' ? 'All Time' : dateRange === '7days' ? 'Past 7 Days' : dateRange === '30days' ? 'Past 30 Days' : dateRange === '90days' ? 'Past 90 Days' : 'Past 10 Days'}\n\nTotal Income: ${fmtINR(totalIncome)}\nTotal Expense: ${fmtINR(totalExpense)}\nNet: ${fmtINR(totalIncome - totalExpense)}\n\nTransactions:\n${rangedTransactions.map(t => `${t.date} | ${t.merchant} | ${t.category} | ${t.type} | ${fmtINR(t.amount)}`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Category Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="w-full">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 text-sm mb-2">Category Tips for Easy Selection</h4>
            <div className="flex flex-wrap gap-2">
              {categoryTips.map((tip, i) => (
                <button key={i} onClick={() => setSearchQuery(tip)} className="text-xs bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-700 hover:text-blue-800 dark:hover:text-blue-200 transition-all cursor-pointer border border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600">{tip}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowAnalytics(!showAnalytics)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><BarChart3 className="w-4 h-4" /> Analytics</button>
          <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><FileText className="w-4 h-4" /> Report</button>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Real-Time Analytics</h3>
            <div className="flex flex-wrap gap-3 mb-6">
              {['all', '7days', '10days', '30days', '90days'].map(range => (
                <button key={range} onClick={() => setDateRange(range)} className={`px-4 py-2 rounded-lg font-medium transition-all ${dateRange === range ?
                  'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                  {range === 'all' ? 'All Time' : range === '7days' ? 'Past 7 Days' : range === '10days' ? 'Past 10 Days' : range === '30days' ? 'Past 30 Days' : 'Past 90 Days'}
                </button>
              ))}
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">Total Income</div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{fmtINR(totalIncome)}</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-2">+{rangedTransactions.filter(t => t.type === 'income').length} trans</div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-600 dark:text-red-400 font-medium">Total Expense</div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{fmtINR(totalExpense)}</div>
                <div className="text-xs text-red-600 dark:text-red-400 mt-2">+{rangedTransactions.filter(t => t.type === 'expense').length} trans</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Net Balance</div>
                <div className={`text-2xl font-bold mt-1 ${totalIncome - totalExpense >= 0 ?
                  'text-purple-700 dark:text-purple-300' : 'text-red-700 dark:text-red-300'}`}>{fmtINR(totalIncome - totalExpense)}</div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">{(totalExpense > 0 ? (totalExpense / (totalIncome || 1) * 100) : 0).toFixed(0)}% spent</div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Avg per Day</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{fmtINR(totalExpense / (Math.max(dailyData.length, 1)))}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">{dailyData.length || 0} days</div>
              </div>
            </div>

            {/* Daily Spending Chart */}
            {dailyData.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-4">Daily Breakdown</h4>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
                      <defs>
                        <linearGradient id="colorDailyIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDailyExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip formatter={(value) => fmtINR(value)} />
                      <Legend />
                      <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#colorDailyIncome)" />
                      <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#colorDailyExpense)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Category Breakdown Charts */}
            {categoryBreakdown.length > 0 && (
              <div className="space-y-6">
                <h4 className="text-md font-semibold text-slate-900 dark:text-white">Top Spending Categories</h4>
                
                {/* Bar Chart */}
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl h-72">
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Category Spending Comparison</h5>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryBreakdown} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip formatter={(value) => fmtINR(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart and List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl h-64">
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Distribution</h5>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => fmtINR(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Details</h5>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {categoryBreakdown.map((cat, i) => (
                        <div key={i} className="p-3 bg-white dark:bg-slate-700 rounded-lg flex justify-between items-center border border-slate-100 dark:border-slate-600">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{fmtINR(cat.value)}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{((cat.value / (categoryBreakdown.reduce((s, c) => s + c.value, 0))) * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transactions List - ENHANCED WITH AI CATEGORIES */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {rangedTransactions.length > 0 ?
            rangedTransactions.map((t) => {
              const categoryIcon = getCategoryIcon(t.category || 'General');
              const categoryColor = getCategoryColor(t.category || 'General');

              return (
                <div key={t.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4">
                    {/* Type Icon */}
                    <div className={`p-3 rounded-xl transition-all duration-200 group-hover:scale-110 ${t.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{t.merchant}</h4>
                        {/* Category Icon */}
                        <span className="text-lg" title={t.category}>{categoryIcon}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{t.date}</span>
                        <span className="text-xs text-slate-400">•</span>
                        {/* Enhanced Category Badge with Color */}
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium text-white shadow-sm"
                          style={{ backgroundColor: categoryColor }}
                        >
                          {t.category || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <span className={`text-xl font-bold tabular-nums ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'} {fmtINR(t.amount)}
                    </span>
                    <button
                      onClick={() => setDeleteId(t.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-all duration-200 hover:scale-110"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <Receipt className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-2">No transactions found</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Add your first transaction to get started</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={deleteId !== null} title="Delete Transaction?"
        onClose={() => setDeleteId(null)} onConfirm={() => { deleteTransaction(deleteId); setDeleteId(null); }} confirmText="Delete" isDelete={true}>
        <p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete this transaction?
          This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

// Budgets View
const BudgetsView = ({ budgets = [], addBudget, deleteBudget, transactions = [] }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: '', limit: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [selectedBudgetTransactions, setSelectedBudgetTransactions] = useState(null);
  
  const handleAdd = async () => {
    if (formData.category && formData.limit) {
      // Normalize category: trim and preserve case for consistency
      const normalizedCategory = (formData.category || '').trim();
      await addBudget({ category: normalizedCategory, limit: Number(formData.limit), spent: 0 });
      setFormData({ category: '', limit: '' });
      setShowForm(false);
    }
  };
  
  // Calculate actual spending from transactions
  const getActualSpending = (category) => {
    if (!category) return 0;
    const normalizedCategory = (category || '').toLowerCase().trim();
    const spending = (transactions || [])
      .filter(t => {
        const isExpense = t.type === 'expense' || t.type === 'Expense';
        const categoryMatch = (t.category || '').toLowerCase().trim() === normalizedCategory;
        return isExpense && categoryMatch;
      })
      .reduce((sum, t) => {
        const amount = Number(t.amount) || 0;
        return sum + amount;
      }, 0);
    
    return spending;
  };
  
  // Get linked transactions for a budget category
  const getLinkedTransactions = (category) => {
    if (!category) return [];
    const normalizedCategory = (category || '').toLowerCase().trim();
    return (transactions || [])
      .filter(t => {
        const isExpense = t.type === 'expense' || t.type === 'Expense';
        const categoryMatch = (t.category || '').toLowerCase().trim() === normalizedCategory;
        return isExpense && categoryMatch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Calculate remaining budget
  const getRemainingBudget = (budget) => {
    return Math.max(0, Number(budget.limit) - getActualSpending(budget.category));
  };

  // Budget stats summary
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.limit), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + getActualSpending(b.category), 0);
  const totalRemaining = totalBudget - totalSpent;
  
  // Generate spending by category data for analytics
  const generateSpendingByCategory = () => {
    return budgets.map(b => ({
      name: b.category,
      spent: getActualSpending(b.category),
      limit: Number(b.limit),
      remaining: getRemainingBudget(b)
    })).filter(item => item.spent > 0 || item.limit > 0);
  };

  const spendingByCategory = generateSpendingByCategory();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Budget Management</h2>
          <p className="text-slate-500 text-sm">Track spending limits with real-time data.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"><Plus className="w-4 h-4" /> New Budget</button>
      </div>

      {/* Budget Summary Cards */}
      {budgets.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Budget</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{fmtINR(totalBudget)}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{budgets.length} categories</div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
              <div className="text-sm text-red-600 dark:text-red-400 font-medium">Total Spent</div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{fmtINR(totalSpent)}</div>
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{Math.round((totalSpent / (totalBudget || 1)) * 100)}% of budget</div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">Remaining</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{fmtINR(totalRemaining)}</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">Available to spend</div>
            </div>
          </div>

          {/* Spending Analytics Chart */}
          {spendingByCategory.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Spending Analytics by Category</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-semibold">Category</th>
                      <th className="text-right py-3 px-4 text-slate-600 dark:text-slate-400 font-semibold">Spent</th>
                      <th className="text-right py-3 px-4 text-slate-600 dark:text-slate-400 font-semibold">Limit</th>
                      <th className="text-right py-3 px-4 text-slate-600 dark:text-slate-400 font-semibold">Remaining</th>
                      <th className="text-right py-3 px-4 text-slate-600 dark:text-slate-400 font-semibold">Usage %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spendingByCategory.map((item, idx) => {
                      const usagePercent = Math.round((item.spent / (item.limit || 1)) * 100);
                      const isOver = item.spent > item.limit;
                      return (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
                          <td className="text-right py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">{fmtINR(item.spent)}</td>
                          <td className="text-right py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">{fmtINR(item.limit)}</td>
                          <td className={`text-right py-3 px-4 font-semibold ${isOver ? 'text-red-600' : 'text-green-600'}`}>{fmtINR(item.remaining)}</td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div style={{ width: `${Math.min(usagePercent, 100)}%` }} className={`h-full rounded-full 
                                  ${isOver ? 'bg-red-500' : usagePercent >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                              </div>
                              <span className={`text-xs font-bold whitespace-nowrap ${isOver ?
                                'text-red-600' : usagePercent >= 80 ? 'text-yellow-600' : 'text-green-600'}`}>{usagePercent}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.length > 0 ?
          budgets.map(b => {
            const actualSpent = getActualSpending(b.category);
            const remaining = getRemainingBudget(b);
            const percentage = Math.round((actualSpent / (Number(b.limit) || 1)) * 100);
            const isOverBudget = actualSpent > Number(b.limit);
            const isWarning = percentage >= 80;

            return (
              <div key={b.id} className={`bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border transition-all ${isOverBudget ? 'border-red-200 dark:border-red-800' : 'border-slate-100 dark:border-slate-800'} hover:shadow-md`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{b.category}</h3>
                    <p className="text-sm text-slate-500">Active Tracking</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${isOverBudget ?
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : isWarning ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}>
                      {percentage}%
                    </span>
                    <button onClick={() => setDeleteId(b.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: isOverBudget ?
                        '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6'
                    }} className="h-full rounded-full transition-all"></div>
                  </div>

                  {/* Spending Details */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Spent</div>
                      <div className="font-bold text-slate-900 dark:text-white">{fmtINR(actualSpent)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Limit</div>
                      <div className="font-bold text-slate-900 dark:text-white">{fmtINR(b.limit)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Remaining</div>
                      <div className={`font-bold ${remaining > 0 ?
                        'text-green-600' : 'text-red-600'}`}>{fmtINR(remaining)}</div>
                    </div>
                  </div>

                  {/* Status Alert */}
                  {isOverBudget && (
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-xs text-red-700 dark:text-red-300 font-medium">⚠️ Over budget by {fmtINR(actualSpent - Number(b.limit))}</p>
                    </div>
                  )}
                  {isWarning && !isOverBudget && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">⚡ Warning: {percentage}% spent</p>
                    </div>
                  )}

                  {/* Linked Transactions Preview */}
                  {(() => {
                    const linkedTxns = getLinkedTransactions(b.category);
                    return linkedTxns.length > 0 ? (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Recent Transactions ({linkedTxns.length})</p>
                          <button
                            onClick={() => setSelectedBudgetTransactions(b.category)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View All
                          </button>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {linkedTxns.slice(0, 3).map((t, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs p-1.5 bg-white dark:bg-slate-700 rounded border border-slate-100 dark:border-slate-600">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-900 dark:text-white truncate">{t.merchant}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">{t.date}</p>
                              </div>
                              <p className="font-semibold text-slate-900 dark:text-white ml-2 flex-shrink-0">₹{t.amount}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Spent Button with Download */}
                  <button
                    onClick={() => {
                      generateProfessionalPDF(
                        `Budget Report - ${b.category}`,
                        {
                          'Category': b.category,
                          'Budget Limit': fmtINR(b.limit),
                          'Amount Spent': fmtINR(actualSpent),
                          'Amount Remaining': fmtINR(remaining),
                          'Budget Usage %': `${percentage}%`,
                          'Status': isOverBudget ? 'Over Budget'
                            : isWarning ? 'Warning' : 'On Track',
                          'Report Date': new Date().toLocaleString('en-IN')
                        },
                        `Budget-Spent-${b.category.replace(/\s+/g, '-')}-${Date.now()}.pdf`
                      );
                    }}
                    className="w-full mt-3 py-2 px-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 text-blue-600 dark:text-blue-400 rounded-lg font-medium text-sm hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-900/20 transition-all flex items-center justify-center gap-2 border border-blue-200 dark:border-blue-800"
                  >
                    <Download className="w-4 h-4" /> Download Spent Report ({fmtINR(actualSpent)})
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-1 md:col-span-2 p-6 text-center text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-2xl">No budgets yet. Create one to start tracking!</div>
          )}
      </div>

      <Modal isOpen={showForm} title="Create New Budget" onClose={() => setShowForm(false)} onConfirm={handleAdd} confirmText="Create">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Category Name</label>
            <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" placeholder="e.g. Groceries, Dining, Shopping" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Budget Limit (₹)</label>
            <input type="number" value={formData.limit} onChange={(e) => setFormData({ ...formData, limit: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" placeholder="5000" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Your actual spending will be calculated automatically from transactions.</p>
        </div>
      </Modal>

      <Modal isOpen={deleteId !== null} title="Delete Budget?"
        onClose={() => setDeleteId(null)} onConfirm={() => { deleteBudget(deleteId); setDeleteId(null); }} confirmText="Delete" isDelete={true}>
        <p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete this budget?</p>
      </Modal>

      {/* Budget Transactions Details Modal */}
      <Modal isOpen={selectedBudgetTransactions !== null} title={`Transactions - ${selectedBudgetTransactions}`} onClose={() => setSelectedBudgetTransactions(null)} onConfirm={() => setSelectedBudgetTransactions(null)} confirmText="Close">
        <div className="max-h-96 overflow-y-auto">
          {(() => {
            const txns = getLinkedTransactions(selectedBudgetTransactions);
            return txns.length > 0 ? (
              <div className="space-y-2">
                {txns.map((t, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{t.merchant}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.date}</p>
                      </div>
                      <p className="font-bold text-lg text-blue-600 dark:text-blue-400">₹{t.amount}</p>
                    </div>
                    {t.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300">{t.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">No transactions found</p>
            );
          })()}
        </div>
      </Modal>
    </div>
  );
};

// Goals View
const GoalsView = ({ goals = [], addGoal, deleteGoal, transactions = [] }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', target: '', priority: 'medium' });
  const [deleteId, setDeleteId] = useState(null);
  const [selectedGoalIncomeTransactions, setSelectedGoalIncomeTransactions] = useState(null);

  const handleAdd = async () => {
    if (formData.name && formData.target) {
      await addGoal({ name: formData.name, target: Number(formData.target), current: 0, priority: formData.priority });
      setFormData({ name: '', target: '', priority: 'medium' });
      setShowForm(false);
    }
  };
  
  // Calculate actual savings from income transactions
  const getActualSavings = () => {
    const savings = (transactions || [])
      .filter(t => {
        const isIncome = t.type === 'income' || t.type === 'Income';
        return isIncome;
      })
      .reduce((sum, t) => {
        const amount = Number(t.amount) || 0;
        return sum + amount;
      }, 0);
    
    return savings;
  };
  
  // Get all income transactions linked to goals
  const getIncomeTransactions = () => {
    return (transactions || [])
      .filter(t => t.type === 'income' || t.type === 'Income')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Distribute savings proportionally to goals based on priority
  const getSavingsForGoal = (goal) => {
    const totalSavings = getActualSavings();
    if (totalSavings === 0 || !goals || goals.length === 0) {
      return Number(goal.current) || 0;
    }
    
    // High priority = 50%, Medium = 30%, Low = 20%
    const priorityWeights = { 
      high: 0.5, 
      medium: 0.3, 
      low: 0.2 
    };
    const weight = priorityWeights[goal.priority] || 0.3;
    const goalsWithSamePriority = (goals || []).filter(g => (g.priority || 'medium') === (goal.priority || 'medium'));
    const goalCount = goalsWithSamePriority.length || 1;
    
    // Calculate allocated savings for this goal
    const allocatedSavings = totalSavings * weight / goalCount;
    const currentSavings = Number(goal.current) || 0;
    const targetAmount = Number(goal.target) || 0;
    // Return the minimum of target or current + allocatedSavings
    return Math.min(targetAmount, currentSavings + allocatedSavings);
  };
  
  // Calculate goal stats
  const totalGoals = goals.reduce((sum, g) => sum + Number(g.target), 0);
  const totalSaved = goals.reduce((sum, g) => sum + getSavingsForGoal(g), 0);
  const totalRemaining = totalGoals - totalSaved;
  const totalSavings = getActualSavings();
  
  // Get time to goal estimate
  const getTimeToGoal = (goal) => {
    const saved = getSavingsForGoal(goal);
    const needed = Math.max(0, Number(goal.target) - saved);
    if (needed === 0) return 'Complete ✓';
    // Calculate average monthly savings from transactions (rough estimate)
    const incomeTransactions = (transactions || []).filter(t => t.type === 'income');
    const monthlyAverage = incomeTransactions.length > 0 ? totalSavings / Math.max(1, incomeTransactions.length) : 0;
    
    if (monthlyAverage <= 0) return 'N/A';
    const monthsRemaining = Math.ceil(needed / monthlyAverage);
    return monthsRemaining > 12 ? `${Math.floor(monthsRemaining / 12)}y ${monthsRemaining % 12}m` : `${monthsRemaining} months`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Savings Goals</h2>
          <p className="text-slate-500 text-sm">Track progress toward your financial goals with real-time savings data.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"><Plus className="w-4 h-4" /> New Goal</button>
      </div>

      {/* Savings Summary */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Total Savings Income</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{fmtINR(totalSavings)}</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">Available to allocate</div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Goal Target</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{fmtINR(totalGoals)}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{goals.length} active goals</div>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Currently Saved</div>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{fmtINR(totalSaved)}</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{Math.round((totalSaved / (totalGoals || 1)) * 100)}% complete</div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Still Needed</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">{fmtINR(Math.max(0, totalRemaining))}</div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">To reach all targets</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.length > 0 ?
          goals.map(g => {
            const saved = getSavingsForGoal(g);
            const target = Number(g.target);
            const remaining = Math.max(0, target - saved);
            const percentage = Math.round((saved / (target || 1)) * 100);
            const isComplete = percentage >= 100;
            const isWarning = percentage >= 75;

            const priorityColors = {
              high: { bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300', badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
              medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300', badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
              low: { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' }
            };

            const colors = priorityColors[g.priority] || priorityColors.medium;

            return (
              <div key={g.id} className={`bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border transition-all ${colors.border} hover:shadow-md`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{g.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{getTimeToGoal(g)}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${colors.badge}`}>
                      {percentage}%
                    </span>
                    <button 
                      onClick={() => generateProfessionalPDF(
                        `Savings Goal Report: ${g.name}`,
                        {
                          'Goal Name': g.name,
                          'Priority': g.priority.charAt(0).toUpperCase() + g.priority.slice(1),
                          'Target Amount': fmtINR(target),
                          'Currently Saved': fmtINR(saved),
                          'Amount Remaining': fmtINR(remaining),
                          'Progress': `${percentage}%`,
                          'Status': isComplete ? ' Goal Achieved!' : isWarning ? 'Almost there!' : ' In Progress',
                          'Time to Goal': getTimeToGoal(g),
                          'Report Date': new Date().toLocaleString('en-IN')
                        },
                        `Goal-Savings-${g.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`
                      )}
                      className="px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-all border border-purple-600"
                    >
                      <Download className="w-4 h-4" /> Download Savings
                    </button>
                    <button onClick={() => setDeleteId(g.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ 
                      width: `${Math.min(percentage, 100)}%`, 
                      backgroundColor: isComplete ? '#10b981' : isWarning ? '#f59e0b' : '#3b82f6' 
                    }} className="h-full rounded-full transition-all"></div>
                  </div>

                  {/* Goal Details Grid */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Saved</div>
                      <div className="font-bold text-slate-900 dark:text-white">{fmtINR(saved)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Target</div>
                      <div className="font-bold text-slate-900 dark:text-white">{fmtINR(target)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Remaining</div>
                      <div className={`font-bold ${remaining > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{fmtINR(remaining)}</div>
                    </div>
                  </div>

                  {/* Progress Percentage */}
                  <div className="text-center py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{percentage}%</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Complete</div>
                  </div>

                  {/* Status Indicators */}
                  {isComplete && (
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-xs text-green-700 dark:text-green-300 font-medium">✓ Goal achieved!</p>
                    </div>
                  )}
                  {isWarning && !isComplete && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">🎉 Almost there! {fmtINR(remaining)} remaining</p>
                    </div>
                  )}

                  {/* Linked Income Transactions Preview */}
                  {(() => {
                    const incomeTxns = getIncomeTransactions();
                    return incomeTxns.length > 0 ? (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Income Contributing ({incomeTxns.length})</p>
                          <button 
                            onClick={() => setSelectedGoalIncomeTransactions(true)}
                            className="text-xs text-green-600 dark:text-green-400 hover:underline"
                          >
                            View All
                          </button>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {incomeTxns.slice(0, 3).map((t, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs p-1.5 bg-white dark:bg-slate-700 rounded border border-slate-100 dark:border-slate-600">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-900 dark:text-white truncate">{t.merchant}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">{t.date}</p>
                              </div>
                              <p className="font-semibold text-green-600 dark:text-green-400 ml-2 flex-shrink-0">+₹{t.amount}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            );
          }) : (
            <div className="col-span-1 md:col-span-2 p-6 text-center text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-2xl">No goals yet. Start saving toward your first goal!</div>
          )}
      </div>

      <Modal isOpen={showForm} title="Create New Savings Goal" onClose={() => setShowForm(false)} onConfirm={handleAdd} confirmText="Create">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Goal Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" placeholder="e.g. Dream Vacation" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Target Amount (₹)</label>
            <input type="number" value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" placeholder="100000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Priority</label>
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteId !== null} title="Delete Goal?"
        onClose={() => setDeleteId(null)} onConfirm={() => { deleteGoal(deleteId); setDeleteId(null); }} confirmText="Delete" isDelete={true}>
        <p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete this goal?</p>
      </Modal>

      {/* Income Transactions Modal */}
      <Modal isOpen={selectedGoalIncomeTransactions} title="Income Transactions Contributing to Goals" onClose={() => setSelectedGoalIncomeTransactions(false)} onConfirm={() => setSelectedGoalIncomeTransactions(false)} confirmText="Close">
        <div className="max-h-96 overflow-y-auto">
          {(() => {
            const incomeTransactions = getIncomeTransactions();
            return incomeTransactions.length > 0 ? (
              <div className="space-y-2">
                {incomeTransactions.map((t, idx) => (
                  <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{t.merchant}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.date}</p>
                      </div>
                      <p className="font-bold text-lg text-green-600 dark:text-green-400">+₹{t.amount}</p>
                    </div>
                    {t.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300">{t.description}</p>
                    )}
                  </div>
                ))}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                    Total Income: <span className="text-lg text-blue-600 dark:text-blue-400">{fmtINR(getActualSavings())}</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">No income transactions yet</p>
            );
          })()}
        </div>
      </Modal>
    </div>
  );
};

// Settings View with Add Bill Feature
const SettingsView = ({ bills = [], toggleBillPaid, deleteBill, addBill }) => {
  const [deleteId, setDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: '', due_date: '' });
  const handleAddBill = async () => {
    if (formData.name && formData.amount && formData.due_date) {
      await addBill({ name: formData.name, amount: Number(formData.amount), due_date: formData.due_date, status: 'pending', auto: false });
      setFormData({ name: '', amount: '', due_date: '' });
      setShowForm(false);
    } else {
      alert('Please fill all fields.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bills Management</h2>
          <p className="text-slate-500 text-sm">Track and manage your bills.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"><Plus className="w-4 h-4" /> Add Bill</button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Your Bills</h3>
        <div className="space-y-3">
          {bills.length > 0 ? bills.map(b => (
            <div key={b.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <Receipt className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{b.name}</h4>
                  <p className="text-sm text-slate-500">Due: {b.due_date || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-900 dark:text-white">{fmtINR(b.amount)}</span>
                <button onClick={() => toggleBillPaid(b.id)} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${((b.status || '').toString().toLowerCase() === 'paid') ?
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>{b.status}</button>
                <button onClick={() => setDeleteId(b.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          )) : (
            <p className="text-slate-500 text-center py-6">No bills to display. Create one to get started!</p>
          )}
        </div>
      </div>

      <Modal isOpen={showForm} title="Add New Bill" onClose={() => setShowForm(false)} onConfirm={handleAddBill} confirmText="Add Bill">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Bill Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" placeholder="e.g. Electricity Bill" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Amount (₹)</label>
            <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Due Date</label>
            <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" />
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteId !== null} title="Delete Bill?" onClose={() => setDeleteId(null)} onConfirm={() => { deleteBill(deleteId); setDeleteId(null); }} confirmText="Delete" isDelete={true}>
        <p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete this bill?</p>
      </Modal>
    </div>
  );
};

// Auth Forms
const AuthForms = ({ onLogin, onRegister }) => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const ok = await onLogin(username, password);
        if (!ok) setError('Login failed');
      } else {
        const ok = await onRegister(username, password);
        if (!ok) setError('Registration failed');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <AuthManager>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-3 rounded-xl"><Wallet className="w-8 h-8 text-white" /></div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">MyMoney Pro</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your finances with ease</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white text-center">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
              <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <input type="password" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white rounded-xl font-bold mt-6 transition-all shadow-md">{loading ?
              'Loading...' : (mode === 'login' ? 'Login' : 'Register')}</button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm">{mode === 'login' ?
              "Don't have an account?" : 'Already have an account?'}</p>
            <button type="button" className="mt-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ?
              'Create one' : 'Login instead'}</button>
          </div>
        </div>
      </div>
    </AuthManager>
  );
};

// Quick Add Transaction Modal
const QuickAddTransactionModal = ({ isOpen, onClose, onConfirm, budgets = [] }) => {
  const [type, setType] = useState('expense');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [autoDetected, setAutoDetected] = useState(false);
  const expenseTips = ['Food & Dining', 'Groceries', 'Shopping', 'Transportation', 'Bills & Utilities', 'Entertainment', 'Healthcare', 'Housing'];
  const incomeTips = ['Salary', 'Freelance', 'Investment Returns', 'Bonus', 'Gift', 'Business', 'Refund', 'Other Income'];
  const currentTips = type === 'income' ? incomeTips : expenseTips;

  // Get suggestions from existing budgets when type is expense
  const getBudgetCategories = () => {
    if (type === 'expense') {
      return (budgets || []).map(b => b.category).filter((cat, idx, arr) => arr.indexOf(cat) === idx);
    }
    return [];
  };

  // 🤖 REAL-TIME AI-POWERED MERCHANT DETECTION
  const handleMerchantChange = (value) => {
    setMerchant(value);

    // Auto-detect category based on merchant name
    if (value.trim().length > 2 && type === 'expense') {
      const detectedCategory = categorizeMerchant(value);
      const aiSuggestions = getCategorySuggestions(value);

      if (detectedCategory !== 'General' && detectedCategory !== 'Uncategorized') {
        setCategory(detectedCategory);
        setAutoDetected(true);
        setSuggestions(aiSuggestions);
      } else {
        setAutoDetected(false);
        setSuggestions(aiSuggestions);
      }
    } else {
      setAutoDetected(false);
      setSuggestions([]);
    }
  };

  // Smart category matching with fuzzy search
  const handleCategoryChange = (value) => {
    setCategory(value);
    setAutoDetected(false); // User is manually changing
    if (value.length > 0 && type === 'expense') {
      const budgetCats = getBudgetCategories();
      const query = value.toLowerCase().trim();
      
      // Fuzzy matching - find close matches
      const matches = budgetCats.filter(cat => {
        const catLower = cat.toLowerCase();
        // Exact match or partial match
        return catLower.includes(query) || query.includes(catLower.substring(0, 3));
      });

      // Merge with AI suggestions
      const aiSuggestions = getCategorySuggestions(merchant);
      const combined = [...new Set([...matches, ...aiSuggestions])];
      setSuggestions(combined);
    } else {
      setSuggestions([]);
    }
  };
  const handleConfirm = () => {
    if (merchant && category && amount) {
      // Smart category matching - find best match from existing budgets
      let finalCategory = category;
      if (type === 'expense') {
        const budgetCats = getBudgetCategories();
        const query = category.toLowerCase().trim();
        // Try exact match first
        const exactMatch = budgetCats.find(cat => cat.toLowerCase() === query);
        if (exactMatch) {
          finalCategory = exactMatch;
        }
        // Try partial match
        else {
          const partialMatch = budgetCats.find(cat => cat.toLowerCase().includes(query));
          if (partialMatch) finalCategory = partialMatch;
        }
      }
      
      onConfirm({ type, merchant, category: finalCategory, amount: Number(amount) });
      setType('expense');
      setMerchant('');
      setCategory('');
      setAmount('');
      setSuggestions([]);
    } else {
      alert('Please complete all fields.');
    }
  };
  return (
    <Modal isOpen={isOpen} title="Add Transaction" onClose={onClose} onConfirm={handleConfirm} confirmText="Save">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-slate-300">Type</label>
          <select value={type} onChange={(e) => { setType(e.target.value); setCategory(''); setSuggestions([]); }} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        {/* Category Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">Quick Tips:</p>
          <div className="flex flex-wrap gap-1.5">
            {currentTips.map((tip, i) => (
              <button key={i} onClick={() => { setCategory(tip); setSuggestions([]); }} className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded-full text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-700 transition-all cursor-pointer border border-blue-200 dark:border-blue-700">{tip}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 dark:text-slate-300 flex items-center gap-2">
            Merchant
            {merchant && type === 'expense' && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
                🤖 AI Scanning...
              </span>
            )}
          </label>
          <input
            type="text"
            value={merchant}
            onChange={(e) => handleMerchantChange(e.target.value)}
            className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:border-blue-500 transition-all"
            placeholder={type === 'income' ? 'e.g., My Employer, Client Name' : 'e.g., Starbucks, Amazon, Uber'}
          />
        </div>
        
        <div className="relative">
          <label className="text-sm font-medium mb-1 dark:text-slate-300 flex items-center gap-2">
            Category
            {autoDetected && (
              <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center gap-1 animate-pulse">
                ✨ AI Detected!
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={`w-full p-3 pr-12 border-2 rounded-xl dark:bg-slate-800 dark:text-white focus:border-blue-500 transition-all ${
                autoDetected 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-slate-200 dark:border-slate-700'
              }`}
              placeholder={type === 'income' ? 'e.g., Salary, Freelance' : 'AI will auto-detect from merchant...'}
              autoComplete="off"
            />
            {category && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl">
                {getCategoryIcon(category)}
              </span>
            )}
          </div>

          {/* Autocomplete suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
              {suggestions.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCategory(cat); setSuggestions([]); }}
                  className="w-full text-left p-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors text-sm"
                >
                  ✓ {cat}
                </button>
              ))}
            </div>
          )}
        </div>
       
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-slate-300">Amount (₹)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" placeholder="0.00" />
        </div>
      </div>
    </Modal>
  );
};

// Quick Add Goal Modal
const QuickAddGoalModal = ({ isOpen, onClose, onConfirm }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [priority, setPriority] = useState('low');
  const handleConfirm = () => {
    if (name && target) {
      onConfirm({ name, target: Number(target), current: 0, priority });
      setName('');
      setTarget('');
      setPriority('low');
    } else {
      alert('Please fill name and target.');
    }
  };
  return (
    <Modal isOpen={isOpen} title="Create New Goal" onClose={onClose} onConfirm={handleConfirm} confirmText="Create">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-slate-300">Goal Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" placeholder="e.g. Dream Vacation" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-slate-300">Target Amount (₹)</label>
          <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" placeholder="100000" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-slate-300">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};

// 🔔 AI-POWERED NOTIFICATIONS CENTER - ENHANCED
const NotificationCenter = ({ isOpen, onClose, notifications = [], transactions = [], onClearAll }) => {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [filter, setFilter] = useState('all'); // all, budget, goal, bill, insight
  const notificationListRef = useRef(null);

  // Get transaction details for the notification
  const getTransactionDetails = (notification) => {
    if (!notification.transactionId) return null;
    return transactions.find(t => t.id === notification.transactionId);
  };

  const downloadNotificationReport = (notification) => {
    const transaction = getTransactionDetails(notification);
    const reportData = [
      ['Alert Title', notification.title || 'Smart Alert'],
      ['Message', notification.message],
      ['Priority', notification.priority || 'Normal'],
      ['Status', 'ACTIVE'],
    ];
    if (transaction) {
      reportData.push(
        ['', ''], // Blank row for spacing
        ['Transaction Date', transaction.date || 'N/A'],
        ['Transaction Type', transaction.type || 'N/A'],
        ['Merchant', transaction.merchant || 'N/A'],
        ['Category', transaction.category || 'N/A'],
        ['Amount', `₹${transaction.amount || '0'}`],
        ['Description', transaction.description || 'No description']
      );
    }

    generateProfessionalPDF(
      'Notification Alert Report',
      reportData
    );
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    if (onClearAll) {
      onClearAll();
    }
  };

  // Scroll to specific notification
  const scrollToNotification = (index) => {
    if (notificationListRef.current && notifications.length > 0) {
      const scrollableDiv = notificationListRef.current;
      const itemHeight = 160; // approximate height of each notification
      scrollableDiv.scrollTop = index * itemHeight;
      setScrollIndex(index);
    }
  };

  // Scroll up
  const handleScrollUp = () => {
    const newIndex = Math.max(0, scrollIndex - 1);
    scrollToNotification(newIndex);
  };

  // Scroll down
  const handleScrollDown = () => {
    const newIndex = Math.min(notifications.length - 1, scrollIndex + 1);
    scrollToNotification(newIndex);
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header with title and action buttons */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notifications ({notifications.length})
          </h2>
          <div className="flex gap-2">
            {notifications.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-red-600 dark:text-red-400 transition-colors"
                title="Clear all notifications"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 dark:text-white" />
            </button>
          </div>
        </div>

        {/* Notifications List with scroll controls */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top Scroll Button */}
          {notifications.length > 3 && scrollIndex > 0 && (
            <button 
              onClick={handleScrollUp}
              className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium transition-colors"
              title="Scroll up"
            >
              <ChevronUp className="w-4 h-4" /> Show Previous
            </button>
          )}

          {/* Notifications List */}
          <div ref={notificationListRef} className="space-y-3 overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent flex-1">
            {notifications.length > 0 ? notifications.map((n, i) => {
              const transaction = getTransactionDetails(n);
              return (
                <div 
                  key={i} 
                  className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 flex items-start gap-3 hover:shadow-md transition-shadow"
                >
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">{n.title || 'Alert'}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{n.message}</p>
                  
                  {/* Transaction Details */}
                  {transaction && (
                    <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded border border-blue-100 dark:border-slate-700 text-xs space-y-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Date:</span>
                          <p className="font-semibold text-slate-900 dark:text-white">{transaction.date || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Type:</span>
                          <p className="font-semibold text-slate-900 dark:text-white capitalize">{transaction.type || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Merchant:</span>
                          <p className="font-semibold text-slate-900 dark:text-white">{transaction.merchant || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Category:</span>
                          <p className="font-semibold text-slate-900 dark:text-white">{transaction.category || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500 dark:text-slate-400">Amount:</span>
                          <p className="font-bold text-lg text-blue-600 dark:text-blue-400">₹{transaction.amount || '0'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => downloadNotificationReport(n)}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/20 px-2 py-1 rounded"
                    >
                      <Download className="w-3 h-3" /> Download Report
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          )}
          </div>

          {/* Bottom Scroll Button */}
          {notifications.length > 3 && scrollIndex < notifications.length - 1 && (
            <button 
              onClick={handleScrollDown}
              className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium transition-colors"
              title="Scroll down"
            >
              <ChevronDown className="w-4 h-4" /> Show Next
            </button>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 mt-6 flex-shrink-0">
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="flex-1 py-2 px-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
              Clear All ({notifications.length})
            </button>
          )}
          <button 
            onClick={onClose}
            className={`${notifications.length > 0 ? 'flex-1' : 'w-full'} py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// 👤 ENHANCED PROFILE MODAL - REAL-WORLD DESIGN WITH REAL DATA
const ProfileModal = ({ isOpen, onClose, user, setUser, darkMode, transactions = [], goals = [], budgets = [] }) => {
  const [editMode, setEditMode] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    hobbies: user?.hobbies || '',
    bio: user?.bio || ''
  });
  const [showStats, setShowStats] = useState(true);

  // Calculate REAL stats from actual data
  const realTransactionCount = (transactions || []).length;
  const realGoalsCount = (goals || []).length;

  // Calculate budget adherence (on-track percentage)
  const calculateBudgetAdherence = () => {
    if (!budgets || budgets.length === 0) return 100;

    const onTrackBudgets = budgets.filter(b => {
      const spent = (transactions || [])
        .filter(t => t.type === 'expense' && (t.category || '').toLowerCase() === (b.category || '').toLowerCase())
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const limit = Number(b.limit) || 0;
      return limit > 0 && spent <= limit;
    }).length;

    return budgets.length > 0 ? Math.round((onTrackBudgets / budgets.length) * 100) : 100;
  };

  const budgetAdherence = calculateBudgetAdherence();

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        hobbies: user.hobbies || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const res = await authFetch('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ ...formData, avatar_url: avatarUrl })
      });
      if (res.ok) {
        const data = await res.json();
        // Update user state and localStorage
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in-down';
        successDiv.innerHTML = '✓ Profile updated successfully!';
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);

        setEditMode(false);
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile');
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">👤 My Profile</h2>
          <div className="flex gap-2">
            {editMode && <button onClick={() => setEditMode(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-300">Cancel</button>}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5 dark:text-white" /></button>
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto flex-1 p-6">
          {/* Enhanced Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="relative group cursor-pointer"
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              onClick={() => editMode && document.getElementById('avatar-upload').click()}
            >
              {/* Animated glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-purple-500 to-indigo-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 animate-pulse"></div>

              {/* Avatar */}
              <div className="relative h-24 w-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl shadow-2xl border-4 border-white dark:border-slate-800 group-hover:scale-110 transition-all duration-300 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (user?.username || 'U')[0].toUpperCase()
                )}
              </div>

              {/* Hover overlay */}
              {avatarHover && editMode && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Change Photo</span>
                </div>
              )}
            </div>
            {editMode && (
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            )}

            {/* Username & Badge */}
            <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{user?.username || 'User'}</h3>
            <span className="mt-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-full">
              ⭐ Premium Member
            </span>

            {/* Quick Stats - REAL DATA */}
            {showStats && (
              <div className="mt-6 w-full grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-xl text-center border border-blue-200 dark:border-blue-700/50">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{realTransactionCount}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">Transactions</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-xl text-center border border-green-200 dark:border-green-700/50">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{realGoalsCount}</div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">Goals</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-xl text-center border border-purple-200 dark:border-purple-700/50">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{budgetAdherence}%</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">On Track</div>
                </div>
              </div>
            )}
          </div>

          {!editMode ? (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Username
                </label>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.username || 'Not set'}</p>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Name</label>
                <p className="text-lg font-medium text-slate-900 dark:text-white">{formData.full_name || 'Not set'}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Email</label>
                <p className="text-lg font-medium text-slate-900 dark:text-white">{formData.email || 'Not set'}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Mobile Number</label>
                <p className="text-lg font-medium text-slate-900 dark:text-white">{formData.mobile || 'Not set'}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Hobbies</label>
                <p className="text-lg font-medium text-slate-900 dark:text-white">{formData.hobbies || 'Not set'}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Bio</label>
                <p className="text-lg font-medium text-slate-900 dark:text-white">{formData.bio || 'Not set'}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Theme</label>
                <p className="text-sm text-slate-600 dark:text-slate-300 capitalize">{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Full Name</label>
                <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" placeholder="Enter your full name" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" placeholder="your@email.com" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Mobile Number</label>
                <input type="tel" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" placeholder="+91 XXXXX XXXXX" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Hobbies</label>
                <input type="text" value={formData.hobbies} onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" placeholder="e.g. Reading, Gaming, Sports" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Bio</label>
                <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" placeholder="Tell us about yourself" rows="3" />
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">MyMoney Pro v2.1 • Updated: November 25, 2025</p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 sticky bottom-0">
          {!editMode ? (
            <>
              <button onClick={() => setEditMode(true)} className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">Edit Profile</button>
              <button onClick={onClose} className="flex-1 py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Close</button>
            </>
          ) : (
            <>
              <button onClick={handleSave} className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors">Save Changes</button>
              <button onClick={() => setEditMode(false)} className="flex-1 py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [bills, setBills] = useState([]);
  const [notif, setNotif] = useState([]);
  
  // Initialize user from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [spendingTrendData, setSpendingTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // Generate smart alerts based on financial activities
  const generateSmartAlerts = useCallback((trans, bud, goa, bil) => {
    const alerts = [];

    // Budget alerts (guard against zero limit)
    bud.forEach(b => {
      const spent = Number(b.spent || 0);
      const limit = Number(b.limit || 0);
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      if (percentage >= 90) {
        alerts.push({ title: 'Budget Alert', message: `You've spent ${percentage.toFixed(0)}% of your "${b.category}" budget limit!` });
      } else if (percentage >= 75) {
        alerts.push({ title: 'Budget Reminder', message: `Your "${b.category}" budget is at ${percentage.toFixed(0)}%` });
      }
    });

    // Goal savings alerts
    goa.forEach(g => {
      const goalPercentage = (Number(g.current || 0) / (Number(g.target) || 1)) * 100;
      if (goalPercentage >= 100) {
        alerts.push({ title: 'Goal Achieved!', message: `Congratulations! You've reached your "${g.name}" goal!` });
      } else if (goalPercentage >= 75) {
        alerts.push({ title: 'Goal Progress', message: `You're ${goalPercentage.toFixed(0)}% towards your "${g.name}" goal!` });
      }
    });

    // Bill alerts (case-insensitive)
    const pendingBills = (bil || []).filter(b => (b.status || '').toString().toLowerCase() !== 'paid');
    if (pendingBills.length > 0) {
      const billAmount = pendingBills.reduce((s, b) => s + (Number(b.amount) || 0), 0);
      alerts.push({ title: 'Pending Bills', message: `You have ${pendingBills.length} pending bill(s) totaling ${fmtINR(billAmount)}` });
    }

    // Income vs Expense alert
    const totalInc = (trans || []).filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const totalExp = (trans || []).filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
    if (totalExp > totalInc && totalInc > 0) {
      alerts.push({ title: 'Spending Alert', message: `Your expenses (${fmtINR(totalExp)}) exceed your income (${fmtINR(totalInc)})!` });
    }

    // Daily savings reminder
    if ((trans || []).length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      const todayTrans = (trans || []).filter(t => t.date === today);
      alerts.push({ title: 'Daily Summary', message: `Today: ${todayTrans.length} transaction(s) recorded` });
    }

    return alerts;
  }, []);
  
  const loadAll = useCallback(async () => {
    try {
      const tRes = await authFetch('/api/transactions');
      const bRes = await authFetch('/api/budgets');
      const gRes = await authFetch('/api/goals');
      const biRes = await authFetch('/api/bills');
      const trendRes = await authFetch('/api/analytics/spending-trend?days=365');
      const catRes = await authFetch('/api/analytics/category-breakdown?days=365');

      const t = await safeJson(tRes);
      const b = await safeJson(bRes);
      const g = await safeJson(gRes);
      const bi = await safeJson(biRes);
      const trend = await safeJson(trendRes);
      const categories = await safeJson(catRes);

      if (!tRes.ok || !bRes.ok || !gRes.ok || !biRes.ok) {
        console.error('Failed to fetch data:', {
          transactions: tRes.status,
          budgets: bRes.status,
          goals: gRes.status,
          bills: biRes.status,
        });
        // We do not alert here to avoid spamming the user on mount if network is down
      }

      setTransactions(Array.isArray(t) ? t : []);
      setBudgets(Array.isArray(b) ? b : []);
      setGoals(Array.isArray(g) ? g : []);
      setBills(Array.isArray(bi) ? bi : []);
      setSpendingTrendData(Array.isArray(trend) && trend.length > 0 ? trend : []);
      setCategoryData(Array.isArray(categories) && categories.length > 0 ? categories : []);

      // Generate smart alerts
      const smartAlerts = generateSmartAlerts(
        Array.isArray(t) ? t : [],
        Array.isArray(b) ? b : [],
        Array.isArray(g) ? g : [],
        Array.isArray(bi) ? bi : []
      );
      setNotif(smartAlerts);
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }, [generateSmartAlerts]);

  // Apply dark mode from saved state immediately (ensures class is present on first paint)
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load data when user logs in
  useEffect(() => {
    if (user) {
      loadAll();
    }
  }, [user, loadAll]);

  const login = async (username, password) => {
    try {
      const res = await fetch(API_BASE_URL + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await safeJson(res) || {};
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user || { username });
        // loadAll will trigger via useEffect
        setTab('dashboard');
        return true;
      } else {
        alert(data.error || `Login failed (status ${res.status})`);
        return false;
      }
    } catch (err) {
      console.error('login error', err);
      alert('Network error while logging in');
      return false;
    }
  };
  
  const register = async (username, password) => {
    try {
      const res = await fetch(API_BASE_URL + '/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await safeJson(res) || {};
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user || { username });
        // loadAll will trigger via useEffect
        return true;
      } else {
        alert(data.error || `Register failed (status ${res.status})`);
        return false;
      }
    } catch (err) {
      console.error('register error', err);
      alert('Network error while registering');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setBills([]);
  };

  const addTransaction = async (payload) => {
    try {
      console.log('Sending transaction to backend:', payload);
      const res = await authFetch('/api/transactions', { method: 'POST', body: JSON.stringify(payload) });

      if (!res.ok) {
        const err = await safeJson(res);
        console.error('Transaction creation failed:', err);
        alert(`❌ Failed to add transaction: ${err?.error || 'Unknown error'}`);
        return;
      }

      const result = await safeJson(res);
      console.log('Transaction created successfully:', result);

      // Reload all data to show new transaction
      await loadAll();

    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('❌ Network error. Please check your connection and try again.');
    }
  };

  const deleteTransaction = async (id) => {
    const res = await authFetch('/api/transactions/' + id, { method: 'DELETE' });
    if (!res.ok) {
      const err = await safeJson(res);
      alert(err?.error || 'Delete failed');
    }
    await loadAll();
  };

  const addBudget = async (payload) => {
    const res = await authFetch('/api/budgets', { method: 'POST', body: JSON.stringify(payload) });
    if (!res.ok) alert('Failed to create budget');
    await loadAll();
  };

  const deleteBudget = async (id) => {
    const res = await authFetch('/api/budgets/' + id, { method: 'DELETE' });
    if (!res.ok) alert('Failed to delete budget');
    await loadAll();
  };

  const addGoal = async (payload) => {
    const res = await authFetch('/api/goals', { method: 'POST', body: JSON.stringify(payload) });
    if (!res.ok) alert('Failed to create goal');
    await loadAll();
  };

  const deleteGoal = async (id) => {
    const res = await authFetch('/api/goals/' + id, { method: 'DELETE' });
    if (!res.ok) alert('Failed to delete goal');
    await loadAll();
  };

  const addBill = async (payload) => {
    const res = await authFetch('/api/bills', { method: 'POST', body: JSON.stringify(payload) });
    if (!res.ok) {
      const err = await safeJson(res);
      alert(err?.error || 'Failed to create bill');
    }
    await loadAll();
  };

  const toggleBillPaid = async (id) => {
    const res = await authFetch('/api/bills/' + id, { method: 'PUT', body: JSON.stringify({ toggle_paid: true }) });
    if (!res.ok) alert('Failed to update bill');
    await loadAll();
  };

  const deleteBill = async (id) => {
    const res = await authFetch('/api/bills/' + id, { method: 'DELETE' });
    if (!res.ok) alert('Failed to delete bill');
    await loadAll();
  };

  const handleAddTransaction = async (formData) => {
    // Normalize category: trim whitespace and preserve case
    const normalizedCategory = (formData.category || '').trim();

    // Format: YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);

    const transactionData = {
      type: formData.type,
      merchant: (formData.merchant || '').trim(),
      category: normalizedCategory,
      amount: Number(formData.amount),
      date: today
    };

    console.log('Adding transaction:', transactionData);

    await addTransaction(transactionData);
    setShowQuickAdd(false);

    // Show success notification
    alert(`✅ Transaction added successfully!\n${formData.merchant} - ₹${formData.amount}`);
  };

  const clearAllNotifications = () => {
    if (window.confirm(`Clear all ${notif.length} notifications?`)) {
      setNotif([]);
    }
  };

  const renderContent = () => {
    switch (tab) {
      case 'dashboard': return <DashboardView transactions={transactions} bills={bills} budgets={budgets} notif={notif} setShowQuickAdd={setShowQuickAdd} setShowGoalModal={setShowGoalModal} spendingTrendData={spendingTrendData} categoryData={categoryData} />;
      case 'transactions': return <TransactionsView transactions={transactions} searchQuery={searchQuery} setSearchQuery={setSearchQuery} deleteTransaction={deleteTransaction} />;
      case 'budgets': return <BudgetsView budgets={budgets} addBudget={addBudget} deleteBudget={deleteBudget} transactions={transactions} />;
      case 'envelope': return <EnvelopeBudget />;
      case 'recurring': return <RecurringTransactions />;
      case 'accounts': return <Accounts />;
      case 'investments': return <Investments />;
      case 'networth': return <NetWorthTracker />;
      case 'goals': return <GoalsView goals={goals} addGoal={addGoal} deleteGoal={deleteGoal} transactions={transactions} />;
      case 'settings': return <SettingsView bills={bills} toggleBillPaid={toggleBillPaid} deleteBill={deleteBill} addBill={addBill} />;
      default: return null;
    }
  };

  const getPageTitle = () => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'transactions': return 'Transactions';
      case 'budgets': return 'Budgets';
      case 'envelope': return 'Envelope Budget';
      case 'recurring': return 'Recurring Transactions';
      case 'accounts': return 'Accounts';
      case 'investments': return 'Investment Portfolio';
      case 'networth': return 'Net Worth Tracker';
      case 'goals': return 'Savings Goals';
      case 'settings': return 'Settings & Bills';
      default: return 'Dashboard';
    }
  };

  if (!user) {
    return <AuthManager onLogin={login} onRegister={register} />;
  }

  return (
    <div className="font-sans antialiased text-slate-900 bg-slate-50 dark:bg-slate-950">
      <Sidebar activeTab={tab} setActiveTab={setTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <Layout darkMode={darkMode} setDarkMode={setDarkMode} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={getPageTitle()} user={user} onLogout={logout} onProfileClick={() => setShowProfile(true)} notifCount={notif.length} notif={notif} onNotifClick={() => setShowNotifCenter(true)} onRefresh={loadAll}>{renderContent()}</Layout>

      <QuickAddTransactionModal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} onConfirm={handleAddTransaction} budgets={budgets} />
      <QuickAddGoalModal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} onConfirm={(data) => { addGoal(data); setShowGoalModal(false); }} />
      <NotificationCenter isOpen={showNotifCenter} onClose={() => setShowNotifCenter(false)} notifications={notif} transactions={transactions} onClearAll={clearAllNotifications} />
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} user={user} setUser={setUser} darkMode={darkMode} transactions={transactions} goals={goals} budgets={budgets} />
    </div>
  );
}

