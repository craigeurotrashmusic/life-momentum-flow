
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SlideProps } from './types';
import { createEpoch, Epoch } from '@/lib/api/epochs'; // Updated import
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';


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
          title: "Epochs Planned!",
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
      toast({ title: "Submission Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      if (setIsSubmitting) setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <h1 className="text-3xl font-bold mb-6 text-primary">Plan Your Epochs</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Epochs are focused periods for achieving significant milestones. Let's define them.
      </p>
      
      <div className="w-full max-w-sm space-y-6">
        <div>
          <Label htmlFor="numEpochs" className="text-left block mb-2">How many epochs would you like to plan?</Label>
          <Input 
            id="numEpochs" 
            type="number" 
            placeholder="e.g., 1" 
            className="text-center" 
            value={numEpochs}
            onChange={(e) => setNumEpochs(parseInt(e.target.value,10) || 1)}
            min="1"
          />
        </div>

        {/* Simplified form for one epoch for now */}
        <div className="p-4 border border-dashed rounded-lg space-y-3">
          <h3 className="text-lg font-semibold">Epoch 1 Details</h3>
          <div>
            <Label htmlFor="epochTitle" className="text-left block mb-1">Title</Label>
            <Input id="epochTitle" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Q3 Product Sprint" />
          </div>
          <div>
            <Label htmlFor="epochStartDate" className="text-left block mb-1">Start Date</Label>
            <Input id="epochStartDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="epochEndDate" className="text-left block mb-1">End Date</Label>
            <Input id="epochEndDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="epochThemeFocus" className="text-left block mb-1">Theme/Focus (Optional)</Label>
            <Input id="epochThemeFocus" value={themeFocus} onChange={e => setThemeFocus(e.target.value)} placeholder="e.g., Market Expansion" />
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        className="mt-12 fixed-mobile-button" 
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting ? 'Saving...' : 'Continue'}
      </Button>
    </div>
  );
};

export default EpochSetupSlide;
