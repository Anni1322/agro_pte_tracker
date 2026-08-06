import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Search, Plus, Mail, Phone, Briefcase, Trash2, Edit2, X, Sparkles } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: ''
  });

  const fetchEmployees = async () => {
    try {
      const res = await API.get('employees/');
      setEmployees(res.data);
    } catch (err) {
      console.warn('Backend offline, using fallback mock employee data.');
      setEmployees([
        { id: 1, name: 'Anil Sharma', email: 'anil@agro.com', phone: '+91 9876543210', designation: 'General Manager' },
        { id: 2, name: 'Rohit Kumar', email: 'rohit@agro.com', phone: '+91 8765432109', designation: 'Field Supervisor' },
        { id: 3, name: 'Arjun Singh', email: 'arjun@agro.com', phone: '+91 7654321098', designation: 'Tractor Operator' },
      ]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`employees/${editingId}/`, formData);
      } else {
        await API.post('employees/', formData);
      }
      resetForm();
      fetchEmployees();
    } catch (err) {
      // Mock update/creation fallback
      if (editingId) {
        setEmployees(employees.map(emp => emp.id === editingId ? { ...emp, ...formData } : emp));
      } else {
        setEmployees([...employees, { id: Date.now(), ...formData }]);
      }
      resetForm();
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      designation: employee.designation
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await API.delete(`employees/${id}/`);
      fetchEmployees();
    } catch (err) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', designation: '' });
    setShowForm(false);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) || 
    emp.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header card */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors">
        <div>
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
            <span>Staff Directory</span>
            <Sparkles size={20} className="text-indigo-500" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage team members, designations, and contact info.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center space-x-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={16} />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Slide-down Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg transition-colors">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
              {editingId ? 'Edit Team Member' : 'Add New Team Member'}
            </h4>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
              <input 
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Anil Sharma"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Designation / Role</label>
              <input 
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Field Supervisor"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
              <input 
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="anil@agro.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
              <input 
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="+91 9876543210"
              />
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
              {editingId ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      )}

      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          placeholder="Search staff by name or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm transition-colors"
        />
      </div>

      {/* Staff list grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredEmployees.length === 0 ? (
          <div className="col-span-full text-center p-12 bg-white dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-900">
            <p className="text-slate-500 text-sm">No employees match your search.</p>
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <div 
              key={emp.id} 
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm hover:shadow transition-all group"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-indigo-550/10 dark:bg-indigo-500/10 border border-indigo-250/20 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(emp)}
                      className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(emp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">{emp.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider flex items-center space-x-1">
                    <Briefcase size={12} className="inline mr-1 text-slate-500" />
                    {emp.designation}
                  </p>
                </div>
              </div>

              {/* Contact info links */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-900 space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <a href={`mailto:${emp.email}`} className="flex items-center hover:text-indigo-500 transition-colors">
                  <Mail size={12} className="mr-2" />
                  <span className="truncate">{emp.email}</span>
                </a>
                <a href={`tel:${emp.phone}`} className="flex items-center hover:text-indigo-500 transition-colors">
                  <Phone size={12} className="mr-2" />
                  <span>{emp.phone}</span>
                </a>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
