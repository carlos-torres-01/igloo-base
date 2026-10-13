"use client"

import { useState, useTransition, type FormEvent } from "react"
import { Eye, EyeOff, LockKeyhole } from "lucide-react"

import { AnimatedAlert } from "@/components/motion/animated-alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { changePasswordAction } from "@/features/auth/change-password-action"

export function ChangePasswordForm() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

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
      setShowPassword(false)
      setShowConfirmation(false)
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
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              disabled={pending}
              required
            />
            <InputGroupAddon align="inline-end" className="pr-2">
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" />
                ) : (
                  <Eye aria-hidden="true" />
                )}
              </InputGroupButton>
            </InputGroupAddon>
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
              type={showConfirmation ? "text" : "password"}
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              disabled={pending}
              required
            />
            <InputGroupAddon align="inline-end" className="pr-2">
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={
                  showConfirmation ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={() => setShowConfirmation(!showConfirmation)}
              >
                {showConfirmation ? (
                  <EyeOff aria-hidden="true" />
                ) : (
                  <Eye aria-hidden="true" />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  )
}
