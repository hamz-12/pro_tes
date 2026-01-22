import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { THEME, STORAGE_KEYS } from '../utils/constants';
import { applyTheme, getCurrentTheme, toggleTheme as toggleAppTheme } from '../utils/themes';

// Create context
const ThemeContext = createContext(null);

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(THEME.DARK);
  const [systemTheme, setSystemTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize theme
  useEffect(() => {
    const initTheme = () => {
      try {
        const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let initialTheme;
        
        if (storedTheme === THEME.LIGHT || storedTheme === THEME.DARK) {
          initialTheme = storedTheme;
        } else if (storedTheme === THEME.SYSTEM) {
          initialTheme = prefersDark ? THEME.DARK : THEME.LIGHT;
          setSystemTheme(initialTheme);
        } else {
          // No stored preference, use system preference
          initialTheme = prefersDark ? THEME.DARK : THEME.LIGHT;
          setSystemTheme(initialTheme);
        }
        
        setTheme(initialTheme);
        applyTheme(initialTheme === THEME.DARK ? getCurrentTheme().dark : getCurrentTheme().light);
      } catch (err) {
        console.error('Theme initialization error:', err);
        setTheme(THEME.DARK);
        applyTheme(getCurrentTheme().dark);
      } finally {
        setLoading(false);
      }
    };

    initTheme();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const newSystemTheme = e.matches ? THEME.DARK : THEME.LIGHT;
      setSystemTheme(newSystemTheme);
      
      // Only update if current theme is set to "system"
      const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (storedTheme === THEME.SYSTEM) {
        setTheme(newSystemTheme);
        applyTheme(newSystemTheme === THEME.DARK ? getCurrentTheme().dark : getCurrentTheme().light);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = theme === THEME.DARK ? THEME.LIGHT : THEME.DARK;
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    applyTheme(newTheme === THEME.DARK ? getCurrentTheme().dark : getCurrentTheme().light);
  }, [theme]);

  // Set theme to system preference
  const setSystemThemePreference = useCallback(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = prefersDark ? THEME.DARK : THEME.LIGHT;
    
    setTheme(systemTheme);
    setSystemTheme(systemTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, THEME.SYSTEM);
    applyTheme(systemTheme === THEME.DARK ? getCurrentTheme().dark : getCurrentTheme().light);
  }, []);

  // Set specific theme
  const setSpecificTheme = useCallback((newTheme) => {
    if (newTheme === THEME.SYSTEM) {
      setSystemThemePreference();
    } else if (newTheme === THEME.LIGHT || newTheme === THEME.DARK) {
      setTheme(newTheme);
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
      applyTheme(newTheme === THEME.DARK ? getCurrentTheme().dark : getCurrentTheme().light);
    }
  }, [setSystemThemePreference]);

  // Get theme configuration
  const getThemeConfig = useCallback(() => {
    return theme === THEME.DARK ? getCurrentTheme().dark : getCurrentTheme().light;
  }, [theme]);

  // Check if current theme is dark
  const isDarkMode = theme === THEME.DARK;

  // Check if using system preference
  const isSystemTheme = localStorage.getItem(STORAGE_KEYS.THEME) === THEME.SYSTEM;

  // Get available themes
  const getAvailableThemes = useCallback(() => {
    return [
      { id: THEME.DARK, name: 'Dark', description: 'Dark theme for low light conditions' },
      { id: THEME.LIGHT, name: 'Light', description: 'Light theme for bright conditions' },
      { id: THEME.SYSTEM, name: 'System', description: 'Use your system preference' },
    ];
  }, []);

  // Context value
  const value = {
    theme,
    systemTheme,
    loading,
    isDarkMode,
    isSystemTheme,
    toggleTheme,
    setSystemThemePreference,
    setSpecificTheme,
    getThemeConfig,
    getAvailableThemes,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme toggle component
export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDarkMode } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} theme`}
    >
      {isDarkMode ? (
        <span className="theme-toggle-icon">🌙</span>
      ) : (
        <span className="theme-toggle-icon">☀️</span>
      )}
    </button>
  );
};

// Theme selector component
export const ThemeSelector = ({ className = '' }) => {
  const { theme, setSpecificTheme, getAvailableThemes } = useTheme();
  const themes = getAvailableThemes();

  return (
    <div className={`theme-selector ${className}`}>
      <select
        value={theme}
        onChange={(e) => setSpecificTheme(e.target.value)}
        className="theme-select"
      >
        {themes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeContext;