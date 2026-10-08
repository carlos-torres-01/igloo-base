import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { Reveal } from "@/components/motion/reveal"
import { RouteTransition } from "@/components/motion/route-transition"
import { motionDuration } from "@/components/motion/transitions"
import { LoginForm } from "@/features/auth/login-form"

export const metadata: Metadata = { title: "Ingresar" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="grid min-h-svh place-items-center px-6 py-12">
      <RouteTransition enter={false} exitDuration={motionDuration.feedback}>
        <div className="w-full max-w-sm space-y-8">
          <Reveal delay={0.04}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver al inicio
            </Link>
          </Reveal>
          <Reveal delay={0.12} className="space-y-3">
            <h1>
              <BrandLogo />
            </h1>
            <p className="text-sm text-muted-foreground">
              Ingresa para usar la herramienta.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <LoginForm initialError={error} />
          </Reveal>
        </div>
      </RouteTransition>
    </main>
  )
}
