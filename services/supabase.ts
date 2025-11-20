import { createClient } from '@supabase/supabase-js';

// Access environment variables safely
const env = typeof process !== 'undefined' ? process.env : {};
const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Key is missing. Auth and DB features will not work.");
}

// Initialize with fallbacks to prevent 'supabaseUrl is required' error on load.
// The client will be instantiated, but API calls will fail if keys are invalid.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
