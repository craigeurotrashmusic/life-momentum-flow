
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { submitCommunity } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SlideProps } from "./types";

interface CommunityFormData {
  groupChallenges: boolean;
  reminderChannel: "in-app" | "push" | "email";
}

const CommunitySlide = ({ onNext, isSubmitting, setIsSubmitting }: SlideProps) => {
  const { control, handleSubmit } = useForm<CommunityFormData>({
    defaultValues: {
      groupChallenges: true,
      reminderChannel: "in-app",
    },
  });

  const onSubmit = async (data: CommunityFormData) => {
    setIsSubmitting(true);
    try {
      await submitCommunity(data);
      toast({
        title: "Community preferences saved",
        description: "Your community preferences have been recorded.",
      });
      onNext();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save community preferences. Please try again.",
        variant: "destructive",
      });
      console.error("Error submitting community preferences:", error);
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
          Join the Journey
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-10">
            <div className="flex items-center justify-between px-4 py-4 glass-card rounded-2xl">
              <div>
                <h2 className="text-xl font-medium">Group Challenges</h2>
                <p className="text-muted-foreground">
                  Participate in community challenges and competitions
                </p>
              </div>
              <Controller
                name="groupChallenges"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-medium">Reminder Channel</h2>
              <p className="text-muted-foreground mb-4">
                How would you like to receive reminders and notifications?
              </p>
              
              <Controller
                name="reminderChannel"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange as (value: string) => void}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in-app" id="in-app" />
                      <Label htmlFor="in-app" className="cursor-pointer">In-app notifications</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="push" id="push" />
                      <Label htmlFor="push" className="cursor-pointer">Push notifications</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <Label htmlFor="email" className="cursor-pointer">Email notifications</Label>
                    </div>
                  </RadioGroup>
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

export default CommunitySlide;
