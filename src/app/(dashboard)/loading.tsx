import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Cargando contenido"
      className="flex flex-col gap-8"
    >
      <span className="sr-only">Cargando contenido…</span>
      <div className="flex flex-col gap-3" aria-hidden="true">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Skeleton aria-hidden="true" className="h-48 w-full" />
    </div>
  )
}
