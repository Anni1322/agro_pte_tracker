import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session status on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await API.get('auth/session/');
        if (res.data.is_authenticated) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session verification failed:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await API.post('auth/login/', { username, password });
      if (res.data.is_authenticated) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, error: 'Authentication failed' };
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid credentials';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await API.post('auth/logout/');
    } catch (err) {
      console.error('API logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const signup = async (username, email, password) => {
    try {
      const res = await API.post('auth/signup/', { username, email, password });
      if (res.data.is_authenticated) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
