import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const selectVariants = cva(
  [
    'flex w-full appearance-none rounded-2xl border bg-[#07111f] px-4 py-3 text-sm text-slate-100 outline-none transition-all',
    'border-[rgba(99,202,183,0.2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]',
    'focus:border-[rgba(99,202,183,0.55)] focus:ring-2 focus:ring-[rgba(99,202,183,0.15)]',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      variant: {
        default: '',
      },
      size: {
        default: 'h-12',
        sm: 'h-10 text-[13px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size, variant, ...props }, ref) => {
    return <select ref={ref} className={cn(selectVariants({ size, variant }), className)} {...props} />;
  }
);

Select.displayName = 'Select';
