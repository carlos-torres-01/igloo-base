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

export function AppSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const navigation = [{ href: "/inicio", label: "Inicio", icon: House }]
  if (role === "admin")
    navigation.push({ href: "/usuarios", label: "Usuarios", icon: UsersRound })
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5 group-data-[collapsible=icon]:px-2">
        <Link
          href="/inicio"
          aria-label="Igloo, ir al inicio"
          className="flex h-16 items-center justify-center pr-6 group-data-[collapsible=icon]:pr-0"
        >
          <BrandLogo className="group-data-[collapsible=icon]:hidden" />
          <span
            className="hidden items-center justify-center group-data-[collapsible=icon]:inline-flex"
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
                    render={<Link href={item.href} />}
                    isActive={pathname.startsWith(item.href)}
                    aria-current={
                      pathname.startsWith(item.href) ? "page" : undefined
                    }
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
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
              render={<Link href="/cuenta" />}
              aria-label="Mi cuenta"
              aria-current={pathname === "/cuenta" ? "page" : undefined}
              isActive={pathname === "/cuenta"}
              tooltip="Mi cuenta"
            >
              <UserRound aria-hidden="true" />
              <span className="group-data-[collapsible=icon]:hidden">
                Mi cuenta
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={logoutAction}>
              <SidebarMenuButton
                type="submit"
                aria-label="Cerrar sesión"
                tooltip="Cerrar sesión"
              >
                <LogOut aria-hidden="true" />
                <span className="group-data-[collapsible=icon]:hidden">
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
