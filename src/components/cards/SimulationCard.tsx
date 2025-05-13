
import { useState } from 'react';
import { ChevronRight, LineChart, Settings, Zap } from 'lucide-react';
import LifeCard from './LifeCard';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Legend 
} from 'recharts';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

type ScenarioType = "sleep" | "finance" | "workout" | "diet";

interface Scenario {
  id: string;
  type: ScenarioType;
  name: string;
  description: string;
  icon: React.ReactNode;
  projectedImpacts: {
    health: number;
    wealth: number;
    psychology: number;
  };
}

interface SimulationData {
  name: string;
  health: number;
  wealth: number;
  psychology: number;
}

const SimulationCard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  
  // Mock scenarios
  const scenarios: Scenario[] = [
    {
      id: "sleep-deprivation",
      type: "sleep",
      name: "Sleep Deprivation",
      description: "What if you consistently get only 5 hours of sleep?",
      icon: <LineChart size={18} />,
      projectedImpacts: {
        health: -15,
        wealth: -8,
        psychology: -12
      }
    },
    {
      id: "overspending",
      type: "finance",
      name: "Overspending",
      description: "What if you exceed your budget by 20% every month?",
      icon: <LineChart size={18} />,
      projectedImpacts: {
        health: -5,
        wealth: -25,
        psychology: -10
      }
    },
    {
      id: "skip-workout",
      type: "workout",
      name: "Skipped Workouts",
      description: "What if you miss 50% of your scheduled workouts?",
      icon: <LineChart size={18} />,
      projectedImpacts: {
        health: -20,
        wealth: -3,
        psychology: -15
      }
    }
  ];
  
  // Mock simulation data (time-series data)
  const generateSimulationData = (scenario: Scenario): SimulationData[] => {
    const data: SimulationData[] = [];
    const baseHealth = 80;
    const baseWealth = 75;
    const basePsychology = 85;
    
    // Generate 12 weeks of data
    for (let i = 0; i < 12; i++) {
      const weekMultiplier = i / 12; // Effect increases over time
      data.push({
        name: `Week ${i + 1}`,
        health: Math.max(0, Math.min(100, baseHealth + scenario.projectedImpacts.health * weekMultiplier)),
        wealth: Math.max(0, Math.min(100, baseWealth + scenario.projectedImpacts.wealth * weekMultiplier)),
        psychology: Math.max(0, Math.min(100, basePsychology + scenario.projectedImpacts.psychology * weekMultiplier))
      });
    }
    
    return data;
  };
  
  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setIsDialogOpen(true);
  };
  
  return (
    <LifeCard 
      title="Simulation Engine" 
      icon={<Settings />}
      color="bg-gradient-to-br from-amber-900/30 to-yellow-900/30"
      expandable={true}
    >
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-3">What-if Scenarios</h3>
        <div className="space-y-3">
          {scenarios.map((scenario) => (
            <div 
              key={scenario.id} 
              className="p-4 bg-secondary/20 rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer flex justify-between items-center"
              onClick={() => handleScenarioSelect(scenario)}
            >
              <div className="flex items-center">
                <div className="mr-3 p-2 rounded-full bg-primary/20">
                  {scenario.icon}
                </div>
                <div>
                  <h4 className="font-medium">{scenario.name}</h4>
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                </div>
              </div>
              <ChevronRight size={16} />
            </div>
          ))}
        </div>
        
        <Button 
          className="w-full py-3 mt-4 rounded-xl flex items-center justify-center gap-2"
          variant="outline"
          onClick={() => setIsDialogOpen(true)}
        >
          <Zap size={16} />
          <span>Create Custom Simulation</span>
        </Button>
      </div>
      
      {/* Simulation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[90%] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedScenario ? selectedScenario.name : 'Simulation Engine'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {selectedScenario ? (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Projected Impact</h3>
                  <p className="text-muted-foreground mb-4">{selectedScenario.description}</p>
                  
                  <div className="h-[300px] mb-8">
                    <ChartContainer
                      className="h-full"
                      config={{
                        health: { color: "#f87171" },
                        wealth: { color: "#60a5fa" },
                        psychology: { color: "#a78bfa" },
                      }}
                    >
                      <RechartsLineChart
                        data={generateSimulationData(selectedScenario)}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="health" 
                          name="Health Impact" 
                          stroke="#f87171" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="wealth" 
                          name="Wealth Impact" 
                          stroke="#60a5fa"
                          strokeWidth={2} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="psychology" 
                          name="Psychology Impact" 
                          stroke="#a78bfa"
                          strokeWidth={2} 
                        />
                      </RechartsLineChart>
                    </ChartContainer>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mb-3">Cascade Effects</h3>
                <Carousel className="w-full mb-6">
                  <CarouselContent>
                    <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-4 bg-secondary/30 rounded-xl h-full">
                        <h4 className="font-medium mb-1">Health Impact</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {selectedScenario.projectedImpacts.health < 0 
                            ? `${Math.abs(selectedScenario.projectedImpacts.health)}% decrease in overall health metrics over time.` 
                            : `${selectedScenario.projectedImpacts.health}% increase in overall health metrics over time.`}
                        </p>
                        <p className="text-sm">Affects: Energy levels, immune function, recovery rate</p>
                      </div>
                    </CarouselItem>
                    <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-4 bg-secondary/30 rounded-xl h-full">
                        <h4 className="font-medium mb-1">Wealth Impact</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {selectedScenario.projectedImpacts.wealth < 0 
                            ? `${Math.abs(selectedScenario.projectedImpacts.wealth)}% decrease in financial growth metrics.` 
                            : `${selectedScenario.projectedImpacts.wealth}% increase in financial growth metrics.`}
                        </p>
                        <p className="text-sm">Affects: Savings rate, investment returns, long-term goals</p>
                      </div>
                    </CarouselItem>
                    <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-4 bg-secondary/30 rounded-xl h-full">
                        <h4 className="font-medium mb-1">Psychology Impact</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {selectedScenario.projectedImpacts.psychology < 0 
                            ? `${Math.abs(selectedScenario.projectedImpacts.psychology)}% decrease in mental wellbeing scores.` 
                            : `${selectedScenario.projectedImpacts.psychology}% increase in mental wellbeing scores.`}
                        </p>
                        <p className="text-sm">Affects: Stress levels, cognitive performance, mood stability</p>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
                
                <h3 className="text-lg font-medium mb-3">Drift Correction Protocols</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-xl">
                    <h4 className="font-medium mb-1">Prevention</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Set up reminders 30 minutes before bedtime</li>
                      <li>Create a calming bedtime routine</li>
                      <li>Track sleep quality with wearables</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-xl">
                    <h4 className="font-medium mb-1">Recovery</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Schedule power naps during low-energy periods</li>
                      <li>Reduce caffeine intake after 2pm</li>
                      <li>Implement weekend recovery sleep sessions</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <p>Select a scenario to run a simulation</p>
              </div>
            )}
            
            <Button 
              className="w-full mt-6"
              variant="default"
              onClick={() => setIsDialogOpen(false)}
            >
              Close Simulation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </LifeCard>
  );
};

export default SimulationCard;
