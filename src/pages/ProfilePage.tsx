import { Bot, FileText, KeyRound, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { changeCurrentUserPassword, clearUserPersona, getCurrentUserProfile, updateCurrentUserProfile } from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { PersonaSetupDialog } from '@/components/persona/PersonaSetupDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserPersona, UserProfile } from '@/types';

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('zh-CN', { hour12: false });
}

export function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [persona, setPersona] = useState<UserPersona | null>(null);
  const [personaDialogOpen, setPersonaDialogOpen] = useState(false);
  const [personaOnboarding, setPersonaOnboarding] = useState(false);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await getCurrentUserProfile();
      setProfile(data);
      setNickname(data.nickname);
      setEmail(data.email);
      setPhone(data.phone ?? '');
      setAvatarUrl(data.avatar_url ?? '');
      setPersona(data.persona ?? null);
      setMessage('');
      const shouldOpenPersona = searchParams.get('persona_setup') === '1' || data.should_prompt_persona || data.persona?.should_prompt_persona;
      if (shouldOpenPersona && !data.persona?.has_persona) {
        setPersonaOnboarding(true);
        setPersonaDialogOpen(true);
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : '加载个人信息失败';
      setMessage(reason);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const updatePersonaState = (nextPersona: UserPersona) => {
    setPersona(nextPersona);
    setProfile((current) => current ? { ...current, persona: nextPersona, should_prompt_persona: nextPersona.should_prompt_persona } : current);
    if (searchParams.get('persona_setup')) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.delete('persona_setup');
        return next;
      }, { replace: true });
    }
  };

  const openPersonaDialog = (onboarding = false) => {
    setPersonaOnboarding(onboarding);
    setPersonaDialogOpen(true);
  };

  const handleUpdateProfile = async () => {
    try {
      setSubmitting(true);
      const response = await updateCurrentUserProfile({
        nickname: nickname.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
      });
      setMessage(response.updated_fields.length ? '个人资料已保存。' : '没有需要保存的变化。');
      await loadProfile();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '更新个人信息失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setMessage('请填写旧密码和新密码。');
      return;
    }
    try {
      setSubmitting(true);
      const response = await changeCurrentUserPassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setMessage('密码已修改。');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '修改密码失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearPersona = async () => {
    try {
      setSubmitting(true);
      const response = await clearUserPersona();
      updatePersonaState(response);
      setMessage('人设已清除，后续调研将不再使用人设背景。');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '清除人设失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="个人中心"
      subtitle="查看账号状态，维护个人资料和登录密码。"
    >
      {message ? <div className="message-strip mb-6">{message}</div> : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <Card className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(99,202,183,0.26)] bg-[rgba(99,202,183,0.08)] text-lg font-semibold text-[#63cab7]">
              {profile?.nickname?.slice(0, 1) ?? profile?.username?.slice(0, 1) ?? '8'}
            </div>
            <div>
              <p className="page-kicker">个人资料</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-100">个人资料</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                这些信息会显示在你的账号资料中。
              </p>
            </div>
          </div>

          {profile ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="profile-nickname">昵称</Label>
                  <Input id="profile-nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="profile-email">邮箱</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="profile-phone">手机号</Label>
                  <Input id="profile-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="profile-avatar-url">头像链接</Label>
                  <Input
                    id="profile-avatar-url"
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleUpdateProfile} disabled={submitting}>
                  保存资料
                </Button>
                <Button variant="secondary" onClick={loadProfile} disabled={submitting}>
                  重新加载
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-[rgba(99,202,183,0.16)] bg-[rgba(7,17,31,0.5)] p-6 text-sm text-slate-400">
              {message || '暂时没有读取到个人资料，请稍后再试。'}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card variant="glow" className="space-y-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">账户状态</h3>
            </div>
            <div className="panel-subtle space-y-2 p-4 text-sm text-slate-300">
              <p>
                <span className="text-slate-500">账号编号：</span>
                {profile?.user_id ?? '-'}
              </p>
              <p>
                <span className="text-slate-500">用户名：</span>
                {profile?.username ?? '-'}
              </p>
              <p>
                <span className="text-slate-500">账号角色：</span>
                {profile?.role ?? '-'}
              </p>
              <p>
                <span className="text-slate-500">邮箱已验证：</span>
                {profile?.email_verified ? '是' : '否'}
              </p>
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-[#63cab7]" />
                <h3 className="text-xl font-semibold text-slate-100">调研人设</h3>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${
                persona?.has_persona
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
              }`}>
                {persona?.has_persona ? '已设定' : '未设定'}
              </span>
            </div>
            <div className="panel-subtle p-4">
              <div className="flex items-start gap-3">
                <FileText size={16} className="mt-1 text-[#63cab7]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-6 text-slate-300">
                    {persona?.has_persona
                      ? (persona.summary || '已保存人设分析报告，后续调研会参考你的背景和偏好。')
                      : '设定后，调研任务会参考你的身份、诉求、深度和报告风格偏好。'}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    最近更新：{formatDateTime(persona?.updated_at)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => openPersonaDialog(false)} disabled={!profile || submitting}>
                <Bot />
                {persona?.has_persona ? '重新设定' : '设定人设'}
              </Button>
              {persona?.has_persona ? (
                <Button variant="destructive" onClick={handleClearPersona} disabled={submitting}>
                  <Trash2 />
                  清除人设
                </Button>
              ) : null}
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">修改密码</h3>
            </div>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="profile-old-password">当前密码</Label>
                <Input
                  id="profile-old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="profile-new-password">新密码</Label>
                <Input
                  id="profile-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
            </div>
            <Button variant="secondary" onClick={handleChangePassword} disabled={submitting || !profile}>
              提交新密码
            </Button>
          </Card>


        </div>
      </div>

      <PersonaSetupDialog
        open={personaDialogOpen}
        onboarding={personaOnboarding}
        persona={persona}
        onOpenChange={(open) => {
          setPersonaDialogOpen(open);
          if (!open) {
            setPersonaOnboarding(false);
          }
        }}
        onPersonaChange={updatePersonaState}
        onNotice={setMessage}
      />
    </PageShell>
  );
}
