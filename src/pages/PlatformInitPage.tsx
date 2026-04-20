import { CircleCheckBig, DatabaseZap, Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getPlatformInitStatus, platformInitialize } from '@/api/client';
import { AuthShell } from '@/components/common/AuthShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PlatformInitStatusResponse } from '@/types';

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
      setMessage(`初始化完成，超级管理员 ID：${response.super_admin_user_id}`);
      await loadStatus();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '初始化失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const initialized = Boolean(initStatus?.initialized);

  return (
    <AuthShell
      topActions={
        <Link className="text-slate-400 transition hover:text-slate-200" to="/login">
          返回登录
        </Link>
      }
      aside={
        <Card variant="glow" className="p-8 sm:p-10">
          <div className="space-y-3">
            <p className="page-kicker">Platform Bootstrap</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-100">首屏配置也遵循同一套设计语言。</h2>
            <p className="text-sm leading-7 text-slate-400">
              平台初始化不是一次性的“后台页面”，它同样应该有清晰的字段分层、风险提示和状态反馈，和整个产品保持一致。
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="panel-subtle p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.2)] bg-[rgba(99,202,183,0.08)] text-[#63cab7]">
                  <Settings2 size={16} strokeWidth={1.9} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">基础配置</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">填写平台名称、默认模型和管理员邮箱，完成首轮可用配置。</p>
                </div>
              </div>
            </div>
            <div className="panel-subtle p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.2)] bg-[rgba(99,202,183,0.08)] text-[#63cab7]">
                  <DatabaseZap size={16} strokeWidth={1.9} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">状态复核</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">支持随时刷新初始化状态，避免重复执行高风险操作。</p>
                </div>
              </div>
            </div>
            <div className="panel-subtle p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.2)] bg-[rgba(99,202,183,0.08)] text-[#63cab7]">
                  <CircleCheckBig size={16} strokeWidth={1.9} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">当前状态</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    initialized：{initStatus ? String(initStatus.initialized) : 'loading...'}
                    <br />
                    has_super_admin：{initStatus ? String(initStatus.has_super_admin) : 'loading...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      }
    >
      <Card variant="glass" className="p-8 sm:p-10">
        <div className="space-y-2">
          <p className="page-kicker">平台初始化</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100">8Feet 平台初始化配置</h1>
          <p className="text-sm leading-7 text-slate-400">
            用统一的深色工作流完成首轮配置，后续整个应用都将沿用同一套设计 token、组件层级与交互规范。
          </p>
        </div>

        {initialized ? (
          <div className="mt-6 rounded-[24px] border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">
            平台已完成初始化。为避免重复创建超级管理员与默认配置，当前表单已切换为只读展示。
          </div>
        ) : null}

        <div className="mt-8 grid gap-5">
          <div>
            <Label htmlFor="platform-site-name">site_name</Label>
            <Input
              id="platform-site-name"
              value={siteName}
              onChange={(event) => setSiteName(event.target.value)}
              placeholder="请输入平台名称"
              disabled={initialized || submitting}
            />
          </div>
          <div>
            <Label htmlFor="platform-default-model-id">default_model_id（可选）</Label>
            <Input
              id="platform-default-model-id"
              value={defaultModelId}
              onChange={(event) => setDefaultModelId(event.target.value)}
              placeholder="请输入默认模型 ID"
              disabled={initialized || submitting}
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
              disabled={initialized || submitting}
            />
          </div>
        </div>

        {message ? <div className="message-strip mt-6">{message}</div> : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button onClick={handleInitialize} disabled={submitting || initialized}>
            {submitting ? '初始化中...' : initialized ? '平台已初始化' : '执行平台初始化'}
          </Button>
          <Button variant="secondary" onClick={loadStatus} disabled={submitting}>
            刷新初始化状态
          </Button>
        </div>
      </Card>
    </AuthShell>
  );
}
