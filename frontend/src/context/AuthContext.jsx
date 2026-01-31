import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        
        if (token) {
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
          } catch (err) {
            clearAuth();
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Clear auth state
  const clearAuth = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  // Login function
  const login = async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await authService.login(email, password);
      const response = data.data;
      console.log('response: ',response)
      if (response && response.access_token) {
        const token = response.access_token;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        
        const userData = await authService.getCurrentUser();
        console.log('user data: ',userData)
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        setError('Login failed: Invalid response format');
        return { success: false, message: 'Login failed: Invalid response format' };
      }
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Login failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      if (response) {
        return { success: true, message: 'Registration successful! Please log in with your credentials.' };
      } else {
        setError('Registration failed');
        return { success: false, message: 'Registration failed' };
      }
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      clearAuth();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      clearAuth();
      navigate('/login');
    }
  }, [clearAuth, navigate]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;