import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Settings2, ShieldCheck, Trash2, Wifi } from 'lucide-react';
import {
  assignAdminModelPermissions,
  createAdminModel,
  deleteAdminModel,
  getAdminModels,
  getCurrentUserPermissions,
  testAdminModelConnection,
  updateAdminModel,
} from '../api/client';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import type { AdminModelItem, AdminModelPermissionRequest } from '../types';

const defaultForm = {
  model_name: '',
  provider: 'OpenAI',
  api_base_url: '',
  api_key: '',
  input_price_1m: '0',
  output_price_1m: '0',
  description: '',
  enabled: 'true',
};

const priceMin = 0;

function parseUserIds(value: string) {
  return value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
}

export function AdminModelsPage() {
  const [models, setModels] = useState<AdminModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);
  const [permissionPayload, setPermissionPayload] = useState<AdminModelPermissionRequest>({
    user_ids: [1001],
    group_ids: ['group-admin'],
  });

  const loadModels = async () => {
    setLoading(true);
    try {
      const response = await getAdminModels();
      setModels(response.list);
      const current = response.list[0];
      if (current) {
        setSelectedModelId((prev) => (prev && response.list.some((item) => item.model_id === prev) ? prev : current.model_id));
      } else {
        setSelectedModelId('');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPermissions = async () => {
    try {
      const response = await getCurrentUserPermissions();
      setCurrentPermissions(response.permissions);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '无法加载当前权限';
      setFeedback({ tone: 'error', text: reason });
    }
  };

  useEffect(() => {
    void loadModels();
    void loadCurrentPermissions();
  }, []);

  const selectedModel = useMemo(() => {
    return models.find((item) => item.model_id === selectedModelId) ?? null;
  }, [models, selectedModelId]);

  const visibleModels = useMemo(() => {
    if (!selectedModelId) {
      return models;
    }

    const selectedIndex = models.findIndex((item) => item.model_id === selectedModelId);
    if (selectedIndex <= 0) {
      return models;
    }

    const selected = models[selectedIndex];
    return [selected, ...models.slice(0, selectedIndex), ...models.slice(selectedIndex + 1)];
  }, [models, selectedModelId]);

  useEffect(() => {
    if (!selectedModel) {
      setForm(defaultForm);
      return;
    }
    setForm({
      model_name: selectedModel.model_name,
      provider: selectedModel.provider,
      api_base_url: selectedModel.api_base_url,
      api_key: '',
      input_price_1m: String(selectedModel.input_price_1m ?? 0),
      output_price_1m: String(selectedModel.output_price_1m ?? 0),
      description: selectedModel.description ?? '',
      enabled: String(selectedModel.enabled),
    });
  }, [selectedModel]);

  const canAssignPermissions = currentPermissions.includes('admin:model:permission') || currentPermissions.includes('admin:model:write');

  const validateForm = () => {
    const inputPrice = Number(form.input_price_1m);
    const outputPrice = Number(form.output_price_1m);

    if (!form.model_name.trim() || !form.provider.trim() || !form.api_base_url.trim()) {
      return '模型名称、提供商、API Base URL 为必填项。';
    }
    if (!Number.isFinite(inputPrice) || inputPrice < priceMin) {
      return '输入单价需为大于等于 0 的数字。';
    }
    if (!Number.isFinite(outputPrice) || outputPrice < priceMin) {
      return '输出单价需为大于等于 0 的数字。';
    }
    return '';
  };

  const handleCreate = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFeedback({ tone: 'error', text: validationError });
      return;
    }

    setSaving(true);
    try {
      const response = await createAdminModel({
        model_name: form.model_name.trim(),
        provider: form.provider.trim(),
        api_base_url: form.api_base_url.trim(),
        api_key: form.api_key,
        input_price_1m: Number(form.input_price_1m),
        output_price_1m: Number(form.output_price_1m),
        description: form.description.trim() || undefined,
        enabled: form.enabled === 'true',
      });

      const testResult = await testAdminModelConnection(response.model_id);
      if (!testResult.success) {
        await deleteAdminModel(response.model_id);
        await loadModels();
        setFeedback({ tone: 'error', text: '连接测试失败，请检查 API 密钥或网络配置。模型没有保存。' });
        return;
      }

      await loadModels();
      setSelectedModelId(response.model_id);
      setFeedback({ tone: 'success', text: '模型创建成功并通过连通性校验，配置已生效。' });
    } catch (error) {
      const reason = error instanceof Error ? error.message : '新增模型失败';
      setFeedback({ tone: 'error', text: reason });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedModel) {
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setFeedback({ tone: 'error', text: validationError });
      return;
    }

    const rollbackPayload = {
      model_name: selectedModel.model_name,
      provider: selectedModel.provider,
      api_base_url: selectedModel.api_base_url,
      input_price_1m: selectedModel.input_price_1m ?? 0,
      output_price_1m: selectedModel.output_price_1m ?? 0,
      description: selectedModel.description ?? '',
      enabled: selectedModel.enabled,
    };

    setSaving(true);
    try {
      await updateAdminModel(selectedModel.model_id, {
        model_name: form.model_name.trim(),
        provider: form.provider.trim(),
        api_base_url: form.api_base_url.trim(),
        api_key: form.api_key || undefined,
        input_price_1m: Number(form.input_price_1m),
        output_price_1m: Number(form.output_price_1m),
        description: form.description.trim() || undefined,
        enabled: form.enabled === 'true',
      });

      const testResult = await testAdminModelConnection(selectedModel.model_id);
      if (!testResult.success) {
        await updateAdminModel(selectedModel.model_id, rollbackPayload);
        await loadModels();
        setFeedback({ tone: 'error', text: '连接测试失败，请检查 API 密钥或网络配置。本次修改没有生效。' });
        return;
      }

      await loadModels();
      setFeedback({ tone: 'success', text: '保存成功并通过连通性校验。' });
    } catch (error) {
      const reason = error instanceof Error ? error.message : '更新模型失败';
      setFeedback({ tone: 'error', text: reason });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedModel) {
      return;
    }

    const shouldDelete = window.confirm(`确认删除模型 ${selectedModel.model_name} 吗？`);
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteAdminModel(selectedModel.model_id);
      await loadModels();
      setFeedback({ tone: 'success', text: '模型已删除。' });
    } catch (error) {
      const reason = error instanceof Error ? error.message : '删除模型失败';
      setFeedback({ tone: 'error', text: reason });
    }
  };

  const handleTestConnection = async () => {
    if (!selectedModel) {
      return;
    }

    setTesting(true);
    try {
      const response = await testAdminModelConnection(selectedModel.model_id);
      await loadModels();
      if (response.success) {
        setFeedback({ tone: 'success', text: `连接测试成功，延迟 ${response.latency_ms}ms。` });
      } else {
        setFeedback({ tone: 'error', text: response.message || '连接测试失败，请检查 API 密钥或网络配置。' });
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : '连接测试失败';
      setFeedback({ tone: 'error', text: reason });
    } finally {
      setTesting(false);
    }
  };

  const handleAssignPermissions = async () => {
    if (!selectedModel) {
      return;
    }

    if (!canAssignPermissions) {
      setFeedback({ tone: 'error', text: '你没有分配模型权限的权限，请联系超级管理员。' });
      return;
    }

    const hasGrantTarget = (permissionPayload.user_ids?.length ?? 0) > 0 || (permissionPayload.group_ids?.length ?? 0) > 0;
    if (!hasGrantTarget) {
      setFeedback({ tone: 'error', text: '请至少指定 1 个用户或用户组。' });
      return;
    }

    try {
      await assignAdminModelPermissions(selectedModel.model_id, permissionPayload);
      await loadModels();
      setFeedback({ tone: 'success', text: '模型权限已分配。' });
    } catch (error) {
      const reason = error instanceof Error ? error.message : '模型权限分配失败';
      setFeedback({ tone: 'error', text: reason });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 text-slate-100">
      <header className="flex flex-col gap-4 rounded-[28px] border border-slate-800 bg-slate-900/60 p-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Model Management</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">大模型参数配置与权限管理</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            配置模型接入参数，检查连接状态，并管理谁可以使用这些模型。
          </p>
        </div>
        <Button variant="secondary" onClick={() => void loadModels()} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200">
          <RefreshCw className="mr-2 h-4 w-4" />
          {loading ? '刷新中...' : '刷新模型'}
        </Button>
      </header>

      {feedback ? (
        <div
          className={`rounded-3xl border px-4 py-3 text-sm ${
            feedback.tone === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-100'
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      <section className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="min-h-0 rounded-[28px] border border-slate-800 bg-slate-900/70 p-5">
              <div className="mb-4 flex items-center justify-between px-1">
                <div>
                  <h2 className="text-lg font-semibold text-white">模型列表</h2>
                  <p className="mt-1 text-sm text-slate-400">查看连接状态、启停状态与授权范围摘要。</p>
                </div>
                <Badge variant="secondary" className="bg-slate-800 text-slate-200">
              {models.length} 个模型
            </Badge>
          </div>
          <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 330px)' }}>
            {visibleModels.map((item) => {
              const active = item.model_id === selectedModelId;
              return (
                <button
                  key={item.model_id}
                  type="button"
                  onClick={() => setSelectedModelId(item.model_id)}
                  className={`w-full rounded-3xl border p-4 text-left transition ${
                    active
                      ? 'border-sky-500/50 bg-sky-500/10 shadow-lg shadow-sky-950/20'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold text-white">{item.model_name}</div>
                      <div className="mt-1 text-sm text-slate-400">{item.provider}</div>
                    </div>
                    <ConnectionBadge status={item.connectivity_status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                    <Badge variant="secondary" className="bg-slate-800 text-slate-200">
                      {item.enabled ? '已启用' : '已停用'}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">{item.granted_scope_summary || '未配置授权范围'}</p>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="min-h-0 space-y-6 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Card className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">模型参数表单</h2>
                <p className="mt-1 text-sm text-slate-400">填写模型名称、服务地址、密钥、计费信息和启用状态。</p>
              </div>
              <Settings2 className="h-5 w-5 text-slate-500" />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="模型名称">
                <Input value={form.model_name} onChange={(event) => setForm((prev) => ({ ...prev, model_name: event.target.value }))} className="h-12 rounded-2xl border-slate-700 bg-slate-950/80 px-4 text-slate-100" />
              </Field>
              <Field label="提供商">
                <Input value={form.provider} onChange={(event) => setForm((prev) => ({ ...prev, provider: event.target.value }))} className="h-12 rounded-2xl border-slate-700 bg-slate-950/80 px-4 text-slate-100" />
              </Field>
              <Field label="API Base URL">
                <Input value={form.api_base_url} onChange={(event) => setForm((prev) => ({ ...prev, api_base_url: event.target.value }))} className="h-12 rounded-2xl border-slate-700 bg-slate-950/80 px-4 text-slate-100" />
              </Field>
              <Field label="API Key">
                <Input value={form.api_key} onChange={(event) => setForm((prev) => ({ ...prev, api_key: event.target.value }))} className="h-12 rounded-2xl border-slate-700 bg-slate-950/80 px-4 text-slate-100" placeholder="编辑时可留空表示不更新" />
              </Field>
              <Field label="输入单价 / 1M Tokens">
                <Input
                  value={form.input_price_1m}
                  onChange={(event) => setForm((prev) => ({ ...prev, input_price_1m: event.target.value }))}
                  className="h-12 rounded-2xl border-slate-700 bg-slate-950/80 px-4 text-slate-100"
                />
              </Field>
              <Field label="输出单价 / 1M Tokens">
                <Input
                  value={form.output_price_1m}
                  onChange={(event) => setForm((prev) => ({ ...prev, output_price_1m: event.target.value }))}
                  className="h-12 rounded-2xl border-slate-700 bg-slate-950/80 px-4 text-slate-100"
                />
              </Field>
              <Field label="启用状态">
                <Select value={form.enabled} onChange={(event) => setForm((prev) => ({ ...prev, enabled: event.target.value }))}>
                  <option value="true">启用</option>
                  <option value="false">停用</option>
                </Select>
              </Field>
              <Field label="模型描述">
                <Textarea
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="min-h-28 rounded-2xl border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100"
                  placeholder="填写模型推荐使用场景、优势和限制"
                />
              </Field>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => void handleCreate()} className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400" disabled={saving}>
                {saving ? '提交中...' : '新增模型'}
              </Button>
              <Button onClick={() => void handleUpdate()} variant="secondary" className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200" disabled={!selectedModel || saving}>
                保存修改
              </Button>
              <Button onClick={() => void handleDelete()} variant="secondary" className="rounded-2xl bg-rose-500/15 text-rose-100 hover:bg-rose-500/25" disabled={!selectedModel}>
                <Trash2 className="mr-2 h-4 w-4" />
                删除模型
              </Button>
            </div>
          </Card>

          <Card className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">连接测试与权限分配</h2>
                <p className="mt-1 text-sm text-slate-400">先确认连接可用，再分配给用户或用户组。</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-slate-500" />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="授权用户 ID（正整数，逗号分隔）">
                <Input
                  value={(permissionPayload.user_ids ?? []).join(',')}
                  onChange={(event) =>
                    setPermissionPayload((prev) => ({
                      ...prev,
                      user_ids: parseUserIds(event.target.value),
                    }))
                  }
                  className="h-12 rounded-2xl border-slate-700 bg-slate-950/80 px-4 text-slate-100"
                />
              </Field>
              <Field label="授权用户组 ID（逗号分隔）">
                <Input
                  value={(permissionPayload.group_ids ?? []).join(',')}
                  onChange={(event) =>
                    setPermissionPayload((prev) => ({
                      ...prev,
                      group_ids: event.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                    }))
                  }
                  className="h-12 rounded-2xl border-slate-700 bg-slate-950/80 px-4 text-slate-100"
                />
              </Field>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => void handleTestConnection()} variant="secondary" className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200" disabled={!selectedModel || testing}>
                <Wifi className="mr-2 h-4 w-4" />
                {testing ? '测试中...' : '测试连接'}
              </Button>
              <Button onClick={() => void handleAssignPermissions()} className="rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400" disabled={!selectedModel}>
                分配模型权限
              </Button>
            </div>
            {selectedModel ? (
              <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
                当前选择模型：<span className="font-medium text-white">{selectedModel.model_name}</span>，连接状态为{' '}
                <span className="text-sky-300">{selectedModel.connectivity_status}</span>，授权摘要：{selectedModel.granted_scope_summary || '未配置'}。
              </div>
            ) : null}
            <p className="mt-4 text-xs leading-5 text-slate-500">
              只有具备模型管理权限的账号才能调整授权。
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-slate-300">{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ConnectionBadge({ status }: { status: AdminModelItem['connectivity_status'] }) {
  const className =
    status === 'connected'
      ? 'bg-emerald-500/15 text-emerald-200'
      : status === 'failed'
        ? 'bg-rose-500/15 text-rose-200'
        : status === 'testing'
          ? 'bg-amber-500/15 text-amber-200'
          : 'bg-slate-800 text-slate-200';
  return <Badge className={className}>{status}</Badge>;
}
