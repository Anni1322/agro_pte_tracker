import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Lock, User, Mail, AlertCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setLoading(true);
    const res = await signup(username, email, password);
    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-200">
      
      {/* Floating Theme Toggle (top-right) */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors shadow-sm"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Main card panel */}
      <div className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 shadow-xl space-y-6 transition-all duration-205">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-650 dark:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-650/20">
            <Leaf size={24} />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">Register Manager</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Create a tracking account</p>
        </div>

        {/* Display validation error */}
        {error && (
          <div className="flex items-center space-x-2 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-450 font-medium">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User size={16} />
              </span>
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Pick username"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address (Optional)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail size={16} />
              </span>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@agribusiness.com"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="🔒🔒🔒🔒🔒"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-650 hover:bg-indigo-600 active:scale-98 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Redirect options */}
        <div className="text-center pt-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
          <span>Already have an account? </span>
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
            Sign In
          </Link>
        </div>

      </div>

    </div>
  );
}
