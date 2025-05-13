
import { Nudge, EmotionalState, FlowPeriod, NudgeHistoryItem } from './types';

interface PersonalizationContext {
  emotionalState: string;
  energyLevel: number;
  flowPeriods: FlowPeriod[];
  nudgeHistory: NudgeHistoryItem[];
}

// Generate a personalized nudge based on user's emotional state and history
export const generatePersonalizedNudge = async (context: PersonalizationContext): Promise<Nudge | null> => {
  const { emotionalState, energyLevel, flowPeriods, nudgeHistory } = context;
  
  // Generate a unique ID for the nudge
  const id = `nudge-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Analyze flow periods to find patterns
  const hasRecentFlowState = flowPeriods.some(period => {
    const hoursSinceFlow = (Date.now() - period.endTime.getTime()) / (1000 * 60 * 60);
    return hoursSinceFlow < 4;
  });
  
  // Check if user has been in a specific emotional state
  let priority = 3;
  let nudgeType: 'motivation' | 'reminder' | 'insight' | 'challenge' = 'insight';
  let message = "";
  
  // Using emotional state and energy level to determine type of nudge to send
  if (emotionalState === 'tired' && energyLevel < 40) {
    nudgeType = 'motivation';
    priority = 4;
    message = "Your energy levels are low. Consider taking a short break or going for a quick walk.";
  } else if (emotionalState === 'distracted' && energyLevel > 50) {
    nudgeType = 'reminder';
    priority = 4;
    message = "You seem distracted but have good energy. Try focused work for 25 minutes with no distractions.";
  } else if (emotionalState === 'focused' && hasRecentFlowState) {
    nudgeType = 'insight';
    priority = 5;
    message = "You're in a great flow today! This is a perfect time to tackle challenging tasks.";
  } else if (emotionalState === 'energized') {
    nudgeType = 'challenge';
    priority = 3;
    message = "You're feeling energized! Take on that task you've been postponing.";
  } else if (emotionalState === 'neutral') {
    // Look at history to personalize
    const mostCommonResponse = analyzeNudgeHistory(nudgeHistory);
    if (mostCommonResponse === 'dismissed') {
      // User tends to dismiss nudges, make this one more relevant
      nudgeType = 'insight';
      priority = 3;
      message = "Based on your past activity patterns, your most productive time is approaching.";
    } else {
      nudgeType = 'reminder';
      priority = 2;
      message = "Taking regular short breaks improves long-term productivity.";
    }
  }
  
  if (!message) return null;
  
  return {
    id,
    message,
    type: nudgeType,
    priority,
    timestamp: new Date()
  };
};

// Analyze nudge history to find patterns
const analyzeNudgeHistory = (history: NudgeHistoryItem[]): 'accepted' | 'dismissed' | 'snoozed' => {
  if (history.length === 0) return 'accepted';
  
  const responses = history.map(item => item.userResponse);
  const counts = {
    accepted: responses.filter(r => r === 'accepted').length,
    dismissed: responses.filter(r => r === 'dismissed').length,
    snoozed: responses.filter(r => r === 'snoozed').length
  };
  
  if (counts.accepted >= counts.dismissed && counts.accepted >= counts.snoozed) {
    return 'accepted';
  } else if (counts.dismissed >= counts.accepted && counts.dismissed >= counts.snoozed) {
    return 'dismissed';
  } else {
    return 'snoozed';
  }
};
