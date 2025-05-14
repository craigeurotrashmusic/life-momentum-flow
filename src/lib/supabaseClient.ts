
// Import and re-export the Supabase client from the Lovable-managed integration file.
// This ensures the correct Supabase URL and Anon Key are used.
import { supabase as integrationSupabase } from '@/integrations/supabase/client';

export const supabase = integrationSupabase;

// The original code that relied on Vite environment variables is removed
// as it was causing issues in the Lovable preview environment.
// console.warn messages related to missing env vars are also no longer needed here.

