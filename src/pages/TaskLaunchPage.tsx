import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import {
  createFavoriteItem,
  getFavoriteItems,
  createResearchTask,
  getModelRoutingRecommendation,
  getModelsAvailable,
  getResearchTasks,
} from '../api/client';
import { PageShell } from '../components/common/PageShell';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { MultiSelect } from '../components/ui/multi-select';
import { Select } from '../components/ui/select';
import type { FavoriteItem, ModelAvailableItem, ResearchTaskListItem } from '../types';

const objectTypes = ['', 'company', 'stock', 'commodity'] as const;

export function TaskLaunchPage() {
  const [objectName, setObjectName] = useState('');
  const [objectType, setObjectType] = useState<(typeof objectTypes)[number]>('');
  const [timeRange, setTimeRange] = useState('30d');
  const [sourceAuthority, setSourceAuthority] = useState('high');
  const [sourceTypesText, setSourceTypesText] = useState('news,report');
  const [modelId, setModelId] = useState('');
  const [enableCrossValidation, setEnableCrossValidation] = useState(false);
  const [multiModelIds, setMultiModelIds] = useState<string[]>([]);
  const [favoriteModelIds, setFavoriteModelIds] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<ModelAvailableItem[]>([]);
  const [recommendedModelId, setRecommendedModelId] = useState('');
  const [researchTasks, setResearchTasks] = useState<ResearchTaskListItem[]>([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadBaseData = async () => {
      const [favoritesResult, modelsResult, tasksResult] = await Promise.allSettled([
        getFavoriteItems({ favorite_type: 'model', page: 1, page_size: 100 }),
        getModelsAvailable(),
        getResearchTasks({ page: 1, page_size: 10 }),
      ]);

      if (favoritesResult.status === 'fulfilled') {
        setFavoriteModelIds(favoritesResult.value.list.map((item: FavoriteItem) => item.target_id));
      } else {
        setFavoriteModelIds([]);
      }

      if (modelsResult.status === 'fulfilled') {
        setAvailableModels(modelsResult.value.models);
        setRecommendedModelId(modelsResult.value.recommended_model_id ?? '');
      } else {
        setAvailableModels([]);
        setRecommendedModelId('');
      }

      if (tasksResult.status === 'fulfilled') {
        setResearchTasks(tasksResult.value.list);
      } else {
        setResearchTasks([]);
      }
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
        source_authority: sourceAuthority,
        source_types: sourceTypesText
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        model_id: modelId || undefined,
        multi_model_ids: multiModelIds,
        enable_cross_validation: enableCrossValidation,
      });
      setMessage(`任务已创建：${response.task_id}，状态 ${response.status}`);
      const tasksResponse = await getResearchTasks({ page: 1, page_size: 10 });
      setResearchTasks(tasksResponse.list);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '创建失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFavoriteModel = async () => {
    if (!modelId) {
      setMessage('请先选择 model_id。');
      return;
    }

    if (favoriteModelIds.includes(modelId)) {
      setMessage('该模型已在收藏夹中。');
      return;
    }

    try {
      setSubmitting(true);
      const response = await createFavoriteItem({
        favorite_type: 'model',
        target_id: modelId,
        remark: '从任务发起页收藏',
      });
      setFavoriteModelIds((prev) => [...prev, modelId]);
      setMessage(`模型已收藏：${response.favorite_id}`);
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

  return (
    <PageShell
      title="发起调研"
      subtitle="输入调研对象与参数，启动 AI 驱动的市场情报分析任务。"
      action={<Button variant="secondary" onClick={handleCreateTask}>创建任务</Button>}
    >
      <div className="grid gap-8">
        <Card className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-100">创建调研任务</h2>
            <p className="text-sm leading-6 text-slate-400">
              填写调研对象信息与偏好参数，系统将自动匹配最优模型并生成深度报告。
            </p>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <Label htmlFor="task-object-name">调研对象</Label>
              <div className="flex gap-2">
                <Input
                  id="task-object-name"
                  value={objectName}
                  onChange={(event) => setObjectName(event.target.value)}
                  placeholder="例如：腾讯控股"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={handleCreateTask}
                  className="flex items-center justify-center rounded-xl bg-[#63cab7] px-4 text-[#07111f] transition hover:bg-[#7dd8c9]"
                  aria-label="搜索"
                >
                  <Search size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="task-object-type">对象类型（可选）</Label>
              <Select
                id="task-object-type"
                value={objectType}
                onChange={(event) => setObjectType(event.target.value as (typeof objectTypes)[number])}
              >
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
              <Label htmlFor="task-source-authority">信源权威度</Label>
              <Select
                id="task-source-authority"
                value={sourceAuthority}
                onChange={(event) => setSourceAuthority(event.target.value)}
              >
                <option value="high">高权威</option>
                <option value="medium">中等</option>
                <option value="low">全量</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="task-source-types">信源类型（逗号分隔）</Label>
              <Input
                id="task-source-types"
                value={sourceTypesText}
                onChange={(event) => setSourceTypesText(event.target.value)}
                placeholder="news,report,filing"
              />
            </div>
            <div>
              <Label htmlFor="task-model-id">AI 模型（可选）</Label>
              <Select id="task-model-id" value={modelId} onChange={(event) => setModelId(event.target.value)}>
                <option value="">不指定模型（后端默认）</option>
                {availableModels.map((model) => (
                  <option key={model.model_id} value={model.model_id}>
                    {model.model_name} ({model.provider})
                  </option>
                ))}
              </Select>
              <div className="mt-2 flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={handleFavoriteModel} disabled={submitting}>
                  收藏当前模型
                </Button>
                {modelId && favoriteModelIds.includes(modelId) ? (
                  <span className="text-xs text-[#63cab7]">已收藏</span>
                ) : null}
              </div>
              {recommendedModelId ? (
                <p className="mt-2 text-xs text-slate-500">推荐模型：{recommendedModelId}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="task-multi-model-ids">多模型选择</Label>
              <MultiSelect
                options={multiModelOptions}
                defaultValue={multiModelIds}
                onValueChange={setMultiModelIds}
                placeholder="选择模型"
                className="w-full border-[rgba(99,202,183,0.2)] bg-[#07111f]/80 text-slate-100 hover:bg-[#07111f]"
                popoverClassName="border border-[rgba(99,202,183,0.2)] bg-[#0f1f35] text-slate-100 shadow-xl"
                hideSelectAll
                maxCount={3}
              />
              {availableModels.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">暂无可用模型</p>
              ) : null}
            </div>
            <div className="flex items-center gap-3 pt-8">
              <input
                id="task-enable-cross-validation"
                type="checkbox"
                checked={enableCrossValidation}
                onChange={(event) => setEnableCrossValidation(event.target.checked)}
                className="h-4 w-4 rounded border-[rgba(99,202,183,0.3)] accent-[#63cab7]"
              />
              <Label htmlFor="task-enable-cross-validation">启用多模型交叉验证</Label>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleCreateTask} disabled={submitting}>
              {submitting ? '创建中...' : '创建调研任务'}
            </Button>
            {message ? <p className="text-sm text-slate-400">{message}</p> : null}
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <p className="text-sm font-semibold text-slate-200">近期任务</p>
            <div className="mt-3 space-y-2">
              {researchTasks.map((task) => (
                <div key={task.task_id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{task.object_name}</span>
                  <span className="text-xs text-slate-500">{task.status}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
