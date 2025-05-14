
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { RealtimePostgresChangesPayload, RealtimeChannel } from '@supabase/supabase-js';

/**
 * RealtimeFilterOptions type
 * Defines the options for filtering real-time updates
 */
type RealtimeFilterOptions = {
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema: string;
  table: string;
  filter?: string;
};

/**
 * Hook to listen for real-time updates on a table
 * @param table The table name
 * @param schema The schema name (defaults to 'public')
 * @param event The event to listen for (defaults to '*')
 * @param callback The callback to execute when an event is received
 * @returns The data, loading state, and error
 */
export function useTableChanges<T>(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  schema = 'public',
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
): [boolean, Error | null] {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const channelName = `${schema}-${table}-changes`;
    const filterOptions: RealtimeFilterOptions = {
      event,
      schema,
      table,
    };

    const channel = supabase.channel(channelName);
    
    channel
      .on('postgres_changes' as any, filterOptions, callback)
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          setIsLoading(false);
        } else if (status === 'CHANNEL_ERROR') {
          setError(new Error(`Error subscribing to ${channelName}`));
          setIsLoading(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, schema, event, callback]);

  return [isLoading, error];
}

/**
 * Hook to listen for real-time updates to a specific row in a table
 * @param table The table name
 * @param id The row ID
 * @param callback The callback to execute when an event is received
 * @param schema The schema name (defaults to 'public')
 * @param event The event to listen for (defaults to '*')
 * @returns The loading state and error
 */
export function useRowChanges<T>(
  table: string,
  id: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  schema = 'public',
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
): [boolean, Error | null] {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const channelName = `${schema}-${table}-${id}-changes`;
    const filterOptions: RealtimeFilterOptions = {
      event,
      schema,
      table,
      filter: `id=eq.${id}`,
    };

    const channel = supabase.channel(channelName);
    
    channel
      .on('postgres_changes' as any, filterOptions, callback)
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          setIsLoading(false);
        } else if (status === 'CHANNEL_ERROR') {
          setError(new Error(`Error subscribing to ${channelName}`));
          setIsLoading(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, id, schema, event, callback]);

  return [isLoading, error];
}

/**
 * Subscribe to a generic real-time channel
 * @param channelName The channel name
 * @param table The table name
 * @param callback The callback to execute when an event is received
 * @param schema The schema name (defaults to 'public')
 * @param event The event to listen for (defaults to '*')
 * @returns A promise that resolves when the subscription is ready
 */
export function subscribeToChannel<T>(
  channelName: string,
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  schema = 'public',
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
): Promise<RealtimeChannel> {
  const filterOptions: RealtimeFilterOptions = {
    event,
    schema,
    table,
  };

  const channel = supabase.channel(channelName);
  
  const channelInstance = channel
    .on('postgres_changes' as any, filterOptions, callback)
    .subscribe();

  return Promise.resolve(channelInstance);
}

/**
 * Subscribe to a specific row in a table
 * @param channelName The channel name
 * @param table The table name
 * @param id The row ID
 * @param callback The callback to execute when an event is received
 * @param schema The schema name (defaults to 'public')
 * @param event The event to listen for (defaults to '*')
 * @returns A promise that resolves when the subscription is ready
 */
export function subscribeToRow<T>(
  channelName: string,
  table: string,
  id: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  schema = 'public',
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
): Promise<RealtimeChannel> {
  const filterOptions: RealtimeFilterOptions = {
    event,
    schema,
    table,
    filter: `id=eq.${id}`,
  };

  const channel = supabase.channel(channelName);
  
  const channelInstance = channel
    .on('postgres_changes' as any, filterOptions, callback)
    .subscribe();

  return Promise.resolve(channelInstance);
}
