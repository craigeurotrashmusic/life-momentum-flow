import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ScenarioType } from '@/lib/api/simulation'; // Corrected import path for ScenarioType
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const sleepSchema = z.object({
  hoursSlept: z.number().min(0).max(12),
  sleepQuality: z.number().min(1).max(5),
});

const financeSchema = z.object({
  unexpectedExpense: z.number().min(0),
  investmentChange: z.number(), 
});

const workoutSchema = z.object({
  daysSkipped: z.number().min(0).max(7),
  intensityDrop: z.number().min(0).max(100), 
});

const dietSchema = z.object({
  calorieSurplus: z.number(), 
  processedFoodIntake: z.number().min(0).max(100),
});

const customSchema = z.object({
  customInput: z.string().min(1, "Custom input cannot be empty"),
});


const scenarioSchemas = {
  sleep: sleepSchema,
  finance: financeSchema,
  workout: workoutSchema,
  diet: dietSchema,
  custom: customSchema,
};

interface ScenarioFormProps {
  scenarioType: ScenarioType;
  onSubmit: (data: { scenarioType: ScenarioType, parameters: Record<string, any> }) => void;
  isSubmitting: boolean;
}

const ScenarioForm: React.FC<ScenarioFormProps> = ({ scenarioType, onSubmit, isSubmitting }) => {
  const currentSchema = scenarioSchemas[scenarioType];
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: scenarioType === 'sleep' ? { hoursSlept: 7, sleepQuality: 3 } :
                   scenarioType === 'finance' ? { unexpectedExpense: 0, investmentChange: 0 } :
                   scenarioType === 'workout' ? { daysSkipped: 0, intensityDrop: 0 } :
                   scenarioType === 'diet' ? { calorieSurplus: 0, processedFoodIntake: 20 } :
                   { customInput: "" }
  });

  const handleFormSubmit = (data: Record<string, any>) => {
    onSubmit({ scenarioType, parameters: data });
  };
  
  React.useEffect(() => {
    Object.entries(errors).forEach(([fieldName, error]) => {
      if (error && error.message) {
        toast({
          title: `Validation Error: ${fieldName}`,
          description: String(error.message),
          variant: "destructive",
        });
      }
    });
  }, [errors]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {scenarioType === 'sleep' && (
        <>
          <div>
            <Label htmlFor="hoursSlept">Hours Slept</Label>
            <Controller
              name="hoursSlept"
              control={control}
              render={({ field }) => <Input id="hoursSlept" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />}
            />
            {errors.hoursSlept && <p className="text-red-500 text-sm">{String(errors.hoursSlept.message)}</p>}
          </div>
          <div>
            <Label htmlFor="sleepQuality">Sleep Quality (1-5)</Label>
            <Controller
              name="sleepQuality"
              control={control}
              render={({ field }) => (
                <Slider
                  id="sleepQuality"
                  min={1} max={5} step={1}
                  defaultValue={[field.value ?? 3]}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              )}
            />
            {errors.sleepQuality && <p className="text-red-500 text-sm">{String(errors.sleepQuality.message)}</p>}
          </div>
        </>
      )}

      {scenarioType === 'finance' && (
        <>
          <div>
            <Label htmlFor="unexpectedExpense">Unexpected Expense ($)</Label>
            <Controller
              name="unexpectedExpense"
              control={control}
              render={({ field }) => <Input id="unexpectedExpense" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />}
            />
             {errors.unexpectedExpense && <p className="text-red-500 text-sm">{String(errors.unexpectedExpense.message)}</p>}
          </div>
          <div>
            <Label htmlFor="investmentChange">Investment Change (%)</Label>
            <Controller
              name="investmentChange"
              control={control}
              render={({ field }) => <Input id="investmentChange" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />}
            />
             {errors.investmentChange && <p className="text-red-500 text-sm">{String(errors.investmentChange.message)}</p>}
          </div>
        </>
      )}
      
      {scenarioType === 'workout' && (
        <>
          <div>
            <Label htmlFor="daysSkipped">Days Skipped (0-7)</Label>
            <Controller
              name="daysSkipped"
              control={control}
              render={({ field }) => <Input id="daysSkipped" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10))} />}
            />
            {errors.daysSkipped && <p className="text-red-500 text-sm">{String(errors.daysSkipped.message)}</p>}
          </div>
          <div>
            <Label htmlFor="intensityDrop">Intensity Drop (%)</Label>
            <Controller
              name="intensityDrop"
              control={control}
              render={({ field }) => (
                 <Slider
                  id="intensityDrop"
                  min={0} max={100} step={5}
                  defaultValue={[field.value ?? 0]}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              )}
            />
            {errors.intensityDrop && <p className="text-red-500 text-sm">{String(errors.intensityDrop.message)}</p>}
          </div>
        </>
      )}

      {scenarioType === 'diet' && (
         <>
          <div>
            <Label htmlFor="calorieSurplus">Calorie Surplus/Deficit</Label>
            <Controller
              name="calorieSurplus"
              control={control}
              render={({ field }) => <Input id="calorieSurplus" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10))} />}
            />
             {errors.calorieSurplus && <p className="text-red-500 text-sm">{String(errors.calorieSurplus.message)}</p>}
          </div>
          <div>
            <Label htmlFor="processedFoodIntake">Processed Food Intake (%)</Label>
            <Controller
              name="processedFoodIntake"
              control={control}
              render={({ field }) => (
                <Slider
                  id="processedFoodIntake"
                  min={0} max={100} step={5}
                  defaultValue={[field.value ?? 20]}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              )}
            />
            {errors.processedFoodIntake && <p className="text-red-500 text-sm">{String(errors.processedFoodIntake.message)}</p>}
          </div>
        </>
      )}
      
      {scenarioType === 'custom' && (
        <div>
          <Label htmlFor="customInput">Custom Parameters (JSON or Text)</Label>
          <Controller
            name="customInput"
            control={control}
            render={({ field }) => (
              <Textarea
                id="customInput"
                placeholder='e.g., {"stressEvent": "deadline approaching", "copingMechanism": "meditation"}'
                className="min-h-[100px]"
                {...field}
              />
            )}
          />
          {errors.customInput && <p className="text-red-500 text-sm">{String(errors.customInput.message)}</p>}
        </div>
      )}


      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Running...' : 'Run Simulation'}
      </Button>
    </form>
  );
};

export default ScenarioForm;
