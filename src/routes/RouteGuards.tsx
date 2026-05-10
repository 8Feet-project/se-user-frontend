import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

import { getCurrentUserPermissions } from '@/api/client';
import { AuthShell } from '@/components/common/AuthShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  getStoredPermissions,
  getStoredUserRole,
  hasAccessToken,
  isAdminRole,
  saveAuthSession,
} from '@/lib/auth';
import type { UserRole } from '@/types';

const ADMIN_ROUTE_PERMISSIONS: Array<{ prefix: string; permission: string }> = [
  { prefix: '/admin/dashboard', permission: 'admin:dashboard:read' },
  { prefix: '/admin/models', permission: 'admin:model:read' },
  { prefix: '/admin/users', permission: 'admin:user:read' },
  { prefix: '/admin/logs', permission: 'admin:logs:read' },
];

function requiredAdminPermission(pathname: string) {
  return ADMIN_ROUTE_PERMISSIONS.find((item) => pathname.startsWith(item.prefix))?.permission;
}

function LoadingGate() {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-6">
      <Card className="max-w-sm text-center">
        <p className="text-sm font-medium text-slate-100">正在校验访问权限</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">请稍候。</p>
      </Card>
    </div>
  );
}

function AccessDeniedPage({ message }: { message: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate('/launch', { replace: true });
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <AuthShell
      topActions={
        <Link className="text-slate-400 transition hover:text-slate-200" to="/launch">
          返回用户端
        </Link>
      }
      aside={
        <Card variant="glow" className="p-8 sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-amber-200">
            <ShieldAlert size={20} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-100">没有管理端访问权限</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            管理端仅对管理员开放。页面会自动返回用户端，也可以手动切换账号。
          </p>
        </Card>
      }
    >
      <Card variant="glass" className="p-8 sm:p-10">
        <p className="page-kicker">访问受限</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">无法打开管理端</h1>
        <p className="mt-3 text-sm leading-7 text-slate-400">{message}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/launch">返回用户端</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/login">切换账号</Link>
          </Button>
        </div>
      </Card>
    </AuthShell>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();

  if (!hasAccessToken()) {
    return <Navigate to="/welcome" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | ''>(getStoredUserRole);
  const [permissions, setPermissions] = useState<string[]>(getStoredPermissions);
  const [deniedMessage, setDeniedMessage] = useState('');

  const localRole = getStoredUserRole();
  const canRejectSynchronously = localRole && !isAdminRole(localRole);

  useEffect(() => {
    if (!hasAccessToken() || canRejectSynchronously) {
      setLoading(false);
      return;
    }

    let alive = true;
    const loadPermissions = async () => {
      try {
        const response = await getCurrentUserPermissions();
        if (!alive) {
          return;
        }
        saveAuthSession(response);
        setRole(response.role);
        setPermissions(response.permissions);
        setDeniedMessage('');
      } catch (error) {
        if (!alive) {
          return;
        }
        setDeniedMessage(error instanceof Error ? error.message : '权限校验失败');
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    void loadPermissions();

    return () => {
      alive = false;
    };
  }, [canRejectSynchronously]);

  const requiredPermission = useMemo(
    () => requiredAdminPermission(location.pathname),
    [location.pathname]
  );

  if (!hasAccessToken()) {
    return <Navigate to="/welcome" replace state={{ from: location.pathname }} />;
  }

  if (canRejectSynchronously) {
    return <AccessDeniedPage message="当前账号不是管理员或超级管理员。" />;
  }

  if (loading) {
    return <LoadingGate />;
  }

  if (!isAdminRole(role)) {
    return <AccessDeniedPage message={deniedMessage || '当前账号不是管理员或超级管理员。'} />;
  }

  if (deniedMessage) {
    return <AccessDeniedPage message={deniedMessage} />;
  }

  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <AccessDeniedPage message="当前管理员账号缺少访问该模块所需的权限。" />;
  }

  return <>{children}</>;
}
