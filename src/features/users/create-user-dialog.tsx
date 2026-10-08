"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  Check,
  Copy,
  Eye,
  EyeOff,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createUserAction } from "@/features/users/actions"
import { generatePassword } from "@/lib/security/password"

type UserRole = "admin" | "user"

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
        <Plus /> Nuevo usuario
      </DialogTrigger>
      <DialogContent>
        {createdEmail ? (
          <div className="space-y-5">
            <DialogHeader>
              <DialogTitle>Usuario creado</DialogTitle>
              <DialogDescription>
                {createdEmail} ya puede iniciar sesión. Guarda la contraseña
                antes de cerrar: no volverá a mostrarse.
              </DialogDescription>
            </DialogHeader>
            <AnimatedAlert message={error} variant="destructive" />
            <div className="space-y-2">
              <Label htmlFor="created-password">Contraseña inicial</Label>
              <div className="flex gap-2">
                <Input
                  id="created-password"
                  value={password}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyPassword}
                  aria-label="Copiar contraseña"
                >
                  {copied ? <Check /> : <Copy />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Compártela por un canal seguro. El usuario puede cambiarla en Mi
                cuenta.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Listo
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Nuevo usuario</DialogTitle>
              <DialogDescription>
                Define el rol del nuevo usuario.
              </DialogDescription>
            </DialogHeader>
            <AnimatedAlert message={error} variant="destructive" />
            <div className="space-y-2">
              <Label htmlFor="user-name">
                <UserRound className="size-3.5 text-muted-foreground" /> Nombre
              </Label>
              <Input
                id="user-name"
                name="fullName"
                required
                minLength={2}
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">
                <Mail className="size-3.5 text-muted-foreground" /> Correo
              </Label>
              <Input
                id="user-email"
                name="email"
                type="email"
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={role}
                onValueChange={(value) => {
                  if (value === "admin" || value === "user") {
                    setRole(value)
                    setAdminConfirmed(false)
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {role === "admin" ? "Administrador" : "Usuario"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              {role === "admin" ? (
                <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={adminConfirmed}
                    onChange={(event) =>
                      setAdminConfirmed(event.target.checked)
                    }
                    className="mt-0.5 size-4 accent-foreground"
                  />
                  Confirmo que tendrá acceso a la gestión de usuarios.
                </label>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">Contraseña inicial</Label>
              <div className="flex gap-2">
                <Input
                  id="user-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={12}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setPassword(generatePassword())
                  setShowPassword(true)
                }}
              >
                <RefreshCw /> Generar contraseña
              </Button>
            </div>
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
