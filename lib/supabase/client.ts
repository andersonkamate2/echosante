import { createClient } from '@supabase/supabase-js';
import { createMockSupabase } from './mock';
import { DatabaseProvider } from '../database/provider';

let supabaseClientInstance: any;
const database = DatabaseProvider.getInstance();

if (database.useSQLite) {
  // @ts-ignore - mock object shape
  supabaseClientInstance = createMockSupabase();
} else {
  database.assertSupabaseConfig();
  const clientUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const clientKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
  supabaseClientInstance = createClient(clientUrl, clientKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabaseClient = supabaseClientInstance;
