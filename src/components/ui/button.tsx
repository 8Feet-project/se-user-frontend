import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-2xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#63cab7] text-[#07111f] font-semibold hover:bg-[#7dd8c9] shadow-[0_0_16px_rgba(99,202,183,0.2)]",
        outline:
          "border-[rgba(99,202,183,0.25)] bg-transparent text-slate-300 hover:border-[rgba(99,202,183,0.5)] hover:text-[#63cab7]",
        secondary:
          "border border-[rgba(99,202,183,0.2)] bg-white/5 text-slate-300 hover:bg-white/8 hover:border-[rgba(99,202,183,0.35)] hover:text-slate-100",
        ghost:
          "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200",
        destructive:
          "bg-red-900/30 text-red-400 border border-red-700/40 hover:bg-red-900/50",
        link: "text-[#63cab7] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-2xl px-2 text-xs in-data-[slot=button-group]:rounded-2xl has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-2xl px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-2xl has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-2xl in-data-[slot=button-group]:rounded-2xl [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-2xl in-data-[slot=button-group]:rounded-2xl",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
    }
>(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
})

Button.displayName = "Button"

export { Button, buttonVariants }
