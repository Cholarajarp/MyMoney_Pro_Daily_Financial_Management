import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit2, Trash2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const EnvelopeBudget = () => {
  const [envelopes, setEnvelopes] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    assigned: 0,
    priority: 5,
    rollover: true,
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch envelopes for current month
  useEffect(() => {
    fetchEnvelopes();
  }, [currentMonth]);

  const fetchEnvelopes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/envelope-budgets?month=${currentMonth}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEnvelopes(data);
      }
    } catch (error) {
      console.error('Error fetching envelopes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `/api/envelope-budgets/${editingId}` : '/api/envelope-budgets';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          month: currentMonth,
          available: formData.assigned // Initially available = assigned
        })
      });

      if (response.ok) {
        fetchEnvelopes();
        setShowForm(false);
        setEditingId(null);
        setFormData({ category: '', assigned: 0, priority: 5, rollover: true, notes: '' });
      }
    } catch (error) {
      console.error('Error saving envelope:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this envelope?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/envelope-budgets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchEnvelopes();
      }
    } catch (error) {
      console.error('Error deleting envelope:', error);
    }
  };

  const handleEdit = (envelope) => {
    setFormData({
      category: envelope.category,
      assigned: envelope.assigned,
      priority: envelope.priority,
      rollover: envelope.rollover,
      notes: envelope.notes || ''
    });
    setEditingId(envelope.id);
    setShowForm(true);
  };

  // Calculate totals
  const totalAssigned = envelopes.reduce((sum, e) => sum + e.assigned, 0);
  const totalActivity = envelopes.reduce((sum, e) => sum + e.activity, 0);
  const totalAvailable = envelopes.reduce((sum, e) => sum + e.available, 0);
  const unassigned = 0; // TODO: Calculate from income - totalAssigned

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Envelope Budget</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Give every dollar a job</p>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Envelope
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-sm opacity-90 mb-1">To Be Assigned</div>
          <div className="text-3xl font-bold">₹{unassigned.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Assigned</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{totalAssigned.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Activity</div>
          <div className="text-2xl font-bold text-red-600">-₹{totalActivity.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Available</div>
          <div className="text-2xl font-bold text-green-600">₹{totalAvailable.toFixed(2)}</div>
        </div>
      </div>

      {/* Envelopes List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Category Envelopes</h3>

          {envelopes.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">No envelopes for this month</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first envelope
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {envelopes.map((envelope) => {
                const percentUsed = envelope.assigned > 0 ? (envelope.activity / envelope.assigned) * 100 : 0;
                const isOverspent = envelope.available < 0;

                return (
                  <div
                    key={envelope.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isOverspent
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">{envelope.category}</h4>
                          {envelope.rollover && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                              Rollover
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                          <div>
                            <div className="text-slate-600 dark:text-slate-400">Assigned</div>
                            <div className="font-semibold text-slate-900 dark:text-white">₹{envelope.assigned.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-slate-600 dark:text-slate-400">Activity</div>
                            <div className="font-semibold text-red-600">-₹{envelope.activity.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-slate-600 dark:text-slate-400">Available</div>
                            <div className={`font-semibold ${isOverspent ? 'text-red-600' : 'text-green-600'}`}>
                              ₹{envelope.available.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isOverspent ? 'bg-red-600' : percentUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(percentUsed, 100)}%` }}
                          />
                        </div>

                        {envelope.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{envelope.notes}</p>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(envelope)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(envelope.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {editingId ? 'Edit Envelope' : 'New Envelope'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Amount to Assign
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.assigned}
                  onChange={(e) => setFormData({ ...formData, assigned: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Priority (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.rollover}
                  onChange={(e) => setFormData({ ...formData, rollover: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="text-sm text-slate-700 dark:text-slate-300">
                  Roll over unused funds to next month
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  rows="2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ category: '', assigned: 0, priority: 5, rollover: true, notes: '' });
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

export default EnvelopeBudget;

