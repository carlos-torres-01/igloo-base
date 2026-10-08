"use client"

import { Trash2, X } from "lucide-react"

import { IconTooltip } from "@/components/icon-tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function ConfirmDeleteButton({
  className,
  description,
  disabled,
  icon = "trash",
  label,
  onConfirm,
  size = "icon-sm",
  stopPropagation = false,
}: {
  className?: string
  description?: string
  disabled?: boolean
  icon?: "trash" | "x"
  label: string
  onConfirm: () => void
  size?: "icon-xs" | "icon-sm" | "icon"
  stopPropagation?: boolean
}) {
  const actionLabel = `Eliminar ${label}`

  return (
    <AlertDialog>
      <IconTooltip label={actionLabel}>
        <AlertDialogTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size={size}
              className={className}
              aria-label={actionLabel}
              disabled={disabled}
              onPointerDown={
                stopPropagation ? (event) => event.stopPropagation() : undefined
              }
              onClick={
                stopPropagation ? (event) => event.stopPropagation() : undefined
              }
            />
          }
        >
          {icon === "x" ? (
            <X aria-hidden="true" />
          ) : (
            <Trash2 aria-hidden="true" />
          )}
        </AlertDialogTrigger>
      </IconTooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿{actionLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? "Esta acción no se puede deshacer."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
