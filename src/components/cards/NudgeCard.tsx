
import { useState, useEffect } from 'react';
import { BrainCircuit, Bell, BellOff, X, Snooze } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/sonner';
import LifeCard from './LifeCard';

interface Nudge {
  id: string;
  message: string;
  type: 'motivation' | 'reminder' | 'insight' | 'challenge';
  priority: number; // 1-5, with 5 being highest
  timestamp: Date;
}

const NudgeCard = () => {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [activatedNudge, setActivatedNudge] = useState<Nudge | null>(null);
  const [isNudgeVisible, setIsNudgeVisible] = useState(false);
  const [nudgesMuted, setNudgesMuted] = useState(false);
  const [emotionalState, setEmotionalState] = useState<string>('neutral');
  const [energyLevel, setEnergyLevel] = useState<number>(70);
  
  // Mock nudges for demonstration
  const mockNudges: Nudge[] = [
    {
      id: '1',
      message: "Your focus metrics show you're entering a productive period. Consider starting that deep work task now.",
      type: 'insight',
      priority: 4,
      timestamp: new Date()
    },
    {
      id: '2',
      message: "You've been sitting for 45 minutes. A quick 2-minute stretch would reset your energy levels.",
      type: 'reminder',
      priority: 3,
      timestamp: new Date(Date.now() - 60000)
    },
    {
      id: '3',
      message: "Based on your sleep data, today might feel challenging. Consider rescheduling non-essential meetings.",
      type: 'insight',
      priority: 5,
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: '4',
      message: "Your spending this week is trending 15% higher than your aligned budget. Review your transactions?",
      type: 'challenge',
      priority: 4,
      timestamp: new Date(Date.now() - 180000)
    },
    {
      id: '5',
      message: "You've completed 80% of your habit goals today. Just one more to go!",
      type: 'motivation',
      priority: 3,
      timestamp: new Date(Date.now() - 240000)
    }
  ];
  
  // Simulated emotional states and detection
  const emotionalStates = ['energized', 'focused', 'neutral', 'distracted', 'tired'];
  
  // Initialize with mock data
  useEffect(() => {
    setNudges(mockNudges);
    
    // Simulate emotional state changes
    const emotionalInterval = setInterval(() => {
      const randomState = emotionalStates[Math.floor(Math.random() * emotionalStates.length)];
      setEmotionalState(randomState);
      
      // Simulate energy level fluctuations
      const newEnergy = Math.max(30, Math.min(100, energyLevel + Math.floor(Math.random() * 20) - 10));
      setEnergyLevel(newEnergy);
      
      if (!nudgesMuted && !isNudgeVisible && Math.random() > 0.7) {
        triggerNudge();
      }
    }, 30000);
    
    return () => clearInterval(emotionalInterval);
  }, [nudgesMuted, isNudgeVisible, energyLevel]);
  
  // Function to trigger a nudge
  const triggerNudge = () => {
    if (nudges.length > 0 && !nudgesMuted) {
      // Select a nudge based on current context
      const sortedNudges = [...nudges].sort((a, b) => b.priority - a.priority);
      const selectedNudge = sortedNudges[0];
      
      setActivatedNudge(selectedNudge);
      setIsNudgeVisible(true);
      
      // Remove the triggered nudge from the queue
      setNudges(nudges.filter(nudge => nudge.id !== selectedNudge.id));
    }
  };
  
  // Function to dismiss the current nudge
  const dismissNudge = () => {
    setIsNudgeVisible(false);
    setTimeout(() => setActivatedNudge(null), 300);
  };
  
  // Function to snooze the current nudge
  const snoozeNudge = () => {
    if (activatedNudge) {
      // Add back to queue with reduced priority
      const snoozedNudge = {
        ...activatedNudge,
        priority: Math.max(1, activatedNudge.priority - 1),
        timestamp: new Date(Date.now() + 300000) // Snooze for 5 minutes
      };
      setNudges([...nudges, snoozedNudge]);
      
      toast.info("Nudge snoozed for 5 minutes", {
        duration: 3000,
      });
      
      dismissNudge();
    }
  };
  
  // Toggle nudge muting
  const toggleNudgeMute = () => {
    setNudgesMuted(!nudgesMuted);
    if (!nudgesMuted) {
      dismissNudge();
      toast.info("Nudges muted", {
        duration: 3000,
      });
    } else {
      toast.info("Nudges active", {
        duration: 3000,
      });
    }
  };
  
  // Demo function to manually trigger a nudge
  const demoTriggerNudge = () => {
    if (!isNudgeVisible && nudges.length > 0) {
      triggerNudge();
    }
  };
  
  // Function to determine the color based on emotional state
  const getEmotionalStateColor = () => {
    switch (emotionalState) {
      case 'energized': return 'bg-green-500';
      case 'focused': return 'bg-blue-500';
      case 'neutral': return 'bg-gray-400';
      case 'distracted': return 'bg-amber-500';
      case 'tired': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };
  
  return (
    <>
      {/* Main Nudge Card */}
      <LifeCard 
        title="Psychological Connection" 
        icon={<BrainCircuit />}
        color="bg-gradient-to-br from-purple-900/30 to-pink-900/30"
        expandable={true}
      >
        <div className="mt-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">Emotional Heatmap</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm">Current state:</span>
                <span className={`px-2 py-0.5 rounded text-sm font-medium capitalize ${
                  emotionalState === 'energized' ? 'bg-green-500/20 text-green-500' :
                  emotionalState === 'focused' ? 'bg-blue-500/20 text-blue-500' :
                  emotionalState === 'neutral' ? 'bg-gray-500/20 text-gray-500' :
                  emotionalState === 'distracted' ? 'bg-amber-500/20 text-amber-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {emotionalState}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Energy level</div>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-secondary/30 rounded-full mr-2">
                  <div 
                    className={`h-2 rounded-full ${
                      energyLevel > 70 ? 'bg-green-500' :
                      energyLevel > 40 ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${energyLevel}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{energyLevel}%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Nudge Engine</h3>
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {nudges.length} pending nudges
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={toggleNudgeMute}
              >
                {nudgesMuted ? <BellOff size={16} /> : <Bell size={16} />}
                <span>{nudgesMuted ? 'Unmute' : 'Mute'}</span>
              </Button>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {nudges.slice(0, 3).map((nudge) => (
                <div 
                  key={nudge.id} 
                  className="p-3 bg-secondary/30 rounded-xl min-w-[200px] max-w-[250px] cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={demoTriggerNudge}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className={`px-1.5 py-0.5 text-xs rounded capitalize ${
                      nudge.type === 'motivation' ? 'bg-green-500/20 text-green-500' :
                      nudge.type === 'reminder' ? 'bg-blue-500/20 text-blue-500' :
                      nudge.type === 'insight' ? 'bg-purple-500/20 text-purple-500' :
                      'bg-amber-500/20 text-amber-500'
                    }`}>
                      {nudge.type}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      P{nudge.priority}
                    </div>
                  </div>
                  <p className="text-sm line-clamp-3">
                    {nudge.message}
                  </p>
                </div>
              ))}
              
              {nudges.length > 3 && (
                <div className="flex items-center justify-center min-w-[50px] bg-secondary/20 rounded-xl">
                  <span className="text-sm font-medium">+{nudges.length - 3}</span>
                </div>
              )}
              
              {nudges.length === 0 && (
                <div className="p-3 bg-secondary/20 rounded-xl w-full text-center">
                  <p className="text-sm text-muted-foreground">No pending nudges</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Flow-State Detection</h3>
            <div className="p-3 bg-secondary/30 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Today's flow periods</div>
                <div className="text-sm font-medium">2 detected</div>
              </div>
              <div className="relative h-4 bg-secondary/30 rounded-full mb-1 overflow-hidden">
                <div className="absolute top-0 left-[10%] w-[15%] h-full bg-blue-500/70 rounded-full" />
                <div className="absolute top-0 left-[65%] w-[20%] h-full bg-blue-500/70 rounded-full" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>8 AM</span>
                <span>12 PM</span>
                <span>4 PM</span>
                <span>8 PM</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your optimal flow periods occur mid-morning and late afternoon
            </p>
          </div>
          
          <Button 
            className="w-full py-3 mt-2 rounded-xl flex items-center justify-center gap-2"
            variant="default"
            onClick={demoTriggerNudge}
          >
            <Bell size={16} />
            <span>Generate Test Nudge</span>
          </Button>
        </div>
      </LifeCard>
      
      {/* Floating Nudge Pill */}
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
              <div className={`px-2 py-0.5 text-xs rounded capitalize ${
                activatedNudge.type === 'motivation' ? 'bg-green-500/20 text-green-500' :
                activatedNudge.type === 'reminder' ? 'bg-blue-500/20 text-blue-500' :
                activatedNudge.type === 'insight' ? 'bg-purple-500/20 text-purple-500' :
                'bg-amber-500/20 text-amber-500'
              }`}>
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
                      <Snooze size={16} />
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
    </>
  );
};

export default NudgeCard;
