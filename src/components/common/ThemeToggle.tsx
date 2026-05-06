import { cn } from '@/lib/utils';

import { useTheme } from './ThemeProvider';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDay = theme === 'day';

  return (
    <button
      type="button"
      aria-label={isDay ? '切换到夜间模式' : '切换到白天模式'}
      aria-pressed={isDay}
      onClick={toggleTheme}
      className={cn('theme-toggle', isDay && 'theme-toggle-day', className)}
    >
      <span className="theme-toggle-label">AM</span>
      <span className="theme-toggle-track">
        <span className="theme-toggle-scene theme-toggle-scene-day">
          <span className="theme-cloud theme-cloud-one" />
          <span className="theme-cloud theme-cloud-two" />
          <span className="theme-skyline theme-skyline-far" />
          <span className="theme-skyline theme-skyline-near" />
        </span>
        <span className="theme-toggle-scene theme-toggle-scene-night">
          <span className="theme-star theme-star-one" />
          <span className="theme-star theme-star-two" />
          <span className="theme-star theme-star-three" />
          <span className="theme-star theme-star-four" />
          <span className="theme-skyline theme-skyline-far" />
          <span className="theme-skyline theme-skyline-near" />
        </span>
        <span className="theme-toggle-knob">
          <span className="theme-toggle-crater theme-toggle-crater-one" />
          <span className="theme-toggle-crater theme-toggle-crater-two" />
          <span className="theme-toggle-crater theme-toggle-crater-three" />
        </span>
      </span>
      <span className="theme-toggle-label">PM</span>
    </button>
  );
}
