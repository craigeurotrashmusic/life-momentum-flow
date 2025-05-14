import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, // This might be used for the event type in callback or specific logic
  REALTIME_SUBSCRIBE_STATES,
  // REALTIME_LISTEN_TYPES, // Not needed if using string literals
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
  event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE, // This type is for the filter, not the .on() method's first arg
  callback: (payload: RealtimeData<T>) => void
) {
  const [data, setData] = useState<RealtimeData<T>>({ new: null, old: null, errors: null });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const subscribeToChannel = async () => {
      const newChannel = supabase.channel(`realtime_${tableName}_${event}`)
        .on(
          'postgres_changes', // Corrected: Use string literal
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

    // Store the channel instance in a variable to use in the cleanup function
    // This ensures that we are trying to remove the same channel instance that was created
    // let currentChannelInstance = channel; // This line would capture the initial null value.
                                        // The effect cleanup function closes over `channel` from its own scope.
    return () => {
      // If we have a channel instance stored in state, attempt to remove it.
      // The channel object might be updated by setChannel, so we get it from state.
      if (channel) { 
        supabase.removeChannel(channel);
      }
    };
  }, [tableName, schema, event, callback, channel]); // Added channel to dependency array because it's used in cleanup.

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

    const subscribeToChannel = async () => {
      const newChannel = supabase.channel(`table-db-changes_${tableName}_${eventType}`)
        .on(
          'postgres_changes', // Corrected: Use string literal
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

    // const currentChannelInstance = channel; // Similar issue as above.
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tableName, schema, eventType, callback, channel]); // Added channel to dependency array.

}

// Added constraint T extends Record<string, any>
export function subscribeToPostgresChanges<T extends Record<string, any> = any>(
  table: string,
  schema: string = 'public',
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  eventType: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT | '*' = '*'
) {
  const channelName = `table-changes_${table}_${eventType}_${Date.now()}`;
  const channelInstance = supabase.channel(channelName)
    .on(
      'postgres_changes', // Corrected: Use string literal
      {
        event: eventType,
        schema: schema,
        table: table
      },
      callback
    )
    .subscribe((status, err) => {
      if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT || status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
        console.error(`Subscription error on ${channelName} (${status}):`, err);
      } else if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
        console.log(`Successfully subscribed to ${channelName}`);
      }
    });

  return {
    unsubscribe: () => {
      if (channelInstance) {
        supabase.removeChannel(channelInstance).then(() => {
          console.log(`Successfully removed channel ${channelName}`);
        }).catch(error => console.error(`Error removing channel ${channelName}:`, error));
      }
    }
  };
}

// ... keep existing code (removeSubscription function)

export const removeSubscription = async (channel: RealtimeChannel) => {
    await supabase.removeChannel(channel);
};
