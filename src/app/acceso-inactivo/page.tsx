import type { Metadata } from "next"
import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { logoutAction } from "@/features/auth/actions"

export const metadata: Metadata = { title: "Acceso inactivo" }

export default function InactiveAccessPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="max-w-md space-y-5 text-center">
        <ShieldAlert
          className="mx-auto size-10 text-muted-foreground"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-semibold">Tu acceso no está habilitado</h1>
        <p className="text-sm text-muted-foreground">
          Pide a un administrador que revise tu perfil y habilite tu acceso a la
          aplicación.
        </p>
        <form action={logoutAction}>
          <Button type="submit" variant="outline">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </main>
  )
}
