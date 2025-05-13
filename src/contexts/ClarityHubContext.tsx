
import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClarityMetrics, fetchClarityMetrics, refreshClarityMetrics } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

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

  const { data: metrics, isLoading, isError, error } = useQuery<ClarityMetrics, Error>({
    queryKey: ['clarityMetrics'],
    queryFn: fetchClarityMetrics,
    refetchInterval: 30000, // Refetch every 30 seconds to simulate real-time updates
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  const mutation = useMutation({
    mutationFn: refreshClarityMetrics,
    onSuccess: (data) => {
      queryClient.setQueryData(['clarityMetrics'], data);
    },
    onError: (err: Error) => {
      toast({
        title: "Error Refreshing Metrics",
        description: err.message || "Could not refresh Clarity Hub data.",
        variant: "destructive",
      });
    },
  });

  const refreshMetrics = () => {
    mutation.mutate();
  };

  return (
    <ClarityHubContext.Provider value={{ metrics, isLoading, isError, error, refreshMetrics, isRefreshing: mutation.isPending }}>
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
