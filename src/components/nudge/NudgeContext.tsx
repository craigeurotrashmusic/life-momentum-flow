import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Nudge, EmotionalState, FlowPeriod, NudgeHistoryItem, NotificationChannels, QuietHours, UserPreferences } from './types';
import { toast } from '@/components/ui/sonner';
import { generatePersonalizedNudge } from './personalization';
import { useIsMobile } from '@/hooks/use-mobile';

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

// Mock flow periods
const mockFlowPeriods: FlowPeriod[] = [
  {
    startTime: new Date(new Date().setHours(10, 15)),
    endTime: new Date(new Date().setHours(11, 45)),
    intensity: 8
  },
  {
    startTime: new Date(new Date().setHours(15, 30)),
    endTime: new Date(new Date().setHours(16, 45)),
    intensity: 9
  }
];

// Mock nudge history
const mockNudgeHistory: NudgeHistoryItem[] = [
  {
    nudge: {
      id: 'h1',
      message: "Take a 5-minute break to reset your focus",
      type: 'reminder',
      priority: 3,
      timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    },
    userResponse: 'accepted',
    responseTime: new Date(Date.now() - 60 * 59 * 1000) // 59 minutes ago
  },
  {
    nudge: {
      id: 'h2',
      message: "Your calendar shows 3 meetings this afternoon. Consider preparing now.",
      type: 'insight',
      priority: 4,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    },
    userResponse: 'dismissed',
    responseTime: new Date(Date.now() - 3 * 60 * 59 * 1000) // 2.9 hours ago
  }
];

// Default user preferences
const defaultUserPreferences: UserPreferences = {
  nudgeFrequency: 3,
  notificationChannels: {
    inApp: true,
    push: true,
    email: false
  },
  quietHours: {
    start: "22:00",
    end: "07:00",
    enabled: true
  },
  integrations: {
    googleCalendar: false,
    googleTasks: false
  }
};

// Simulated emotional states and detection
const emotionalStates = ['energized', 'focused', 'neutral', 'distracted', 'tired'];

export const NudgeProvider = ({ children }: { children: ReactNode }) => {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [activatedNudge, setActivatedNudge] = useState<Nudge | null>(null);
  const [isNudgeVisible, setIsNudgeVisible] = useState(false);
  const [nudgesMuted, setNudgesMuted] = useState(false);
  const [emotionalState, setEmotionalState] = useState<string>('neutral');
  const [energyLevel, setEnergyLevel] = useState<number>(70);
  const [flowPeriods, setFlowPeriods] = useState<FlowPeriod[]>(mockFlowPeriods);
  const [nudgeHistory, setNudgeHistory] = useState<NudgeHistoryItem[]>(mockNudgeHistory);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    // Try to load from localStorage, or use defaults
    JSON.parse(localStorage.getItem('userPreferences') || JSON.stringify(defaultUserPreferences))
  );
  
  const isMobile = useIsMobile();
  
  // Extract preferences for easier access
  const { nudgeFrequency, notificationChannels, quietHours } = userPreferences;
  
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
      
      // Check if within quiet hours
      const isQuietHours = checkIfQuietHours(quietHours);
      
      // Generate personalized nudge with probability based on frequency setting
      // But only if not in quiet hours and notifications are not muted
      if (!nudgesMuted && !isNudgeVisible && !isQuietHours && Math.random() < (nudgeFrequency / 20)) {
        generatePersonalizedNudge({ 
          emotionalState, 
          energyLevel, 
          flowPeriods,
          nudgeHistory 
        }).then(nudge => {
          if (nudge) {
            setNudges(prev => [...prev, nudge]);
            if (notificationChannels.inApp) {
              triggerNudge();
            }
          } else {
            toast.error("Could not generate a new nudge right now.");
          }
        });
      }
    }, 30000);
    
    return () => clearInterval(emotionalInterval);
  }, [nudgesMuted, isNudgeVisible, energyLevel, nudgeFrequency, quietHours, notificationChannels]);
  
  // Save user preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }, [userPreferences]);
  
  // Check if current time is within quiet hours
  const checkIfQuietHours = (hours: QuietHours) => {
    if (!hours.enabled) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Simple string comparison works for 24-hour format
    return currentTimeStr >= hours.start || currentTimeStr <= hours.end;
  };
  
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
    } else if (nudges.length === 0) {
      // Generate a new nudge on demand if queue is empty
      generatePersonalizedNudge({ 
        emotionalState, 
        energyLevel, 
        flowPeriods,
        nudgeHistory 
      }).then(nudge => {
        if (nudge) {
          setActivatedNudge(nudge);
          setIsNudgeVisible(true);
        } else {
          toast.error("Could not generate a new nudge right now.");
        }
      });
    }
  };
  
  // Function to dismiss the current nudge
  const dismissNudge = () => {
    if (activatedNudge) {
      // Add to history
      const historyItem: NudgeHistoryItem = {
        nudge: activatedNudge,
        userResponse: 'dismissed',
        responseTime: new Date()
      };
      setNudgeHistory([historyItem, ...nudgeHistory]);
    }
    
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
      
      // Add to history
      const historyItem: NudgeHistoryItem = {
        nudge: activatedNudge,
        userResponse: 'snoozed',
        responseTime: new Date()
      };
      setNudgeHistory([historyItem, ...nudgeHistory]);
      
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
  
  // Update nudge frequency
  const setNudgeFrequency = (frequency: number) => {
    setUserPreferences(prev => ({
      ...prev,
      nudgeFrequency: frequency
    }));
  };
  
  // Toggle notification channel
  const toggleNotificationChannel = (channel: string) => {
    setUserPreferences(prev => {
      if (channel === 'googleCalendar' || channel === 'googleTasks') {
        return {
          ...prev,
          integrations: {
            ...prev.integrations,
            [channel]: !(prev.integrations?.[channel] || false)
          }
        };
      }
      
      return {
        ...prev,
        notificationChannels: {
          ...prev.notificationChannels,
          [channel]: !prev.notificationChannels[channel]
        }
      };
    });
  };
  
  // Set quiet hours
  const setQuietHours = ({ start, end }: { start: string; end: string }) => {
    setUserPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        start,
        end
      }
    }));
  };
  
  // Save user preferences to backend (mock implementation)
  const saveUserPreferences = async () => {
    try {
      // In a real app, this would be an API call
      console.log('Saving preferences:', userPreferences);
      // Mock success
      return true;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
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
        nudgeHistory,
        flowPeriods,
        nudgeFrequency,
        notificationChannels,
        quietHours,
        userPreferences,
        triggerNudge,
        dismissNudge,
        snoozeNudge,
        toggleNudgeMute,
        setNudgeFrequency,
        toggleNotificationChannel,
        setQuietHours,
        saveUserPreferences
      }}
    >
      {children}
    </NudgeContext.Provider>
  );
};

const NudgeContext = createContext<NudgeContextType | undefined>(undefined);

export const useNudge = () => {
  const context = useContext(NudgeContext);
  if (context === undefined) {
    throw new Error('useNudge must be used within a NudgeProvider');
  }
  return context;
};
