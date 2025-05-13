
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
  
  // Find the user's peak performance time based on flow state history
  const peakPerformanceTimes = analyzeFlowPeriods(flowPeriods);
  
  // Analysis of user response patterns to adjust nudge strategy
  const responsePatterns = analyzeNudgeResponsePatterns(nudgeHistory);
  
  // Check if user has been in a specific emotional state
  let priority = 3;
  let nudgeType: 'motivation' | 'reminder' | 'insight' | 'challenge' = 'insight';
  let message = "";
  
  // Using emotional state, energy level, and historical patterns to determine type of nudge to send
  if (emotionalState === 'tired' && energyLevel < 40) {
    nudgeType = 'motivation';
    priority = calculatePriority(nudgeType, responsePatterns, 4);
    
    // Check if user responds well to direct or gentle motivation
    if (responsePatterns.prefers === 'direct') {
      message = "Energy critically low. Take a 5-minute walk or quick power nap to reset.";
    } else {
      message = "Your energy levels are low. Consider taking a short break or going for a quick walk.";
    }
  } else if (emotionalState === 'distracted' && energyLevel > 50) {
    nudgeType = 'reminder';
    priority = calculatePriority(nudgeType, responsePatterns, 4);
    
    // Check if the user is in their typical flow time
    if (isCurrentTimePeakHour(peakPerformanceTimes)) {
      message = "This is usually your peak focus time. Try 25 minutes of focused work with no distractions.";
    } else {
      message = "You seem distracted but have good energy. Try focused work for 25 minutes with no distractions.";
    }
  } else if (emotionalState === 'focused' && hasRecentFlowState) {
    nudgeType = 'insight';
    priority = calculatePriority(nudgeType, responsePatterns, 5);
    
    // Personalize based on flow intensity
    const avgIntensity = flowPeriods.reduce((sum, p) => sum + p.intensity, 0) / flowPeriods.length;
    if (avgIntensity > 7) {
      message = "You're in an exceptional flow today! This is a perfect time for your most challenging tasks.";
    } else {
      message = "You're in a good flow today! This is a perfect time to tackle challenging tasks.";
    }
  } else if (emotionalState === 'energized') {
    nudgeType = 'challenge';
    priority = calculatePriority(nudgeType, responsePatterns, 3);
    
    if (responsePatterns.dismissRate > 0.7) {
      // User often dismisses challenges, make it more relevant
      message = "Your energy is high - what's the one task you've been postponing that you could complete now?";
    } else {
      message = "You're feeling energized! Take on that task you've been postponing.";
    }
  } else if (emotionalState === 'neutral') {
    // Look at history to personalize
    const mostCommonResponse = analyzeNudgeHistory(nudgeHistory);
    
    if (mostCommonResponse === 'dismissed') {
      // User tends to dismiss nudges, make this one more relevant
      nudgeType = 'insight';
      priority = calculatePriority(nudgeType, responsePatterns, 3);
      
      // Check if we're approaching a typical flow period
      const nextFlowPeriod = getNextPredictedFlowPeriod(peakPerformanceTimes);
      if (nextFlowPeriod) {
        message = `Based on your patterns, your next productive period begins around ${formatTime(nextFlowPeriod)}. Consider preparing now.`;
      } else {
        message = "Based on your past activity patterns, your most productive time is approaching.";
      }
    } else {
      nudgeType = 'reminder';
      priority = calculatePriority(nudgeType, responsePatterns, 2);
      message = "Taking regular short breaks improves long-term productivity.";
    }
  }
  
  if (!message) return null;
  
  // Apply final personalization adjustments based on user history
  if (nudgeHistory.length > 10) {
    // Check for overused phrases and vary the language
    if (responsePatterns.repetitionCount > 3) {
      message = varyLanguage(message, nudgeType);
    }
    
    // Add personal touch if the user responds well to it
    if (responsePatterns.personalizationScore > 0.7) {
      message = addPersonalTouch(message);
    }
  }
  
  return {
    id,
    message,
    type: nudgeType,
    priority,
    timestamp: new Date()
  };
};

// Calculate priority based on user's historical response to this nudge type
const calculatePriority = (
  nudgeType: 'motivation' | 'reminder' | 'insight' | 'challenge',
  responsePatterns: ReturnType<typeof analyzeNudgeResponsePatterns>,
  basePriority: number
): number => {
  let adjustedPriority = basePriority;
  
  // If user accepts this type often, slightly increase priority
  if (responsePatterns.acceptanceByType[nudgeType] > 0.7) {
    adjustedPriority += 1;
  }
  
  // If user dismisses this type often, decrease priority
  if (responsePatterns.dismissalByType[nudgeType] > 0.7) {
    adjustedPriority -= 1;
  }
  
  // Ensure priority stays within bounds
  return Math.max(1, Math.min(5, adjustedPriority));
};

// Analyze flow periods to find optimal times
const analyzeFlowPeriods = (flowPeriods: FlowPeriod[]): { hour: number, intensity: number }[] => {
  const hourlyIntensity: Record<number, { total: number, count: number }> = {};
  
  flowPeriods.forEach(period => {
    const hour = period.startTime.getHours();
    if (!hourlyIntensity[hour]) {
      hourlyIntensity[hour] = { total: 0, count: 0 };
    }
    hourlyIntensity[hour].total += period.intensity;
    hourlyIntensity[hour].count += 1;
  });
  
  // Convert to array of hours and their average intensity
  return Object.entries(hourlyIntensity)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      intensity: data.total / data.count
    }))
    .sort((a, b) => b.intensity - a.intensity); // Sort by intensity, highest first
};

// Check if current time is during peak performance hours
const isCurrentTimePeakHour = (peakTimes: { hour: number, intensity: number }[]): boolean => {
  if (peakTimes.length === 0) return false;
  
  const currentHour = new Date().getHours();
  const peakHours = peakTimes.slice(0, 2).map(p => p.hour); // Top 2 peak hours
  return peakHours.includes(currentHour);
};

// Get next predicted flow period
const getNextPredictedFlowPeriod = (peakTimes: { hour: number, intensity: number }[]): string | null => {
  if (peakTimes.length === 0) return null;
  
  const currentHour = new Date().getHours();
  
  // Find the next peak hour after current time
  const nextPeak = peakTimes.find(p => p.hour > currentHour);
  if (nextPeak) {
    return `${nextPeak.hour}:00`;
  }
  
  // If no next peak today, return first peak for tomorrow
  return `${peakTimes[0].hour}:00 tomorrow`;
};

// Format time in a readable way
const formatTime = (timeStr: string): string => {
  const [hourStr] = timeStr.split(':');
  const hour = parseInt(hourStr);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  if (timeStr.includes('tomorrow')) {
    return `${displayHour}:00 ${period} tomorrow`;
  }
  return `${displayHour}:00 ${period}`;
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

// More detailed analysis of nudge response patterns
const analyzeNudgeResponsePatterns = (history: NudgeHistoryItem[]) => {
  if (history.length === 0) {
    return {
      acceptRate: 0.5,
      dismissRate: 0.3,
      snoozeRate: 0.2,
      prefers: 'gentle' as 'direct' | 'gentle',
      repetitionCount: 0,
      personalizationScore: 0.5,
      acceptanceByType: { motivation: 0.5, reminder: 0.5, insight: 0.5, challenge: 0.5 },
      dismissalByType: { motivation: 0.3, reminder: 0.3, insight: 0.3, challenge: 0.3 }
    };
  }
  
  const total = history.length;
  const accepted = history.filter(h => h.userResponse === 'accepted').length;
  const dismissed = history.filter(h => h.userResponse === 'dismissed').length;
  const snoozed = history.filter(h => h.userResponse === 'snoozed').length;
  
  // Calculate response rates by nudge type
  const typeResponses: Record<string, { accepted: number, dismissed: number, total: number }> = {
    motivation: { accepted: 0, dismissed: 0, total: 0 },
    reminder: { accepted: 0, dismissed: 0, total: 0 },
    insight: { accepted: 0, dismissed: 0, total: 0 },
    challenge: { accepted: 0, dismissed: 0, total: 0 }
  };
  
  history.forEach(item => {
    const type = item.nudge.type;
    if (typeResponses[type]) {
      typeResponses[type].total += 1;
      if (item.userResponse === 'accepted') {
        typeResponses[type].accepted += 1;
      } else if (item.userResponse === 'dismissed') {
        typeResponses[type].dismissed += 1;
      }
    }
  });
  
  // Check for repeated messages
  const messages = history.map(h => h.nudge.message);
  const uniqueMessages = new Set(messages);
  const repetitionCount = messages.length - uniqueMessages.size;
  
  // Determine preference for direct vs gentle language
  const directPhrases = ['now', 'immediately', 'critical', 'urgent', 'must'];
  const directMessages = messages.filter(msg => 
    directPhrases.some(phrase => msg.toLowerCase().includes(phrase))
  );
  
  const directAccepted = history.filter((h, i) => 
    directMessages.includes(h.nudge.message) && h.userResponse === 'accepted'
  ).length;
  
  const prefersDirectRatio = directMessages.length > 0 ? 
    directAccepted / directMessages.length : 0.5;
  
  // Calculate personalization score (how well user responds to personalized nudges)
  const personalizedMessages = messages.filter(msg => 
    msg.includes('your') || msg.includes('you\'re') || msg.includes('you are')
  );
  
  const personalizedAccepted = history.filter((h, i) => 
    personalizedMessages.includes(h.nudge.message) && h.userResponse === 'accepted'
  ).length;
  
  const personalizationScore = personalizedMessages.length > 0 ? 
    personalizedAccepted / personalizedMessages.length : 0.5;
  
  return {
    acceptRate: accepted / total,
    dismissRate: dismissed / total,
    snoozeRate: snoozed / total,
    prefers: prefersDirectRatio > 0.6 ? 'direct' : 'gentle' as 'direct' | 'gentle',
    repetitionCount,
    personalizationScore,
    acceptanceByType: {
      motivation: typeResponses.motivation.total > 0 ? typeResponses.motivation.accepted / typeResponses.motivation.total : 0.5,
      reminder: typeResponses.reminder.total > 0 ? typeResponses.reminder.accepted / typeResponses.reminder.total : 0.5,
      insight: typeResponses.insight.total > 0 ? typeResponses.insight.accepted / typeResponses.insight.total : 0.5,
      challenge: typeResponses.challenge.total > 0 ? typeResponses.challenge.accepted / typeResponses.challenge.total : 0.5
    },
    dismissalByType: {
      motivation: typeResponses.motivation.total > 0 ? typeResponses.motivation.dismissed / typeResponses.motivation.total : 0.3,
      reminder: typeResponses.reminder.total > 0 ? typeResponses.reminder.dismissed / typeResponses.reminder.total : 0.3,
      insight: typeResponses.insight.total > 0 ? typeResponses.insight.dismissed / typeResponses.insight.total : 0.3,
      challenge: typeResponses.challenge.total > 0 ? typeResponses.challenge.dismissed / typeResponses.challenge.total : 0.3
    }
  };
};

// Vary language to avoid repetitiveness
const varyLanguage = (message: string, type: string): string => {
  // Simple phrase replacements to add variety
  const variations: Record<string, string[]> = {
    'energy levels are low': ['energy is depleted', 'you seem tired', 'you need a recharge'],
    'perfect time': ['ideal moment', 'great opportunity', 'optimal time'],
    'take a short break': ['pause briefly', 'step away for a moment', 'give yourself a quick rest'],
    'focused work': ['deep work session', 'concentrated effort', 'undistracted attention'],
    'challenging tasks': ['difficult work items', 'complex problems', 'demanding activities']
  };
  
  let newMessage = message;
  Object.entries(variations).forEach(([phrase, alternatives]) => {
    if (message.includes(phrase)) {
      const alternative = alternatives[Math.floor(Math.random() * alternatives.length)];
      newMessage = newMessage.replace(phrase, alternative);
    }
  });
  
  return newMessage;
};

// Add personal touch to messages
const addPersonalTouch = (message: string): string => {
  // Don't add personal touch if it already has one
  if (message.includes('your ') || message.includes('you\'re ') || message.includes('you ')) {
    return message;
  }
  
  const personalTouches = [
    'I notice that ',
    'It looks like ',
    'I\'ve observed that ',
    'Based on your patterns, '
  ];
  
  const touch = personalTouches[Math.floor(Math.random() * personalTouches.length)];
  return touch + message.charAt(0).toLowerCase() + message.slice(1);
};
