import React, { useState, useEffect } from 'react';
import LifeCard from '@/components/cards/LifeCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, MinusSquare, Zap, Activity, Brain, DollarSign, Heart, RefreshCw, Info, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { fetchClarityMetrics, refreshClarityMetrics, subscribeToClarityMetricsChanges } from '@/lib/api/clarity'; // Corrected API imports
import type { ClarityMetrics, ClarityPillar } from '@/types/clarity'; // Corrected type imports
import { useAuth } from '@/hooks/useAuth'; // Corrected import path

// Placeholder data for coreValues and longTermGoals
const coreValues = [
  { name: "Integrity", score: 85 },
  { name: "Growth", score: 92 },
  { name: "Impact", score: 78 },
  { name: "Balance", score: 60 },
];

const longTermGoals = [
  { name: "Master Quantum Computing", target: "Complete PhD", progress: 45 },
  { name: "Achieve Financial Independence", target: "$5M Net Worth", progress: 60 },
  { name: "Write a Novel", target: "Publish Sci-Fi Epic", progress: 20 },
];

const ClarityHubCard: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const [metrics, setMetrics] = useState<ClarityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadMetrics = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const data = await fetchClarityMetrics(userId);
      setMetrics(data);
    } catch (e: any) {
      setIsError(true);
      setError(e);
      console.error("Error loading clarity metrics:", e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefreshMetrics = async () => {
    if (!userId) return;
    setIsRefreshing(true);
    setIsError(false);
    setError(null);
    try {
      const data = await refreshClarityMetrics(userId); // Using imported function
      setMetrics(data);
    } catch (e: any) {
      setIsError(true);
      setError(e);
      console.error("Error refreshing clarity metrics:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadMetrics();
      const subscription = subscribeToClarityMetricsChanges(userId, (payload: any) => { // payload type can be more specific
        console.log('Clarity metrics change received:', payload);
        loadMetrics(); 
      });
      
      return () => {
        // Assuming subscribeToClarityMetricsChanges returns an object with an unsubscribe method
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      };
    } else {
      setMetrics(null);
      setIsLoading(false);
    }
  }, [userId]);

  if (!userId && !isLoading) {
    return (
      <LifeCard title="Clarity Hub" icon={<Brain />} color="bg-gradient-to-br from-purple-900/50 to-indigo-900/50">
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Please log in to view your Clarity Hub.</p>
        </div>
      </LifeCard>
    );
  }

  if (isError && !metrics) { // Show error only if there are no metrics to display
    return (
      <LifeCard title="Clarity Hub" icon={<Brain />} color="bg-gradient-to-br from-gray-700 to-gray-800">
        <div className="text-center p-4">
          <p className="text-destructive-foreground">Error loading Clarity Metrics: {error?.message}</p>
          <Button onClick={handleRefreshMetrics} className="mt-4" disabled={isRefreshing}>
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
    { name: 'Emotion', score: 100 - metrics.emotionalDrift, icon: Activity, trend: metrics.emotionalDrift < 20 ? 'up' : metrics.emotionalDrift > 40 ? 'down' : 'stable', unit: '%' },
    { name: 'Flow', score: metrics.flowIndex, icon: Zap, trend: metrics.flowIndex > 70 ? 'up' : metrics.flowIndex < 50 ? 'down' : 'stable', unit: '%' },
    { name: 'Sim Impact', score: Math.round(((metrics.simulationImpact?.healthDelta || 0) + (metrics.simulationImpact?.wealthDelta || 0) + (metrics.simulationImpact?.psychologyDelta || 0))/3), icon: Brain, trend: 'stable', unit: 'pts' },
  ] : [];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <MinusSquare className="h-4 w-4 text-muted-foreground" />;
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
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : metrics && ( // Ensure metrics is not null before rendering content
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
              <Progress 
                value={overallScore} 
                className="w-3/4 mx-auto mt-2 h-2" 
                indicatorClassName={getOverallScoreColor(overallScore)}
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
                <Button variant="ghost" size="sm" onClick={handleRefreshMetrics} disabled={isRefreshing || isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
                    {(isRefreshing || isLoading) ? 'Refreshing...' : 'Refresh Now'}
                </Button>
                <Button variant="default" size="sm" onClick={() => setIsDialogOpen(true)}>
                    View Details
                    <Info className="ml-2 h-4 w-4" />
                </Button>
            </div>
            {metrics?.timestamp && <p className="text-xs text-muted-foreground text-center mt-4">Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}</p>}
          </>
        )}
      </div>

      {/* Detailed Dashboard Dialog (from ClarityCard.tsx) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[90%] max-h-[80vh] overflow-y-auto bg-background/90 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">Clarity Dashboard</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="text-lg font-medium mb-4 flex items-center text-foreground/90">
              <TrendingUp size={18} className="mr-2 text-purple-400" />
              Core Values Alignment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {coreValues.map((value) => (
                <div key={value.name} className="p-4 bg-secondary/50 rounded-xl shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground/90">{value.name}</span>
                    <span className="text-sm font-semibold text-purple-300">{value.score}%</span>
                  </div>
                  <Progress value={value.score} className="h-2 bg-primary/20" indicatorClassName="bg-purple-400" />
                </div>
              ))}
            </div>
            
            <h3 className="text-lg font-medium my-4 text-foreground/90">Long-term Goals</h3>
            <Carousel className="w-full" opts={{ loop: longTermGoals.length > (typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2) }}>
              <CarouselContent>
                {longTermGoals.map((goal) => (
                  <CarouselItem key={goal.name} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-4 bg-secondary/50 rounded-xl h-full shadow flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium mb-1 text-foreground/90">{goal.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">Target: {goal.target}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-semibold text-purple-300">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2 bg-primary/20" indicatorClassName="bg-purple-400" />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            
            <h3 className="text-lg font-medium my-4 text-foreground/90">Connected Data Insights</h3>
            <div className="p-4 bg-secondary/50 rounded-xl mb-4 shadow">
              <h4 className="font-medium mb-2 text-foreground/90">Supplement & Habit Impact</h4>
              <p className="text-sm text-muted-foreground">
                Your consistent meditation habit has improved focus score by 15%
              </p>
            </div>
            
            <div className="p-4 bg-secondary/50 rounded-xl shadow">
              <h4 className="font-medium mb-2 text-foreground/90">Financial Impact</h4>
              <p className="text-sm text-muted-foreground">
                Reduced discretionary spending this month has improved your wealth alignment score
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </LifeCard>
  );
};

export default ClarityHubCard;
