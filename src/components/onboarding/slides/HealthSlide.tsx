
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { submitHealth } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { SlideProps } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface HealthFormData {
  supplements: string[];
  sleepHours: number;
  exerciseFrequency: string;
}

const supplements = [
  { id: "vitamin-d", label: "Vitamin D" },
  { id: "vitamin-c", label: "Vitamin C" },
  { id: "magnesium", label: "Magnesium" },
  { id: "omega-3", label: "Omega-3" },
  { id: "zinc", label: "Zinc" },
  { id: "probiotics", label: "Probiotics" },
  { id: "ashwagandha", label: "Ashwagandha" },
  { id: "melatonin", label: "Melatonin" },
];

const exerciseOptions = [
  { value: "daily", label: "Daily" },
  { value: "4-6-times-week", label: "4-6 times per week" },
  { value: "2-3-times-week", label: "2-3 times per week" },
  { value: "once-week", label: "Once per week" },
  { value: "rarely", label: "Rarely" },
];

const HealthSlide = ({ onNext, isSubmitting, setIsSubmitting }: SlideProps) => {
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);
  const { control, handleSubmit, register } = useForm<HealthFormData>({
    defaultValues: {
      supplements: [],
      sleepHours: 7,
      exerciseFrequency: "2-3-times-week",
    },
  });

  const onSubmit = async (data: HealthFormData) => {
    data.supplements = selectedSupplements;
    setIsSubmitting(true);
    try {
      await submitHealth(data);
      toast({
        title: "Health profile saved",
        description: "Your health profile has been recorded.",
      });
      onNext();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save health profile. Please try again.",
        variant: "destructive",
      });
      console.error("Error submitting health profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSupplement = (id: string) => {
    setSelectedSupplements((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center h-full px-6 py-10 md:px-20 pb-24"
    >
      <div className="max-w-3xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-gradient text-center">
          Personalize Your MPOS
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Supplements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {supplements.map((supplement) => (
                <div key={supplement.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={supplement.id}
                    checked={selectedSupplements.includes(supplement.id)}
                    onCheckedChange={() => toggleSupplement(supplement.id)}
                  />
                  <Label htmlFor={supplement.id} className="cursor-pointer text-sm md:text-base">{supplement.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-medium">Sleep & Exercise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              <div className="space-y-2">
                <Label htmlFor="sleep-hours">Average Sleep Hours</Label>
                <Controller
                  name="sleepHours"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="sleep-hours"
                      type="number"
                      min={4}
                      max={12}
                      step={0.5}
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      className="w-full py-3 px-4 text-base rounded-lg h-12"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exercise-frequency">Exercise Frequency</Label>
                <Controller
                  name="exerciseFrequency"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="exercise-frequency" className="w-full py-3 px-4 text-base rounded-lg h-12">
                        <SelectValue placeholder="How often do you exercise?" />
                      </SelectTrigger>
                      <SelectContent>
                        {exerciseOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
              className="rounded-full px-8 py-6 text-lg group fixed-mobile-button"
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

export default HealthSlide;
