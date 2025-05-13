
export interface Nudge {
  id: string;
  message: string;
  type: 'motivation' | 'reminder' | 'insight' | 'challenge';
  priority: number; // 1-5, with 5 being highest
  timestamp: Date;
}

export interface EmotionalState {
  state: string;
  level: number;
}
