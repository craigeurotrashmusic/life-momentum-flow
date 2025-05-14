
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, Bell, Settings, Plus, X, Brain } from 'lucide-react';
import { useNudge } from './NudgeContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { triggerNudge, nudgesMuted, toggleNudgeMute } = useNudge();
  const isMobile = useIsMobile();

  const handleTriggerNudge = () => {
    triggerNudge();
    setIsOpen(false);
    toast.info("Generating a new nudge for you");
  };

  const handleToggleMute = () => {
    toggleNudgeMute();
    setIsOpen(false);
    toast.info(nudgesMuted ? "Nudges unmuted" : "Nudges muted");
  };

  const actions = [
    { icon: <Bell size={18} />, label: nudgesMuted ? 'Unmute Nudges' : 'Mute Nudges', onClick: handleToggleMute },
    { icon: <Brain size={18} />, label: 'Generate Nudge', onClick: handleTriggerNudge },
    { icon: <Settings size={18} />, label: 'Settings', onClick: () => {
      toast.info("Settings button clicked");
      setIsOpen(false);
    }}
  ];

  return (
    <div className={`fixed ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="flex flex-col-reverse gap-2 mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2 px-3 py-2 rounded-full shadow-md min-h-[44px]"
                  onClick={action.onClick}
                >
                  {action.icon}
                  <span className="text-sm">{action.label}</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant={isOpen ? "destructive" : "default"}
        size="icon"
        className={`${isMobile ? 'h-12 w-12' : 'h-14 w-14'} rounded-full shadow-lg`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </motion.div>
      </Button>
    </div>
  );
};

export default FloatingActionButton;
