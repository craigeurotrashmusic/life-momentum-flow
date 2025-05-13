
// Helper function to get appropriate color class based on nudge type
export const getNudgeTypeClass = (type: 'motivation' | 'reminder' | 'insight' | 'challenge'): string => {
  switch (type) {
    case 'motivation':
      return 'bg-blue-500/20 text-blue-500';
    case 'reminder':
      return 'bg-amber-500/20 text-amber-500';
    case 'insight':
      return 'bg-purple-500/20 text-purple-500';
    case 'challenge':
      return 'bg-green-500/20 text-green-500';
    default:
      return 'bg-gray-500/20 text-gray-500';
  }
};

// Helper function to get appropriate color class based on emotional state
export const getEmotionalStateClass = (state: string): string => {
  switch (state) {
    case 'focused':
      return 'bg-blue-500/20 text-blue-500';
    case 'energized':
      return 'bg-green-500/20 text-green-500';
    case 'neutral':
      return 'bg-gray-500/20 text-gray-500';
    case 'distracted':
      return 'bg-amber-500/20 text-amber-500';
    case 'tired':
      return 'bg-red-500/20 text-red-500';
    default:
      return 'bg-gray-500/20 text-gray-500';
  }
};

// Helper function to get appropriate color class based on energy level
export const getEnergyLevelClass = (level: number): string => {
  if (level >= 80) return 'bg-green-500';
  if (level >= 60) return 'bg-blue-500';
  if (level >= 40) return 'bg-amber-500';
  if (level >= 20) return 'bg-orange-500';
  return 'bg-red-500';
};

// Format time for display
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format date for display
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Calculate time difference in minutes
export const getTimeDiffInMinutes = (startTime: Date, endTime: Date): number => {
  return Math.round((endTime.getTime() - startTime.getTime()) / 60000);
};

// Check if a time is within quiet hours
export const isInQuietHours = (time: Date, quietHoursStart: string, quietHoursEnd: string, enabled: boolean): boolean => {
  if (!enabled) return false;
  
  const currentHour = time.getHours();
  const currentMinute = time.getMinutes();
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  
  const [startHour, startMinute] = quietHoursStart.split(':').map(Number);
  const [endHour, endMinute] = quietHoursEnd.split(':').map(Number);
  
  const startDate = new Date(time);
  startDate.setHours(startHour, startMinute, 0, 0);
  
  const endDate = new Date(time);
  endDate.setHours(endHour, endMinute, 0, 0);
  
  // Handle overnight quiet hours
  if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
    if (time >= startDate || time <= endDate) {
      return true;
    }
  } else {
    if (time >= startDate && time <= endDate) {
      return true;
    }
  }
  
  return false;
};

// Calculate best time to show a nudge based on flow state predictions
export const calculateOptimalNudgeTime = (flowPeriods: any[]): Date | null => {
  if (!flowPeriods || flowPeriods.length === 0) return null;
  
  // Group flow periods by hour
  const hourlyFlowIntensity: Record<number, number[]> = {};
  flowPeriods.forEach(period => {
    const hour = new Date(period.startTime).getHours();
    if (!hourlyFlowIntensity[hour]) hourlyFlowIntensity[hour] = [];
    hourlyFlowIntensity[hour].push(period.intensity);
  });
  
  // Calculate average intensity by hour
  const hourlyAverages = Object.entries(hourlyFlowIntensity).map(([hour, intensities]) => ({
    hour: parseInt(hour),
    avgIntensity: intensities.reduce((sum, val) => sum + val, 0) / intensities.length
  }));
  
  // Find transitions between low and high flow states
  const sortedHours = [...hourlyAverages].sort((a, b) => a.hour - b.hour);
  let bestTransitionHour = -1;
  let maxIntensityDifference = -1;
  
  for (let i = 1; i < sortedHours.length; i++) {
    const current = sortedHours[i];
    const previous = sortedHours[i-1];
    
    // Look for significant increases in intensity
    const intensityDifference = current.avgIntensity - previous.avgIntensity;
    if (intensityDifference > maxIntensityDifference) {
      maxIntensityDifference = intensityDifference;
      bestTransitionHour = current.hour;
    }
  }
  
  // If no good transition found, use the hour before the most intense period
  if (bestTransitionHour === -1) {
    const mostIntenseHour = hourlyAverages.reduce((best, current) => 
      current.avgIntensity > best.avgIntensity ? current : best
    ).hour;
    
    bestTransitionHour = mostIntenseHour > 0 ? mostIntenseHour - 1 : 23;
  }
  
  // Create a date for the optimal nudge time (15 minutes before the hour)
  const optimalTime = new Date();
  optimalTime.setHours(bestTransitionHour, 45, 0, 0);
  
  // If that time has already passed today, schedule for tomorrow
  const now = new Date();
  if (optimalTime <= now) {
    optimalTime.setDate(optimalTime.getDate() + 1);
  }
  
  return optimalTime;
};
