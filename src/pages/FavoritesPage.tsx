import { FolderKanban, MoveRight, Plus, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  createFavoriteFolder,
  createFavoriteItem,
  deleteFavoriteFolder,
  deleteFavoriteItem,
  getFavoriteFolders,
  getFavoriteItems,
  getModelsAvailable,
  getReports,
  moveFavoriteItem,
  updateFavoriteFolder,
} from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { FavoriteFolder, FavoriteItem, FavoriteType, ModelAvailableItem, ReportListItem } from '@/types';

const favoriteTypes: FavoriteType[] = ['insight', 'report', 'model'];

function favoriteTypeLabel(type: FavoriteType) {
  if (type === 'insight') return '洞察';
  if (type === 'report') return '报告';
  return '模型';
}

export function FavoritesPage() {
  const [folders, setFolders] = useState<FavoriteFolder[]>([]);
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [models, setModels] = useState<ModelAvailableItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [folderName, setFolderName] = useState('');
  const [editingFolderName, setEditingFolderName] = useState('');
  const [favoriteType, setFavoriteType] = useState<FavoriteType>('report');
  const [targetId, setTargetId] = useState('');
  const [remark, setRemark] = useState('');
  const [moveTargetFolderId, setMoveTargetFolderId] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [isCreateItemDialogOpen, setIsCreateItemDialogOpen] = useState(false);

  const favoriteTargets = useMemo(() => {
    if (favoriteType === 'report') {
      return reports.map((report) => ({ id: report.report_id, label: report.title }));
    }
    if (favoriteType === 'model') {
      return models.map((model) => ({ id: model.model_id, label: `${model.model_name}（${model.provider}）` }));
    }
    return items
      .filter((item) => item.favorite_type === 'insight')
      .map((item) => ({ id: item.target_id, label: item.remark || item.target_id }));
  }, [favoriteType, items, models, reports]);

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.folder_id === selectedFolderId),
    [folders, selectedFolderId]
  );

  const folderNameById = useMemo(
    () => new Map(folders.map((folder) => [folder.folder_id, folder.folder_name])),
    [folders]
  );

  const reportTitleById = useMemo(
    () => new Map(reports.map((report) => [report.report_id, report.title])),
    [reports]
  );

  const modelNameById = useMemo(
    () => new Map(models.map((model) => [model.model_id, `${model.model_name}（${model.provider}）`])),
    [models]
  );

  const getFavoriteDisplayName = (item: FavoriteItem) => {
    if (item.favorite_type === 'report') {
      return reportTitleById.get(item.target_id) || item.remark || '未命名报告';
    }
    if (item.favorite_type === 'model') {
      return modelNameById.get(item.target_id) || item.remark || '未命名模型';
    }
    return item.remark || '未命名洞察';
  };

  const loadFolders = async () => {
    const response = await getFavoriteFolders();
    setFolders(response.folders);
    if (!selectedFolderId && response.default_folder_id) {
      setSelectedFolderId(response.default_folder_id);
      const current = response.folders.find((folder) => folder.folder_id === response.default_folder_id);
      setEditingFolderName(current?.folder_name ?? '');
    }
  };

  const loadItems = async (folderId?: string) => {
    const response = await getFavoriteItems({
      folder_id: folderId || undefined,
      page: 1,
      page_size: 20,
    });
    setItems(response.list);
  };

  const loadAll = async () => {
    try {
      const [reportsResponse, modelsResponse] = await Promise.all([getReports({ page: 1, page_size: 50 }), getModelsAvailable()]);
      setReports(reportsResponse.list);
      setModels(modelsResponse.models);
      await loadFolders();
      await loadItems(selectedFolderId || undefined);
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
    void loadItems(selectedFolderId || undefined);
  }, [selectedFolderId]);

  useEffect(() => {
    setTargetId('');
  }, [favoriteType]);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setMessage('请输入新的目录名称。');
      return;
    }
    try {
      setSubmitting(true);
      const response = await createFavoriteFolder({ folder_name: folderName.trim() });
      setFolderName('');
      setIsCreateFolderDialogOpen(false);
      setMessage(`目录已创建：${response.folder_name}`);
      await loadFolders();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '创建目录失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFolder = async () => {
    if (!selectedFolderId || !editingFolderName.trim()) {
      setMessage('请先选择目录并输入新的名称。');
      return;
    }
    try {
      setSubmitting(true);
      const response = await updateFavoriteFolder(selectedFolderId, {
        folder_name: editingFolderName.trim(),
      });
      setMessage(`目录更新成功：${response.updated_fields.join(', ') || '无字段变化'}`);
      await loadFolders();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '更新目录失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolderId) {
      setMessage('请先选择要删除的目录。');
      return;
    }
    try {
      setSubmitting(true);
      const response = await deleteFavoriteFolder(selectedFolderId);
      setMessage(`删除目录结果：${response.result}`);
      setSelectedFolderId('');
      setEditingFolderName('');
      await loadAll();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '删除目录失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
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
        folder_id: selectedFolderId || undefined,
        remark: remark.trim() || undefined,
      });
      setTargetId('');
      setRemark('');
      setIsCreateItemDialogOpen(false);
      setMessage('已加入收藏夹。');
      await loadItems(selectedFolderId || undefined);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '新增收藏失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveItem = async (favoriteId: string) => {
    if (!moveTargetFolderId) {
      setMessage('请先选择目标目录。');
      return;
    }
    try {
      setSubmitting(true);
      await moveFavoriteItem(favoriteId, {
        target_folder_id: moveTargetFolderId,
      });
      setMessage('已移动到目标目录。');
      await loadItems(selectedFolderId || undefined);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '移动收藏失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (favoriteId: string) => {
    try {
      setSubmitting(true);
      const response = await deleteFavoriteItem(favoriteId);
      setMessage(`已取消收藏：${response.target_id}`);
      await loadItems(selectedFolderId || undefined);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '取消收藏失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="收藏夹">
      {message ? <div className="message-strip mb-6">{message}</div> : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <Card className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FolderKanban size={16} className="text-[#63cab7]" />
                <h2 className="text-2xl font-semibold text-slate-100">收藏目录</h2>
              </div>
              <p className="mt-2 text-sm text-slate-400">支持目录查询、创建、重命名与删除，用统一的卡片层级管理沉淀内容。</p>
            </div>
            <Button size="sm" onClick={() => setIsCreateFolderDialogOpen(true)}>
              <Plus size={14} />
              新增目录
            </Button>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="favorite-folder-select">当前目录</Label>
            <Select
              id="favorite-folder-select"
              value={selectedFolderId}
              onChange={(event) => {
                const nextId = event.target.value;
                setSelectedFolderId(nextId);
                const current = folders.find((folder) => folder.folder_id === nextId);
                setEditingFolderName(current?.folder_name ?? '');
              }}
            >
              <option value="">全部目录</option>
              {folders.map((folder) => (
                <option key={folder.folder_id} value={folder.folder_id}>
                  {folder.folder_name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="edit-folder-name">修改目录名称</Label>
            <Input id="edit-folder-name" value={editingFolderName} onChange={(event) => setEditingFolderName(event.target.value)} placeholder="输入新的目录名称" />
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={handleUpdateFolder} disabled={submitting}>
                保存修改
              </Button>
              <Button size="sm" variant="secondary" onClick={handleDeleteFolder} disabled={submitting}>
                删除目录
              </Button>
            </div>
          </div>

          <div className="panel-subtle p-4 text-sm text-slate-300">
            <p>当前目录：{selectedFolder?.folder_name ?? '全部目录'}</p>
            <p className="mt-1 text-slate-400">目录总数：{folders.length}</p>
          </div>
        </Card>

        <Card variant="glow" className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-[#63cab7]" />
                <h3 className="text-xl font-semibold text-slate-100">收藏条目</h3>
              </div>
              <p className="mt-2 text-sm text-slate-400">支持新增收藏、指定目录、备注说明以及跨目录移动。</p>
            </div>
            <Button size="sm" onClick={() => setIsCreateItemDialogOpen(true)}>
              <Plus size={14} />
              新增收藏
            </Button>
          </div>

          <div className="space-y-3">
            <Label htmlFor="move-target-folder">移动到目录</Label>
            <Select id="move-target-folder" size="sm" value={moveTargetFolderId} onChange={(event) => setMoveTargetFolderId(event.target.value)}>
              <option value="">请选择目录</option>
              {folders.map((folder) => (
                <option key={folder.folder_id} value={folder.folder_id}>
                  {folder.folder_name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="panel-subtle p-4 text-sm text-slate-500">当前目录下暂无收藏条目。</div>
            ) : (
              items.map((item) => (
                <div key={item.favorite_id} className="panel-subtle p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {favoriteTypeLabel(item.favorite_type)}
                        <span className="ml-2 font-normal text-slate-300">{getFavoriteDisplayName(item)}</span>
                      </p>
                      <p className="mt-1 text-xs text-slate-500">目录：{item.folder_id ? (folderNameById.get(item.folder_id) ?? '未分组') : '未分组'}</p>
                      {item.remark ? <p className="mt-2 text-sm text-slate-400">备注：{item.remark}</p> : null}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleMoveItem(item.favorite_id)} disabled={submitting}>
                      <MoveRight size={14} />
                      移动
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleDeleteItem(item.favorite_id)} disabled={submitting}>
                      取消收藏
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增目录</DialogTitle>
            <DialogDescription>创建一个新的收藏目录，用来归档报告、洞察和常用模型。</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleCreateFolder();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="favorite-folder-name-dialog">目录名称</Label>
              <Input
                id="favorite-folder-name-dialog"
                value={folderName}
                onChange={(event) => setFolderName(event.target.value)}
                placeholder="例如：周报收藏"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={submitting}>
                  取消
                </Button>
              </DialogClose>
              <Button type="submit" disabled={submitting}>
                创建目录
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateItemDialogOpen} onOpenChange={setIsCreateItemDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>新增收藏</DialogTitle>
            <DialogDescription>
              当前会保存到{selectedFolder?.folder_name ? `“${selectedFolder.folder_name}”` : '当前视图'}，你也可以先切换目录再发起收藏。
            </DialogDescription>
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
                <p className="text-xs text-amber-300">当前类型暂无可选对象，请从报告页或历史页直接点击“收藏”。</p>
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

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={submitting}>
                  取消
                </Button>
              </DialogClose>
              <Button type="submit" disabled={submitting}>
                新增收藏
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
