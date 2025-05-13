
import React, { useState } from 'react';
import { useNudge } from './NudgeContext';
import { getEmotionalStateClass } from './utils';
import { Activity, BarChart3, Brain } from 'lucide-react';
import { EmotionalInsight } from './types';
import EmotionalInsightCard from './EmotionalInsightCard';

// Mock emotional insight data
const mockInsight: EmotionalInsight = {
  date: new Date(),
  summary: "You've been maintaining good focus today despite some energy fluctuations. Your emotional state is generally balanced with brief periods of high focus.",
  primaryEmotion: "focused",
  emotionalVariability: 35,
  energyTrend: "increasing",
  peakPerformanceTimes: ["10:00 AM - 12:00 PM", "3:00 PM - 5:00 PM"],
  recommendations: [
    "Schedule deep work during your morning peak performance window",
    "Take a short break around 2:30 PM when your energy typically dips",
    "Consider mindfulness exercises before your afternoon focus period",
    "Limit notifications during your peak performance times"
  ]
};

const EmotionalHeatmap = () => {
  const { emotionalState, energyLevel } = useNudge();
  const [showInsight, setShowInsight] = useState(false);
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain size={18} />
          <h3 className="text-lg font-medium">Emotional State</h3>
        </div>
        <button 
          onClick={() => setShowInsight(!showInsight)}
          className="text-xs text-primary flex items-center gap-1 hover:underline"
        >
          <BarChart3 size={14} />
          {showInsight ? 'Hide Insight' : 'View Insight'}
        </button>
      </div>
      
      <div className="bg-secondary/20 p-3 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-xs text-muted-foreground">Current State:</span>
            <div className={`px-2 py-0.5 text-xs inline-block rounded capitalize mt-1 ${getEmotionalStateClass(emotionalState)}`}>
              {emotionalState}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">Energy Level:</span>
            <div className="flex items-center gap-2 mt-1">
              <Activity size={14} className="text-blue-500" />
              <div className="bg-secondary/50 w-24 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${energyLevel}%` }}
                />
              </div>
              <span className="text-xs">{energyLevel}%</span>
            </div>
          </div>
        </div>
        
        {/* Simplified heatmap visualization */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Morning</span>
            <span>Afternoon</span>
            <span>Evening</span>
          </div>
          <div className="flex h-10">
            {['focused', 'energized', 'neutral', 'distracted', 'neutral', 'focused', 'energized', 'neutral', 'tired'].map((state, i) => (
              <div 
                key={i} 
                className={`flex-1 ${getEmotionalStateClass(state)} opacity-${Math.floor(Math.random() * 3) + 7}0`}
                style={{ opacity: Math.random() * 0.4 + 0.6 }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {showInsight && (
        <div className="mt-4 animate-fade-in">
          <EmotionalInsightCard insight={mockInsight} />
        </div>
      )}
    </div>
  );
};

export default EmotionalHeatmap;
