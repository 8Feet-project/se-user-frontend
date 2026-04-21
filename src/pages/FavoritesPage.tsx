import { FolderKanban, MoveRight, Star } from 'lucide-react';
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
} from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { FavoriteFolder, FavoriteItem, FavoriteType } from '@/types';

const favoriteTypes: FavoriteType[] = ['insight', 'report', 'model'];

function favoriteTypeLabel(type: FavoriteType) {
  if (type === 'insight') return '洞察';
  if (type === 'report') return '报告';
  return '模型';
}

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
      setMessage('请输入新的目录名称。');
      return;
    }
    try {
      setSubmitting(true);
      const response = await createFavoriteFolder({ folder_name: folderName.trim() });
      setFolderName('');
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
      setMessage('请输入要收藏的内容 ID。');
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
      setMessage('请先选择目标目录。');
      return;
    }
    try {
      setSubmitting(true);
      const response = await moveFavoriteItem(favoriteId, {
        target_folder_id: moveTargetFolderId,
      });
      setMessage(`移动成功：${response.favorite_id} -> ${response.target_folder_id}`);
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
    <PageShell
      title="收藏夹"
      subtitle="管理收藏目录与收藏条目，把高价值的报告、洞察和常用模型沉淀成可复用资产。"
    >
      {message ? <div className="message-strip mb-6">{message}</div> : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <Card className="space-y-6">
          <div className="flex items-center gap-2">
            <FolderKanban size={16} className="text-[#63cab7]" />
            <h2 className="text-2xl font-semibold text-slate-100">收藏目录</h2>
          </div>
          <p className="text-sm text-slate-400">支持目录查询、创建、重命名与删除，用统一的卡片层级管理沉淀内容。</p>

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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="new-folder-name">新目录名称</Label>
              <Input id="new-folder-name" value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="例如：周报收藏" />
              <Button size="sm" onClick={handleCreateFolder} disabled={submitting}>
                创建目录
              </Button>
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
          </div>

          <div className="panel-subtle p-4 text-sm text-slate-300">
            <p>当前目录：{selectedFolder?.folder_name ?? '全部目录'}</p>
            <p className="mt-1 text-slate-400">目录总数：{folders.length}</p>
          </div>
        </Card>

        <Card variant="glow" className="space-y-6">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-[#63cab7]" />
            <h3 className="text-xl font-semibold text-slate-100">收藏条目</h3>
          </div>
          <p className="text-sm text-slate-400">支持新增收藏、指定目录、备注说明以及跨目录移动。</p>

          <div className="grid gap-3">
            <Label htmlFor="favorite-type">收藏类型</Label>
            <Select id="favorite-type" value={favoriteType} onChange={(event) => setFavoriteType(event.target.value as FavoriteType)}>
              {favoriteTypes.map((type) => (
                <option key={type} value={type}>
                  {favoriteTypeLabel(type)}
                </option>
              ))}
            </Select>

            <Label htmlFor="favorite-target-id">内容 ID</Label>
            <Input id="favorite-target-id" value={targetId} onChange={(event) => setTargetId(event.target.value)} placeholder="例如：report-001" />

            <Label htmlFor="favorite-remark">备注（可选）</Label>
            <Input id="favorite-remark" value={remark} onChange={(event) => setRemark(event.target.value)} placeholder="例如：高价值参考样本" />

            <Button onClick={handleCreateItem} disabled={submitting}>
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
                        <span className="ml-2 font-normal text-slate-500">{item.target_id}</span>
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{item.favorite_id}</p>
                      <p className="text-xs text-slate-500">目录：{item.folder_id ?? '-'}</p>
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
    </PageShell>
  );
}
