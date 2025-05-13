
import { toast } from "@/hooks/use-toast";
import type { ClarityMetrics } from '@/types/clarity'; // Import for internal use
export type { ClarityMetrics } from '@/types/clarity'; // Re-export for other modules

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

// Onboarding API endpoints

// Vision slide
interface VisionData {
  values: [string, string, string];
  goals: [string, string, string];
}

export const submitVision = async (data: VisionData): Promise<void> => {
  try {
    console.log("Submitting vision data:", data);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would send data to the backend
    return;
  } catch (error) {
    console.error("Error submitting vision data:", error);
    throw error;
  }
};

// Rhythm slide
interface RhythmData {
  highEnergyStart: string;
  highEnergyEnd: string;
  wakeTime: string;
  sleepTime: string;
}

export const submitRhythm = async (data: RhythmData): Promise<void> => {
  try {
    console.log("Submitting rhythm data:", data);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would send data to the backend
    return;
  } catch (error) {
    console.error("Error submitting rhythm data:", error);
    throw error;
  }
};

// Health slide
interface HealthData {
  supplements: string[];
  sleepHours: number;
  exerciseFrequency: string;
}

export const submitHealth = async (data: HealthData): Promise<void> => {
  try {
    console.log("Submitting health data:", data);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would send data to the backend
    return;
  } catch (error) {
    console.error("Error submitting health data:", error);
    throw error;
  }
};

// Wealth slide
interface WealthData {
  primaryGoal: string;
  riskTolerance: number;
  monthlyBudget: number;
}

export const submitWealth = async (data: WealthData): Promise<void> => {
  try {
    console.log("Submitting wealth data:", data);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would send data to the backend
    return;
  } catch (error) {
    console.error("Error submitting wealth data:", error);
    throw error;
  }
};

// Emotion slide
interface EmotionData {
  moodScore: number;
  stressors: string;
}

export const submitEmotion = async (data: EmotionData): Promise<void> => {
  try {
    console.log("Submitting emotion data:", data);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would send data to the backend
    return;
  } catch (error) {
    console.error("Error submitting emotion data:", error);
    throw error;
  }
};

// Community slide
interface CommunityData {
  groupChallenges: boolean;
  reminderChannel: "in-app" | "push" | "email";
}

export const submitCommunity = async (data: CommunityData): Promise<void> => {
  try {
    console.log("Submitting community data:", data);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would send data to the backend
    return;
  } catch (error) {
    console.error("Error submitting community data:", error);
    throw error;
  }
};

// Clarity Hub types
let mockClarityMetricsData: ClarityMetrics = {
  healthScore: 75,
  wealthScore: 82,
  simulationImpact: {
    healthDelta: -2,
    wealthDelta: 1,
    psychologyDelta: -5,
  },
  emotionalDrift: 15, // Lower is better, represents variance
  flowIndex: 60,
  overallClarityScore: 0, // Will be calculated
  timestamp: new Date().toISOString(),
  trend: 'stable',
};

const calculateOverallClarity = (metrics: ClarityMetrics): number => {
  // Example calculation: weighted average. Adjust weights as needed.
  const healthWeight = 0.3;
  const wealthWeight = 0.3;
  const emotionWeight = 0.2; // Inverse of drift: (100 - drift)
  const flowWeight = 0.2;

  const overall = 
    (metrics.healthScore * healthWeight) +
    (metrics.wealthScore * wealthWeight) +
    ((100 - Math.min(metrics.emotionalDrift, 100)) * emotionWeight) + // Cap drift at 100 for calc
    (metrics.flowIndex * flowWeight);
  return Math.max(0, Math.min(100, Math.round(overall))); // Ensure score is 0-100
};

mockClarityMetricsData.overallClarityScore = calculateOverallClarity(mockClarityMetricsData);

export const fetchClarityMetrics = async (): Promise<ClarityMetrics> => {
  console.log("Fetching Clarity Metrics...");
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  // In a real app, this would fetch from a backend.
  // For now, return and slightly randomize mock data to show changes
  mockClarityMetricsData = {
    ...mockClarityMetricsData,
    healthScore: Math.min(100, mockClarityMetricsData.healthScore + Math.floor(Math.random() * 5) - 2),
    wealthScore: Math.min(100, mockClarityMetricsData.wealthScore + Math.floor(Math.random() * 5) - 2),
    emotionalDrift: Math.max(0, mockClarityMetricsData.emotionalDrift + Math.floor(Math.random() * 10) - 5),
    flowIndex: Math.min(100, mockClarityMetricsData.flowIndex + Math.floor(Math.random() * 10) - 5),
    timestamp: new Date().toISOString(),
  };
  const newOverallScore = calculateOverallClarity(mockClarityMetricsData);
  mockClarityMetricsData.trend = newOverallScore > mockClarityMetricsData.overallClarityScore ? 'up' : newOverallScore < mockClarityMetricsData.overallClarityScore ? 'down' : 'stable';
  mockClarityMetricsData.overallClarityScore = newOverallScore;
  
  console.log("Fetched Clarity Metrics:", mockClarityMetricsData);
  return { ...mockClarityMetricsData };
};

export const refreshClarityMetrics = async (): Promise<ClarityMetrics> => {
  console.log("Refreshing Clarity Metrics (triggering recalculation)...");
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate recalculation delay
  // This would typically involve calls to other services/backend logic
  // For now, it just re-runs the fetch logic to get new "randomized" data
  const refreshedMetrics = await fetchClarityMetrics(); 
  toast({
    title: "Clarity Hub Refreshed",
    description: "Your clarity metrics have been updated.",
  });
  console.log("Refreshed Clarity Metrics:", refreshedMetrics);
  return refreshedMetrics;
};

// Prefetch dashboard data
export const prefetchDashboardData = async (): Promise<void> => {
  try {
    console.log("Prefetching dashboard data");
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Set onboarding as completed
    localStorage.setItem('hasCompletedOnboarding', 'true');
    
    // In a real implementation, this would prefetch data for the dashboard
    return;
  } catch (error) {
    console.error("Error prefetching dashboard data:", error);
    throw error;
  }
};
