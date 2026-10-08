"use client"

import type { ReactNode } from "react"
import { MotionConfig } from "motion/react"

import { motionDuration, smoothEase } from "@/components/motion/transitions"

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: motionDuration.standard, ease: smoothEase }}
    >
      {children}
    </MotionConfig>
  )
}
