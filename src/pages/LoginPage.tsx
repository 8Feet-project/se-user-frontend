import { ArrowRight, FileText, GitBranch, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { login } from '@/api/client';
import { AuthShell } from '@/components/common/AuthShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const highlights = [
  {
    icon: Sparkles,
    title: 'AI 深度调研工作流',
    desc: '从任务创建、信息检索到报告生成，统一在一套工作台里完成。',
  },
  {
    icon: GitBranch,
    title: '过程可追踪',
    desc: '随时查看节点状态、事件流与人工干预入口，分析过程不再黑盒。',
  },
  {
    icon: FileText,
    title: '报告可追问',
    desc: '报告支持继续提问、引用溯源与多格式导出，方便团队复用。',
  },
];

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
      setMessage(`登录成功，欢迎回来：${response.nickname}（${response.role}）。`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '登录失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      topActions={
        <>
          <Link className="text-slate-400 transition hover:text-slate-200" to="/register">
            注册
          </Link>
          <Link className="rounded-full border border-[rgba(99,202,183,0.18)] bg-white/[0.04] px-3 py-1.5 text-slate-200 transition hover:border-[rgba(99,202,183,0.35)] hover:text-white" to="/platform-init">
            平台初始化
          </Link>
        </>
      }
      aside={
        <Card variant="glow" className="relative overflow-hidden p-8 sm:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#63cab7]/40 to-transparent" />
          <div className="space-y-4">
            <p className="page-kicker">8Feet Design System</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-100">让商业情报研究进入统一工作流。</h2>
            <p className="text-sm leading-7 text-slate-400">
              深海军蓝基底、AI teal 强调色、可追踪流程与可溯源报告，正是这套设计系统要传达的产品气质。
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {highlights.map((item) => (
              <div key={item.title} className="panel-subtle p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.2)] bg-[rgba(99,202,183,0.08)] text-[#63cab7]">
                    <item.icon size={16} strokeWidth={1.9} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      }
    >
      <Card variant="glass" className="p-8 sm:p-10">
        <div className="space-y-2">
          <p className="page-kicker">账户入口</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100">登录 8Feet 智能调研平台</h1>
          <p className="text-sm leading-7 text-slate-400">
            输入您的用户名与密码，继续查看任务流程、报告内容与团队沉淀下来的调研资产。
          </p>
        </div>

        <div className="mt-8 grid gap-5">
          <div>
            <Label htmlFor="login-username">用户名 / 邮箱</Label>
            <Input
              id="login-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="请输入用户名或企业邮箱"
            />
          </div>
          <div>
            <Label htmlFor="login-password">密码</Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入登录密码"
            />
          </div>
        </div>

        {message ? <div className="message-strip mt-6">{message}</div> : null}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button className="w-full sm:w-auto" size="lg" onClick={handleLogin} disabled={submitting}>
            {submitting ? '登录中...' : '登录'}
            <ArrowRight size={16} />
          </Button>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <Link className="transition hover:text-slate-200" to="/reset-password">
              重置密码
            </Link>
            <Link className="transition hover:text-[#63cab7]" to="/register">
              注册新账号
            </Link>
          </div>
        </div>
      </Card>
    </AuthShell>
  );
}
