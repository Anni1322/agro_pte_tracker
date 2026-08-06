import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { ClipboardList, Calendar, Users, Briefcase, Plus, Trash2, Edit2, ArrowRight, X, Sparkles } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Filter States
  const [filterProject, setFilterProject] = useState('');
  const [filterAssignedTo, setFilterAssignedTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    project: '',
    status: 'Pending',
    deadline: ''
  });

  const fetchData = async () => {
    try {
      const params = {};
      if (filterProject) params.project = filterProject;
      if (filterAssignedTo) params.assigned_to = filterAssignedTo;
      if (filterStatus) params.status = filterStatus;

      const taskRes = await API.get('tasks/', { params });
      setTasks(taskRes.data);
    } catch (err) {
      console.warn('Backend tasks API offline, using fallback mock.');
      setTasks([
        { id: 1, title: 'Irrigation Drip Setup', description: 'Install drip pipes in Block B.', status: 'Pending', deadline: '2026-07-05', assigned_to_detail: { name: 'Rohit Kumar' }, project_detail: { name: 'Project Greenfield' }, project: 1, assigned_to: 2 },
        { id: 2, title: 'Seed Sowing', description: 'Plant corn seeds in rows.', status: 'In Progress', deadline: '2026-06-30', assigned_to_detail: { name: 'Arjun Singh' }, project_detail: { name: 'Project Greenfield' }, project: 1, assigned_to: 3 },
        { id: 3, title: 'Tractor Overhaul', description: 'Perform engine and oil service.', status: 'Completed', deadline: '2026-06-25', assigned_to_detail: { name: 'Arjun Singh' }, project_detail: { name: 'Warehouse Solar' }, project: 2, assigned_to: 3 },
      ]);
    }

    try {
      const empRes = await API.get('employees/');
      setEmployees(empRes.data);
      const projRes = await API.get('projects/');
      setProjects(projRes.data);
    } catch (err) {
      setEmployees([{ id: 2, name: 'Rohit Kumar' }, { id: 3, name: 'Arjun Singh' }]);
      setProjects([{ id: 1, name: 'Project Greenfield' }, { id: 2, name: 'Warehouse Solar' }]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterProject, filterAssignedTo, filterStatus]);

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!formData.assigned_to || !formData.project) {
      alert('Please assign an employee and project.');
      return;
    }
    try {
      if (editingId) {
        await API.patch(`tasks/${editingId}/`, formData);
      } else {
        await API.post('tasks/', formData);
      }
      resetForm();
      fetchData();
    } catch (err) {
      // Mock create/edit fallback
      const mockAssigned = employees.find(e => e.id === parseInt(formData.assigned_to)) || { name: 'Unassigned' };
      const mockProject = projects.find(p => p.id === parseInt(formData.project)) || { name: 'General' };
      const manager_detail = { name: mockAssigned.name };
      const project_detail = { name: mockProject.name };
      
      if (editingId) {
        setTasks(tasks.map(t => t.id === editingId ? { ...t, ...formData, assigned_to_detail: manager_detail, project_detail } : t));
      } else {
        const mockNew = {
          id: Date.now(),
          ...formData,
          assigned_to_detail: manager_detail,
          project_detail: project_detail
        };
        setTasks([...tasks, mockNew]);
      }
      resetForm();
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to || '',
      project: task.project || '',
      status: task.status || 'Pending',
      deadline: task.deadline || ''
    });
    setShowForm(true);
  };

  const handleUpdateStatus = async (task, newStatus) => {
    const updatedTask = { ...task, status: newStatus };
    try {
      await API.patch(`tasks/${task.id}/`, { status: newStatus });
      fetchData();
    } catch (err) {
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await API.delete(`tasks/${id}/`);
      fetchData();
    } catch (err) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', assigned_to: '', project: '', status: 'Pending', deadline: '' });
    setShowForm(false);
  };

  const statuses = ['Pending', 'In Progress', 'Completed'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors">
        <div>
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
            <span>Operational Tasks</span>
            <Sparkles size={20} className="text-indigo-500" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Assign, status-track, and coordinate staff operations.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-indigo-655 hover:bg-indigo-600 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center space-x-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span>Filters</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none"
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select
            value={filterAssignedTo}
            onChange={(e) => setFilterAssignedTo(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none"
          >
            <option value="">All Staff</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Form Slide down */}
      {showForm && (
        <form onSubmit={handleSubmitTask} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg transition-colors">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
              {editingId ? 'Edit Operational Task' : 'Assign Operational Task'}
            </h4>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Task Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Harvest Block A Crops"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Project</label>
                <select
                  required
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Instructions / Details</label>
              <textarea 
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-800 dark:text-white h-20 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Detail crop specifics, equipment needs..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Assign To (Staff)</label>
                <select
                  required
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Deadline</label>
                <input 
                  type="date" 
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
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
              Assign Task
            </button>
          </div>
        </form>
      )}

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statuses.map((status) => {
          const colTasks = tasks.filter(t => t.status === status);
          
          const titleColors = {
            'Pending': 'text-amber-500 border-amber-500/20 bg-amber-500/10',
            'In Progress': 'text-indigo-500 border-indigo-500/20 bg-indigo-500/10',
            'Completed': 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
          };

          return (
            <div key={status} className="bg-slate-100/60 dark:bg-slate-950/40 rounded-2xl border border-slate-200/50 dark:border-slate-900/50 p-4 space-y-4 flex flex-col min-h-[300px]">
              
              {/* Column Header */}
              <div className={`px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wider flex justify-between items-center ${titleColors[status]}`}>
                <span>{status}</span>
                <span className="font-bold text-xs">{colTasks.length}</span>
              </div>

              {/* Tasks list inside column */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] text-slate-400">
                    No tasks here
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3 shadow-sm hover:shadow active:scale-98 transition-all group"
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 leading-snug">{task.title}</h5>
                          <div className="flex space-x-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEdit(task)}
                              className="text-slate-400 hover:text-indigo-500 p-1 rounded transition-all"
                              title="Edit"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded transition-all"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      {/* Details tags */}
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1.5">
                          <Briefcase size={12} className="text-slate-400" />
                          <span className="truncate">{task.project_detail?.name || 'General Project'}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Users size={12} className="text-slate-400" />
                          <span>{task.assigned_to_detail?.name || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-500">
                          <Calendar size={12} />
                          <span>Due: {task.deadline}</span>
                        </div>
                      </div>

                      {/* Status advancement options */}
                      <div className="flex justify-end pt-1">
                        {status === 'Pending' && (
                          <button 
                            onClick={() => handleUpdateStatus(task, 'In Progress')}
                            className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md flex items-center space-x-1"
                          >
                            <span>Start Work</span>
                            <ArrowRight size={10} />
                          </button>
                        )}
                        {status === 'In Progress' && (
                          <button 
                            onClick={() => handleUpdateStatus(task, 'Completed')}
                            className="text-[9px] font-black text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md flex items-center space-x-1"
                          >
                            <span>Mark Done</span>
                            <ArrowRight size={10} />
                          </button>
                        )}
                        {status === 'Completed' && (
                          <button 
                            onClick={() => handleUpdateStatus(task, 'Pending')}
                            className="text-[9px] font-black text-slate-400 hover:bg-slate-500/10 border border-slate-500/20 px-2 py-1 rounded-md"
                          >
                            Re-open task
                          </button>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
