import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export const useDarkMode = () => {
  const { theme, toggleTheme } = useTheme();
  const [isDark, setIsDark] = useState(theme === 'dark');

  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  const toggle = () => {
    toggleTheme();
  };

  return {
    isDark,
    toggle,
    theme,
  };
};