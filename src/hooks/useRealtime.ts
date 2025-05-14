
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  RealtimeChannel, 
  RealtimePostgresChangesPayload,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  REALTIME_LISTEN_TYPES, // Added import
  REALTIME_SUBSCRIBE_STATES // Added import
} from '@supabase/supabase-js';

// Updated RealtimeData interface to correctly match Supabase payload structure
interface RealtimeData<T extends Record<string, any>> {
  new: T | null;
  old: Partial<T> | null; 
  errors: string[] | null; 
}

// Added constraint T extends Record<string, any>
export function useRealtime<T extends Record<string, any>>(
  tableName: string,
  schema: string = 'public',
  event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = 'UPDATE', 
  callback: (payload: RealtimeData<T>) => void
) {
  const [data, setData] = useState<RealtimeData<T>>({ new: null, old: null, errors: null });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const subscribeToChannel = async () => { // Renamed for clarity from 'subscribe'
      const newChannel = supabase.channel(`realtime_${tableName}_${event}`)
        .on(
          REALTIME_LISTEN_TYPES.POSTGRES_CHANGES, // Use imported enum member
          { event: event, schema: schema, table: tableName },
          (payload: RealtimePostgresChangesPayload<T>) => {
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

    subscribeToChannel();

    // Capture channel for cleanup: Renamed currentChannel to newChannelInstance for clarity
    const newChannelInstance = channel; 
    return () => {
      if (newChannelInstance) {
        supabase.removeChannel(newChannelInstance);
      }
    };
  }, [tableName, schema, event, callback, channel]); // Added channel to dependencies to re-subscribe if it changes externally, though typically managed internally.

  return data;
}

// Added constraint T extends Record<string, any>
export function useRealtimePostgresChanges<T extends Record<string, any> = any>(
  tableName: string,
  schema: string = 'public',
  eventType: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT | '*' = '*', 
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!tableName) {
      console.warn('Table name is required for realtime updates.');
      return;
    }

    const subscribeToChannel = async () => { // Renamed for clarity
      const newChannel = supabase.channel(`table-db-changes_${tableName}_${eventType}`) 
        .on(
          REALTIME_LISTEN_TYPES.POSTGRES_CHANGES, // Use imported enum member
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

    subscribeToChannel();

    const newChannelInstance = channel; 
    return () => {
      if (newChannelInstance) {
        supabase.removeChannel(newChannelInstance);
      }
    };
  }, [tableName, schema, eventType, callback, channel]); // Added channel to dependencies

}

// Added constraint T extends Record<string, any>
export function subscribeToPostgresChanges<T extends Record<string, any> = any>(
  table: string,
  schema: string = 'public', 
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  eventType: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT | '*' = '*'
) {
  const channelName = `table-changes_${table}_${eventType}_${Date.now()}`;
  const channelInstance = supabase.channel(channelName) // Renamed channel to channelInstance
    .on(
      REALTIME_LISTEN_TYPES.POSTGRES_CHANGES, // Use imported enum member
      {
        event: eventType,
        schema: schema,
        table: table
      },
      callback
    )
    .subscribe((status, err) => { 
      if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT || status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) { // Corrected status check
        console.error(`Subscription error on ${channelName} (${status}):`, err);
      } else if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) { // Corrected status check
        console.log(`Successfully subscribed to ${channelName}`);
      }
    });
  
  return {
    unsubscribe: () => {
      if (channelInstance) {
        supabase.removeChannel(channelInstance).then(() => {
          // channelInstance.unsubscribe() can also return a promise
        }).catch(error => console.error(`Error removing channel ${channelName}:`, error));
      }
    }
  };
}

// ... keep existing code (removeSubscription function)
export const removeSubscription = async (channel: RealtimeChannel) => {
    await supabase.removeChannel(channel);
};
