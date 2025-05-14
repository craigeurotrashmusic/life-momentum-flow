import React, { Suspense } from 'react';
import { SimulationResult } from '@/lib/api/simulation';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart as LineChartIcon } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

interface SimulationResultsProps {
  result: SimulationResult;
}

// Generate time series data for the charts
const generateTimeSeriesData = (delta: number, duration: number = 7) => {
  const data = [];
  // Start with a baseline value
  let value = 70; // baseline of 70 out of 100
  
  for (let i = 0; i <= duration; i++) {
    // Calculate the value for this day, applying more of the delta as days progress
    const dayImpact = i === 0 ? 0 : delta * (i / duration);
    const dayValue = Math.max(0, Math.min(100, value + dayImpact));
    
    data.push({
      name: i === 0 ? 'Today' : `Day ${i}`,
      value: Number(dayValue.toFixed(1))
    });
  }
  
  return data;
};

export const SimulationResults = ({ result }: SimulationResultsProps) => {
  const healthData = generateTimeSeriesData(result.healthDelta);
  const wealthData = generateTimeSeriesData(result.wealthDelta);
  const psychologyData = generateTimeSeriesData(result.psychologyDelta);
  
  const getImpactLabel = (delta: number) => {
    const absValue = Math.abs(delta);
    
    if (absValue < 5) return 'Minimal';
    if (absValue < 15) return 'Moderate';
    return 'Significant';
  };
  
  const getImpactColor = (delta: number) => {
    if (delta >= 0) return 'bg-green-500/20 text-green-500';
    if (delta > -15) return 'bg-yellow-500/20 text-yellow-500';
    return 'bg-red-500/20 text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-secondary/20 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Health Impact</h3>
            <Badge className={getImpactColor(result.healthDelta)}>
              {result.healthDelta >= 0 ? '+' : ''}{result.healthDelta}% · {getImpactLabel(result.healthDelta)}
            </Badge>
          </div>
          <div className="h-[150px] mt-4">
            <Suspense fallback={<Skeleton className="w-full h-full" />}>
              <ChartContainer
                config={{
                  value: { color: "#f87171" }
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={healthData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={25} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#f87171" 
                      strokeWidth={2}
                      dot={{ r: 3 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Suspense>
          </div>
        </div>
        
        <div className="bg-secondary/20 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Wealth Impact</h3>
            <Badge className={getImpactColor(result.wealthDelta)}>
              {result.wealthDelta >= 0 ? '+' : ''}{result.wealthDelta}% · {getImpactLabel(result.wealthDelta)}
            </Badge>
          </div>
          <div className="h-[150px] mt-4">
            <Suspense fallback={<Skeleton className="w-full h-full" />}>
              <ChartContainer
                config={{
                  value: { color: "#60a5fa" }
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wealthData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={25} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#60a5fa" 
                      strokeWidth={2}
                      dot={{ r: 3 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Suspense>
          </div>
        </div>
        
        <div className="bg-secondary/20 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Psychology Impact</h3>
            <Badge className={getImpactColor(result.psychologyDelta)}>
              {result.psychologyDelta >= 0 ? '+' : ''}{result.psychologyDelta}% · {getImpactLabel(result.psychologyDelta)}
            </Badge>
          </div>
          <div className="h-[150px] mt-4">
            <Suspense fallback={<Skeleton className="w-full h-full" />}>
              <ChartContainer
                config={{
                  value: { color: "#a78bfa" }
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={psychologyData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={25} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#a78bfa" 
                      strokeWidth={2}
                      dot={{ r: 3 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Suspense>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-medium mt-8 mb-3">Cascade Effects</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {result.cascadeEffects?.health && (
          <div className="p-4 bg-secondary/20 rounded-xl">
            <h4 className="font-medium mb-2 text-red-400">Health</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              {result.cascadeEffects.health.map((effect, i) => (
                <li key={`health-${i}`}>{effect}</li>
              ))}
            </ul>
          </div>
        )}
        
        {result.cascadeEffects?.wealth && (
          <div className="p-4 bg-secondary/20 rounded-xl">
            <h4 className="font-medium mb-2 text-blue-400">Wealth</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              {result.cascadeEffects.wealth.map((effect, i) => (
                <li key={`wealth-${i}`}>{effect}</li>
              ))}
            </ul>
          </div>
        )}
        
        {result.cascadeEffects?.psychology && (
          <div className="p-4 bg-secondary/20 rounded-xl">
            <h4 className="font-medium mb-2 text-purple-400">Psychology</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              {result.cascadeEffects.psychology.map((effect, i) => (
                <li key={`psychology-${i}`}>{effect}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationResults;
