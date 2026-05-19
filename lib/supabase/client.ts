import { createClient } from '@supabase/supabase-js';
import { createMockSupabase } from './mock';

let supabaseClientInstance: any;

const clientUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const clientKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const useMockClient = process.env.NEXT_PUBLIC_TEST_SUPABASE === '1' || process.env.TEST_SUPABASE === '1' || !clientUrl || !clientKey;

if (useMockClient) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - mock object shape
  supabaseClientInstance = createMockSupabase();
} else {
  supabaseClientInstance = createClient(clientUrl, clientKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabaseClient = supabaseClientInstance;
