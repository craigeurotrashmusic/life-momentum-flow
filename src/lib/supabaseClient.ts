
import { createClient } from '@supabase/supabase-js';

// Important: These environment variables should be set up in your Supabase project settings
// and correctly configured in your Lovable environment if not automatically handled.
// For local development, you might use a .env file (though Lovable doesn't directly use .env for deployment).
// Lovable's Supabase integration typically handles this.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn(
    'Supabase URL or Anon Key is not configured. Please check your environment variables or Supabase integration setup.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

