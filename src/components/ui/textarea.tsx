import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-24 w-full rounded-2xl border border-[rgba(99,202,183,0.18)] bg-[#07111f] px-4 py-3 text-sm leading-6 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition-all',
        'placeholder:text-slate-500',
        'focus-visible:border-[rgba(99,202,183,0.55)] focus-visible:ring-2 focus-visible:ring-[rgba(99,202,183,0.15)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
