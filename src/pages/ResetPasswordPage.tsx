import { KeyRound, LifeBuoy, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { passwordResetConfirm, passwordResetRequest } from '@/api/client';
import { AuthShell } from '@/components/common/AuthShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ResetPasswordPage() {
  const [username, setUsername] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [requestSucceeded, setRequestSucceeded] = useState(false);
  const [confirmSucceeded, setConfirmSucceeded] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestReset = async () => {
    if (!username.trim()) {
      setMessage('请填写用户名或邮箱。');
      setRequestSucceeded(false);
      return;
    }

    try {
      setSubmitting(true);
      const response = await passwordResetRequest({ username: username.trim() });
      setRequestSucceeded(true);
      setConfirmSucceeded(false);
      setMessage(`重置请求结果：${response.result}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '发起重置失败';
      setRequestSucceeded(false);
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetToken.trim() || !newPassword) {
      setMessage('请填写 reset_token 与新密码。');
      setConfirmSucceeded(false);
      return;
    }

    try {
      setSubmitting(true);
      const response = await passwordResetConfirm({
        reset_token: resetToken.trim(),
        new_password: newPassword,
      });
      setConfirmSucceeded(true);
      setMessage(`重置确认结果：${response.result}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '确认重置失败';
      setConfirmSucceeded(false);
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

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
            <p className="page-kicker">Password Recovery</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-100">重置流程也应该清晰可追踪。</h2>
            <p className="text-sm leading-7 text-slate-400">
              我们沿用设计系统里的深色表单、清晰分层和动作型文案，让恢复账号这件事足够明确、也足够稳妥。
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="panel-subtle p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.2)] bg-[rgba(99,202,183,0.08)] text-[#63cab7]">
                  <LifeBuoy size={16} strokeWidth={1.9} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">第一步：发起重置</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">填写用户名或邮箱，请求后端创建密码重置流程。</p>
                </div>
              </div>
            </div>
            <div className="panel-subtle p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.2)] bg-[rgba(99,202,183,0.08)] text-[#63cab7]">
                  <KeyRound size={16} strokeWidth={1.9} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">第二步：提交令牌</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">拿到 reset_token 后，再输入新密码完成最终确认。</p>
                </div>
              </div>
            </div>
            <div className="panel-subtle p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.2)] bg-[rgba(99,202,183,0.08)] text-[#63cab7]">
                  <ShieldAlert size={16} strokeWidth={1.9} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">第三步：回到登录</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">密码更新后，建议立即返回登录页并验证账号状态。</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      }
    >
      <Card variant="glass" className="p-8 sm:p-10">
        <div className="space-y-2">
          <p className="page-kicker">密码恢复</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100">重置 8Feet 账户密码</h1>
          <p className="text-sm leading-7 text-slate-400">
            先发起重置请求，再填写 reset_token 与新密码完成确认。整个流程沿用 8Feet 的深色表单规范与动作型提示文案。
          </p>
        </div>

        <div className="mt-8 grid gap-5">
          <div>
            <Label htmlFor="reset-username">用户名 / 邮箱</Label>
            <Input id="reset-username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="请输入用户名或邮箱" />
          </div>
          <Button variant="secondary" onClick={handleRequestReset} disabled={submitting}>
            {submitting ? '提交中...' : '发起密码重置'}
          </Button>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
            第一步状态：{requestSucceeded ? '已发起重置，请准备 reset_token' : '尚未发起重置'}
          </div>
          <div>
            <Label htmlFor="reset-token">reset_token</Label>
            <Input id="reset-token" value={resetToken} onChange={(event) => setResetToken(event.target.value)} placeholder="请输入重置令牌" />
          </div>
          <div>
            <Label htmlFor="reset-new-password">新密码</Label>
            <Input id="reset-new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="请输入新密码" />
          </div>
          <Button onClick={handleConfirmReset} disabled={submitting}>
            {submitting ? '提交中...' : '确认密码重置'}
          </Button>
        </div>

        {message ? (
          <div
            className={`mt-6 rounded-[24px] border px-4 py-3 text-sm ${
              confirmSucceeded
                ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
                : 'message-strip'
            }`}
          >
            <p>{message}</p>
            {confirmSucceeded ? (
              <p className="mt-2 text-xs text-emerald-200/90">密码已更新，可立即返回登录页验证新密码是否生效。</p>
            ) : null}
          </div>
        ) : null}

        {confirmSucceeded ? (
          <div className="mt-6">
            <Link to="/login" className="block">
              <Button className="w-full">返回登录并验证新密码</Button>
            </Link>
          </div>
        ) : null}
      </Card>
    </AuthShell>
  );
}
