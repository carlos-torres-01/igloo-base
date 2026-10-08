import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export const requireUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError && (authError.status ?? 0) >= 500) throw authError
  if (!user) redirect("/login")

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) throw profileError
  if (!profile?.is_active) redirect("/acceso-inactivo")

  return { user, profile, supabase }
})

export async function requireAdmin() {
  const context = await requireUser()
  if (context.profile.role !== "admin") redirect("/inicio")
  return context
}
