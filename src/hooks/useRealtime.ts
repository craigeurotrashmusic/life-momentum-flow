
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  REALTIME_SUBSCRIBE_STATES,
  RealtimePostgresChangesFilter,
  // Removed REALTIME_LISTEN_TYPES import
} from '@supabase/supabase-js';

interface RealtimeData<T extends Record<string, any>> {
  new: T | null;
  old: Partial<T> | null;
  errors: string[] | null;
}

export function useRealtime<T extends Record<string, any>>(
  tableName: string,
  schema: string = 'public',
  event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
  callback: (payload: RealtimeData<T>) => void
) {
  const [data, setData] = useState<RealtimeData<T>>({ new: null, old: null, errors: null });
  // channel state is not used, can be removed if not intended for future use
  // const [channel, setChannel] = useState<RealtimeChannel | null>(null);


  useEffect(() => {
    const channelName = `realtime_${tableName}_${event}_${Date.now()}`;

    const filterOptions: RealtimePostgresChangesFilter<typeof event> = {
      event: event,
      schema: schema,
      table: tableName,
    };

    const newChannel = supabase.channel(channelName)
      .on(
        'postgres_changes', // Use string literal instead of enum
        filterOptions,
        (payload: RealtimePostgresChangesPayload<T>) => {
          const a_new = payload.new as T | null;
          const a_old = payload.old as Partial<T> | null;
          const a_errors = payload.errors as string[] | null;

          setData({ new: a_new, old: a_old, errors: a_errors });
          callback({ new: a_new, old: a_old, errors: a_errors });
        }
      )
      .subscribe((status, err) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          console.log(`Successfully subscribed to ${channelName}`);
        } else if (err) {
          console.error(`Error subscribing to ${channelName}:`, err);
        }
      });

    // setChannel(newChannel); // Not strictly necessary if channel state isn't used elsewhere

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel).catch(e => console.warn("Error removing channel in useRealtime", e));
      }
    };
  }, [tableName, schema, event, callback]);

  return data;
}

export function useRealtimePostgresChanges<T extends Record<string, any> = any>(
  tableName: string,
  schema: string = 'public',
  eventType: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT | '*' = '*',
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) {
  // channel state is not used here either
  // const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!tableName) {
      console.warn('Table name is required for realtime updates.');
      return;
    }
    const channelName = `table-db-changes_${tableName}_${eventType}_${Date.now()}`;

    const filterOptions: RealtimePostgresChangesFilter<typeof eventType> = {
      event: eventType,
      schema: schema,
      table: tableName,
    };

    const newChannel = supabase.channel(channelName)
      .on(
        'postgres_changes', // Use string literal instead of enum
        filterOptions,
        (payload: RealtimePostgresChangesPayload<T>) => {
          callback(payload);
        }
      )
      .subscribe((status, err) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          console.log(`Successfully subscribed to ${channelName}`);
        } else if (err) {
          console.error(`Error subscribing to ${channelName}:`, err);
        }
      });

    // setChannel(newChannel); // Not strictly necessary

    return () => {
      if (newChannel) {
         supabase.removeChannel(newChannel).catch(e => console.warn("Error removing channel in useRealtimePostgresChanges", e));
      }
    };
  }, [tableName, schema, eventType, callback]);
}

export function subscribeToPostgresChanges<T extends Record<string, any> = any>(
  table: string,
  schema: string = 'public',
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  eventType: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT | '*' = '*'
) {
  const channelName = `table-changes_${table}_${eventType}_${Date.now()}`;

  const filterOptions: RealtimePostgresChangesFilter<typeof eventType> = {
    event: eventType,
    schema: schema,
    table: table,
  };

  const channelInstance = supabase.channel(channelName)
    .on(
      'postgres_changes', // Use string literal instead of enum
      filterOptions,
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

// Helper function to remove a subscription
export function removeSubscription(channelInstance: RealtimeChannel | null) {
  if (channelInstance) {
    return supabase.removeChannel(channelInstance);
  }
  return Promise.resolve();
}
