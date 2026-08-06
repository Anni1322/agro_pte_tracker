import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Wallet, Calendar, Users, Briefcase, Plus, Trash2, Edit2, X, Sparkles, DollarSign, Tag, Filter, Download, Upload } from 'lucide-react';

export default function Expenses() {
  const [activeTab, setActiveTab] = useState('project'); // 'project' or 'daily'
  
  // Project Expenses States
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', amount: '', description: '', project: '', employee: ''
  });

  // Project Spend Filter States
  const [filterProjProject, setFilterProjProject] = useState('');
  const [filterProjEmployee, setFilterProjEmployee] = useState('');
  const [filterProjMonth, setFilterProjMonth] = useState('');
  const [filterProjYear, setFilterProjYear] = useState('');

  // Daily Spends (Day-Wise) States
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [showDailyForm, setShowDailyForm] = useState(false);
  const [editingDailyId, setEditingDailyId] = useState(null);
  const [dailyFormData, setDailyFormData] = useState({
    date: new Date().toISOString().split('T')[0], category: 'food', amount: '', description: ''
  });
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Daily Spends Filter States
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const categories = [
    { value: 'rent', label: 'Rent' },
    { value: 'monthexpences', label: 'Month Expenses' },
    { value: 'food', label: 'Food' },
    { value: 'helth', label: 'Health Gadget' },
    { value: 'helthfood', label: 'Health Food' },
    { value: 'transport', label: 'Transport' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other' }
  ];

  const fetchProjectExpenses = async () => {
    try {
      const expRes = await API.get('expenses/');
      setExpenses(expRes.data);
    } catch (err) {
      console.warn('Backend expenses API offline, showing fallback.');
    }
  };

  const fetchDailyExpenses = async () => {
    try {
      // Build query parameters for backend filters
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;

      const res = await API.get('day-wise-expenses/', { params });
      setDailyExpenses(res.data);
    } catch (err) {
      console.warn('Backend day-wise expenses API offline, showing fallback.');
      setDailyExpenses([
        { id: 1, date: '2026-06-25', category: 'monthexpences', amount: '8400.00', description: 'Monthly warehouse utility bills.' },
        { id: 2, date: '2026-06-24', category: 'transport', amount: '1200.00', description: 'Diesel refill for delivery van.' },
      ]);
    }
  };

  const fetchRelations = async () => {
    try {
      const projRes = await API.get('projects/');
      setProjects(projRes.data);
      const empRes = await API.get('employees/');
      setEmployees(empRes.data);
    } catch (err) {
      setProjects([{ id: 1, name: 'Project Greenfield' }, { id: 2, name: 'Warehouse Solar' }]);
      setEmployees([{ id: 1, name: 'Anil Sharma' }, { id: 2, name: 'Rohit Kumar' }]);
    }
  };

  useEffect(() => {
    fetchRelations();
    fetchProjectExpenses();
    fetchDailyExpenses();
  }, [filterCategory, filterMonth, filterYear]);

  // Project Expense Actions
  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!formData.amount || isNaN(formData.amount)) return;
    
    const payload = {
      ...formData,
      project: formData.project === '' ? null : parseInt(formData.project),
      employee: formData.employee === '' ? null : parseInt(formData.employee),
    };

    try {
      if (editingId) {
        await API.patch(`expenses/${editingId}/`, payload);
      } else {
        await API.post('expenses/', payload);
      }
      resetForm();
      fetchProjectExpenses();
    } catch (err) {
      const mockProj = projects.find(p => p.id === parseInt(formData.project)) || { name: 'General' };
      const project_detail = { name: mockProj.name };
      if (editingId) {
        setExpenses(expenses.map(exp => exp.id === editingId ? { ...exp, ...formData, project_detail } : exp));
      } else {
        const mockNew = {
          id: Date.now(),
          ...formData,
          date: new Date().toISOString().split('T')[0],
          project_detail: project_detail
        };
        setExpenses([mockNew, ...expenses]);
      }
      resetForm();
    }
  };

  const handleEditExpense = (exp) => {
    setEditingId(exp.id);
    setFormData({
      title: exp.title,
      amount: exp.amount,
      description: exp.description || '',
      project: exp.project || '',
      employee: exp.employee || ''
    });
    setShowForm(true);
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project expense?')) return;
    try {
      await API.delete(`expenses/${id}/`);
      fetchProjectExpenses();
    } catch (err) {
      setExpenses(expenses.filter(exp => exp.id !== id));
    }
  };

  // Daily Spend Actions
  const handleSubmitDailyExpense = async (e) => {
    e.preventDefault();
    if (!dailyFormData.amount || isNaN(dailyFormData.amount)) return;
    try {
      if (editingDailyId) {
        await API.patch(`day-wise-expenses/${editingDailyId}/`, dailyFormData);
      } else {
        await API.post('day-wise-expenses/', dailyFormData);
      }
      resetDailyForm();
      fetchDailyExpenses();
    } catch (err) {
      if (editingDailyId) {
        setDailyExpenses(dailyExpenses.map(exp => exp.id === editingDailyId ? { ...exp, ...dailyFormData } : exp));
      } else {
        const mockNew = {
          id: Date.now(),
          ...dailyFormData
        };
        setDailyExpenses([mockNew, ...dailyExpenses]);
      }
      resetDailyForm();
    }
  };

  const handleEditDailyExpense = (exp) => {
    setEditingDailyId(exp.id);
    const isBase = ['rent', 'monthexpences', 'food', 'helth', 'helthfood', 'transport', 'shopping', 'entertainment', 'other'].includes(exp.category);
    setIsCustomCategory(!isBase);
    setDailyFormData({
      date: exp.date,
      category: exp.category || 'food',
      amount: exp.amount,
      description: exp.description || ''
    });
    setShowDailyForm(true);
  };

  const handleDeleteDailyExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this daily spend record?')) return;
    try {
      await API.delete(`day-wise-expenses/${id}/`);
      fetchDailyExpenses();
    } catch (err) {
      setDailyExpenses(dailyExpenses.filter(exp => exp.id !== id));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', amount: '', description: '', project: '', employee: '' });
    setShowForm(false);
  };

  const resetDailyForm = () => {
    setEditingDailyId(null);
    setDailyFormData({ date: new Date().toISOString().split('T')[0], category: 'food', amount: '', description: '' });
    setIsCustomCategory(false);
    setShowDailyForm(false);
  };

  // Dynamically collect custom categories from dailyExpenses to add to the filter and choose list
  const getDynamicCategories = () => {
    const baseKeys = new Set(categories.map(c => c.value));
    const dynamic = [...categories];
    dailyExpenses.forEach(exp => {
      if (exp.category && !baseKeys.has(exp.category)) {
        baseKeys.add(exp.category);
        dynamic.push({ value: exp.category, label: exp.category.charAt(0).toUpperCase() + exp.category.slice(1) });
      }
    });
    return dynamic;
  };

  // Client-side filtering for Project-Linked Expenses
  const filteredProjectExpenses = expenses.filter(exp => {
    if (filterProjProject && String(exp.project) !== filterProjProject) return false;
    if (filterProjEmployee && String(exp.employee) !== filterProjEmployee) return false;
    if (filterProjMonth && exp.date) {
      const expMonth = new Date(exp.date).getMonth() + 1;
      if (String(expMonth) !== filterProjMonth) return false;
    }
    if (filterProjYear && exp.date) {
      const expYear = new Date(exp.date).getFullYear();
      if (String(expYear) !== filterProjYear) return false;
    }
    return true;
  });

  const totalProjectSpend = filteredProjectExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const totalDailySpend = dailyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  // Excel / CSV Export Logic
  const exportToExcel = (type) => {
    let dataToExport = [];
    let headers = [];
    let filename = '';

    if (type === 'project') {
      dataToExport = filteredProjectExpenses;
      headers = ['Title', 'Amount (₹)', 'Date', 'Project', 'Employee', 'Description'];
      filename = `Project_Expenses_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      dataToExport = dailyExpenses;
      headers = ['Date', 'Category', 'Amount (₹)', 'Logged By', 'Description'];
      filename = `Daily_Spends_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csvContent = [
      headers.join(','),
      ...dataToExport.map(item => {
        let fields = [];
        if (type === 'project') {
          fields = [
            item.title,
            item.amount,
            item.date,
            item.project_detail?.name || '',
            item.employee_detail?.name || '',
            item.description
          ];
        } else {
          const catLabel = getDynamicCategories().find(c => c.value === item.category)?.label || item.category || '';
          fields = [
            item.date,
            catLabel,
            item.amount,
            item.username || '',
            item.description
          ];
        }
        return fields.map(field => {
          const stringified = String(field ?? '');
          const escaped = stringified.replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',');
      })
    ].join('\r\n');

    // Create Blob and trigger download (adds BOM to ensure correct Excel encoding)
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Excel / CSV Import Logic
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          alert('CSV file is empty or missing data rows.');
          return;
        }

        // Parse headers
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        
        // Find indices for standard columns
        const dateIdx = headers.findIndex(h => h.includes('date'));
        const categoryIdx = headers.findIndex(h => h.includes('category'));
        const amountIdx = headers.findIndex(h => h.includes('amount'));
        const descIdx = headers.findIndex(h => h.includes('description'));
        const titleIdx = headers.findIndex(h => h.includes('title'));

        if (activeTab === 'daily') {
          if (dateIdx === -1 || categoryIdx === -1 || amountIdx === -1) {
            alert('CSV must contain Date, Category, and Amount columns.');
            return;
          }
        } else {
          if (titleIdx === -1 || amountIdx === -1) {
            alert('CSV must contain Title and Amount columns for Project-Linked expenses.');
            return;
          }
        }

        let importCount = 0;
        let skipCount = 0;

        // Process rows helper (handles commas inside quoted text)
        const parseRow = (line) => {
          const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
          return matches.map(val => val.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        };

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const row = parseRow(line);
          if (row.length === 0) continue;

          if (activeTab === 'daily') {
            const rawDate = row[dateIdx] || new Date().toISOString().split('T')[0];
            const rawCategory = row[categoryIdx] || 'other';
            const rawAmount = parseFloat(row[amountIdx]);
            const rawDesc = descIdx !== -1 ? row[descIdx] : '';

            if (isNaN(rawAmount)) {
              skipCount++;
              continue;
            }

            await API.post('day-wise-expenses/', {
              date: rawDate,
              category: rawCategory.toLowerCase(),
              amount: rawAmount,
              description: rawDesc
            });
            importCount++;
          } else {
            const rawTitle = row[titleIdx];
            const rawAmount = parseFloat(row[amountIdx]);
            const rawDesc = descIdx !== -1 ? row[descIdx] : '';
            const projName = row[headers.findIndex(h => h.includes('project'))] || '';
            const empName = row[headers.findIndex(h => h.includes('employee'))] || '';

            if (!rawTitle || isNaN(rawAmount)) {
              skipCount++;
              continue;
            }

            const matchedProj = projects.find(p => p.name.toLowerCase() === projName.toLowerCase());
            const matchedEmp = employees.find(e => e.name.toLowerCase() === empName.toLowerCase());

            await API.post('expenses/', {
              title: rawTitle,
              amount: rawAmount,
              description: rawDesc,
              project: matchedProj ? matchedProj.id : null,
              employee: matchedEmp ? matchedEmp.id : null
            });
            importCount++;
          }
        }

        alert(`Successfully imported ${importCount} expenses! (Skipped ${skipCount} invalid rows)`);
        
        if (activeTab === 'daily') {
          fetchDailyExpenses();
        } else {
          fetchProjectExpenses();
        }
      } catch (err) {
        console.error('Error importing CSV:', err);
        alert('Failed to parse or import CSV. Please ensure formatting is correct.');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  return (
    <div className="space-y-6">
      
      {/* Finance Overview Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-tr from-rose-50 dark:from-rose-900/40 to-slate-100 dark:to-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm transition-colors">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-rose-650 dark:text-rose-500 font-bold text-xs uppercase tracking-wider">
            <Wallet size={16} />
            <span>Finance Tracker & Ledger</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-baseline">
            <span>₹{(activeTab === 'project' ? totalProjectSpend : totalDailySpend).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold ml-2">Total tab spend</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {activeTab === 'project' ? 'Aggregated costs linked to project deliverables.' : 'Daily logistics, meals, leases, and administrative costs.'}
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto flex-wrap gap-2">
          <button
            onClick={() => document.getElementById('csv-import-input').click()}
            className="flex items-center space-x-2 bg-cyan-650 hover:bg-cyan-600 text-white font-bold text-xs md:text-sm px-5 py-3 rounded-xl transition-all shadow-md shadow-cyan-600/20 active:scale-95"
            title="Import expenses from a CSV/Excel file"
          >
            <Upload size={16} />
            <span>Import Excel</span>
          </button>
          <input
            id="csv-import-input"
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          <button
            onClick={() => exportToExcel(activeTab)}
            className="flex items-center space-x-2 bg-emerald-650 hover:bg-emerald-600 text-white font-bold text-xs md:text-sm px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            title="Download all listed expenses to CSV (Excel format)"
          >
            <Download size={16} />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => activeTab === 'project' ? setShowForm(!showForm) : setShowDailyForm(!showDailyForm)}
            className="flex items-center space-x-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs md:text-sm px-5 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Plus size={16} />
            <span>{activeTab === 'project' ? 'Add Project Expense' : 'Log Daily Spend'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-850">
        <button
          onClick={() => setActiveTab('project')}
          className={`px-6 py-3 text-xs md:text-sm font-black tracking-wider uppercase border-b-2 transition-all ${activeTab === 'project' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Project-Linked Expenses
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-6 py-3 text-xs md:text-sm font-black tracking-wider uppercase border-b-2 transition-all ${activeTab === 'daily' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Daily Spends Ledger
        </button>
      </div>

      {/* --- TAB 1: PROJECT LINKED EXPENSES --- */}
      {activeTab === 'project' && (
        <div className="space-y-6">
          {/* Advanced Filtering Header */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
            <div className="flex items-center space-x-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Filter size={16} className="text-indigo-650" />
              <span>Project Spends Filters</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full md:w-auto">
              <select
                value={filterProjProject}
                onChange={(e) => setFilterProjProject(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none"
              >
                <option value="">All Projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <select
                value={filterProjEmployee}
                onChange={(e) => setFilterProjEmployee(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none"
              >
                <option value="">All Employees</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>

              <select
                value={filterProjMonth}
                onChange={(e) => setFilterProjMonth(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none"
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(2026, m - 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>

              <select
                value={filterProjYear}
                onChange={(e) => setFilterProjYear(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none"
              >
                <option value="">All Years</option>
                {['2025', '2026', '2027'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Add form slide down */}
          {showForm && (
            <form onSubmit={handleSubmitExpense} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg transition-colors">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200">
                  {editingId ? 'Edit Project Deliverable Cost' : 'Log Project Deliverable Cost'}
                </h4>
                <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Expense Title</label>
                    <input 
                      type="text" required value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Fertilizer purchase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Amount (₹)</label>
                    <input 
                      type="number" step="0.01" required value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. 7500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Description / Details</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-800 dark:text-white h-20 focus:outline-none focus:border-indigo-500"
                    placeholder="Details about raw materials, invoice number, etc..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Link Project (Optional)</label>
                    <select
                      value={formData.project}
                      onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none"
                    >
                      <option value="">No Project Link</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Link Employee (Optional)</label>
                    <select
                      value={formData.employee}
                      onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none"
                    >
                      <option value="">No Staff Link</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-xl text-xs font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2.5 bg-indigo-650 text-white font-bold rounded-xl text-xs shadow-md">Save Cost</button>
              </div>
            </form>
          )}

          {/* List display */}
          <div className="space-y-3">
            {filteredProjectExpenses.length === 0 ? (
              <div className="text-center p-12 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-slate-500 text-sm">No project-linked expenses registered.</p>
              </div>
            ) : (
              filteredProjectExpenses.map((exp) => (
                <div key={exp.id} className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/60 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow transition-all group">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-250/20 flex items-center justify-center flex-shrink-0">
                      <DollarSign size={18} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">{exp.title}</h4>
                      {exp.description && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{exp.description}</p>}
                      <div className="flex flex-wrap gap-2 pt-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {exp.project_detail && (
                          <span className="flex items-center space-x-1 bg-slate-105 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 px-2 py-0.5 rounded">
                            <Briefcase size={10} className="mr-1 text-slate-500" />
                            {exp.project_detail.name}
                          </span>
                        )}
                        {exp.employee_detail && (
                          <span className="flex items-center space-x-1 bg-slate-105 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 px-2 py-0.5 rounded">
                            <Users size={10} className="mr-1 text-slate-500" />
                            {exp.employee_detail.name}
                          </span>
                        )}
                        {exp.date && (
                          <span className="flex items-center space-x-1 bg-slate-105 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 px-2 py-0.5 rounded text-slate-400">
                            <Calendar size={10} className="mr-1 text-slate-550" />
                            {exp.date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end space-x-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-900">
                    <span className="text-base font-black text-rose-600 dark:text-rose-450 mr-2">-₹{parseFloat(exp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <button onClick={() => handleEditExpense(exp)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all" title="Edit"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteExpense(exp.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: DAILY/CATEGORY-WISE EXPENSES --- */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Advanced Filtering Header */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
            <div className="flex items-center space-x-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Filter size={16} className="text-indigo-650" />
              <span>Spend Filters</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none"
              >
                <option value="">All Categories</option>
                {getDynamicCategories().map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>

              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none"
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(2026, m - 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>

              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none"
              >
                <option value="">All Years</option>
                {['2025', '2026', '2027'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Add form slide down */}
          {showDailyForm && (
            <form onSubmit={handleSubmitDailyExpense} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg transition-colors">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200">
                  {editingDailyId ? 'Edit Daily / Category Spend' : 'Log Daily / Category Spend'}
                </h4>
                <button type="button" onClick={resetDailyForm} className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Date</label>
                    <input 
                      type="date" required value={dailyFormData.date}
                      onChange={(e) => setDailyFormData({ ...dailyFormData, date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Spend Category</label>
                    <select
                      value={isCustomCategory ? 'custom' : dailyFormData.category}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setIsCustomCategory(true);
                          setDailyFormData({ ...dailyFormData, category: '' });
                        } else {
                          setIsCustomCategory(false);
                          setDailyFormData({ ...dailyFormData, category: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-855 dark:text-white focus:outline-none"
                    >
                      {getDynamicCategories().map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      <option value="custom">+ Add Custom Category...</option>
                    </select>
                    {isCustomCategory && (
                      <input 
                        type="text" required value={dailyFormData.category}
                        onChange={(e) => setDailyFormData({ ...dailyFormData, category: e.target.value })}
                        className="w-full mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 animate-in fade-in duration-200"
                        placeholder="Type custom category name..."
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Amount (₹)</label>
                    <input 
                      type="number" step="0.01" required value={dailyFormData.amount}
                      onChange={(e) => setDailyFormData({ ...dailyFormData, amount: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none"
                      placeholder="e.g. 450"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Details / Description</label>
                  <textarea 
                    value={dailyFormData.description}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-800 dark:text-white h-20 focus:outline-none"
                    placeholder="Details about vendor, items, quantities..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={resetDailyForm} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-xl text-xs font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2.5 bg-indigo-650 text-white font-bold rounded-xl text-xs shadow-md">Log Spend</button>
              </div>
            </form>
          )}

          {/* List display */}
          <div className="space-y-3">
            {dailyExpenses.length === 0 ? (
              <div className="text-center p-12 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-slate-500 text-sm">No daily spends matching these criteria were found.</p>
              </div>
            ) : (
              dailyExpenses.map((exp) => (
                <div key={exp.id} className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/60 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow transition-all group">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-250/20 flex items-center justify-center flex-shrink-0">
                      <Tag size={18} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-black text-slate-850 dark:text-slate-200 capitalize">
                          {getDynamicCategories().find(c => c.value === exp.category)?.label || exp.category}
                        </h4>
                        {exp.username && (
                          <span className="text-[10px] font-bold text-slate-450 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 px-2 py-0.5 rounded">
                            Logged by: {exp.username}
                          </span>
                        )}
                      </div>
                      {exp.description && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{exp.description}</p>}
                      <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400">
                        <Calendar size={11} />
                        <span>Date: {exp.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end space-x-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-900">
                    <span className="text-base font-black text-rose-600 dark:text-rose-450 mr-2">-₹{parseFloat(exp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <button onClick={() => handleEditDailyExpense(exp)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all" title="Edit"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteDailyExpense(exp.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
