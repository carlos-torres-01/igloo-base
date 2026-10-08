import "server-only"

import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth"

const PAGE_SIZE = 25

export async function getUsersPage(pageParam?: string) {
  const { supabase, user } = await requireAdmin()
  const value = Number(pageParam)
  const page =
    Number.isSafeInteger(value) && value > 0 && value <= 100_000 ? value : 1
  const start = (page - 1) * PAGE_SIZE
  const { data, count, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active", { count: "exact" })
    .order("full_name")
    .order("id")
    .range(start, start + PAGE_SIZE - 1)

  if (error) throw error
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))
  if (page > totalPages) redirect(`/usuarios?page=${totalPages}`)

  return { profiles: data ?? [], currentUserId: user.id, page, totalPages }
}
