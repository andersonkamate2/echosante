import { createClient } from '@supabase/supabase-js';
import { createMockSupabase } from './mock';

let supabaseClientInstance: any;

if (process.env.NEXT_PUBLIC_TEST_SUPABASE === '1' || process.env.TEST_SUPABASE === '1') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - mock object shape
  supabaseClientInstance = createMockSupabase();
} else {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Les variables NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_ANON_KEY doivent être définies.'
    );
  }

  supabaseClientInstance = createClient(url, key, {
    auth: {
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabaseClient = supabaseClientInstance;
