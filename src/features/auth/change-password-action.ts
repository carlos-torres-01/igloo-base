"use server"

import { z } from "zod"

import { requireUser } from "@/lib/auth"
import type { ActionResult } from "@/types/domain"

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = z.string().min(12).max(128).safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "La contraseña debe tener al menos 12 caracteres." }
  }

  const { supabase } = await requireUser()
  const { error } = await supabase.auth.updateUser({ password: parsed.data })
  if (error) return { ok: false, message: error.message }
  return { ok: true, message: "Contraseña actualizada." }
}
