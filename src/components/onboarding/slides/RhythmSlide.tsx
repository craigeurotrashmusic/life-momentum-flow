
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { submitRhythm } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { SlideProps } from "./types";

interface RhythmFormData {
  highEnergyStart: string;
  highEnergyEnd: string;
  wakeTime: string;
  sleepTime: string;
}

const RhythmSlide = ({ onNext, isSubmitting, setIsSubmitting }: SlideProps) => {
  const { control, handleSubmit } = useForm<RhythmFormData>();

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i < 10 ? `0${i}` : `${i}`;
    return `${hour}:00`;
  });

  const onSubmit = async (data: RhythmFormData) => {
    setIsSubmitting(true);
    try {
      await submitRhythm(data);
      toast({
        title: "Daily rhythm saved",
        description: "Your daily rhythm has been recorded."
      });
      onNext();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save daily rhythm. Please try again.",
        variant: "destructive"
      });
      console.error("Error submitting daily rhythm:", error);
    } finally {
      setIsSubmitting(false);
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
          When Do You Flow?
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-xl font-medium">High Energy Window</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="high-energy-start">Start Time</Label>
                <Controller
                  name="highEnergyStart"
                  control={control}
                  defaultValue="09:00"
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="high-energy-start">
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map((hour) => (
                          <SelectItem key={`start-${hour}`} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="high-energy-end">End Time</Label>
                <Controller
                  name="highEnergyEnd"
                  control={control}
                  defaultValue="13:00"
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="high-energy-end">
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map((hour) => (
                          <SelectItem key={`end-${hour}`} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-medium">Sleep Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wake-time">Wake Time</Label>
                <Controller
                  name="wakeTime"
                  control={control}
                  defaultValue="06:00"
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="wake-time">
                        <SelectValue placeholder="Select wake time" />
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map((hour) => (
                          <SelectItem key={`wake-${hour}`} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sleep-time">Sleep Time</Label>
                <Controller
                  name="sleepTime"
                  control={control}
                  defaultValue="23:00"
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="sleep-time">
                        <SelectValue placeholder="Select sleep time" />
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map((hour) => (
                          <SelectItem key={`sleep-${hour}`} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
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

export default RhythmSlide;
