import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, CheckSquare, ClipboardList, Wallet, 
  Users, Briefcase, Menu, X, Plus, Sun, Moon, LogOut, BarChart3, Sparkles
} from 'lucide-react';

export default function AppShell({ children, onFabClick }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Tasks', path: '/tasks', icon: <ClipboardList size={20} /> },
    { name: 'Expenses', path: '/expenses', icon: <Wallet size={20} /> },
    { name: 'Todos', path: '/todos', icon: <CheckSquare size={20} /> },
    { name: 'Projects', path: '/projects', icon: <Briefcase size={20} /> },
    { name: 'Employees', path: '/employees', icon: <Users size={20} /> },
    { name: 'AI Assistant', path: '/ai-assistant', icon: <Sparkles size={20} /> },
  ];

  const ThemeToggler = () => (
    <button
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="p-2 rounded-xl transition-all active:scale-95 duration-100 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
    >
      {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-700" />}
    </button>
  );

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/85 p-4 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xl font-black tracking-wider text-indigo-600 dark:text-indigo-400">AGRO TRACKER</span>
          <ThemeToggler />
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {item.icon}
              <span className="font-semibold text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Desktop Profile Box & Logout */}
        {user && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                {user.username.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-800 dark:text-white truncate">{user.username}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-bold uppercase tracking-wider">Manager</p>
              </div>
            </div>
            <button 
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-450 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all flex-shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      {/* 2. MOBILE HEADER BAR */}
      <header className="md:hidden h-14 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-20">
        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">AGRO TRACKER</span>
        <div className="flex items-center space-x-2">
          <ThemeToggler />
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* 3. MOBILE SIDEBAR DRAWER OVERLAY */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-white dark:bg-slate-950 h-full p-4 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black tracking-wider text-indigo-600 dark:text-indigo-400">AGRO TRACKER</span>
              <ThemeToggler />
            </div>
            
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl ${
                      isActive ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400'
                    }`
                  }
                >
                  {item.icon}
                  <span className="font-semibold text-sm">{item.name}</span>
                </NavLink>
              ))}
            </nav>

            {/* Mobile Profile Box */}
            {user && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                    {user.username.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-white truncate">{user.username}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-bold">Manager</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setSidebarOpen(false); logout(); }}
                  title="Sign Out"
                  className="p-2 text-slate-450 hover:text-rose-500 dark:hover:text-rose-455 hover:bg-rose-500/10 rounded-xl transition-all flex-shrink-0"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* 4. MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 relative overflow-y-auto pb-20 md:pb-6 transition-colors duration-200">
        <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
          {children}
        </div>

        {/* FLOATING ACTION BUTTON (FAB) FOR MOBILE */}
        <button 
          onClick={onFabClick}
          className="md:hidden fixed bottom-20 right-6 p-4 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 active:scale-90 active:bg-indigo-750 transition-all z-30"
        >
          <Plus size={24} />
        </button>
      </main>

      {/* 5. MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-30 px-2 pb-safe">
        {navItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-0.5 w-16 h-full transition-colors active:scale-95 duration-100 ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-bold tracking-wide">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
    </div>
  );
}
