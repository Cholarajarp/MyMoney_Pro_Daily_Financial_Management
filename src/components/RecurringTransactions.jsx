import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Play, Pause, Repeat } from 'lucide-react';

const RecurringTransactions = () => {
  const [recurring, setRecurring] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    merchant: '',
    amount: 0,
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    next_date: new Date().toISOString().split('T')[0],
    end_date: '',
    active: true
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRecurring();
  }, []);

  const fetchRecurring = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/recurring-transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRecurring(data);
      }
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `/api/recurring-transactions/${editingId}` : '/api/recurring-transactions';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchRecurring();
        setShowForm(false);
        setEditingId(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving recurring transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring transaction?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/recurring-transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchRecurring();
      }
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/recurring-transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !currentStatus })
      });
      if (response.ok) {
        fetchRecurring();
      }
    } catch (error) {
      console.error('Error toggling recurring transaction:', error);
    }
  };

  const handleEdit = (rec) => {
    setFormData({
      type: rec.type,
      category: rec.category,
      merchant: rec.merchant,
      amount: rec.amount,
      frequency: rec.frequency,
      start_date: rec.start_date,
      next_date: rec.next_date,
      end_date: rec.end_date || '',
      active: rec.active
    });
    setEditingId(rec.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      category: '',
      merchant: '',
      amount: 0,
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      next_date: new Date().toISOString().split('T')[0],
      end_date: '',
      active: true
    });
  };

  const getFrequencyBadgeColor = (frequency) => {
    const colors = {
      daily: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      weekly: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      monthly: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      yearly: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colors[frequency] || colors.monthly;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recurring Transactions</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Set up automatic recurring bills and income</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Recurring
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Active Recurring</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {recurring.filter(r => r.active).length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Monthly Income</div>
          <div className="text-3xl font-bold text-green-600">
            ₹{recurring
              .filter(r => r.active && r.type === 'income' && r.frequency === 'monthly')
              .reduce((sum, r) => sum + r.amount, 0)
              .toFixed(2)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Monthly Expenses</div>
          <div className="text-3xl font-bold text-red-600">
            ₹{recurring
              .filter(r => r.active && r.type === 'expense' && r.frequency === 'monthly')
              .reduce((sum, r) => sum + r.amount, 0)
              .toFixed(2)}
          </div>
        </div>
      </div>

      {/* Recurring List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Scheduled Transactions</h3>

          {recurring.length === 0 ? (
            <div className="text-center py-12">
              <Repeat className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">No recurring transactions yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first recurring transaction
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recurring.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    rec.active
                      ? 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white">{rec.merchant}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          rec.type === 'income' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {rec.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getFrequencyBadgeColor(rec.frequency)}`}>
                          {rec.frequency}
                        </span>
                        {!rec.active && (
                          <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-full">
                            Paused
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                        <div>
                          <div className="text-slate-600 dark:text-slate-400">Amount</div>
                          <div className={`font-semibold ${rec.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{rec.amount.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-600 dark:text-slate-400">Category</div>
                          <div className="font-semibold text-slate-900 dark:text-white">{rec.category}</div>
                        </div>
                        <div>
                          <div className="text-slate-600 dark:text-slate-400">Next Date</div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {new Date(rec.next_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-600 dark:text-slate-400">Started</div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {new Date(rec.start_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {rec.end_date && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Ends: {new Date(rec.end_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => toggleActive(rec.id, rec.active)}
                        className={`p-2 rounded-lg transition-colors ${
                          rec.active
                            ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        title={rec.active ? 'Pause' : 'Resume'}
                      >
                        {rec.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(rec)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl my-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {editingId ? 'Edit Recurring Transaction' : 'New Recurring Transaction'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Merchant/Source
                  </label>
                  <input
                    type="text"
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    placeholder="Netflix, Salary, etc."
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Entertainment"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Next Date
                  </label>
                  <input
                    type="date"
                    value={formData.next_date}
                    onChange={(e) => setFormData({ ...formData, next_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="flex-1 py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTransactions;

