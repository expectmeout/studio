import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase'; // Assuming you might create this for typed Supabase

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// If you have generated types for your database, you can pass them here:
// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
// For now, we'll use the untyped client:
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
