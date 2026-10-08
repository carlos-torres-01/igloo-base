"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { motionDuration, smoothEase } from "@/components/motion/transitions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AnimatedAlert({
  message,
  title,
  variant = "default",
}: {
  message?: string
  title?: string
  variant?: "default" | "destructive"
}) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            duration: reduceMotion ? 0 : motionDuration.feedback,
            ease: smoothEase,
          }}
          className="overflow-hidden"
        >
          <Alert variant={variant}>
            {title ? <AlertTitle>{title}</AlertTitle> : null}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
