import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, Database, FileSearch, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { getCurrentUserPermissions } from '../api/client';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

interface AdminNavItem {
  label: string;
  path: string;
  icon: typeof Database;
  permission?: string;
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
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const response = await getCurrentUserPermissions();
        setPermissions(response.permissions);
        setRole(response.role);
      } finally {
        setLoading(false);
      }
    };

    void loadPermissions();
  }, []);

  const accessibleItems = useMemo(() => {
    if (loading) {
      return adminNavItems;
    }
    return adminNavItems.filter((item) => !item.permission || permissions.includes(item.permission));
  }, [loading, permissions]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6">
        <aside className="flex flex-col rounded-[32px] border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <div className="space-y-3 border-b border-slate-800 pb-5">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">8Feet Admin</p>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-white">系统管理后台</h1>
              <p className="text-sm leading-6 text-slate-400">
                覆盖模型配置、权限治理、用户数据看板与底层全链路日志排查。
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-emerald-500/15 p-2 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">当前身份</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{role || 'loading'}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">已加载 {permissions.length} 项权限，用于控制管理端导航与操作范围。</p>
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
                      ? 'border-sky-500/40 bg-sky-500/10 text-white shadow-lg shadow-sky-950/30'
                      : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('rounded-2xl p-2', active ? 'bg-sky-500/20 text-sky-200' : 'bg-slate-800 text-slate-300')}>
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

          <div className="mt-6 flex gap-3 border-t border-slate-800 pt-5">
            <Button asChild variant="secondary" className="flex-1 rounded-2xl bg-white text-slate-950 hover:bg-slate-200">
              <Link to="/">返回用户端</Link>
            </Button>
          </div>
        </aside>

        <div className="flex min-h-0 flex-col rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 p-4 shadow-2xl shadow-slate-950/30 lg:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
