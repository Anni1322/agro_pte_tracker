import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { BarChart3, TrendingUp, AlertTriangle, CheckSquare, Sparkles, PieChart, Landmark } from 'lucide-react';

export default function Analytics() {
  const [expenses, setExpenses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState('month'); // 'month' or 'year'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expRes = await API.get('expenses/');
        setExpenses(expRes.data);
      } catch (err) {
        console.warn('Backend expenses API offline, loading mock spend logs for Analytics.');
        setExpenses([
          { id: 1, amount: '8400.00', date: '2026-06-25', category: 'Seeds' },
          { id: 2, amount: '1200.00', date: '2026-06-24', category: 'Fuel' },
          { id: 3, amount: '4500.00', date: '2026-05-22', category: 'Hardware' },
          { id: 4, amount: '3500.00', date: '2026-05-15', category: 'Fuel' },
          { id: 5, amount: '9200.00', date: '2026-04-10', category: 'Labor' },
        ]);
      }

      try {
        const taskRes = await API.get('tasks/');
        setTasks(taskRes.data);
      } catch (err) {
        console.warn('Backend tasks API offline, loading mock tasks for Analytics.');
        setTasks([
          { id: 1, priority: 'urgent', status: 'Pending' },
          { id: 2, priority: 'high', status: 'In Progress' },
          { id: 3, priority: 'medium', status: 'Completed' },
          { id: 4, priority: 'low', status: 'Completed' },
          { id: 5, priority: 'high', status: 'In Progress' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate statistics
  const totalSpend = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  
  // Calculate average
  const uniqueMonths = [...new Set(expenses.map(e => e.date?.substring(0, 7)))];
  const monthlyAvg = uniqueMonths.length ? totalSpend / uniqueMonths.length : totalSpend;

  // Task Priority distribution
  const priorityCount = tasks.reduce((acc, t) => {
    const p = t.priority?.toLowerCase() || 'medium';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, { low: 0, medium: 0, high: 0, urgent: 0 });

  // Task Status distribution
  const statusCount = tasks.reduce((acc, t) => {
    const s = t.status || 'Pending';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, { Pending: 0, 'In Progress': 0, Completed: 0 });

  // Spending Trends Data
  const getTrendData = () => {
    const map = {};
    expenses.forEach((e) => {
      if (!e.date) return;
      const key = chartMode === 'month' ? e.date.substring(0, 7) : e.date.substring(0, 4);
      map[key] = (map[key] || 0) + parseFloat(e.amount);
    });
    return Object.keys(map)
      .sort()
      .map(key => ({ label: key, value: map[key] }));
  };

  const trendData = getTrendData();
  const maxTrendVal = trendData.length ? Math.max(...trendData.map(d => d.value)) : 1000;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <span>Executive Analytics</span>
            <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live spending trends and operational ratios.</p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 border border-rose-250/20 text-rose-600 dark:text-rose-450 rounded-xl">
            <Landmark size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Spend Payouts</span>
            <h4 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">₹{totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-250/20 text-emerald-600 dark:text-emerald-450 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Average Spend</span>
            <h4 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">₹{monthlyAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-250/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <CheckSquare size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operational Task Burden</span>
            <h4 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{tasks.length} Active Tasks</h4>
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spending Trends bar indicators */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-6 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-white flex items-center space-x-2">
              <BarChart3 size={18} className="text-slate-400" />
              <span>Spend Log Timeline</span>
            </h3>
            <div className="flex space-x-1.5">
              <button 
                onClick={() => setChartMode('month')}
                className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${chartMode === 'month' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-550 border-slate-200 dark:border-slate-800 hover:bg-slate-100'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setChartMode('year')}
                className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${chartMode === 'year' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-550 border-slate-200 dark:border-slate-800 hover:bg-slate-100'}`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {trendData.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-12">No data logged for this timeline</p>
            ) : (
              <div className="space-y-3">
                {trendData.map((data, index) => {
                  const percentage = (data.value / maxTrendVal) * 100;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-650 dark:text-slate-400">
                        <span>{data.label}</span>
                        <span className="font-bold text-slate-800 dark:text-white">₹{data.value.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-650 dark:bg-indigo-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Priority and status distribution lists */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-6 shadow-sm">
          <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-white flex items-center space-x-2">
            <PieChart size={18} className="text-slate-400" />
            <span>Task Priorities & Ratios</span>
          </h3>

          <div className="space-y-4">
            
            {/* Status distribution */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Breakdown</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 block">Pending</span>
                  <span className="text-sm font-black text-amber-500">{statusCount.Pending}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 block">Active</span>
                  <span className="text-sm font-black text-indigo-500">{statusCount['In Progress']}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 block">Done</span>
                  <span className="text-sm font-black text-emerald-500">{statusCount.Completed}</span>
                </div>
              </div>
            </div>

            {/* Priority breakdown */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-900">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Task Risk Levels</span>
              
              <div className="space-y-2">
                {[
                  { label: 'Urgent', val: priorityCount.urgent, color: 'bg-rose-500' },
                  { label: 'High', val: priorityCount.high, color: 'bg-orange-500' },
                  { label: 'Medium', val: priorityCount.medium, color: 'bg-blue-500' },
                  { label: 'Low', val: priorityCount.low, color: 'bg-slate-400' },
                ].map((item, idx) => {
                  const percentage = tasks.length ? (item.val / tasks.length) * 100 : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 text-slate-650 dark:text-slate-400 font-semibold">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                        <span>{item.label}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white">{item.val} ({Math.round(percentage)}%)</span>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
