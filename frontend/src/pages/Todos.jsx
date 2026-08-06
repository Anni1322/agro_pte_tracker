import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { CheckCircle2, Circle, Trash2, Edit2, Plus, Sparkles } from 'lucide-react';

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', category: 'Work' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  
  // Filter States
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchTodos = async () => {
    try {
      const params = {};
      if (filterPriority) params.priority = filterPriority;
      if (filterCategory) params.category = filterCategory;

      const res = await API.get('todos/', { params });
      setTodos(res.data);
    } catch (err) {
      console.warn('Backend API offline, loading mock todo data.');
      setTodos([
        { id: 1, title: 'Harvest Greenfield Oats', description: 'Schedule tractor and crew', priority: 'urgent', is_completed: false },
        { id: 2, title: 'Verify Warehouse Stock', description: 'Count fertilizer bags', priority: 'high', is_completed: true },
        { id: 3, title: 'Call Tractor Repair Service', description: 'Fix hydraulics issue', priority: 'medium', is_completed: false },
      ]);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [filterPriority, filterCategory]);

  const handleToggleComplete = async (todo) => {
    const updated = { ...todo, is_completed: !todo.is_completed };
    try {
      await API.patch(`todos/${todo.id}/`, { is_completed: !todo.is_completed });
      fetchTodos();
    } catch (err) {
      // Mock toggle fallback
      setTodos(todos.map(t => t.id === todo.id ? updated : t));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    try {
      if (editingId) {
        await API.patch(`todos/${editingId}/`, formData);
      } else {
        await API.post('todos/', formData);
      }
      resetForm();
      fetchTodos();
    } catch (err) {
      // Mock create/edit fallback
      if (editingId) {
        setTodos(todos.map(t => t.id === editingId ? { ...t, ...formData } : t));
      } else {
        const mockNew = {
          id: Date.now(),
          ...formData,
          is_completed: false
        };
        setTodos([mockNew, ...todos]);
      }
      resetForm();
    }
  };

  const handleEdit = (todo) => {
    setEditingId(todo.id);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority || 'medium',
      category: todo.category || 'Work'
    });
    setShowForm(true);
  };

  const handleDeleteTodo = async (id) => {
    try {
      await API.delete(`todos/${id}/`);
      fetchTodos();
    } catch (err) {
      // Mock delete fallback
      setTodos(todos.filter(t => t.id !== id));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', priority: 'medium', category: 'Work' });
    setShowForm(false);
  };

  const priorityColors = {
    low: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-205 dark:border-slate-700',
    medium: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    high: 'bg-orange-500/10 text-orange-605 dark:text-orange-405 border border-orange-500/20',
    urgent: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <span>Reminders & Tasks</span>
            <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Keep track of operations and daily workflows.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center space-x-2 bg-indigo-660 hover:bg-indigo-500 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-650/20 active:scale-95"
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
        
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent Priority</option>
          </select>

          <input
            type="text"
            placeholder="Category filter..."
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none placeholder-slate-400"
          />
        </div>
      </div>

      {/* Slide down creation form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/90 dark:bg-slate-950/80 backdrop-blur border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg transition-colors">
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
            {editingId ? 'Edit Operational Task' : 'Create Operational Task'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Task Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
            
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>

            <input 
              type="text" 
              placeholder="Category (e.g. Work, Harvest)"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <textarea 
            placeholder="Add description or instructions..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl p-4 text-xs text-slate-800 dark:text-white h-24 focus:outline-none focus:border-indigo-500 transition-colors"
          />

          <div className="flex justify-end space-x-2 pt-2">
            <button 
              type="button" 
              onClick={resetForm}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-850 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
            >
              {editingId ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      )}

      {/* Todo List */}
      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm">
            <p className="text-slate-500 text-sm">No tasks logged. Tap "New Task" to create one.</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div 
              key={todo.id} 
              className="bg-white dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-805/60 p-4 rounded-2xl flex items-center justify-between gap-4 transition-all shadow-sm hover:shadow group"
            >
              <div className="flex items-center space-x-4 min-w-0">
                <button 
                  onClick={() => handleToggleComplete(todo)}
                  className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0"
                >
                  {todo.is_completed ? (
                    <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-500 fill-indigo-500/10" />
                  ) : (
                    <Circle className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className={`text-sm font-bold text-slate-700 dark:text-slate-200 truncate ${todo.is_completed ? 'line-through text-slate-400 dark:text-slate-550' : ''}`}>
                      {todo.title}
                    </h4>
                    {todo.category && (
                      <span className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 px-2 py-0.5 rounded-full capitalize">
                        {todo.category}
                      </span>
                    )}
                  </div>
                  {todo.description && (
                    <p className={`text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate ${todo.is_completed ? 'line-through text-slate-350 dark:text-slate-600' : ''}`}>
                      {todo.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0">
                <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full ${priorityColors[todo.priority]}`}>
                  {todo.priority}
                </span>
                <button 
                  onClick={() => handleEdit(todo)}
                  className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
