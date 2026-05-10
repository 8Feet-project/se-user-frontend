import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Database, FileSearch, LogOut, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { getCurrentUserPermissions, logoutCurrentSession } from '../api/client';
import { AuthShell } from '../components/common/AuthShell';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { cn } from '../lib/utils';

interface AdminNavItem {
  label: string;
  path: string;
  icon: typeof Database;
  description: string;
}

const adminNavItems: AdminNavItem[] = [
  {
    label: '统计看板',
    path: '/admin/dashboard',
    icon: BarChart3,
    description: '查看调研量、活跃用户与模型使用情况。',
  },
  {
    label: '模型配置',
    path: '/admin/models',
    icon: Sparkles,
    description: '维护大模型接入、参数与连接状态。',
  },
  {
    label: '用户权限',
    path: '/admin/users',
    icon: Users,
    description: '管理账号状态、角色权限与密码重置。',
  },
  {
    label: '系统日志',
    path: '/admin/logs',
    icon: FileSearch,
    description: '按日志级别、操作人、模型等条件排查链路问题。',
  },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const hasToken = Boolean(localStorage.getItem('access_token'));

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutCurrentSession();
    } finally {
      setLoggingOut(false);
      navigate('/login');
    }
  };

  useEffect(() => {
    if (!hasToken) {
      setLoading(false);
      return;
    }

    const loadPermissions = async () => {
      try {
        const response = await getCurrentUserPermissions();
        setPermissions(response.permissions);
        setRole(response.role);
      } catch (error) {
        const message = error instanceof Error ? error.message : '权限加载失败';
        setAuthError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadPermissions();
  }, [hasToken]);

  if (!hasToken) {
    return (
      <AuthShell
        topActions={
          <>
            <Link className="text-slate-400 transition hover:text-slate-200" to="/register">
              注册
            </Link>
            <Link
              className="rounded-full border border-[rgba(99,202,183,0.18)] bg-white/[0.04] px-3 py-1.5 text-slate-200 transition hover:border-[rgba(99,202,183,0.35)] hover:text-white"
              to="/login"
            >
              立即登录
            </Link>
          </>
        }
        aside={
          <Card variant="glow" className="p-8 sm:p-10">
            <p className="page-kicker">Admin Guard</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">管理端需要先登录</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              当前未检测到登录令牌。请先使用平台账号登录，再进入统计看板、模型配置、账户权限与系统日志模块。
            </p>
          </Card>
        }
      >
        <Card variant="glass" className="p-8 sm:p-10">
          <p className="page-kicker">访问控制</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">登录后继续访问管理后台</h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">如你尚未拥有管理员账号，请联系超级管理员完成账号开通与授权。</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/login">去登录</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/register">去注册</Link>
            </Button>
          </div>
        </Card>
      </AuthShell>
    );
  }

  const isAdminRole = role === 'admin' || role === 'super_admin';
  if (!loading && (!isAdminRole || authError)) {
    return (
      <AuthShell
        topActions={
          <button
            type="button"
            className="inline-flex items-center gap-2 text-slate-400 transition hover:text-slate-200 disabled:cursor-wait disabled:opacity-70"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? '退出中...' : '切换账号'}
          </button>
        }
        aside={
          <Card variant="glow" className="p-8 sm:p-10">
            <p className="page-kicker">Admin Guard</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">当前账号无管理端访问权限</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              仅管理员或超级管理员可进入管理后台。若你刚完成授权，请重新登录后重试。
            </p>
          </Card>
        }
      >
        <Card variant="glass" className="p-8 sm:p-10">
          <p className="page-kicker">权限校验</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">访问被拒绝</h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            {authError || '当前角色不满足管理端访问要求，请联系超级管理员调整权限。'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/launch">返回用户端</Link>
            </Button>
            <Button type="button" variant="secondary" onClick={() => void handleLogout()} disabled={loggingOut}>
              <LogOut className="h-4 w-4" />
              {loggingOut ? '退出中...' : '重新登录'}
            </Button>
          </div>
        </Card>
      </AuthShell>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(99,202,183,0.09),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(56,189,248,0.08),transparent_32%),linear-gradient(160deg,#0a1628_0%,#0c1c36_60%,#0a1628_100%)] text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6">
        <aside className="flex flex-col rounded-[32px] border border-[rgba(99,202,183,0.12)] bg-[#07111f]/82 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="space-y-3 border-b border-[rgba(99,202,183,0.1)] pb-5">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">8Feet Admin</p>
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
            {adminNavItems.map((item) => {
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
