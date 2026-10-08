"use client"

import { useState, useTransition, type FormEvent } from "react"

import { AnimatedAlert } from "@/components/motion/animated-alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changePasswordAction } from "@/features/auth/change-password-action"

export function ChangePasswordForm() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
    <form onSubmit={onSubmit} className="max-w-md space-y-5">
      <AnimatedAlert message={error} variant="destructive" />
      <AnimatedAlert message={message} />
      <div className="space-y-2">
        <Label htmlFor="new-password">Nueva contraseña</Label>
        <Input id="new-password" name="password" type="password" autoComplete="new-password" minLength={12} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar contraseña</Label>
        <Input id="confirm-password" name="confirmation" type="password" autoComplete="new-password" minLength={12} required />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Cambiar contraseña"}</Button>
    </form>
  )
}
