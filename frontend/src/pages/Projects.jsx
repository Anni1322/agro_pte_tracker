import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Briefcase, Calendar, Users, Plus, Edit2, Trash2, X, Sparkles } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    manager: ''
  });

  const fetchData = async () => {
    try {
      const projRes = await API.get('projects/');
      setProjects(projRes.data);
    } catch (err) {
      console.warn('Backend projects API offline, using fallback mock.');
      setProjects([
        { id: 1, name: 'Project Greenfield', description: 'Development of organic cereal farming plots and irrigation setups.', start_date: '2026-05-01', end_date: '2026-10-31', manager_detail: { name: 'Anil Sharma' }, manager: 1 },
        { id: 2, name: 'Warehouse Solar installation', description: 'Integrating renewable power supplies inside warehouses.', start_date: '2026-06-15', end_date: '2026-08-30', manager_detail: { name: 'Rohit Kumar' }, manager: 2 },
      ]);
    }

    try {
      const empRes = await API.get('employees/');
      setEmployees(empRes.data);
    } catch (err) {
      setEmployees([
        { id: 1, name: 'Anil Sharma' },
        { id: 2, name: 'Rohit Kumar' }
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.manager) {
      alert('Please choose a manager.');
      return;
    }
    try {
      if (editingId) {
        await API.put(`projects/${editingId}/`, formData);
      } else {
        await API.post('projects/', formData);
      }
      resetForm();
      fetchData();
    } catch (err) {
      const selectedManager = employees.find(emp => emp.id === parseInt(formData.manager));
      const manager_detail = { name: selectedManager ? selectedManager.name : 'Unknown' };
      if (editingId) {
        setProjects(projects.map(p => p.id === editingId ? { ...p, ...formData, manager_detail } : p));
      } else {
        setProjects([...projects, { id: Date.now(), ...formData, manager_detail }]);
      }
      resetForm();
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      description: project.description,
      start_date: project.start_date,
      end_date: project.end_date,
      manager: project.manager || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await API.delete(`projects/${id}/`);
      fetchData();
    } catch (err) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', start_date: '', end_date: '', manager: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header card */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors">
        <div>
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
            <span>Project Board</span>
            <Sparkles size={20} className="text-indigo-500" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Initialize and manage active agribusiness projects.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center space-x-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Dynamic Slide down form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg transition-colors">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
              {editingId ? 'Edit Project Setup' : 'Create New Project'}
            </h4>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Project Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Project Greenfield"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
              <textarea 
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-800 dark:text-white h-24 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Provide detailed information about the target goals..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">End Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Project Manager</label>
                <select
                  required
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select Manager</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button 
              type="button" 
              onClick={resetForm}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-850"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20"
            >
              {editingId ? 'Save Setup' : 'Launch Project'}
            </button>
          </div>
        </form>
      )}

      {/* Projects Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full text-center p-12 bg-white dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-900">
            <p className="text-slate-500 text-sm">No active projects loaded. Create a new project to start tracking.</p>
          </div>
        ) : (
          projects.map((proj) => (
            <div 
              key={proj.id} 
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 px-3 py-1 rounded-lg text-xs font-bold">
                    <Briefcase size={14} />
                    <span>Project ID: {proj.id}</span>
                  </div>

                  <div className="flex space-x-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(proj)}
                      className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(proj.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="text-base font-black text-slate-800 dark:text-slate-200">{proj.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {proj.description}
                  </p>
                </div>
              </div>

              {/* Footer info containing Dates and Managers */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-900 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Timelines</span>
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <Calendar size={13} className="text-slate-400" />
                    <span>{proj.start_date} to {proj.end_date}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Project Manager</span>
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <Users size={13} className="text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-350">{proj.manager_detail?.name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
