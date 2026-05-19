import { createClient } from '@supabase/supabase-js';
import { createMockSupabase } from './mock';

let supabaseServerInstance: any;

const serverUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serverKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const useMockServer = process.env.TEST_SUPABASE === '1' || !serverUrl || !serverKey;

if (useMockServer) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - mock object shape
  supabaseServerInstance = createMockSupabase();
} else {
  supabaseServerInstance = createClient(serverUrl, serverKey, {
    auth: {
      persistSession: false,
    },
  });
}

export const supabaseServer = supabaseServerInstance;
