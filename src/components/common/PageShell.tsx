import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  Bookmark,
  ClipboardList,
  FileText,
  GitBranch,
  History,
  LogIn,
  User,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { label: '发起任务',  path: '/',          icon: ClipboardList },
  { label: '调研流程',  path: '/process',   icon: GitBranch    },
  { label: '调研报告',  path: '/report',    icon: FileText     },
  { label: '历史记录',  path: '/history',   icon: History      },
  { label: '收藏夹',    path: '/favorites', icon: Bookmark     },
  { label: '提醒消息',  path: '/alerts',    icon: Bell         },
  { label: '个人中心',  path: '/profile',   icon: User         },
];

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

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#0a1628 0%,#0c1c36 60%,#0a1628 100%)' }}>
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[220px_1fr]">

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside className="flex flex-col gap-8 border-r border-[rgba(99,202,183,0.09)] bg-[#07111f]/80 px-5 py-8 backdrop-blur-sm">

          {/* Logo */}
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.3)] bg-[rgba(99,202,183,0.08)]">
              <span className="text-[11px] font-extrabold tracking-widest text-[#63cab7]">8F</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold leading-none text-slate-100">8Feet</p>
              <p className="mt-0.5 text-[10px] tracking-wide text-slate-500">情报调研平台</p>
            </div>
          </div>

          {/* Nav group label */}
          <div className="flex-1 space-y-0.5">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">
              工作台
            </p>

            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                    active
                      ? 'border-l-2 border-[#63cab7] bg-[rgba(99,202,183,0.09)] pl-[10px] text-[#63cab7]'
                      : 'border-l-2 border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  )}
                >
                  <item.icon
                    size={15}
                    strokeWidth={active ? 2.1 : 1.7}
                    className={active ? 'text-[#63cab7]' : 'opacity-50 group-hover:opacity-75'}
                  />
                  <span className="flex-1">{item.label}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#63cab7] shadow-[0_0_6px_#63cab7]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-[rgba(99,202,183,0.08)] pt-4">
            <Link
              to="/login"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-slate-500 transition hover:text-slate-300"
            >
              <LogIn size={14} strokeWidth={1.6} />
              <span>登录 / 切换账号</span>
            </Link>
          </div>
        </aside>

        {/* ── Main area ───────────────────────────────────── */}
        <div className="flex flex-col gap-7 px-8 py-8 lg:px-10">

          {/* Page header */}
          <header className="border-b border-[rgba(99,202,183,0.1)] pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-100">{title}</h1>
                {subtitle ? (
                  <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{subtitle}</p>
                ) : null}
              </div>
              {action ? <div className="shrink-0">{action}</div> : null}
            </div>
          </header>

          {/* Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
