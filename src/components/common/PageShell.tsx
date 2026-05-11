import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Bookmark,
  ClipboardList,
  FileText,
  GitBranch,
  History,
  LayoutDashboard,
  LogOut,
  User,
} from 'lucide-react';

import { logoutCurrentSession } from '@/api/client';
import { BrandLink } from '@/components/common/BrandLink';
import { getStoredUserRole, isAdminRole } from '@/lib/auth';
import { cn } from '@/lib/utils';

import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { label: '发起任务', path: '/launch', icon: ClipboardList },
  { label: '调研流程', path: '/process', icon: GitBranch },
  { label: '调研报告', path: '/report', icon: FileText },
  { label: '历史记录', path: '/history', icon: History },
  { label: '收藏夹', path: '/favorites', icon: Bookmark },
  { label: '提醒消息', path: '/alerts', icon: Bell },
  { label: '个人中心', path: '/profile', icon: User },
];

const adminItems = [
  { label: '管理后台', path: '/admin/dashboard', icon: LayoutDashboard },
];

// 模块级变量：跨页面导航保持 hover 状态，避免重新挂载时从 false 开始造成展开动画闪烁
let _sidebarHovered = false;

export function PageShell({
  title,
  subtitle,
  action,
  children,
  hideHeader = false,
  hideMobileNav = false,
  contentFrame = true,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  hideHeader?: boolean;
  hideMobileNav?: boolean;
  contentFrame?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(_sidebarHovered);
  const [loggingOut, setLoggingOut] = useState(false);
  const canShowAdminEntry = isAdminRole(getStoredUserRole());

  const handleMouseEnter = () => { _sidebarHovered = true; setExpanded(true); };
  const handleMouseLeave = () => { _sidebarHovered = false; setExpanded(false); };
  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutCurrentSession();
    } finally {
      setLoggingOut(false);
      navigate('/login');
    }
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-shell">
      <div className="relative z-10 min-h-screen w-full">
        <aside
          className="fixed inset-y-0 left-0 z-40 hidden lg:flex"
          style={{ width: expanded ? 220 : 68, transition: 'width 200ms cubic-bezier(0.4,0,0.2,1)' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={cn(
              'flex h-full min-h-0 w-full flex-col overflow-hidden px-[10px] py-6 transition-[width,background-color,border-color,box-shadow,backdrop-filter] duration-200 ease-in-out',
              expanded
                ? 'shell-sidebar-panel surface-grid'
                : 'border-r border-transparent bg-transparent shadow-none backdrop-blur-none'
            )}
          >
            <div className="mb-7 flex items-center gap-[10px] px-[3px]">
              <BrandLink
                title="8Feet"
                subtitle="调研平台"
                className="gap-[10px] overflow-hidden"
                badgeClassName="h-10 w-10 rounded-[18px]"
                textClassName={cn('whitespace-nowrap transition-opacity duration-150', expanded ? 'opacity-100' : 'opacity-0')}
                titleClassName="text-[13px] font-semibold leading-none text-slate-100"
                subtitleClassName="mt-[3px] text-xs text-slate-500"
              />
            </div>

            <div
              className={cn(
                'min-h-0 flex-1 overflow-x-hidden',
                expanded ? 'overflow-y-auto pr-1' : 'overflow-y-hidden pr-0'
              )}
            >
              <nav className="flex flex-col gap-[2px]">
                {navItems.map((item) => {
                  const active = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      className={cn(
                        'nav-link-control overflow-hidden',
                        active && 'nav-link-control-active'
                      )}
                    >
                      <span className="flex w-[15px] shrink-0 items-center justify-center">
                        <item.icon
                          size={15}
                          strokeWidth={active ? 2.1 : 1.7}
                          className={active ? 'text-[#63cab7]' : 'opacity-50'}
                        />
                      </span>
                      <span className={cn('min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-opacity duration-150', expanded ? 'opacity-100' : 'opacity-0')}>
                        {item.label}
                      </span>
                      {active ? (
                        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full bg-[#63cab7] shadow-[0_0_6px_#63cab7] transition-opacity duration-150', expanded ? 'opacity-100' : 'opacity-0')} />
                      ) : null}
                    </Link>
                  );
                })}
              </nav>

              {canShowAdminEntry ? (
                <nav className="mt-4 flex flex-col gap-[2px] border-t border-[rgba(99,202,183,0.08)] pt-4">
                  {adminItems.map((item) => {
                    const active = location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={item.label}
                        className={cn(
                          'nav-link-control overflow-hidden',
                          active && 'nav-link-control-active'
                        )}
                      >
                        <span className="flex w-[15px] shrink-0 items-center justify-center">
                          <item.icon
                            size={15}
                            strokeWidth={active ? 2.1 : 1.7}
                            className={active ? 'text-[#63cab7]' : 'opacity-50'}
                          />
                        </span>
                        <span className={cn('min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-opacity duration-150', expanded ? 'opacity-100' : 'opacity-0')}>
                          {item.label}
                        </span>
                        {active ? (
                          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full bg-[#63cab7] shadow-[0_0_6px_#63cab7] transition-opacity duration-150', expanded ? 'opacity-100' : 'opacity-0')} />
                        ) : null}
                      </Link>
                    );
                  })}
                </nav>
              ) : null}
            </div>

            <div className={cn('mt-3 shrink-0 pt-3', expanded ? 'border-t border-[rgba(99,202,183,0.08)]' : '')}>
              <button
                type="button"
                title="退出登录"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
                className="flex w-full items-center gap-2 rounded-2xl border border-transparent px-[11px] py-2.5 text-left text-[13px] text-slate-500 transition-colors duration-150 hover:border-[rgba(99,202,183,0.14)] hover:bg-white/[0.03] hover:text-slate-300 disabled:cursor-wait disabled:opacity-70"
              >
                <span className="flex w-[14px] shrink-0 items-center justify-center">
                  <LogOut size={14} strokeWidth={1.6} />
                </span>
                <span className={cn('min-w-0 overflow-hidden whitespace-nowrap transition-opacity duration-150', expanded ? 'opacity-100' : 'opacity-0')}>
                  {loggingOut ? '退出中...' : '退出登录'}
                </span>
              </button>
            </div>
          </div>
        </aside>

        <div
          className="flex min-h-screen flex-col px-5 py-5 sm:px-6 lg:pl-[68px] lg:pr-8 lg:py-8 xl:pr-10"
        >
          {!hideMobileNav ? (
          <div className="shell-mobile-nav mb-4 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <BrandLink
                title="8Feet"
                subtitle="调研平台"
                className="gap-3"
                badgeClassName="h-10 w-10 rounded-[18px]"
                titleClassName="text-[13px] font-semibold leading-none text-slate-100"
                subtitleClassName="mt-1 text-xs text-slate-500"
              />
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
                className="button-secondary rounded-full px-3 py-1.5 text-xs disabled:cursor-wait disabled:opacity-70"
              >
                <LogOut size={13} strokeWidth={1.7} />
                {loggingOut ? '退出中...' : '退出登录'}
              </button>
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="shell-kicker">{isAdminRoute ? '管理端' : '用户端'}</p>
              <p className="mt-2 max-w-[36rem] text-sm leading-6 text-slate-400">
                  {isAdminRoute ? '管理用户、模型、日志和运营数据。' : '选择需要进入的业务页面。'}
                </p>
              </div>
            </div>
            <div className="shell-divider mt-4" />
            <nav className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'nav-link-control',
                      active && 'nav-link-control-active'
                    )}
                  >
                    <item.icon size={15} strokeWidth={active ? 2.1 : 1.7} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            {canShowAdminEntry ? (
              <nav className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {adminItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'nav-link-control',
                        active && 'nav-link-control-active'
                      )}
                    >
                      <item.icon size={15} strokeWidth={active ? 2.1 : 1.7} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            ) : null}
          </div>
          ) : null}

          <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[1340px] flex-col gap-7">
            {hideHeader ? (
              <div className="flex justify-end gap-3">
                <ThemeToggle />
                {action}
              </div>
            ) : (
              <header className="shell-header surface-grid">
                <div className="relative z-10 flex flex-col gap-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="shell-kicker">{isAdminRoute ? '管理端' : '用户端'}</p>
                      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-100 sm:text-[1.75rem]">
                        {title}
                      </h1>
                      {subtitle ? (
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{subtitle}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-start gap-3 self-start">
                      <ThemeToggle />
                      {action}
                    </div>
                  </div>
                </div>
              </header>
            )}

            <main className="min-w-0 flex-1">
              {contentFrame ? (
                <div className="theme-shell-frame rounded-[32px] border border-[rgba(99,202,183,0.12)] bg-[rgba(7,17,31,0.18)] p-1">
                  <div className="theme-shell-frame-inner min-w-0 flex-1 rounded-[28px] border border-[rgba(255,255,255,0.03)] bg-transparent p-0 sm:p-1">
                    {children}
                  </div>
                </div>
              ) : (
                children
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
