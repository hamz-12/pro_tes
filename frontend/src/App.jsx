import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Loading from './components/common/Loading/Loading';
import ProtectedRoute from './components/auth/ProtectedRoute/ProtectedRoute';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import { 
  restoreQueryCache, 
  setupCachePersistence 
} from './utils/queryPersister';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
import DashboardPage from './pages/DashboardPage/DashboardPage';
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage/RegisterPage'));

// Create QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 5 minutes - won't refetch if younger than this
      staleTime: 5 * 60 * 1000,
      
      // Keep unused data in cache for 30 minutes
      cacheTime: 30 * 60 * 1000,
      
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
      
      // Don't refetch on component mount if data exists and is fresh
      refetchOnMount: false,
      
      // Don't refetch on reconnect
      refetchOnReconnect: false,
      
      // Retry failed requests once
      retry: 1,
      
      // Keep showing old data while fetching new data
      keepPreviousData: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Restore cache from localStorage on app start
restoreQueryCache(queryClient);

// Setup auto-persistence
setupCachePersistence(queryClient);

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={
        !isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />
      } />
      <Route path="/register" element={
        !isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <div className="app-container dark-theme">
                <Suspense fallback={<Loading fullScreen />}>
                  <AppRoutes />
                </Suspense>
                
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'var(--color-card-bg)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)',
                      backdropFilter: 'blur(10px)',
                    },
                    success: {
                      iconTheme: {
                        primary: 'var(--color-success)',
                        secondary: 'var(--color-text-primary)',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: 'var(--color-error)',
                        secondary: 'var(--color-text-primary)',
                      },
                    },
                  }}
                />
              </div>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;