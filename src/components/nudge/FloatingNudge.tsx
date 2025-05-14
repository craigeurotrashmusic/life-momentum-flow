
import React, { useState, useEffect } from 'react';
import { X, BellMinus, Bell, Clock, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNudge } from './NudgeContext';
import { getNudgeTypeClass } from './utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';

const FloatingNudge = () => {
  const { activatedNudge, isNudgeVisible, dismissNudge, snoozeNudge } = useNudge();
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [snoozeTime, setSnoozeTime] = useState('5');
  const [showFeedbackOptions, setShowFeedbackOptions] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const handleSnooze = () => {
    snoozeNudge();
    setShowSnoozeOptions(false);
    toast.success(`Nudge snoozed for ${snoozeTime} minutes`);
  };
  
  const handlePositiveFeedback = () => {
    toast.success("Thanks for your feedback! We'll improve your nudges.");
    dismissNudge();
  };
  
  const handleNegativeFeedback = () => {
    toast.success("Thanks for your feedback! We'll show fewer nudges like this.");
    dismissNudge();
  };
  
  // Auto-dismiss timer
  useEffect(() => {
    if (isNudgeVisible) {
      setTimeRemaining(15); // 15 seconds auto-dismiss
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev !== null ? prev - 1 : null);
      }, 1000);
      
      return () => {
        clearInterval(timer);
        setTimeRemaining(null);
      };
    }
  }, [isNudgeVisible]);
  
  // Auto-dismiss when timer reaches 0
  useEffect(() => {
    if (timeRemaining === 0) {
      dismissNudge();
    }
  }, [timeRemaining, dismissNudge]);

  if (!isNudgeVisible || !activatedNudge) return null;

  return (
    <AnimatePresence>
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
        className={`fixed ${isMobile ? 'bottom-16 left-1/2 transform -translate-x-1/2 max-w-[calc(100%-2rem)]' : 'bottom-6 left-1/2 transform -translate-x-1/2 max-w-xs'} w-full px-4 py-3 bg-background/95 backdrop-blur-lg border border-border rounded-2xl shadow-lg z-50`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className={`px-2 py-0.5 text-xs rounded capitalize ${getNudgeTypeClass(activatedNudge.type)}`}>
            {activatedNudge.type}
          </div>
          <div className="flex items-center gap-2">
            {timeRemaining !== null && (
              <span className="text-xs text-muted-foreground">{timeRemaining}s</span>
            )}
            <button 
              onClick={dismissNudge}
              className="p-1 rounded-full hover:bg-secondary/30 transition-colors"
              aria-label="Dismiss nudge"
            >
              <X size={14} />
            </button>
          </div>
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
              <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-2 mt-3`}>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Snooze for:</span>
                </div>
                <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 ${isMobile ? 'w-full' : 'items-center'}`}>
                  <Select value={snoozeTime} onValueChange={setSnoozeTime}>
                    <SelectTrigger className="h-9 text-xs min-w-[110px]">
                      <SelectValue placeholder="5 minutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="h-9 text-xs" onClick={handleSnooze}>
                    Snooze
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        
        <AnimatePresence>
          {showFeedbackOptions ? (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-2 mt-3">
                <p className="text-xs text-muted-foreground">Was this nudge helpful?</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 flex items-center justify-center gap-1 h-10 min-w-[100px]"
                    onClick={handlePositiveFeedback}
                  >
                    <ThumbsUp size={isMobile ? 14 : 12} />
                    <span className="text-xs">Yes, helpful</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 flex items-center justify-center gap-1 h-10 min-w-[100px]"
                    onClick={handleNegativeFeedback}
                  >
                    <ThumbsDown size={isMobile ? 14 : 12} />
                    <span className="text-xs">Not useful</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        
        <div className="flex justify-end gap-2 mt-3">
          {!isMobile && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowSnoozeOptions(!showSnoozeOptions);
                      setShowFeedbackOptions(false);
                    }}
                    aria-label="Snooze options"
                  >
                    <BellMinus size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Snooze options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {!isMobile && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowFeedbackOptions(!showFeedbackOptions);
                      setShowSnoozeOptions(false);
                    }}
                    aria-label="Give feedback"
                  >
                    <ThumbsUp size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Give feedback</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {isMobile && (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowSnoozeOptions(!showSnoozeOptions);
                  setShowFeedbackOptions(false);
                }}
                aria-label="Snooze options"
                className="h-10"
              >
                <BellMinus size={16} />
                <span className="ml-1 text-xs">Snooze</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowFeedbackOptions(!showFeedbackOptions);
                  setShowSnoozeOptions(false);
                }}
                aria-label="Give feedback"
                className="h-10"
              >
                <ThumbsUp size={16} />
                <span className="ml-1 text-xs">Feedback</span>
              </Button>
            </>
          )}
          
          <Button 
            variant="default" 
            size="sm"
            className="flex items-center gap-1 h-10"
            onClick={dismissNudge}
            aria-label="Dismiss nudge"
          >
            <Check size={isMobile ? 16 : 14} />
            <span>Got it</span>
          </Button>
        </div>
        
        {/* Progress bar for auto-dismiss */}
        {timeRemaining !== null && (
          <div className="mt-2 w-full bg-secondary/30 h-0.5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: "100%" }}
              animate={{ width: `${(timeRemaining / 15) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingNudge;
