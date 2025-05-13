
import { useState } from 'react';
import { useNudge } from './NudgeContext';
import { getEmotionalStateClass, getEnergyLevelClass } from './utils';
import { EmotionalState } from './types';

// Mock emotional state history
const mockEmotionalStates: EmotionalState[] = [
  { state: 'focused', level: 82, timestamp: new Date(Date.now() - 30 * 60000) },
  { state: 'energized', level: 90, timestamp: new Date(Date.now() - 60 * 60000) },
  { state: 'neutral', level: 65, timestamp: new Date(Date.now() - 90 * 60000) },
  { state: 'distracted', level: 45, timestamp: new Date(Date.now() - 120 * 60000) },
  { state: 'tired', level: 30, timestamp: new Date(Date.now() - 150 * 60000) },
];

const EmotionalHeatmap = () => {
  const { emotionalState, energyLevel } = useNudge();
  const [showHistory, setShowHistory] = useState(false);
  const [emotionalHistory] = useState<EmotionalState[]>(mockEmotionalStates);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Emotional Heatmap</h3>
        <button 
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>
      
      <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">Current state:</span>
            <span className={`px-2 py-0.5 rounded text-sm font-medium capitalize ${getEmotionalStateClass(emotionalState)}`}>
              {emotionalState}
            </span>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Energy level</div>
            <div className="flex items-center">
              <div className="w-full h-2 bg-secondary/30 rounded-full mr-2">
                <div 
                  className={`h-2 rounded-full ${getEnergyLevelClass(energyLevel)}`}
                  style={{ width: `${energyLevel}%` }}
                />
              </div>
              <span className="text-sm font-medium w-9">{energyLevel}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {showHistory && (
        <div className="p-3 bg-secondary/30 rounded-xl space-y-3">
          <h4 className="text-sm font-medium">State History</h4>
          <div className="space-y-2">
            {emotionalHistory.map((state, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getEnergyLevelClass(state.level)}`} />
                  <span className={`capitalize ${getEmotionalStateClass(state.state)} bg-opacity-10 px-1 py-0.5 rounded text-xs`}>
                    {state.state}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-secondary/30 rounded-full">
                    <div 
                      className={`h-1.5 rounded-full ${getEnergyLevelClass(state.level)}`}
                      style={{ width: `${state.level}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(state.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionalHeatmap;
