
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { submitWealth } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { SlideProps } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WealthFormData {
  primaryGoal: string;
  riskTolerance: number;
  monthlyBudget: number;
}

const financialGoals = [
  { value: "emergency-fund", label: "Build Emergency Fund" },
  { value: "debt-freedom", label: "Pay Off Debt" },
  { value: "home-purchase", label: "Save for Home Purchase" },
  { value: "retirement", label: "Retirement Planning" },
  { value: "wealth-building", label: "General Wealth Building" },
  { value: "education", label: "Education Funding" },
];

const WealthSlide = ({ onNext, isSubmitting, setIsSubmitting }: SlideProps) => {
  const { control, handleSubmit } = useForm<WealthFormData>({
    defaultValues: {
      primaryGoal: "wealth-building",
      riskTolerance: 5,
      monthlyBudget: 1000,
    },
  });

  const onSubmit = async (data: WealthFormData) => {
    setIsSubmitting(true);
    try {
      await submitWealth(data);
      toast({
        title: "Financial profile saved",
        description: "Your financial profile has been recorded.",
      });
      onNext();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save financial profile. Please try again.",
        variant: "destructive",
      });
      console.error("Error submitting financial profile:", error);
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
          Wealth in Motion
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Primary Financial Goal</h2>
            <div className="space-y-2">
              <Controller
                name="primaryGoal"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {financialGoals.map((goal) => (
                        <SelectItem key={goal.value} value={goal.value}>
                          {goal.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-medium mb-2">Risk Tolerance</h2>
              <p className="text-muted-foreground text-sm mb-4">
                How comfortable are you with financial risk?
              </p>
              <Controller
                name="riskTolerance"
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
                      <span>Conservative</span>
                      <span>Balanced</span>
                      <span>Aggressive</span>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-medium">Monthly Budget</h2>
            <div className="space-y-2">
              <Label htmlFor="monthly-budget">How much do you spend monthly?</Label>
              <Controller
                name="monthlyBudget"
                control={control}
                render={({ field }) => (
                  <Input
                    id="monthly-budget"
                    type="number"
                    min={0}
                    step={100}
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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

export default WealthSlide;
