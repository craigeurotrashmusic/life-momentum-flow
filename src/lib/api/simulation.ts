import { supabase } from '../supabaseClient';
import { toast } from '@/hooks/use-toast';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type ScenarioType = "sleep" | "finance" | "workout" | "diet" | "custom";

// Matches the Supabase table structure
export interface Simulation {
  id: string; // uuid
  user_id: string; // uuid
  scenario_type: ScenarioType;
  parameters: Record<string, any>; // jsonb
  health_delta: number | null; // float8
  wealth_delta: number | null; // float8
  psychology_delta: number | null; // float8
  created_at: string; // timestamptz
}

// For creating a new simulation, deltas are typically not provided initially
export interface CreateSimulationParams {
  scenario_type: ScenarioType;
  parameters: Record<string, any>;
  // user_id will be handled by RLS or passed explicitly if needed from a secure context
}

// This is the older specific type, ensure it's distinct or reconciled with Simulation
// It's used by use-simulation-socket.ts and DriftCorrection.tsx
export interface SimulationResult {
  id: string;
  user_id?: string; 
  simulation_params_id?: string; 
  healthDelta: number;
  wealthDelta: number;
  psychologyDelta: number;
  cascadeEffects?: {
    health: string[];
    wealth: string[];
    psychology: string[];
  };
  created_at?: string;
}

// Function to create a new simulation
export const createSimulation = async (userId: string, params: CreateSimulationParams): Promise<Simulation | null> => {
  console.log("Creating simulation with params:", params, "for user:", userId);
  
  // Simulate processing and calculating deltas (this would happen in a backend/edge function ideally)
  await new Promise(resolve => setTimeout(resolve, 1500));
  const mockDeltas = {
      health_delta: params.scenario_type === 'sleep' ? -Math.floor(Math.random() * 10) : Math.floor(Math.random() * 5) - 2,
      wealth_delta: params.scenario_type === 'finance' ? -Math.floor(Math.random() * 100) : Math.floor(Math.random() * 50) - 25,
      psychology_delta: params.scenario_type === 'diet' ? Math.floor(Math.random() * 8) - 4 : -Math.floor(Math.random() * 12),
  };

  const { data, error } = await supabase
    .from('simulations')
    .insert([{ 
      user_id: userId, // Make sure userId is available and correct
      scenario_type: params.scenario_type,
      parameters: params.parameters,
      ...mockDeltas // Add mock deltas for now
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating simulation:', error);
    toast({ title: "Error", description: `Failed to create simulation: ${error.message}`, variant: "destructive" });
    return null;
  }

  toast({ title: "Simulation Created", description: `Simulation for ${params.scenario_type} has been recorded.` });
  return data as Simulation;
};

// Function to get a single simulation by its ID
export const getSimulation = async (id: string): Promise<Simulation | null> => {
  console.log("Fetching simulation with ID:", id);
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching simulation:', error);
    // Don't toast for every fetch error unless it's critical for UI
    return null;
  }
  return data as Simulation;
};

// Function to list recent simulations for a user
export const listRecentSimulations = async (userId: string, limit: number = 10): Promise<Simulation[]> => {
  console.log("Fetching recent simulations for user:", userId);
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error listing recent simulations:', error);
    return [];
  }
  return data as Simulation[];
};

// Function to subscribe to new simulations for a user
// The callback will receive the new simulation record
let simulationChannel: RealtimeChannel | null = null;

export const subscribeSimulations = (
  userId: string, 
  callback: (payload: RealtimePostgresChangesPayload<Simulation>) => void
): RealtimeChannel => {
  if (simulationChannel) {
    console.log("Already subscribed to simulations. Removing previous channel to avoid duplicates.");
    supabase.removeChannel(simulationChannel).catch(e => console.warn("Error removing previous sim channel", e));
    simulationChannel = null; // Ensure it's nullified before creating a new one
  }
  
  const channelName = `simulations_user_${userId}_${Date.now()}`; // Add timestamp for more uniqueness if needed rapidly
  simulationChannel = supabase
    .channel(channelName)
    .on<Simulation>(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'simulations',
        filter: `user_id=eq.${userId}` 
      },
      (payload) => {
        console.log('New simulation received via subscription:', payload);
        callback(payload as RealtimePostgresChangesPayload<Simulation>);
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Successfully subscribed to new simulations for user ${userId} on channel ${channelName}`);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        console.error(`Error subscribing to simulations channel for user ${userId} on ${channelName}: ${err?.message || status}`);
        // Optionally try to resubscribe or notify user
      }
    });

  return simulationChannel;
};

export const unsubscribeSimulations = () => {
  if (simulationChannel) {
    supabase.removeChannel(simulationChannel)
      .then(() => {
        console.log("Unsubscribed from simulations channel.");
        simulationChannel = null;
      })
      .catch(error => {
        console.error("Error unsubscribing from simulations channel:", error);
        // simulationChannel might still be considered active by Supabase client internally
        // Setting to null regardless to allow resubscription attempt by our logic
        simulationChannel = null; 
      });
  } else {
    console.log("No active simulation channel to unsubscribe from.");
  }
};

// For SimulationCard, the old SimulationResult might need to map to this new Simulation type
// If SimulationResult from the old context is still used, ensure it's compatible or update it.
// For now, I'll assume SimulationCard will use the new `Simulation` type.
// The existing SimulationCard used SimulationResult from '@lib/api' which doesn't exist anymore.
// The old SimulationResult type definition in `src/lib/api/simulation.ts` (allowed files) was:
/*
export interface SimulationResult {
  id: string;
  user_id?: string; 
  simulation_params_id?: string; 
  healthDelta: number;
  wealthDelta: number;
  psychologyDelta: number;
  cascadeEffects?: {
    health: string[];
    wealth: string[];
    psychology: string[];
  };
  created_at?: string;
}
*/
// The new `Simulation` type has `health_delta`, `wealth_delta`, `psychology_delta` and no `cascadeEffects`.
// I'll need to update SimulationCard to use `Simulation` and adjust its display if it relied on `cascadeEffects`.
