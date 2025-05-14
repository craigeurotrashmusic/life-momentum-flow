
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  RealtimeChannel, 
  RealtimePostgresChangesPayload
} from '@supabase/supabase-js';

interface RealtimeData<T> {
  new: T | null;
  old: T | null;
  errors: { [key: string]: string } | null; // Updated to match Supabase payload
}

export function useRealtime<T>(
  tableName: string,
  schema: string = 'public',
  event: 'INSERT' | 'UPDATE' | 'DELETE' = 'UPDATE', // This remains a single event type
  callback: (payload: RealtimeData<T>) => void
) {
  const [data, setData] = useState<RealtimeData<T>>({ new: null, old: null, errors: null });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const subscribe = async () => {
      const newChannel = supabase.channel(`realtime_${tableName}_${event}`) // Ensure unique channel per event type if needed
        .on(
          'postgres_changes',
          { event: event, schema: schema, table: tableName },
          (payload: RealtimePostgresChangesPayload<T>) => {
            setData({ new: payload.new, old: payload.old, errors: payload.errors });
            callback({ new: payload.new, old: payload.old, errors: payload.errors });
          }
        )
        .subscribe();

      setChannel(newChannel);
    };

    subscribe();

    // Cleanup function
    const currentChannel = channel;
    return () => {
      if (currentChannel) {
        supabase.removeChannel(currentChannel);
      }
    };
  }, [tableName, schema, event, callback]); // Removed channel from dependencies to avoid re-subscribing on channel state change

  return data;
}

export function useRealtimePostgresChanges<T = any>(
  tableName: string,
  schema: string = 'public',
  // Changed from eventTypes array to single eventType string, defaulting to '*'
  eventType: '*' | 'INSERT' | 'UPDATE' | 'DELETE' = '*', 
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!tableName) {
      console.warn('Table name is required for realtime updates.');
      return;
    }

    const subscribe = async () => {
      // Ensure unique channel name if multiple hooks are used with different eventTypes for the same table
      const newChannel = supabase.channel(`table-db-changes_${tableName}_${eventType}`) 
        .on(
          'postgres_changes',
          { 
            event: eventType, // Use the single eventType string
            schema: schema,
            table: tableName
          }, 
          (payload: RealtimePostgresChangesPayload<T>) => {
            callback(payload);
          }
        )
        .subscribe();

      setChannel(newChannel);
    };

    subscribe();

    // Cleanup function
    const currentChannel = channel;
    return () => {
      if (currentChannel) {
        supabase.removeChannel(currentChannel);
      }
    };
  }, [tableName, schema, eventType, callback]); // Removed channel from dependencies

  // No return value needed from this hook as it only sets up a subscription
}

export function subscribeToPostgresChanges<T = any>( // Added type parameter T
  table: string,
  schema: string = 'public', 
  callback: (payload: RealtimePostgresChangesPayload<T>) => void, // Typed payload
  // Changed from event array to single eventType string, defaulting to '*'
  eventType: '*' | 'INSERT' | 'UPDATE' | 'DELETE' = '*' 
) {
  // Ensure unique channel name
  const channel = supabase.channel(`table-changes_${table}_${eventType}`) 
    .on(
      'postgres_changes',
      {
        event: eventType, // Use the single eventType string
        schema: schema,
        table: table
      },
      callback // Callback now expects RealtimePostgresChangesPayload<T>
    )
    .subscribe();
  
  return {
    unsubscribe: () => {
      if (channel) {
        supabase.removeChannel(channel).then(() => channel.unsubscribe());
      }
    }
  };
}

export const removeSubscription = async (channel: RealtimeChannel) => {
    await supabase.removeChannel(channel);
};

