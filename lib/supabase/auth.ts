import { supabaseClient } from './client';
import { DatabaseProvider } from '../database/provider';

const database = DatabaseProvider.getInstance();

function ensureSupabaseEnabled() {
  if (database.useSQLite) {
    throw new Error('Supabase auth is unavailable when DEBUG=true. Use local auth with /api/auth instead.');
  }
}

export async function signInAdmin(email: string, password: string) {
  ensureSupabaseEnabled();
  return await supabaseClient.auth.signInWithPassword({ email, password });
}

export async function signOutAdmin() {
  ensureSupabaseEnabled();
  return await supabaseClient.auth.signOut();
}

export async function getAdminSession() {
  ensureSupabaseEnabled();
  return await supabaseClient.auth.getSession();
}
