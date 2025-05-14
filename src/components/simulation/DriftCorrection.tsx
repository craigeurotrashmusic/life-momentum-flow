import React from 'react';
import type { SimulationResult } from '@/lib/api/simulation'; // Corrected import path for SimulationResult type
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface DriftCorrectionProps {
  result: SimulationResult; // Using the specific SimulationResult type defined in simulation.ts
}

export const DriftCorrection = ({ result }: DriftCorrectionProps) => {
  const needsHealthCorrection = result.healthDelta < -5;
  const needsWealthCorrection = result.wealthDelta < -5;
  const needsPsychologyCorrection = result.psychologyDelta < -5;
  
  const handleApplyCorrection = (type: "health" | "wealth" | "psychology") => {
    toast({
      title: "Correction Applied",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} drift correction has been queued.`,
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Drift Correction Protocols</h3>
        <p className="text-muted-foreground">
          Based on the simulation results, the following correction protocols are recommended to 
          mitigate potential negative impacts.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-secondary/20 rounded-xl">
          <div className="flex items-center mb-3">
            <div className={`mr-3 p-1.5 rounded-full ${needsHealthCorrection ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
              {needsHealthCorrection ? 
                <AlertCircle className="h-4 w-4 text-red-500" /> : 
                <Check className="h-4 w-4 text-green-500" />
              }
            </div>
            <h4 className="font-medium">Health Protocol</h4>
          </div>
          
          {needsHealthCorrection ? (
            <>
              <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                <li>Schedule power naps (15-20 min) during low-energy periods</li>
                <li>Increase vitamin D and magnesium supplements</li>
                <li>Set strict sleep routine with bedtime reminders</li>
              </ul>
              <Button 
                onClick={() => handleApplyCorrection("health")}
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
              >
                Apply Health Corrections
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No critical health drift detected. Continue monitoring.
            </p>
          )}
        </div>
        
        <div className="p-4 bg-secondary/20 rounded-xl">
          <div className="flex items-center mb-3">
            <div className={`mr-3 p-1.5 rounded-full ${needsWealthCorrection ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
              {needsWealthCorrection ? 
                <AlertCircle className="h-4 w-4 text-red-500" /> : 
                <Check className="h-4 w-4 text-green-500" />
              }
            </div>
            <h4 className="font-medium">Wealth Protocol</h4>
          </div>
          
          {needsWealthCorrection ? (
            <>
              <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                <li>Enable budget alerts for categories exceeding 80%</li>
                <li>Schedule bi-weekly spending reviews</li>
                <li>Activate "cooling period" for purchases over $100</li>
              </ul>
              <Button 
                onClick={() => handleApplyCorrection("wealth")}
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
              >
                Apply Wealth Corrections
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No critical wealth drift detected. Continue monitoring.
            </p>
          )}
        </div>
        
        <div className="p-4 bg-secondary/20 rounded-xl">
          <div className="flex items-center mb-3">
            <div className={`mr-3 p-1.5 rounded-full ${needsPsychologyCorrection ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
              {needsPsychologyCorrection ? 
                <AlertCircle className="h-4 w-4 text-red-500" /> : 
                <Check className="h-4 w-4 text-green-500" />
              }
            </div>
            <h4 className="font-medium">Psychology Protocol</h4>
          </div>
          
          {needsPsychologyCorrection ? (
            <>
              <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                <li>Schedule 10-min mindfulness sessions twice daily</li>
                <li>Enable mood tracking notifications</li>
                <li>Adjust work calendar to include 30-min focus blocks</li>
              </ul>
              <Button 
                onClick={() => handleApplyCorrection("psychology")}
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
              >
                Apply Psychology Corrections
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No critical psychology drift detected. Continue monitoring.
            </p>
          )}
        </div>
      </div>
      
      <div className="flex justify-center mt-6">
        <Button 
          onClick={() => {
            toast({
              title: "Applied to Clarity Hub",
              description: "Simulation insights have been applied to your Clarity Hub.",
            });
          }}
          className="w-full max-w-md"
        >
          Apply All Insights to Clarity Hub
        </Button>
      </div>
    </div>
  );
};

export default DriftCorrection;
