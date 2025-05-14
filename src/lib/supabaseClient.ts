
import { createClient } from '@supabase/supabase-js';

// Use Vite's import.meta.env instead of process.env for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn(
    'Supabase URL or Anon Key is not configured. Please check your environment variables or Supabase integration setup.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
