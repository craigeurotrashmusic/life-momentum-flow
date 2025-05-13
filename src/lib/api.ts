
import { toast } from "@/hooks/use-toast";

// Simulation types
export type ScenarioType = "sleep" | "finance" | "workout" | "diet";

export interface SimulationParams {
  scenarioType: ScenarioType;
  parameters: Record<string, any>;
}

export interface SimulationResult {
  id: string;
  healthDelta: number;
  wealthDelta: number;
  psychologyDelta: number;
  cascadeEffects?: {
    health: string[];
    wealth: string[];
    psychology: string[];
  };
}

// Mock simulation endpoints for now - would be replaced with real API calls
export const createSimulation = async (params: SimulationParams): Promise<string> => {
  try {
    console.log("Creating simulation with params:", params);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For now, return a mock ID
    const simulationId = `sim_${Date.now()}`;
    return simulationId;
  } catch (error) {
    console.error("Error creating simulation:", error);
    toast({
      title: "Simulation Error",
      description: "Failed to create simulation. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

export const getSimulation = async (id: string): Promise<SimulationResult> => {
  try {
    console.log("Fetching simulation with ID:", id);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Calculate mock results based on the ID
    // In a real implementation, this would fetch from the backend
    const mockResults: SimulationResult = {
      id,
      healthDelta: -Math.floor(Math.random() * 20),
      wealthDelta: -Math.floor(Math.random() * 15),
      psychologyDelta: -Math.floor(Math.random() * 25),
      cascadeEffects: {
        health: [
          "Decreased energy levels",
          "Weakened immune system",
          "Slower recovery from exercise"
        ],
        wealth: [
          "Reduced monthly savings",
          "Delayed investment goals",
          "Increased stress about finances"
        ],
        psychology: [
          "Higher stress levels",
          "Decreased focus and productivity",
          "Mood swings and irritability"
        ]
      }
    };
    
    return mockResults;
  } catch (error) {
    console.error("Error fetching simulation:", error);
    toast({
      title: "Simulation Error",
      description: "Failed to fetch simulation results. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};
