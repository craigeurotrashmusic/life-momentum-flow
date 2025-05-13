
import { useState } from 'react';
import { Clock, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FlowPeriod } from './types';

// Sample data for demonstration
const mockFlowPeriods: FlowPeriod[] = [
  {
    startTime: new Date(new Date().setHours(10, 15)),
    endTime: new Date(new Date().setHours(11, 45)),
    intensity: 8
  },
  {
    startTime: new Date(new Date().setHours(15, 30)),
    endTime: new Date(new Date().setHours(16, 45)),
    intensity: 9
  }
];

const FlowStateDetection = () => {
  const [timeScale, setTimeScale] = useState<'day' | 'week'>('day');
  const [flowPeriods, setFlowPeriods] = useState<FlowPeriod[]>(mockFlowPeriods);
  
  const toggleTimeScale = () => {
    setTimeScale(timeScale === 'day' ? 'week' : 'day');
  };
  
  // Calculate positions and widths for flow periods
  const calculatePosition = (period: FlowPeriod): { left: string, width: string, opacity: string } => {
    const dayStart = new Date().setHours(8, 0, 0, 0);
    const dayEnd = new Date().setHours(20, 0, 0, 0);
    const dayLength = dayEnd - dayStart;
    
    const periodStart = period.startTime.getTime();
    const periodEnd = period.endTime.getTime();
    
    const left = ((periodStart - dayStart) / dayLength) * 100;
    const width = ((periodEnd - periodStart) / dayLength) * 100;
    const opacity = (period.intensity / 10) * 0.9 + 0.1;
    
    return {
      left: `${Math.max(0, Math.min(100, left))}%`,
      width: `${Math.max(1, Math.min(100, width))}%`,
      opacity: opacity.toString()
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Flow-State Detection</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={toggleTimeScale}
          >
            {timeScale === 'day' ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          </Button>
          <span className="text-xs text-muted-foreground capitalize">{timeScale} view</span>
        </div>
      </div>
      
      <div className="p-3 bg-secondary/30 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">
            {timeScale === 'day' ? "Today's flow periods" : "This week's flow periods"}
          </div>
          <div className="text-sm font-medium">{flowPeriods.length} detected</div>
        </div>
        <div className="relative h-6 bg-secondary/30 rounded-full mb-1 overflow-hidden">
          {flowPeriods.map((period, index) => {
            const { left, width, opacity } = calculatePosition(period);
            return (
              <div 
                key={index}
                className="absolute top-0 h-full bg-blue-500 rounded-full"
                style={{ 
                  left, 
                  width, 
                  opacity 
                }}
                title={`${period.startTime.toLocaleTimeString()} - ${period.endTime.toLocaleTimeString()}`}
              />
            );
          })}
          
          {/* Time indicators */}
          <div className="absolute top-0 left-0 w-full h-full flex justify-between pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="h-full border-l border-white/10"
                style={{ left: `${i * 25}%` }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>8 AM</span>
          <span>11 AM</span>
          <span>2 PM</span>
          <span>5 PM</span>
          <span>8 PM</span>
        </div>
        
        {/* Time cursor */}
        <div className="relative h-1 mt-1">
          <div 
            className="absolute top-0 w-0.5 h-10 -mt-10 bg-accent/70"
            style={{ 
              left: `${((new Date().getHours() * 60 + new Date().getMinutes()) - 8 * 60) / (12 * 60) * 100}%`
            }}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <p>Your optimal flow periods occur mid-morning and late afternoon</p>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>Updated just now</span>
        </div>
      </div>
    </div>
  );
};

export default FlowStateDetection;
