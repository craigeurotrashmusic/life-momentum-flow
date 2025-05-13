
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Nudge, EmotionalState } from './types';
import { toast } from '@/components/ui/sonner';

interface NudgeContextType {
  nudges: Nudge[];
  activatedNudge: Nudge | null;
  isNudgeVisible: boolean;
  nudgesMuted: boolean;
  emotionalState: string;
  energyLevel: number;
  triggerNudge: () => void;
  dismissNudge: () => void;
  snoozeNudge: () => void;
  toggleNudgeMute: () => void;
}

const NudgeContext = createContext<NudgeContextType | undefined>(undefined);

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

export const NudgeProvider = ({ children }: { children: ReactNode }) => {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [activatedNudge, setActivatedNudge] = useState<Nudge | null>(null);
  const [isNudgeVisible, setIsNudgeVisible] = useState(false);
  const [nudgesMuted, setNudgesMuted] = useState(false);
  const [emotionalState, setEmotionalState] = useState<string>('neutral');
  const [energyLevel, setEnergyLevel] = useState<number>(70);
  
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

  return (
    <NudgeContext.Provider
      value={{
        nudges,
        activatedNudge,
        isNudgeVisible,
        nudgesMuted,
        emotionalState,
        energyLevel,
        triggerNudge,
        dismissNudge,
        snoozeNudge,
        toggleNudgeMute
      }}
    >
      {children}
    </NudgeContext.Provider>
  );
};

export const useNudge = () => {
  const context = useContext(NudgeContext);
  if (context === undefined) {
    throw new Error('useNudge must be used within a NudgeProvider');
  }
  return context;
};
