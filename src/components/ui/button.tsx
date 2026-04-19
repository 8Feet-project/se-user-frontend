import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-transparent text-sm font-medium whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-[rgba(99,202,183,0.55)] focus-visible:ring-2 focus-visible:ring-[rgba(99,202,183,0.16)] active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
  {
    variants: {
      variant: {
        default:
          'bg-[#63cab7] text-[#07111f] font-semibold shadow-[0_0_16px_rgba(99,202,183,0.2)] hover:bg-[#7dd8c9]',
        outline:
          'border-[rgba(99,202,183,0.22)] bg-transparent text-slate-300 hover:border-[rgba(99,202,183,0.4)] hover:bg-white/[0.04] hover:text-slate-100',
        secondary:
          'border-[rgba(99,202,183,0.2)] bg-white/[0.05] text-slate-300 hover:border-[rgba(99,202,183,0.35)] hover:bg-white/[0.08] hover:text-slate-100',
        ghost:
          'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200',
        destructive:
          'border-red-700/40 bg-red-900/30 text-red-400 hover:bg-red-900/45',
        link: 'text-[#63cab7] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2.5',
        xs: 'h-6 rounded-xl px-2.5 text-xs [&_svg:not([class*=size-])]:size-3',
        sm: 'h-8 px-3 text-[13px] [&_svg:not([class*=size-])]:size-3.5',
        lg: 'h-11 px-5 text-sm',
        icon: 'size-10',
        'icon-xs': 'size-6 rounded-xl [&_svg:not([class*=size-])]:size-3',
        'icon-sm': 'size-8',
        'icon-lg': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
