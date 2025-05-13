
export interface ClarityMetrics {
  healthScore: number; // Normalized MPOS stack adherence + sleep quality
  wealthScore: number; // Current Wealth Alignment Score + sprint progress
  simulationImpact: { // Latest scenario deltas
    healthDelta: number;
    wealthDelta: number;
    psychologyDelta: number;
  };
  emotionalDrift: number; // Recent Emotional Heatmap variance
  flowIndex: number; // Confidence-weighted average of recent flow windows
  overallClarityScore: number; // Calculated from other metrics
  timestamp: string;
  trend: 'up' | 'down' | 'stable'; // Trend for overall clarity score
}

export interface ClarityPillar {
  name: string;
  score: number;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
}

