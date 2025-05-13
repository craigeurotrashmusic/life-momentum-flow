
export interface Nudge {
  id: string;
  message: string;
  type: 'motivation' | 'reminder' | 'insight' | 'challenge';
  priority: number; // 1-5, with 5 being highest
  timestamp: Date;
  responded?: boolean;
  category?: string;
  source?: 'system' | 'calendar' | 'task' | 'custom';
  expiresAt?: Date;
  actionable?: boolean;
  actionUrl?: string;
}

export interface EmotionalState {
  state: string;
  level: number;
  timestamp: Date;
  context?: string;
  source?: 'manual' | 'detected' | 'predicted';
  duration?: number;
}

export interface FlowPeriod {
  startTime: Date;
  endTime: Date;
  intensity: number; // 1-10
  factors?: {
    focusScore?: number;
    productivityScore?: number;
    interruptionCount?: number;
    taskCompletionRate?: number;
    screenTimeQuality?: number;
    biometrics?: {
      heartRateVariability?: number;
      respirationRate?: number;
    };
  };
  source?: 'manual' | 'detected' | 'predicted';
  tags?: string[];
}

export interface NudgeHistoryItem {
  nudge: Nudge;
  userResponse: 'accepted' | 'dismissed' | 'snoozed';
  responseTime: Date;
  timeToRespond?: number; // Time in milliseconds between nudge display and response
  context?: {
    emotionalState?: string;
    energyLevel?: number;
    currentActivity?: string;
  };
}

export interface NotificationChannels {
  inApp: boolean;
  push: boolean;
  email: boolean;
  [key: string]: boolean;
}

export interface QuietHours {
  start: string;
  end: string;
  enabled: boolean;
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
}

export interface UserPreferences {
  nudgeFrequency: number;
  notificationChannels: NotificationChannels;
  quietHours: QuietHours;
  integrations?: {
    googleCalendar?: boolean;
    googleTasks?: boolean;
    slack?: boolean;
    [key: string]: boolean | undefined;
  };
  nudgePreferences?: {
    allowMotivational: boolean;
    allowReminders: boolean;
    allowInsights: boolean;
    allowChallenges: boolean;
    maxPriorityThreshold?: number;
  };
  feedbackPreferences?: {
    collectFeedback: boolean;
    collectEmotionalData: boolean;
    shareAnonymizedData: boolean;
  };
}

export interface NudgeFeedback {
  nudgeId: string;
  rating: number; // 1-5
  helpful: boolean;
  comments?: string;
  timestamp: Date;
}

export interface EmotionalInsight {
  date: Date;
  summary: string;
  primaryEmotion: string;
  emotionalVariability: number;
  energyTrend: 'increasing' | 'decreasing' | 'stable';
  peakPerformanceTimes: string[];
  recommendations: string[];
}

export interface NudgeStatistics {
  totalNudges: number;
  acceptanceRate: number;
  dismissRate: number;
  snoozeRate: number;
  averageResponseTime: number;
  nudgesByType: Record<string, number>;
  responsesByType: Record<string, Record<string, number>>;
  feedbackRating: number;
}
