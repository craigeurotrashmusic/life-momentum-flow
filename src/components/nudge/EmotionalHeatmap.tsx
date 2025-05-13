
import { useNudge } from './NudgeContext';
import { getEmotionalStateClass } from './utils';

const EmotionalHeatmap = () => {
  const { emotionalState, energyLevel } = useNudge();

  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-medium">Emotional Heatmap</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm">Current state:</span>
          <span className={`px-2 py-0.5 rounded text-sm font-medium capitalize ${getEmotionalStateClass(emotionalState)}`}>
            {emotionalState}
          </span>
        </div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground mb-1">Energy level</div>
        <div className="flex items-center">
          <div className="w-24 h-2 bg-secondary/30 rounded-full mr-2">
            <div 
              className={`h-2 rounded-full ${
                energyLevel > 70 ? 'bg-green-500' :
                energyLevel > 40 ? 'bg-amber-500' :
                'bg-red-500'
              }`}
              style={{ width: `${energyLevel}%` }}
            />
          </div>
          <span className="text-sm font-medium">{energyLevel}%</span>
        </div>
      </div>
    </div>
  );
};

export default EmotionalHeatmap;
