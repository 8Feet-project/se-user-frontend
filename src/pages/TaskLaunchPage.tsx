import {
  CalendarDays,
  ChevronDown,
  Check,
  CornerDownLeft,
  Database,
  FastForward,
  FileText,
  Layers3,
  Newspaper,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  X,
  type LucideIcon,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FavoriteItem, ModelAvailableItem } from '@/types';

const objectTypes = ['company', 'stock', 'commodity'] as const;
type SourceAuthority = 'authoritative' | 'balanced' | 'unrestricted';
type LaunchConfigKey = 'timeRange' | 'sourceTypes' | 'sourceAuthority' | 'researchFocus';

const defaultSourceAuthority: SourceAuthority = 'balanced';
const defaultSourceTypes = ['official', 'data', 'research', 'news'];
const defaultResearchFocus = ['overview'];

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

const sourceAuthorityOptions: Array<{
  value: SourceAuthority;
  label: string;
  description: string;
}> = [
  { value: 'authoritative', label: '权威', description: '优先官方披露、监管机构、交易所、公司官网和可复现结构化数据。' },
  { value: 'balanced', label: '中等', description: '优先高可信来源，同时接受主流媒体、行业报告和专业数据库交叉验证。' },
  { value: 'unrestricted', label: '无限制', description: '不限制来源范围，但低可信来源只能作为线索并明确标注不确定性。' },
];

const sourceTypeOptions = [
  { value: 'official', label: '官方披露', description: '公告、监管、交易所、官网', icon: ShieldCheck },
  { value: 'data', label: '结构化数据', description: '行情、财务、工商、处罚数据', icon: Database },
  { value: 'research', label: '研报分析', description: '机构报告、行业研究', icon: FileText },
  { value: 'news', label: '新闻舆情', description: '主流媒体与近期动态', icon: Newspaper },
];

const researchFocusOptions = [
  { value: 'overview', label: '综合调研', description: '覆盖对象概况、证据、风险与结论' },
  { value: 'finance', label: '财务经营', description: '经营数据、盈利质量和现金流' },
  { value: 'competition', label: '竞争格局', description: '行业位置、竞品和替代风险' },
  { value: 'risk', label: '风险合规', description: '监管、诉讼、处罚和政策影响' },
  { value: 'recent', label: '近期动态', description: '公告、新闻、融资和舆情变化' },
];

export function TaskLaunchPage() {
  const navigate = useNavigate();
  const [objectName, setObjectName] = useState('');
  const [objectType, setObjectType] = useState<(typeof objectTypes)[number]>('company');
  const [timeRange, setTimeRange] = useState('30d');
  const [sourceAuthority, setSourceAuthority] = useState<SourceAuthority>(defaultSourceAuthority);
  const [sourceTypes, setSourceTypes] = useState<string[]>(defaultSourceTypes);
  const [researchFocus, setResearchFocus] = useState<string[]>(defaultResearchFocus);
  const [modelId, setModelId] = useState('');
  const [enableCrossValidation, setEnableCrossValidation] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [multiModelIds, setMultiModelIds] = useState<string[]>([]);
  const [favoriteModelItems, setFavoriteModelItems] = useState<FavoriteItem[]>([]);
  const [favoriteModelIds, setFavoriteModelIds] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<ModelAvailableItem[]>([]);
  const [recommendedModelId, setRecommendedModelId] = useState('');
  const [baseDataWarning, setBaseDataWarning] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [activeConfigKey, setActiveConfigKey] = useState<LaunchConfigKey>('timeRange');
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [favoriteUpdatingModelId, setFavoriteUpdatingModelId] = useState('');

  useEffect(() => {
    const loadBaseData = async () => {
      const [favoritesResult, modelsResult, tasksResult] = await Promise.allSettled([
        getFavoriteItems({ favorite_type: 'model', page: 1, page_size: 100 }),
        getModelsAvailable(),
        getResearchTasks({ page: 1, page_size: 1 }),
      ]);

      const warnings: string[] = [];

      if (favoritesResult.status === 'fulfilled') {
        const modelFavorites = favoritesResult.value.list.filter((item: FavoriteItem) => item.favorite_type === 'model');
        setFavoriteModelItems(modelFavorites);
        setFavoriteModelIds(modelFavorites.map((item) => item.target_id));
      } else {
        setFavoriteModelItems([]);
        setFavoriteModelIds([]);
        warnings.push('模型收藏状态加载失败');
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
        // 仅用于验证任务服务可访问，发起页不再展示近期任务。
      } else {
        warnings.push('最近任务加载失败');
      }

      setBaseDataWarning(warnings.join('；'));
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
        source_authority: sourceAuthority,
        source_types: sourceTypes,
        search_params: {
          user_source_requirements: {
            time_range: timeRange,
            source_authority: sourceAuthority,
            source_types: sourceTypes,
            research_focus: researchFocus,
          },
        },
        model_id: (enableCrossValidation ? multiModelIds[0] : modelId) || undefined,
        multi_model_ids: enableCrossValidation ? multiModelIds : [],
        enable_cross_validation: enableCrossValidation,
        auto_advance: autoAdvance,
      });
      setMessage('任务已创建，正在进入流程页。');
      navigate(`/process?task_id=${response.task_id}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '创建失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
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

  const toggleMultiValue = (currentValues: string[], value: string, fallbackValue: string) => {
    if (currentValues.includes(value)) {
      const nextValues = currentValues.filter((item) => item !== value);
      return nextValues.length ? nextValues : [fallbackValue];
    }
    return [...currentValues, value];
  };

  const handleToggleSourceType = (value: string) => {
    setSourceTypes((prev) => toggleMultiValue(prev, value, defaultSourceTypes[0]));
  };

  const handleToggleResearchFocus = (value: string) => {
    setResearchFocus((prev) => toggleMultiValue(prev, value, defaultResearchFocus[0]));
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
  const currentAuthority = sourceAuthorityOptions.find((item) => item.value === sourceAuthority) ?? sourceAuthorityOptions[0];
  const selectedSourceTypeLabels = sourceTypeOptions
    .filter((item) => sourceTypes.includes(item.value))
    .map((item) => item.label);
  const selectedResearchFocusLabels = researchFocusOptions
    .filter((item) => researchFocus.includes(item.value))
    .map((item) => item.label);
  const configItems: Array<{
    key: LaunchConfigKey;
    label: string;
    value: string;
    icon: LucideIcon;
  }> = [
    { key: 'timeRange', label: '时间范围', value: currentTimeRange, icon: CalendarDays },
    { key: 'sourceTypes', label: '信息源类型', value: selectedSourceTypeLabels.join('、') || '未选择', icon: Layers3 },
    { key: 'sourceAuthority', label: '来源要求', value: currentAuthority.label, icon: ShieldCheck },
    { key: 'researchFocus', label: '调研重点', value: selectedResearchFocusLabels.join('、') || '未选择', icon: Target },
  ];

  const renderConfigSubmenu = () => {
    if (activeConfigKey === 'timeRange') {
      return (
        <>
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-slate-400">时间范围</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">告诉 AI 优先覆盖哪个时间窗口。</p>
          </div>
          {timeRangeOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTimeRange(item.value)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-slate-100"
            >
              {item.label}
              {timeRange === item.value ? <Check size={15} className="text-[#63cab7]" /> : null}
            </button>
          ))}
        </>
      );
    }

    if (activeConfigKey === 'sourceAuthority') {
      return (
        <>
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-slate-400">子项信息来源要求</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">会作为用户要求写入调研 prompt。</p>
          </div>
          {sourceAuthorityOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setSourceAuthority(item.value)}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.05]"
            >
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center text-[#63cab7]">
                {sourceAuthority === item.value ? <Check size={15} /> : null}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-200">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>
              </span>
            </button>
          ))}
        </>
      );
    }

    if (activeConfigKey === 'sourceTypes') {
      return (
        <>
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-slate-400">信息源类型</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">可多选，至少保留一项。</p>
          </div>
          {sourceTypeOptions.map((item) => {
            const selected = sourceTypes.includes(item.value);
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleToggleSourceType(item.value)}
                className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.05]"
              >
                <Icon size={16} className={selected ? 'mt-0.5 text-[#63cab7]' : 'mt-0.5 text-slate-500'} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-200">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>
                </span>
                {selected ? <Check size={15} className="mt-0.5 text-[#63cab7]" /> : null}
              </button>
            );
          })}
        </>
      );
    }

    return (
      <>
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-slate-400">调研重点</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">可多选，AI 会优先覆盖这些子项。</p>
        </div>
        {researchFocusOptions.map((item) => {
          const selected = researchFocus.includes(item.value);
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => handleToggleResearchFocus(item.value)}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.05]"
            >
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center text-[#63cab7]">
                {selected ? <Check size={15} /> : null}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-200">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>
              </span>
            </button>
          );
        })}
      </>
    );
  };

  return (
    <PageShell title="发起调研" hideHeader contentFrame={false}>
      <div className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center px-3 pb-12 pt-4 sm:px-5">
        <div className="w-full max-w-[920px]">
          <h2 className="mb-7 text-center text-4xl font-semibold tracking-normal text-slate-100 sm:text-5xl">8Feet</h2>

          <div className="mb-6 flex justify-center">
            <div className="grid rounded-full border border-[var(--8feet-line-soft)] bg-[var(--8feet-bg-card)] p-1 shadow-[var(--8feet-shadow-soft)] sm:grid-cols-3">
              {objectTypeOptions.map((item) => {
                const active = objectType === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setObjectType(item.value)}
                    className={`h-11 rounded-full px-7 text-sm font-medium transition ${
                      active
                        ? 'bg-slate-100 text-slate-950 shadow-[0_10px_24px_rgba(0,0,0,0.18)]'
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="relative overflow-visible rounded-[32px] border border-[var(--8feet-line-soft)] bg-[var(--8feet-bg-card)] shadow-[var(--8feet-shadow-panel)]">
              <Label htmlFor="task-object-name" className="sr-only">
                调研对象
              </Label>
              <div className="flex min-h-[12.5rem] flex-col px-5 pb-4 pt-5 sm:min-h-[13.5rem] sm:px-6 sm:pt-6">
                <Input
                  id="task-object-name"
                  value={objectName}
                  onChange={(event) => setObjectName(event.target.value)}
                  placeholder={currentObjectType.placeholder}
                  className="h-auto min-h-[5.5rem] border-0 bg-transparent px-0 py-0 text-lg text-slate-100 shadow-none placeholder:text-slate-500 focus-visible:ring-0 sm:text-xl"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedModels.map((model) => (
                    <span
                      key={model.model_id}
                      className="group/model inline-flex h-8 items-center gap-2 rounded-xl border border-[var(--8feet-line-soft)] bg-white/[0.04] px-3 text-xs font-medium text-slate-300"
                    >
                      {model.model_name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedModel(model.model_id)}
                        className="hidden rounded-full text-slate-500 transition hover:text-slate-100 group-hover/model:inline-flex"
                        aria-label={`取消选择 ${model.model_name}`}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        aria-expanded={plusMenuOpen}
                        aria-controls="launch-plus-menu"
                        onClick={() => {
                          setPlusMenuOpen((prev) => !prev);
                          setModelMenuOpen(false);
                        }}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--8feet-line-soft)] bg-white/[0.04] text-slate-300 transition hover:border-[var(--8feet-line-accent-strong)] hover:text-slate-100"
                      >
                        <Plus size={19} />
                      </button>
                      {plusMenuOpen ? (
                        <div
                          id="launch-plus-menu"
                          className="absolute bottom-12 left-0 z-40 grid w-[min(42rem,calc(100vw-2rem))] gap-2 rounded-2xl border border-[var(--8feet-line-soft)] bg-[var(--8feet-bg-card)] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.24)] sm:grid-cols-[14rem_minmax(18rem,1fr)]"
                        >
                          <div className="space-y-1 border-b border-white/10 pb-2 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-2">
                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500">
                              <SlidersHorizontal size={14} />
                              调研配置
                            </div>
                            {configItems.map((item) => {
                              const active = activeConfigKey === item.key;
                              const Icon = item.icon;
                              return (
                                <button
                                  key={item.key}
                                  type="button"
                                  onMouseEnter={() => setActiveConfigKey(item.key)}
                                  onFocus={() => setActiveConfigKey(item.key)}
                                  onClick={() => setActiveConfigKey(item.key)}
                                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                    active ? 'bg-white/[0.06] text-slate-100' : 'text-slate-300 hover:bg-white/[0.04] hover:text-slate-100'
                                  }`}
                                >
                                  <Icon size={16} className={active ? 'mt-0.5 shrink-0 text-[#63cab7]' : 'mt-0.5 shrink-0 text-slate-500'} />
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium">{item.label}</span>
                                    <span className="mt-1 block truncate text-xs text-slate-500">{item.value}</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="max-h-[22rem] overflow-y-auto pr-1">
                            {renderConfigSubmenu()}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleCrossValidation}
                      className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
                        enableCrossValidation
                          ? 'border-[var(--8feet-line-accent-strong)] bg-[var(--8feet-teal-dim)] text-[#63cab7]'
                          : 'border-[var(--8feet-line-soft)] bg-white/[0.04] text-slate-300 hover:border-[var(--8feet-line-accent-strong)] hover:text-slate-100'
                      }`}
                    >
                      <Sparkles size={16} />
                      交叉验证
                    </button>

                    <button
                      type="button"
                      onClick={() => setAutoAdvance((prev) => !prev)}
                      className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
                        autoAdvance
                          ? 'border-[var(--8feet-line-accent-strong)] bg-[var(--8feet-teal-dim)] text-[#63cab7]'
                          : 'border-[var(--8feet-line-soft)] bg-white/[0.04] text-slate-300 hover:border-[var(--8feet-line-accent-strong)] hover:text-slate-100'
                      }`}
                    >
                      <FastForward size={16} />
                      自动推进
                    </button>

                    <span className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-slate-500">
                      <Layers3 size={15} />
                      {currentTimeRange}
                    </span>
                    <span className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-slate-500">
                      <ShieldCheck size={15} />
                      {currentAuthority.label}
                    </span>
                    <span className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-slate-500">
                      <Target size={15} />
                      {selectedResearchFocusLabels.length} 个重点
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setModelMenuOpen((prev) => !prev);
                          setPlusMenuOpen(false);
                        }}
                        className="inline-flex h-10 max-w-[18rem] items-center gap-2 rounded-xl border border-transparent px-3 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-slate-100"
                      >
                        <span className="truncate">
                          {selectedModels.length > 0
                            ? enableCrossValidation
                              ? `${selectedModels.length} 个模型`
                              : selectedModels[0].model_name
                            : recommendedModel?.model_name ?? '选择模型'}
                        </span>
                        <ChevronDown size={15} className="shrink-0 text-slate-500" />
                      </button>
                      {modelMenuOpen ? (
                        <div className="absolute bottom-12 right-0 z-30 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--8feet-line-soft)] bg-[var(--8feet-bg-card)] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
                          <div className="flex items-center justify-between px-3 py-2">
                            <span className="text-xs font-medium text-slate-500">
                              {enableCrossValidation ? '选择多个模型' : '选择主模型'}
                            </span>
                            <span className="text-xs text-slate-500">{availableModels.length} 个可用</span>
                          </div>
                          <div className="max-h-72 overflow-y-auto pr-1">
                            {availableModels.map((model) => {
                              const selected = selectedModelIds.includes(model.model_id);
                              const favored = favoriteModelIds.includes(model.model_id);
                              return (
                                <div key={model.model_id} className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/[0.04]">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleModelSelection(model.model_id)}
                                    className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${
                                      selected ? 'text-[#63cab7]' : 'text-slate-300 hover:text-slate-100'
                                    }`}
                                  >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                                      {selected ? <Check size={16} /> : null}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate">{model.model_name}</span>
                                    <span className="shrink-0 text-xs text-slate-500">{model.provider}</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={favoriteUpdatingModelId === model.model_id}
                                    onClick={() => void handleToggleFavoriteModel(model)}
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                                      favored ? 'text-amber-300 hover:text-amber-200' : 'text-slate-500 hover:text-slate-200'
                                    }`}
                                    aria-label={favored ? `取消收藏 ${model.model_name}` : `收藏 ${model.model_name}`}
                                  >
                                    <Star size={16} fill={favored ? 'currentColor' : 'none'} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="submit"
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
                      disabled={submitting}
                    >
                      <CornerDownLeft size={16} />
                      {submitting ? '创建中' : '发送'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {baseDataWarning ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                部分内容暂时没有加载成功：{baseDataWarning}。你仍然可以继续创建任务。
              </div>
            ) : null}

            {message ? <div className="message-strip">{message}</div> : null}
          </form>
        </div>
      </div>
    </PageShell>
  );
}
