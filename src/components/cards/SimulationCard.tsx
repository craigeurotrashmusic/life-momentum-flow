
import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayCircle, BarChart3, Brain, DollarSign, HeartPulse, Users, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import LifeCard from './LifeCard'; // Assuming LifeCard is in the same directory or adjust path
import { useAuth } from '@/hooks/useAuth';
// import { supabase } from '@/lib/supabaseClient'; // Already imported if needed by API calls
import { createSimulation, fetchRecentSimulations, Simulation, ScenarioType, ScenarioParameter, SimulationResult } from '@/lib/api/simulation'; // Assuming these exist
import Autoplay from "embla-carousel-autoplay"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import type { EmblaOptionsType, UseEmblaCarouselType } from 'embla-carousel-react'; // Corrected import

interface Scenario {
  type: ScenarioType;
  name: string;
  description: string;
  icon: React.ElementType;
  parameters: ScenarioParameter[];
  color: string; // e.g. "text-green-500" or "bg-blue-500"
}

const scenarios: Scenario[] = [
  {
    type: 'career_change',
    name: 'Career Pivot',
    description: 'Simulate the impact of switching to a new industry or role.',
    icon: Brain,
    parameters: [
      { id: 'new_industry_stress', label: 'New Industry Stress (1-10)', type: 'number', defaultValue: 6 },
      { id: 'learning_curve_hours', label: 'Weekly Learning Hours', type: 'number', defaultValue: 10 },
      { id: 'salary_change_percentage', label: 'Salary Change (%)', type: 'number', defaultValue: -10 },
    ],
    color: "text-blue-500",
  },
  {
    type: 'investment_strategy',
    name: 'Investment Strategy',
    description: 'Explore outcomes of different financial investment approaches.',
    icon: DollarSign,
    parameters: [
      { id: 'risk_level', label: 'Risk Level (1-10)', type: 'number', defaultValue: 7 },
      { id: 'investment_amount', label: 'Monthly Investment ($)', type: 'number', defaultValue: 500 },
      { id: 'time_horizon_years', label: 'Time Horizon (Years)', type: 'number', defaultValue: 10 },
    ],
    color: "text-green-500",
  },
  {
    type: 'health_intervention',
    name: 'Health Intervention',
    description: 'Model effects of a new fitness or diet plan.',
    icon: HeartPulse,
    parameters: [
      { id: 'commitment_level', label: 'Commitment (1-10)', type: 'number', defaultValue: 8 },
      { id: 'diet_change_intensity', label: 'Diet Change Intensity (1-10)', type: 'number', defaultValue: 5 },
      { id: 'weekly_exercise_hours', label: 'Weekly Exercise Hours', type: 'number', defaultValue: 5 },
    ],
    color: "text-red-500",
  },
  {
    type: 'relationship_change',
    name: 'Relationship Dynamics',
    description: 'Simulate impacts of major relationship shifts.',
    icon: Users,
    parameters: [
      { id: 'communication_effort', label: 'Communication Effort (1-10)', type: 'number', defaultValue: 7 },
      { id: 'shared_activities_hours', label: 'Weekly Shared Activities', type: 'number', defaultValue: 8 },
    ],
    color: "text-purple-500",
  },
];


const SimulationCard = () => {
  const { user } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(scenarios[0]);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSimulations, setRecentSimulations] = useState<Simulation[]>([]);
  
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  const [api, setApi] = useState<UseEmblaCarouselType | undefined>(); // Corrected type
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrentSlide(api.selectedScrollSnap());
    api.on("select", () => setCurrentSlide(api.selectedScrollSnap()));
  }, [api]);

  useEffect(() => {
    if (user?.id) {
      fetchRecentSimulations(user.id, 3).then(({ data }) => {
        if (data) setRecentSimulations(data);
      });
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
    const scenario = scenarios.find(s => s.type === scenarioType);
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

    const simData = {
      user_id: user.id,
      scenario_type: selectedScenario.type,
      parameters: parameters,
    };

    // This is where you'd call your actual simulation engine/API.
    // For now, we'll mock it and then call createSimulation to store it.
    try {
      // Mocked results for demonstration
      const mockResult: SimulationResult = {
        summary: `Simulating ${selectedScenario.name}... Outcome looks promising.`,
        health_impact: Math.random() * 20 - 10, // Random change between -10 and +10
        wealth_impact: Math.random() * 20 - 10,
        psychology_impact: Math.random() * 20 - 10,
        timeline_preview: [
          { month: 1, event: "Initial adjustment phase." },
          { month: 3, event: "First signs of impact noted." },
          { month: 6, event: "Significant shift observed." },
        ],
        warnings: Math.random() > 0.7 ? [{ type: "HighRisk", message: "This path has high volatility." }] : [],
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { data: storedSimulation, error } = await createSimulation({
        ...simData,
        health_delta: mockResult.health_impact,
        wealth_delta: mockResult.wealth_impact,
        psychology_delta: mockResult.psychology_impact,
      });

      if (error || !storedSimulation) {
        toast.error(`Failed to store simulation: ${error?.message || 'Unknown error'}`);
        setSimulationResult({ ...mockResult, summary: "Failed to store simulation results."}); // Show mock but indicate store failure
      } else {
        setSimulationResult(mockResult);
        toast.success(`${selectedScenario.name} simulated and recorded!`);
        // Refresh recent simulations
        if (user?.id) {
            fetchRecentSimulations(user.id, 3).then(({ data }) => {
            if (data) setRecentSimulations(data);
            });
        }
      }
    } catch (e: any) {
      toast.error(`Simulation error: ${e.message}`);
      setSimulationResult({ summary: "An error occurred during simulation.", health_impact:0, wealth_impact:0, psychology_impact:0, timeline_preview:[], warnings:[] });
    } finally {
      setIsLoading(false);
    }
  };

  const ImpactDisplay: React.FC<{ label: string; value: number }> = ({ label, value }) => {
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
      icon={<Zap />}
      color="bg-gradient-to-br from-indigo-900/30 to-purple-900/30"
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
                        min={param.min ?? (param.defaultValue > 10 ? 0 : 1)} // Basic min heuristic
                        max={param.max ?? (param.defaultValue > 10 ? param.defaultValue * 2 : 10)} // Basic max heuristic
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

        <Button onClick={runSimulation} disabled={isLoading || !selectedScenario} className="w-full py-3 text-base">
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
                <ImpactDisplay label="Health" value={simulationResult.health_impact} />
                <ImpactDisplay label="Wealth" value={simulationResult.wealth_impact} />
                <ImpactDisplay label="Psychology" value={simulationResult.psychology_impact} />
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
                    setApi={setApi}
                >
                    <CarouselContent>
                        {recentSimulations.map((sim, index) => (
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
                                       <p>Health: <span className={cn(sim.health_delta > 0 ? "text-green-400" : sim.health_delta < 0 ? "text-red-400" : "")}>{sim.health_delta?.toFixed(1)}</span></p>
                                       <p>Wealth: <span className={cn(sim.wealth_delta > 0 ? "text-green-400" : sim.wealth_delta < 0 ? "text-red-400" : "")}>{sim.wealth_delta?.toFixed(1)}</span></p>
                                       <p>Psych: <span className={cn(sim.psychology_delta > 0 ? "text-green-400" : sim.psychology_delta < 0 ? "text-red-400" : "")}>{sim.psychology_delta?.toFixed(1)}</span></p>
                                    </CardContent>
                                    <CardFooter className="pt-2">
                                        <Button size="xs" variant="link" className="text-xs p-0 h-auto" onClick={() => {
                                            const scenario = scenarios.find(s => s.type === sim.scenario_type);
                                            if (scenario) setSelectedScenario(scenario);
                                            if (sim.parameters) setParameters(sim.parameters as Record<string, any>);
                                            setSimulationResult(null); // Clear previous live result
                                            toast.info(`Loaded parameters from simulation on ${new Date(sim.created_at).toLocaleDateString()}`);
                                            if (api) api.scrollTo(0, true); // Scroll main content to top if needed
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
                <div className="text-center text-xs text-muted-foreground mt-2">
                    Slide {currentSlide + 1} of {recentSimulations.length}
                </div>
            </div>
        )}

      </div>
    </LifeCard>
  );
};

export default SimulationCard;
