import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const selectVariants = cva(
  'flex h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100',
  {
    variants: {
      variant: {
        default: 'bg-white',
      },
      size: {
        default: 'h-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>, VariantProps<typeof selectVariants> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, size, variant, ...props }, ref) => {
  return <select ref={ref} className={cn(selectVariants({ size, variant }), className)} {...props} />;
});

Select.displayName = 'Select';
