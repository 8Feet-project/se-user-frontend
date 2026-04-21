import { ArrowRight, FileText, GitBranch, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { login } from '@/api/client';
import { AuthShell } from '@/components/common/AuthShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type LoginMode = 'username' | 'email';

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

const loginModes: Array<{
  value: LoginMode;
  label: string;
  description: string;
  fieldLabel: string;
  placeholder: string;
  inputType: 'text' | 'email';
}> = [
  {
    value: 'username',
    label: '用用户名登录',
    description: '适合已分配平台用户名的团队成员。',
    fieldLabel: '用户名',
    placeholder: '请输入用户名',
    inputType: 'text',
  },
  {
    value: 'email',
    label: '用邮箱登录',
    description: '适合通过企业邮箱统一接入的平台账号。',
    fieldLabel: '邮箱',
    placeholder: '请输入企业邮箱',
    inputType: 'email',
  },
];

export function LoginPage() {
  const [loginMode, setLoginMode] = useState<LoginMode>('username');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loginSucceeded, setLoginSucceeded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeLoginMode = loginModes.find((item) => item.value === loginMode) ?? loginModes[0];

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const payload =
      loginMode === 'username'
        ? trimmedUsername
          ? { login_type: 'username' as const, username: trimmedUsername, password }
          : null
        : trimmedEmail
          ? { login_type: 'email' as const, email: trimmedEmail, password }
          : null;

    if (!payload || !password) {
      setMessage(loginMode === 'username' ? '请先填写用户名和密码。' : '请先填写邮箱和密码。');
      setLoginSucceeded(false);
      return;
    }

    try {
      setSubmitting(true);
      const response = await login(payload);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      setLoginSucceeded(true);
      setMessage(`登录成功，欢迎回来：${response.nickname}（${response.role}）。`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '登录失败';
      setLoginSucceeded(false);
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
          <Link
            className="rounded-full border border-[rgba(99,202,183,0.18)] bg-white/[0.04] px-3 py-1.5 text-slate-200 transition hover:border-[rgba(99,202,183,0.35)] hover:text-white"
            to="/platform-init"
          >
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
            选择用户名登录或邮箱登录，继续查看任务流程、报告内容与团队沉淀下来的调研资产。
          </p>
        </div>

        <div className="mt-8">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-slate-950/40 p-1">
            {loginModes.map((item) => {
              const isActive = item.value === loginMode;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setLoginMode(item.value);
                    setMessage('');
                    setLoginSucceeded(false);
                  }}
                  className={cn(
                    'rounded-xl px-4 py-3 text-left transition',
                    isActive
                      ? 'bg-[rgba(99,202,183,0.12)] text-slate-50 shadow-[inset_0_0_0_1px_rgba(99,202,183,0.3)]'
                      : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200',
                  )}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className={cn('mt-1 block text-xs leading-5', isActive ? 'text-slate-300' : 'text-slate-500')}>
                    {item.description}
                  </span>
                </button>
              );
            })}
          </div>

          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              void handleLogin();
            }}
          >
            <div className="grid gap-5">
              <div>
                <Label htmlFor={`login-${loginMode}`}>{activeLoginMode.fieldLabel}</Label>
                <Input
                  id={`login-${loginMode}`}
                  type={activeLoginMode.inputType}
                  autoComplete={loginMode === 'username' ? 'username' : 'email'}
                  value={loginMode === 'username' ? username : email}
                  onChange={(event) => {
                    setMessage('');
                    setLoginSucceeded(false);

                    if (loginMode === 'username') {
                      setUsername(event.target.value);
                      return;
                    }

                    setEmail(event.target.value);
                  }}
                  placeholder={activeLoginMode.placeholder}
                />
              </div>
              <div>
                <Label htmlFor="login-password">密码</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setMessage('');
                    setLoginSucceeded(false);
                  }}
                  placeholder="请输入登录密码"
                />
              </div>
            </div>

            {message ? (
              <div
                className={cn(
                  'mt-6 rounded-[24px] border px-4 py-3 text-sm',
                  loginSucceeded
                    ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
                    : 'message-strip',
                )}
              >
                <p>{message}</p>
                {loginSucceeded ? (
                  <p className="mt-2 text-xs text-emerald-200/90">
                    访问令牌已写入本地存储。若当前为 mock 模式，可直接进入任务发起页或管理端继续验证业务链路。
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button className="w-full sm:w-auto" size="lg" type="submit" disabled={submitting}>
                  {submitting ? '登录中...' : '登录'}
                  <ArrowRight size={16} />
                </Button>
                {loginSucceeded ? (
                  <Button variant="secondary" asChild className="w-full sm:w-auto">
                    <Link to="/" className="w-full sm:w-auto">
                      进入系统
                    </Link>
                  </Button>
                ) : null}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <Link className="transition hover:text-slate-200" to="/reset-password">
                  重置密码
                </Link>
                <Link className="transition hover:text-[#63cab7]" to="/register">
                  注册新账号
                </Link>
              </div>
            </div>
          </form>
        </div>
      </Card>
    </AuthShell>
  );
}
