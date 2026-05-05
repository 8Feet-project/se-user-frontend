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
  { label: '发起任务', path: '/', icon: ClipboardList },
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
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(99,202,183,0.09),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(56,189,248,0.08),transparent_32%),linear-gradient(160deg,#0a1628_0%,#0c1c36_60%,#0a1628_100%)]">
      <div className="relative min-h-screen w-full">
        <aside
          className="fixed inset-y-0 left-0 z-40 hidden lg:flex"
          style={{ width: expanded ? 220 : 68, transition: 'width 200ms cubic-bezier(0.4,0,0.2,1)' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={cn(
              'flex h-full w-full flex-col overflow-hidden px-[10px] py-6 transition-[width,background-color,border-color,box-shadow,backdrop-filter] duration-200 ease-in-out',
              expanded
                ? 'border-r border-[rgba(99,202,183,0.09)] bg-[#07111f]/92 shadow-[4px_0_32px_rgba(0,0,0,0.45)] backdrop-blur-xl'
                : 'border-r border-transparent bg-transparent shadow-none backdrop-blur-none'
            )}
          >
            <div className="mb-7 flex items-center gap-[10px] px-[3px]">
              <Link to="/welcome" className="flex min-w-0 items-center gap-[10px] overflow-hidden">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.3)] bg-[rgba(99,202,183,0.08)]">
                  <span className="text-[11px] font-extrabold tracking-[0.15em] text-[#63cab7]">8F</span>
                </div>
                <div
                  className={cn('overflow-hidden whitespace-nowrap transition-opacity duration-150', expanded ? 'opacity-100' : 'opacity-0')}
                >
                  <p className="text-[13px] font-semibold leading-none text-slate-100">8Feet</p>
                  <p className="mt-[3px] text-[10px] uppercase tracking-[0.1em] text-slate-500">
                    Intel Research
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex-1 overflow-hidden">
              <p
                className={cn(
                  'mb-2 h-[18px] px-[11px] text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600 transition-opacity duration-150',
                  expanded ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
              >
                工作台
              </p>
              <nav className="flex flex-col gap-[2px]">
                {navItems.map((item) => {
                  const active = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      className={cn(
                        'flex items-center gap-[10px] overflow-hidden rounded-[10px] border-l-2 border-transparent px-[11px] py-[9px] text-[13px] font-medium transition-all duration-150',
                        active
                          ? 'border-l-[#63cab7] bg-[rgba(99,202,183,0.09)] pl-[9px] text-[#63cab7]'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
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

              <p
                className={cn(
                  'mb-2 mt-6 h-[18px] px-[11px] text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600 transition-opacity duration-150',
                  expanded ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
              >
                管理端
              </p>
              <nav className="flex flex-col gap-[2px]">
                {adminItems.map((item) => {
                  const active = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      className={cn(
                        'flex items-center gap-[10px] overflow-hidden rounded-[10px] border-l-2 border-transparent px-[11px] py-[9px] text-[13px] font-medium transition-all duration-150',
                        active
                          ? 'border-l-[#63cab7] bg-[rgba(99,202,183,0.09)] pl-[9px] text-[#63cab7]'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
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

            <div className={cn('mt-auto pt-3', expanded ? 'border-t border-[rgba(99,202,183,0.08)]' : '')}>
              <button
                type="button"
                title="退出登录"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
                className="flex w-full items-center gap-2 rounded-[10px] px-[11px] py-2 text-left text-[13px] text-slate-500 transition-colors duration-150 hover:text-slate-300 disabled:cursor-wait disabled:opacity-70"
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
          <div className="mb-4 rounded-[28px] border border-[rgba(99,202,183,0.12)] bg-[#07111f]/75 p-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <Link to="/welcome" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.3)] bg-[rgba(99,202,183,0.08)]">
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
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(99,202,183,0.18)] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-[rgba(99,202,183,0.35)] hover:text-slate-100 disabled:cursor-wait disabled:opacity-70"
              >
                <LogOut size={13} strokeWidth={1.7} />
                {loggingOut ? '退出中...' : '退出登录'}
              </button>
            </div>
            <nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                      active
                        ? 'border-[rgba(99,202,183,0.24)] bg-[rgba(99,202,183,0.09)] text-[#63cab7]'
                        : 'border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                    )}
                  >
                    <item.icon size={15} strokeWidth={active ? 2.1 : 1.7} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <nav className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {adminItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                      active
                        ? 'border-[rgba(99,202,183,0.24)] bg-[rgba(99,202,183,0.09)] text-[#63cab7]'
                        : 'border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
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
            <header className="border-b border-[rgba(99,202,183,0.1)] pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-[1.75rem]">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{subtitle}</p>
                  ) : null}
                </div>
                {action ? <div className="shrink-0">{action}</div> : null}
              </div>
            </header>

            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
