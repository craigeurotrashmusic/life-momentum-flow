
import { Bell, BellOff, Filter, Clock, Aperture } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNudge } from './NudgeContext';
import { getNudgeTypeClass } from './utils';
import { Nudge } from './types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const NudgeEngine = () => {
  const { nudges, nudgesMuted, toggleNudgeMute, triggerNudge } = useNudge();
  const [filter, setFilter] = useState<'all' | 'motivation' | 'reminder' | 'insight' | 'challenge'>('all');
  
  // Filter nudges based on selected filter
  const filteredNudges = filter === 'all' 
    ? nudges 
    : nudges.filter(nudge => nudge.type === filter);
  
  // Sort nudges by priority (high to low) and then by timestamp (newest first)
  const sortedNudges = [...filteredNudges].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  
  // Helper to get the total count of each nudge type
  const getNudgeTypeCount = (type: 'motivation' | 'reminder' | 'insight' | 'challenge') => {
    return nudges.filter(nudge => nudge.type === type).length;
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Nudge Engine</h3>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter size={14} />
                <span className="capitalize">{filter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter('all')}>
                <div className="flex justify-between w-full">
                  <span>All</span>
                  <Badge variant="secondary" className="ml-2">{nudges.length}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('motivation')}>
                <div className="flex justify-between w-full">
                  <span>Motivation</span>
                  <Badge variant="secondary" className="ml-2">{getNudgeTypeCount('motivation')}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('reminder')}>
                <div className="flex justify-between w-full">
                  <span>Reminder</span>
                  <Badge variant="secondary" className="ml-2">{getNudgeTypeCount('reminder')}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('insight')}>
                <div className="flex justify-between w-full">
                  <span>Insight</span>
                  <Badge variant="secondary" className="ml-2">{getNudgeTypeCount('insight')}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('challenge')}>
                <div className="flex justify-between w-full">
                  <span>Challenge</span>
                  <Badge variant="secondary" className="ml-2">{getNudgeTypeCount('challenge')}</Badge>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant={nudgesMuted ? "outline" : "secondary"}
            size="sm"
            className="flex items-center gap-1 h-8"
            onClick={toggleNudgeMute}
          >
            {nudgesMuted ? <BellOff size={14} /> : <Bell size={14} />}
            <span>{nudgesMuted ? 'Unmute' : 'Mute'}</span>
          </Button>
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {sortedNudges.slice(0, 3).map((nudge: Nudge) => (
          <div 
            key={nudge.id} 
            className="p-3 bg-secondary/30 rounded-xl min-w-[200px] max-w-[250px] cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => triggerNudge()}
          >
            <div className="flex justify-between items-start mb-1">
              <div className={`px-1.5 py-0.5 text-xs rounded capitalize ${getNudgeTypeClass(nudge.type)}`}>
                {nudge.type}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <div className="text-xs text-muted-foreground">
                  P{nudge.priority}
                </div>
              </div>
            </div>
            <p className="text-sm line-clamp-3">
              {nudge.message}
            </p>
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock size={10} />
                <span>{new Date(nudge.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="flex items-center gap-1">
                <Aperture size={10} />
                <span>Relevance: {nudge.priority * 20}%</span>
              </div>
            </div>
          </div>
        ))}
        
        {sortedNudges.length > 3 && (
          <div className="flex items-center justify-center min-w-[50px] bg-secondary/20 rounded-xl">
            <span className="text-sm font-medium">+{sortedNudges.length - 3}</span>
          </div>
        )}
        
        {sortedNudges.length === 0 && (
          <div className="p-3 bg-secondary/20 rounded-xl w-full text-center">
            <p className="text-sm text-muted-foreground">
              {nudges.length > 0 ? `No ${filter} nudges right now` : "No pending nudges"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NudgeEngine;
