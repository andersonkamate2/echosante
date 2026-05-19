import { supabaseClient } from './client';

export async function signInAdmin(email: string, password: string) {
  return await supabaseClient.auth.signInWithPassword({ email, password });
}

export async function signOutAdmin() {
  return await supabaseClient.auth.signOut();
}

export async function getAdminSession() {
  return await supabaseClient.auth.getSession();
}
