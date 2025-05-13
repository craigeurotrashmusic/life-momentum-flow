
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingSlideProps } from './types'; // Assuming this type exists and is appropriate

const EpochSetupSlide: React.FC<OnboardingSlideProps> = ({ onNext, isSubmitting, setIsSubmitting }) => {
  // Placeholder for form state and submission logic
  const handleSubmit = async () => {
    if (setIsSubmitting) setIsSubmitting(true);
    // TODO: Implement actual data submission logic to /api/epochs
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    if (setIsSubmitting) setIsSubmitting(false);
    if (onNext) onNext();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <h1 className="text-3xl font-bold mb-6 text-primary">Plan Your Epochs</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Epochs are focused periods for achieving significant milestones. Let's define them.
      </p>
      
      {/* Placeholder for quiz form elements */}
      <div className="w-full max-w-sm space-y-6">
        <div>
          <Label htmlFor="numEpochs" className="text-left block mb-2">How many epochs would you like to plan?</Label>
          <Input id="numEpochs" type="number" placeholder="e.g., 3" className="text-center" />
        </div>

        {/* TODO: Add dynamic fields for each epoch: Title, Start Date, End Date, Theme/Focus */}
        <div className="p-4 border border-dashed rounded-lg text-muted-foreground">
          <p>Epoch 1 Details (Title, Dates, Focus) - Form will go here</p>
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        className="mt-12 fixed-mobile-button" 
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting ? 'Saving...' : 'Continue to Rhythm'}
      </Button>
    </div>
  );
};

export default EpochSetupSlide;
