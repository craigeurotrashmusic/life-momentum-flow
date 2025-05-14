
export type NudgeType = 'insight' | 'reminder' | 'challenge' | 'motivation';
export type NotificationChannel = 'inApp' | 'push' | 'email' | 'googleCalendar' | 'googleTasks';
export type NotificationChannelStatus = boolean;

export interface Nudge {
  id: string;
  message: string;
  type: NudgeType;
  priority: number;
  timestamp: Date;
}

export interface FlowPeriod {
  startTime: Date;
  endTime: Date;
  intensity: number;
}

export interface NudgeHistoryItem {
  nudge: Nudge;
  userResponse: 'accepted' | 'dismissed' | 'snoozed';
  responseTime: Date;
}

export interface QuietHours {
  start: string;
  end: string;
  enabled: boolean;
}

export interface UserPreferences {
  userId?: string; // Optional for initial state before user is loaded
  nudgeFrequency: number; // Example: 1-5 scale
  notificationChannels: Record<NotificationChannel, NotificationChannelStatus>;
  quietHours: QuietHours;
  integrations: {
    googleCalendar: boolean;
    googleTasks: boolean;
  };
  isLoading?: boolean; // To track loading state
}

export interface NudgeEvent {
  // Define structure for nudge events, e.g., for logging
  type: string; // 'shown', 'clicked', 'dismissed'
  nudgeId: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface FlowStateData {
  intensity: number; // 0-100
  startTime: Date | null;
  endTime: Date | null;
  active?: boolean;
}

export interface EmotionalState {
  // Define structure for emotional state entries, e.g., for history
  state: string; // 'energized', 'focused', 'neutral', 'distracted', 'tired'
  timestamp: Date;
  intensity?: number; // Optional intensity
}

export interface EmotionalInsight {
  date: Date;
  summary: string;
  primaryEmotion: string;
  emotionalVariability: number; // Percentage
  energyTrend: 'increasing' | 'decreasing' | 'stable';
  peakPerformanceTimes: string[]; // e.g., "10:00 AM - 12:00 PM"
  recommendations: string[];
}

