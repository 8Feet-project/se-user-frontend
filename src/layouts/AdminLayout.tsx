import { useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Database, FileSearch, LogOut, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { logoutCurrentSession } from '../api/client';
import { BrandLink } from '../components/common/BrandLink';
import { Button } from '../components/ui/button';
import { getStoredPermissions, getStoredUserRole } from '../lib/auth';
import { cn } from '../lib/utils';

interface AdminNavItem {
  label: string;
  path: string;
  icon: typeof Database;
  permission: string;
  description: string;
}

const adminNavItems: AdminNavItem[] = [
  {
    label: '统计看板',
    path: '/admin/dashboard',
    icon: BarChart3,
    permission: 'admin:dashboard:read',
    description: '查看调研量、活跃用户与模型使用情况。',
  },
  {
    label: '模型配置',
    path: '/admin/models',
    icon: Sparkles,
    permission: 'admin:model:read',
    description: '维护大模型接入、参数与连接状态。',
  },
  {
    label: '用户权限',
    path: '/admin/users',
    icon: Users,
    permission: 'admin:user:read',
    description: '管理账号状态、角色权限与密码重置。',
  },
  {
    label: '系统日志',
    path: '/admin/logs',
    icon: FileSearch,
    permission: 'admin:logs:read',
    description: '按日志级别、操作人、模型等条件排查链路问题。',
  },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [permissions] = useState<string[]>(() => getStoredPermissions());
  const [role] = useState(() => getStoredUserRole());
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutCurrentSession();
    } finally {
      setLoggingOut(false);
      navigate('/welcome');
    }
  };

  const accessibleItems = useMemo(
    () => adminNavItems.filter((item) => permissions.includes(item.permission)),
    [permissions]
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(99,202,183,0.09),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(56,189,248,0.08),transparent_32%),linear-gradient(160deg,#0a1628_0%,#0c1c36_60%,#0a1628_100%)] text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6">
        <aside className="flex flex-col rounded-[32px] border border-[rgba(99,202,183,0.12)] bg-[#07111f]/82 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="space-y-3 border-b border-[rgba(99,202,183,0.1)] pb-5">
            <BrandLink
              title="8Feet Admin"
              badgeClassName="h-10 w-10 rounded-[18px] border border-[rgba(99,202,183,0.3)] bg-[rgba(99,202,183,0.08)]"
              titleClassName="text-xs uppercase tracking-[0.32em] text-slate-500"
            />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-white">系统管理后台</h1>
              <p className="text-sm leading-6 text-slate-400">
                覆盖模型配置、权限治理、用户数据看板与底层全链路日志排查。
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-[rgba(99,202,183,0.12)] bg-white/[0.04] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[rgba(99,202,183,0.14)] p-2 text-[#63cab7]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">当前身份</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{role || 'loading'}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">已加载 {permissions.length} 项权限，用于控制管理端操作范围。</p>
              </div>
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-2">
            {accessibleItems.map((item) => {
              const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'block rounded-3xl border px-4 py-4 transition',
                    active
                      ? 'border-[rgba(99,202,183,0.28)] bg-[rgba(99,202,183,0.1)] text-white shadow-[0_0_22px_rgba(99,202,183,0.08)]'
                      : 'border-[rgba(99,202,183,0.1)] bg-white/[0.03] text-slate-300 hover:border-[rgba(99,202,183,0.18)] hover:bg-white/[0.05]'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('rounded-2xl p-2', active ? 'bg-[rgba(99,202,183,0.18)] text-[#63cab7]' : 'bg-white/[0.06] text-slate-300')}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-400">{item.description}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 flex gap-3 border-t border-[rgba(99,202,183,0.1)] pt-5">
            <Button asChild variant="secondary" className="flex-1 rounded-2xl border-[rgba(99,202,183,0.2)] bg-white/[0.06] text-slate-100 hover:bg-white/[0.1]">
              <Link to="/launch">返回用户端</Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1 rounded-2xl border-[rgba(99,202,183,0.2)] bg-[#07111f] text-slate-200 hover:bg-[#0b1730]"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? '退出中...' : '退出登录'}
            </Button>
          </div>
        </aside>

        <div className="flex min-h-0 flex-col rounded-[32px] border border-[rgba(99,202,183,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01)),rgba(7,17,31,0.82)] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
