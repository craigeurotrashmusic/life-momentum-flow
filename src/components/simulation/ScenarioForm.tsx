
import React from 'react';
import { ScenarioType } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ScenarioFormProps {
  scenarioType: ScenarioType;
  onSubmit: (values: any) => void;
  isSubmitting: boolean;
}

const sleepSchema = z.object({
  hoursOfSleep: z.number().min(3).max(12),
  daysPerWeek: z.number().min(1).max(7),
});

const financeSchema = z.object({
  budgetExceedPercent: z.number().min(5).max(50),
  durationInMonths: z.number().min(1).max(12),
});

const workoutSchema = z.object({
  missedPercentage: z.number().min(10).max(100),
  workoutType: z.enum(['cardio', 'strength', 'hybrid']),
});

const dietSchema = z.object({
  mealType: z.enum(['skip-breakfast', 'fast-food', 'processed']),
  frequencyPerWeek: z.number().min(1).max(7),
});

export const ScenarioForm = ({ scenarioType, onSubmit, isSubmitting }: ScenarioFormProps) => {
  let schema;
  let defaultValues: any = {};
  
  switch (scenarioType) {
    case 'sleep':
      schema = sleepSchema;
      defaultValues = { hoursOfSleep: 5, daysPerWeek: 5 };
      break;
    case 'finance':
      schema = financeSchema;
      defaultValues = { budgetExceedPercent: 20, durationInMonths: 3 };
      break;
    case 'workout':
      schema = workoutSchema;
      defaultValues = { missedPercentage: 50, workoutType: 'cardio' };
      break;
    case 'diet':
      schema = dietSchema;
      defaultValues = { mealType: 'skip-breakfast', frequencyPerWeek: 3 };
      break;
  }

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = (values: any) => {
    onSubmit({ scenarioType, parameters: values });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {scenarioType === 'sleep' && (
          <>
            <FormField
              control={form.control}
              name="hoursOfSleep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours of Sleep Per Night</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{field.value} hours</span>
                      </div>
                      <Slider 
                        value={[field.value]}
                        min={3}
                        max={12}
                        step={0.5}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>3h</span>
                        <span>12h</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    What if you consistently sleep this amount each night?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="daysPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days Per Week</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{field.value} days</span>
                      </div>
                      <Slider 
                        value={[field.value]}
                        min={1}
                        max={7}
                        step={1}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 day</span>
                        <span>7 days</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    How many days per week would you follow this sleep pattern?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {scenarioType === 'finance' && (
          <>
            <FormField
              control={form.control}
              name="budgetExceedPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Exceed Percentage</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{field.value}% over budget</span>
                      </div>
                      <Slider 
                        value={[field.value]}
                        min={5}
                        max={50}
                        step={5}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5%</span>
                        <span>50%</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    What if you exceed your budget by this percentage?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="durationInMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (Months)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{field.value} months</span>
                      </div>
                      <Slider 
                        value={[field.value]}
                        min={1}
                        max={12}
                        step={1}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 month</span>
                        <span>12 months</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    How long would this overspending pattern continue?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {scenarioType === 'workout' && (
          <>
            <FormField
              control={form.control}
              name="missedPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Missed Workout Percentage</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Miss {field.value}% of workouts</span>
                      </div>
                      <Slider 
                        value={[field.value]}
                        min={10}
                        max={100}
                        step={10}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>10%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    What if you miss this percentage of your scheduled workouts?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="workoutType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Workout Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cardio" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Cardio
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="strength" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Strength
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="hybrid" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Hybrid
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Running Simulation..." : "Run Simulation"}
        </Button>
      </form>
    </Form>
  );
};

export default ScenarioForm;
