import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { EmblaOptionsType } from 'embla-carousel-react'; // Corrected import
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BarChartIcon, ZapIcon, TrendingUpIcon, TrendingDownIcon, AlertCircle, BrainIcon, DollarSignIcon, HeartPulseIcon, PlayIcon, ListIcon, InfoIcon, XIcon } from 'lucide-react';
import { 
  SimulationResult, 
  createSimulation, 
  listRecentSimulations, 
  subscribeSimulations, 
  unsubscribeSimulations, 
  Simulation,
  ScenarioType,
  CreateSimulationParams
} from '@/lib/api/simulation';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

// Define the parameters interface based on what's used in the component
interface SimulationParams {
  name: string;
  durationMonths: number;
  initialWealth: number;
  monthlyContribution: number;
  investmentRiskLevel: number;
  healthImpactFactor: number;
  psychologyImpactFactor: number;
}

// Adapter function to convert Simulation to SimulationResult
function adaptSimulationToResult(simulation: Simulation): SimulationResult {
  return {
    id: simulation.id,
    user_id: simulation.user_id,
    healthDelta: simulation.health_delta || 0,
    wealthDelta: simulation.wealth_delta || 0,
    psychologyDelta: simulation.psychology_delta || 0,
    created_at: simulation.created_at,
    // Add default empty cascade effects
    cascadeEffects: {
      health: [],
      wealth: [],
      psychology: []
    }
  };
}

// Adapter function to convert SimulationParams to CreateSimulationParams
function adaptParamsToCreateParams(params: SimulationParams): CreateSimulationParams {
  return {
    scenario_type: "finance" as ScenarioType, // Default to finance type based on the parameters
    parameters: {
      name: params.name,
      durationMonths: params.durationMonths,
      initialWealth: params.initialWealth,
      monthlyContribution: params.monthlyContribution,
      investmentRiskLevel: params.investmentRiskLevel,
      healthImpactFactor: params.healthImpactFactor,
      psychologyImpactFactor: params.psychologyImpactFactor
    }
  };
}

const SimulationCard = () => {
  const { user } = useAuth();
  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    name: 'My Financial Future',
    durationMonths: 12,
    initialWealth: 50000,
    monthlyContribution: 500,
    investmentRiskLevel: 5, // 1-10
    healthImpactFactor: 0, // -5 to 5
    psychologyImpactFactor: 0, // -5 to 5
  });
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSimulations, setRecentSimulations] = useState<SimulationResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null);

  const handleParamChange = (param: keyof SimulationParams, value: string | number) => {
    setSimulationParams(prev => ({ ...prev, [param]: typeof prev[param] === 'number' ? Number(value) : value }));
  };

  const runSimulation = useCallback(async () => {
    if (!user) {
      toast({ title: "Authentication Error", description: "Please log in to run simulations.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
    setSimulationResult(null); 
    try {
      const createParams = adaptParamsToCreateParams(simulationParams);
      const result = await createSimulation(user.id, createParams); 
      if (result) {
        const adaptedResult = adaptSimulationToResult(result);
        setSimulationResult(adaptedResult);
        setActiveSimulationId(result.id);
        toast({ title: "Simulation Started", description: "Results will update live." });
        fetchRecent();
      } else {
        setError("Failed to start simulation. Please try again.");
        toast({ title: "Simulation Error", description: "Could not start simulation.", variant: "destructive" });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      toast({ title: "Simulation Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [simulationParams, user]);

  const fetchRecent = useCallback(async () => {
    if (!user) return;
    try {
      const sims = await listRecentSimulations(user.id);
      const adaptedSims = sims.map(adaptSimulationToResult);
      setRecentSimulations(adaptedSims);
    } catch (err) {
      console.error("Failed to fetch recent simulations:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  useEffect(() => {
    if (!activeSimulationId || !user) return;

    const onUpdate = (update: any) => {
      console.log('Live simulation update received:', update);
      // Ensure the update structure matches Simulation or RealtimePostgresChangesPayload<Simulation>
      const simulationData = update.new ? update.new : update; // Handle direct object or payload
      if (simulationData && simulationData.id === activeSimulationId) { // Check if update is for active sim
        const adaptedUpdate = adaptSimulationToResult(simulationData);
        
        setSimulationResult(prev => {
          // If prev exists and has an id, keep it, otherwise use activeSimulationId
          const currentId = prev?.id || activeSimulationId; 
          return { 
            ...prev, 
            ...adaptedUpdate, 
            id: currentId // Ensure ID is preserved correctly
          };
        });
      }
    };
    
    const { unsubscribe } = subscribeSimulations(user.id, onUpdate); // Assuming subscribeSimulations returns an unsubscribe function
    
    return () => {
      unsubscribe(); // Call the unsubscribe function
    };
  }, [activeSimulationId, user]);
  
  const chartData = useMemo(() => {
    if (!simulationResult) return [];
    // This is a simplified example. You'd typically have time-series data.
    return [
      { name: 'Health', value: 100 + (simulationResult.healthDelta || 0), fill: '#82ca9d' },
      { name: 'Wealth', value: 100 + (simulationResult.wealthDelta || 0), fill: '#8884d8' },
      { name: 'Psychology', value: 100 + (simulationResult.psychologyDelta || 0), fill: '#ffc658' },
    ];
  }, [simulationResult]);

  const getImpactColor = (delta: number = 0) => {
    if (delta > 0) return 'text-green-500';
    if (delta < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getImpactIcon = (delta: number = 0) => {
    if (delta > 0) return <TrendingUpIcon className="inline h-4 w-4" />;
    if (delta < 0) return <TrendingDownIcon className="inline h-4 w-4" />;
    return null;
  };
  
  const emblaOptions: EmblaOptionsType = { loop: false, align: 'start' };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Simulations Hub</CardTitle>
          <CardDescription>Please log in to access simulations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You must be logged in to view and run simulations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-semibold">Run Life Simulation</CardTitle>
          <Button variant="outline" size="icon" onClick={() => setShowHistory(!showHistory)}>
            <ListIcon className="h-5 w-5" />
          </Button>
        </div>
        <CardDescription>Explore potential outcomes based on your choices.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="sim-name">Simulation Name</Label>
          <Input id="sim-name" value={simulationParams.name} onChange={e => handleParamChange('name', e.target.value)} placeholder="e.g., Early Retirement Plan" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration">Duration (Months): {simulationParams.durationMonths}</Label>
            <Slider id="duration" min={1} max={120} step={1} value={[simulationParams.durationMonths]} onValueChange={([val]) => handleParamChange('durationMonths', val)} />
          </div>
          <div>
            <Label htmlFor="initialWealth">Initial Wealth: ${simulationParams.initialWealth.toLocaleString()}</Label>
            <Input type="number" id="initialWealth" value={simulationParams.initialWealth} onChange={e => handleParamChange('initialWealth', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="monthlyContribution">Monthly Contribution: ${simulationParams.monthlyContribution.toLocaleString()}</Label>
            <Input type="number" id="monthlyContribution" value={simulationParams.monthlyContribution} onChange={e => handleParamChange('monthlyContribution', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="risk">Investment Risk (1-10): {simulationParams.investmentRiskLevel}</Label>
            <Slider id="risk" min={1} max={10} step={1} value={[simulationParams.investmentRiskLevel]} onValueChange={([val]) => handleParamChange('investmentRiskLevel', val)} />
          </div>
        </div>

        <details className="group">
            <summary className="flex items-center cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              <InfoIcon className="h-4 w-4 mr-2" />
              Advanced Impact Factors (Optional)
            </summary>
            <div className="mt-4 space-y-4 p-4 border rounded-md">
                 <div>
                    <Label htmlFor="healthImpact">Health Impact Factor (-5 to 5): {simulationParams.healthImpactFactor}</Label>
                    <Slider id="healthImpact" min={-5} max={5} step={1} value={[simulationParams.healthImpactFactor || 0]} onValueChange={([val]) => handleParamChange('healthImpactFactor', val)} />
                    <p className="text-xs text-gray-500 mt-1">How much current health choices might affect outcomes.</p>
                </div>
                <div>
                    <Label htmlFor="psychologyImpact">Psychology Impact Factor (-5 to 5): {simulationParams.psychologyImpactFactor}</Label>
                    <Slider id="psychologyImpact" min={-5} max={5} step={1} value={[simulationParams.psychologyImpactFactor || 0]} onValueChange={([val]) => handleParamChange('psychologyImpactFactor', val)} />
                    <p className="text-xs text-gray-500 mt-1">How much current mindset/stress might affect outcomes.</p>
                </div>
            </div>
        </details>


        <Button onClick={runSimulation} disabled={isLoading} className="w-full">
          {isLoading ? 'Simulating...' : 'Run Simulation'} <PlayIcon className="ml-2 h-5 w-5" />
        </Button>

        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        
        {simulationResult && (
          <div className="mt-6 p-4 border rounded-md bg-slate-50">
            <h3 className="text-xl font-semibold mb-3">Simulation Results (ID: {simulationResult.id || 'N/A'})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-white rounded shadow">
                <h4 className="font-medium text-sm flex items-center"><HeartPulseIcon className="mr-2 h-5 w-5 text-pink-500"/>Health Impact</h4>
                <p className={`text-lg font-bold ${getImpactColor(simulationResult.healthDelta)}`}>
                  {simulationResult.healthDelta > 0 ? '+' : ''}{simulationResult.healthDelta} {getImpactIcon(simulationResult.healthDelta)}
                </p>
              </div>
              <div className="p-3 bg-white rounded shadow">
                <h4 className="font-medium text-sm flex items-center"><DollarSignIcon className="mr-2 h-5 w-5 text-green-500"/>Wealth Impact</h4>
                <p className={`text-lg font-bold ${getImpactColor(simulationResult.wealthDelta)}`}>
                  {simulationResult.wealthDelta > 0 ? '+' : ''}{simulationResult.wealthDelta} {getImpactIcon(simulationResult.wealthDelta)}
                </p>
              </div>
              <div className="p-3 bg-white rounded shadow">
                <h4 className="font-medium text-sm flex items-center"><BrainIcon className="mr-2 h-5 w-5 text-blue-500"/>Psychology Impact</h4>
                <p className={`text-lg font-bold ${getImpactColor(simulationResult.psychologyDelta)}`}>
                  {simulationResult.psychologyDelta > 0 ? '+' : ''}{simulationResult.psychologyDelta} {getImpactIcon(simulationResult.psychologyDelta)}
                </p>
              </div>
            </div>
            
            {simulationResult.cascadeEffects && Object.keys(simulationResult.cascadeEffects).length > 0 && 
              (Object.values(simulationResult.cascadeEffects).some(arr => arr && arr.length > 0)) && (
              <div className="my-4">
                <h4 className="font-semibold mb-2">Potential Cascade Effects:</h4>
                <Carousel opts={emblaOptions} className="w-full">
                  <CarouselContent>
                    {Object.entries(simulationResult.cascadeEffects)
                      .filter(([_, effects]) => effects && effects.length > 0) // Filter out empty effect arrays
                      .map(([pillar, effects]) => (
                      <CarouselItem key={pillar} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <Card>
                            <CardHeader className="pb-2 pt-4">
                              <CardTitle className="text-md capitalize">{pillar}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs space-y-1">
                              {(effects as string[]).map((effect, i) => <p key={i}>- {effect}</p>)}
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            )}

            <div className="h-64 w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} domain={[0, 'dataMax + 20']} />
                  <RechartsTooltip contentStyle={{ fontSize: '12px', padding: '5px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="value" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recent Simulations</DialogTitle>
            <DialogDescription>
              Review your past simulation results.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-3 p-1">
            {recentSimulations.length > 0 ? recentSimulations.map(sim => (
              <Card key={sim.id} className="p-3">
                <CardTitle className="text-sm">ID: {sim.id}</CardTitle>
                <CardDescription className="text-xs">
                  H: {sim.healthDelta}, W: {sim.wealthDelta}, P: {sim.psychologyDelta}
                </CardDescription>
                <Button size="sm" variant="link" onClick={() => { 
                    setSimulationResult(sim); 
                    setShowHistory(false); 
                    setActiveSimulationId(sim.id);
                }}>View</Button>
              </Card>
            )) : <p className="text-sm text-gray-500">No recent simulations found.</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SimulationCard;
