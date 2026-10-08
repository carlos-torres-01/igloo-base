"use server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { emailSchema, passwordSchema } from "@/lib/validations/auth"
import type { ActionResult } from "@/types/domain"

const roleSchema = z.enum(["admin", "user"])
const createUserSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: emailSchema,
  password: passwordSchema,
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
    .eq("email", parsed.data.email)
    .maybeSingle()
  if (lookupError) {
    console.error("Error consultando usuarios", lookupError)
    return {
      ok: false,
      message: "No se pudo comprobar el correo. Inténtalo de nuevo.",
    }
  }
  if (existing)
    return { ok: false, message: "Ya existe una cuenta con ese correo." }
  const adminClient = createAdminClient()
  if (!adminClient)
    return {
      ok: false,
      message:
        "La creación de usuarios no está disponible. Contacta al responsable de la herramienta.",
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
      message:
        error?.code === "email_exists"
          ? "Ya existe una cuenta con ese correo."
          : "No se pudo crear el usuario. Revisa los datos e inténtalo de nuevo.",
    }
  const { error: profileError } = await adminClient
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      role: parsed.data.role,
      is_active: true,
    })
    .eq("id", data.user.id)
    .select("id")
    .single()
  if (profileError) {
    console.error("Error configurando el perfil creado", profileError)
    const { error: rollbackError } = await adminClient.auth.admin.deleteUser(
      data.user.id
    )
    if (rollbackError)
      console.error("No se pudo revertir la cuenta incompleta", rollbackError)
    revalidatePath("/usuarios")
    return {
      ok: false,
      message: rollbackError
        ? "La cuenta se creó, pero su configuración no se completó. Revisa el usuario antes de volver a intentarlo."
        : "No se pudo completar la creación. Inténtalo de nuevo.",
    }
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
  if (error) {
    const expectedMessages = [
      "No autorizado.",
      "Nombre inválido.",
      "Datos de usuario incompletos.",
      "No puedes quitarte tu propio acceso de administrador.",
      "Usuario no encontrado.",
      "Debe permanecer al menos un administrador activo.",
    ]
    console.error("Error actualizando usuario", error)
    return {
      ok: false,
      message: expectedMessages.includes(error.message)
        ? error.message
        : "No se pudo guardar el usuario. Inténtalo de nuevo.",
    }
  }
  revalidatePath("/usuarios")
  return { ok: true, message: "Usuario actualizado." }
}
