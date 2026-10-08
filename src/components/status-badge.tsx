import { Badge } from "@/components/ui/badge"

const labels: Record<string, string> = {
  draft: "Borrador",
  active: "Activo",
  retired: "Retirado",
  published: "Publicado",
  replaced: "Reemplazado",
  cancelled: "Anulado",
  correcting: "Corrección",
  inactive: "Inactiva",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={
        status === "active" || status === "published" ? "default" : "secondary"
      }
    >
      {labels[status] ?? status}
    </Badge>
  )
}
