import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { register } from '../api/client';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setMessage('请先填写用户名、邮箱和密码。');
      return;
    }

    try {
      setSubmitting(true);
      const response = await register({
        username,
        email,
        password,
        phone: phone || undefined,
        invite_code: inviteCode || undefined,
      });
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      setMessage(`注册成功：${response.user_id}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '注册失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">创建账号</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">开始使用 8Feet 调研平台</h1>
          <p className="max-w-2xl mx-auto text-base leading-7 text-slate-600">
            注册后即可体验任务发起、流程管理、报告生成与历史数据回溯。
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">账号注册</h2>
              <p className="mt-2 text-sm text-slate-600">填写基本信息，快速开始业务对象深度调研。</p>
            </div>

            <div className="grid gap-5">
              <div>
                <Label htmlFor="register-username">用户名</Label>
                <Input
                  id="register-username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <Label htmlFor="register-email">邮箱</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="请输入企业邮箱"
                />
              </div>
              <div>
                <Label htmlFor="register-phone">手机号（可选）</Label>
                <Input
                  id="register-phone"
                  type="text"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="请输入手机号"
                />
              </div>
              <div>
                <Label htmlFor="register-invite-code">邀请码（可选）</Label>
                <Input
                  id="register-invite-code"
                  type="text"
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value)}
                  placeholder="请输入邀请码"
                />
              </div>
              <div>
                <Label htmlFor="register-password">密码</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="设置安全密码"
                />
              </div>
            </div>

            {message ? <p className="text-sm text-slate-600">{message}</p> : null}

            <Button className="w-full" onClick={handleRegister} disabled={submitting}>
              {submitting ? '注册中...' : '注册并继续'}
            </Button>
            <p className="text-center text-sm text-slate-600">
              已有账号？{' '}
              <Link to="/login" className="font-medium text-slate-950 hover:text-slate-700">
                立即登录
              </Link>
            </p>
          </Card>

          <Card className="space-y-5 bg-slate-950 text-white">
            <div>
              <h3 className="text-xl font-semibold">核心价值</h3>
              <p className="mt-3 text-sm text-slate-300">
                统一调研流程、任务高效复用、报告可视化输出，让每次分析更具决策价值。
              </p>
            </div>
            <div className="space-y-3 text-sm leading-6 text-slate-300">
              <p className="border-t border-slate-800 pt-3">- 简洁界面，快速上手</p>
              <p className="border-t border-slate-800 pt-3">- 结构化调研任务管理</p>
              <p className="border-t border-slate-800 pt-3">- 可复用的调研与报告输出</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
