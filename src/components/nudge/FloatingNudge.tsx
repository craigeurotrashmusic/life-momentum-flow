
import { X, BellMinus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNudge } from './NudgeContext';
import { getNudgeTypeClass } from './utils';

const FloatingNudge = () => {
  const { activatedNudge, isNudgeVisible, dismissNudge, snoozeNudge } = useNudge();

  return (
    <AnimatePresence>
      {isNudgeVisible && activatedNudge && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3 }}
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
          <div className="flex justify-end gap-2 mt-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={snoozeNudge}
                  >
                    <BellMinus size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Snooze for 5 minutes</p>
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
