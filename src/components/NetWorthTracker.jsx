import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const NetWorthTracker = () => {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentNetWorth, setCurrentNetWorth] = useState({
    assets: 0,
    liabilities: 0,
    net_worth: 0
  });

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const fetchSnapshots = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/net-worth`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSnapshots(data);
        if (data.length > 0) {
          setCurrentNetWorth({
            assets: data[0].assets,
            liabilities: data[0].liabilities,
            net_worth: data[0].net_worth
          });
        }
      }
    } catch (error) {
      console.error('Error fetching net worth:', error);
    }
  };

  const createSnapshot = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/net-worth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentNetWorth({
          assets: data.assets,
          liabilities: data.liabilities,
          net_worth: data.net_worth
        });
        fetchSnapshots();
      }
    } catch (error) {
      console.error('Error creating snapshot:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data (reverse to show oldest first)
  const chartData = [...snapshots].reverse().map(s => ({
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    netWorth: s.net_worth,
    assets: s.assets,
    liabilities: s.liabilities
  }));

  // Calculate trend
  const trend = snapshots.length >= 2
    ? ((snapshots[0].net_worth - snapshots[1].net_worth) / Math.abs(snapshots[1].net_worth) * 100)
    : 0;

  const isPositiveTrend = trend >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Net Worth Tracker</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Track your financial progress over time</p>
        </div>
        <button
          onClick={createSnapshot}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Calculating...' : 'Take Snapshot'}
        </button>
      </div>

      {/* Current Net Worth Card */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 text-white p-8 rounded-2xl shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-sm opacity-90 mb-2">Current Net Worth</div>
            <div className="text-5xl font-bold mb-2">₹{currentNetWorth.net_worth.toFixed(2)}</div>
            {snapshots.length >= 2 && (
              <div className={`flex items-center gap-2 text-sm ${isPositiveTrend ? 'text-green-300' : 'text-red-300'}`}>
                {isPositiveTrend ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositiveTrend ? '+' : ''}{trend.toFixed(2)}% from last snapshot</span>
              </div>
            )}
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
            <div className="text-sm opacity-90 mb-1">Assets</div>
            <div className="text-2xl font-bold">₹{currentNetWorth.assets.toFixed(2)}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
            <div className="text-sm opacity-90 mb-1">Liabilities</div>
            <div className="text-2xl font-bold">₹{currentNetWorth.liabilities.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Net Worth Chart */}
      {chartData.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Net Worth History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => [`₹${value.toFixed(2)}`, '']}
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#colorNetWorth)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
          <DollarSign className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">No snapshots yet</p>
          <button
            onClick={createSnapshot}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Take your first snapshot
          </button>
        </div>
      )}

      {/* Detailed Breakdown Chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Assets vs Liabilities</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => [`₹${value.toFixed(2)}`, '']}
              />
              <Line
                type="monotone"
                dataKey="assets"
                stroke="#10b981"
                strokeWidth={2}
                name="Assets"
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="liabilities"
                stroke="#ef4444"
                strokeWidth={2}
                name="Liabilities"
                dot={{ fill: '#ef4444', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Snapshot History */}
      {snapshots.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Snapshot History</h3>
          <div className="space-y-3">
            {snapshots.slice(0, 10).map((snapshot, index) => {
              const prevSnapshot = snapshots[index + 1];
              const change = prevSnapshot
                ? snapshot.net_worth - prevSnapshot.net_worth
                : 0;
              const changePercent = prevSnapshot && prevSnapshot.net_worth !== 0
                ? (change / Math.abs(prevSnapshot.net_worth) * 100)
                : 0;

              return (
                <div
                  key={snapshot.id}
                  className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {new Date(snapshot.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Assets: ₹{snapshot.assets.toFixed(2)} • Liabilities: ₹{snapshot.liabilities.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white">
                      ₹{snapshot.net_worth.toFixed(2)}
                    </div>
                    {prevSnapshot && (
                      <div className={`text-sm flex items-center gap-1 justify-end ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {change >= 0 ? '+' : ''}₹{change.toFixed(2)} ({changePercent.toFixed(1)}%)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetWorthTracker;

