import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-[rgba(99,202,183,0.2)] bg-[#07111f]/80 px-2.5 py-1 text-base text-slate-100 outline-none transition-colors",
        "placeholder:text-slate-600",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-300",
        "focus-visible:border-[rgba(99,202,183,0.55)] focus-visible:ring-2 focus-visible:ring-[rgba(99,202,183,0.15)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
