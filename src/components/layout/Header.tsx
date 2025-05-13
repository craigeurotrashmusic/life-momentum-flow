
import React, { useState } from 'react';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/auth';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <button 
          className="p-2 rounded-full hover:bg-secondary/50 transition-colors" 
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <motion.h1 
          className="text-lg font-medium text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Momentum OS
        </motion.h1>
        
        <ThemeToggle />
      </div>
      
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            className="absolute top-[61px] left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border z-40"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto py-4 px-4">
              <nav>
                <ul className="space-y-4">
                  <li>
                    <button className="w-full text-left flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <User size={18} />
                      <span>Profile</span>
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <Settings size={18} />
                      <span>Settings</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-destructive"
                    >
                      <LogOut size={18} />
                      <span>Log Out</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
