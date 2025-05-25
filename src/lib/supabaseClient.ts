
import { createClient } from '@supabase/supabase-js';

// import type { Database } from '@/types/supabase'; // Assuming you might create this for typed Supabase

console.log('Attempting to load Supabase environment variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const commonSuffix = `Please ensure it is set in your .env.local file (located in the root of your project) and that you have restarted your Next.js development server after creating or modifying the file.`;

if (!supabaseUrl) {
  throw new Error(`Missing environment variable NEXT_PUBLIC_SUPABASE_URL. ${commonSuffix}`);
}

if (!supabaseAnonKey) {
  throw new Error(`Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY. ${commonSuffix}`);
}

// If you have generated types for your database, you can pass them here:
// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
// For now, we'll use the untyped client:
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

