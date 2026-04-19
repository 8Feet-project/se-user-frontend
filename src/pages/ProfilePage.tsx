import { KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';

import { changeCurrentUserPassword, getCurrentUserProfile, updateCurrentUserProfile } from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserProfile } from '@/types';

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
      setPhone(data.phone);
      setAvatarUrl(data.avatar_url);
      setMessage('');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '加载个人信息失败';
      setMessage(reason);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setSubmitting(true);
      const response = await updateCurrentUserProfile({
        nickname: nickname.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
      });
      setMessage(`资料更新成功：${response.updated_fields.join(', ') || '无字段变化'}`);
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
      setMessage(`密码修改结果：${response.result}`);
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '修改密码失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="个人中心"
      subtitle="把个人资料和账号安全拆成两张独立面板，延续 8Feet 的深色输入、玻璃卡片和清晰层级。"
    >
      {message ? <div className="message-strip mb-6">{message}</div> : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <Card className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(99,202,183,0.26)] bg-[rgba(99,202,183,0.08)] text-lg font-semibold text-[#63cab7]">
              {profile?.nickname?.slice(0, 1) ?? profile?.username?.slice(0, 1) ?? '8'}
            </div>
            <div>
              <p className="page-kicker">Profile Settings</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-100">个人资料</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">支持更新昵称、邮箱、手机号与头像链接，资料区和安全区拆开之后更接近设计系统里的专业工作台感。</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="profile-nickname">昵称</Label>
              <Input id="profile-nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="profile-email">邮箱</Label>
              <Input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="profile-phone">手机号</Label>
              <Input id="profile-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="profile-avatar-url">头像链接</Label>
              <Input id="profile-avatar-url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleUpdateProfile} disabled={submitting}>保存资料</Button>
            <Button variant="secondary" onClick={loadProfile} disabled={submitting}>重新加载</Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card variant="glow" className="space-y-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">账户状态</h3>
            </div>
            <div className="panel-subtle space-y-2 p-4 text-sm text-slate-300">
              <p><span className="text-slate-500">用户 ID：</span>{profile?.user_id ?? '-'}</p>
              <p><span className="text-slate-500">用户名：</span>{profile?.username ?? '-'}</p>
              <p><span className="text-slate-500">账号角色：</span>{profile?.role ?? '-'}</p>
              <p><span className="text-slate-500">邮箱已验证：</span>{profile?.email_verified ? '是' : '否'}</p>
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
                <Input id="profile-old-password" type="password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} />
              </div>
              <div>
                <Label htmlFor="profile-new-password">新密码</Label>
                <Input id="profile-new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              </div>
            </div>
            <Button variant="secondary" onClick={handleChangePassword} disabled={submitting}>提交新密码</Button>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <UserRound size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">设计落地说明</h3>
            </div>
            <p className="text-sm leading-7 text-slate-400">个人中心现在更像“运营中的产品面板”而不是普通表单页：左边偏编辑，右边偏状态与安全，和新的壳层层级更一致。</p>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
