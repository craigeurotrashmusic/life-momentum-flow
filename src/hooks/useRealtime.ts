
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Your Supabase client
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeOptions<T> {
  table: string;
  schema?: string;
  filter?: string; // e.g., 'user_id=eq.your_user_id'
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  initialData?: T[];
  onDataChange?: (newData: T, payload: RealtimePostgresChangesPayload<T>) => T | void; // For fine-grained updates
  onAllDataChange?: (newAllData: T[], payload: RealtimePostgresChangesPayload<any>) => T[] | void; // For full re-fetch/update strategy
}

const useRealtime = <T extends { id?: any }>(options: UseRealtimeOptions<T>) => {
  const {
    table,
    schema = 'public',
    filter,
    event = '*',
    initialData = [],
    onDataChange,
    onAllDataChange
  } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const handleIncomingChange = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    console.log(`Realtime change on table ${table}:`, payload);
    
    if (onAllDataChange) {
      // If a specific handler for all data is provided, use it.
      // This is useful if you prefer to re-fetch all data or have complex merge logic.
      const updatedAllData = onAllDataChange(data, payload);
      if (updatedAllData) {
        setData(updatedAllData);
      }
      return;
    }

    if (onDataChange) {
      // If a specific handler for individual item changes is provided
      const changedRecord = payload.new as T || payload.old as T; // Get the record
      if (changedRecord) {
        const updatedRecord = onDataChange(changedRecord, payload);
        if (updatedRecord) { // If handler returns an updated record, merge it
             setData(prevData => {
                const index = prevData.findIndex(item => item.id === updatedRecord.id);
                if (index > -1) {
                    const newData = [...prevData];
                    newData[index] = updatedRecord;
                    return newData;
                }
                return payload.eventType === 'INSERT' ? [...prevData, updatedRecord] : prevData;
            });
        } // Else, assume onDataChange handles state internally or no update needed for this item
      }
      return;
    }
    
    // Default optimistic update logic (can be improved)
    setData(currentData => {
      let newData = [...currentData];
      switch (payload.eventType) {
        case 'INSERT':
          // Check if already exists to prevent duplicates from optimistic + subscription
          if (!newData.find(item => item.id === (payload.new as T).id)) {
            newData.push(payload.new as T);
          }
          break;
        case 'UPDATE':
          newData = newData.map(item => (item.id === (payload.new as T).id ? (payload.new as T) : item));
          break;
        case 'DELETE':
          newData = newData.filter(item => item.id !== (payload.old as T).id);
          break;
        default:
          break;
      }
      return newData;
    });
  }, [table, onDataChange, onAllDataChange, data]); // Added data to dependency array for onAllDataChange

  useEffect(() => {
    const newChannelName = `realtime:${schema}:${table}:${filter || 'all'}`;
    
    const ch = supabase
      .channel(newChannelName)
      .on(
        'postgres_changes',
        {
          event: event,
          schema: schema,
          table: table,
          filter: filter,
        },
        handleIncomingChange
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to ${newChannelName}`);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error(`Subscription error on ${newChannelName}:`, err || status);
          setError(err || new Error(`Subscription status: ${status}`));
          // Optionally implement retry logic here
        }
      });

    setChannel(ch);

    return () => {
      if (ch) {
        supabase.removeChannel(ch).then(() => {
          console.log(`Unsubscribed from ${newChannelName}`);
        }).catch(removeError => {
          console.error(`Error unsubscribing from ${newChannelName}:`, removeError);
        });
      }
      setChannel(null);
    };
  }, [table, schema, filter, event, handleIncomingChange]); // handleIncomingChange is stable due to useCallback

  return { data, setData, error, channel };
};

export default useRealtime;

