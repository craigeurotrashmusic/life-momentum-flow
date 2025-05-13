
export const getEmotionalStateColor = (emotionalState: string): string => {
  switch (emotionalState) {
    case 'energized': return 'bg-green-500';
    case 'focused': return 'bg-blue-500';
    case 'neutral': return 'bg-gray-400';
    case 'distracted': return 'bg-amber-500';
    case 'tired': return 'bg-red-400';
    default: return 'bg-gray-400';
  }
};

export const getEmotionalStateClass = (emotionalState: string): string => {
  switch (emotionalState) {
    case 'energized': return 'bg-green-500/20 text-green-500';
    case 'focused': return 'bg-blue-500/20 text-blue-500';
    case 'neutral': return 'bg-gray-500/20 text-gray-500';
    case 'distracted': return 'bg-amber-500/20 text-amber-500';
    default: return 'bg-red-500/20 text-red-500';
  }
};

export const getNudgeTypeClass = (type: string): string => {
  switch (type) {
    case 'motivation': return 'bg-green-500/20 text-green-500';
    case 'reminder': return 'bg-blue-500/20 text-blue-500';
    case 'insight': return 'bg-purple-500/20 text-purple-500';
    default: return 'bg-amber-500/20 text-amber-500';
  }
};

export const getEnergyLevelClass = (level: number): string => {
  if (level > 70) return 'bg-green-500';
  if (level > 40) return 'bg-amber-500';
  return 'bg-red-500';
};

export const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)}y ago`;
  
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)}mo ago`;
  
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)}d ago`;
  
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)}h ago`;
  
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)}m ago`;
  
  return `${Math.floor(seconds)}s ago`;
};

export const getIntensityColor = (intensity: number): string => {
  if (intensity >= 8) return 'bg-blue-600';
  if (intensity >= 5) return 'bg-blue-500';
  return 'bg-blue-400';
};
