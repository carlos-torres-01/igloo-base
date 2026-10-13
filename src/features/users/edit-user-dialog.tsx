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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
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
import { updateUserAction } from "@/features/users/actions"

import type { UserRole, UserProfile } from "@/types/profiles"

export function EditUserDialog({
  profile,
  isCurrentUser,
}: {
  profile: UserProfile

  isCurrentUser: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const [confirming, setConfirming] = useState(false)
  const [fullName, setFullName] = useState(profile.full_name ?? "")
  const [role, setRole] = useState<UserRole>(profile.role)
  const [isActive, setIsActive] = useState(profile.is_active)

  function onOpenChange(nextOpen: boolean) {
    if (pending) return
    setOpen(nextOpen)
    if (nextOpen) {
      setError(undefined)
      setConfirming(false)
      setFullName(profile.full_name ?? "")
      setRole(profile.role)
      setIsActive(profile.is_active)
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    setConfirming(true)
  }

  function save() {
    if (pending) return
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
      setOpen(false)
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
          <div aria-busy={pending} className="flex flex-col gap-5">
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
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle>Editar usuario</DialogTitle>
              <DialogDescription>{profile.email}</DialogDescription>
            </DialogHeader>
            <AnimatedAlert message={error} variant="destructive" />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`name-${profile.id}`}>Nombre</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start" aria-hidden="true">
                    <UserRound />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={`name-${profile.id}`}
                    name="fullName"
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    minLength={2}
                    maxLength={120}
                    required
                  />
                </InputGroup>
              </Field>
              <Field data-disabled={isCurrentUser}>
                <FieldLabel htmlFor={`role-${profile.id}`}>Rol</FieldLabel>
                <Select
                  value={role}
                  name="role"
                  onValueChange={(value) => {
                    if (value === "admin" || value === "user") setRole(value)
                  }}
                  disabled={isCurrentUser}
                >
                  <SelectTrigger id={`role-${profile.id}`} className="w-full">
                    <SelectValue>
                      {role === "admin" ? "Administrador" : "Usuario"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="user">Usuario</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field data-disabled={isCurrentUser}>
                <FieldLabel htmlFor={`status-${profile.id}`}>Estado</FieldLabel>
                <Select
                  value={isActive ? "active" : "inactive"}
                  name="status"
                  onValueChange={(value) => setIsActive(value === "active")}
                  disabled={isCurrentUser}
                >
                  <SelectTrigger id={`status-${profile.id}`} className="w-full">
                    <SelectValue>
                      {isActive ? "Activo" : "Inactivo"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {isCurrentUser ? (
                  <p className="text-xs text-muted-foreground">
                    No puedes cambiar tu propio rol ni desactivar tu cuenta.
                  </p>
                ) : null}
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
