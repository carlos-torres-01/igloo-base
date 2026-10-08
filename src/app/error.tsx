"use client"

import { useEffect } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      role="alert"
      className="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <h1 className="text-xl font-semibold">No pudimos cargar esta página</h1>
      <p className="text-sm text-muted-foreground">
        Inténtalo de nuevo. Si el problema continúa, contacta al responsable de
        la herramienta.
      </p>
      <div className="flex gap-2">
        <Button onClick={() => retry()}>Reintentar</Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Ir al inicio
        </Button>
      </div>
    </div>
  )
}
