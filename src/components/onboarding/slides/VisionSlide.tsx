import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { submitVision } from "@/lib/api/onboardingData";
import { toast } from "@/hooks/use-toast";
import { SlideProps } from "./types";

interface VisionFormData {
  values: [string, string, string];
  goals: [string, string, string];
}

const VisionSlide = ({ onNext, isSubmitting, setIsSubmitting }: SlideProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<VisionFormData>({
    defaultValues: {
      values: ["", "", ""],
      goals: ["", "", ""]
    }
  });

  const onSubmit = async (data: VisionFormData) => {
    if (setIsSubmitting) setIsSubmitting(true);
    try {
      await submitVision(data);
      toast({
        title: "Vision saved (Mock)",
        description: "Your vision has been recorded."
      });
      if (onNext) onNext();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save vision. Please try again.",
        variant: "destructive"
      });
      console.error("Error submitting vision:", error);
    } finally {
      if (setIsSubmitting) setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center h-full px-6 py-10 md:px-20"
    >
      <div className="max-w-3xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-gradient text-center">
          Your North Star
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={`value-${index}`} className="space-y-2">
                  <Label htmlFor={`value-${index}`}>Value {index + 1}</Label>
                  <Input
                    id={`value-${index}`}
                    placeholder={`Enter core value ${index + 1}`}
                    {...register(index === 0 ? "values.0" : index === 1 ? "values.1" : "values.2")}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-medium">5-Year Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={`goal-${index}`} className="space-y-2">
                  <Label htmlFor={`goal-${index}`}>Goal {index + 1}</Label>
                  <Input
                    id={`goal-${index}`}
                    placeholder={`Enter 5-year goal ${index + 1}`}
                    {...register(index === 0 ? "goals.0" : index === 1 ? "goals.1" : "goals.2")}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button 
              type="submit" 
              size="lg" 
              className="rounded-full px-8 py-6 text-lg group"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Next"}
              <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default VisionSlide;
