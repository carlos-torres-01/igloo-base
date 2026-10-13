"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Moon, Palette, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

const accents = [
  { name: "red", label: "Rojo", swatch: "#e11d48" },
  { name: "orange", label: "Naranja", swatch: "#d97706" },
  { name: "green", label: "Verde", swatch: "#65a30d" },
  { name: "cyan", label: "Turquesa", swatch: "#0891b2" },
  { name: "blue", label: "Azul", swatch: "#2563eb" },
  { name: "violet", label: "Violeta", swatch: "#512da8" },
] as const

type AccentName = (typeof accents)[number]["name"]
const ACCENT_STORAGE_KEY = "igloo-accent"
const ACCENT_CHANGE_EVENT = "igloo-accent-change"

function isAccentName(value: string | null | undefined): value is AccentName {
  return accents.some((accent) => accent.name === value)
}

function getAccentSnapshot(): AccentName {
  const currentAccent = document.documentElement.dataset.accent
  return isAccentName(currentAccent) ? currentAccent : "violet"
}

function subscribeToAccent(onChange: () => void) {
  window.addEventListener(ACCENT_CHANGE_EVENT, onChange)
  return () => window.removeEventListener(ACCENT_CHANGE_EVENT, onChange)
}

function notifyAccentChange() {
  window.dispatchEvent(new Event(ACCENT_CHANGE_EVENT))
}

function initializeAccent() {
  const savedAccent = window.localStorage.getItem(ACCENT_STORAGE_KEY)
  document.documentElement.dataset.accent = isAccentName(savedAccent)
    ? savedAccent
    : "violet"
  notifyAccentChange()
}

function saveAccent(nextAccent: AccentName) {
  window.localStorage.setItem(ACCENT_STORAGE_KEY, nextAccent)
  document.documentElement.dataset.accent = nextAccent
  notifyAccentChange()
}

export function AppearanceControl() {
  const { resolvedTheme, setTheme } = useTheme()
  const accent = useSyncExternalStore(
    subscribeToAccent,
    getAccentSnapshot,
    () => "violet"
  )

  useEffect(() => {
    initializeAccent()
  }, [])

  function selectAccent(nextAccent: AccentName) {
    saveAccent(nextAccent)
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Apariencia">
            <Palette aria-hidden="true" />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-fit min-w-0 gap-3 p-3 ring-0">
        <PopoverHeader>
          <PopoverTitle>Apariencia</PopoverTitle>
        </PopoverHeader>

        <section className="flex flex-col gap-2" aria-labelledby="theme-label">
          <h3
            id="theme-label"
            className="text-xs font-medium text-muted-foreground"
          >
            Tema
          </h3>
          <div className="flex gap-1" role="group" aria-label="Tema">
            <Button
              type="button"
              variant={resolvedTheme === "light" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-pressed={resolvedTheme === "light"}
              aria-label="Tema claro"
              title="Tema claro"
              onClick={() => setTheme("light")}
            >
              <Sun aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant={resolvedTheme === "dark" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-pressed={resolvedTheme === "dark"}
              aria-label="Tema oscuro"
              title="Tema oscuro"
              onClick={() => setTheme("dark")}
            >
              <Moon aria-hidden="true" />
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-2" aria-labelledby="accent-label">
          <h3
            id="accent-label"
            className="text-xs font-medium text-muted-foreground"
          >
            Color principal
          </h3>
          <div
            className="flex items-center gap-1"
            role="group"
            aria-label="Color principal"
          >
            {accents.map((option) => (
              <Button
                key={option.name}
                type="button"
                variant={accent === option.name ? "secondary" : "ghost"}
                size="icon-sm"
                aria-pressed={accent === option.name}
                aria-label={option.label}
                title={option.label}
                onClick={() => selectAccent(option.name)}
              >
                <span
                  aria-hidden="true"
                  className="size-5 rounded-full"
                  style={{ backgroundColor: option.swatch }}
                />
              </Button>
            ))}
          </div>
        </section>
      </PopoverContent>
    </Popover>
  )
}
