import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Settings2, ShieldCheck, Sparkles, Trash2, Wifi } from 'lucide-react';
import {
  assignAdminModelPermissions,
  createAdminModel,
  deleteAdminModel,
  getAdminModels,
  getCurrentUserPermissions,
  setAdminDefaultSummaryModel,
  testAdminModelConnection,
  updateAdminModel,
} from '../api/client';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { MultiSelect } from '../components/ui/multi-select';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import type { AdminModelItem, AdminModelPermissionOptions, AdminModelPermissionRequest } from '../types';

const defaultForm = {
  model_name: '',
  provider: 'OpenAI',
  api_base_url: '',
  api_key: '',
  context_window: '4096',
  temperature: '0.2',
  description: '',
  enabled: 'true',
};

const MIN_CONTEXT_WINDOW = 4096;
const MAX_CONTEXT_WINDOW = 1_048_576;
const MAX_TEMPERATURE = 1.5;
const DEFAULT_TEMPERATURE = 0.2;

function normalizeContextWindow(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return MIN_CONTEXT_WINDOW;
  }
  return Math.min(Math.max(parsed, MIN_CONTEXT_WINDOW), MAX_CONTEXT_WINDOW);
}

function normalizeTemperature(value: string): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TEMPERATURE;
  }
  return Math.min(Math.max(parsed, 0), MAX_TEMPERATURE);
}

const emptyPermissionOptions: AdminModelPermissionOptions = { users: [], groups: [] };

export function AdminModelsPage() {
  const [models, setModels] = useState<AdminModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [modelFormMode, setModelFormMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [defaultUpdating, setDefaultUpdating] = useState(false);
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);
  const [permissionOptions, setPermissionOptions] = useState<AdminModelPermissionOptions>(emptyPermissionOptions);
  const [permissionPayload, setPermissionPayload] = useState<AdminModelPermissionRequest>({});

  const loadModels = async () => {
    setLoading(true);
    try {
      const response = await getAdminModels();
      setModels(response.list);
      setPermissionOptions(response.permission_options ?? emptyPermissionOptions);
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
      setPermissionPayload({});
      return;
    }
    setForm({
      model_name: selectedModel.model_name,
      provider: selectedModel.provider,
      api_base_url: selectedModel.api_base_url,
      api_key: '',
      context_window: String(normalizeContextWindow(String(selectedModel.context_window ?? MIN_CONTEXT_WINDOW))),
      temperature: String(Math.min(selectedModel.temperature ?? DEFAULT_TEMPERATURE, MAX_TEMPERATURE)),
      description: selectedModel.description ?? '',
      enabled: String(selectedModel.enabled),
    });
    setPermissionPayload({
      user_ids: selectedModel.permission_user_ids ?? selectedModel.permission_users?.map((user) => user.user_id) ?? [],
      group_ids: selectedModel.permission_group_ids ?? selectedModel.permission_groups?.map((group) => group.group_id) ?? [],
    });
  }, [selectedModel]);

  const permissionUserOptions = useMemo(
    () =>
      permissionOptions.users.map((user) => ({
        value: String(user.user_id),
        label: `${user.nickname || user.username} · ${user.username} · #${user.user_id}`,
      })),
    [permissionOptions.users]
  );

  const permissionGroupOptions = useMemo(
    () =>
      permissionOptions.groups.map((group) => ({
        value: group.group_id,
        label: `${group.label} · ${group.group_id}`,
      })),
    [permissionOptions.groups]
  );

  const selectedPermissionUserValues = useMemo(
    () => (permissionPayload.user_ids ?? []).map((item) => String(item)),
    [permissionPayload.user_ids]
  );

  const selectedPermissionGroupValues = useMemo(
    () => permissionPayload.group_ids ?? [],
    [permissionPayload.group_ids]
  );

  const canAssignPermissions = currentPermissions.includes('admin:model:permission') || currentPermissions.includes('admin:model:write');
  const canManageModels = currentPermissions.includes('admin:model:write');

  const validateForm = () => {
    if (!form.model_name.trim() || !form.provider.trim() || !form.api_base_url.trim()) {
      return '模型名称、提供商、API Base URL 为必填项。';
    }
    return '';
  };

  const handleStartCreate = () => {
    setModelFormMode('create');
    setForm(defaultForm);
    setFeedback(null);
    setModelDialogOpen(true);
  };

  const handleStartEdit = () => {
    if (!selectedModel) {
      return;
    }
    setModelFormMode('edit');
    setForm({
      model_name: selectedModel.model_name,
      provider: selectedModel.provider,
      api_base_url: selectedModel.api_base_url,
      api_key: '',
      context_window: String(normalizeContextWindow(String(selectedModel.context_window ?? MIN_CONTEXT_WINDOW))),
      temperature: String(Math.min(selectedModel.temperature ?? DEFAULT_TEMPERATURE, MAX_TEMPERATURE)),
      description: selectedModel.description ?? '',
      enabled: String(selectedModel.enabled),
    });
    setFeedback(null);
    setModelDialogOpen(true);
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
        api_key: form.api_key.trim(),
        context_window: normalizeContextWindow(form.context_window),
        temperature: normalizeTemperature(form.temperature),
        description: form.description.trim() || undefined,
        enabled: form.enabled === 'true',
      });

      const testResult = await testAdminModelConnection(response.model_id);
      if (response.connectivity_status === 'failed' || !testResult.success) {
        setModelDialogOpen(false);
        await loadModels();
        setSelectedModelId(response.model_id);
        setFeedback({
          tone: 'error',
          text: `模型已保存，但连接测试失败：${testResult.message || '请检查 API 密钥或网络配置。'}`,
        });
        return;
      }

      setModelDialogOpen(false);
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
      context_window: selectedModel.context_window ?? MIN_CONTEXT_WINDOW,
      temperature: selectedModel.temperature ?? DEFAULT_TEMPERATURE,
      description: selectedModel.description ?? '',
      enabled: selectedModel.enabled,
    };

    setSaving(true);
    try {
      await updateAdminModel(selectedModel.model_id, {
        model_name: form.model_name.trim(),
        provider: form.provider.trim(),
        api_base_url: form.api_base_url.trim(),
        api_key: form.api_key.trim() || undefined,
        context_window: normalizeContextWindow(form.context_window),
        temperature: normalizeTemperature(form.temperature),
        description: form.description.trim() || undefined,
        enabled: form.enabled === 'true',
      });

      const testResult = await testAdminModelConnection(selectedModel.model_id);
      if (!testResult.success) {
        await updateAdminModel(selectedModel.model_id, rollbackPayload);
        await loadModels();
        setFeedback({
          tone: 'error',
          text: `连接测试失败，本次修改没有生效：${testResult.message || '请检查 API 密钥或网络配置。'}`,
        });
        return;
      }

      await loadModels();
      setModelDialogOpen(false);
      setFeedback({ tone: 'success', text: '保存成功并通过连通性校验。' });
    } catch (error) {
      const reason = error instanceof Error ? error.message : '更新模型失败';
      setFeedback({ tone: 'error', text: reason });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveModel = async () => {
    if (modelFormMode === 'create') {
      await handleCreate();
      return;
    }
    await handleUpdate();
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

    try {
      await assignAdminModelPermissions(selectedModel.model_id, permissionPayload);
      await loadModels();
      const hasGrantTarget = (permissionPayload.user_ids?.length ?? 0) > 0 || (permissionPayload.group_ids?.length ?? 0) > 0;
      setFeedback({ tone: 'success', text: hasGrantTarget ? '模型权限已分配。' : '模型权限已清空。' });
    } catch (error) {
      const reason = error instanceof Error ? error.message : '模型权限分配失败';
      setFeedback({ tone: 'error', text: reason });
    }
  };

  const handleSetDefaultSummaryModel = async (enabled: boolean) => {
    if (!selectedModel) {
      return;
    }
    if (!canManageModels) {
      setFeedback({ tone: 'error', text: '你没有编辑模型配置的权限，请联系超级管理员。' });
      return;
    }
    if (enabled && (!selectedModel.enabled || selectedModel.connectivity_status !== 'connected')) {
      setFeedback({ tone: 'error', text: '只能将已启用且连接正常的模型设为总结默认推荐。' });
      return;
    }

    setDefaultUpdating(true);
    try {
      await setAdminDefaultSummaryModel(selectedModel.model_id, enabled);
      await loadModels();
      setFeedback({ tone: 'success', text: enabled ? '已设为总结 Agent 默认推荐模型。' : '已取消总结默认推荐。' });
    } catch (error) {
      const reason = error instanceof Error ? error.message : '更新总结默认推荐失败';
      setFeedback({ tone: 'error', text: reason });
    } finally {
      setDefaultUpdating(false);
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
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleStartCreate} className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400" disabled={saving}>
            新增模型
          </Button>
          <Button variant="secondary" onClick={() => void loadModels()} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200">
            <RefreshCw className="mr-2 h-4 w-4" />
            {loading ? '刷新中...' : '刷新模型'}
          </Button>
        </div>
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
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">
                    {item.description || '未填写模型描述'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                    <Badge variant="secondary" className="bg-slate-800 text-slate-200">
                      {item.enabled ? '已启用' : '已停用'}
                    </Badge>
                    {item.is_default_summary_model ? (
                      <Badge variant="secondary" className="admin-summary-default-badge">
                        总结默认
                      </Badge>
                    ) : null}
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
                <h2 className="text-lg font-semibold text-white">模型配置概览</h2>
                <p className="mt-1 text-sm text-slate-400">查看当前模型接入参数，点击编辑后在弹窗中修改。</p>
              </div>
              <Settings2 className="h-5 w-5 text-slate-500" />
            </div>
            {selectedModel ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ModelInfo label="模型名称" value={selectedModel.model_name} />
                <ModelInfo label="提供商" value={selectedModel.provider} />
                <ModelInfo label="API Base URL" value={selectedModel.api_base_url} className="break-all" />
                <ModelInfo label="启用状态" value={selectedModel.enabled ? '启用' : '停用'} />
                <ModelInfo label="上下文窗口" value={`${normalizeContextWindow(String(selectedModel.context_window ?? MIN_CONTEXT_WINDOW))} tokens`} />
                <ModelInfo label="温度参数" value={String(Math.min(selectedModel.temperature ?? DEFAULT_TEMPERATURE, MAX_TEMPERATURE))} />
                <div className="md:col-span-2">
                  <ModelInfo label="模型描述" value={selectedModel.description || '未填写'} />
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-sm text-slate-500">
                请选择左侧模型查看配置，或点击新增模型创建配置。
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleStartEdit} variant="secondary" className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200" disabled={!selectedModel || saving}>
                编辑模型
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
              <Field label="授权用户">
                <MultiSelect
                  options={permissionUserOptions}
                  value={selectedPermissionUserValues}
                  onValueChange={(values) =>
                    setPermissionPayload((prev) => ({
                      ...prev,
                      user_ids: values.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0),
                    }))
                  }
                  placeholder="选择可使用该模型的用户"
                  emptyIndicator="没有可选用户"
                  maxCount={2}
                  modalPopover
                  deduplicateOptions
                  className="border-slate-700 bg-slate-950/80"
                />
              </Field>
              <Field label="授权用户组">
                <MultiSelect
                  options={permissionGroupOptions}
                  value={selectedPermissionGroupValues}
                  onValueChange={(values) =>
                    setPermissionPayload((prev) => ({
                      ...prev,
                      group_ids: values,
                    }))
                  }
                  placeholder="选择可使用该模型的用户组"
                  emptyIndicator="没有可选用户组"
                  maxCount={2}
                  modalPopover
                  deduplicateOptions
                  className="border-slate-700 bg-slate-950/80"
                />
              </Field>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              当前选择 {permissionPayload.user_ids?.length ?? 0} 个用户、{permissionPayload.group_ids?.length ?? 0} 个用户组。
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => void handleTestConnection()} variant="secondary" className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200" disabled={!selectedModel || testing}>
                <Wifi className="mr-2 h-4 w-4" />
                {testing ? '测试中...' : '测试连接'}
              </Button>
              <Button onClick={() => void handleAssignPermissions()} className="rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400" disabled={!selectedModel}>
                分配模型权限
              </Button>
              <Button
                onClick={() => void handleSetDefaultSummaryModel(!selectedModel?.is_default_summary_model)}
                variant="secondary"
                className="admin-summary-default-button rounded-2xl font-semibold disabled:opacity-70"
                disabled={!selectedModel || defaultUpdating}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {defaultUpdating
                  ? '更新中...'
                  : selectedModel?.is_default_summary_model
                    ? '取消总结默认'
                    : '设为总结默认'}
              </Button>
            </div>
            {selectedModel ? (
              <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
                当前选择模型：<span className="font-medium text-white">{selectedModel.model_name}</span>，连接状态为{' '}
                <span className="text-sky-300">{selectedModel.connectivity_status}</span>，授权摘要：{selectedModel.granted_scope_summary || '未配置'}。
                <span className="mt-2 block leading-6 text-slate-300">
                  模型描述：{selectedModel.description || '未填写模型描述'}
                </span>
                {selectedModel.is_default_summary_model ? (
                  <span className="ml-2 text-emerald-200">交叉验证总结 Agent 会优先使用该模型。</span>
                ) : null}
              </div>
            ) : null}
            <p className="mt-4 text-xs leading-5 text-slate-500">
              只有具备模型管理权限的账号才能调整授权。
            </p>
          </Card>
        </div>
      </section>

      <Dialog open={modelDialogOpen} onOpenChange={(open) => (saving ? undefined : setModelDialogOpen(open))}>
        <DialogContent className="admin-model-dialog flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden border-slate-800 bg-slate-900 p-0 text-slate-100 shadow-2xl sm:max-w-2xl">
          <DialogHeader className="admin-model-dialog-header border-b border-slate-800 bg-slate-950/70 px-6 py-5 pr-12 text-left">
            <DialogTitle className="text-xl font-semibold text-slate-100">
              {modelFormMode === 'create' ? '新增模型配置' : '编辑模型配置'}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-slate-400">
              按模块维护模型接入信息、展示参数和使用说明。API Key 留空表示不更新。
            </DialogDescription>
          </DialogHeader>

          <div className="admin-model-dialog-body min-h-0 flex-1 overflow-y-auto">
            <ModelFormSection title="基础信息">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="模型名称">
                  <Input value={form.model_name} onChange={(event) => setForm((prev) => ({ ...prev, model_name: event.target.value }))} className="admin-model-control h-11 rounded-xl border-slate-700 bg-slate-950/80 px-3 text-slate-100" />
                </Field>
                <Field label="提供商">
                  <Input value={form.provider} onChange={(event) => setForm((prev) => ({ ...prev, provider: event.target.value }))} className="admin-model-control h-11 rounded-xl border-slate-700 bg-slate-950/80 px-3 text-slate-100" />
                </Field>
                <Field label="启用状态">
                  <Select value={form.enabled} onChange={(event) => setForm((prev) => ({ ...prev, enabled: event.target.value }))} className="admin-model-control h-11 rounded-xl border-slate-700 bg-slate-950/80 px-3 text-slate-100">
                    <option value="true">启用</option>
                    <option value="false">停用</option>
                  </Select>
                </Field>
              </div>
            </ModelFormSection>

            <ModelFormSection title="服务连接">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="API Base URL">
                    <Input value={form.api_base_url} onChange={(event) => setForm((prev) => ({ ...prev, api_base_url: event.target.value }))} className="admin-model-control h-11 rounded-xl border-slate-700 bg-slate-950/80 px-3 text-slate-100" />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="API Key">
                    <Input value={form.api_key} onChange={(event) => setForm((prev) => ({ ...prev, api_key: event.target.value }))} className="admin-model-control h-11 rounded-xl border-slate-700 bg-slate-950/80 px-3 text-slate-100" placeholder={modelFormMode === 'edit' ? '留空表示不更新' : ''} />
                  </Field>
                </div>
              </div>
            </ModelFormSection>

            <ModelFormSection title="参数说明">
              <div className="grid gap-3 md:grid-cols-2">
                <ModelFormInputCard label="上下文窗口" hint="范围 4096 到 1,048,576 tokens。">
                  <Input
                    type="number"
                    min={MIN_CONTEXT_WINDOW}
                    max={MAX_CONTEXT_WINDOW}
                    step={1024}
                    value={form.context_window}
                    onChange={(event) => setForm((prev) => ({ ...prev, context_window: event.target.value }))}
                    onBlur={() => setForm((prev) => ({ ...prev, context_window: String(normalizeContextWindow(prev.context_window)) }))}
                    className="admin-model-control h-11 rounded-xl border-slate-700 bg-slate-950/80 px-3 text-slate-100"
                  />
                </ModelFormInputCard>
                <ModelFormInputCard label="温度参数" hint="超过 1.5 自动置为 1.5。">
                  <Input
                    type="number"
                    min={0}
                    max={MAX_TEMPERATURE}
                    step={0.1}
                    value={form.temperature}
                    onChange={(event) => setForm((prev) => ({ ...prev, temperature: event.target.value }))}
                    onBlur={() => setForm((prev) => ({ ...prev, temperature: String(normalizeTemperature(prev.temperature)) }))}
                    className="admin-model-control h-11 rounded-xl border-slate-700 bg-slate-950/80 px-3 text-slate-100"
                  />
                </ModelFormInputCard>
                <div className="md:col-span-2">
                  <Field label="模型描述">
                    <Textarea
                      value={form.description}
                      onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                      className="admin-model-control min-h-24 rounded-xl border-slate-700 bg-slate-950/80 px-3 py-3 text-slate-100"
                      placeholder="填写模型推荐使用场景、优势和限制"
                    />
                  </Field>
                </div>
              </div>
            </ModelFormSection>
          </div>

          <div className="admin-model-dialog-footer flex shrink-0 justify-end gap-3 border-t border-slate-800 bg-slate-950/70 px-6 py-4">
            <Button type="button" variant="secondary" onClick={() => setModelDialogOpen(false)} disabled={saving} className="admin-model-cancel-button rounded-xl border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800">
              取消
            </Button>
            <Button type="button" onClick={() => void handleSaveModel()} disabled={saving} className="admin-model-save-button rounded-xl bg-sky-500 text-white hover:bg-sky-400">
              {saving ? '提交中...' : modelFormMode === 'create' ? '保存新增' : '保存修改'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="admin-model-field-label text-slate-300">{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ModelFormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="admin-model-form-section border-b border-slate-800 px-6 py-5 last:border-b-0">
      <div className="admin-model-section-title mb-4 flex items-center gap-2 text-sm font-semibold text-slate-300">
        <span className="admin-model-section-dot h-2 w-2 rounded-full bg-sky-500" />
        {title}
      </div>
      {children}
    </section>
  );
}

function ModelFormInputCard({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="admin-model-input-card rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <Label className="admin-model-field-label text-slate-300">{label}</Label>
      <div className="mt-2">{children}</div>
      <p className="admin-model-card-hint mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function ModelInfo({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-2 text-sm font-medium text-slate-100 ${className ?? ''}`}>{value}</div>
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
