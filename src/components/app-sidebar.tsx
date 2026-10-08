"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { House, LogOut, UserRound, UsersRound } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { Button, buttonVariants } from "@/components/ui/button"
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
        <Link href="/inicio" aria-label="Igloo">
          <BrandLogo className="group-data-[collapsible=icon]:hidden" />
          <span className="hidden text-2xl font-black text-foreground group-data-[collapsible=icon]:block">
            i
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
      <SidebarFooter className="p-3">
        <Link
          href="/cuenta"
          aria-label="Mi cuenta"
          aria-current={pathname === "/cuenta" ? "page" : undefined}
          className={buttonVariants({
            variant: "ghost",
            className: "w-full justify-start",
          })}
        >
          <UserRound />
          <span className="group-data-[collapsible=icon]:hidden">
            Mi cuenta
          </span>
        </Link>
        <form action={logoutAction}>
          <Button
            type="submit"
            aria-label="Cerrar sesión"
            variant="ghost"
            className="w-full justify-start"
          >
            <LogOut />
            <span className="group-data-[collapsible=icon]:hidden">
              Cerrar sesión
            </span>
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
