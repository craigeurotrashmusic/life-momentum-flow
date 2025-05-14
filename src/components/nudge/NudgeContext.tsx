import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
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
} from './types';
import { generatePersonalizedNudge } from './personalization';
import type { Json } from '@/integrations/supabase/types';

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

// Helper to parse QuietHours from Json
const parseQuietHours = (jsonValue: Json | undefined): QuietHours => {
  if (
    jsonValue &&
    typeof jsonValue === 'object' &&
    !Array.isArray(jsonValue) &&
    'start' in jsonValue && typeof jsonValue.start === 'string' &&
    'end' in jsonValue && typeof jsonValue.end === 'string' &&
    'enabled' in jsonValue && typeof jsonValue.enabled === 'boolean'
  ) {
    return { start: jsonValue.start, end: jsonValue.end, enabled: jsonValue.enabled };
  }
  return defaultUserPreferences.quietHours;
};

// Helper to parse NotificationChannels from Json
const parseNotificationChannels = (jsonValue: Json | undefined): Record<NotificationChannel, NotificationChannelStatus> => {
  if (jsonValue && typeof jsonValue === 'object' && !Array.isArray(jsonValue)) {
    const channels = { ...defaultUserPreferences.notificationChannels };
    let allKeysValid = true;
    for (const key in jsonValue) {
      if (Object.prototype.hasOwnProperty.call(jsonValue, key) && key in channels) {
        if (typeof (jsonValue as any)[key] === 'boolean') {
          (channels as any)[key] = (jsonValue as any)[key];
        } else {
          allKeysValid = false; break;
        }
      } else if (Object.prototype.hasOwnProperty.call(jsonValue, key) && !(key in channels)){
        // unknown key, might be an error or old data
      }
    }
    if (allKeysValid) return channels;
  }
  return defaultUserPreferences.notificationChannels;
};

// Helper to parse Integrations from Json
const parseIntegrations = (jsonValue: Json | undefined): UserPreferences['integrations'] => {
  if (
    jsonValue &&
    typeof jsonValue === 'object' &&
    !Array.isArray(jsonValue) &&
    'googleCalendar' in jsonValue && typeof jsonValue.googleCalendar === 'boolean' &&
    'googleTasks' in jsonValue && typeof jsonValue.googleTasks === 'boolean'
  ) {
    return { googleCalendar: jsonValue.googleCalendar, googleTasks: jsonValue.googleTasks };
  }
  return defaultUserPreferences.integrations;
};

// Mock emotional states and detection
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
  const [nudges, setNudges] = useState<Nudge[]>(mockNudges); 
  const [activatedNudge, setActivatedNudge] = useState<Nudge | null>(null);
  const [isNudgeVisible, setIsNudgeVisible] = useState(false);
  const [nudgesMuted, setNudgesMuted] = useState(false);
  const [emotionalState, setEmotionalState] = useState<string>('neutral');
  const [energyLevel, setEnergyLevel] = useState<number>(70);
  const [flowPeriods, setFlowPeriods] = useState<FlowPeriod[]>(mockFlowPeriods);
  const [nudgeHistory, setNudgeHistory] = useState<NudgeHistoryItem[]>(mockNudgeHistory);
  
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    const localPrefs = localStorage.getItem('userPreferences');
    try {
        const parsedPrefs = localPrefs ? JSON.parse(localPrefs) : {};
        // Ensure deep merge for nested objects
        return {
          ...defaultUserPreferences,
          ...parsedPrefs,
          userId: parsedPrefs.userId || user?.id,
          notificationChannels: parsedPrefs.notificationChannels ? parseNotificationChannels(parsedPrefs.notificationChannels as Json) : defaultUserPreferences.notificationChannels,
          quietHours: parsedPrefs.quietHours ? parseQuietHours(parsedPrefs.quietHours as Json) : defaultUserPreferences.quietHours,
          integrations: parsedPrefs.integrations ? parseIntegrations(parsedPrefs.integrations as Json) : defaultUserPreferences.integrations,
        };
    } catch (e) {
        console.error("Failed to parse user preferences from localStorage", e);
        return { ...defaultUserPreferences, userId: user?.id };
    }
  });
  
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (user && !userPreferences.userId) {
      setUserPreferences(prev => ({ ...prev, userId: user.id }));
      // fetchUserPreferences will be called by the change in userPreferences.userId if it's a dependency there
      // or needs to be explicitly called if not.
      // Given fetchUserPreferences depends on userPreferences.userId, this setup should trigger it.
    } else if (user && userPreferences.userId && user.id !== userPreferences.userId) {
      setUserPreferences(prev => ({ ...defaultUserPreferences, userId: user.id }));
      // This will also trigger fetchUserPreferences due to userId change
    }
    // Initial fetch if userId is already present (e.g. from localStorage)
    // This condition might need adjustment based on fetchUserPreferences dependencies
    else if (userPreferences.userId && !userPreferences.isLoading) { // If user ID exists from local storage but user logs out
       // Potentially clear or retain user preferences based on app logic for logged-out state
       // For now, let's assume we keep them until a new user logs in or they are explicitly cleared.
    }
  }, [user]); // Effect for user session changes


  useEffect(() => {
    if (userPreferences.userId && !userPreferences.isLoading) {
      fetchUserPreferences();
    }
  }, [userPreferences.userId]); // Effect for fetching preferences when userId is available


  useEffect(() => {
    const emotionalInterval = setInterval(() => {
      const randomState = emotionalStates[Math.floor(Math.random() * emotionalStates.length)];
      setEmotionalState(randomState);
      
      const newEnergy = Math.max(30, Math.min(100, energyLevel + Math.floor(Math.random() * 20) - 10));
      setEnergyLevel(newEnergy);
      
      const isQuiet = checkIfQuietHours(userPreferences.quietHours);
      
      if (!nudgesMuted && !isNudgeVisible && !isQuiet && Math.random() < (userPreferences.nudgeFrequency / 20)) {
        generatePersonalizedNudge({ 
          emotionalState, 
          energyLevel, 
          flowPeriods,
          nudgeHistory 
        }).then(nudge => {
          if (nudge) {
            setNudges(prev => [...prev, nudge]);
            if (userPreferences.notificationChannels.inApp) {
              const sortedNudges = [...nudges, nudge].sort((a, b) => b.priority - a.priority);
              const selectedNudge = sortedNudges[0];
              setActivatedNudge(selectedNudge);
              setIsNudgeVisible(true);
              setNudges(prev => prev.filter(n => n.id !== selectedNudge.id));
            }
          }
        });
      }
    }, 30000);
    
    return () => clearInterval(emotionalInterval);
  }, [nudgesMuted, isNudgeVisible, emotionalState, energyLevel, flowPeriods, nudgeHistory, userPreferences.quietHours, userPreferences.nudgeFrequency, userPreferences.notificationChannels.inApp, nudges]);
  
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }, [userPreferences]);
  
  const checkIfQuietHours = (currentQuietHours: QuietHours) => {
    if (!currentQuietHours?.enabled) return false; // Add null check for currentQuietHours
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Simple string comparison works for 24-hour format
    return currentTimeStr >= currentQuietHours.start && currentTimeStr <= currentQuietHours.end;
  };
  
  const triggerNudge = (customMessage?: string) => {
    if (nudgesMuted) {
      toast.info("Nudges are currently muted.");
      return;
    }
    if (customMessage) {
        const customNudge: Nudge = {
            id: `custom-${Date.now()}`,
            message: customMessage,
            type: 'reminder', 
            priority: 5, 
            timestamp: new Date(),
        };
        setActivatedNudge(customNudge);
        setIsNudgeVisible(true);
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
  
  const dismissNudge = () => {
    if (activatedNudge) {
      const historyItem: NudgeHistoryItem = {
        nudge: activatedNudge,
        userResponse: 'dismissed',
        responseTime: new Date(),
        timeToRespond: 0 // Assuming 0 for now, or calculate if needed
      };
      setNudgeHistory(prevHistory => [historyItem, ...prevHistory].slice(0, 50)); 
    }
    
    setIsNudgeVisible(false);
    setTimeout(() => setActivatedNudge(null), 300); 
  };
  
  const snoozeNudge = () => {
    if (activatedNudge) {
      const snoozedNudge: Nudge = { 
        ...activatedNudge,
        priority: Math.max(1, activatedNudge.priority - 1),
        timestamp: new Date(Date.now() + 5 * 60 * 1000) 
      };
      setNudges(prevNudges => [...prevNudges, snoozedNudge]);
      
      const historyItem: NudgeHistoryItem = {
        nudge: activatedNudge,
        userResponse: 'snoozed',
        responseTime: new Date(),
        timeToRespond: 0 // Assuming 0 for now
      };
      setNudgeHistory(prevHistory => [historyItem, ...prevHistory].slice(0, 50));
      
      toast.info("Nudge snoozed for 5 minutes");
      dismissNudge(); 
    }
  };
  
  const toggleNudgeMute = () => {
    setNudgesMuted(prevMuted => {
      const newMutedState = !prevMuted;
      if (newMutedState) { 
        dismissNudge(); 
        toast.info("Nudges muted");
      } else {
        toast.info("Nudges active");
      }
      return newMutedState;
    });
  };
  
  const setNudgeFrequency = (frequency: number) => {
    setUserPreferences(prev => ({ ...prev, nudgeFrequency: frequency }));
  };
  
  const toggleNotificationChannel = (channel: NotificationChannel) => { 
    setUserPreferences(prev => {
      const currentChannels = prev.notificationChannels || defaultUserPreferences.notificationChannels;
      const currentIntegrations = prev.integrations || defaultUserPreferences.integrations;

      if (channel === 'googleCalendar' || channel === 'googleTasks') {
        return {
          ...prev,
          integrations: {
            ...currentIntegrations,
            [channel]: !currentIntegrations[channel]
          }
        };
      }
      return {
        ...prev,
        notificationChannels: {
          ...currentChannels,
          [channel]: !currentChannels[channel]
        }
      };
    });
  };
  
  const setQuietHours = (newQuietHours: Partial<QuietHours>) => { 
    setUserPreferences(prev => ({
      ...prev,
      quietHours: {
        ...(prev.quietHours || defaultUserPreferences.quietHours),
        ...newQuietHours 
      }
    }));
  };

  const fetchUserPreferences = useCallback(async () => {
    if (!userPreferences.userId) {
      return;
    }
    setUserPreferences(prev => ({ ...prev, isLoading: true }));
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userPreferences.userId)
        .maybeSingle();

      if (data) {
        setUserPreferences(prev => ({
          ...defaultUserPreferences, // Start with global defaults
          ...prev, // Overlay current state
          userId: userPreferences.userId, // Preserve current userId
          nudgeFrequency: typeof data.nudge_frequency === 'number' ? data.nudge_frequency : defaultUserPreferences.nudgeFrequency,
          notificationChannels: parseNotificationChannels(data.notification_channels),
          quietHours: parseQuietHours(data.quiet_hours),
          integrations: parseIntegrations(data.integrations),
          isLoading: false,
        }));
      } else if (error) {
        toast.error(`Failed to fetch user preferences: ${error.message}`);
        console.error('Failed to fetch user preferences:', error);
        setUserPreferences(prev => ({ ...prev, isLoading: false }));
      } else {
        setUserPreferences(prev => ({
             ...defaultUserPreferences, 
             userId: userPreferences.userId, 
             isLoading: false 
        }));
      }
    } catch (error: any) {
      toast.error(`Failed to fetch user preferences: ${error.message}`);
      console.error('Failed to fetch user preferences:', error);
      setUserPreferences(prev => ({ ...prev, isLoading: false }));
    }
  }, [userPreferences.userId]);

  const saveUserPreferences = async (): Promise<void> => {
    if (!userPreferences.userId) {
      toast.error("User ID not available. Cannot save preferences.");
      return;
    }

    setUserPreferences(prev => ({ ...prev, isLoading: true }));

    const preferencesToSaveForDb = {
      user_id: userPreferences.userId,
      nudge_frequency: userPreferences.nudgeFrequency,
      notification_channels: userPreferences.notificationChannels as unknown as Json,
      quiet_hours: userPreferences.quietHours as unknown as Json,
      integrations: userPreferences.integrations as unknown as Json,
    };

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert(preferencesToSaveForDb); 

      if (error) {
        toast.error(`Failed to save preferences: ${error.message}`);
        console.error('Failed to save preferences:', error);
      } else {
        toast.success("Preferences saved successfully!");
        setUserPreferences(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error: any) {
      toast.error(`Failed to save preferences: ${error.message}`);
      console.error('Failed to save preferences:', error);
    } finally {
      setUserPreferences(prev => ({ ...prev, isLoading: false }));
    }
  };

  const addNudge = (nudge: Nudge) => {
    setNudges(prev => [...prev, nudge]);
  };

  const clearNudges = () => {
    setNudges([]);
  };

  const logNudgeEvent = (event: NudgeEvent) => {
    console.log("Nudge event logged:", event);
    // Implement event logging logic here, e.g., send to backend or analytics
  };

  const updateFlowState = (key: keyof FlowStateData, value: any) => {
    console.log("Updating flow state:", key, value);
    // Implement flow state update logic here
  };

  const addEmotionalState = (state: EmotionalState) => {
    console.log("Adding emotional state:", state);
    // Implement emotional state history update logic here
  };

  const isLoadingPreferences = !!userPreferences.isLoading;

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
