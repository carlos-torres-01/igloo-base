"use client"

import type { ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import {
  exitEase,
  motionDuration,
  smoothEase,
} from "@/components/motion/transitions"
import { cn } from "@/lib/utils"

export function AnimatedTabPanel({
  activeKey,
  children,
  className,
  direction = 0,
}: {
  activeKey: string
  children: ReactNode
  className?: string
  direction?: number
}) {
  const reduceMotion = useReducedMotion()
  const offset = reduceMotion ? 0 : 14

  return (
    <AnimatePresence initial={false} mode="wait" custom={direction}>
      <motion.div
        key={activeKey}
        custom={direction}
        initial={{ opacity: reduceMotion ? 1 : 0, x: direction * offset }}
        animate={{
          opacity: 1,
          x: 0,
          transition: {
            duration: reduceMotion ? 0 : motionDuration.standard,
            ease: smoothEase,
          },
        }}
        exit={{
          opacity: reduceMotion ? 1 : 0,
          x: direction * -(reduceMotion ? 0 : 10),
          transition: {
            duration: reduceMotion ? 0 : motionDuration.exit,
            ease: exitEase,
          },
        }}
        className={cn("min-w-0", className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
