import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { ThemeToggle } from './ThemeToggle';

export function AuthShell({
  children,
  aside,
  topActions,
}: {
  children: ReactNode;
  aside: ReactNode;
  topActions?: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,rgba(99,202,183,0.1),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(56,189,248,0.08),transparent_32%),linear-gradient(160deg,#081323_0%,#0c1c36_58%,#0a1628_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(99,202,183,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(99,202,183,0.025)_1px,transparent_1px)] bg-[size:52px_52px] opacity-40" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#63cab7]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-sky-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1180px] flex-col px-6 py-6 sm:px-10 lg:py-8">
        <header className="flex items-center justify-between gap-4">
          <Link to="/welcome" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.3)] bg-[rgba(99,202,183,0.08)]">
              <span className="text-[11px] font-extrabold tracking-[0.22em] text-[#63cab7]">8F</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">8Feet</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Research Platform</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <ThemeToggle />
            {topActions}
          </div>
        </header>

        <main className="flex flex-1 items-center py-8 lg:py-10">
          <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">{children}{aside}</div>
        </main>
      </div>
    </div>
  );
}
