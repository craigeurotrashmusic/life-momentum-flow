
export interface FocusSession {
  id: string;
  date: Date;
  duration: number; // in seconds
  completed: boolean;
  flowStateAchieved: boolean;
  interruptions: number;
}

export interface FocusTimerProps {
  isActive: boolean;
  isPaused: boolean;
  time: number;
  selectedDuration: number;
  flowStateDetected: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  changeDuration: (mins: number) => void;
}
