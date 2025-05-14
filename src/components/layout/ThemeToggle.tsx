
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  // Default to dark theme based on typical preference or if nothing is set
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      // If no theme is stored, default to dark.
      // If 'light' is stored, it's not dark. Otherwise (e.g. 'dark' is stored), it is dark.
      return storedTheme === 'light' ? false : true;
    }
    return true; // Default for SSR or initial state before hydration
  });

  useEffect(() => {
    // Apply theme on initial load and when isDark changes
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      // Or document.documentElement.setAttribute('data-theme', 'light'); if your CSS requires it for :root styles.
      // Given the stylesheet uses :root for light and [data-theme="dark"] for dark, removing the attribute is correct.
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prevIsDark => !prevIsDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;

