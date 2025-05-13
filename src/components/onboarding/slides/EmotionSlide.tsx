
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { submitEmotion } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { SlideProps } from "./types";

interface EmotionFormData {
  moodScore: number;
  stressors: string;
}

const EmotionSlide = ({ onNext, isSubmitting, setIsSubmitting }: SlideProps) => {
  const { control, handleSubmit } = useForm<EmotionFormData>({
    defaultValues: {
      moodScore: 7,
      stressors: "",
    },
  });

  const onSubmit = async (data: EmotionFormData) => {
    setIsSubmitting(true);
    try {
      await submitEmotion(data);
      toast({
        title: "Emotional baseline saved",
        description: "Your emotional baseline has been recorded.",
      });
      onNext();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save emotional baseline. Please try again.",
        variant: "destructive",
      });
      console.error("Error submitting emotional baseline:", error);
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
          How Are You Feeling?
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-medium mb-2">Current Mood</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Rate your current emotional state
              </p>
              <Controller
                name="moodScore"
                control={control}
                render={({ field }) => (
                  <div className="space-y-4">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Stressed</span>
                      <span>Neutral</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="stressors">
                What's causing you stress or anxiety right now?
              </Label>
              <Controller
                name="stressors"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="stressors"
                    placeholder="Share your current challenges..."
                    className="min-h-[100px]"
                    {...field}
                  />
                )}
              />
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

export default EmotionSlide;
