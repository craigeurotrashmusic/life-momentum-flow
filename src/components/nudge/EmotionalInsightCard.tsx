
import React from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Clock, CalendarDays } from 'lucide-react';
import { EmotionalInsight } from './types';

interface EmotionalInsightCardProps {
  insight: EmotionalInsight;
}

const EmotionalInsightCard = ({ insight }: EmotionalInsightCardProps) => {
  const renderEnergyTrendBadge = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <Badge variant="success">Increasing</Badge>;
      case 'decreasing':
        return <Badge variant="destructive">Decreasing</Badge>;
      case 'stable':
        return <Badge variant="secondary">Stable</Badge>;
    }
  };

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain size={18} />
              <span>Emotional Insight</span>
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <CalendarDays size={14} />
              <span>
                {new Date(insight.date).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} />
            {renderEnergyTrendBadge(insight.energyTrend)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Summary</h4>
          <p className="text-sm text-muted-foreground">{insight.summary}</p>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Primary Emotion</h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">{insight.primaryEmotion}</Badge>
            <span className="text-xs text-muted-foreground">
              Variability: {insight.emotionalVariability}%
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Clock size={14} />
            <span>Peak Performance Times</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {insight.peakPerformanceTimes.map((time, index) => (
              <Badge key={index} variant="secondary">{time}</Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Recommendations</h4>
          <ul className="text-sm space-y-2">
            {insight.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionalInsightCard;
