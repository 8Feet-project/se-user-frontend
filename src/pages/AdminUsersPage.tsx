import { useEffect, useMemo, useState } from 'react';
import { KeyRound, Plus, RefreshCw, ShieldCheck, UserCog } from 'lucide-react';
import {
  createAdminUser,
  getAdminUserDetail,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
} from '../api/client';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import type { AdminUserDetail, AdminUserStatus, AdminUserListItem, UserRole } from '../types';

const statusOptions: Array<{ label: string; value: '' | AdminUserStatus }> = [
  { label: '全部状态', value: '' },
  { label: 'active', value: 'active' },
  { label: 'pending', value: 'pending' },
  { label: 'disabled', value: 'disabled' },
];

const createRoleOptions: Array<{ label: string; value: 'admin' | 'user' }> = [
  { label: 'admin', value: 'admin' },
  { label: 'user', value: 'user' },
];

const editableStatusOptions: AdminUserStatus[] = ['active', 'pending', 'disabled'];
const editableRoles: UserRole[] = ['super_admin', 'admin', 'user'];

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | AdminUserStatus>('');
  const [form, setForm] = useState({ username: '', email: '', phone: '', role: 'admin' as 'admin' | 'user' });
  const [tempPassword, setTempPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savingDetail, setSavingDetail] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await getAdminUsers();
      setUsers(response.list);
      if (response.list[0]) {
        void handleSelectUser(response.list[0].user_id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleSelectUser = async (userId: string) => {
    setDetailLoading(true);
    try {
      const response = await getAdminUserDetail(userId);
      setSelectedUser(response);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesKeyword =
        !keyword ||
        item.username.toLowerCase().includes(keyword.toLowerCase()) ||
        item.nickname.toLowerCase().includes(keyword.toLowerCase()) ||
        item.email.toLowerCase().includes(keyword.toLowerCase());
      return matchesStatus && matchesKeyword;
    });
  }, [keyword, statusFilter, users]);

  const handleCreateUser = async () => {
    if (!form.username.trim() || !form.email.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      const response = await createAdminUser({
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
        permissions: form.role === 'admin' ? ['admin:user:read', 'admin:dashboard:read'] : ['research:task:read'],
      });
      setTempPassword(response.temp_password);
      setForm({ username: '', email: '', phone: '', role: 'admin' });
      await loadUsers();
      await handleSelectUser(response.user_id);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) {
      return;
    }
    const response = await resetAdminUserPassword(selectedUser.user_id);
    setTempPassword(response.temp_password);
  };

  const handleSaveDetail = async () => {
    if (!selectedUser) {
      return;
    }
    setSavingDetail(true);
    try {
      await updateAdminUser(selectedUser.user_id, {
        role: selectedUser.role,
        status: selectedUser.status,
        permissions: selectedUser.permissions,
      });
      await loadUsers();
      await handleSelectUser(selectedUser.user_id);
    } finally {
      setSavingDetail(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 text-slate-100">
      <header className="flex flex-col gap-4 rounded-[28px] border border-slate-800 bg-slate-900/60 p-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">User & Permission</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">用户与权限管理</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            对齐管理端账户治理需求，提供账号创建、状态切换、权限查看、模型授权查看与临时密码重置能力。
          </p>
        </div>
        <Button variant="secondary" onClick={() => void loadUsers()} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200">
          <RefreshCw className="mr-2 h-4 w-4" />
          {loading ? '刷新中...' : '刷新用户'}
        </Button>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">新建账号</h2>
              <p className="mt-1 text-sm text-slate-400">用于初始化管理账号或业务用户。</p>
            </div>
            <Badge variant="secondary" className="bg-slate-800 text-slate-200">
              Create User
            </Badge>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="admin-user-create-username" className="text-slate-300">用户名</Label>
              <Input
                id="admin-user-create-username"
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                className="h-12 rounded-2xl border-slate-700 bg-slate-950/80 px-4 text-slate-100"
                placeholder="请输入用户名"
              />
            </div>
            <div>
              <Label htmlFor="admin-user-create-email" className="text-slate-300">邮箱</Label>
              <Input
                id="admin-user-create-email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="h-12 rounded-2xl border-slate-700 bg-slate-950/80 px-4 text-slate-100"
                placeholder="请输入邮箱"
              />
            </div>
            <div>
              <Label htmlFor="admin-user-create-phone" className="text-slate-300">手机号</Label>
              <Input
                id="admin-user-create-phone"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="h-12 rounded-2xl border-slate-700 bg-slate-950/80 px-4 text-slate-100"
                placeholder="可选"
              />
            </div>
            <div>
              <Label htmlFor="admin-user-create-role" className="text-slate-300">角色</Label>
              <Select
                id="admin-user-create-role"
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as 'admin' | 'user' }))}
              >
                {createRoleOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => void handleCreateUser()} className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400" disabled={submitting}>
              <Plus className="mr-2 h-4 w-4" />
              {submitting ? '创建中...' : '创建账号'}
            </Button>
            {tempPassword ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                当前临时密码：{tempPassword}
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">筛选与统计</h2>
              <p className="mt-1 text-sm text-slate-400">按关键词与状态快速定位账号。</p>
            </div>
            <Badge variant="secondary" className="bg-slate-800 text-slate-200">
              {filteredUsers.length} / {users.length}
            </Badge>
          </div>
          <div className="mt-6 grid gap-4">
            <div>
              <Label htmlFor="admin-user-search" className="text-slate-300">关键词</Label>
              <Input
                id="admin-user-search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="h-12 rounded-2xl border-slate-700 bg-slate-950/80 px-4 text-slate-100"
                placeholder="用户名 / 昵称 / 邮箱"
              />
            </div>
            <div>
              <Label htmlFor="admin-user-status-filter" className="text-slate-300">状态</Label>
              <Select
                id="admin-user-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as '' | AdminUserStatus)}
              >
                {statusOptions.map((item) => (
                  <option key={item.label} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
              管理端支持查看用户状态、角色、最后登录时间，并可进入详情页修改权限与重置密码。
            </div>
          </div>
        </Card>
      </section>

      <section className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="min-h-0 rounded-[28px] border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-semibold text-white">账号列表</h2>
              <p className="mt-1 text-sm text-slate-400">选择账号查看权限与模型授权详情。</p>
            </div>
            <UserCog className="h-5 w-5 text-slate-500" />
          </div>
          <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 360px)' }}>
            {filteredUsers.map((item) => {
              const active = selectedUser?.user_id === item.user_id;
              return (
                <button
                  key={item.user_id}
                  type="button"
                  onClick={() => void handleSelectUser(item.user_id)}
                  className={`w-full rounded-3xl border p-4 text-left transition ${
                    active
                      ? 'border-sky-500/50 bg-sky-500/10 shadow-lg shadow-sky-950/20'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold text-white">{item.nickname}</div>
                      <div className="mt-1 text-sm text-slate-400">{item.username}</div>
                      <div className="mt-2 text-xs text-slate-500">{item.email}</div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                    <Badge variant="secondary" className="bg-slate-800 text-slate-200">
                      {item.role}
                    </Badge>
                    <span>最近登录：{item.last_login_at ? new Date(item.last_login_at).toLocaleString() : '暂无'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="min-h-0 rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">用户详情与权限</h2>
              <p className="mt-1 text-sm text-slate-400">可修改角色、状态，并查看权限树与模型授权。</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-slate-500" />
          </div>

          <div className="mt-5 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 360px)' }}>
            {detailLoading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-400">正在加载详情...</div>
            ) : selectedUser ? (
              <div className="space-y-5">
                <section className="grid gap-4 md:grid-cols-2">
                  <InfoField label="用户名" value={selectedUser.basic_info.username} />
                  <InfoField label="昵称" value={selectedUser.basic_info.nickname} />
                  <InfoField label="邮箱" value={selectedUser.basic_info.email} />
                  <InfoField label="手机号" value={selectedUser.basic_info.phone || '未填写'} />
                  <div>
                    <Label className="text-slate-300">角色</Label>
                    <Select
                      value={selectedUser.role}
                      onChange={(event) =>
                        setSelectedUser((prev) => (prev ? { ...prev, role: event.target.value as UserRole } : prev))
                      }
                    >
                      {editableRoles.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300">状态</Label>
                    <Select
                      value={selectedUser.status}
                      onChange={(event) =>
                        setSelectedUser((prev) => (prev ? { ...prev, status: event.target.value as AdminUserStatus } : prev))
                      }
                    >
                      {editableStatusOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">权限列表</h3>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-200">
                      {selectedUser.permissions.length} 项
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedUser.permissions.map((item) => (
                      <Badge key={item} variant="secondary" className="bg-slate-800 text-slate-200">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">权限树摘要</h3>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-200">
                      Tree
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-3">
                    {selectedUser.permission_tree.map((node) => (
                      <div key={node.key} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                        <div className="font-medium text-white">{node.label}</div>
                        {node.children?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {node.children.map((child) => (
                              <Badge
                                key={child.key}
                                className={child.checked ? 'bg-emerald-500/15 text-emerald-200' : 'bg-slate-800 text-slate-300'}
                              >
                                {child.label}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">模型授权</h3>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-200">
                      {selectedUser.model_permissions.length}
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedUser.model_permissions.length ? (
                      selectedUser.model_permissions.map((item) => (
                        <Badge key={item.model_id} variant="secondary" className="bg-slate-800 text-slate-200">
                          {item.model_name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">当前未分配模型权限</span>
                    )}
                  </div>
                </section>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => void handleSaveDetail()} className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400" disabled={savingDetail}>
                    {savingDetail ? '保存中...' : '保存修改'}
                  </Button>
                  <Button onClick={() => void handleResetPassword()} variant="secondary" className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200">
                    <KeyRound className="mr-2 h-4 w-4" />
                    重置密码
                  </Button>
                  {tempPassword ? (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                      临时密码：{tempPassword}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-10 text-center text-sm text-slate-500">
                请选择左侧账号查看详情。
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminUserStatus }) {
  const className =
    status === 'active'
      ? 'bg-emerald-500/15 text-emerald-200'
      : status === 'pending'
        ? 'bg-amber-500/15 text-amber-200'
        : 'bg-rose-500/15 text-rose-200';
  return <Badge className={className}>{status}</Badge>;
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-sm font-medium text-white">{value}</p>
    </div>
  );
}
