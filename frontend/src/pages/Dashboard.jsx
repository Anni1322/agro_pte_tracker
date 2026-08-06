import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, Users, CheckSquare, Wallet, ArrowRight, TrendingUp, 
  Search, DollarSign, Calendar, ListTodo, Tag, Info, Sparkles 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ employees: 0, projects: 0, tasks: 0, expenses: 0.0 });
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses', 'projects', 'tasks', 'todos'
  
  // Detailed lists for tracking
  const [expenses, setExpenses] = useState([]);
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [todos, setTodos] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [empRes, projRes, taskRes, expRes, dailyExpRes, todoRes] = await Promise.all([
        API.get('employees/'),
        API.get('projects/'),
        API.get('tasks/'),
        API.get('expenses/'),
        API.get('day-wise-expenses/'),
        API.get('todos/')
      ]);

      const totalProjectSpend = expRes.data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      const totalDailySpend = dailyExpRes.data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      const grandTotalExpenses = totalProjectSpend + totalDailySpend;

      setEmployees(empRes.data);
      setProjects(projRes.data);
      setTasks(taskRes.data);
      setExpenses(expRes.data);
      setDailyExpenses(dailyExpRes.data);
      setTodos(todoRes.data);

      setStats({
        employees: empRes.data.length,
        projects: projRes.data.length,
        tasks: taskRes.data.filter(t => t.status !== 'Completed').length,
        expenses: grandTotalExpenses
      });
    } catch (err) {
      console.warn('Dashboard API fetch issue. Showing fallback mock metrics.');
      // Mock Fallbacks
      setProjects([
        { id: 1, name: 'Project Greenfield', description: 'Organic cereal farming and irrigation setups.', start_date: '2026-05-01', end_date: '2026-10-31', manager_detail: { name: 'Anil Sharma' } },
        { id: 2, name: 'Warehouse Solar Installation', description: 'Integrating solar panels.', start_date: '2026-06-15', end_date: '2026-08-30', manager_detail: { name: 'Rohit Kumar' } },
        { id: 3, name: 'Smart Barn HVAC', description: 'Automated climate controls for dairy barn.', start_date: '2026-07-01', end_date: '2026-09-15', manager_detail: { name: 'Anil Sharma' } }
      ]);
      setExpenses([
        { id: 1, title: 'Agro Seeds Purchase', amount: 15000, date: '2026-06-25', project_detail: { name: 'Project Greenfield' } },
        { id: 2, title: 'Solar Panel Bundles', amount: 28000, date: '2026-06-22', project_detail: { name: 'Warehouse Solar' } },
      ]);
      setDailyExpenses([
        { id: 3, category: 'transport', amount: 3200, date: '2026-06-24', description: 'Diesel Refuel' },
        { id: 4, category: 'food', amount: 1200, date: '2026-06-23', description: 'Office lunch & team catering' },
        { id: 5, category: 'rent', amount: 1500, date: '2026-06-20', description: 'Tractor rental fee' },
      ]);
      setTasks([
        { id: 1, title: 'Irrigation Drip Setup', status: 'Pending', deadline: '2026-07-05', project_detail: { name: 'Project Greenfield' }, assigned_to_detail: { name: 'Rohit Kumar' } },
        { id: 2, title: 'Seed Sowing', status: 'In Progress', deadline: '2026-06-30', project_detail: { name: 'Project Greenfield' }, assigned_to_detail: { name: 'Arjun Singh' } },
        { id: 3, title: 'HVAC Ducting Check', status: 'Pending', deadline: '2026-07-10', project_detail: { name: 'Smart Barn HVAC' }, assigned_to_detail: { name: 'Anil Sharma' } },
      ]);
      setTodos([
        { id: 1, title: 'Confirm payroll with Supervisor', priority: 'medium', is_completed: false },
        { id: 2, title: 'Upload fertilizer receipt to OCR scan', priority: 'high', is_completed: true },
        { id: 3, title: 'Assign Tasks for Project Greenfield', priority: 'urgent', is_completed: false }
      ]);
      setEmployees([
        { id: 1, name: 'Anil Sharma' }, { id: 2, name: 'Rohit Kumar' }, { id: 3, name: 'Arjun Singh' }
      ]);
      setStats({
        employees: 3,
        projects: 3,
        tasks: 2,
        expenses: 48900.0
      });
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pendingTodos = todos.filter(t => !t.is_completed).length;

  const cards = [
    { label: 'Total Expenses', value: `₹${stats.expenses.toLocaleString()}`, icon: <Wallet className="text-rose-400" />, desc: 'Track spending list', bg: 'from-rose-500/10 to-rose-500/5', path: '/expenses' },
    { label: 'Pending Tasks', value: stats.tasks, icon: <CheckSquare className="text-amber-400" />, desc: 'Assigned workflow list', bg: 'from-amber-500/10 to-amber-500/5', path: '/tasks' },
    { label: 'Projects', value: stats.projects, icon: <Briefcase className="text-cyan-400" />, desc: 'Agribusiness project list', bg: 'from-cyan-500/10 to-cyan-500/5', path: '/projects' },
    { label: 'Pending Todos', value: pendingTodos, icon: <ListTodo className="text-emerald-400" />, desc: 'Checking reminders list', bg: 'from-emerald-500/10 to-emerald-500/5', path: '/todos' },
  ];

  // Aggregated Expenses List for rendering
  const allExpenses = [
    ...expenses.map(e => ({ ...e, type: 'Project', cost: parseFloat(e.amount || 0) })),
    ...dailyExpenses.map(d => ({ ...d, title: d.description || `Daily Spend: ${d.category}`, type: 'Daily', cost: parseFloat(d.amount || 0) }))
  ].sort((a, b) => new Date(b.date || '') - new Date(a.date || ''));

  // Filtered Lists based on Search
  const filteredExpenses = allExpenses.filter(e => 
    (e.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = tasks.filter(t => 
    (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTodos = todos.filter(td => 
    (td.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // SVG Chart Computations (Group spends by category for chart rendering)
  const getCategorySpendData = () => {
    const categoryMap = {};
    allExpenses.forEach(exp => {
      const cat = exp.type === 'Project' ? 'Project Linked' : (exp.category || 'other');
      categoryMap[cat] = (categoryMap[cat] || 0) + exp.cost;
    });
    return Object.keys(categoryMap).map(key => ({
      name: key.toUpperCase(),
      amount: categoryMap[key]
    })).sort((a, b) => b.amount - a.amount).slice(0, 5); // top 5 categories
  };

  const chartData = getCategorySpendData();
  const maxSpend = chartData.length ? Math.max(...chartData.map(d => d.amount)) : 1000;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-tr from-indigo-50 dark:from-indigo-900/40 to-slate-100 dark:to-slate-900 border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <span>Hi, {user ? user.username : 'Manager'}! 👋</span>
            <Sparkles size={20} className="text-indigo-500" />
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Here is the absolute ledger and operational tracker breakdown.</p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 dark:border-indigo-500/25 px-3 py-1.5 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-semibold self-start md:self-auto">
          <TrendingUp size={16} />
          <span>Real-Time Stats Sync</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div 
            key={index}
            onClick={() => navigate(card.path)}
            className={`p-4 rounded-2xl bg-gradient-to-b ${card.bg} border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-4 shadow-sm cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all active:scale-95 duration-200`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{card.label}</span>
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850">{card.icon}</div>
            </div>
            <div>
              <h4 className="text-lg md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">{card.value}</h4>
              <p className="text-[10px] text-slate-550 dark:text-slate-500 mt-0.5">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Spend Category Bar Chart */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-white flex items-center space-x-2">
          <TrendingUp size={18} className="text-indigo-500" />
          <span>Visual Distribution: Top Spends by Category</span>
        </h3>
        
        {chartData.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">No spend data to display chart.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* SVG Visual Bars */}
            <div className="space-y-3">
              {chartData.map((item, idx) => {
                const widthPercent = (item.amount / maxSpend) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-655 dark:text-slate-400">
                      <span className="capitalize">{item.name.toLowerCase()}</span>
                      <span className="text-slate-800 dark:text-white">₹{item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-900 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-650 h-full rounded-full transition-all duration-700" 
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SVG Interactive Wheel/Grid visualization */}
            <div className="hidden md:flex justify-center">
              <svg width="220" height="220" viewBox="0 0 200 200" className="rotate-[-90deg]">
                <circle cx="100" cy="100" r="80" fill="none" className="stroke-slate-100 dark:stroke-slate-900" strokeWidth="20" />
                {chartData.map((item, idx) => {
                  const percentage = item.amount / stats.expenses;
                  const strokeDash = percentage * 502; // 2 * pi * r
                  let offset = 0;
                  for (let i = 0; i < idx; i++) {
                    offset += (chartData[i].amount / stats.expenses) * 502;
                  }
                  
                  const colors = ['stroke-indigo-600', 'stroke-rose-500', 'stroke-amber-400', 'stroke-emerald-500', 'stroke-cyan-400'];
                  return (
                    <circle 
                      key={idx}
                      cx="100" 
                      cy="100" 
                      r="80" 
                      fill="none" 
                      className={colors[idx % colors.length]} 
                      strokeWidth="20"
                      strokeDasharray={`${strokeDash} 502`}
                      strokeDashoffset={-offset}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
              <div className="self-center ml-4 space-y-1.5 text-[10px] font-bold text-slate-500 uppercase">
                {chartData.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${['bg-indigo-600', 'bg-rose-500', 'bg-amber-400', 'bg-emerald-500', 'bg-cyan-400'][idx % 5]}`} />
                    <span className="truncate max-w-[100px] capitalize">{item.name.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real Count - Full Tracking Lists */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Header containing search & tab navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-850 dark:text-white">Full-Tracking Registry</h3>
            <p className="text-[11px] text-slate-450 dark:text-slate-500">Search and track all records directly below.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search inputs */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                placeholder="Quick search registry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs px-8 py-2 rounded-xl focus:outline-none focus:border-indigo-500 w-full sm:w-60"
              />
            </div>

            {/* Tabs control */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              {[
                { id: 'expenses', label: 'Expenses', count: allExpenses.length },
                { id: 'projects', label: 'Projects', count: projects.length },
                { id: 'tasks', label: 'Tasks', count: tasks.length },
                { id: 'todos', label: 'Todos', count: todos.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                  className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-450 hover:text-slate-700'}`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab display lists */}
        <div className="space-y-3">
          
          {/* TAB 1: EXPENSES */}
          {activeTab === 'expenses' && (
            <div className="space-y-3">
              {filteredExpenses.length === 0 ? (
                <p className="text-center text-xs text-slate-450 py-8">No expenses logged matching search.</p>
              ) : (
                filteredExpenses.map(exp => (
                  <div key={exp.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-150 dark:border-slate-850/60 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                        <DollarSign size={16} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{exp.title}</h5>
                        <p className="text-[10px] text-slate-450 mt-0.5">
                          {exp.date} • <span className="capitalize text-indigo-500 font-bold">{exp.type} Cost</span> 
                          {exp.project_detail && ` • ${exp.project_detail.name}`}
                          {exp.category && ` • Category: ${exp.category}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-rose-500 flex-shrink-0">-₹{exp.cost.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-3">
              {filteredProjects.length === 0 ? (
                <p className="text-center text-xs text-slate-455 py-8">No projects matching search.</p>
              ) : (
                filteredProjects.map(proj => (
                  <div key={proj.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-150 dark:border-slate-850/60 space-y-2">
                    <div className="flex justify-between items-start">
                      <h5 className="text-xs font-black text-slate-800 dark:text-slate-250">{proj.name}</h5>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-600 bg-cyan-500/10 border border-cyan-500/10 px-2 py-0.5 rounded">
                        Project Link
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{proj.description}</p>
                    <div className="flex space-x-6 text-[10px] font-bold text-slate-400 pt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{proj.start_date} to {proj.end_date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users size={12} />
                        <span>PM: {proj.manager_detail?.name || 'Unassigned'}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <p className="text-center text-xs text-slate-450 py-8">No tasks matching search.</p>
              ) : (
                filteredTasks.map(task => {
                  const statusColors = {
                    'Pending': 'text-amber-500 bg-amber-500/10 border-amber-500/10',
                    'In Progress': 'text-indigo-500 bg-indigo-500/10 border-indigo-500/10',
                    'Completed': 'text-emerald-500 bg-emerald-500/10 border-emerald-550/10'
                  };
                  return (
                    <div key={task.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-150 dark:border-slate-850/60 flex items-center justify-between gap-4">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-205">{task.title}</h5>
                        <p className="text-[10px] text-slate-450 mt-0.5">
                          Project: {task.project_detail?.name || 'General'} • Assigned: {task.assigned_to_detail?.name || 'Unassigned'} • Due: {task.deadline}
                        </p>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${statusColors[task.status] || 'text-slate-500'}`}>
                        {task.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: TODOS */}
          {activeTab === 'todos' && (
            <div className="space-y-3">
              {filteredTodos.length === 0 ? (
                <p className="text-center text-xs text-slate-450 py-8">No reminder checklists matching search.</p>
              ) : (
                filteredTodos.map(todo => (
                  <div key={todo.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-150 dark:border-slate-850/60 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${todo.is_completed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className={`text-xs font-bold ${todo.is_completed ? 'line-through text-slate-400' : 'text-slate-705 dark:text-slate-200'}`}>
                        {todo.title}
                      </span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-indigo-500">{todo.priority}</span>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
