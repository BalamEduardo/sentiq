import { getSupabaseBrowserClient } from "./client";

export async function getCurrentSession() {
  const { data, error } = await getSupabaseBrowserClient().auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await getSupabaseBrowserClient().auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

export async function signOut() {
  const { error } = await getSupabaseBrowserClient().auth.signOut();

  if (error) {
    throw error;
  }
}
