"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

import { motionDuration, smoothEase } from "@/components/motion/transitions"

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "left" | "right" | "none"
  onView?: boolean
}

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  onView = false,
}: RevealProps) {
  const reduceMotion = useReducedMotion()
  const hidden =
    direction === "none"
      ? { opacity: 0 }
      : {
          opacity: 0,
          x: direction === "left" ? -16 : direction === "right" ? 16 : 0,
          y: direction === "up" ? 12 : 0,
        }
  const visible =
    direction === "none" ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : hidden}
      animate={onView ? undefined : visible}
      whileInView={onView ? visible : undefined}
      viewport={onView ? { once: true, amount: 0.15 } : undefined}
      transition={{
        duration: reduceMotion ? 0 : motionDuration.standard + 0.12,
        delay: reduceMotion ? 0 : delay,
        ease: smoothEase,
      }}
    >
      {children}
    </motion.div>
  )
}
