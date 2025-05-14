
import { supabase } from '@/lib/supabaseClient';
import type { Database, Tables, TablesInsert } from '@/integrations/supabase/types';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type FocusSession = Tables<'focus_sessions'>;
export type FocusSessionInsert = TablesInsert<'focus_sessions'>;

/**
 * Creates a new focus session.
 */
export const createFocusSession = async (sessionData: FocusSessionInsert): Promise<{ data: FocusSession | null; error: any }> => {
  const { data, error } = await supabase
    .from('focus_sessions')
    .insert(sessionData)
    .select()
    .single();
  return { data, error };
};

/**
 * Updates an existing focus session.
 */
export const updateFocusSession = async (
  sessionId: string,
  updates: Partial<FocusSessionInsert>
): Promise<{ data: FocusSession | null; error: any }> => {
  const { data, error } = await supabase
    .from('focus_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();
  return { data, error };
};

/**
 * Fetches recent focus sessions for a user.
 */
export const fetchRecentSessions = async (
  userId: string,
  limit: number = 10
): Promise<{ data: FocusSession[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
    .limit(limit);
  return { data, error };
};

/**
 * Subscribes to real-time changes in focus sessions for a user.
 */
export const subscribeToFocusSessionsChanges = (
  userId: string, // Keep userId for potential future filtering if RLS isn't enough or for client-side logic
  callback: (payload: RealtimePostgresChangesPayload<FocusSession>) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`focus_sessions_changes_for_${userId}`) // Unique channel name per user
    .on<FocusSession>(
      'postgres_changes',
      {
        event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'focus_sessions',
        // filter: `user_id=eq.${userId}` // RLS should handle this, but filter can be added if needed
      },
      payload => {
        // Ensure the payload's new/old object matches FocusSession type
        const typedPayload = payload as RealtimePostgresChangesPayload<FocusSession>;
        callback(typedPayload);
      }
    )
    .subscribe(status => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to focus_sessions changes for user ${userId}`);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`Failed to subscribe to focus_sessions changes: ${status}`);
      }
    });

  return channel;
};

