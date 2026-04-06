import { useState } from 'react';
import { Link } from 'react-router-dom';
import { passwordResetConfirm, passwordResetRequest } from '../api/client';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function ResetPasswordPage() {
  const [username, setUsername] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestReset = async () => {
    if (!username.trim()) {
      setMessage('请填写用户名或邮箱。');
      return;
    }

    try {
      setSubmitting(true);
      const response = await passwordResetRequest({ username: username.trim() });
      setMessage(`重置请求结果：${response.result}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '发起重置失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetToken.trim() || !newPassword) {
      setMessage('请填写 reset_token 与新密码。');
      return;
    }

    try {
      setSubmitting(true);
      const response = await passwordResetConfirm({
        reset_token: resetToken.trim(),
        new_password: newPassword,
      });
      setMessage(`重置确认结果：${response.result}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '确认重置失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">密码重置</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">重置 8Feet 账户密码</h1>
          <p className="max-w-2xl mx-auto text-base leading-7 text-slate-600">
            先发起密码重置，再输入重置令牌与新密码完成确认。
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">重置流程</h2>
              <p className="mt-2 text-sm text-slate-600">接口：`/api/v1/auth/password/reset-request` 与 `/reset-confirm`。</p>
            </div>

            <div className="grid gap-5">
              <div>
                <Label htmlFor="reset-username">用户名/邮箱</Label>
                <Input
                  id="reset-username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="请输入用户名或邮箱"
                />
              </div>
              <Button onClick={handleRequestReset} disabled={submitting}>
                {submitting ? '提交中...' : '发起密码重置'}
              </Button>

              <div>
                <Label htmlFor="reset-token">reset_token</Label>
                <Input
                  id="reset-token"
                  type="text"
                  value={resetToken}
                  onChange={(event) => setResetToken(event.target.value)}
                  placeholder="请输入重置令牌"
                />
              </div>
              <div>
                <Label htmlFor="reset-new-password">新密码</Label>
                <Input
                  id="reset-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="请输入新密码"
                />
              </div>
              <Button variant="secondary" onClick={handleConfirmReset} disabled={submitting}>
                {submitting ? '提交中...' : '确认密码重置'}
              </Button>
            </div>

            {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          </Card>

          <Card className="space-y-5 bg-slate-950 text-white">
            <div>
              <h3 className="text-xl font-semibold">操作说明</h3>
              <p className="mt-3 text-sm text-slate-300">
                发起重置后，根据后端返回的流程获取 `reset_token`，再完成新密码提交。
              </p>
            </div>
            <div className="space-y-3 text-sm leading-6 text-slate-300">
              <p className="border-t border-slate-800 pt-3">- 第一步：填写用户名/邮箱</p>
              <p className="border-t border-slate-800 pt-3">- 第二步：输入 reset_token 与新密码</p>
              <p className="border-t border-slate-800 pt-3">- 第三步：返回登录页验证</p>
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
