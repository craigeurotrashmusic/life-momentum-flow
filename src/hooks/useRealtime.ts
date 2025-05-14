import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  RealtimeChannel, 
  RealtimePostgresChangesPayload,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT // Added for explicit event types
} from '@supabase/supabase-js';

// Updated RealtimeData interface to correctly match Supabase payload structure
interface RealtimeData<T extends Record<string, any>> {
  new: T | null;
  old: Partial<T> | null; // Was T | null, now Partial<T> | null
  errors: string[] | null; // Was { [key: string]: string } | null, now string[] | null
}

// Added constraint T extends Record<string, any>
export function useRealtime<T extends Record<string, any>>(
  tableName: string,
  schema: string = 'public',
  event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = 'UPDATE', // Using imported type
  callback: (payload: RealtimeData<T>) => void
) {
  const [data, setData] = useState<RealtimeData<T>>({ new: null, old: null, errors: null });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const subscribe = async () => {
      const newChannel = supabase.channel(`realtime_${tableName}_${event}`)
        .on(
          'postgres_changes',
          { event: event, schema: schema, table: tableName },
          (payload: RealtimePostgresChangesPayload<T>) => {
            // Ensure types align with the updated RealtimeData interface
            const a_new = payload.new as T | null;
            const a_old = payload.old as Partial<T> | null;
            const a_errors = payload.errors as string[] | null;

            setData({ new: a_new, old: a_old, errors: a_errors });
            callback({ new: a_new, old: a_old, errors: a_errors });
          }
        )
        .subscribe();

      setChannel(newChannel);
    };

    subscribe();

    const currentChannel = channel; // Capture channel for cleanup
    return () => {
      if (currentChannel) {
        supabase.removeChannel(currentChannel);
      }
    };
  }, [tableName, schema, event, callback]); // Removed channel from dependencies

  return data;
}

// Added constraint T extends Record<string, any>
export function useRealtimePostgresChanges<T extends Record<string, any> = any>(
  tableName: string,
  schema: string = 'public',
  eventType: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT | '*' = '*', // Using imported type
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!tableName) {
      console.warn('Table name is required for realtime updates.');
      return;
    }

    const subscribe = async () => {
      const newChannel = supabase.channel(`table-db-changes_${tableName}_${eventType}`) 
        .on(
          'postgres_changes',
          { 
            event: eventType, 
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

    const currentChannel = channel; // Capture channel for cleanup
    return () => {
      if (currentChannel) {
        supabase.removeChannel(currentChannel);
      }
    };
  }, [tableName, schema, eventType, callback]); // Removed channel from dependencies
}

// Added constraint T extends Record<string, any>
export function subscribeToPostgresChanges<T extends Record<string, any> = any>(
  table: string,
  schema: string = 'public', 
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  eventType: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT | '*' = '*' // Using imported type
) {
  const channelName = `table-changes_${table}_${eventType}_${Date.now()}`; // Ensure unique channel names
  const channel = supabase.channel(channelName) 
    .on(
      'postgres_changes',
      {
        event: eventType,
        schema: schema,
        table: table
      },
      callback
    )
    .subscribe((status, err) => { // Optional: Add status/error handling for the subscription itself
      if (status === 'SUBSCRIBE_ERROR' || status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
        console.error(`Subscription error on ${channelName}:`, err);
      } else if (status === 'SUBSCRIBED') {
        console.log(`Successfully subscribed to ${channelName}`);
      }
    });
  
  return {
    unsubscribe: () => {
      if (channel) {
        // It's good practice to await removeChannel if possible, then unsubscribe
        supabase.removeChannel(channel).then(() => {
          // channel.unsubscribe() can also return a promise
        }).catch(error => console.error(`Error removing channel ${channelName}:`, error));
      }
    }
  };
}

// ... keep existing code (removeSubscription function)
export const removeSubscription = async (channel: RealtimeChannel) => {
    await supabase.removeChannel(channel);
};
