import { Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useTheme } from './ThemeProvider';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDay = theme === 'day';

  return (
    <button
      type="button"
      aria-label={isDay ? '切换到夜间模式' : '切换到白天模式'}
      onClick={toggleTheme}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--8feet-line-soft)] bg-white/[0.04] text-slate-400 transition hover:border-[var(--8feet-line-accent-strong)] hover:text-slate-100',
        isDay && 'border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-slate-700',
        className,
      )}
    >
      {isDay ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  );
}
