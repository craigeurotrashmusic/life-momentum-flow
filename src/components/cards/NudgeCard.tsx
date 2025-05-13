
import { BrainCircuit, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import LifeCard from './LifeCard';
import { NudgeProvider, useNudge } from '../nudge/NudgeContext';
import EmotionalHeatmap from '../nudge/EmotionalHeatmap';
import NudgeEngine from '../nudge/NudgeEngine';
import FlowStateDetection from '../nudge/FlowStateDetection';
import FloatingNudge from '../nudge/FloatingNudge';

const NudgeCardContent = () => {
  const { triggerNudge } = useNudge();

  return (
    <div className="mt-2 space-y-4">
      <EmotionalHeatmap />
      <NudgeEngine />
      <FlowStateDetection />
      
      <Button 
        className="w-full py-3 mt-2 rounded-xl flex items-center justify-center gap-2"
        variant="default"
        onClick={triggerNudge}
      >
        <Bell size={16} />
        <span>Generate Test Nudge</span>
      </Button>
    </div>
  );
};

const NudgeCard = () => {
  return (
    <NudgeProvider>
      {/* Main Nudge Card */}
      <LifeCard 
        title="Psychological Connection" 
        icon={<BrainCircuit />}
        color="bg-gradient-to-br from-purple-900/30 to-pink-900/30"
        expandable={true}
      >
        <NudgeCardContent />
      </LifeCard>
      
      {/* Floating Nudge Pill */}
      <FloatingNudge />
    </NudgeProvider>
  );
};

export default NudgeCard;
