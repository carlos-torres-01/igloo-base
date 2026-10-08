import { AppSidebar } from "@/components/app-sidebar"
import { Reveal } from "@/components/motion/reveal"
import { RouteTransition } from "@/components/motion/route-transition"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { requireUser } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = await requireUser()

  return (
    <Reveal direction="none" className="min-h-svh">
      <SidebarProvider>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:p-3 focus:ring-2 focus:ring-ring"
        >
          Saltar al contenido
        </a>
        <AppSidebar role={profile.role} />
        <SidebarInset>
          <div className="flex h-14 items-center px-4 md:px-6">
            <SidebarTrigger aria-label="Alternar menú de navegación" />
          </div>
          <div
            id="contenido"
            tabIndex={-1}
            className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8 md:py-10"
          >
            <RouteTransition enterOnMount={false}>{children}</RouteTransition>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Reveal>
  )
}
