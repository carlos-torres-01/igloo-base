"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Plus,
  RefreshCw,
  UserRound,
} from "lucide-react"

import { AnimatedAlert } from "@/components/motion/animated-alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createUserAction } from "@/features/users/actions"
import { generatePassword } from "@/lib/security/password"

import type { UserRole } from "@/types/profiles"

export function CreateUserDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const [role, setRole] = useState<UserRole>("user")
  const [adminConfirmed, setAdminConfirmed] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [createdEmail, setCreatedEmail] = useState<string>()
  const [copied, setCopied] = useState(false)

  function onOpenChange(nextOpen: boolean) {
    if (pending) return
    setOpen(nextOpen)
    if (!nextOpen) {
      if (createdEmail) router.refresh()
      setError(undefined)
      setRole("user")
      setAdminConfirmed(false)
      setPassword("")
      setShowPassword(false)
      setCreatedEmail(undefined)
      setCopied(false)
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    if (role === "admin" && !adminConfirmed) {
      setError(
        "Confirma que el nuevo usuario tendrá acceso administrativo completo."
      )
      return
    }
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "")
    setError(undefined)
    startTransition(async () => {
      const result = await createUserAction({
        fullName: formData.get("fullName"),
        email,
        password,
        role,
      })
      if (!result.ok) {
        setError(result.message)
        router.refresh()
        return
      }
      setCreatedEmail(email)
    })
  }

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setError(undefined)
    } catch {
      setError(
        "No se pudo copiar. Selecciona la contraseña y cópiala manualmente."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus data-icon="inline-start" /> Nuevo usuario
      </DialogTrigger>
      <DialogContent>
        {createdEmail ? (
          <div className="flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle>Usuario creado</DialogTitle>
              <DialogDescription>
                {createdEmail} ya puede iniciar sesión. Guarda la contraseña
                antes de cerrar: no volverá a mostrarse.
              </DialogDescription>
            </DialogHeader>
            <AnimatedAlert message={error} variant="destructive" />
            <Field>
              <FieldLabel htmlFor="created-password">
                Contraseña inicial
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start" aria-hidden="true">
                  <KeyRound />
                </InputGroupAddon>
                <InputGroupInput
                  id="created-password"
                  value={password}
                  readOnly
                  className="font-mono"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    variant="outline"
                    size="icon-sm"
                    onClick={copyPassword}
                    aria-label="Copiar contraseña"
                  >
                    {copied ? (
                      <Check aria-hidden="true" />
                    ) : (
                      <Copy aria-hidden="true" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <p className="text-xs text-muted-foreground">
                Compártela por un canal seguro. El usuario puede cambiarla en Mi
                cuenta.
              </p>
            </Field>
            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Listo
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            aria-busy={pending}
            className="flex flex-col gap-5"
          >
            <DialogHeader>
              <DialogTitle>Nuevo usuario</DialogTitle>
              <DialogDescription>
                Define el rol del nuevo usuario.
              </DialogDescription>
            </DialogHeader>
            <AnimatedAlert message={error} variant="destructive" />
            <FieldSet disabled={pending}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="user-name">Nombre</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start" aria-hidden="true">
                      <UserRound />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="user-name"
                      name="fullName"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={120}
                    />
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel htmlFor="user-email">Correo</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start" aria-hidden="true">
                      <Mail />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="user-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      spellCheck={false}
                      required
                    />
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel htmlFor="user-role">Rol</FieldLabel>
                  <Select
                    value={role}
                    name="role"
                    disabled={pending}
                    onValueChange={(value) => {
                      if (value === "admin" || value === "user") {
                        setRole(value)
                        setAdminConfirmed(false)
                      }
                    }}
                  >
                    <SelectTrigger id="user-role" className="w-full">
                      <SelectValue>
                        {role === "admin" ? "Administrador" : "Usuario"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {role === "admin" ? (
                    <Field orientation="horizontal">
                      <Checkbox
                        id="confirm-admin"
                        checked={adminConfirmed}
                        onCheckedChange={setAdminConfirmed}
                        disabled={pending}
                      />
                      <FieldLabel htmlFor="confirm-admin">
                        Confirmo que tendrá acceso a la gestión de usuarios.
                      </FieldLabel>
                    </Field>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel htmlFor="user-password">
                    Contraseña inicial
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start" aria-hidden="true">
                      <LockKeyhole />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="user-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={12}
                      maxLength={128}
                      required
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        variant="outline"
                        size="icon-sm"
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPassword(generatePassword())
                      setShowPassword(true)
                    }}
                  >
                    <RefreshCw data-icon="inline-start" /> Generar contraseña
                  </Button>
                </Field>
              </FieldGroup>
            </FieldSet>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Creando…" : "Crear usuario"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
