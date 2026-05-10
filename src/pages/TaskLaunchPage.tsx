import {
  Bot,
  CalendarDays,
  ChevronDown,
  Check,
  CornerDownLeft,
  Clock3,
  Layers3,
  Plus,
  Search,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createFavoriteItem,
  deleteFavoriteItem,
  createResearchTask,
  getFavoriteItems,
  getModelRoutingRecommendation,
  getModelsAvailable,
  getResearchTasks,
} from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import type { FavoriteItem, ModelAvailableItem, ResearchTaskListItem } from '@/types';

const objectTypes = ['company', 'stock', 'commodity'] as const;
const defaultSourceAuthority = 'high';
const defaultSourceTypes = ['news', 'report'];

const objectTypeOptions: Array<{
  value: (typeof objectTypes)[number];
  label: string;
  placeholder: string;
}> = [
  { value: 'company', label: '公司', placeholder: '输入想要调研的公司' },
  { value: 'stock', label: '股票', placeholder: '输入想要调研的股票' },
  { value: 'commodity', label: '商品', placeholder: '输入想要调研的商品' },
];

const timeRangeOptions = [
  { value: '7d', label: '近 7 天' },
  { value: '30d', label: '近 30 天' },
  { value: '90d', label: '近 90 天' },
  { value: '1y', label: '近 1 年' },
];

const quickLaunchItems: Array<{
  label: string;
  objectName: string;
  objectType: (typeof objectTypes)[number];
  timeRange: string;
}> = [
  { label: '腾讯控股', objectName: '腾讯控股', objectType: 'stock', timeRange: '30d' },
  { label: '比亚迪', objectName: '比亚迪', objectType: 'company', timeRange: '90d' },
  { label: '原油期货', objectName: '原油期货', objectType: 'commodity', timeRange: '30d' },
];

const chineseDateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function formatTaskCreatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return chineseDateTimeFormatter.format(date);
}

export function TaskLaunchPage() {
  const navigate = useNavigate();
  const [objectName, setObjectName] = useState('');
  const [objectType, setObjectType] = useState<(typeof objectTypes)[number]>('company');
  const [timeRange, setTimeRange] = useState('30d');
  const [modelId, setModelId] = useState('');
  const [enableCrossValidation, setEnableCrossValidation] = useState(false);
  const [multiModelIds, setMultiModelIds] = useState<string[]>([]);
  const [favoriteModelItems, setFavoriteModelItems] = useState<FavoriteItem[]>([]);
  const [favoriteModelIds, setFavoriteModelIds] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<ModelAvailableItem[]>([]);
  const [recommendedModelId, setRecommendedModelId] = useState('');
  const [researchTasks, setResearchTasks] = useState<ResearchTaskListItem[]>([]);
  const [baseDataLoaded, setBaseDataLoaded] = useState(false);
  const [baseDataWarning, setBaseDataWarning] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [favoriteUpdatingModelId, setFavoriteUpdatingModelId] = useState('');

  useEffect(() => {
    const loadBaseData = async () => {
      const [favoritesResult, modelsResult, tasksResult] = await Promise.allSettled([
        getFavoriteItems({ favorite_type: 'model', page: 1, page_size: 100 }),
        getModelsAvailable(),
        getResearchTasks({ page: 1, page_size: 10 }),
      ]);

      const warnings: string[] = [];

      if (favoritesResult.status === 'fulfilled') {
        const modelFavorites = favoritesResult.value.list.filter((item: FavoriteItem) => item.favorite_type === 'model');
        setFavoriteModelItems(modelFavorites);
        setFavoriteModelIds(modelFavorites.map((item) => item.target_id));
      } else {
        setFavoriteModelItems([]);
        setFavoriteModelIds([]);
        warnings.push('模型收藏夹加载失败');
      }

      if (modelsResult.status === 'fulfilled') {
        setAvailableModels(modelsResult.value.models);
        setRecommendedModelId(modelsResult.value.recommended_model_id ?? '');
      } else {
        setAvailableModels([]);
        setRecommendedModelId('');
        warnings.push('模型列表加载失败');
      }

      if (tasksResult.status === 'fulfilled') {
        setResearchTasks(tasksResult.value.list);
      } else {
        setResearchTasks([]);
        warnings.push('最近任务加载失败');
      }

      setBaseDataWarning(warnings.join('；'));
      setBaseDataLoaded(true);
    };

    void loadBaseData();
  }, []);

  useEffect(() => {
    const loadRecommendation = async () => {
      if (!objectType) {
        return;
      }

      try {
        const response = await getModelRoutingRecommendation({ object_type: objectType });
        setRecommendedModelId(response.recommended_model_id ?? '');
      } catch {
        setRecommendedModelId('');
      }
    };

    void loadRecommendation();
  }, [objectType]);

  useEffect(() => {
    const availableModelIds = new Set(availableModels.map((model) => model.model_id));

    setModelId((prev) => (prev && !availableModelIds.has(prev) ? '' : prev));
    setMultiModelIds((prev) => prev.filter((id, index) => availableModelIds.has(id) && prev.indexOf(id) === index));
  }, [availableModels]);

  const handleCreateTask = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!objectName.trim()) {
      setMessage('请先填写调研对象名称。');
      return;
    }

    try {
      setSubmitting(true);
      const response = await createResearchTask({
        object_name: objectName.trim(),
        object_type: objectType,
        time_range: timeRange,
        source_authority: defaultSourceAuthority,
        source_types: defaultSourceTypes,
        model_id: (enableCrossValidation ? multiModelIds[0] : modelId) || undefined,
        multi_model_ids: enableCrossValidation ? multiModelIds : [],
        enable_cross_validation: enableCrossValidation,
      });
      setMessage('任务已创建，正在进入流程页。');
      const tasksResponse = await getResearchTasks({ page: 1, page_size: 10 });
      setResearchTasks(tasksResponse.list);
      navigate(`/process?task_id=${response.task_id}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '创建失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLaunch = (item: (typeof quickLaunchItems)[number]) => {
    setObjectName(item.objectName);
    setObjectType(item.objectType);
    setTimeRange(item.timeRange);
    setMessage('');
  };

  const handleToggleCrossValidation = () => {
    if (enableCrossValidation) {
      setEnableCrossValidation(false);
      setModelId((prev) => multiModelIds[0] ?? prev);
      setMultiModelIds([]);
      return;
    }

    setEnableCrossValidation(true);
    setMultiModelIds((prev) => (prev.length > 0 ? prev : modelId ? [modelId] : []));
  };

  const handleToggleModelSelection = (targetModelId: string) => {
    if (enableCrossValidation) {
      const nextModelIds = multiModelIds.includes(targetModelId)
        ? multiModelIds.filter((item) => item !== targetModelId)
        : [...multiModelIds, targetModelId];

      setMultiModelIds(nextModelIds);
      setModelId((prev) => (nextModelIds.includes(prev) ? prev : nextModelIds[0] ?? ''));
      return;
    }

    setModelId(targetModelId);
    setModelMenuOpen(false);
  };

  const handleRemoveSelectedModel = (targetModelId: string) => {
    if (enableCrossValidation) {
      const nextModelIds = multiModelIds.filter((item) => item !== targetModelId);
      setMultiModelIds(nextModelIds);
      setModelId((prev) => (prev === targetModelId ? nextModelIds[0] ?? '' : prev));
      return;
    }

    if (modelId === targetModelId) {
      setModelId('');
    }
  };

  const handleToggleFavoriteModel = async (model: ModelAvailableItem) => {
    const existing = favoriteModelItems.find((item) => item.target_id === model.model_id);
    try {
      setFavoriteUpdatingModelId(model.model_id);
      if (existing) {
        await deleteFavoriteItem(existing.favorite_id);
        setFavoriteModelItems((prev) => prev.filter((item) => item.favorite_id !== existing.favorite_id));
        setFavoriteModelIds((prev) => prev.filter((item) => item !== model.model_id));
        return;
      }

      const response = await createFavoriteItem({
        favorite_type: 'model',
        target_id: model.model_id,
        remark: model.model_name,
      });
      const created: FavoriteItem = {
        favorite_id: response.favorite_id,
        favorite_type: 'model',
        target_id: model.model_id,
        remark: model.model_name,
      };
      setFavoriteModelItems((prev) => {
        const withoutDuplicate = prev.filter((item) => item.target_id !== model.model_id);
        return [...withoutDuplicate, created];
      });
      setFavoriteModelIds((prev) => (prev.includes(model.model_id) ? prev : [...prev, model.model_id]));
    } catch (error) {
      const reason = error instanceof Error ? error.message : '收藏模型失败';
      setMessage(reason);
    } finally {
      setFavoriteUpdatingModelId('');
    }
  };

  const recommendedModel = useMemo(
    () => availableModels.find((model) => model.model_id === recommendedModelId),
    [availableModels, recommendedModelId]
  );

  const selectedModelIds = useMemo(
    () => (enableCrossValidation ? multiModelIds : modelId ? [modelId] : []),
    [enableCrossValidation, modelId, multiModelIds]
  );

  const selectedModels = useMemo(
    () => selectedModelIds
      .map((id) => availableModels.find((model) => model.model_id === id))
      .filter((model): model is ModelAvailableItem => Boolean(model)),
    [availableModels, selectedModelIds]
  );

  const currentObjectType = objectTypeOptions.find((item) => item.value === objectType) ?? objectTypeOptions[0];
  const currentTimeRange = timeRangeOptions.find((item) => item.value === timeRange)?.label ?? timeRange;

  return (
    <PageShell title="发起调研">
      <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-3 py-8 sm:px-5 lg:py-12">
        <div className="w-full max-w-[900px]">
          <h2 className="mb-9 text-center text-4xl font-semibold tracking-normal text-slate-100 sm:text-5xl">8Feet</h2>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="overflow-visible rounded-[32px] border border-[var(--8feet-line-soft)] bg-[var(--8feet-bg-card)] shadow-[var(--8feet-shadow-panel)]">
              <Label htmlFor="task-object-name" className="sr-only">
                调研对象
              </Label>
              <div className="flex min-h-[11rem] flex-col px-5 pb-4 pt-5 sm:min-h-[12rem] sm:px-6 sm:pt-6">
                <Input
                  id="task-object-name"
                  value={objectName}
                  onChange={(event) => setObjectName(event.target.value)}
                  placeholder="输入调研对象"
                  className="h-auto min-h-[5.5rem] border-0 bg-transparent px-0 py-0 text-lg text-slate-100 shadow-none placeholder:text-slate-500 focus-visible:ring-0 sm:text-xl"
                />

                <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      aria-expanded={settingsOpen}
                      aria-controls="launch-advanced-settings"
                      onClick={() => setSettingsOpen((prev) => !prev)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--8feet-line-soft)] bg-white/[0.04] text-slate-300 transition hover:border-[var(--8feet-line-accent-strong)] hover:text-slate-100"
                    >
                      <Plus size={19} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsOpen((prev) => !prev)}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--8feet-line-soft)] bg-white/[0.04] px-4 text-sm text-slate-300 transition hover:border-[var(--8feet-line-accent-strong)] hover:text-slate-100"
                    >
                      <Bot size={16} />
                      Agent
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsOpen((prev) => !prev)}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-transparent px-3 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-100"
                    >
                      <SlidersHorizontal size={15} />
                      设置
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setSettingsOpen((prev) => !prev)}
                      className="inline-flex h-10 max-w-[14rem] items-center gap-2 rounded-full px-3 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-slate-100"
                    >
                      <span className="truncate">
                        {selectedModel?.model_name ?? recommendedModel?.model_name ?? '系统路由'}
                      </span>
                      <ChevronDown size={15} className="shrink-0 text-slate-500" />
                    </button>
                    <Button type="submit" size="icon" className="h-11 w-11 rounded-full" disabled={submitting} aria-label="开始调研">
                      <SendHorizontal size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {settingsOpen ? (
              <Card id="launch-advanced-settings" padding="md" className="space-y-5 rounded-[26px]">
                <div className="flex flex-wrap items-center gap-2">
                  {quickLaunchItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleQuickLaunch(item)}
                      className="data-pill transition-colors duration-150 hover:border-[var(--8feet-line-accent-strong)] hover:text-slate-100"
                    >
                      <Search size={13} className="text-[#63cab7]" />
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="panel-subtle p-3">
                    <Label htmlFor="task-object-type" className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                      <Layers3 size={14} className="text-[#63cab7]" />
                      对象类型
                    </Label>
                    <Select
                      id="task-object-type"
                      value={objectType}
                      onChange={(event) => setObjectType(event.target.value as (typeof objectTypes)[number])}
                      size="sm"
                      className="rounded-xl"
                    >
                      <option value="">自动识别</option>
                      <option value="company">公司</option>
                      <option value="stock">股票</option>
                      <option value="commodity">商品</option>
                    </Select>
                  </div>

                  <div className="panel-subtle p-3">
                    <Label htmlFor="task-time-range" className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays size={14} className="text-[#63cab7]" />
                      时间范围
                    </Label>
                    <Select
                      id="task-time-range"
                      value={timeRange}
                      onChange={(event) => setTimeRange(event.target.value)}
                      size="sm"
                      className="rounded-xl"
                    >
                      <option value="7d">近 7 天</option>
                      <option value="30d">近 30 天</option>
                      <option value="90d">近 90 天</option>
                      <option value="1y">近 1 年</option>
                    </Select>
                  </div>

                  <div className="panel-subtle p-3">
                    <Label htmlFor="task-model-id" className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                      <Bot size={14} className="text-[#63cab7]" />
                      主模型
                    </Label>
                    <Select
                      id="task-model-id"
                      value={modelId}
                      onChange={(event) => setModelId(event.target.value)}
                      size="sm"
                      className="rounded-xl"
                    >
                      <option value="">系统路由</option>
                      {availableModels.map((model) => (
                        <option key={model.model_id} value={model.model_id}>
                          {model.model_name} ({model.provider})
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="panel-subtle p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                    <div className="min-w-0 flex-1">
                      <Label htmlFor="task-multi-model-ids" className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                        <Sparkles size={14} className="text-[#63cab7]" />
                        交叉验证
                      </Label>
                      <MultiSelect
                        options={multiModelOptions}
                        value={multiModelIds}
                        onValueChange={setMultiModelIds}
                        placeholder={availableModels.length === 0 ? '暂无可选辅助模型' : '选择辅助模型'}
                        className="w-full rounded-xl"
                        popoverClassName="theme-multiselect-panel border border-[rgba(99,202,183,0.18)] bg-[#0f1f35] text-slate-100 shadow-xl"
                        hideSelectAll
                        maxCount={3}
                        disabled={availableModels.length === 0}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        id="task-enable-cross-validation"
                        type="button"
                        size="sm"
                        variant={enableCrossValidation ? 'default' : 'secondary'}
                        onClick={() => setEnableCrossValidation((prev) => !prev)}
                        disabled={submitting}
                      >
                        <Sparkles size={14} />
                        {enableCrossValidation ? '已开启' : '开启'}
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={handleFavoriteModel} disabled={submitting || !modelId}>
                        <BookmarkPlus size={14} />
                        收藏模型
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="data-pill">
                    <Bot size={14} className="text-[#63cab7]" />
                    可用模型 {availableModels.length}
                  </span>
                  <span className="data-pill">
                    <Star size={14} className="text-[#63cab7]" />
                    收藏模型 {favoriteModelIds.length}
                  </span>
                  <span className="data-pill">
                    <Sparkles size={14} className="text-[#63cab7]" />
                    {recommendedModel
                      ? `建议 ${recommendedModel.model_name}`
                      : recommendedModelId
                        ? `建议 ${recommendedModelId}`
                        : '系统自动路由'}
                  </span>
                  {selectedModel && favoriteModelIds.includes(selectedModel.model_id) ? (
                    <span className="data-pill text-[#63cab7]">已收藏 {selectedModel.model_name}</span>
                  ) : null}
                </div>
              </Card>
            ) : null}

            {baseDataWarning ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                部分内容暂时没有加载成功：{baseDataWarning}。你仍然可以继续创建任务。
              </div>
            ) : null}

            {message ? <div className="message-strip">{message}</div> : null}
          </form>

          <section className="mt-8">
            <div className="mb-3 flex items-center gap-2 px-1">
              <Clock3 size={15} className="text-[#63cab7]" />
              <h3 className="text-sm font-semibold text-slate-200">近期任务</h3>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {researchTasks.length > 0 ? (
                researchTasks.slice(0, 4).map((task) => (
                  <div key={task.task_id} className="panel-subtle p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-100">{task.object_name}</p>
                        <p className="mt-2 text-xs text-slate-500">{formatTaskCreatedAt(task.created_at)}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => navigate(`/process?task_id=${task.task_id}`)}>
                        查看流程
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => navigate(`/report?task_id=${task.task_id}`)}>
                        查看报告
                      </Button>
                    </div>
                  </div>
                ))
              ) : baseDataLoaded ? (
                <div className="panel-subtle p-4 text-sm text-slate-500 lg:col-span-2">暂时没有任务记录。</div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
