"use client"

import { useState, type FormEvent } from "react"
import { KeyRound, Mail } from "lucide-react"

import { AnimatedAlert } from "@/components/motion/animated-alert"
import { useTransitionRouter } from "@/components/motion/route-transition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useTransitionRouter()
  const [error, setError] = useState(initialError)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setPending(true)
    setError(undefined)

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(event.currentTarget),
        credentials: "same-origin",
      })
      const result = (await response.json()) as {
        ok: boolean
        message?: string
      }

      if (!response.ok || !result.ok) {
        setError(result.message ?? "No se pudo iniciar sesión.")
        setPending(false)
        return
      }

      await router.push("/inicio")
    } catch {
      setError("No se pudo iniciar sesión. Inténtalo de nuevo.")
      setPending(false)
    }
  }

  return (
    <form
      action="/auth/login"
      method="post"
      onSubmit={handleSubmit}
      aria-busy={pending}
      className="space-y-5"
    >
      <AnimatedAlert message={error} variant="destructive" />

      <div className="space-y-2">
        <Label htmlFor="email">
          <Mail className="size-3.5 text-muted-foreground" aria-hidden="true" />
          Correo
        </Label>
        <Input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nombre@empresa.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          <KeyRound
            className="size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  )
}
