import {
  BookmarkPlus,
  Bot,
  CalendarDays,
  Clock3,
  Layers3,
  Search,
  SendHorizontal,
  Sparkles,
  Star,
} from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createFavoriteItem,
  createResearchTask,
  getFavoriteItems,
  getModelRoutingRecommendation,
  getModelsAvailable,
  getResearchTasks,
} from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import type { FavoriteItem, ModelAvailableItem, ResearchTaskListItem } from '@/types';

const objectTypes = ['', 'company', 'stock', 'commodity'] as const;
const defaultSourceAuthority = 'high';
const defaultSourceTypes = ['news', 'report'];

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
  const [objectType, setObjectType] = useState<(typeof objectTypes)[number]>('');
  const [timeRange, setTimeRange] = useState('30d');
  const [modelId, setModelId] = useState('');
  const [enableCrossValidation, setEnableCrossValidation] = useState(false);
  const [multiModelIds, setMultiModelIds] = useState<string[]>([]);
  const [favoriteModelIds, setFavoriteModelIds] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<ModelAvailableItem[]>([]);
  const [recommendedModelId, setRecommendedModelId] = useState('');
  const [researchTasks, setResearchTasks] = useState<ResearchTaskListItem[]>([]);
  const [baseDataLoaded, setBaseDataLoaded] = useState(false);
  const [baseDataWarning, setBaseDataWarning] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadBaseData = async () => {
      const [favoritesResult, modelsResult, tasksResult] = await Promise.allSettled([
        getFavoriteItems({ favorite_type: 'model', page: 1, page_size: 100 }),
        getModelsAvailable(),
        getResearchTasks({ page: 1, page_size: 10 }),
      ]);

      const warnings: string[] = [];

      if (favoritesResult.status === 'fulfilled') {
        setFavoriteModelIds(favoritesResult.value.list.map((item: FavoriteItem) => item.target_id));
      } else {
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
        object_type: objectType || undefined,
        time_range: timeRange,
        source_authority: defaultSourceAuthority,
        source_types: defaultSourceTypes,
        model_id: modelId || undefined,
        multi_model_ids: multiModelIds,
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

  const handleFavoriteModel = async () => {
    if (!modelId) {
      setMessage('请先选择一个模型再收藏。');
      return;
    }

    if (favoriteModelIds.includes(modelId)) {
      setMessage('这个模型已经在收藏夹里了。');
      return;
    }

    try {
      setSubmitting(true);
      await createFavoriteItem({
        favorite_type: 'model',
        target_id: modelId,
        remark: '从任务发起页收藏',
      });
      setFavoriteModelIds((prev) => [...prev, modelId]);
      setMessage('模型已加入收藏夹。');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '收藏模型失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const multiModelOptions = availableModels.map((model) => ({
    value: model.model_id,
    label: `${model.model_name} (${model.provider})`,
  }));

  const recommendedModel = useMemo(
    () => availableModels.find((model) => model.model_id === recommendedModelId),
    [availableModels, recommendedModelId]
  );

  const selectedModel = useMemo(
    () => availableModels.find((model) => model.model_id === modelId),
    [availableModels, modelId]
  );

  return (
    <PageShell title="发起调研" subtitle="从一个对象开始，把检索、分析、交叉验证和报告生成交给 8Feet。">
      <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-3 py-8 sm:px-5 lg:py-12">
        <div className="w-full max-w-[880px]">
          <section className="mb-8 text-center">
            <p className="page-kicker">AI Research</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
              你想调研什么？
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              输入公司、股票或商品名称，8Feet 会自动规划一轮可追踪的调研任务。
            </p>
          </section>

          <Card variant="glow" padding="none" className="overflow-visible">
            <form onSubmit={handleCreateTask} className="space-y-5 p-4 sm:p-5">
              <div className="rounded-[28px] border border-[var(--8feet-line-accent)] bg-[var(--8feet-bg-panel-strong)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Label htmlFor="task-object-name" className="sr-only">
                  调研对象
                </Label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-h-14 flex-1 items-center gap-3 rounded-3xl bg-[var(--8feet-bg-deep)] px-4">
                    <Search size={18} className="shrink-0 text-[#63cab7]" />
                    <Input
                      id="task-object-name"
                      value={objectName}
                      onChange={(event) => setObjectName(event.target.value)}
                      placeholder="输入调研对象，例如：腾讯控股、比亚迪、原油期货"
                      className="h-14 border-0 bg-transparent px-0 py-0 text-base shadow-none focus-visible:ring-0"
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-14 rounded-3xl px-5" disabled={submitting}>
                    <SendHorizontal size={17} />
                    {submitting ? '创建中' : '开始调研'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {quickLaunchItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleQuickLaunch(item)}
                    className="data-pill transition-colors duration-150 hover:border-[rgba(99,202,183,0.34)] hover:text-slate-100"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-[var(--8feet-line-soft)] bg-white/[0.03] p-3">
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

                <div className="rounded-2xl border border-[var(--8feet-line-soft)] bg-white/[0.03] p-3">
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

                <div className="rounded-2xl border border-[var(--8feet-line-soft)] bg-white/[0.03] p-3">
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

              <div className="rounded-[24px] border border-[var(--8feet-line-soft)] bg-white/[0.03] p-4">
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
                      popoverClassName="border border-[rgba(99,202,183,0.18)] bg-[#0f1f35] text-slate-100 shadow-xl"
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

              {baseDataWarning ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  部分内容暂时没有加载成功：{baseDataWarning}。你仍然可以继续创建任务。
                </div>
              ) : null}

              {message ? <div className="message-strip">{message}</div> : null}
            </form>
          </Card>

          <section className="mt-6">
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
