"use client"

import { IconTooltip } from "@/components/icon-tooltip"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

export function NavigationTrigger() {
  const { open, openMobile, isMobile } = useSidebar()
  const label = (isMobile ? openMobile : open)
    ? "Cerrar navegación"
    : "Abrir navegación"

  return (
    <IconTooltip label={label}>
      <SidebarTrigger aria-label={label} />
    </IconTooltip>
  )
}
