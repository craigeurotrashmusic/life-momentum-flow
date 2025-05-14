
import { supabase } from '../supabaseClient';
import { toast } from '@/hooks/use-toast';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js'; // Corrected import path

export type ScenarioType =
  | "sleep"
  | "finance"
  | "workout"
  | "diet"
  | "custom"
  | "career_change"
  | "investment_strategy"
  | "health_intervention"
  | "relationship_change";

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

// For creating a new simulation
export interface CreateSimulationParams {
  scenario_type: ScenarioType;
  parameters: Record<string, any>;
  health_delta: number;
  wealth_delta: number;
  psychology_delta: number;
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

  const { data, error } = await supabase
    .from('simulations')
    .insert({ // Pass a single object, not an array
      user_id: userId,
      scenario_type: params.scenario_type,
      parameters: params.parameters,
      health_delta: params.health_delta,
      wealth_delta: params.wealth_delta,
      psychology_delta: params.psychology_delta,
    })
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
let simulationChannel: RealtimeChannel | null = null;

export const subscribeSimulations = (
  userId: string, 
  callback: (payload: RealtimePostgresChangesPayload<Simulation>) => void
): RealtimeChannel => {
  if (simulationChannel) {
    console.log("Already subscribed to simulations. Removing previous channel to avoid duplicates.");
    supabase.removeChannel(simulationChannel).catch(e => console.warn("Error removing previous sim channel", e));
    simulationChannel = null;
  }
  
  const channelName = `simulations_user_${userId}_${Date.now()}`;
  simulationChannel = supabase
    .channel(channelName)
    .on(
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
      if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) { // Usage as value
        console.log(`Successfully subscribed to new simulations for user ${userId} on channel ${channelName}`);
      } else if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR || status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT || status === REALTIME_SUBSCRIBE_STATES.CLOSED) { // Usage as value
        console.error(`Error subscribing to simulations channel for user ${userId} on ${channelName}: ${err?.message || status}`);
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
        simulationChannel = null; 
      });
  } else {
    console.log("No active simulation channel to unsubscribe from.");
  }
};
