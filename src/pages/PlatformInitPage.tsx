import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlatformInitStatus, platformInitialize } from '../api/client';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import type { PlatformInitStatusResponse } from '../types';

export function PlatformInitPage() {
  const [initStatus, setInitStatus] = useState<PlatformInitStatusResponse | null>(null);
  const [siteName, setSiteName] = useState('8Feet 平台');
  const [defaultModelId, setDefaultModelId] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadStatus = async () => {
    try {
      const status = await getPlatformInitStatus();
      setInitStatus(status);
      setMessage('');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '获取初始化状态失败';
      setMessage(reason);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const handleInitialize = async () => {
    if (!siteName.trim() || !adminEmail.trim()) {
      setMessage('请填写平台名称和管理员邮箱。');
      return;
    }

    try {
      setSubmitting(true);
      const response = await platformInitialize({
        site_name: siteName.trim(),
        default_model_id: defaultModelId.trim() || undefined,
        admin_email: adminEmail.trim(),
      });
      setMessage(`初始化完成：${response.super_admin_user_id}`);
      await loadStatus();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '初始化失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">平台初始化</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">8Feet 平台初始化配置</h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
            对接 `/api/v1/platform/init-status` 与 `/api/v1/platform/initialize`，用于首次部署初始化。
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">初始化参数</h2>
              <p className="mt-2 text-sm text-slate-600">提交平台名称、默认模型和管理员邮箱，完成首次初始化。</p>
            </div>

            <div className="grid gap-5">
              <div>
                <Label htmlFor="platform-site-name">site_name</Label>
                <Input
                  id="platform-site-name"
                  type="text"
                  value={siteName}
                  onChange={(event) => setSiteName(event.target.value)}
                  placeholder="请输入平台名称"
                />
              </div>
              <div>
                <Label htmlFor="platform-default-model-id">default_model_id（可选）</Label>
                <Input
                  id="platform-default-model-id"
                  type="text"
                  value={defaultModelId}
                  onChange={(event) => setDefaultModelId(event.target.value)}
                  placeholder="请输入默认模型ID"
                />
              </div>
              <div>
                <Label htmlFor="platform-admin-email">admin_email</Label>
                <Input
                  id="platform-admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  placeholder="请输入管理员邮箱"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button onClick={handleInitialize} disabled={submitting}>
                {submitting ? '初始化中...' : '执行平台初始化'}
              </Button>
              <Button variant="secondary" onClick={loadStatus} disabled={submitting}>
                刷新初始化状态
              </Button>
            </div>

            {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          </Card>

          <Card className="space-y-5 bg-slate-950 text-white">
            <h3 className="text-xl font-semibold">当前状态</h3>
            <div className="space-y-3 text-sm leading-7 text-slate-300">
              <p>initialized: {initStatus ? String(initStatus.initialized) : 'loading...'}</p>
              <p>has_super_admin: {initStatus ? String(initStatus.has_super_admin) : 'loading...'}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-sm text-slate-300">若已初始化，请勿重复执行。可先刷新状态确认。</p>
            </div>
            <Link to="/login" className="inline-flex text-sm font-semibold text-white underline underline-offset-4">
              返回登录
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
