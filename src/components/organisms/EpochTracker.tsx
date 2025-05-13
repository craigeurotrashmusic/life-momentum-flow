
import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Mock data for weeks - this will eventually come from props or context
const weekData = [
  { week: 'Week 1', focus: 'Strategy planning', progress: 80 },
  { week: 'Week 2', focus: 'Client meetings', progress: 65 },
  { week: 'Week 3', focus: 'Development sprint', progress: 90 },
  { week: 'Week 4', focus: 'Launch preparation', progress: 40 },
  { week: 'Week 5', focus: 'User Testing', progress: 55 },
  { week: 'Week 6', focus: 'Documentation', progress: 70 },
];

// Mock data for a single epoch - this will also come from props or context
const currentEpochData = {
  title: "Q2 Project Launch & Optimization",
  dateRange: "May 2025 - July 2025",
  overallProgress: 65,
  weeks: weekData,
};

const EpochTracker = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 via-black/30 to-black/40 text-foreground border-purple-700/50 shadow-xl rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <Calendar className="text-purple-400" size={24} />
          <CardTitle className="text-xl font-semibold text-purple-300">Current Epoch: {currentEpochData.title}</CardTitle>
        </div>
        {isExpanded ? <ChevronUp className="text-muted-foreground" /> : <ChevronDown className="text-muted-foreground" />}
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-4 pt-0">
          <div className="mb-3">
            <p className="text-sm text-purple-400/80">{currentEpochData.dateRange}</p>
          </div>

          <div className="mb-5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-medium text-purple-300">{currentEpochData.overallProgress}%</span>
            </div>
            <Progress value={currentEpochData.overallProgress} className="h-2 bg-purple-500/20" indicatorClassName="bg-purple-400" />
          </div>
          
          <h4 className="text-md font-medium text-purple-300 mb-3">Weekly Breakdown</h4>
          <div className="flex overflow-x-auto snap-x snap-mandatory pb-3 -mx-1 px-1 space-x-3 no-scrollbar">
            {currentEpochData.weeks.map((item, index) => (
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
        </CardContent>
      )}
    </Card>
  );
};

export default EpochTracker;
