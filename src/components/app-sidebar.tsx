"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { House, LogOut, UserRound, UsersRound } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { logoutAction } from "@/features/auth/actions"
import type { UserRole } from "@/types/profiles"

const menuButtonTransitionClassName =
  "transition-[width,padding,gap] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[collapsible=icon]:h-9! group-data-[collapsible=icon]:w-8! group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-2!"

const menuLabelTransitionClassName =
  "min-w-0 max-w-32 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-150 ease-out group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0"

export function AppSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const navigation = [{ href: "/inicio", label: "Inicio", icon: House }]
  if (role === "admin")
    navigation.push({ href: "/usuarios", label: "Usuarios", icon: UsersRound })
  return (
    <Sidebar
      collapsible="icon"
      className="group-data-[side=left]:border-r-0"
    >
      <SidebarHeader className="px-4 py-5 group-data-[collapsible=icon]:px-2">
        <Link
          href="/inicio"
          aria-label="Igloo, ir al inicio"
          className="relative flex h-16 items-center justify-center pr-6 transition-[padding] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[collapsible=icon]:pr-0"
        >
          <span
            aria-hidden="true"
            className="max-w-36 overflow-hidden transition-[max-width,opacity] duration-150 ease-out group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0"
          >
            <BrandLogo />
          </span>
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 ease-out group-data-[collapsible=icon]:opacity-100"
            aria-hidden="true"
          >
            <Image
              src="/brand/igloo-mark.webp"
              alt=""
              width={25}
              height={104}
              unoptimized
              className="h-8 w-auto"
            />
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    className={menuButtonTransitionClassName}
                    render={<Link href={item.href} />}
                    isActive={pathname.startsWith(item.href)}
                    aria-current={
                      pathname.startsWith(item.href) ? "page" : undefined
                    }
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span className={menuLabelTransitionClassName}>
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={menuButtonTransitionClassName}
              render={<Link href="/cuenta" />}
              aria-label="Mi cuenta"
              aria-current={pathname === "/cuenta" ? "page" : undefined}
              isActive={pathname === "/cuenta"}
              tooltip="Mi cuenta"
            >
              <UserRound aria-hidden="true" />
              <span className={menuLabelTransitionClassName}>Mi cuenta</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={logoutAction}>
              <SidebarMenuButton
                className={menuButtonTransitionClassName}
                type="submit"
                aria-label="Cerrar sesión"
                tooltip="Cerrar sesión"
              >
                <LogOut aria-hidden="true" />
                <span className={menuLabelTransitionClassName}>
                  Cerrar sesión
                </span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
