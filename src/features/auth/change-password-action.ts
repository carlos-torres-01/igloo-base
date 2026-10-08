"use server"

import { requireUser } from "@/lib/auth"
import { passwordSchema } from "@/lib/validations/auth"
import type { ActionResult } from "@/types/domain"

export async function changePasswordAction(
  input: unknown
): Promise<ActionResult> {
  const parsed = passwordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message }
  }

  const { supabase } = await requireUser()
  const { error } = await supabase.auth.updateUser({ password: parsed.data })
  if (error) {
    console.error("No se pudo cambiar la contraseña", error.code)
    return {
      ok: false,
      message:
        "No se pudo cambiar la contraseña. Comprueba que sea diferente de la actual o vuelve a iniciar sesión.",
    }
  }
  return { ok: true, message: "Contraseña actualizada." }
}
