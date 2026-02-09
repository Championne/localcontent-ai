import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Lazy-initialized admin Supabase client using the service role key.
 * Bypasses RLS — use only for server-side operations that need elevated access
 * (e.g. storage uploads, webhook processing).
 *
 * Falls back to null if SUPABASE_SERVICE_ROLE_KEY is not set.
 */
let adminClient: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient | null {
  if (adminClient) return adminClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  adminClient = createClient(url, key)
  return adminClient
}
