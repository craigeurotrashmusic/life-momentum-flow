import React from 'react';
import LifeCard from '@/components/cards/LifeCard'; // Changed to default import
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useClarityHub } from '@/contexts/ClarityHubContext';
import { ClarityPillar } from '@/types/clarity';
import { TrendingUp, TrendingDown, MinusSquare, Zap, Activity, Brain, DollarSign, Heart, RefreshCw, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const ClarityHubCard: React.FC = () => {
  const { metrics, isLoading, isError, error, refreshMetrics, isRefreshing } = useClarityHub();

  if (isError) {
    return (
      <LifeCard title="Clarity Hub" icon={<Brain />} color="bg-gradient-to-br from-gray-700 to-gray-800">
        <div className="text-center p-4">
          <p className="text-destructive-foreground">Error loading Clarity Metrics: {error?.message}</p>
          <Button onClick={refreshMetrics} className="mt-4" disabled={isRefreshing}>
            {isRefreshing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Try Again
          </Button>
        </div>
      </LifeCard>
    );
  }

  const overallScore = metrics?.overallClarityScore ?? 0;
  const overallTrend = metrics?.trend ?? 'stable';

  const pillars: ClarityPillar[] = metrics ? [
    { name: 'Health', score: metrics.healthScore, icon: Heart, trend: metrics.healthScore > 70 ? 'up' : metrics.healthScore < 50 ? 'down' : 'stable', unit: '%' },
    { name: 'Wealth', score: metrics.wealthScore, icon: DollarSign, trend: metrics.wealthScore > 70 ? 'up' : metrics.wealthScore < 50 ? 'down' : 'stable', unit: '%' },
    { name: 'Emotion', score: 100 - metrics.emotionalDrift, icon: Activity, trend: metrics.emotionalDrift < 20 ? 'up' : metrics.emotionalDrift > 40 ? 'down' : 'stable', unit: '%' }, // Inverted for display
    { name: 'Flow', score: metrics.flowIndex, icon: Zap, trend: metrics.flowIndex > 70 ? 'up' : metrics.flowIndex < 50 ? 'down' : 'stable', unit: '%' },
    { name: 'Sim Impact', score: Math.round((metrics.simulationImpact.healthDelta + metrics.simulationImpact.wealthDelta + metrics.simulationImpact.psychologyDelta)/3), icon: Brain, trend: 'stable', unit: 'pts' },
  ] : [];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <MinusSquare className="h-4 w-4 text-muted-foreground" />; // Using MinusSquare for stable
  };

  const getOverallScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getPillarScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Actionable Micro-Leverage
  const suggestedActions = [];
  if (metrics) {
    if (metrics.healthScore < 60) suggestedActions.push({ text: "Optimize your supplement stack.", action: () => console.log("Action: Open SupplementCard") });
    if (metrics.wealthScore < 60) suggestedActions.push({ text: "Launch a 3-day financial sprint.", action: () => console.log("Action: Open WealthSprintModal") });
    if (metrics.emotionalDrift > 30) suggestedActions.push({ text: "Apply a Drift Correction protocol.", action: () => console.log("Action: Open DriftCorrectionCard") });
    if (metrics.flowIndex < 50) suggestedActions.push({ text: "Schedule a deep work block.", action: () => console.log("Action: Open Focus planning") });
  }


  return (
    <LifeCard 
      title="Clarity Hub" 
      icon={<Brain className="text-purple-400" />} 
      color="bg-gradient-to-br from-purple-900/50 to-indigo-900/50"
      expandable={true}
    >
      <div className="p-1 sm:p-2 md:p-4">
        {isLoading && !metrics ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
            </div> {/* Corrected closing tag for the grid div */}
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : (
          <>
            {/* Overall Clarity Score Section */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="text-5xl font-bold" style={{ color: getPillarScoreColor(overallScore).replace('text-', '').replace('-400', '') }}>{overallScore}
                  <span className="text-2xl text-muted-foreground">%</span>
                </div>
                <div className="absolute top-1/2 -right-6 transform -translate-y-1/2">
                   {getTrendIcon(overallTrend)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Overall Clarity Score</p>
              {/* Updated Progress component usage */}
              <Progress 
                value={overallScore} 
                className="w-3/4 mx-auto mt-2 h-2"  // Root/track styling (no dynamic background color here)
                indicatorClassName={getOverallScoreColor(overallScore)} // Indicator/fill styling
              />
            </div>

            {/* Pillars Section */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
              {pillars.map((pillar) => (
                <div key={pillar.name} className="glass-card p-3 sm:p-4 rounded-xl text-center flex flex-col items-center justify-between">
                  <pillar.icon className="h-6 w-6 mb-2 text-purple-300" />
                  <p className="text-xs sm:text-sm font-medium text-foreground/90">{pillar.name}</p>
                  <p className={`text-lg sm:text-xl font-semibold ${getPillarScoreColor(pillar.score)}`}>
                    {pillar.score}{pillar.unit ?? ''}
                  </p>
                  <div className="flex items-center justify-center mt-1">
                    {getTrendIcon(pillar.trend)}
                  </div>
                </div>
              ))}
            </div>

            {/* Actionable Micro-Leverage Section */}
            {suggestedActions.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-md font-semibold">Suggested Actions:</h4>
                {suggestedActions.slice(0, 2).map((action, index) => (
                  <Button key={index} variant="outline" size="sm" className="w-full justify-start text-left h-auto py-2" onClick={action.action}>
                    <Info size={16} className="mr-2 shrink-0 text-purple-400" />
                    {action.text}
                  </Button>
                ))}
              </div>
            )}
            
            <div className="mt-6 flex justify-between items-center">
                <Button variant="ghost" size="sm" onClick={refreshMetrics} disabled={isRefreshing}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                </Button>
                <Button variant="default" size="sm" onClick={() => console.log("View Details clicked")}>
                    View Details
                    <Info className="ml-2 h-4 w-4" />
                </Button>
            </div>
            {metrics?.timestamp && <p className="text-xs text-muted-foreground text-center mt-4">Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}</p>}
          </>
        )}
      </div>
    </LifeCard>
  );
};

export default ClarityHubCard;
