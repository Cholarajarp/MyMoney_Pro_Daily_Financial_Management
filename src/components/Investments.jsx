import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, Edit2, Trash2, DollarSign, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState({
    total_value: 0,
    total_cost: 0,
    gain_loss: 0,
    gain_loss_percentage: 0
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    type: 'stock',
    quantity: 0,
    purchase_price: 0,
    current_price: 0,
    purchase_date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/investments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInvestments(data.investments || []);
        setSummary(data.summary || {
          total_value: 0,
          total_cost: 0,
          gain_loss: 0,
          gain_loss_percentage: 0
        });
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `${API_BASE_URL}/api/investments/${editingId}` : `${API_BASE_URL}/api/investments`;
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
        fetchInvestments();
        setShowForm(false);
        setEditingId(null);
        setFormData({
          symbol: '',
          name: '',
          type: 'stock',
          quantity: 0,
          purchase_price: 0,
          current_price: 0,
          purchase_date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error saving investment:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this investment?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/investments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchInvestments();
      }
    } catch (error) {
      console.error('Error deleting investment:', error);
    }
  };

  const handleEdit = (investment) => {
    setFormData({
      symbol: investment.symbol,
      name: investment.name,
      type: investment.type,
      quantity: investment.quantity,
      purchase_price: investment.purchase_price,
      current_price: investment.current_price,
      purchase_date: investment.purchase_date
    });
    setEditingId(investment.id);
    setShowForm(true);
  };

  // Prepare chart data
  const chartData = investments.map(inv => ({
    name: inv.symbol,
    value: inv.total_value
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'stock':
        return '📈';
      case 'crypto':
        return '₿';
      case 'bond':
        return '📜';
      case 'mutual_fund':
        return '🏦';
      default:
        return '💰';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Investment Portfolio</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Track your stocks, bonds, and crypto</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Investment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Portfolio Value</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{summary.total_value.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Cost</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{summary.total_cost.toFixed(2)}</div>
        </div>
        <div className={`bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700`}>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Gain/Loss</div>
          <div className={`text-2xl font-bold ${summary.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.gain_loss >= 0 ? '+' : ''}₹{summary.gain_loss.toFixed(2)}
          </div>
        </div>
        <div className={`bg-gradient-to-br ${summary.gain_loss >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} text-white p-6 rounded-xl shadow-lg`}>
          <div className="text-sm opacity-90 mb-1 flex items-center gap-2">
            {summary.gain_loss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            Return
          </div>
          <div className="text-3xl font-bold">
            {summary.gain_loss >= 0 ? '+' : ''}{summary.gain_loss_percentage.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Portfolio Distribution Chart */}
      {investments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Portfolio Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top Performers</h3>
            <div className="space-y-3">
              {investments
                .sort((a, b) => b.gain_loss - a.gain_loss)
                .slice(0, 5)
                .map((inv, index) => (
                  <div key={inv.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getTypeIcon(inv.type)}</div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{inv.symbol}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{inv.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${inv.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {inv.gain_loss >= 0 ? '+' : ''}₹{inv.gain_loss.toFixed(2)}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {((inv.gain_loss / (inv.quantity * inv.purchase_price)) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Investments List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Holdings</h3>

          {investments.length === 0 ? (
            <div className="text-center py-12">
              <BarChart2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">No investments yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first investment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Symbol</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Quantity</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Avg Cost</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Current Price</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Total Value</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Gain/Loss</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => {
                    const gainLossPercent = ((inv.gain_loss / (inv.quantity * inv.purchase_price)) * 100);
                    return (
                      <tr key={inv.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getTypeIcon(inv.type)}</span>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">{inv.symbol}</div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">{inv.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 capitalize">{inv.type}</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-white">{inv.quantity}</td>
                        <td className="py-3 px-4 text-right text-slate-900 dark:text-white">₹{inv.purchase_price.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-slate-900 dark:text-white">₹{inv.current_price.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">₹{inv.total_value.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className={`font-semibold ${inv.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {inv.gain_loss >= 0 ? '+' : ''}₹{inv.gain_loss.toFixed(2)}
                          </div>
                          <div className={`text-xs ${inv.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({gainLossPercent.toFixed(2)}%)
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEdit(inv)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(inv.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl my-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {editingId ? 'Edit Investment' : 'New Investment'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Symbol/Ticker
                  </label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    placeholder="AAPL"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="stock">Stock</option>
                    <option value="crypto">Crypto</option>
                    <option value="bond">Bond</option>
                    <option value="mutual_fund">Mutual Fund</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Apple Inc."
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Current Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_price}
                    onChange={(e) => setFormData({ ...formData, current_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      symbol: '',
                      name: '',
                      type: 'stock',
                      quantity: 0,
                      purchase_price: 0,
                      current_price: 0,
                      purchase_date: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="flex-1 py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;

