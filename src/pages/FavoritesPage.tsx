import { Bot, Clock3, FileText, Inbox, Newspaper, Plus, Star, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createFavoriteItem,
  deleteFavoriteItem,
  deleteFavoriteItemsBatch,
  findFavoriteItem,
  getFavoriteItems,
  getModelsAvailable,
  getReports,
} from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { FavoriteItem, FavoriteType, ModelAvailableItem, ReportListItem } from '@/types';

interface CategoryConfig {
  type: FavoriteType;
  label: string;
  icon: ReactNode;
  description: string;
}

const categories: CategoryConfig[] = [
  { type: 'info', label: '调研信息', icon: <Newspaper size={16} className="text-[#63cab7]" />, description: '收藏的核心信息源与引用' },
  { type: 'report', label: '调研报告', icon: <FileText size={16} className="text-[#63cab7]" />, description: '系统生成的调研报告' },
  { type: 'model', label: '大模型', icon: <Bot size={16} className="text-[#63cab7]" />, description: '高频使用的大模型' },
];

// 仅报告与模型有可选的收藏来源列表，可在本页直接新增收藏
const creatableTypes: FavoriteType[] = ['report', 'model'];

function categoryLabel(type: FavoriteType) {
  return categories.find((category) => category.type === type)?.label ?? type;
}

function formatDateTime(value?: string | null) {
  if (!value) return '未知';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function FavoritesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [models, setModels] = useState<ModelAvailableItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<FavoriteType>('info');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 新增收藏弹窗
  const [isCreateItemDialogOpen, setIsCreateItemDialogOpen] = useState(false);
  const [favoriteType, setFavoriteType] = useState<FavoriteType>('report');
  const [targetId, setTargetId] = useState('');
  const [remark, setRemark] = useState('');

  const reportTitleById = useMemo(
    () => new Map(reports.map((report) => [report.report_id, report.title])),
    [reports]
  );

  const modelNameById = useMemo(
    () => new Map(models.map((model) => [model.model_id, `${model.model_name}（${model.provider}）`])),
    [models]
  );

  const countByType = useMemo(() => {
    const counts: Record<FavoriteType, number> = { info: 0, report: 0, model: 0 };
    items.forEach((item) => {
      counts[item.favorite_type] = (counts[item.favorite_type] ?? 0) + 1;
    });
    return counts;
  }, [items]);

  const categoryItems = useMemo(
    () => items.filter((item) => item.favorite_type === activeCategory),
    [items, activeCategory]
  );

  const favoriteTargets = useMemo(() => {
    if (favoriteType === 'report') {
      return reports
        .filter((report) => !findFavoriteItem(items, 'report', report.report_id))
        .map((report) => ({ id: report.report_id, label: report.title }));
    }
    if (favoriteType === 'model') {
      return models
        .filter((model) => !findFavoriteItem(items, 'model', model.model_id))
        .map((model) => ({ id: model.model_id, label: `${model.model_name}（${model.provider}）` }));
    }
    return [];
  }, [favoriteType, items, models, reports]);

  const getFavoriteDisplayName = (item: FavoriteItem) => {
    if (item.favorite_type === 'report') {
      return reportTitleById.get(item.target_id) || item.remark || '未命名报告';
    }
    if (item.favorite_type === 'model') {
      return modelNameById.get(item.target_id) || item.remark || '未命名模型';
    }
    return item.remark || `信息源 ${item.target_id}`;
  };

  const loadItems = async () => {
    const response = await getFavoriteItems({ page: 1, page_size: 200 });
    setItems(response.list);
  };

  const loadAll = async () => {
    try {
      const [favoritesResponse, reportsResponse, modelsResponse] = await Promise.all([
        getFavoriteItems({ page: 1, page_size: 200 }),
        getReports({ page: 1, page_size: 100 }),
        getModelsAvailable(),
      ]);
      setItems(favoritesResponse.list);
      setReports(reportsResponse.list);
      setModels(modelsResponse.models);
      setMessage('');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '加载收藏数据失败';
      setMessage(reason);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  // 切换类别时清空批量选择，避免跨类别误删
  useEffect(() => {
    setSelectedIds([]);
  }, [activeCategory]);

  useEffect(() => {
    setTargetId('');
    setRemark('');
  }, [favoriteType]);

  const toggleSelect = (favoriteId: string) => {
    setSelectedIds((prev) =>
      prev.includes(favoriteId) ? prev.filter((id) => id !== favoriteId) : [...prev, favoriteId]
    );
  };

  const allSelectedInCategory = categoryItems.length > 0 && selectedIds.length === categoryItems.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelectedInCategory ? [] : categoryItems.map((item) => item.favorite_id));
  };

  const handleDeleteItem = async (favoriteId: string) => {
    try {
      setSubmitting(true);
      await deleteFavoriteItem(favoriteId);
      setSelectedIds((prev) => prev.filter((id) => id !== favoriteId));
      setMessage('已取消收藏。');
      await loadItems();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '取消收藏失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      return;
    }
    try {
      setSubmitting(true);
      const response = await deleteFavoriteItemsBatch(selectedIds);
      setSelectedIds([]);
      setMessage(`已取消收藏 ${response.deleted_count} 项。`);
      await loadItems();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '批量取消收藏失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateDialog = () => {
    setFavoriteType(creatableTypes.includes(activeCategory) ? activeCategory : 'report');
    setIsCreateItemDialogOpen(true);
  };

  const handleCreateItem = async () => {
    if (!targetId.trim()) {
      setMessage('请选择要收藏的对象。');
      return;
    }
    try {
      setSubmitting(true);
      await createFavoriteItem({
        favorite_type: favoriteType,
        target_id: targetId.trim(),
        remark: remark.trim() || undefined,
      });
      setTargetId('');
      setRemark('');
      setIsCreateItemDialogOpen(false);
      setActiveCategory(favoriteType);
      setMessage('已收藏。');
      await loadItems();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '新增收藏失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenFavoriteItem = (item: FavoriteItem) => {
    if (item.favorite_type !== 'report' || !item.target_id.trim()) {
      return;
    }
    navigate(`/report?report_id=${encodeURIComponent(item.target_id)}`);
  };

  const isOpenableFavorite = (item: FavoriteItem) => item.favorite_type === 'report';

  return (
    <PageShell title="收藏夹">
      {message ? <div className="message-strip mb-6">{message}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(200px,0.28fr)_minmax(0,1fr)]">
        {/* 左侧类别列表 */}
        <Card className="flex flex-col gap-2 self-start">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-100">收藏类别</h2>
          </div>
          {categories.map((category) => {
            const active = category.type === activeCategory;
            return (
              <button
                key={category.type}
                type="button"
                onClick={() => setActiveCategory(category.type)}
                className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  active
                    ? 'border-[rgba(99,202,183,0.35)] bg-[rgba(99,202,183,0.08)]'
                    : 'border-transparent hover:border-[rgba(99,202,183,0.14)] hover:bg-white/[0.03]'
                }`}
              >
                <span className="flex items-center gap-2">
                  {category.icon}
                  <span className="flex flex-col">
                    <span className={`text-sm font-medium ${active ? 'text-slate-100' : 'text-slate-300'}`}>{category.label}</span>
                    <span className="text-xs text-slate-500">{category.description}</span>
                  </span>
                </span>
                <span className="data-pill shrink-0">{countByType[category.type] ?? 0}</span>
              </button>
            );
          })}
        </Card>

        {/* 右侧内容区 */}
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {categories.find((category) => category.type === activeCategory)?.icon}
              <h2 className="text-xl font-semibold text-slate-100">{categoryLabel(activeCategory)}</h2>
              <span className="text-sm text-slate-500">{categoryItems.length} 项</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {categoryItems.length > 0 ? (
                <Button size="sm" variant="secondary" onClick={toggleSelectAll}>
                  {allSelectedInCategory ? '取消全选' : '全选'}
                </Button>
              ) : null}
              {selectedIds.length > 0 ? (
                <Button size="sm" variant="secondary" onClick={() => void handleBatchDelete()} disabled={submitting}>
                  <Trash2 size={14} />
                  批量取消收藏（{selectedIds.length}）
                </Button>
              ) : null}
              {creatableTypes.includes(activeCategory) ? (
                <Button size="sm" onClick={openCreateDialog}>
                  <Plus size={14} />
                  新增收藏
                </Button>
              ) : null}
            </div>
          </div>

          {categoryItems.length === 0 ? (
            <div className="panel-subtle flex flex-col items-center gap-3 p-12 text-center text-sm text-slate-500">
              <Inbox size={36} className="text-slate-600" />
              <p>暂无已收藏的{categoryLabel(activeCategory)}。</p>
              <p className="text-xs text-slate-600">
                在{activeCategory === 'info' ? '报告引用信息' : activeCategory === 'report' ? '报告预览页' : '模型选择处'}点击收藏后，会在此集中展示。
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {categoryItems.map((item) => {
                const selected = selectedIds.includes(item.favorite_id);
                return (
                  <div
                    key={item.favorite_id}
                    className={`panel-subtle p-4 transition ${selected ? 'border-[rgba(99,202,183,0.35)]' : ''} ${
                      isOpenableFavorite(item) ? 'cursor-pointer hover:border-[rgba(99,202,183,0.18)]' : ''
                    }`}
                    role={isOpenableFavorite(item) ? 'button' : undefined}
                    tabIndex={isOpenableFavorite(item) ? 0 : undefined}
                    aria-label={isOpenableFavorite(item) ? `打开报告 ${getFavoriteDisplayName(item)}` : undefined}
                    onClick={() => handleOpenFavoriteItem(item)}
                    onKeyDown={(event) => {
                      if (!isOpenableFavorite(item)) return;
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleOpenFavoriteItem(item);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0 accent-[#63cab7]"
                        checked={selected}
                        aria-label={`选择 ${getFavoriteDisplayName(item)}`}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => toggleSelect(item.favorite_id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-100">{getFavoriteDisplayName(item)}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">ID：{item.target_id}</p>
                        {item.remark && item.favorite_type !== 'info' ? (
                          <p className="mt-1 truncate text-sm text-slate-400">备注：{item.remark}</p>
                        ) : null}
                        <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                          <Clock3 size={12} />
                          收藏时间：{formatDateTime(item.created_at)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDeleteItem(item.favorite_id);
                        }}
                        disabled={submitting}
                        aria-label={`取消收藏 ${getFavoriteDisplayName(item)}`}
                      >
                        <Star size={14} fill="currentColor" />
                        取消收藏
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isCreateItemDialogOpen} onOpenChange={setIsCreateItemDialogOpen}>
        <DialogContent className="favorites-dialog sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>新增收藏</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleCreateItem();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="favorite-type-dialog">收藏类型</Label>
              <Select id="favorite-type-dialog" value={favoriteType} onChange={(event) => setFavoriteType(event.target.value as FavoriteType)}>
                {creatableTypes.map((type) => (
                  <option key={type} value={type}>
                    {categoryLabel(type)}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="favorite-target-id-dialog">收藏对象</Label>
              <Select id="favorite-target-id-dialog" value={targetId} onChange={(event) => setTargetId(event.target.value)}>
                <option value="">请选择收藏对象</option>
                {favoriteTargets.map((target) => (
                  <option key={`${favoriteType}-${target.id}`} value={target.id}>
                    {target.label}
                  </option>
                ))}
              </Select>
              {favoriteTargets.length === 0 ? (
                <p className="text-xs text-amber-300">当前类型没有可新增的收藏对象。</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="favorite-remark-dialog">备注（可选）</Label>
              <Input
                id="favorite-remark-dialog"
                value={remark}
                onChange={(event) => setRemark(event.target.value)}
                placeholder="例如：高价值参考样本"
              />
            </div>

            <DialogFooter className="favorites-dialog-footer">
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={submitting}>
                  取消
                </Button>
              </DialogClose>
              <Button type="submit" disabled={submitting || favoriteTargets.length === 0}>
                新增收藏
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
