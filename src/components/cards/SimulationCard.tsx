import { useState, lazy, Suspense, useEffect, useCallback } from 'react';
import { ChevronRight, LineChart, Settings, Zap, ArrowRight, ArrowLeft, BarChart3 } from 'lucide-react';
import EmblaOptionsType from 'embla-carousel-react'; // Changed import
import LifeCard from './LifeCard';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import ScenarioForm from '@/components/simulation/ScenarioForm';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from '@/components/ui/badge';
import { 
  createSimulation, 
  listRecentSimulations, 
  subscribeSimulations, 
  unsubscribeSimulations,
  Simulation,
  ScenarioType 
} from '@/lib/api/simulation';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth'; // Ensure this path is correct and useAuth is exported
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';

// Lazy load heavy components (DriftCorrection might be less relevant if not directly tied to simulation output display)
// const DriftCorrection = lazy(() => import('@/components/simulation/DriftCorrection'));

interface Scenario {
  id: string;
  type: ScenarioType;
  name: string;
  description: string;
  icon: React.ReactNode;
  // parameters specific to this scenario type could be defined here for the form
}

const SimulationCard = () => {
  const { user } = useAuth(); // Get authenticated user
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [activeStep, setActiveStep] = useState(0); // 0: Form, 1: Results, 2: Actions (optional)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSimulation, setCurrentSimulation] = useState<Simulation | null>(null);
  const [recentSimulations, setRecentSimulations] = useState<Simulation[]>([]);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  // Scenarios definition
  const scenarios: Scenario[] = [
    {
      id: "sleep-deprivation", type: "sleep", name: "Sleep Deprivation",
      description: "Model impact of consistent under-sleeping.", icon: <LineChart size={18} />,
    },
    {
      id: "budget-overrun", type: "finance", name: "Budget Overrun",
      description: "Assess effects of exceeding monthly budget.", icon: <LineChart size={18} />,
    },
    {
      id: "missed-workouts", type: "workout", name: "Missed Workouts",
      description: "Explore consequences of skipping exercise routines.", icon: <LineChart size={18} />,
    },
    {
      id: "diet-changes", type: "diet", name: "Dietary Shift",
      description: "Analyze nutritional impacts of altering diet.", icon: <LineChart size={18} />,
    }
  ];

  const fetchRecentSimulations = useCallback(async () => {
    if (user?.id) {
      const sims = await listRecentSimulations(user.id, 5);
      setRecentSimulations(sims);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRecentSimulations();
  }, [fetchRecentSimulations]);

  useEffect(() => {
    if (!user?.id) return;

    const simulationSubscription = subscribeSimulations(user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newSim = payload.new as Simulation;
        setRecentSimulations(prev => [newSim, ...prev.slice(0,4)]);
        if (currentSimulation?.id === undefined && newSim.scenario_type === selectedScenario?.type) {
             setCurrentSimulation(newSim);
             setActiveStep(1); 
        }
      }
    });
    return () => {
      unsubscribeSimulations(); 
    };
  }, [user?.id, currentSimulation, selectedScenario]);
  
  useEffect(() => {
    if (!carouselApi) return;
    carouselApi.scrollTo(activeStep, false); 
    const onSelect = () => {
        if (carouselApi) setActiveStep(carouselApi.selectedScrollSnap());
    };
    carouselApi.on("select", onSelect);
    return () => {
        if (carouselApi) carouselApi.off("select", onSelect);
    };
  }, [carouselApi, activeStep]);


  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentSimulation(null); 
    setActiveStep(0); 
    setIsDialogOpen(true);
  };
  
  const handleRunSimulation = async (params: { scenarioType: ScenarioType, parameters: Record<string, any> }) => {
    if (!user?.id || !selectedScenario) return;
    try {
      setIsSubmitting(true);
      const newSim = await createSimulation(user.id, {
        scenario_type: selectedScenario.type,
        parameters: params.parameters,
      });
      if (newSim) {
        setCurrentSimulation(newSim);
        toast({
          title: "Simulation Submitted",
          description: "Your simulation is processing. Results will appear shortly.",
        });
      } else {
         toast({
          title: "Simulation Error",
          description: "Could not start the simulation. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error running simulation:", error);
      toast({ title: "Simulation Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleApplyToClarityHub = () => {
    if (!currentSimulation) return;
    toast({
      title: "Applied to Clarity Hub (Conceptual)",
      description: `Insights from simulation ${currentSimulation.id} applied.`,
    });
  };

  const handleTriggerDriftCorrection = () => {
    if(!currentSimulation) return;
     toast({
      title: "Trigger Drift Correction (Conceptual)",
      description: `Corrective actions based on ${currentSimulation.id} initiated.`,
    });
  }

  const getStepName = (step: number): string => {
    switch (step) {
      case 0: return "Parameters";
      case 1: return "Projected Outputs";
      case 2: return "Actions";
      default: return `Step ${step + 1}`;
    }
  };

  const getChartData = (sim: Simulation | null) => {
    if (!sim) return [];
    const data = [];
    for (let i = 1; i <= 7; i++) {
      data.push({
        day: `Day ${i}`,
        health: (sim.health_delta || 0) * i, 
        wealth: (sim.wealth_delta || 0) * i,
        psychology: (sim.psychology_delta || 0) * i,
      });
    }
    return data;
  };
  
  const carouselOptions: EmblaOptionsType = { // Use EmblaOptionsType
    align: "start",
  };

  return (
    <LifeCard 
      title="Dynamic Simulation Sandbox" 
      icon={<Settings />}
      color="bg-gradient-to-br from-teal-900/30 to-cyan-900/30" // New color
      expandable={true}
    >
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-3">Run a New Scenario</h3>
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
                  <p className="text-sm text-muted-foreground line-clamp-2">{scenario.description}</p>
                </div>
              </div>
              <ChevronRight size={16} />
            </div>
          ))}
        </div>
        
        {recentSimulations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Recent Simulations</h3>
            <div className="space-y-2">
              {recentSimulations.map(sim => (
                <div key={sim.id} className="p-3 bg-secondary/10 rounded-lg text-sm">
                  <span className="font-medium">{sim.scenario_type}</span> - Deltas: H({sim.health_delta?.toFixed(1)}), W({sim.wealth_delta?.toFixed(1)}), P({sim.psychology_delta?.toFixed(1)})
                  <span className="text-xs text-muted-foreground float-right">{new Date(sim.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSelectedScenario(null);
          setCurrentSimulation(null);
        }
      }}>
        <DialogContent className="sm:max-w-[90%] md:max-w-[70%] lg:max-w-[60%] max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
          <DialogHeader className="flex flex-row items-center justify-between p-6 border-b">
            <DialogTitle className="text-xl font-semibold">
              {selectedScenario ? selectedScenario.name : 'Simulation Engine'}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {[0, 1, 2].map((stepIndex) => (
                <Badge 
                  key={stepIndex} 
                  variant={activeStep === stepIndex ? "default" : "outline"}
                  className={`px-3 py-1 cursor-pointer ${activeStep === stepIndex ? '' : 'opacity-60'}
                              ${stepIndex > 0 && !currentSimulation ? 'pointer-events-none opacity-30' : ''}`}
                  onClick={() => {
                    if (carouselApi && (stepIndex === 0 || currentSimulation)) {
                      setActiveStep(stepIndex);
                      carouselApi.scrollTo(stepIndex);
                    }
                  }}
                >
                  {getStepName(stepIndex)}
                </Badge>
              ))}
            </div>
          </DialogHeader>
          
          <div className="p-6">
            {selectedScenario ? (
              <Carousel setApi={setCarouselApi} className="w-full" opts={carouselOptions}>
                <CarouselContent>
                  <CarouselItem className="min-h-[400px]">
                    <h3 className="text-lg font-medium mb-1">Simulation Parameters</h3>
                    <p className="text-muted-foreground mb-4 text-sm">{selectedScenario.description}</p>
                    <ScenarioForm 
                      scenarioType={selectedScenario.type}
                      onSubmit={handleRunSimulation}
                      isSubmitting={isSubmitting}
                    />
                  </CarouselItem>
                  
                  <CarouselItem className="min-h-[400px]">
                    <h3 className="text-lg font-medium mb-1">Projected Outputs (7-day)</h3>
                    {!currentSimulation ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                        {isSubmitting ? (
                          <>
                            <p className="text-muted-foreground mb-2">Simulation in progress...</p>
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                          </>
                        ) : (
                           <p className="text-muted-foreground">Run simulation to see projected outputs.</p>
                        )}
                      </div>
                    ) : (
                      <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
                        <div className="h-[300px] w-full mt-4">
                           <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getChartData(currentSimulation)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="day" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Bar dataKey="health" fill="#82ca9d" name="Health Delta" />
                              <Bar dataKey="wealth" fill="#8884d8" name="Wealth Delta" />
                              <Bar dataKey="psychology" fill="#ffc658" name="Psychology Delta" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 p-2 bg-muted rounded-md text-sm">
                            <p><strong>Health Delta:</strong> {currentSimulation.health_delta?.toFixed(2)}</p>
                            <p><strong>Wealth Delta:</strong> {currentSimulation.wealth_delta?.toFixed(2)}</p>
                            <p><strong>Psychology Delta:</strong> {currentSimulation.psychology_delta?.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Created: {new Date(currentSimulation.created_at).toLocaleString()}</p>
                        </div>
                      </Suspense>
                    )}
                  </CarouselItem>
                  
                  <CarouselItem className="min-h-[400px]">
                    <h3 className="text-lg font-medium mb-1">Take Action</h3>
                    {!currentSimulation ? (
                      <div className="p-8 text-center h-full flex items-center justify-center">
                        <p className="text-muted-foreground">Run simulation to enable actions.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 mt-4">
                        <Button onClick={handleApplyToClarityHub} className="w-full" variant="default">
                          <Zap size={16} className="mr-2"/> Apply to Clarity Hub
                        </Button>
                        <Button onClick={handleTriggerDriftCorrection} className="w-full" variant="outline">
                          <BarChart3 size={16} className="mr-2"/> Trigger Drift Correction
                        </Button>
                      </div>
                    )}
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
            ) : (
              <div className="text-center p-8">
                <p>Select a scenario to run a simulation</p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center p-6 border-t sticky bottom-0 bg-background/80 backdrop-blur-sm rounded-b-2xl">
              <Button
                variant="outline"
                size="sm"
                onClick={() => carouselApi?.scrollPrev()}
                disabled={!carouselApi?.canScrollPrev() || activeStep === 0}
              > <ArrowLeft size={16} className="mr-1" /> Back </Button>
              
              <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)}> Close </Button>
              
              <Button
                size="sm"
                onClick={() => {
                  if (activeStep === 0 && !isSubmitting) { 
                     toast({ title: "Info", description: "Please fill the form and click 'Run Simulation' button inside the form."});
                  } else if (activeStep < 2 && currentSimulation) {
                    carouselApi?.scrollNext();
                  } else if (activeStep === 2) {
                    handleApplyToClarityHub(); 
                  }
                }}
                disabled={ (activeStep === 0 && isSubmitting) || (activeStep > 0 && !currentSimulation) || (!carouselApi?.canScrollNext() && activeStep !==2)}
              > {activeStep === 2 ? "Apply All" : "Next"} <ArrowRight size={16} className="ml-1" /> </Button>
            </div>
        </DialogContent>
      </Dialog>
    </LifeCard>
  );
};

export default SimulationCard;
