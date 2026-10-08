"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Pencil, UserRound } from "lucide-react"

import { IconTooltip } from "@/components/icon-tooltip"
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
import { updateUserAction } from "@/features/users/actions"

type UserRole = "admin" | "user"

export function EditUserDialog({
  profile,
  isCurrentUser,
}: {
  profile: {
    id: string
    full_name: string | null
    email: string
    role: string
    is_active: boolean
  }

  isCurrentUser: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const [confirming, setConfirming] = useState(false)
  const [fullName, setFullName] = useState(profile.full_name ?? "")
  const [role, setRole] = useState<UserRole>(profile.role as UserRole)
  const [isActive, setIsActive] = useState(profile.is_active)

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setError(undefined)
      setConfirming(false)
      setFullName(profile.full_name ?? "")
      setRole(profile.role as UserRole)
      setIsActive(profile.is_active)
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    setConfirming(true)
  }

  function save() {
    startTransition(async () => {
      const result = await updateUserAction({
        userId: profile.id,
        fullName,
        role,
        isActive,
      })
      if (!result.ok) {
        setError(result.message)
        setConfirming(false)
        return
      }
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <IconTooltip label="Editar usuario">
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Editar usuario"
            />
          }
        >
          <Pencil aria-hidden="true" />
        </DialogTrigger>
      </IconTooltip>
      <DialogContent>
        {confirming ? (
          <div className="space-y-5">
            <DialogHeader>
              <DialogTitle>Confirmar cambios de acceso</DialogTitle>
              <DialogDescription>
                Los cambios en el rol y el estado tendrán efecto inmediato.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{fullName}</p>
              <p className="text-muted-foreground">{profile.email}</p>
              <p>
                {role === "admin" ? "Administrador" : "Usuario"} ·{" "}
                {isActive ? "Activo" : "Inactivo"}
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirming(false)}
                disabled={pending}
              >
                Volver
              </Button>
              <Button type="button" onClick={save} disabled={pending}>
                {pending ? "Guardando…" : "Confirmar cambios"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Editar usuario</DialogTitle>
              <DialogDescription>{profile.email}</DialogDescription>
            </DialogHeader>
            <AnimatedAlert message={error} variant="destructive" />
            <div className="space-y-2">
              <Label htmlFor={`name-${profile.id}`}>
                <UserRound className="size-3.5 text-muted-foreground" /> Nombre
              </Label>
              <Input
                id={`name-${profile.id}`}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                minLength={2}
                maxLength={120}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={role}
                onValueChange={(value) => {
                  if (value === "admin" || value === "user") setRole(value)
                }}
                disabled={isCurrentUser}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {role === "admin" ? "Administrador" : "Usuario"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={isActive ? "active" : "inactive"}
                onValueChange={(value) => setIsActive(value === "active")}
                disabled={isCurrentUser}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{isActive ? "Activo" : "Inactivo"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              {isCurrentUser ? (
                <p className="text-xs text-muted-foreground">
                  No puedes cambiar tu propio rol ni desactivar tu cuenta.
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
