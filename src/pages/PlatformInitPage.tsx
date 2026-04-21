import { CircleCheckBig, DatabaseZap, Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getPlatformInitStatus, platformInitialize } from '@/api/client';
import { AuthShell } from '@/components/common/AuthShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { PlatformInitStatusResponse } from '@/types';

export function PlatformInitPage() {
  const [initStatus, setInitStatus] = useState<PlatformInitStatusResponse | null>(null);
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
    try {
      setSubmitting(true);
      const response = await platformInitialize();
      const nextMessage = response.initialized
        ? response.super_admin_user_id == null
          ? '初始化完成，但后端未返回超级管理员 ID。'
          : `初始化完成，超级管理员 ID：${response.super_admin_user_id}`
        : '初始化请求已提交，但后端未返回已初始化状态。';

      await loadStatus();
      setMessage(nextMessage);
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
                  <p className="text-sm font-semibold text-slate-100">初始化契约</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">当前版本由后端预置初始化参数，前端仅负责触发初始化并回显状态。</p>
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
            当前后端契约不再从前端收集平台名称、默认模型和管理员邮箱，本页专注于执行初始化与复核实际状态。
          </p>
        </div>

        {initialized ? (
          <div className="mt-6 rounded-[24px] border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">
            平台已完成初始化。为避免重复创建超级管理员与默认配置，当前页面已切换为状态展示模式。
          </div>
        ) : null}

        <div className="mt-8 rounded-[24px] border border-white/10 bg-slate-950/40 p-5">
          <p className="text-sm font-semibold text-slate-100">当前前后端对齐后的初始化方式</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            平台初始化请求会发送空配置对象，由后端使用服务端预置参数完成初始化，不再假设前端能够配置 site_name、default_model_id、admin_email。
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            如果后端返回了超级管理员 ID，页面会直接展示；如果返回 null，也会按无 ID 的结果给出提示，避免把空值误当成字符串使用。
          </p>
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
