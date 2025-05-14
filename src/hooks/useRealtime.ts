
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  REALTIME_LISTEN_TYPES,
  REALTIME_SUBSCRIBE_STATES,
} from '@supabase/supabase-js';

interface RealtimeData<T extends Record<string, any>> {
  new: T | null;
  old: Partial<T> | null;
  errors: string[] | null;
}

export function useRealtime<T extends Record<string, any>>(
  tableName: string,
  schema: string = 'public',
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = 'UPDATE',
  callback: (payload: RealtimeData<T>) => void
) {
  const [data, setData] = useState<RealtimeData<T>>({ new: null, old: null, errors: null });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const channelName = `realtime_${tableName}_${event}_${Date.now()}`;
    const newChannel = supabase.channel(channelName);
    
    // Properly type the event with REALTIME_LISTEN_TYPES.POSTGRES_CHANGES
    newChannel.on(
      REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
      { event: event, schema: schema, table: tableName },
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

    setChannel(newChannel);

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
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!tableName) {
      console.warn('Table name is required for realtime updates.');
      return;
    }
    const channelName = `table-db-changes_${tableName}_${eventType}_${Date.now()}`;
    const newChannel = supabase.channel(channelName);
    
    // Properly type the event with REALTIME_LISTEN_TYPES.POSTGRES_CHANGES
    newChannel.on(
      REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
      {
        event: eventType,
        schema: schema,
        table: tableName
      },
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

    setChannel(newChannel);

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
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*'
) {
  const channelName = `table-changes_${table}_${eventType}_${Date.now()}`;
  const channelInstance = supabase.channel(channelName);
  
  // Properly type the event with REALTIME_LISTEN_TYPES.POSTGRES_CHANGES
  channelInstance.on(
    REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
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

// Helper function to remove a subscription
export function removeSubscription(channelInstance: RealtimeChannel | null) {
  if (channelInstance) {
    return supabase.removeChannel(channelInstance);
  }
  return Promise.resolve();
}
