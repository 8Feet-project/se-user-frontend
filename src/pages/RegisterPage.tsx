import { Bot, MailCheck, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { register, sendEmailCode } from '@/api/client';
import { AuthShell } from '@/components/common/AuthShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveAuthSession } from '@/lib/auth';

const steps = [
  {
    icon: MailCheck,
    title: '企业邮箱校验',
    desc: '支持发送注册验证码，注册时由后端一次性完成验码与用户创建。',
  },
  {
    icon: Bot,
    title: '默认进入 AI 调研工作流',
    desc: '注册完成后即可开始发起任务、查看流程与管理报告。',
  },
  {
    icon: ShieldCheck,
    title: '邀请制与手机号兼容',
    desc: '邀请码、手机号都是可选项，便于兼顾不同团队的接入方式。',
  },
];

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [password, setPassword] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [registerSucceeded, setRegisterSucceeded] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    const trimmedUsername = username.trim();
    const trimmedNickname = nickname.trim();
    const trimmedEmail = email.trim();
    const trimmedEmailCode = emailCode.trim();

    if (!trimmedUsername || !trimmedNickname || !trimmedEmail || !trimmedEmailCode || !password) {
      setMessage('请先填写用户名、昵称、邮箱、验证码和密码。');
      setRegisterSucceeded(false);
      return;
    }

    try {
      setSubmitting(true);
      const response = await register({
        username: trimmedUsername,
        nickname: trimmedNickname,
        email: trimmedEmail,
        email_code: trimmedEmailCode,
        password,
        phone: phone.trim() || undefined,
        invite_code: inviteCode.trim() || undefined,
      });
      saveAuthSession(response);
      setRegisterSucceeded(true);
      setMessage(`注册成功，用户 ID：${response.user_id}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '注册失败';
      setRegisterSucceeded(false);
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendEmailCode = async () => {
    if (!email.trim()) {
      setMessage('请先填写邮箱。');
      return;
    }

    try {
      setSubmitting(true);
      const response = await sendEmailCode({ email: email.trim(), scene: 'register' });
      setMessage(`验证码已发送，结果：${response.result}，有效期 ${response.expire_in}s。请在注册时一并提交邮箱和验证码。`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '发送验证码失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      topActions={
        <Link className="text-slate-400 transition hover:text-slate-200" to="/login">
          已有账号，去登录
        </Link>
      }
      aside={
        <Card variant="glow" className="p-8 sm:p-10">
          <div className="space-y-3">
            <p className="page-kicker">Create Account</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-100">把调研团队带进统一平台。</h2>
            <p className="text-sm leading-7 text-slate-400">
              注册完成后，你可以直接进入 8Feet 的深色工作台，使用同一套设计语言管理任务、流程、报告与收藏资产。
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {steps.map((item) => (
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

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
            <p className="font-medium text-slate-100">推荐路径</p>
            <p className="mt-2 text-slate-400">填写基础信息 → 发送验证码 → 输入验证码 → 提交注册。</p>
          </div>
        </Card>
      }
    >
      <Card variant="glass" className="p-8 sm:p-10">
        <div className="space-y-2">
          <p className="page-kicker">新建账号</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100">开始使用 8Feet 调研平台</h1>
          <p className="text-sm leading-7 text-slate-400">
            完成账号注册后，你就可以体验任务发起、流程跟踪、报告追问与历史资产沉淀等完整功能。
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="register-username">用户名</Label>
            <Input id="register-username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="请输入用户名" />
          </div>
          <div>
            <Label htmlFor="register-nickname">昵称</Label>
            <Input id="register-nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="请输入昵称" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="register-email">邮箱</Label>
            <Input id="register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="请输入企业邮箱" />
          </div>
          <div className="sm:col-span-2 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <Label htmlFor="register-email-code">邮箱验证码</Label>
              <Input id="register-email-code" value={emailCode} onChange={(event) => setEmailCode(event.target.value)} placeholder="请输入验证码" />
            </div>
            <Button type="button" variant="secondary" onClick={handleSendEmailCode} disabled={submitting}>
              发送验证码
            </Button>
          </div>
          <div className="sm:col-span-2 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
            验证说明：注册接口会连同邮箱和验证码一起提交，由后端完成验码与创建用户。
          </div>
          <div>
            <Label htmlFor="register-phone">手机号（可选）</Label>
            <Input id="register-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="请输入手机号" />
          </div>
          <div>
            <Label htmlFor="register-invite-code">邀请码（可选）</Label>
            <Input id="register-invite-code" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="请输入邀请码" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="register-password">密码</Label>
            <Input id="register-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="请设置安全密码" />
          </div>
        </div>

        {message ? (
          <div
            className={`mt-6 rounded-[24px] border px-4 py-3 text-sm ${
              registerSucceeded
                ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
                : 'message-strip'
            }`}
          >
            <p>{message}</p>
            {registerSucceeded ? (
              <p className="mt-2 text-xs text-emerald-200/90">
                当前账号已完成注册并写入登录令牌，可直接进入任务发起页继续体验主业务链路。
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button className="w-full sm:w-auto" size="lg" onClick={handleRegister} disabled={submitting}>
              {submitting ? '注册中...' : '注册并继续'}
            </Button>
            {registerSucceeded ? (
              <Link to="/launch" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto">
                  进入任务发起页
                </Button>
              </Link>
            ) : null}
          </div>
          <p className="text-sm text-slate-400">
            已有账号？
            <Link className="ml-2 text-[#63cab7] transition hover:text-[#7dd8c9]" to="/login">
              立即登录
            </Link>
          </p>
        </div>
      </Card>
    </AuthShell>
  );
}
