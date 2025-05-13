
import React, { lazy, Suspense } from 'react';
import { BrainCircuit, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import LifeCard from './LifeCard';
import { NudgeProvider, useNudge } from '../nudge/NudgeContext';
import EmotionalHeatmap from '../nudge/EmotionalHeatmap';
import NudgeEngine from '../nudge/NudgeEngine';
import FlowStateDetection from '../nudge/FlowStateDetection';
import FloatingNudge from '../nudge/FloatingNudge';
import NudgeHistory from '../nudge/NudgeHistory';

// Lazy load the settings card
const SettingsCard = lazy(() => import('./SettingsCard'));

const NudgeCardContent = () => {
  const { triggerNudge } = useNudge();
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <div className="mt-2 space-y-5">
      <EmotionalHeatmap />
      <NudgeEngine />
      <FlowStateDetection />
      <NudgeHistory />
      
      <div className="flex gap-2">
        <Button 
          className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
          variant="default"
          onClick={triggerNudge}
        >
          <Bell size={16} />
          <span>Generate Test Nudge</span>
        </Button>
        
        <Button 
          className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
        >
          <span>{showSettings ? 'Hide Settings' : 'Show Settings'}</span>
        </Button>
      </div>
      
      {showSettings && (
        <Suspense fallback={<div className="p-4 text-center">Loading settings...</div>}>
          <SettingsCard />
        </Suspense>
      )}
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
