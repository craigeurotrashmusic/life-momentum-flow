
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
}

export interface NudgeHistoryItem {
  nudge: Nudge;
  userResponse: 'accepted' | 'dismissed' | 'snoozed';
  responseTime: Date;
}
