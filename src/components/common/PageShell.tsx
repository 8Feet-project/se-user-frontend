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
  Settings,
  ShieldPlus,
  User,
} from 'lucide-react';

import { logoutCurrentSession } from '@/api/client';
import { cn } from '@/lib/utils';

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
  { label: '管理总览', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: '模型配置', path: '/admin/models', icon: Settings },
  { label: '用户管理', path: '/admin/users', icon: ShieldPlus },
  { label: '系统日志', path: '/admin/logs', icon: FileText },
];

// 模块级变量：跨页面导航保持 hover 状态，避免重新挂载时从 false 开始造成展开动画闪烁
let _sidebarHovered = false;

export function PageShell({
  title,
  subtitle,
  action,
  showHeaderMetrics = true,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showHeaderMetrics?: boolean;
  children: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(_sidebarHovered);
  const [loggingOut, setLoggingOut] = useState(false);

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
              <Link to="/welcome" className="flex min-w-0 items-center gap-[10px] overflow-hidden">
                <div className="brand-mark h-10 w-10 shrink-0 rounded-[18px]">
                  <span className="text-[11px] font-extrabold tracking-[0.15em] text-[#63cab7]">8F</span>
                </div>
                <div
                  className={cn('overflow-hidden whitespace-nowrap transition-opacity duration-150', expanded ? 'opacity-100' : 'opacity-0')}
                >
                  <p className="text-[13px] font-semibold leading-none text-slate-100">8Feet</p>
                  <p className="mt-[3px] text-[10px] uppercase tracking-[0.16em] text-slate-500">
                    Intel Research
                  </p>
                </div>
              </Link>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
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

              <nav className="flex flex-col gap-[2px]">
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
          <div className="shell-mobile-nav mb-4 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <Link to="/welcome" className="flex items-center gap-3">
                <div className="brand-mark h-10 w-10 rounded-[18px]">
                  <span className="text-[11px] font-extrabold tracking-[0.22em] text-[#63cab7]">8F</span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold leading-none text-slate-100">8Feet</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">Intel Research</p>
                </div>
              </Link>
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
                <p className="shell-kicker">{isAdminRoute ? 'Admin Surface' : 'Workspace Surface'}</p>
                <p className="mt-2 max-w-[36rem] text-sm leading-6 text-slate-400">
                  {isAdminRoute ? '保留管理入口的快速切换与状态识别。' : '保留核心工作流入口，并在移动端维持更完整的导航信息。'}
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
          </div>

          <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[1340px] flex-col gap-7">
            <header className="shell-header surface-grid">
              <div className="relative z-10 flex flex-col gap-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="shell-kicker">{isAdminRoute ? 'Administration' : 'Research Workflow'}</p>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-100 sm:text-[1.75rem]">
                      {title}
                    </h1>
                    {subtitle ? (
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{subtitle}</p>
                    ) : null}
                  </div>
                  {action ? <div className="shrink-0 self-start">{action}</div> : null}
                </div>
                {showHeaderMetrics ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="metric-chip">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Module</p>
                      <p className="mt-2 text-sm font-semibold text-slate-100">
                        {isAdminRoute ? 'Admin Control' : 'Research Console'}
                      </p>
                    </div>
                    <div className="metric-chip">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Path</p>
                      <p className="mt-2 truncate text-sm font-semibold text-slate-100">{location.pathname}</p>
                    </div>
                    <div className="metric-chip">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
                      <p className="mt-2 text-sm font-semibold text-[#63cab7]">Ready for action</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </header>

            <main className="min-w-0 flex-1">
              <div className="rounded-[32px] border border-[rgba(99,202,183,0.12)] bg-[rgba(7,17,31,0.18)] p-1">
                <div className="min-w-0 flex-1 rounded-[28px] border border-[rgba(255,255,255,0.03)] bg-transparent p-0 sm:p-1">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
