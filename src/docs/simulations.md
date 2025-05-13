
# Momentum OS Simulation Engine

The Simulation Engine allows users to explore "what-if" scenarios related to various life domains and see the projected impact on health, wealth, and psychological metrics.

## Adding New Scenario Types

The simulation engine is designed to be extensible with new scenario types. To add a new scenario type:

1. **Define the Scenario Type**
   
   In `src/lib/api.ts`, add your new scenario type to the `ScenarioType` type:

   ```typescript
   export type ScenarioType = "sleep" | "finance" | "workout" | "diet" | "your_new_type";
   ```

2. **Create the Form Schema**
   
   In `src/components/simulation/ScenarioForm.tsx`, add a new Zod schema for your scenario type:

   ```typescript
   const yourNewTypeSchema = z.object({
     // Define the parameters for your new scenario type
     param1: z.number().min(0).max(100),
     param2: z.string(),
     // Add more parameters as needed
   });
   ```

3. **Add Form UI**
   
   In the same file, add the form UI for your scenario type:

   ```typescript
   {scenarioType === 'your_new_type' && (
     <>
       {/* Add form fields for your new scenario type */}
       <FormField
         control={form.control}
         name="param1"
         render={({ field }) => (
           <FormItem>
             <FormLabel>Parameter 1</FormLabel>
             <FormControl>
               {/* Your input component */}
             </FormControl>
             <FormDescription>
               Description of parameter 1
             </FormDescription>
             <FormMessage />
           </FormItem>
         )}
       />
       {/* Add more form fields as needed */}
     </>
   )}
   ```

4. **Add to Scenario List**
   
   In `src/components/cards/SimulationCard.tsx`, add your new scenario to the `scenarios` array:

   ```typescript
   {
     id: "your-new-scenario",
     type: "your_new_type",
     name: "Your New Scenario",
     description: "Description of your new scenario",
     icon: <YourIcon size={18} />,
   }
   ```

5. **Update Simulation Logic**
   
   Update the simulation logic in your backend or mock implementation to handle the new scenario type.

## Interpreting Simulation Results

Simulation results are presented with three main components:

### 1. Impact Metrics

Each simulation produces impact metrics for three life domains:

- **Health**: Physical wellbeing, energy levels, and bodily systems
- **Wealth**: Financial health, savings, and economic trajectory
- **Psychology**: Mental wellbeing, cognitive performance, and emotional state

The impact is shown both as a percentage change and with a qualitative label:
- **Minimal**: Less than 5% change
- **Moderate**: 5-15% change
- **Significant**: More than 15% change

### 2. Time Series Projections

The charts show how the impact would unfold over time (default: 7 days). This helps users understand:

- The immediate effect of the scenario
- How the effect compounds over time
- Potential recovery patterns or degradation rates

### 3. Cascade Effects

Cascade effects are indirect consequences that span across different domains:

- A sleep issue might first affect health but then cascade into wealth (missed work) and psychology (mood)
- Financial stress might start in the wealth domain but cascade into health and psychology
- Each cascade item describes a specific way the original scenario impacts other systems

## Integration with Clarity Hub

Simulation results can be applied to the Clarity Hub, which will:

1. Update metrics and projections based on simulation insights
2. Trigger appropriate drift correction protocols
3. Adjust recommendations and focus areas based on potential risks identified

For any questions or to request new scenario types, please contact the Momentum OS development team.
