
import { useState, useEffect, useCallback } from 'react';
import type { SimulationResult, Simulation } from '@/lib/api/simulation';
import { toast } from "@/hooks/use-toast";

// Adapter function to convert Simulation to SimulationResult
function adaptSimulationToResult(simulation: Partial<Simulation>): SimulationResult {
  return {
    id: simulation.id || '',
    user_id: simulation.user_id,
    healthDelta: simulation.health_delta || 0,
    wealthDelta: simulation.wealth_delta || 0,
    psychologyDelta: simulation.psychology_delta || 0,
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
}

export function useSimulationSocket(simulationId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!simulationId) return;
    
    console.log(`Subscribing to simulation updates for ${simulationId}`);
    setIsConnected(true);
    
    const timeoutId = setTimeout(() => {
      // Create a mock simulation that matches the Simulation type structure
      const mockSimulation: Partial<Simulation> = {
        id: simulationId,
        health_delta: -Math.floor(Math.random() * 20),
        wealth_delta: -Math.floor(Math.random() * 15),
        psychology_delta: -Math.floor(Math.random() * 25)
      };
      
      // Convert the Simulation to SimulationResult
      const adaptedResult = adaptSimulationToResult(mockSimulation);
      setSimulationResult(adaptedResult);
      
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
