import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Loading from './components/common/Loading/Loading';
// import ProtectedRoute from './components/auth/ProtectedRoute/ProtectedRoute';
import { ProtectedRoute } from "./context/AuthContext";

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage/DashboardPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage/AnalyticsPage'));
const DataPage = lazy(() => import('./pages/DataPage/DataPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage/RegisterPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

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
        // <ProtectedRoute>
          <DashboardPage />
        // </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AnalyticsPage />
        </ProtectedRoute>
      } />
      <Route path="/data" element={
        <ProtectedRoute>
          <DataPage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
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