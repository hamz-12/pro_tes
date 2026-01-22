import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { STORAGE_KEYS } from '../utils/constants';

// Create context
const AuthContext = createContext(null);

// Custom hook to use auth context
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
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        
        if (token && userData) {
          try {
            const response = await authService.getCurrentUser(token);
            if (response.valid) {
              setUser(JSON.parse(userData));
            } else {
              // Token is invalid, clear storage
              clearAuth();
            }
          } catch (err) {
            // Token validation failed, clear storage
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
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setUser(null);
    setError(null);
  }, []);

  // Login function
  const login = async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      
      // FastAPI returns the object directly. 
      // It has 'access_token', not 'token'.
      if (response && response.access_token) {
        const token = response.access_token;
        
        // 1. Store the token immediately
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        
        // 2. Fetch the actual user data from the /me endpoint 
        // because the login endpoint only returns the token
        const userData = await authService.getCurrentUser();
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true); // Ensure your state reflects login
        
        navigate('/dashboard');
        return { success: true };
      } else {
        setError('Login failed: Invalid response format');
        return { success: false };
      }
    } catch (err) {
      // FastAPI usually puts error details in err.response.data.detail
      const message = err.response?.data?.detail || err.message || 'Login failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
};

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store token and user data
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        
        setUser(user);
        navigate('/dashboard');
        
        return { success: true };
      } else {
        setError(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        await authService.logout(token);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
      navigate('/login');
    }
  }, [clearAuth, navigate]);

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await authService.updateProfile(token, profileData);
      
      if (response.success && response.data) {
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        return { success: true, user: updatedUser };
      } else {
        setError(response.message || 'Profile update failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Profile update failed';
      setError(message);
      
      // If token is invalid, logout
      if (err.response?.status === 401) {
        logout();
      }
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await authService.changePassword(token, {
        currentPassword,
        newPassword,
      });
      
      if (response.success) {
        return { success: true };
      } else {
        setError(response.message || 'Password change failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Password change failed';
      setError(message);
      
      // If token is invalid, logout
      if (err.response?.status === 401) {
        logout();
      }
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.requestPasswordReset(email);
      
      if (response.success) {
        return { success: true };
      } else {
        setError(response.message || 'Password reset request failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Password reset request failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.resetPassword(token, newPassword);
      
      if (response.success) {
        return { success: true };
      } else {
        setError(response.message || 'Password reset failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Password reset failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.verifyEmail(token);
      
      if (response.success && response.data) {
        const updatedUser = { ...user, emailVerified: true };
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        return { success: true, user: updatedUser };
      } else {
        setError(response.message || 'Email verification failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Email verification failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Get auth token
  const getToken = () => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  };

  // Check if user is authenticated
  const isAuthenticated = !!user && !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      
      const response = await authService.refreshToken(refreshToken);
      
      if (response.success && response.data) {
        const { token, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        if (newRefreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }
        
        return token;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (err) {
      clearAuth();
      throw err;
    }
  };

  // Set auth error
  const setAuthError = (message) => {
    setError(message);
  };

  // Clear auth error
  const clearAuthError = () => {
    setError(null);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    getToken,
    hasRole,
    hasPermission,
    refreshToken,
    setAuthError,
    clearAuthError,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected route component
export const ProtectedRoute = ({ children, roles, permissions }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check roles
  if (roles && roles.length > 0) {
    const hasRequiredRole = roles.some(role => user?.roles?.includes(role));
    if (!hasRequiredRole) {
      navigate('/unauthorized');
      return null;
    }
  }

  // Check permissions
  if (permissions && permissions.length > 0) {
    const hasRequiredPermission = permissions.some(permission => 
      user?.permissions?.includes(permission)
    );
    if (!hasRequiredPermission) {
      navigate('/unauthorized');
      return null;
    }
  }

  return children;
};

export default AuthContext;