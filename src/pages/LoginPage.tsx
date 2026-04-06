import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { login } from '../api/client';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage('请先填写用户名和密码。');
      return;
    }

    try {
      setSubmitting(true);
      const response = await login({ username, password });
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      setMessage(`登录成功：${response.nickname}（${response.role}）`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '登录失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">黑白极简设计</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">登录 8Feet 智能调研平台</h1>
          <p className="max-w-2xl mx-auto text-base leading-7 text-slate-600">
            通过简洁清晰的界面快速开始深度调研流程，登录后即可创建、跟踪和导出调研报告。
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">账号登录</h2>
              <p className="mt-2 text-sm text-slate-600">输入您的邮箱与密码，立即进入平台。</p>
            </div>

            <div className="grid gap-5">
              <div>
                <Label htmlFor="login-username">用户名/邮箱</Label>
                <Input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="请输入用户名或邮箱"
                />
              </div>
              <div>
                <Label htmlFor="login-password">密码</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="请输入密码"
                />
              </div>
            </div>

            {message ? <p className="text-sm text-slate-600">{message}</p> : null}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button className="w-full sm:w-auto" onClick={handleLogin} disabled={submitting}>
                {submitting ? '登录中...' : '登录'}
              </Button>
              <div className="flex items-center gap-4">
                <Link to="/reset-password" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                  重置密码
                </Link>
                <Link to="/register" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                  注册新账号
                </Link>
              </div>
            </div>
          </Card>

          <Card className="space-y-5 bg-slate-950 text-white">
            <div>
              <h3 className="text-xl font-semibold">为什么选择 8Feet</h3>
              <p className="mt-3 text-sm text-slate-300">
                简练界面、专业数据结构、任务可视化流程，为调研工作提供无缝闭环支持。
              </p>
            </div>
            <div className="space-y-3 text-sm leading-6 text-slate-300">
              <p className="border-t border-slate-800 pt-3">- 一体化调研任务创建与管理</p>
              <p className="border-t border-slate-800 pt-3">- 清晰流程节点与简洁报告预览</p>
              <p className="border-t border-slate-800 pt-3">- 黑白极简界面，专注内容与决策</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
