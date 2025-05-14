
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  REALTIME_SUBSCRIBE_STATES,
  RealtimePostgresChangesFilter,
} from '@supabase/supabase-js';

interface RealtimeData<T extends Record<string, any>> {
  new: T | null;
  old: Partial<T> | null;
  errors: string[] | null;
}

export function useRealtime<
  T extends Record<string, any>,
  E extends REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = typeof REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE
>(
  tableName: string,
  schema: string = 'public',
  event: E = REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE as E,
  callback: (payload: RealtimeData<T>) => void
) {
  const [data, setData] = useState<RealtimeData<T>>({ new: null, old: null, errors: null });

  useEffect(() => {
    const channelName = `realtime_${tableName}_${event}_${Date.now()}`;

    const filterOptions: RealtimePostgresChangesFilter<E> = {
      event: event,
      schema: schema,
      table: tableName,
    };

    const channel = supabase.channel(channelName);
    
    const newChannel = channel.on<RealtimePostgresChangesPayload<T>>(
      'postgres_changes',
      filterOptions,
      (payload) => {
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

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel).catch(e => console.warn("Error removing channel in useRealtime", e));
      }
    };
  }, [tableName, schema, event, callback]);

  return data;
}

export function useRealtimePostgresChanges<
  T extends Record<string, any> = any,
  E extends REALTIME_POSTGRES_CHANGES_LISTEN_EVENT | '*' = '*'
>(
  tableName: string,
  schema: string = 'public',
  eventType: E = '*' as E,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) {
  useEffect(() => {
    if (!tableName) {
      console.warn('Table name is required for realtime updates.');
      return;
    }
    const channelName = `table-db-changes_${tableName}_${eventType}_${Date.now()}`;

    const filterOptions: RealtimePostgresChangesFilter<E> = {
      event: eventType,
      schema: schema,
      table: tableName,
    };

    const channel = supabase.channel(channelName);
    
    const newChannel = channel.on<RealtimePostgresChangesPayload<T>>(
      'postgres_changes',
      filterOptions,
      (payload) => {
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

    return () => {
      if (newChannel) {
         supabase.removeChannel(newChannel).catch(e => console.warn("Error removing channel in useRealtimePostgresChanges", e));
      }
    };
  }, [tableName, schema, eventType, callback]);
}

export function subscribeToPostgresChanges<
  T extends Record<string, any> = any,
  E extends REALTIME_POSTGRES_CHANGES_LISTEN_EVENT | '*' = '*'
>(
  table: string,
  schema: string = 'public',
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  eventType: E = '*' as E
) {
  const channelName = `table-changes_${table}_${eventType}_${Date.now()}`;

  const filterOptions: RealtimePostgresChangesFilter<E> = {
    event: eventType,
    schema: schema,
    table: table,
  };

  const channel = supabase.channel(channelName);
  
  const channelInstance = channel.on<RealtimePostgresChangesPayload<T>>(
    'postgres_changes',
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

