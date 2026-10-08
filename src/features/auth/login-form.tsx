"use client"

import { useState, type FormEvent } from "react"

import { AnimatedAlert } from "@/components/motion/animated-alert"
import { useTransitionRouter } from "@/components/motion/route-transition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

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
      className="flex flex-col gap-5"
    >
      <AnimatedAlert message={error} variant="destructive" />

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Correo</FieldLabel>
          <Input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            spellCheck={false}
            disabled={pending}
            placeholder="nombre@empresa.com"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            maxLength={128}
            disabled={pending}
            required
          />
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  )
}
