import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SlideProps } from './types';
import { createEpoch, Epoch } from '@/lib/api/epochs';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CalendarDays } from 'lucide-react';

const EpochSetupSlide: React.FC<SlideProps> = ({ onNext, isSubmitting, setIsSubmitting }) => {
  const navigate = useNavigate();
  // For simplicity, managing one epoch. You'll want a dynamic form for multiple epochs.
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [themeFocus, setThemeFocus] = useState('');
  const [numEpochs, setNumEpochs] = useState(1); // Example, could be driven by input

  const handleSubmit = async () => {
    if (!title || !startDate || !endDate) {
      toast({ title: "Validation Error", description: "Please fill in title, start date, and end date.", variant: "destructive" });
      return;
    }
    if (setIsSubmitting) setIsSubmitting(true);
    
    // Example for one epoch. Loop or map for multiple.
    const epochData: Omit<Epoch, 'id' | 'user_id' | 'created_at'> = {
      title,
      startDate,
      endDate,
      themeFocus,
    };

    try {
      const created = await createEpoch(epochData);
      if (created) {
        toast({
          title: "Epoch Planned!",
          description: "Your first epoch has been set up.",
        });
        // In a real scenario, you might want to ensure all epochs are created if numEpochs > 1
        // Then navigate or call onNext
        if (onNext) onNext(); 
        // navigate('/dashboard'); // Or wherever the user goes next, e.g. after all onboarding
      } else {
        // Error toast would be handled by createEpoch, but you can add more specific ones here
      }
    } catch (error) {
      // This catch is more for unexpected errors in the component itself
      console.error("Epoch submission error in component:", error);
      toast({ title: "Submission Error", description: "An unexpected error occurred while saving epoch.", variant: "destructive" });
    } finally {
      if (setIsSubmitting) setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-10 md:px-20 pb-24 text-center">
      <div className="mb-8">
        <CalendarDays className="mx-auto h-16 w-16 text-primary opacity-80" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">Plan Your Epochs</h1>
      <p className="text-muted-foreground mb-10 max-w-md text-base md:text-lg">
        Epochs are focused periods for achieving significant milestones. Let's define your first one.
      </p>
      
      <div className="w-full max-w-md space-y-6 text-left">
        {/* Number of epochs input removed for simplicity, focusing on one epoch setup */}
        {/* 
        <div className="space-y-2">
          <Label htmlFor="numEpochs">How many epochs to plan?</Label>
          <Input 
            id="numEpochs" 
            type="number" 
            placeholder="e.g., 1" 
            value={numEpochs}
            onChange={(e) => setNumEpochs(parseInt(e.target.value,10) || 1)}
            min="1"
            className="bg-background/50 border-border/70 focus:border-primary"
          />
        </div>
        */}

        <div className="p-4 bg-secondary/30 rounded-xl space-y-4 border border-border/50">
          <h3 className="text-lg font-semibold text-foreground text-center">Epoch 1 Details</h3>
          <div className="space-y-2">
            <Label htmlFor="epochTitle">Title</Label>
            <Input 
              id="epochTitle" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g., Q3 Product Launch" 
              className="bg-background/50 border-border/70 focus:border-primary h-11 px-4" // Consistent input styling
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="epochStartDate">Start Date</Label>
              <Input 
                id="epochStartDate" 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className="bg-background/50 border-border/70 focus:border-primary h-11 px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epochEndDate">End Date</Label>
              <Input 
                id="epochEndDate" 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                className="bg-background/50 border-border/70 focus:border-primary h-11 px-4"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="epochThemeFocus">Theme/Focus (Optional)</Label>
            <Input 
              id="epochThemeFocus" 
              value={themeFocus} 
              onChange={e => setThemeFocus(e.target.value)} 
              placeholder="e.g., Wellness & Productivity" 
              className="bg-background/50 border-border/70 focus:border-primary h-11 px-4"
            />
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        className="fixed-mobile-button mt-10 rounded-full px-8 py-6 text-lg group"  // Consistent button class, size from parent
        disabled={isSubmitting}
        size="lg" // Ensure size is consistent with other onboarding buttons
      >
        {isSubmitting ? 'Saving...' : 'Continue'}
        <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
};

export default EpochSetupSlide;
