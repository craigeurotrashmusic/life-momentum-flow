
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
