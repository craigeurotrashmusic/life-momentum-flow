import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { fetchEpochs, subscribeToEpochChanges, Epoch, updateEpoch } from '@/lib/api/epochs';
import { subscribeSimulations as subscribeToSimulationsAPI, unsubscribeSimulations, Simulation } from '@/lib/api/simulation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Mock data for weeks - this will eventually come from props or context, or be derived from epoch tasks
const weekData = [
  { week: 'Week 1', focus: 'Strategy planning', progress: 80 },
  { week: 'Week 2', focus: 'Client meetings', progress: 65 },
  // ... more weeks
];

const EpochTracker = () => {
  const { user } = useAuth();
  const userId = user?.id; // Use actual user ID
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentEpoch, setCurrentEpoch] = useState<Epoch | null>(null);
  const [allEpochs, setAllEpochs] = useState<Epoch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEpochs = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setCurrentEpoch(null);
      setAllEpochs([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const epochs = await fetchEpochs(userId);
      setAllEpochs(epochs);
      if (epochs.length > 0) {
        setCurrentEpoch(epochs.find(epoch => new Date(epoch.endDate) >= new Date() && new Date(epoch.startDate) <= new Date()) || epochs[0]);
      } else {
        setCurrentEpoch(null);
      }
    } catch (e) {
      setError("Failed to load epochs.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadEpochs();

    let epochSubscription: ReturnType<typeof subscribeToEpochChanges> | null = null;
    if (userId) {
      epochSubscription = subscribeToEpochChanges(userId, (payload) => {
        console.log('Epoch change received in EpochTracker:', payload);
        loadEpochs(); 
      });
    }

    return () => {
      if (epochSubscription && typeof epochSubscription.unsubscribe === 'function') {
        epochSubscription.unsubscribe();
      }
    };
  }, [loadEpochs, userId]);

  // Subscribe to simulations for dynamic recalibration
  useEffect(() => {
    if (!userId) return;

    const handleNewSimulation = (payload: RealtimePostgresChangesPayload<Simulation>) => {
      if (payload.eventType === 'INSERT' && currentEpoch) {
        const newSimulation = payload.new as Simulation;
        console.log('New simulation impacting EpochTracker:', newSimulation);
        // Conceptual: Dynamic Recalibration Logic
        // This is where you'd analyze newSimulation.health_delta, etc.
        // and potentially adjust currentEpoch.endDate or progress.
        // For now, just a toast and a conceptual log.
        toast({
          title: "Simulation Received",
          description: `Simulation '${newSimulation.scenario_type}' may impact current epoch. Consider recalibrating.`,
          duration: 7000,
        });
        // Example: If a simulation has a large negative impact, maybe flag epoch for review
        // if ((newSimulation.health_delta || 0) < -5) {
        //   console.log("EpochTracker: Significant negative health delta from simulation. Recalibration might be needed.");
        //   // Potentially call an updateEpoch if dates need shifting, e.g.
        //   // updateEpoch(currentEpoch.id, { ...currentEpoch, notes: "Recalibration suggested due to simulation" });
        // }
      }
    };

    const simulationApiChannel = subscribeToSimulationsAPI(userId, handleNewSimulation);
    
    return () => {
      unsubscribeSimulations(); // Uses module-level channel management
    };
  }, [userId, currentEpoch, loadEpochs]); // Add loadEpochs if recalibration updates epochs

  const handleRecalibrate = async () => {
    if (!currentEpoch || !userId) {
      toast({ title: "Cannot Recalibrate", description: "No current epoch or user session.", variant: "destructive" });
      return;
    }
    // Conceptual: This would trigger a more complex recalibration logic
    // For now, let's imagine it extends the epoch by a day if there was a negative simulation recently
    // This is a placeholder for a more sophisticated logic
    toast({ title: "Recalibrating...", description: "Adjusting epoch based on recent events (conceptual)." });
    try {
        const newEndDate = new Date(currentEpoch.endDate);
        newEndDate.setDate(newEndDate.getDate() + 1); // Extend by 1 day as an example
        await updateEpoch(userId, currentEpoch.id, { endDate: newEndDate.toISOString().split('T')[0] });
        toast({ title: "Epoch Recalibrated", description: "Epoch end date extended (example)." });
        loadEpochs(); // Refresh epochs
    } catch(e) {
        toast({ title: "Recalibration Failed", description: "Could not update epoch.", variant: "destructive"});
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/30 via-black/30 to-black/40 text-foreground border-purple-700/50 shadow-xl rounded-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-900/30 via-black/30 to-black/40 text-destructive-foreground border-red-700/50 shadow-xl rounded-2xl p-4">
        <CardTitle>Error</CardTitle>
        <p>{error}</p>
        <Button onClick={loadEpochs} variant="outline" className="mt-2">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </Card>
    );
  }
  
  if (!currentEpoch) {
     return (
      <Card className="bg-gradient-to-br from-purple-900/30 via-black/30 to-black/40 text-foreground border-purple-700/50 shadow-xl rounded-2xl p-4">
        <CardHeader className="p-2">
          <CardTitle className="text-xl font-semibold text-purple-300">No Epochs Planned</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <p className="text-muted-foreground">Get started by planning your first epoch in the onboarding or settings.</p>
        </CardContent>
      </Card>
    );
  }
  
  const overallProgress = 65; // Mocked - replace with actual calculation

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 via-black/30 to-black/40 text-foreground border-purple-700/50 shadow-xl rounded-2xl">
      <CardHeader 
        className="flex flex-row items-center justify-between p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <Calendar className="text-purple-400" size={24} />
          <CardTitle className="text-xl font-semibold text-purple-300">Current Epoch: {currentEpoch.title}</CardTitle>
        </div>
        {isExpanded ? <ChevronUp className="text-muted-foreground" /> : <ChevronDown className="text-muted-foreground" />}
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-4 pt-0">
          <div className="mb-3">
            <p className="text-sm text-purple-400/80">
              {new Date(currentEpoch.startDate).toLocaleDateString()} - {new Date(currentEpoch.endDate).toLocaleDateString()}
            </p>
            {currentEpoch.themeFocus && <p className="text-xs text-purple-500">Focus: {currentEpoch.themeFocus}</p>}
          </div>

          <div className="mb-5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-medium text-purple-300">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2 bg-purple-500/20" indicatorClassName="bg-purple-400" />
          </div>
          
          <h4 className="text-md font-medium text-purple-300 mb-3">Weekly Breakdown (Mock)</h4>
          <div className="flex overflow-x-auto snap-x snap-mandatory pb-3 -mx-1 px-1 space-x-3 no-scrollbar">
            {weekData.map((item, index) => (
              <div 
                key={index} 
                className="snap-start shrink-0 w-48 bg-black/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-3 space-y-2 shadow-lg"
              >
                <h5 className="font-medium text-purple-400 text-sm">{item.week}</h5>
                <p className="text-xs text-muted-foreground line-clamp-2 h-8">{item.focus}</p>
                <Progress value={item.progress} className="h-1.5 bg-purple-500/30" indicatorClassName="bg-purple-500" />
                <div className="text-xs text-right text-muted-foreground">
                  {item.progress}%
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between">
            <Button onClick={loadEpochs} variant="ghost" size="sm">
              <RefreshCw className={`mr-2 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Epochs
            </Button>
            <Button onClick={handleRecalibrate} variant="outline" size="sm" className="text-purple-300 border-purple-500 hover:bg-purple-500/20">
                Recalibrate Epoch
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default EpochTracker;
