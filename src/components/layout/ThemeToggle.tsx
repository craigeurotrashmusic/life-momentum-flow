
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prevIsDark => !prevIsDark);
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="rounded-full bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
};

export default ThemeToggle;
