
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimeChannel, RealtimePostgresChangesPayload, REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from '@supabase/supabase-js';

interface UseRealtimeOptions<T> {
  table: string;
  schema?: string;
  filter?: string;
  event?: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT;
  initialData?: T[];
  onDataChange?: (newData: T, payload: RealtimePostgresChangesPayload<T>) => T | void;
  onAllDataChange?: (newAllData: T[], payload: RealtimePostgresChangesPayload<T>) => T[] | void;
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

  const handleIncomingChange = useCallback((payload: RealtimePostgresChangesPayload<T>) => {
    console.log(`Realtime change on table ${table}:`, payload);
    
    if (onAllDataChange) {
      setData(prevData => { // Pass previous data to onAllDataChange
        const updatedAllData = onAllDataChange(prevData, payload);
        return updatedAllData ? updatedAllData : prevData; // Return previous data if undefined
      });
      return;
    }

    if (onDataChange) {
      const changedRecord = (payload.eventType === 'DELETE' ? payload.old : payload.new) as T;
      if (changedRecord) {
        const updatedRecordOrVoid = onDataChange(changedRecord, payload);
        if (updatedRecordOrVoid !== undefined) { // Check if something is returned
             const updatedRecord = updatedRecordOrVoid as T; // Cast if not void
             setData(prevData => {
                const index = prevData.findIndex(item => item.id === updatedRecord.id);
                if (index > -1) {
                    const newData = [...prevData];
                    newData[index] = updatedRecord;
                    return newData;
                }
                return payload.eventType === 'INSERT' ? [...prevData, updatedRecord] : prevData;
            });
        }
      }
      return;
    }
    
    setData(currentData => {
      let newData = [...currentData];
      switch (payload.eventType) {
        case 'INSERT':
          if ((payload.new as T).id && !newData.find(item => item.id === (payload.new as T).id)) {
            newData.push(payload.new as T);
          } else if (!(payload.new as T).id) {
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
  }, [table, onDataChange, onAllDataChange]); // Removed 'data' from dependency array to avoid potential loops if onAllDataChange modifies data state directly.

  useEffect(() => {
    const baseChannelName = `realtime:${schema}:${table}`;
    const channelNameWithFilter = filter ? `${baseChannelName}:${filter}` : baseChannelName;
    
    if (channel) {
        supabase.removeChannel(channel).catch(e => console.error("Error removing previous channel", e));
    }

    const newChannel = supabase
      .channel(channelNameWithFilter)
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
          console.log(`Successfully subscribed to ${channelNameWithFilter}`);
          setError(null);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error(`Subscription error on ${channelNameWithFilter}:`, err?.message || status);
          setError(err || new Error(`Subscription status: ${status}`));
        }
      });

    setChannel(newChannel);

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel).catch(removeError => {
          console.error(`Error unsubscribing from ${channelNameWithFilter}:`, removeError);
        });
      }
      setChannel(null);
    };
  }, [table, schema, filter, event, handleIncomingChange]);

  return { data, setData, error, channel };
};

export default useRealtime;
