import Image from "next/image"

import { cn } from "@/lib/utils"

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex w-[8.9rem] flex-col items-end", className)}
      role="img"
      aria-label="Igloolab"
    >
      <span
        className="relative block h-11 w-full overflow-hidden"
        aria-hidden="true"
      >
        <Image
          src="/brand/igloolab.png"
          alt=""
          width={502}
          height={199}
          priority
          className="absolute -top-[0.55rem] -left-[0.55rem] h-auto w-40 max-w-none"
        />
      </span>
      <span
        aria-hidden="true"
        className="-mt-0.5 pr-0.5 text-[0.6rem] leading-none font-semibold tracking-[0.28em] text-foreground/75 uppercase"
      >
        Igloo
      </span>
    </span>
  )
}
