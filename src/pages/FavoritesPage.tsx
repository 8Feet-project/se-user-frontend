import { useEffect, useMemo, useState } from 'react';
import {
  createFavoriteFolder,
  createFavoriteItem,
  deleteFavoriteFolder,
  deleteFavoriteItem,
  getFavoriteFolders,
  getFavoriteItems,
  moveFavoriteItem,
  updateFavoriteFolder,
} from '../api/client';
import { PageShell } from '../components/common/PageShell';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import type { FavoriteFolder, FavoriteItem, FavoriteType } from '../types';

const favoriteTypes: FavoriteType[] = ['insight', 'report', 'model'];

export function FavoritesPage() {
  const [folders, setFolders] = useState<FavoriteFolder[]>([]);
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [folderName, setFolderName] = useState('');
  const [editingFolderName, setEditingFolderName] = useState('');
  const [favoriteType, setFavoriteType] = useState<FavoriteType>('report');
  const [targetId, setTargetId] = useState('');
  const [remark, setRemark] = useState('');
  const [moveTargetFolderId, setMoveTargetFolderId] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.folder_id === selectedFolderId),
    [folders, selectedFolderId]
  );

  const loadFolders = async () => {
    const response = await getFavoriteFolders();
    setFolders(response.folders);
    if (!selectedFolderId && response.default_folder_id) {
      setSelectedFolderId(response.default_folder_id);
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

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setMessage('请输入新目录名称。');
      return;
    }
    try {
      setSubmitting(true);
      const response = await createFavoriteFolder({ folder_name: folderName.trim() });
      setFolderName('');
      setMessage(`已创建目录：${response.folder_name}`);
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
      setMessage('请先选择目录并输入新名称。');
      return;
    }
    try {
      setSubmitting(true);
      const response = await updateFavoriteFolder(selectedFolderId, {
        folder_name: editingFolderName.trim(),
      });
      setMessage(`目录更新字段：${response.updated_fields.join(', ') || '无变化'}`);
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
      setMessage('请输入 target_id。');
      return;
    }
    try {
      setSubmitting(true);
      const response = await createFavoriteItem({
        favorite_type: favoriteType,
        target_id: targetId.trim(),
        folder_id: selectedFolderId || undefined,
        remark: remark.trim() || undefined,
      });
      setTargetId('');
      setRemark('');
      setMessage(`收藏成功：${response.favorite_id}`);
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
      setMessage('请先选择要移动到的目录。');
      return;
    }
    try {
      setSubmitting(true);
      const response = await moveFavoriteItem(favoriteId, {
        target_folder_id: moveTargetFolderId,
      });
      setMessage(`已移动：${response.favorite_id} -> ${response.target_folder_id}`);
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
      setMessage(`取消收藏：${response.target_id}`);
      await loadItems(selectedFolderId || undefined);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '取消收藏失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="收藏夹与收藏" subtitle="对齐 /api/v1/favorites/folders 与 /api/v1/favorites/items 系列接口。">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">收藏夹目录</h2>
            <p className="mt-2 text-sm text-slate-600">支持目录查询、创建、修改、删除。</p>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="favorite-folder-select">当前目录</Label>
            <select
              id="favorite-folder-select"
              className="h-12 rounded-full border border-slate-300 px-4 text-sm"
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
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-folder-name">新目录名称</Label>
              <Input
                id="new-folder-name"
                value={folderName}
                onChange={(event) => setFolderName(event.target.value)}
                placeholder="例如：周报收藏"
              />
              <Button size="sm" onClick={handleCreateFolder} disabled={submitting}>
                创建目录
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-folder-name">修改目录名称</Label>
              <Input
                id="edit-folder-name"
                value={editingFolderName}
                onChange={(event) => setEditingFolderName(event.target.value)}
                placeholder="输入新的目录名称"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={handleUpdateFolder} disabled={submitting}>
                  修改目录
                </Button>
                <Button size="sm" variant="secondary" onClick={handleDeleteFolder} disabled={submitting}>
                  删除目录
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-700">当前目录：{selectedFolder?.folder_name ?? '全部目录'}</p>
            <p className="text-sm text-slate-700">目录总数：{folders.length}</p>
          </div>
        </Card>

        <Card className="space-y-6 bg-slate-950 text-white">
          <div>
            <h3 className="text-xl font-semibold">收藏项管理</h3>
            <p className="mt-2 text-sm text-slate-300">支持收藏项查询、新增、移动与取消收藏。</p>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="favorite-type">favorite_type</Label>
            <select
              id="favorite-type"
              className="h-12 rounded-full border border-slate-700 bg-slate-900 px-4 text-sm text-white"
              value={favoriteType}
              onChange={(event) => setFavoriteType(event.target.value as FavoriteType)}
            >
              {favoriteTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <Label htmlFor="favorite-target-id">target_id</Label>
            <Input
              id="favorite-target-id"
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              placeholder="例如：report-001"
              className="bg-slate-900 text-white placeholder:text-slate-500"
            />
            <Label htmlFor="favorite-remark">remark（可选）</Label>
            <Input
              id="favorite-remark"
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              placeholder="例如：重点参考"
              className="bg-slate-900 text-white placeholder:text-slate-500"
            />
            <Button onClick={handleCreateItem} disabled={submitting}>
              新增收藏
            </Button>
          </div>

          <div className="space-y-3">
            <Label htmlFor="move-target-folder">移动到目录</Label>
            <select
              id="move-target-folder"
              className="h-10 rounded-full border border-slate-700 bg-slate-900 px-4 text-sm text-white"
              value={moveTargetFolderId}
              onChange={(event) => setMoveTargetFolderId(event.target.value)}
            >
              <option value="">请选择目录</option>
              {folders.map((folder) => (
                <option key={folder.folder_id} value={folder.folder_id}>
                  {folder.folder_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.favorite_id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm font-semibold">{item.favorite_type} / {item.target_id}</p>
                <p className="mt-1 text-xs text-slate-400">favorite_id: {item.favorite_id}</p>
                <p className="text-xs text-slate-400">folder_id: {item.folder_id ?? '-'}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleMoveItem(item.favorite_id)} disabled={submitting}>
                    移动
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleDeleteItem(item.favorite_id)} disabled={submitting}>
                    取消收藏
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </PageShell>
  );
}
