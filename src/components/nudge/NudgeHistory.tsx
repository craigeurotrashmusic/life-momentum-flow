
import { useState } from 'react';
import { Calendar, Check, X, Clock } from 'lucide-react';
import { useNudge } from './NudgeContext';
import { getNudgeTypeClass } from './utils';
import { NudgeHistoryItem } from './types';

// Mock history data for demonstration
const mockHistoryItems: NudgeHistoryItem[] = [
  {
    nudge: {
      id: 'h1',
      message: "Take a 5-minute break to reset your focus",
      type: 'reminder',
      priority: 3,
      timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    },
    userResponse: 'accepted',
    responseTime: new Date(Date.now() - 60 * 59 * 1000) // 59 minutes ago
  },
  {
    nudge: {
      id: 'h2',
      message: "Your calendar shows 3 meetings this afternoon. Consider preparing now.",
      type: 'insight',
      priority: 4,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    },
    userResponse: 'dismissed',
    responseTime: new Date(Date.now() - 3 * 60 * 59 * 1000) // 2.9 hours ago
  },
  {
    nudge: {
      id: 'h3',
      message: "You've completed 5 focus sessions today. Great work!",
      type: 'motivation',
      priority: 3,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
    },
    userResponse: 'snoozed',
    responseTime: new Date(Date.now() - 5 * 60 * 59 * 1000) // 4.9 hours ago
  }
];

const NudgeHistory = () => {
  const [historyItems] = useState<NudgeHistoryItem[]>(mockHistoryItems);
  const [filter, setFilter] = useState<'all' | 'accepted' | 'dismissed' | 'snoozed'>('all');
  
  const filteredItems = historyItems.filter(item => 
    filter === 'all' || item.userResponse === filter
  );
  
  const getResponseIcon = (response: 'accepted' | 'dismissed' | 'snoozed') => {
    switch (response) {
      case 'accepted': return <Check size={14} className="text-green-500" />;
      case 'dismissed': return <X size={14} className="text-red-500" />;
      case 'snoozed': return <Clock size={14} className="text-amber-500" />;
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Nudge History</h3>
        <div className="flex text-xs">
          <button 
            className={`px-2 py-1 rounded-l-md ${filter === 'all' ? 'bg-primary/20 text-primary' : 'hover:bg-secondary/50'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-2 py-1 ${filter === 'accepted' ? 'bg-primary/20 text-primary' : 'hover:bg-secondary/50'}`}
            onClick={() => setFilter('accepted')}
          >
            Accepted
          </button>
          <button 
            className={`px-2 py-1 ${filter === 'dismissed' ? 'bg-primary/20 text-primary' : 'hover:bg-secondary/50'}`}
            onClick={() => setFilter('dismissed')}
          >
            Dismissed
          </button>
          <button 
            className={`px-2 py-1 rounded-r-md ${filter === 'snoozed' ? 'bg-primary/20 text-primary' : 'hover:bg-secondary/50'}`}
            onClick={() => setFilter('snoozed')}
          >
            Snoozed
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div 
              key={item.nudge.id} 
              className="p-3 bg-secondary/30 rounded-xl space-y-2"
            >
              <div className="flex justify-between items-start">
                <div className={`px-1.5 py-0.5 text-xs rounded capitalize ${getNudgeTypeClass(item.nudge.type)}`}>
                  {item.nudge.type}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  <span>{formatTime(item.nudge.timestamp)}</span>
                </div>
              </div>
              <p className="text-sm">{item.nudge.message}</p>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  {getResponseIcon(item.userResponse)}
                  <span className="capitalize">{item.userResponse}</span>
                </div>
                <span>{formatTime(item.responseTime)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No history items match your filter
          </div>
        )}
      </div>
    </div>
  );
};

export default NudgeHistory;
