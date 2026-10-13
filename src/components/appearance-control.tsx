"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Moon, Palette, Rows2, Rows3, Rows4, Sun } from "lucide-react"

import { IconTooltip } from "@/components/icon-tooltip"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

const accents = [
  { name: "neutral", label: "Neutro", swatch: "#171717" },
  { name: "red", label: "Rojo", swatch: "#e11d48" },
  { name: "orange", label: "Naranja", swatch: "#d97706" },
  { name: "green", label: "Verde", swatch: "#65a30d" },
  { name: "cyan", label: "Turquesa", swatch: "#0891b2" },
  { name: "blue", label: "Azul", swatch: "#2563eb" },
  { name: "violet", label: "Violeta", swatch: "#512da8" },
] as const

type AccentName = (typeof accents)[number]["name"]
const densities = [
  { name: "compact", label: "Compacto", icon: Rows4 },
  { name: "normal", label: "Normal", icon: Rows3 },
  { name: "spacious", label: "Amplio", icon: Rows2 },
] as const

type DensityName = (typeof densities)[number]["name"]
const cornerStyles = [
  { name: "rounded", label: "Redondeado", radius: "0.625rem" },
  { name: "soft", label: "Suave", radius: "0.375rem" },
  { name: "straight", label: "Recto", radius: "0px" },
] as const

type CornerStyleName = (typeof cornerStyles)[number]["name"]
const ACCENT_STORAGE_KEY = "igloo-accent"
const ACCENT_CHANGE_EVENT = "igloo-accent-change"
const DENSITY_STORAGE_KEY = "igloo-density"
const DENSITY_CHANGE_EVENT = "igloo-density-change"
const CORNER_STYLE_STORAGE_KEY = "igloo-corner-style"
const CORNER_STYLE_CHANGE_EVENT = "igloo-corner-style-change"

function isAccentName(value: string | null | undefined): value is AccentName {
  return accents.some((accent) => accent.name === value)
}

function isDensityName(value: string | null | undefined): value is DensityName {
  return densities.some((density) => density.name === value)
}

function isCornerStyleName(
  value: string | null | undefined
): value is CornerStyleName {
  return cornerStyles.some((cornerStyle) => cornerStyle.name === value)
}

function getAccentSnapshot(): AccentName {
  const currentAccent = document.documentElement.dataset.accent
  return isAccentName(currentAccent) ? currentAccent : "neutral"
}

function subscribeToAccent(onChange: () => void) {
  window.addEventListener(ACCENT_CHANGE_EVENT, onChange)
  return () => window.removeEventListener(ACCENT_CHANGE_EVENT, onChange)
}

function notifyAccentChange() {
  window.dispatchEvent(new Event(ACCENT_CHANGE_EVENT))
}

function saveAccent(nextAccent: AccentName) {
  window.localStorage.setItem(ACCENT_STORAGE_KEY, nextAccent)
  document.documentElement.dataset.accent = nextAccent
  notifyAccentChange()
}

function getDensitySnapshot(): DensityName {
  const currentDensity = document.documentElement.dataset.density
  return isDensityName(currentDensity) ? currentDensity : "normal"
}

function subscribeToDensity(onChange: () => void) {
  window.addEventListener(DENSITY_CHANGE_EVENT, onChange)
  return () => window.removeEventListener(DENSITY_CHANGE_EVENT, onChange)
}

function notifyDensityChange() {
  window.dispatchEvent(new Event(DENSITY_CHANGE_EVENT))
}

function initializeAppearance() {
  const savedAccent = window.localStorage.getItem(ACCENT_STORAGE_KEY)
  const savedDensity = window.localStorage.getItem(DENSITY_STORAGE_KEY)
  const savedCornerStyle = window.localStorage.getItem(CORNER_STYLE_STORAGE_KEY)

  document.documentElement.dataset.accent = isAccentName(savedAccent)
    ? savedAccent
    : "neutral"
  document.documentElement.dataset.density = isDensityName(savedDensity)
    ? savedDensity
    : "normal"
  document.documentElement.dataset.cornerStyle = isCornerStyleName(
    savedCornerStyle
  )
    ? savedCornerStyle
    : "rounded"

  notifyAccentChange()
  notifyDensityChange()
  notifyCornerStyleChange()
}

function saveDensity(nextDensity: DensityName) {
  window.localStorage.setItem(DENSITY_STORAGE_KEY, nextDensity)
  document.documentElement.dataset.density = nextDensity
  notifyDensityChange()
}

function getCornerStyleSnapshot(): CornerStyleName {
  const currentCornerStyle = document.documentElement.dataset.cornerStyle
  return isCornerStyleName(currentCornerStyle) ? currentCornerStyle : "rounded"
}

function subscribeToCornerStyle(onChange: () => void) {
  window.addEventListener(CORNER_STYLE_CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CORNER_STYLE_CHANGE_EVENT, onChange)
}

function notifyCornerStyleChange() {
  window.dispatchEvent(new Event(CORNER_STYLE_CHANGE_EVENT))
}

function saveCornerStyle(nextCornerStyle: CornerStyleName) {
  window.localStorage.setItem(CORNER_STYLE_STORAGE_KEY, nextCornerStyle)
  document.documentElement.dataset.cornerStyle = nextCornerStyle
  notifyCornerStyleChange()
}

export function AppearanceControl() {
  const { resolvedTheme, setTheme } = useTheme()
  const accent = useSyncExternalStore(
    subscribeToAccent,
    getAccentSnapshot,
    () => "neutral"
  )
  const density = useSyncExternalStore(
    subscribeToDensity,
    getDensitySnapshot,
    () => "normal"
  )
  const cornerStyle = useSyncExternalStore(
    subscribeToCornerStyle,
    getCornerStyleSnapshot,
    () => "rounded"
  )

  useEffect(() => {
    initializeAppearance()
  }, [])

  function selectAccent(nextAccent: AccentName) {
    saveAccent(nextAccent)
  }

  function selectDensity(nextDensity: DensityName) {
    saveDensity(nextDensity)
  }

  function selectCornerStyle(nextCornerStyle: CornerStyleName) {
    saveCornerStyle(nextCornerStyle)
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
            <IconTooltip label="Claro">
              <Button
                type="button"
                variant={resolvedTheme === "light" ? "secondary" : "ghost"}
                size="icon-sm"
                aria-pressed={resolvedTheme === "light"}
                aria-label="Claro"
                onClick={() => setTheme("light")}
              >
                <Sun aria-hidden="true" />
              </Button>
            </IconTooltip>
            <IconTooltip label="Oscuro">
              <Button
                type="button"
                variant={resolvedTheme === "dark" ? "secondary" : "ghost"}
                size="icon-sm"
                aria-pressed={resolvedTheme === "dark"}
                aria-label="Oscuro"
                onClick={() => setTheme("dark")}
              >
                <Moon aria-hidden="true" />
              </Button>
            </IconTooltip>
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
              <IconTooltip key={option.name} label={option.label}>
                <Button
                  type="button"
                  variant={accent === option.name ? "secondary" : "ghost"}
                  size="icon-sm"
                  aria-pressed={accent === option.name}
                  aria-label={option.label}
                  onClick={() => selectAccent(option.name)}
                >
                  <span
                    aria-hidden="true"
                    className="size-5 rounded-full border border-foreground/15"
                    style={{ backgroundColor: option.swatch }}
                  />
                </Button>
              </IconTooltip>
            ))}
          </div>
        </section>

        <section
          className="flex flex-col gap-2"
          aria-labelledby="density-label"
        >
          <h3
            id="density-label"
            className="text-xs font-medium text-muted-foreground"
          >
            Espaciado
          </h3>
          <div className="flex gap-1" role="group" aria-label="Espaciado">
            {densities.map((option) => (
              <IconTooltip key={option.name} label={option.label}>
                <Button
                  type="button"
                  variant={density === option.name ? "secondary" : "ghost"}
                  size="icon-sm"
                  aria-pressed={density === option.name}
                  aria-label={option.label}
                  onClick={() => selectDensity(option.name)}
                >
                  <option.icon aria-hidden="true" />
                </Button>
              </IconTooltip>
            ))}
          </div>
        </section>
        <section
          className="flex flex-col gap-2"
          aria-labelledby="corner-style-label"
        >
          <h3
            id="corner-style-label"
            className="text-xs font-medium text-muted-foreground"
          >
            Bordes
          </h3>
          <div className="flex gap-1" role="group" aria-label="Bordes">
            {cornerStyles.map((option) => (
              <IconTooltip key={option.name} label={option.label}>
                <Button
                  type="button"
                  variant={cornerStyle === option.name ? "secondary" : "ghost"}
                  size="icon-sm"
                  aria-pressed={cornerStyle === option.name}
                  aria-label={option.label}
                  onClick={() => selectCornerStyle(option.name)}
                >
                  <span
                    aria-hidden="true"
                    className="size-4 border-2 border-current"
                    style={{ borderRadius: option.radius }}
                  />
                </Button>
              </IconTooltip>
            ))}
          </div>
        </section>
      </PopoverContent>
    </Popover>
  )
}
