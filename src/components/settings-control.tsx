"use client"

import { useState } from "react"
import Link from "next/link"
import { LogOut, UserRound, Settings2 } from "lucide-react"

import { AppearanceSettings } from "@/components/appearance-control"
import { IconTooltip } from "@/components/icon-tooltip"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { logoutAction } from "@/features/auth/actions"

export function SettingsControl() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
      <IconTooltip label="Configuración">
        <PopoverTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Configuración" />
          }
        >
          <Settings2 aria-hidden="true" />
        </PopoverTrigger>
      </IconTooltip>
      <PopoverContent
        align="end"
        className="max-h-[calc(100svh-2rem)] gap-3 overflow-y-auto p-3 ring-0"
      >
        <PopoverHeader>
          <PopoverTitle>Configuración</PopoverTitle>
        </PopoverHeader>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          nativeButton={false}
          render={<Link href="/cuenta" />}
          onClick={() => setSettingsOpen(false)}
        >
          <UserRound aria-hidden="true" />
          Mi cuenta
        </Button>
        <Separator />
        <AppearanceSettings />
        <Separator />
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            <LogOut aria-hidden="true" />
            Cerrar sesión
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
