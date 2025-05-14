import { useState, useEffect, useCallback } from 'react';
import type { SimulationResult } from '@/lib/api/simulation';
import { toast } from "@/hooks/use-toast";

export function useSimulationSocket(simulationId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!simulationId) return;
    
    console.log(`Subscribing to simulation updates for ${simulationId}`);
    setIsConnected(true);
    
    const timeoutId = setTimeout(() => {
      const mockResult: SimulationResult = {
        id: simulationId,
        healthDelta: -Math.floor(Math.random() * 20),
        wealthDelta: -Math.floor(Math.random() * 15),
        psychologyDelta: -Math.floor(Math.random() * 25),
        cascadeEffects: {
          health: [
            "Decreased energy levels",
            "Weakened immune system",
          ],
          wealth: [
            "Reduced monthly savings",
            "Delayed investment goals",
          ],
          psychology: [
            "Higher stress levels",
            "Decreased focus",
          ]
        }
      };
      
      setSimulationResult(mockResult);
      toast({
        title: "Simulation Complete",
        description: `Your ${simulationId} simulation is ready to view.`,
      });
    }, 3000);
    
    return () => {
      clearTimeout(timeoutId);
      setIsConnected(false);
      console.log(`Unsubscribed from simulation updates for ${simulationId}`);
    };
  }, [simulationId]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setSimulationResult(null);
  }, []);

  return { isConnected, simulationResult, error, disconnect };
}
