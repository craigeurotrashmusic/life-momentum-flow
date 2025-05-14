
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { fetchEpochs, subscribeToEpochChanges, Epoch } from '@/lib/api/epochs'; // Updated import
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for weeks - this will eventually come from props or context, or be derived from epoch tasks
const weekData = [
  { week: 'Week 1', focus: 'Strategy planning', progress: 80 },
  { week: 'Week 2', focus: 'Client meetings', progress: 65 },
  // ... more weeks
];

const EpochTracker = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentEpoch, setCurrentEpoch] = useState<Epoch | null>(null);
  const [allEpochs, setAllEpochs] = useState<Epoch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Replace 'mock_user_id' with actual authenticated user ID
  const userId = 'mock_user_id'; 

  const loadEpochs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const epochs = await fetchEpochs(userId);
      setAllEpochs(epochs);
      if (epochs.length > 0) {
        // Determine current epoch based on date logic or user selection
        setCurrentEpoch(epochs[0]); // Simplistic: show the first one
      } else {
        setCurrentEpoch(null);
      }
    } catch (e) {
      setError("Failed to load epochs.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEpochs();

    const subscription = subscribeToEpochChanges(userId, (payload) => {
      console.log('Epoch change received:', payload);
      // Re-fetch or update epochs based on payload
      // This logic needs to be robust: handle insert, update, delete
      loadEpochs(); 
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [userId]);

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
          {/* Optional: Add a button to navigate to epoch planning */}
        </CardContent>
      </Card>
    );
  }
  
  // Mocked overall progress for display - replace with actual calculation
  const overallProgress = 65; 

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 via-black/30 to-black/40 text-foreground border-purple-700/50 shadow-xl rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
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
            {weekData.map((item, index) => ( // Still using mock weekData
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
          <Button onClick={loadEpochs} variant="ghost" size="sm" className="mt-3">
            <RefreshCw className={`mr-2 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Epochs
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default EpochTracker;
