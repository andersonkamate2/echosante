import { createClient } from '@supabase/supabase-js';
import { createMockSupabase } from './mock';

let supabaseServerInstance: any;

if (process.env.TEST_SUPABASE === '1') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - mock object shape
  supabaseServerInstance = createMockSupabase();
} else {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Les variables d’environnement SUPABASE_URL et SUPABASE_SERVICE_KEY (ou NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) doivent être définies pour le serveur.'
    );
  }

  supabaseServerInstance = createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

export const supabaseServer = supabaseServerInstance;
