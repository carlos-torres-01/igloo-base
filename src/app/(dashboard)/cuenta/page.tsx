import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { ChangePasswordForm } from "@/features/auth/change-password-form"
import { requireUser } from "@/lib/auth"

export const metadata: Metadata = { title: "Mi cuenta" }

export default async function AccountPage() {
  const { profile } = await requireUser()
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={profile.role === "admin" ? "Administrador" : "Usuario"}
        title="Mi cuenta"
        description={profile.email}
      />
      <section className="space-y-4">
        <h2 className="font-medium">Contraseña</h2>
        <ChangePasswordForm />
      </section>
    </div>
  )
}
