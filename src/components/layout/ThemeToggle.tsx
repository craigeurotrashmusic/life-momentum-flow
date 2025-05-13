
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('theme') === 'light' ? false : true;
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle('light', !isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('light', !newMode);
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
