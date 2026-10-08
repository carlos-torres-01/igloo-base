import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { buttonVariants } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 px-6 text-center">
      <BrandLogo />
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Nueva herramienta Igloo</h1>
        <p className="text-muted-foreground">
          Base lista para construir la próxima herramienta.
        </p>
      </div>
      <Link href="/login" className={buttonVariants()}>
        Iniciar sesión
      </Link>
    </main>
  )
}
