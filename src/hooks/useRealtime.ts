import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  RealtimeChannel, 
  REALTIME_LISTEN_TYPES, 
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  RealtimePostgresChangesPayload
} from '@supabase/supabase-js';

interface RealtimeData<T> {
  new: T | null;
  old: T | null;
  errors: any[] | null;
}

export function useRealtime<T>(
  tableName: string,
  schema: string = 'public',
  event: REALTIME_LISTEN_TYPES = 'UPDATE',
  callback: (payload: RealtimeData<T>) => void
) {
  const [data, setData] = useState<RealtimeData<T>>({ new: null, old: null, errors: null });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const subscribe = async () => {
      const newChannel = supabase.channel(`realtime_${tableName}`)
        .on(event, { schema: schema, table: tableName }, (payload) => {
          setData({ new: payload.new as T, old: payload.old as T, errors: payload.errors });
          callback({ new: payload.new as T, old: payload.old as T, errors: payload.errors });
        })
        .subscribe();

      setChannel(newChannel);
    };

    subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tableName, schema, event, callback, channel]);

  return data;
}

export function useRealtimePostgresChanges<T = any>(
  tableName: string,
  schema: string = 'public',
  eventTypes: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT[] = ['INSERT', 'UPDATE', 'DELETE'],
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!tableName) {
      console.warn('Table name is required for realtime updates.');
      return;
    }

    const subscribe = async () => {
      const newChannel = supabase.channel('table-db-changes')
        .on(
          'postgres_changes',
          { 
            event: eventTypes,
            schema: schema,
            table: tableName
          }, 
          (payload) => {
            callback(payload as RealtimePostgresChangesPayload<T>);
          }
        )
        .subscribe();

      setChannel(newChannel);
    };

    subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tableName, schema, eventTypes, callback, channel]);
}

export function subscribeToPostgresChanges(
  table: string,
  schema: string = 'public', 
  callback: (payload: any) => void,
  event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT[] = ['INSERT', 'UPDATE', 'DELETE']
) {
  const channel = supabase.channel('table-changes')
    .on(
      'postgres_changes',
      {
        event: event,
        schema: schema,
        table: table
      },
      callback
    )
    .subscribe();
  
  return {
    unsubscribe: () => {
      if (channel) channel.unsubscribe();
    }
  };
}

export const removeSubscription = async (channel: RealtimeChannel) => {
    await supabase.removeChannel(channel);
};
