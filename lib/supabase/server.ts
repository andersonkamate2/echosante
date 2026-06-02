import { createClient } from '@supabase/supabase-js';
import { createMockSupabase } from './mock';
import { DatabaseProvider } from '../database/provider';

let supabaseServerInstance: any;
const database = DatabaseProvider.getInstance();

if (database.useSQLite) {
  // @ts-ignore - mock object shape
  supabaseServerInstance = createMockSupabase();
} else {
  database.assertSupabaseConfig();
  const serverUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serverKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  supabaseServerInstance = createClient(serverUrl, serverKey, {
    auth: {
      persistSession: false,
    },
  });
}

export const supabaseServer = supabaseServerInstance;
