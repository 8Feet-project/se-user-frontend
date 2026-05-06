import { BookmarkPlus, Bot, Clock3, Search, Sparkles, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
        warnings.push('可用模型列表加载失败');
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

  const handleCreateTask = async () => {
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
      setMessage(`任务已创建：${response.task_id}，当前状态：${response.status}`);
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

  return (
    <PageShell
      title="发起调研"
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <Card className="space-y-8">
          <div className="flex flex-wrap gap-2">
            <span className="data-pill">
              <Bot size={14} className="text-[#63cab7]" />
              可用模型 {availableModels.length}
            </span>
            <span className="data-pill">
              <Star size={14} className="text-[#63cab7]" />
              收藏模型 {favoriteModelIds.length}
            </span>
            {recommendedModel ? (
              <span className="data-pill">
                <Sparkles size={14} className="text-[#63cab7]" />
                推荐 {recommendedModel.model_name}
              </span>
            ) : null}
          </div>

          <section className="space-y-3">
            <p className="page-kicker">Research Launch</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-100">创建调研任务</h2>
          </section>

          {baseDataWarning ? (
            <div className="rounded-[28px] border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
              基础数据存在部分加载失败：{baseDataWarning}。仍可继续填写表单，缺失项会按空数据处理。
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <Label htmlFor="task-object-name">调研对象</Label>
              <div className="flex gap-2">
                <Input
                  id="task-object-name"
                  value={objectName}
                  onChange={(event) => setObjectName(event.target.value)}
                  placeholder="例如：腾讯控股、比亚迪、原油期货"
                  className="flex-1"
                />
                <Button type="button" size="icon" onClick={handleCreateTask} aria-label="创建任务" disabled={submitting}>
                  <Search size={18} strokeWidth={2} />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="task-object-type">对象类型</Label>
              <Select id="task-object-type" value={objectType} onChange={(event) => setObjectType(event.target.value as (typeof objectTypes)[number])}>
                <option value="">自动识别</option>
                <option value="company">公司</option>
                <option value="stock">股票</option>
                <option value="commodity">商品</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="task-time-range">时间范围</Label>
              <Select id="task-time-range" value={timeRange} onChange={(event) => setTimeRange(event.target.value)}>
                <option value="7d">近 7 天</option>
                <option value="30d">近 30 天</option>
                <option value="90d">近 90 天</option>
                <option value="1y">近 1 年</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="task-model-id">主模型（可选）</Label>
              <Select id="task-model-id" value={modelId} onChange={(event) => setModelId(event.target.value)}>
                <option value="">不指定模型，使用系统路由</option>
                {availableModels.map((model) => (
                  <option key={model.model_id} value={model.model_id}>
                    {model.model_name} ({model.provider})
                  </option>
                ))}
              </Select>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button size="sm" variant="secondary" onClick={handleFavoriteModel} disabled={submitting}>
                  <BookmarkPlus size={14} />
                  收藏当前模型
                </Button>
                {modelId && favoriteModelIds.includes(modelId) ? <span className="text-xs text-[#63cab7]">已收藏</span> : null}
                {recommendedModelId ? <p className="text-xs text-slate-500">推荐模型：{recommendedModelId}</p> : null}
              </div>
            </div>

            <div>
              <Label htmlFor="task-multi-model-ids">多模型交叉</Label>
              <MultiSelect
                options={multiModelOptions}
                value={multiModelIds}
                onValueChange={setMultiModelIds}
                placeholder="选择辅助模型"
                className="w-full"
                popoverClassName="border border-[rgba(99,202,183,0.18)] bg-[#0f1f35] text-slate-100 shadow-xl"
                hideSelectAll
                maxCount={3}
              />
              {availableModels.length === 0 ? <p className="mt-2 text-xs text-slate-500">暂无可用模型</p> : null}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  id="task-enable-cross-validation"
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setEnableCrossValidation((prev) => !prev)}
                  disabled={submitting}
                >
                  <Sparkles size={14} />
                  {enableCrossValidation ? '关闭交叉验证' : '启用交叉验证'}
                </Button>
                {enableCrossValidation ? <span className="text-xs text-[#63cab7]">已启用多模型交叉验证</span> : null}
              </div>
            </div>
          </div>

          {message ? <div className="message-strip">{message}</div> : null}
        </Card>

        <div className="space-y-6">
          <Card variant="glow" className="space-y-5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">模型路由建议</h3>
            </div>
            <div className="panel-subtle p-4">
              <p className="mt-2 text-sm text-[#63cab7]">
                {recommendedModel ? `${recommendedModel.model_name} (${recommendedModel.provider})` : recommendedModelId || '等待对象类型选择'}
              </p>
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <Clock3 size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">近期任务</h3>
            </div>
            <div className="max-h-[17rem] space-y-3 overflow-y-auto pr-1">
              {researchTasks.length > 0 ? (
                researchTasks.map((task) => (
                  <div key={task.task_id} className="panel-subtle p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{task.object_name}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                    <p className="mt-3 text-xs text-slate-500">创建时间：{formatTaskCreatedAt(task.created_at)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/process?task_id=${task.task_id}`)}>
                        查看流程
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/report?task_id=${task.task_id}`)}>
                        查看报告
                      </Button>
                    </div>
                  </div>
                ))
              ) : baseDataLoaded ? (
                <div className="panel-subtle p-4 text-sm text-slate-500">暂时没有任务记录。</div>
              ) : null}
            </div>
          </Card>


        </div>
      </div>
    </PageShell>
  );
}
