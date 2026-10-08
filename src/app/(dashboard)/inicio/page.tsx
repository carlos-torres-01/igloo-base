import { PageHeader } from "@/components/page-header"
import { requireUser } from "@/lib/auth"

export default async function StartPage() {
  const { profile } = await requireUser()
  return (
    <PageHeader
      eyebrow="Igloo"
      title={`Hola, ${profile.full_name || "bienvenido"}`}
      description="Esta base está lista para tu nueva herramienta."
    />
  )
}
