import type { Metadata } from "next"
import { Geist_Mono, Poppins } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MotionProvider } from "@/components/motion/motion-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Igloo",
    template: "%s · Igloo",
  },
  description: "Base para herramientas Igloo.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        poppins.variable
      )}
      data-accent="violet"
      data-density="normal"
      data-corner-style="rounded"
    >
      <body className="min-h-svh">
        <ThemeProvider>
          <TooltipProvider delay={0}>
            <MotionProvider>{children}</MotionProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
