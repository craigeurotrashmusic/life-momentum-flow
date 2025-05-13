
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNudge } from './NudgeContext';
import { getNudgeTypeClass } from './utils';
import { Nudge } from './types';

const NudgeEngine = () => {
  const { nudges, nudgesMuted, toggleNudgeMute, triggerNudge } = useNudge();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Nudge Engine</h3>
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {nudges.length} pending nudges
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={toggleNudgeMute}
        >
          {nudgesMuted ? <BellOff size={16} /> : <Bell size={16} />}
          <span>{nudgesMuted ? 'Unmute' : 'Mute'}</span>
        </Button>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {nudges.slice(0, 3).map((nudge: Nudge) => (
          <div 
            key={nudge.id} 
            className="p-3 bg-secondary/30 rounded-xl min-w-[200px] max-w-[250px] cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={triggerNudge}
          >
            <div className="flex justify-between items-start mb-1">
              <div className={`px-1.5 py-0.5 text-xs rounded capitalize ${getNudgeTypeClass(nudge.type)}`}>
                {nudge.type}
              </div>
              <div className="text-xs text-muted-foreground">
                P{nudge.priority}
              </div>
            </div>
            <p className="text-sm line-clamp-3">
              {nudge.message}
            </p>
          </div>
        ))}
        
        {nudges.length > 3 && (
          <div className="flex items-center justify-center min-w-[50px] bg-secondary/20 rounded-xl">
            <span className="text-sm font-medium">+{nudges.length - 3}</span>
          </div>
        )}
        
        {nudges.length === 0 && (
          <div className="p-3 bg-secondary/20 rounded-xl w-full text-center">
            <p className="text-sm text-muted-foreground">No pending nudges</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NudgeEngine;
