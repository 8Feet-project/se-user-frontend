import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '../ui/sidebar';
import { cn } from '../../lib/utils';

const navItems = [
  { title: '页面导航', items: [
    { label: '任务', path: '/' },
    { label: '流程', path: '/process' },
    { label: '报告', path: '/report' },
    { label: '历史', path: '/history' },
  ]},
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
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[300px_1fr] lg:px-10">
        <Sidebar className="shadow-none border-none bg-transparent p-0">
          <SidebarHeader className="px-0 pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">8Feet 平台</p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">业务调研</h2>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {navItems.map((group) => (
              <SidebarGroup key={group.title} className="space-y-4">
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const active = location.pathname === item.path;
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton asChild active={active}>
                            <Link to={item.path} className="flex w-full gap-3">
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="px-0 pt-5">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">快速入口</p>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400"
              >
                登录
              </Link>
            </div>
          </SidebarFooter>

          <SidebarRail className="hidden lg:block" />
        </Sidebar>

        <div className="flex flex-col gap-8">
          <header className="border-b border-slate-200/90 pb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">当前页面</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
                {subtitle ? <p className="mt-2 max-w-3xl text-sm text-slate-600">{subtitle}</p> : null}
              </div>
              {action ? <div>{action}</div> : null}
            </div>
          </header>

          <main className="flex-1 rounded-[32px] border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-200/50">{children}</main>
        </div>
      </div>
    </div>
  );
}
