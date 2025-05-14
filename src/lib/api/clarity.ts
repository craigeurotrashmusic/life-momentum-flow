
import { supabase } from '../supabaseClient';
import { toast } from '@/hooks/use-toast';
import type { ClarityMetrics } from '@/types/clarity';
export type { ClarityMetrics } from '@/types/clarity'; // Re-export

let mockClarityMetricsData: ClarityMetrics = {
  healthScore: 75,
  wealthScore: 82,
  simulationImpact: {
    healthDelta: -2,
    wealthDelta: 1,
    psychologyDelta: -5,
  },
  emotionalDrift: 15,
  flowIndex: 60,
  overallClarityScore: 0,
  timestamp: new Date().toISOString(),
  trend: 'stable',
};

const calculateOverallClarity = (metrics: ClarityMetrics): number => {
  const healthWeight = 0.3;
  const wealthWeight = 0.3;
  const emotionWeight = 0.2; 
  const flowWeight = 0.2;

  const overall = 
    (metrics.healthScore * healthWeight) +
    (metrics.wealthScore * wealthWeight) +
    ((100 - Math.min(metrics.emotionalDrift, 100)) * emotionWeight) +
    (metrics.flowIndex * flowWeight);
  return Math.max(0, Math.min(100, Math.round(overall)));
};
mockClarityMetricsData.overallClarityScore = calculateOverallClarity(mockClarityMetricsData);


export const fetchClarityMetrics = async (userId?: string): Promise<ClarityMetrics> => {
  console.log("Fetching Clarity Metrics for user:", userId || "current user (mock)");
  // Actual Supabase call:
  // if (!userId) { /* get current user's ID */ }
  // const { data, error } = await supabase
  //   .from('clarity_metrics')
  //   .select('*')
  //   .eq('user_id', userId)
  //   .order('timestamp', { ascending: false })
  //   .limit(1)
  //   .single();
  // if (error || !data) { 
  //   console.error('Error fetching clarity metrics or no data:', error);
  //   // Return a default or last known good, or throw
  //   return mockClarityMetricsData; // Fallback to mock for now
  // }
  // return data;

  // Using existing mock logic for now
  await new Promise(resolve => setTimeout(resolve, 800));
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
  
  console.log("Fetched Clarity Metrics (mock):", mockClarityMetricsData);
  return { ...mockClarityMetricsData };
};

export const refreshClarityMetrics = async (userId?: string): Promise<ClarityMetrics> => {
  console.log("Refreshing Clarity Metrics (triggering recalculation for user):", userId || "current user (mock)");
  // This would typically involve calls to other services/backend logic,
  // then potentially updating the 'clarity_metrics' table or calling a Supabase function.
  // For now, it just re-runs the fetch logic to get new "randomized" data.
  const refreshedMetrics = await fetchClarityMetrics(userId); 
  toast({
    title: "Clarity Hub Refreshed",
    description: "Your clarity metrics have been updated.",
  });
  console.log("Refreshed Clarity Metrics (mock):", refreshedMetrics);
  return refreshedMetrics;
};

export const subscribeToClarityMetricsChanges = (userId: string, callback: (payload: any) => void) => {
  console.log('Subscribing to clarity metrics changes for user:', userId);
  // const channel = supabase
  //   .channel(`clarity_metrics_user_${userId}`)
  //   .on('postgres_changes', { event: '*', schema: 'public', table: 'clarity_metrics', filter: `user_id=eq.${userId}` }, callback)
  //   .subscribe();
  // return channel; // Return channel to allow unsubscription
  
  // Placeholder:
  const intervalId = setInterval(() => {
    // callback({ new: { message: 'Clarity metrics updated via mock subscription' } });
  }, 7000);
   return {
    unsubscribe: () => {
      clearInterval(intervalId);
      console.log("Unsubscribed from mock clarity changes.");
    }
  };
};

// Add createClarityMetric if needed (e.g., when a simulation runs or daily cron)
export const createClarityMetric = async (metricData: Omit<ClarityMetrics, 'overallClarityScore' | 'timestamp' | 'trend'>, userId: string): Promise<ClarityMetrics | null> => {
  console.log('Creating clarity metric for user:', userId, metricData);
  // const newMetric = {
  //   ...metricData,
  //   user_id: userId,
  //   timestamp: new Date().toISOString(),
  //   overallClarityScore: 0, // To be calculated
  //   trend: 'stable' as 'stable'
  // };
  // newMetric.overallClarityScore = calculateOverallClarity(newMetric); 
  // // Determine trend based on previous if exists.

  // const { data, error } = await supabase
  //   .from('clarity_metrics')
  //   .insert(newMetric)
  //   .select()
  //   .single();
  // if (error) {
  //    console.error('Error creating clarity_metric:', error);
  //    return null;
  // }
  // return data;
  
  // Placeholder:
  await new Promise(resolve => setTimeout(resolve, 300));
  const createdMetric = { 
    ...metricData, 
    overallClarityScore: calculateOverallClarity(metricData as ClarityMetrics), 
    timestamp: new Date().toISOString(), 
    trend: 'stable' as 'stable' 
  };
  return createdMetric as ClarityMetrics;
};

