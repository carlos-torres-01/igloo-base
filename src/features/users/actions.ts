"use server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ActionResult } from "@/types/domain"

const roleSchema = z.enum(["admin", "user"])
const createUserSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(12).max(128),
  role: roleSchema,
})
const updateUserSchema = z.object({
  userId: z.uuid(),
  fullName: z.string().trim().min(2).max(120),
  role: roleSchema,
  isActive: z.boolean(),
})

export async function createUserAction(input: unknown): Promise<ActionResult> {
  const parsed = createUserSchema.safeParse(input)
  if (!parsed.success)
    return {
      ok: false,
      message:
        "Revisa los datos del usuario y la contraseña (mínimo 12 caracteres).",
    }
  const { supabase } = await requireAdmin()
  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", parsed.data.email)
    .maybeSingle()
  if (lookupError) return { ok: false, message: lookupError.message }
  if (existing)
    return { ok: false, message: "Ya existe una cuenta con ese correo." }
  const adminClient = createAdminClient()
  if (!adminClient)
    return {
      ok: false,
      message: "Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor.",
    }
  const { data, error } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName },
  })
  if (error || !data.user)
    return {
      ok: false,
      message: error?.message ?? "No se pudo crear el usuario.",
    }
  const { error: profileError } = await adminClient
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      role: parsed.data.role,
      is_active: true,
    })
    .eq("id", data.user.id)
  if (profileError)
    return {
      ok: false,
      message: `La cuenta fue creada, pero no se pudo guardar el perfil: ${profileError.message}`,
    }
  revalidatePath("/usuarios")
  return {
    ok: true,
    message:
      "Usuario creado. Comparte la contraseña inicial por un canal seguro.",
  }
}

export async function updateUserAction(input: unknown): Promise<ActionResult> {
  const parsed = updateUserSchema.safeParse(input)
  if (!parsed.success)
    return { ok: false, message: "Datos de usuario inválidos." }
  const { supabase } = await requireAdmin()
  const { error } = await supabase.rpc("update_managed_user", {
    target_user_id: parsed.data.userId,
    target_full_name: parsed.data.fullName,
    target_role: parsed.data.role,
    target_is_active: parsed.data.isActive,
  })
  if (error) return { ok: false, message: error.message }
  revalidatePath("/usuarios")
  return { ok: true, message: "Usuario actualizado." }
}
