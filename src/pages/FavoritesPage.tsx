import { Bot, FileText, Plus, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createFavoriteItem,
  deleteFavoriteItem,
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

const favoriteTypes: FavoriteType[] = ['report', 'model'];

function favoriteTypeLabel(type: FavoriteType) {
  if (type === 'report') return '报告';
  return '模型';
}

function favoriteTypeIcon(type: FavoriteType) {
  if (type === 'report') return <FileText size={16} className="text-[#63cab7]" />;
  return <Bot size={16} className="text-[#63cab7]" />;
}

export function FavoritesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [models, setModels] = useState<ModelAvailableItem[]>([]);
  const [favoriteType, setFavoriteType] = useState<FavoriteType>('report');
  const [targetId, setTargetId] = useState('');
  const [remark, setRemark] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isCreateItemDialogOpen, setIsCreateItemDialogOpen] = useState(false);

  const reportTitleById = useMemo(
    () => new Map(reports.map((report) => [report.report_id, report.title])),
    [reports]
  );

  const modelNameById = useMemo(
    () => new Map(models.map((model) => [model.model_id, `${model.model_name}（${model.provider}）`])),
    [models]
  );

  const groupedItems = useMemo(
    () => favoriteTypes.map((type) => ({
      type,
      items: items.filter((item) => item.favorite_type === type),
    })),
    [items]
  );

  const favoriteTargets = useMemo(() => {
    if (favoriteType === 'report') {
      return reports
        .filter((report) => !findFavoriteItem(items, 'report', report.report_id))
        .map((report) => ({ id: report.report_id, label: report.title }));
    }
    return models
      .filter((model) => !findFavoriteItem(items, 'model', model.model_id))
      .map((model) => ({ id: model.model_id, label: `${model.model_name}（${model.provider}）` }));
  }, [favoriteType, items, models, reports]);

  const getFavoriteDisplayName = (item: FavoriteItem) => {
    if (item.favorite_type === 'report') {
      return reportTitleById.get(item.target_id) || item.remark || '未命名报告';
    }
    return modelNameById.get(item.target_id) || item.remark || '未命名模型';
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

  useEffect(() => {
    setTargetId('');
    setRemark('');
  }, [favoriteType]);

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
      setMessage('已收藏。');
      await loadItems();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '新增收藏失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (favoriteId: string) => {
    try {
      setSubmitting(true);
      await deleteFavoriteItem(favoriteId);
      setMessage('已取消收藏。');
      await loadItems();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '取消收藏失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenFavoriteItem = (item: FavoriteItem) => {
    if (item.favorite_type !== 'report') {
      return;
    }
    if (!item.target_id.trim()) {
      setMessage('这份报告暂时无法打开，请重新选择。');
      return;
    }
    navigate(`/report?report_id=${encodeURIComponent(item.target_id)}`);
  };

  const isOpenableFavorite = (item: FavoriteItem) => item.favorite_type === 'report';

  return (
    <PageShell title="收藏夹">
      {message ? <div className="message-strip mb-6">{message}</div> : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {groupedItems.map((group) => (
            <span key={group.type} className="data-pill">
              {favoriteTypeIcon(group.type)}
              {favoriteTypeLabel(group.type)} {group.items.length}
            </span>
          ))}
        </div>
        <Button size="sm" onClick={() => setIsCreateItemDialogOpen(true)}>
          <Plus size={14} />
          新增收藏
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {groupedItems.map((group) => (
          <Card key={group.type} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {favoriteTypeIcon(group.type)}
                <h2 className="text-xl font-semibold text-slate-100">{favoriteTypeLabel(group.type)}</h2>
              </div>
              <span className="text-sm text-slate-500">{group.items.length} 项</span>
            </div>

            <div className="space-y-3">
              {group.items.length === 0 ? (
                <div className="panel-subtle p-4 text-sm text-slate-500">暂无已收藏的{favoriteTypeLabel(group.type)}。</div>
              ) : (
                group.items.map((item) => (
                  <div
                    key={item.favorite_id}
                    className={`panel-subtle p-4 ${isOpenableFavorite(item) ? 'cursor-pointer transition hover:border-[rgba(99,202,183,0.18)]' : ''}`}
                    role={isOpenableFavorite(item) ? 'button' : undefined}
                    tabIndex={isOpenableFavorite(item) ? 0 : undefined}
                    aria-label={isOpenableFavorite(item) ? `打开报告 ${getFavoriteDisplayName(item)}` : undefined}
                    onClick={() => handleOpenFavoriteItem(item)}
                    onKeyDown={(event) => {
                      if (!isOpenableFavorite(item)) {
                        return;
                      }
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleOpenFavoriteItem(item);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-100">{getFavoriteDisplayName(item)}</p>
                        <p className="mt-1 text-xs text-slate-500">ID：{item.target_id}</p>
                        {item.remark ? <p className="mt-2 text-sm text-slate-400">备注：{item.remark}</p> : null}
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
                ))
              )}
            </div>
          </Card>
        ))}
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
                {favoriteTypes.map((type) => (
                  <option key={type} value={type}>
                    {favoriteTypeLabel(type)}
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
