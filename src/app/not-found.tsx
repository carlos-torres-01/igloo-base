import Link from "next/link"
import { SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-6 text-center">
      <div className="space-y-4">
        <SearchX className="mx-auto size-9 text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">No encontramos esta página</h1>
          <p className="text-sm text-muted-foreground">
            El recurso no existe o ya no está disponible.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/organizaciones" />}>
          Ir a organizaciones
        </Button>
      </div>
    </main>
  )
}
