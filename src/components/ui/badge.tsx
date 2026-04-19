import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all [&>svg]:pointer-events-none [&>svg]:size-3.5',
  {
    variants: {
      variant: {
        default: 'border-[rgba(99,202,183,0.22)] bg-[rgba(99,202,183,0.12)] text-[#63cab7]',
        secondary: 'border-white/10 bg-white/[0.06] text-slate-300',
        destructive: 'border-red-700/40 bg-red-900/30 text-red-400',
        outline: 'border-[rgba(99,202,183,0.16)] bg-transparent text-slate-200',
        ghost: 'border-transparent bg-transparent text-slate-400 hover:bg-white/[0.05] hover:text-slate-200',
        link: 'h-auto border-none bg-transparent px-0 text-[#63cab7] underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';

  return <Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
