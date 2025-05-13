
import React, { useState } from 'react';
import { X, BellMinus, Bell, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNudge } from './NudgeContext';
import { getNudgeTypeClass } from './utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FloatingNudge = () => {
  const { activatedNudge, isNudgeVisible, dismissNudge, snoozeNudge } = useNudge();
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [snoozeTime, setSnoozeTime] = useState('5');

  const handleSnooze = () => {
    snoozeNudge();
    setShowSnoozeOptions(false);
  };

  return (
    <AnimatePresence>
      {isNudgeVisible && activatedNudge && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            duration: 0.3 
          }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 max-w-xs w-full px-4 py-3 bg-background/95 backdrop-blur-lg border border-border rounded-2xl shadow-lg z-50"
        >
          <div className="flex justify-between items-start mb-2">
            <div className={`px-2 py-0.5 text-xs rounded capitalize ${getNudgeTypeClass(activatedNudge.type)}`}>
              {activatedNudge.type}
            </div>
            <button 
              onClick={dismissNudge}
              className="p-1 rounded-full hover:bg-secondary/30 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-sm">{activatedNudge.message}</p>
          
          <AnimatePresence>
            {showSnoozeOptions ? (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 mt-3">
                  <Clock size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Snooze for:</span>
                  <Select value={snoozeTime} onValueChange={setSnoozeTime}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="5 minutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="h-7 text-xs" onClick={handleSnooze}>
                    Snooze
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          
          <div className="flex justify-end gap-2 mt-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                  >
                    <BellMinus size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Snooze options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={dismissNudge}
            >
              Got it
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingNudge;
