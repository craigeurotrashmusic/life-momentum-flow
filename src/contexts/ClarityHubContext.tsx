import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClarityMetrics, refreshClarityMetrics } from '@/lib/api/clarity';
import type { ClarityMetrics } from '@/types/clarity';
import { subscribeSimulations, unsubscribeSimulations, Simulation } from '@/lib/api/simulation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface ClarityHubContextType {
  metrics: ClarityMetrics | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refreshMetrics: () => void;
  isRefreshing: boolean;
}

const ClarityHubContext = createContext<ClarityHubContextType | undefined>(undefined);

export const ClarityHubProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: metrics, isLoading, isError, error, refetch: refetchClarityMetricsQuery } = useQuery<ClarityMetrics, Error>({
    queryKey: ['clarityMetrics', user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.reject(new Error("User not authenticated for Clarity Metrics"));
      return fetchClarityMetrics(user.id);
    },
    enabled: !!user?.id, 
    refetchInterval: 300000, 
    staleTime: 60000, 
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (!user?.id) return Promise.reject(new Error("User not authenticated for refreshing Clarity Metrics"));
      return refreshClarityMetrics(user.id);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['clarityMetrics', user?.id], data);
      toast({
        title: "Clarity Hub Refreshed",
        description: "Your clarity metrics have been updated.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Error Refreshing Metrics",
        description: err.message || "Could not refresh Clarity Hub data.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!user?.id) return;

    const handleNewSimulation = (payload: RealtimePostgresChangesPayload<Simulation>) => {
      if (payload.eventType === 'INSERT') {
        const newSimulation = payload.new as Simulation;
        console.log('New simulation in ClarityHubContext:', newSimulation);
        toast({
            title: "Simulation Impact",
            description: `New simulation '${newSimulation.scenario_type}' recorded. Recalculating Clarity Hub...`,
            duration: 5000,
        });
        refetchClarityMetricsQuery(); 
      }
    };
    
    const simulationSubscription = subscribeSimulations(user.id, handleNewSimulation);

    return () => {
      unsubscribeSimulations();
    };
  }, [user?.id, queryClient, refetchClarityMetricsQuery]);

  const triggerRefreshMetrics = () => {
    if (user?.id) {
      mutation.mutate();
    } else {
      toast({ title: "Auth Error", description: "Please log in to refresh metrics.", variant: "destructive" });
    }
  };

  return (
    <ClarityHubContext.Provider value={{ metrics, isLoading, isError, error, refreshMetrics: triggerRefreshMetrics, isRefreshing: mutation.isPending }}>
      {children}
    </ClarityHubContext.Provider>
  );
};

export const useClarityHub = (): ClarityHubContextType => {
  const context = useContext(ClarityHubContext);
  if (context === undefined) {
    throw new Error('useClarityHub must be used within a ClarityHubProvider');
  }
  return context;
};
