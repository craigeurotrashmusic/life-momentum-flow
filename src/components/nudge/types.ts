
export interface Nudge {
  id: string;
  message: string;
  type: 'motivation' | 'reminder' | 'insight' | 'challenge';
  priority: number; // 1-5, with 5 being highest
  timestamp: Date;
  responded?: boolean;
}

export interface EmotionalState {
  state: string;
  level: number;
  timestamp: Date;
}

export interface FlowPeriod {
  startTime: Date;
  endTime: Date;
  intensity: number; // 1-10
  factors?: {
    focusScore?: number;
    productivityScore?: number;
    interruptionCount?: number;
  };
}

export interface NudgeHistoryItem {
  nudge: Nudge;
  userResponse: 'accepted' | 'dismissed' | 'snoozed';
  responseTime: Date;
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
}

export interface UserPreferences {
  nudgeFrequency: number;
  notificationChannels: NotificationChannels;
  quietHours: QuietHours;
  integrations?: {
    googleCalendar?: boolean;
    googleTasks?: boolean;
  };
}
