import { useEffect, useState } from 'react';
import { changeCurrentUserPassword, getCurrentUserProfile, updateCurrentUserProfile } from '../api/client';
import { PageShell } from '../components/common/PageShell';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import type { UserProfile } from '../types';

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
      setMessage(`资料更新成功：${response.updated_fields.join(', ') || '无变化'}`);
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
    <PageShell title="个人中心" subtitle="对齐 /api/v1/users/me 与 /api/v1/users/me/password 接口。">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">个人资料</h2>
            <p className="mt-2 text-sm text-slate-600">支持查询与更新昵称、邮箱、手机号、头像地址。</p>
          </div>
          <div className="grid gap-5">
            <div>
              <Label htmlFor="profile-nickname">nickname</Label>
              <Input id="profile-nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="profile-email">email</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="profile-phone">phone</Label>
              <Input id="profile-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="profile-avatar-url">avatar_url</Label>
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
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        </Card>

        <Card className="space-y-6 bg-slate-950 text-white">
          <div>
            <h3 className="text-xl font-semibold">修改密码</h3>
            <p className="mt-2 text-sm text-slate-300">调用 `PATCH /api/v1/users/me/password`。</p>
          </div>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="profile-old-password">old_password</Label>
              <Input
                id="profile-old-password"
                type="password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="profile-new-password">new_password</Label>
              <Input
                id="profile-new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
          </div>
          <Button variant="secondary" onClick={handleChangePassword} disabled={submitting}>
            提交新密码
          </Button>
          <div className="text-sm text-slate-300">
            <p>user_id: {profile?.user_id ?? '-'}</p>
            <p>username: {profile?.username ?? '-'}</p>
            <p>role: {profile?.role ?? '-'}</p>
            <p>email_verified: {profile ? String(profile.email_verified) : '-'}</p>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
