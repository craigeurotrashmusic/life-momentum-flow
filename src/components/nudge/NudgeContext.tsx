import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile'; // Added import for useIsMobile
import {
  Nudge,
  FlowPeriod,
  NudgeHistoryItem,
  UserPreferences,
  NotificationChannel,
  NotificationChannelStatus,
  QuietHours,
  NudgeEvent,
  FlowStateData,
  EmotionalState,
  NudgeType
} from './types'; // Import all necessary types
import { generatePersonalizedNudge } from './personalization'; // Import personalized nudge generator

// Mock nudges for demonstration
const mockNudges: Nudge[] = [
  {
    id: '1',
    message: "Your focus metrics show you're entering a productive period. Consider starting that deep work task now.",
    type: 'insight',
    priority: 4,
    timestamp: new Date()
  },
  // ... other mock nudges
];

// Mock flow periods
const mockFlowPeriods: FlowPeriod[] = [
  // ... mock flow periods
];

// Mock nudge history
const mockNudgeHistory: NudgeHistoryItem[] = [
  // ... mock nudge history
];

// Default user preferences
const defaultUserPreferences: UserPreferences = {
  userId: undefined,
  nudgeFrequency: 3,
  notificationChannels: {
    inApp: true,
    push: true,
    email: false,
    googleCalendar: false,
    googleTasks: false,
  },
  quietHours: {
    start: "22:00",
    end: "07:00",
    enabled: true
  },
  integrations: {
    googleCalendar: false,
    googleTasks: false
  },
  isLoading: false,
};

// Simulated emotional states and detection
const emotionalStates = ['energized', 'focused', 'neutral', 'distracted', 'tired'];

// Define NudgeContextType
export interface NudgeContextType {
  nudges: Nudge[];
  addNudge: (nudge: Nudge) => void;
  clearNudges: () => void;
  triggerNudge: (customMessage?: string) => void;
  nudgeFrequency: number;
  setNudgeFrequency: (freq: number) => void;
  notificationChannels: Record<NotificationChannel, NotificationChannelStatus>;
  toggleNotificationChannel: (channel: NotificationChannel) => void;
  quietHours: QuietHours;
  setQuietHours: (hours: Partial<QuietHours>) => void;
  userPreferences: UserPreferences;
  saveUserPreferences: () => Promise<void>;
  fetchUserPreferences: () => Promise<void>;
  lastNudgeEvent: NudgeEvent | null;
  logNudgeEvent: (event: NudgeEvent) => void;
  nudgeHistory: NudgeHistoryItem[];
  flowState: FlowStateData;
  updateFlowState: (key: keyof FlowStateData, value: any) => void;
  emotionalStateHistory: EmotionalState[];
  addEmotionalState: (state: EmotionalState) => void;
  isLoadingPreferences: boolean;

  activatedNudge: Nudge | null;
  isNudgeVisible: boolean;
  dismissNudge: () => void;
  snoozeNudge: () => void;
  nudgesMuted: boolean;
  toggleNudgeMute: () => void;
  emotionalState: string;
  energyLevel: number;
}

// Create NudgeContext with undefined initial value
const NudgeContext = createContext<NudgeContextType | undefined>(undefined);

export const NudgeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [nudges, setNudges] = useState<Nudge[]>(mockNudges); // Initialize with mockNudges
  const [activatedNudge, setActivatedNudge] = useState<Nudge | null>(null);
  const [isNudgeVisible, setIsNudgeVisible] = useState(false);
  const [nudgesMuted, setNudgesMuted] = useState(false);
  const [emotionalState, setEmotionalState] = useState<string>('neutral');
  const [energyLevel, setEnergyLevel] = useState<number>(70);
  const [flowPeriods, setFlowPeriods] = useState<FlowPeriod[]>(mockFlowPeriods);
  const [nudgeHistory, setNudgeHistory] = useState<NudgeHistoryItem[]>(mockNudgeHistory);
  
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    const localPrefs = localStorage.getItem('userPreferences');
    return localPrefs ? JSON.parse(localPrefs) : defaultUserPreferences;
  });
  
  const isMobile = useIsMobile(); // Correctly using the imported hook
  
  const { nudgeFrequency, notificationChannels, quietHours } = userPreferences;
  
  useEffect(() => {
    if (user && !userPreferences.userId) {
      setUserPreferences(prev => ({ ...prev, userId: user.id }));
      fetchUserPreferences();
    }
  }, [user, userPreferences.userId]);

  useEffect(() => {
    // Simulate emotional state changes interval
    const emotionalInterval = setInterval(() => {
      const randomState = emotionalStates[Math.floor(Math.random() * emotionalStates.length)];
      setEmotionalState(randomState);
      
      const newEnergy = Math.max(30, Math.min(100, energyLevel + Math.floor(Math.random() * 20) - 10));
      setEnergyLevel(newEnergy);
      
      const isQuiet = checkIfQuietHours(userPreferences.quietHours); // Use userPreferences.quietHours
      
      if (!nudgesMuted && !isNudgeVisible && !isQuiet && Math.random() < (userPreferences.nudgeFrequency / 20)) {
        generatePersonalizedNudge({ 
          emotionalState, 
          energyLevel, 
          flowPeriods,
          nudgeHistory 
        }).then(nudge => {
          if (nudge) {
            setNudges(prev => [...prev, nudge]);
            if (userPreferences.notificationChannels.inApp) { // Use userPreferences
              // Trigger nudge if inApp notifications are enabled
              const sortedNudges = [...nudges, nudge].sort((a, b) => b.priority - a.priority);
              const selectedNudge = sortedNudges[0];
              setActivatedNudge(selectedNudge);
              setIsNudgeVisible(true);
              setNudges(prev => prev.filter(n => n.id !== selectedNudge.id));
            }
          } else {
            // toast.error("Could not generate a new nudge right now."); // Optionally toast
          }
        });
      }
    }, 30000);
    
    return () => clearInterval(emotionalInterval);
  }, [nudgesMuted, isNudgeVisible, emotionalState, energyLevel, flowPeriods, nudgeHistory, userPreferences]);
  
  // Save user preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }, [userPreferences]);
  
  // Check if current time is within quiet hours
  const checkIfQuietHours = (currentQuietHours: QuietHours) => {
    if (!currentQuietHours.enabled) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Simple string comparison works for 24-hour format
    return currentTimeStr >= currentQuietHours.start && currentTimeStr <= currentQuietHours.end;
  };
  
  // Function to trigger a nudge
  const triggerNudge = (customMessage?: string) => {
    if (nudgesMuted) {
      toast.info("Nudges are currently muted.");
      return;
    }
    if (customMessage) {
        const customNudge: Nudge = {
            id: `custom-${Date.now()}`,
            message: customMessage,
            type: 'reminder', // Or make type configurable
            priority: 5, // Highest priority for direct triggers
            timestamp: new Date(),
        };
        setActivatedNudge(customNudge);
        setIsNudgeVisible(true);
        // Do not remove from queue if it's a custom one-off message not in nudges list
        return;
    }

    if (nudges.length > 0) {
      const sortedNudges = [...nudges].sort((a, b) => b.priority - a.priority);
      const selectedNudge = sortedNudges[0];
      
      setActivatedNudge(selectedNudge);
      setIsNudgeVisible(true);
      setNudges(prevNudges => prevNudges.filter(nudge => nudge.id !== selectedNudge.id));
    } else {
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
      setNudgeHistory(prevHistory => [historyItem, ...prevHistory].slice(0, 50)); // Keep history capped
    }
    
    setIsNudgeVisible(false);
    setTimeout(() => setActivatedNudge(null), 300); // Delay clearing for animation
  };
  
  // Function to snooze the current nudge
  const snoozeNudge = () => {
    if (activatedNudge) {
      // Add back to queue with reduced priority
      const snoozedNudge: Nudge = { // Explicitly type snoozedNudge
        ...activatedNudge,
        priority: Math.max(1, activatedNudge.priority - 1),
        timestamp: new Date(Date.now() + 5 * 60 * 1000) // Snooze for 5 minutes
      };
      setNudges(prevNudges => [...prevNudges, snoozedNudge]);
      
      const historyItem: NudgeHistoryItem = {
        nudge: activatedNudge,
        userResponse: 'snoozed',
        responseTime: new Date()
      };
      setNudgeHistory(prevHistory => [historyItem, ...prevHistory].slice(0, 50));
      
      toast.info("Nudge snoozed for 5 minutes");
      dismissNudge(); // This will hide the current nudge
    }
  };
  
  // Toggle nudge muting
  const toggleNudgeMute = () => {
    setNudgesMuted(prevMuted => {
      const newMutedState = !prevMuted;
      if (newMutedState) { // If muting
        dismissNudge(); // Dismiss any active nudge
        toast.info("Nudges muted");
      } else {
        toast.info("Nudges active");
      }
      return newMutedState;
    });
  };
  
  // Update nudge frequency
  const setNudgeFrequency = (frequency: number) => {
    setUserPreferences(prev => ({ ...prev, nudgeFrequency: frequency }));
  };
  
  // Toggle notification channel
  const toggleNotificationChannel = (channel: NotificationChannel) => { // Typed channel
    setUserPreferences(prev => {
      if (channel === 'googleCalendar' || channel === 'googleTasks') {
        return {
          ...prev,
          integrations: {
            ...prev.integrations,
            [channel]: !prev.integrations[channel]
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
  const setQuietHours = (newQuietHours: Partial<QuietHours>) => { // Changed parameter to Partial<QuietHours>
    setUserPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        ...newQuietHours // Spread partial updates
      }
    }));
  };
  
  // Save user preferences to backend (mock implementation)
  const saveUserPreferences = async (): Promise<void> => { // Corrected return type
    if (!userPreferences.userId) {
      toast.error("User ID not available. Cannot save preferences.");
      return;
    }
    setUserPreferences(prev => ({ ...prev, isLoading: true }));
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({ ...userPreferences, user_id: userPreferences.userId }) // Ensure user_id is passed for upsert
        .eq('user_id', userPreferences.userId) // Match condition for upsert
        .select()
        .single();

      if (error) {
        toast.error(`Failed to save preferences: ${error.message}`);
        console.error('Failed to save preferences:', error);
      } else {
        toast.success("Preferences saved successfully!");
      }
    } catch (error: any) {
      toast.error(`Failed to save preferences: ${error.message}`);
      console.error('Failed to save preferences:', error);
    } finally {
      setUserPreferences(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Fetch user preferences from supabase
  const fetchUserPreferences = useCallback(async () => {
    if (!userPreferences.userId) {
      // console.warn("User ID not available for fetching preferences. User might not be logged in yet.");
      return;
    }
    setUserPreferences(prev => ({ ...prev, isLoading: true }));
    try {
      const { data, error } = await supabase
        .from('user_preferences') // This table needs to exist in Supabase
        .select('*')
        .eq('user_id', userPreferences.userId)
        .single();
      
      if (data) {
        setUserPreferences(prev => ({ ...prev, ...data, isLoading: false }));
      } else if (error && error.code !== 'PGRST116') { // PGRST116: Row not found, which is fine, defaults will be used
        toast.error(`Failed to fetch user preferences: ${error.message}`);
        console.error('Failed to fetch user preferences:', error);
        setUserPreferences(prev => ({ ...prev, isLoading: false }));
      } else {
         setUserPreferences(prev => ({ ...prev, isLoading: false })); // No data, not an error, use defaults
      }
    } catch (error: any) {
      toast.error(`Failed to fetch user preferences: ${error.message}`);
      console.error('Failed to fetch user preferences:', error);
      setUserPreferences(prev => ({ ...prev, isLoading: false }));
    }
  }, [userPreferences.userId, supabase]); // Added supabase to dependency array

  // Add a new nudge to the queue
  const addNudge = (nudge: Nudge) => {
    setNudges(prev => [...prev, nudge]);
  };

  // Clear all nudges from the queue
  const clearNudges = () => {
    setNudges([]);
  };

  // Log a nudge event
  const logNudgeEvent = (event: NudgeEvent) => {
    console.log("Nudge event logged:", event);
    // Implement event logging logic here, e.g., send to backend or analytics
  };

  // Update flow state
  const updateFlowState = (key: keyof FlowStateData, value: any) => {
    console.log("Updating flow state:", key, value);
    // Implement flow state update logic here
  };

  // Add an emotional state to the history
  const addEmotionalState = (state: EmotionalState) => {
    console.log("Adding emotional state:", state);
    // Implement emotional state history update logic here
  };

  // Check if preferences are loading
  const isLoadingPreferences = !!userPreferences.isLoading; // Ensure boolean

  return (
    <NudgeContext.Provider
      value={{
        nudges,
        addNudge,
        clearNudges,
        triggerNudge,
        nudgeFrequency: userPreferences.nudgeFrequency,
        setNudgeFrequency,
        notificationChannels: userPreferences.notificationChannels,
        toggleNotificationChannel,
        quietHours: userPreferences.quietHours,
        setQuietHours,
        userPreferences,
        saveUserPreferences,
        fetchUserPreferences,
        lastNudgeEvent: null,
        logNudgeEvent,
        nudgeHistory,
        flowState: {
          intensity: 0,
          startTime: null,
          endTime: null,
          active: false,
        },
        updateFlowState,
        emotionalStateHistory: [],
        addEmotionalState,
        isLoadingPreferences,
        activatedNudge,
        isNudgeVisible,
        dismissNudge,
        snoozeNudge,
        nudgesMuted,
        toggleNudgeMute,
        emotionalState,
        energyLevel,
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
