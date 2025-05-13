
import { useState, lazy, Suspense } from 'react';
import { ChevronRight, LineChart, Settings, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import LifeCard from './LifeCard';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ScenarioForm from '@/components/simulation/ScenarioForm';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from '@/components/ui/badge';
import { ScenarioType, SimulationParams, createSimulation, getSimulation } from '@/lib/api';
import { useSimulationSocket } from '@/hooks/use-simulation-socket';
import { toast } from '@/hooks/use-toast';

// Lazy load heavy components
const SimulationResults = lazy(() => 
  import('@/components/simulation/SimulationResults')
);
const DriftCorrection = lazy(() => 
  import('@/components/simulation/DriftCorrection')
);

interface Scenario {
  id: string;
  type: ScenarioType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const SimulationCard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulationId, setSimulationId] = useState<string | undefined>(undefined);
  
  const { isConnected, simulationResult } = useSimulationSocket(simulationId);

  // Enhanced scenarios with improved descriptions
  const scenarios: Scenario[] = [
    {
      id: "sleep-deprivation",
      type: "sleep",
      name: "Sleep Deprivation",
      description: "What if you consistently get less sleep than recommended? Analyze the cascading effects on your health, productivity, and emotional wellbeing.",
      icon: <LineChart size={18} />,
    },
    {
      id: "overspending",
      type: "finance",
      name: "Budget Overrun",
      description: "What if you exceed your monthly budget? See how your financial goals shift and identify potential impact on other life areas.",
      icon: <LineChart size={18} />,
    },
    {
      id: "skip-workout",
      type: "workout",
      name: "Missed Workouts",
      description: "What if you miss a significant portion of your scheduled workouts? Explore how this affects your fitness trajectory and mental state.",
      icon: <LineChart size={18} />,
    },
    {
      id: "diet-change",
      type: "diet",
      name: "Diet Changes",
      description: "What if you alter key aspects of your diet? Analyze nutritional impacts and how they ripple through your energy levels and goals.",
      icon: <LineChart size={18} />,
    }
  ];
  
  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setIsDialogOpen(true);
    setActiveStep(0);
    setSimulationId(undefined);
  };
  
  const handleRunSimulation = async (params: SimulationParams) => {
    try {
      setIsSubmitting(true);
      const id = await createSimulation(params);
      setSimulationId(id);
      setActiveStep(1);
      toast({
        title: "Simulation Started",
        description: "Your simulation is running. Results will be available shortly.",
      });
    } catch (error) {
      console.error("Error running simulation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleApplyToClarityHub = () => {
    toast({
      title: "Applied to Clarity Hub",
      description: "Simulation insights have been applied to your Clarity Hub.",
    });
    setIsDialogOpen(false);
  };
  
  const getStepName = (step: number): string => {
    switch (step) {
      case 0: return "Parameters";
      case 1: return "Results";
      case 2: return "Corrections";
      default: return `Step ${step + 1}`;
    }
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
                  <p className="text-sm text-muted-foreground line-clamp-2">{scenario.description}</p>
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
      
      {/* Simulation Dialog with horizontal carousel for steps */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSimulationId(undefined);
        }
      }}>
        <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {selectedScenario ? selectedScenario.name : 'Simulation Engine'}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {[0, 1, 2].map((step) => (
                <Badge 
                  key={step} 
                  variant={activeStep === step ? "default" : "outline"}
                  className={`
                    px-3 py-1 cursor-pointer
                    ${activeStep === step ? '' : 'opacity-50'}
                    ${step > 0 && !simulationResult ? 'pointer-events-none opacity-30' : ''}
                  `}
                  onClick={() => {
                    if (step === 0 || simulationResult) {
                      setActiveStep(step);
                    }
                  }}
                >
                  {getStepName(step)}
                </Badge>
              ))}
            </div>
          </DialogHeader>
          
          <div className="py-4">
            {selectedScenario ? (
              <div className="relative">
                <Carousel 
                  className="w-full"
                  opts={{ 
                    loop: false, 
                    align: "start",
                    containScroll: "trimSnaps" 
                  }}
                  setApi={(api) => {
                    // Manually control the carousel based on activeStep
                    if (api) {
                      api.scrollTo(activeStep);
                    }
                  }}
                >
                  <CarouselContent>
                    {/* Step 1: Parameters */}
                    <CarouselItem className="pt-2 md:basis-full lg:basis-full">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Simulation Parameters</h3>
                        <p className="text-muted-foreground mb-6">{selectedScenario.description}</p>
                        
                        <ScenarioForm 
                          scenarioType={selectedScenario.type}
                          onSubmit={handleRunSimulation}
                          isSubmitting={isSubmitting}
                        />
                      </div>
                    </CarouselItem>
                    
                    {/* Step 2: Results */}
                    <CarouselItem className="pt-2 md:basis-full lg:basis-full">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Simulation Results</h3>
                        {!simulationResult ? (
                          isConnected ? (
                            <div className="p-8 text-center">
                              <p className="text-muted-foreground mb-2">Simulation in progress...</p>
                              <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-8 text-center">
                              <p className="text-muted-foreground">Run a simulation to see results</p>
                            </div>
                          )
                        ) : (
                          <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
                            <SimulationResults result={simulationResult} />
                          </Suspense>
                        )}
                      </div>
                    </CarouselItem>
                    
                    {/* Step 3: Drift Correction */}
                    <CarouselItem className="pt-2 md:basis-full lg:basis-full">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Drift Correction</h3>
                        {!simulationResult ? (
                          <div className="p-8 text-center">
                            <p className="text-muted-foreground">Complete simulation to see correction options</p>
                          </div>
                        ) : (
                          <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
                            <DriftCorrection result={simulationResult} />
                          </Suspense>
                        )}
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
                
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    className="flex items-center gap-1"
                  >
                    <ArrowLeft size={16} /> Back
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Close
                  </Button>
                  
                  <Button
                    variant={activeStep === 2 ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (activeStep < 2) {
                        if (activeStep === 0) {
                          // User clicked Next on first step, prompt to run simulation
                          toast({
                            title: "Run Simulation",
                            description: "Please fill the form and run the simulation first.",
                          });
                        } else {
                          setActiveStep(activeStep + 1);
                        }
                      } else {
                        // Last step, apply to clarity hub
                        handleApplyToClarityHub();
                      }
                    }}
                    disabled={activeStep === 1 && !simulationResult}
                    className="flex items-center gap-1"
                  >
                    {activeStep === 2 ? "Apply to Clarity Hub" : "Next"} <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <p>Select a scenario to run a simulation</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </LifeCard>
  );
};

export default SimulationCard;
