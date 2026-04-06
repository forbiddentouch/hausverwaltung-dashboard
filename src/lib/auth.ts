import { supabase } from './supabase'

export async function signOut() {
  await supabase.auth.signOut()
  window.location.href = '/login'
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
