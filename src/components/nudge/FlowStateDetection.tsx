
import { useState, useMemo } from 'react';
import { Clock, ZoomIn, ZoomOut, Calendar, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FlowPeriod } from './types';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Enhanced sample data for demonstration
const mockFlowPeriods: FlowPeriod[] = [
  {
    startTime: new Date(new Date().setHours(10, 15)),
    endTime: new Date(new Date().setHours(11, 45)),
    intensity: 8,
    factors: {
      focusScore: 85,
      productivityScore: 78,
      interruptionCount: 2
    }
  },
  {
    startTime: new Date(new Date().setHours(15, 30)),
    endTime: new Date(new Date().setHours(16, 45)),
    intensity: 9,
    factors: {
      focusScore: 92,
      productivityScore: 88,
      interruptionCount: 0
    }
  },
  {
    startTime: new Date(new Date().setHours(9, 0)),
    endTime: new Date(new Date().setHours(9, 45)),
    intensity: 6,
    factors: {
      focusScore: 72,
      productivityScore: 65,
      interruptionCount: 5
    }
  },
  {
    startTime: new Date(new Date(Date.now() - 24 * 60 * 60 * 1000).setHours(11, 0)),
    endTime: new Date(new Date(Date.now() - 24 * 60 * 60 * 1000).setHours(12, 30)),
    intensity: 7,
    factors: {
      focusScore: 80,
      productivityScore: 75,
      interruptionCount: 3
    }
  },
  {
    startTime: new Date(new Date(Date.now() - 24 * 60 * 60 * 1000).setHours(14, 15)),
    endTime: new Date(new Date(Date.now() - 24 * 60 * 60 * 1000).setHours(15, 30)),
    intensity: 8,
    factors: {
      focusScore: 88,
      productivityScore: 82,
      interruptionCount: 1
    }
  }
];

const FlowStateDetection = () => {
  const [viewMode, setViewMode] = useState<'timeline' | 'factors' | 'trends'>('timeline');
  const [timeRange, setTimeRange] = useState<'today' | 'yesterday' | 'week'>('today');
  const [flowPeriods, setFlowPeriods] = useState<FlowPeriod[]>(mockFlowPeriods);
  
  // Filter flow periods based on selected time range
  const filteredPeriods = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return flowPeriods.filter(period => {
      const periodDate = new Date(period.startTime);
      
      if (timeRange === 'today') {
        return periodDate >= today;
      } else if (timeRange === 'yesterday') {
        return periodDate >= yesterday && periodDate < today;
      } else {
        // Week view - last 7 days
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return periodDate >= weekAgo;
      }
    });
  }, [flowPeriods, timeRange]);
  
  // Calculate average flow metrics
  const averageMetrics = useMemo(() => {
    if (filteredPeriods.length === 0) return { intensity: 0, focusScore: 0, productivityScore: 0, interruptionCount: 0 };
    
    return {
      intensity: Math.round(filteredPeriods.reduce((sum, p) => sum + p.intensity, 0) / filteredPeriods.length),
      focusScore: Math.round(filteredPeriods.reduce((sum, p) => sum + (p.factors?.focusScore || 0), 0) / filteredPeriods.length),
      productivityScore: Math.round(filteredPeriods.reduce((sum, p) => sum + (p.factors?.productivityScore || 0), 0) / filteredPeriods.length),
      interruptionCount: Math.round(filteredPeriods.reduce((sum, p) => sum + (p.factors?.interruptionCount || 0), 0) / filteredPeriods.length)
    };
  }, [filteredPeriods]);
  
  // Prepare data for bar chart
  const barData = filteredPeriods.map(period => ({
    time: period.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    intensity: period.intensity,
    focus: period.factors?.focusScore || 0,
    productivity: period.factors?.productivityScore || 0
  }));
  
  // Calculate positions and widths for flow periods on timeline
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
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as 'today' | 'yesterday' | 'week')}>
            <SelectTrigger className="h-7 text-xs w-24">
              <SelectValue placeholder="Today" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'timeline' | 'factors' | 'trends')} className="w-full">
        <TabsList className="grid grid-cols-3 h-8 mb-2">
          <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
          <TabsTrigger value="factors" className="text-xs">Factors</TabsTrigger>
          <TabsTrigger value="trends" className="text-xs">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-0">
          <div className="p-3 bg-secondary/30 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">
                {timeRange === 'today' ? "Today's flow periods" : 
                 timeRange === 'yesterday' ? "Yesterday's flow periods" : 
                 "This week's flow periods"}
              </div>
              <div className="text-sm font-medium">{filteredPeriods.length} detected</div>
            </div>
            <div className="relative h-6 bg-secondary/30 rounded-full mb-1 overflow-hidden">
              {filteredPeriods.filter(period => timeRange !== 'week' || period.startTime.getDate() === new Date().getDate()).map((period, index) => {
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
                    title={`${period.startTime.toLocaleTimeString()} - ${period.endTime.toLocaleTimeString()} (Intensity: ${period.intensity}/10)`}
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
            {timeRange === 'today' && (
              <div className="relative h-1 mt-1">
                <div 
                  className="absolute top-0 w-0.5 h-10 -mt-10 bg-accent/70"
                  style={{ 
                    left: `${((new Date().getHours() * 60 + new Date().getMinutes()) - 8 * 60) / (12 * 60) * 100}%`
                  }}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="factors" className="mt-0">
          <div className="p-3 bg-secondary/30 rounded-xl">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col p-2 bg-secondary/20 rounded-lg">
                <span className="text-xs text-muted-foreground">Average intensity</span>
                <span className="text-xl font-medium">{averageMetrics.intensity}/10</span>
              </div>
              <div className="flex flex-col p-2 bg-secondary/20 rounded-lg">
                <span className="text-xs text-muted-foreground">Focus score</span>
                <span className="text-xl font-medium">{averageMetrics.focusScore}/100</span>
              </div>
              <div className="flex flex-col p-2 bg-secondary/20 rounded-lg">
                <span className="text-xs text-muted-foreground">Productivity</span>
                <span className="text-xl font-medium">{averageMetrics.productivityScore}/100</span>
              </div>
              <div className="flex flex-col p-2 bg-secondary/20 rounded-lg">
                <span className="text-xs text-muted-foreground">Avg interruptions</span>
                <span className="text-xl font-medium">{averageMetrics.interruptionCount}</span>
              </div>
            </div>
            
            <h4 className="text-sm font-medium mb-2">Flow Period Details</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filteredPeriods.map((period, index) => (
                <div key={index} className="p-2 bg-secondary/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">
                      {period.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {period.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded">
                      Intensity: {period.intensity}/10
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-1">
                    <div className="text-xs text-muted-foreground">
                      Focus: {period.factors?.focusScore || '-'}/100
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Productivity: {period.factors?.productivityScore || '-'}/100
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Interruptions: {period.factors?.interruptionCount || '-'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-0">
          <div className="p-3 bg-secondary/30 rounded-xl">
            <div className="h-[180px] w-full">
              <ChartContainer
                config={{
                  intensity: {
                    label: "Flow intensity",
                    theme: { dark: "#3b82f6", light: "#3b82f6" }
                  },
                  focus: {
                    label: "Focus score",
                    theme: { dark: "#10b981", light: "#10b981" }
                  },
                  productivity: {
                    label: "Productivity",
                    theme: { dark: "#f59e0b", light: "#f59e0b" }
                  }
                }}
              >
                <BarChart data={barData}>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    domain={[0, 10]}
                    tickCount={6}
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tickCount={6}
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="intensity" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={10} />
                  <Bar yAxisId="right" dataKey="focus" fill="#10b981" radius={[4, 4, 0, 0]} barSize={10} />
                  <Bar yAxisId="right" dataKey="productivity" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={10} />
                </BarChart>
              </ChartContainer>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded mr-1"></div>
                  <span>Intensity (0-10)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded mr-1"></div>
                  <span>Focus (0-100)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-amber-500 rounded mr-1"></div>
                  <span>Productivity (0-100)</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
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
