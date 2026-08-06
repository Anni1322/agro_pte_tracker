import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Tasks from './pages/Tasks';
import Expenses from './pages/Expenses';
import Todos from './pages/Todos';
import Projects from './pages/Projects';
import Employees from './pages/Employees';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AIAssistant from './pages/AIAssistant';

function AppLayout({ children }) {
  const handleFabClick = () => {
    // Quick routing to Task Management Explorer
    window.location.href = '/todos';
  };

  return (
    <AppShell onFabClick={handleFabClick}>
      {children}
    </AppShell>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Standalone Authentication Views */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Layout-Wrapped Protected Operational Modules */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AppLayout><Analytics /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <AppLayout><Tasks /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute>
                <AppLayout><Expenses /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/todos" element={
              <ProtectedRoute>
                <AppLayout><Todos /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <AppLayout><Projects /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute>
                <AppLayout><Employees /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/ai-assistant" element={
              <ProtectedRoute>
                <AppLayout><AIAssistant /></AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
