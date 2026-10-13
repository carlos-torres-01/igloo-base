"use client"

import { useState, useTransition, type FormEvent } from "react"
import { LockKeyhole } from "lucide-react"

import { AnimatedAlert } from "@/components/motion/animated-alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { changePasswordAction } from "@/features/auth/change-password-action"

export function ChangePasswordForm() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setMessage(undefined)
    const form = event.currentTarget
    const values = new FormData(form)
    const password = String(values.get("password") ?? "")
    if (password !== values.get("confirmation")) {
      setError("Las contraseñas no coinciden.")
      return
    }
    setError(undefined)
    setMessage(undefined)
    startTransition(async () => {
      const result = await changePasswordAction(password)
      if (!result.ok) {
        setError(result.message)
        return
      }
      form.reset()
      setMessage(result.message)
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-busy={pending}
      className="flex max-w-md flex-col gap-5"
    >
      <AnimatedAlert message={error} variant="destructive" />
      <AnimatedAlert message={message} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="new-password">Nueva contraseña</FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start" aria-hidden="true">
              <LockKeyhole />
            </InputGroupAddon>
            <InputGroupInput
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              disabled={pending}
              required
            />
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">
            Confirmar contraseña
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start" aria-hidden="true">
              <LockKeyhole />
            </InputGroupAddon>
            <InputGroupInput
              id="confirm-password"
              name="confirmation"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              disabled={pending}
              required
            />
          </InputGroup>
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  )
}
