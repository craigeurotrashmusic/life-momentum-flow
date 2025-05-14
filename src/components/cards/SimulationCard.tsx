
import { useState, useEffect, useRef } from 'react';
import { PlayCircle, BarChart3, Brain, DollarSign, HeartPulse, Users, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import LifeCard from './LifeCard';
import { useAuth } from '@/hooks/useAuth';
import { createSimulation, listRecentSimulations, Simulation, ScenarioType } from '@/lib/api/simulation';
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils"; // Import cn

// Local type definitions
interface ScenarioParameter {
  id: string;
  label: string;
  type: 'number' | 'text'; // Add other types if necessary
  defaultValue: string | number;
  min?: number;
  max?: number;
  step?: number;
}

interface DisplayableSimulationResult {
  summary: string;
  health_delta: number;
  wealth_delta: number;
  psychology_delta: number;
  timeline_preview: Array<{ month: number; event: string }>;
  warnings: Array<{ type: string; message: string }>;
}

interface Scenario {
  type: ScenarioType;
  name: string;
  description: string;
  icon: React.ElementType;
  parameters: ScenarioParameter[];
  color: string;
}

const scenarios: Scenario[] = [
  {
    type: 'career_change',
    name: 'Career Pivot',
    description: 'Simulate the impact of switching to a new industry or role.',
    icon: Brain,
    parameters: [
      { id: 'new_industry_stress', label: 'New Industry Stress (1-10)', type: 'number', defaultValue: 6, min: 1, max: 10 },
      { id: 'learning_curve_hours', label: 'Weekly Learning Hours', type: 'number', defaultValue: 10, min: 0, max: 40 },
      { id: 'salary_change_percentage', label: 'Salary Change (%)', type: 'number', defaultValue: -10, min: -100, max: 100 },
    ],
    color: "text-blue-500",
  },
  {
    type: 'investment_strategy',
    name: 'Investment Strategy',
    description: 'Explore outcomes of different financial investment approaches.',
    icon: DollarSign,
    parameters: [
      { id: 'risk_level', label: 'Risk Level (1-10)', type: 'number', defaultValue: 7, min: 1, max: 10 },
      { id: 'investment_amount', label: 'Monthly Investment ($)', type: 'number', defaultValue: 500, min: 0 },
      { id: 'time_horizon_years', label: 'Time Horizon (Years)', type: 'number', defaultValue: 10, min: 1, max: 50 },
    ],
    color: "text-green-500",
  },
  {
    type: 'health_intervention',
    name: 'Health Intervention',
    description: 'Model effects of a new fitness or diet plan.',
    icon: HeartPulse,
    parameters: [
      { id: 'commitment_level', label: 'Commitment (1-10)', type: 'number', defaultValue: 8, min: 1, max: 10 },
      { id: 'diet_change_intensity', label: 'Diet Change Intensity (1-10)', type: 'number', defaultValue: 5, min: 1, max: 10 },
      { id: 'weekly_exercise_hours', label: 'Weekly Exercise Hours', type: 'number', defaultValue: 5, min: 0, max: 20 },
    ],
    color: "text-red-500",
  },
  {
    type: 'relationship_change',
    name: 'Relationship Dynamics',
    description: 'Simulate impacts of major relationship shifts.',
    icon: Users,
    parameters: [
      { id: 'communication_effort', label: 'Communication Effort (1-10)', type: 'number', defaultValue: 7, min: 1, max: 10 },
      { id: 'shared_activities_hours', label: 'Weekly Shared Activities', type: 'number', defaultValue: 8, min: 0, max: 30 },
    ],
    color: "text-purple-500",
  },
];


const SimulationCard = () => {
  const { user } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(scenarios[0]);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [simulationResult, setSimulationResult] = useState<DisplayableSimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSimulations, setRecentSimulations] = useState<Simulation[]>([]);
  
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  const [emblaApi, setEmblaApi] = useState<CarouselApi | undefined>();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
    emblaApi.on("select", () => setCurrentSlide(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  useEffect(() => {
    if (user?.id) {
      listRecentSimulations(user.id, 3).then(setRecentSimulations);
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedScenario) {
      const defaultParams: Record<string, any> = {};
      selectedScenario.parameters.forEach(p => {
        defaultParams[p.id] = p.defaultValue;
      });
      setParameters(defaultParams);
      setSimulationResult(null); // Reset result when scenario changes
    }
  }, [selectedScenario]);

  const handleScenarioChange = (scenarioType: string) => {
    const scenario = scenarios.find(s => s.type === scenarioType as ScenarioType);
    if (scenario) {
      setSelectedScenario(scenario);
    }
  };

  const handleParameterChange = (paramId: string, value: string | number) => {
    setParameters(prev => ({ ...prev, [paramId]: value }));
  };

  const runSimulation = async () => {
    if (!user?.id || !selectedScenario) {
      toast.error("Please select a scenario and ensure you are logged in.");
      return;
    }
    setIsLoading(true);
    setSimulationResult(null);

    // Mocked results for demonstration - these provide UI-specific details
    // The core deltas will also be part of this, to be passed to createSimulation
    const mockResultForDisplay: DisplayableSimulationResult = {
      summary: `Simulating ${selectedScenario.name}... Outcome looks promising.`,
      health_delta: Math.random() * 20 - 10,
      wealth_delta: Math.random() * 20 - 10,
      psychology_delta: Math.random() * 20 - 10,
      timeline_preview: [
        { month: 1, event: "Initial adjustment phase." },
        { month: 3, event: "First signs of impact noted." },
        { month: 6, event: "Significant shift observed." },
      ],
      warnings: Math.random() > 0.7 ? [{ type: "HighRisk", message: "This path has high volatility." }] : [],
    };
    
    // Simulate API delay for the "engine" part
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const storedSimulation = await createSimulation(user.id, {
        scenario_type: selectedScenario.type,
        parameters: parameters,
        health_delta: mockResultForDisplay.health_delta,
        wealth_delta: mockResultForDisplay.wealth_delta,
        psychology_delta: mockResultForDisplay.psychology_delta,
      });

      if (storedSimulation) {
        setSimulationResult({
          ...mockResultForDisplay, // Keep timeline, warnings from mock
          health_delta: storedSimulation.health_delta ?? 0, // Use actual stored deltas
          wealth_delta: storedSimulation.wealth_delta ?? 0,
          psychology_delta: storedSimulation.psychology_delta ?? 0,
          summary: `${selectedScenario.name} simulated successfully and recorded!`, // Update summary
        });
        // Toast for success is handled by createSimulation
        if (user?.id) {
          listRecentSimulations(user.id, 3).then(setRecentSimulations);
        }
      } else {
        // Toast for error is handled by createSimulation
        // Optionally set a local error state or show a generic message in the card
        setSimulationResult({
            summary: "Failed to store simulation results. Please try again.",
            health_delta: 0,
            wealth_delta: 0,
            psychology_delta: 0,
            timeline_preview: [],
            warnings: [{type: "Error", message: "Could not save simulation."}]
        });
      }
    } catch (e: any) {
      toast.error(`Simulation error: ${e.message}`);
      setSimulationResult({ 
        summary: "An error occurred during simulation.", 
        health_delta:0, wealth_delta:0, psychology_delta:0, 
        timeline_preview:[], 
        warnings:[{type: "Critical", message: e.message || "Unknown simulation error"}] 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ImpactDisplay: React.FC<{ label: string; value: number | null }> = ({ label, value }) => {
    if (value === null) return null;
    const color = value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-muted-foreground';
    const sign = value > 0 ? '+' : '';
    return (
      <div className="text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-semibold ${color}`}>{sign}{value.toFixed(1)}</p>
      </div>
    );
  };


  return (
    <LifeCard
      title="Life Simulation"
      icon={<Zap className="text-purple-400"/>}
      color="bg-gradient-to-br from-indigo-900/30 to-purple-900/30" // Example color
      expandable
    >
      <div className="space-y-6 p-2">
        <div>
          <Label htmlFor="scenario-select">Choose a Scenario to Simulate:</Label>
          <Select onValueChange={handleScenarioChange} defaultValue={selectedScenario?.type}>
            <SelectTrigger id="scenario-select" className="w-full mt-1 bg-background/50">
              <SelectValue placeholder={selectedScenario?.name || "Select scenario..."} />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map(scenario => (
                <SelectItem key={scenario.type} value={scenario.type}>
                  <div className="flex items-center">
                    <scenario.icon className={`mr-2 h-5 w-5 ${scenario.color || 'text-primary'}`} />
                    {scenario.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedScenario && <p className="text-xs text-muted-foreground mt-1 px-1">{selectedScenario.description}</p>}
        </div>

        {selectedScenario && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Adjust Parameters for {selectedScenario.name}:</h4>
            {selectedScenario.parameters.map(param => (
              <div key={param.id} className="space-y-1">
                <Label htmlFor={param.id} className="text-xs">{param.label}: <span className="font-bold text-primary">{parameters[param.id]}</span></Label>
                <Input
                  id={param.id}
                  type={param.type}
                  value={parameters[param.id] || ''}
                  onChange={e => handleParameterChange(param.id, param.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                  placeholder={String(param.defaultValue)}
                  className="bg-background/50 h-9"
                />
                 {param.type === 'number' && (
                    <Input
                        id={`${param.id}-range`}
                        type="range"
                        min={param.min ?? (Number(param.defaultValue) > 10 ? 0 : 1)} 
                        max={param.max ?? (Number(param.defaultValue) > 10 ? Number(param.defaultValue) * 2 : 10)} 
                        step={param.step ?? 1}
                        value={parameters[param.id] || param.defaultValue}
                        onChange={e => handleParameterChange(param.id, parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary mt-1"
                    />
                )}
              </div>
            ))}
          </div>
        )}

        <Button onClick={runSimulation} disabled={isLoading || !selectedScenario} className="w-full py-3 text-base bg-purple-600 hover:bg-purple-700">
          <PlayCircle className="mr-2 h-5 w-5" />
          {isLoading ? 'Simulating...' : `Run ${selectedScenario?.name || 'Simulation'}`}
        </Button>

        {simulationResult && (
          <Card className="mt-4 bg-background/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" /> Simulation Results
              </CardTitle>
              <CardDescription>{simulationResult.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <ImpactDisplay label="Health" value={simulationResult.health_delta} />
                <ImpactDisplay label="Wealth" value={simulationResult.wealth_delta} />
                <ImpactDisplay label="Psychology" value={simulationResult.psychology_delta} />
              </div>
              {simulationResult.timeline_preview && simulationResult.timeline_preview.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold mb-1">Timeline Preview:</h5>
                  <ul className="list-disc list-inside text-xs space-y-0.5 text-muted-foreground">
                    {simulationResult.timeline_preview.map((item, idx) => (
                      <li key={idx}>Month {item.month}: {item.event}</li>
                    ))}
                  </ul>
                </div>
              )}
              {simulationResult.warnings && simulationResult.warnings.length > 0 && (
                 <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                    <h5 className="text-xs font-semibold text-destructive flex items-center mb-1">
                        <AlertTriangle className="h-4 w-4 mr-1.5"/>Warnings:
                    </h5>
                    <ul className="list-disc list-inside text-xs space-y-0.5 text-destructive/80">
                        {simulationResult.warnings.map((warning, idx) => (
                        <li key={idx}>{warning.message} (Type: {warning.type})</li>
                        ))}
                    </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {recentSimulations.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border/50">
                <h4 className="text-sm font-semibold mb-2 text-center">Recent Simulations</h4>
                 <Carousel 
                    opts={{ align: "start", loop: recentSimulations.length > 1 }} 
                    plugins={[plugin.current]}
                    className="w-full"
                    setApi={setEmblaApi}
                >
                    <CarouselContent>
                        {recentSimulations.map((sim) => (
                            <CarouselItem key={sim.id} className="md:basis-1/2 lg:basis-1/3">
                                <Card className="h-full flex flex-col bg-background/20 hover:bg-background/40 transition-colors">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">
                                            {scenarios.find(s=>s.type === sim.scenario_type)?.name || sim.scenario_type}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Ran on: {new Date(sim.created_at).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-xs space-y-1 flex-grow">
                                       <p>Health: <span className={cn(sim.health_delta && sim.health_delta > 0 ? "text-green-400" : sim.health_delta && sim.health_delta < 0 ? "text-red-400" : "")}>{sim.health_delta?.toFixed(1)}</span></p>
                                       <p>Wealth: <span className={cn(sim.wealth_delta && sim.wealth_delta > 0 ? "text-green-400" : sim.wealth_delta && sim.wealth_delta < 0 ? "text-red-400" : "")}>{sim.wealth_delta?.toFixed(1)}</span></p>
                                       <p>Psych: <span className={cn(sim.psychology_delta && sim.psychology_delta > 0 ? "text-green-400" : sim.psychology_delta && sim.psychology_delta < 0 ? "text-red-400" : "")}>{sim.psychology_delta?.toFixed(1)}</span></p>
                                    </CardContent>
                                    <CardFooter className="pt-2">
                                        <Button size="sm" variant="link" className="text-xs p-0 h-auto" onClick={() => {
                                            const scenario = scenarios.find(s => s.type === sim.scenario_type);
                                            if (scenario) setSelectedScenario(scenario);
                                            if (sim.parameters) setParameters(sim.parameters as Record<string, any>);
                                            setSimulationResult(null); // Clear previous live result
                                            toast.info(`Loaded parameters from simulation on ${new Date(sim.created_at).toLocaleDateString()}`);
                                            if (emblaApi) emblaApi.scrollTo(0, true); 
                                        }}>
                                            Reload Params
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {recentSimulations.length > 1 && (
                        <>
                            <CarouselPrevious className="absolute left-[-15px] top-1/2 -translate-y-1/2 scale-75"/>
                            <CarouselNext className="absolute right-[-15px] top-1/2 -translate-y-1/2 scale-75"/>
                        </>
                    )}
                </Carousel>
                {recentSimulations.length > 0 && (
                    <div className="text-center text-xs text-muted-foreground mt-2">
                        Slide {currentSlide + 1} of {recentSimulations.length}
                    </div>
                )}
            </div>
        )}
      </div>
    </LifeCard>
  );
};

export default SimulationCard;
