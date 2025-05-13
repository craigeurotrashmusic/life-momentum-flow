
import { useState } from 'react';
import { useNudge } from './NudgeContext';
import { getEmotionalStateClass, getEnergyLevelClass } from './utils';
import { EmotionalState } from './types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Clock, ArrowRight, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock emotional state history
const mockEmotionalStates: EmotionalState[] = [
  { state: 'focused', level: 82, timestamp: new Date(Date.now() - 30 * 60000) },
  { state: 'energized', level: 90, timestamp: new Date(Date.now() - 60 * 60000) },
  { state: 'neutral', level: 65, timestamp: new Date(Date.now() - 90 * 60000) },
  { state: 'distracted', level: 45, timestamp: new Date(Date.now() - 120 * 60000) },
  { state: 'tired', level: 30, timestamp: new Date(Date.now() - 150 * 60000) },
  { state: 'neutral', level: 50, timestamp: new Date(Date.now() - 180 * 60000) },
  { state: 'focused', level: 75, timestamp: new Date(Date.now() - 210 * 60000) },
  { state: 'energized', level: 85, timestamp: new Date(Date.now() - 240 * 60000) },
];

const EmotionalHeatmap = () => {
  const { emotionalState, energyLevel } = useNudge();
  const [view, setView] = useState<'current' | 'history' | 'chart'>('current');
  const [emotionalHistory] = useState<EmotionalState[]>(mockEmotionalStates);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Prepare data for chart
  const chartData = emotionalHistory.map(entry => ({
    time: formatTime(entry.timestamp),
    energy: entry.level,
    state: entry.state
  })).reverse();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Emotional Heatmap</h3>
        <Tabs 
          defaultValue="current" 
          className="w-[200px]" 
          onValueChange={(value) => setView(value as 'current' | 'history' | 'chart')}
        >
          <TabsList className="grid grid-cols-3 h-7">
            <TabsTrigger value="current" className="text-xs">Current</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
            <TabsTrigger value="chart" className="text-xs">Chart</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {view === 'current' && (
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
      )}
      
      {view === 'history' && (
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
      
      {view === 'chart' && (
        <div className="p-3 bg-secondary/30 rounded-xl space-y-3">
          <div className="h-[200px] w-full">
            <ChartContainer
              config={{
                energy: {
                  label: "Energy Level",
                  theme: { dark: "#3b82f6", light: "#3b82f6" }
                }
              }}
            >
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">
                                Time
                              </span>
                              <span className="font-bold text-xs">
                                {payload[0].payload.time}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">
                                Energy
                              </span>
                              <span className="font-bold text-xs">
                                {payload[0].payload.energy}%
                              </span>
                            </div>
                            <div className="flex flex-col col-span-2">
                              <span className="text-xs text-muted-foreground">
                                State
                              </span>
                              <span className={`font-bold text-xs capitalize ${getEmotionalStateClass(payload[0].payload.state)}`}>
                                {payload[0].payload.state}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
            <span>Energy level over time</span>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>Last 4 hours</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <p>Your peak emotional state occurs mid-morning</p>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>Updated just now</span>
        </div>
      </div>
    </div>
  );
};

export default EmotionalHeatmap;
