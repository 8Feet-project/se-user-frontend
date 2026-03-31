import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const navItems = [
  { label: '任务', path: '/' },
  { label: '流程', path: '/process' },
  { label: '报告', path: '/report' },
  { label: '历史', path: '/history' },
];

export function PageShell({ title, subtitle, action, children }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <header className="flex flex-col gap-6 rounded-[32px] border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-200/50 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">8Feet 智能调研平台</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-2xl text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {action}
            <Link to="/login">
              <Button variant="secondary">登录</Button>
            </Link>
          </div>
        </header>

        <nav className="flex flex-wrap gap-3 rounded-[28px] border border-slate-200/90 bg-white p-3 shadow-sm shadow-slate-200/40">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'rounded-full px-5 py-3 text-sm font-medium transition',
                  active ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
