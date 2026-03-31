import { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Button({ className, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) {
  const base =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60';
  const variantClass =
    variant === 'secondary'
      ? 'border border-slate-300 bg-white text-slate-950 hover:border-slate-400'
      : 'bg-slate-950 text-white hover:bg-slate-800';

  return <button className={cn(base, variantClass, className)} {...props} />;
}
