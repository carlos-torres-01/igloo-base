import Image from "next/image"

import { cn } from "@/lib/utils"

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-36 shrink-0 flex-col items-end gap-1",
        className
      )}
      role="img"
      aria-label="Igloolab"
    >
      <Image
        src="/brand/igloolab.webp"
        alt=""
        width={440}
        height={137}
        unoptimized
        className="h-auto w-full"
      />
      <span
        aria-hidden="true"
        className="text-[0.6rem] leading-none font-semibold tracking-[0.28em] text-foreground/75 uppercase"
      >
        Base
      </span>
    </span>
  )
}
