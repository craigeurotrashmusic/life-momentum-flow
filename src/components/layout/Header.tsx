
import React from 'react';
import { Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors" aria-label="Menu">
          <Menu size={20} />
        </button>
        
        <h1 className="text-lg font-medium text-foreground">Momentum OS</h1>
        
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
