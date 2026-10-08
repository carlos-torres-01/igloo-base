"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react"
import { motion, useAnimationControls, useReducedMotion } from "motion/react"
import { usePathname, useRouter } from "next/navigation"

import {
  exitEase,
  motionDuration,
  smoothEase,
} from "@/components/motion/transitions"

type TransitionRouter = {
  back: () => Promise<void>
  push: (href: string) => Promise<void>
  refresh: () => void
}

const TransitionRouterContext = createContext<TransitionRouter | null>(null)

const visibleState = { opacity: 1, y: 0 }
const enterState = { opacity: 0, y: 8 }
const exitState = { opacity: 0, y: -6 }

export function RouteTransition({
  children,
  enter = true,
  enterOnMount = true,
  exitDuration = motionDuration.exit,
}: {
  children: ReactNode
  enter?: boolean
  enterOnMount?: boolean
  exitDuration?: number
}) {
  const pathname = usePathname()
  const nextRouter = useRouter()
  const controls = useAnimationControls()
  const reduceMotion = useReducedMotion()
  const navigating = useRef(false)
  const lastPathname = useRef(pathname)
  const hasNavigated = useRef(false)

  useLayoutEffect(() => {
    navigating.current = false
    if (lastPathname.current !== pathname) {
      lastPathname.current = pathname
      hasNavigated.current = true
    }

    if (reduceMotion || !enter || (!enterOnMount && !hasNavigated.current)) {
      controls.set(visibleState)
      return
    }

    controls.set(enterState)
    void controls.start({
      ...visibleState,
      transition: {
        duration: motionDuration.standard,
        ease: smoothEase,
      },
    })
  }, [controls, enter, enterOnMount, pathname, reduceMotion])

  const animateOut = useCallback(async () => {
    if (navigating.current) return false
    navigating.current = true

    if (!reduceMotion) {
      await controls.start({
        ...exitState,
        transition: {
          duration: exitDuration,
          ease: exitEase,
        },
      })
    }

    return true
  }, [controls, exitDuration, reduceMotion])

  const push = useCallback(
    async (href: string) => {
      if (!(await animateOut())) return
      nextRouter.push(href)
    },
    [animateOut, nextRouter]
  )

  const back = useCallback(async () => {
    if (!(await animateOut())) return
    nextRouter.back()
  }, [animateOut, nextRouter])

  useEffect(() => {
    function handleInternalLink(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest<HTMLAnchorElement>("a[href]")
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.dataset.pageTransition === "none"
      ) {
        return
      }

      const destination = new URL(anchor.href, window.location.href)
      const current = new URL(window.location.href)

      if (
        destination.origin !== current.origin ||
        (destination.pathname === current.pathname &&
          destination.search === current.search)
      ) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      void push(
        `${destination.pathname}${destination.search}${destination.hash}`
      )
    }

    document.addEventListener("click", handleInternalLink, true)
    return () => document.removeEventListener("click", handleInternalLink, true)
  }, [push])

  const router = useMemo<TransitionRouter>(
    () => ({ back, push, refresh: nextRouter.refresh }),
    [back, nextRouter.refresh, push]
  )

  return (
    <TransitionRouterContext.Provider value={router}>
      <motion.div
        className="min-w-0"
        initial={
          reduceMotion || !enter || !enterOnMount ? visibleState : enterState
        }
        animate={controls}
      >
        {children}
      </motion.div>
    </TransitionRouterContext.Provider>
  )
}

export function useTransitionRouter() {
  const router = useContext(TransitionRouterContext)

  if (!router) {
    throw new Error("useTransitionRouter debe usarse dentro de RouteTransition")
  }

  return router
}
