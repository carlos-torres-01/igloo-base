import "server-only"

import { createClient } from "@supabase/supabase-js"

import { getSupabaseConfig } from "@/lib/supabase/config"
import type { Database } from "@/types/database"

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return null

  const { url } = getSupabaseConfig()
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
