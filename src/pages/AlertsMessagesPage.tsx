import { BellRing, MailOpen, Radar } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  createAlert,
  deleteAlert,
  getAlerts,
  getMessages,
  markAllMessagesRead,
  markMessageRead,
  updateAlert,
} from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import type { AlertItem, AlertStatus, MessageItem, ObjectType } from '@/types';

export function AlertsMessagesPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [objectName, setObjectName] = useState('');
  const [objectType, setObjectType] = useState<ObjectType>('company');
  const [pushInApp, setPushInApp] = useState(true);
  const [pushEmail, setPushEmail] = useState(false);
  const [scheduleRule, setScheduleRule] = useState('daily');
  const [alertStatusDrafts, setAlertStatusDrafts] = useState<Record<string, AlertStatus>>({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAlerts = async () => {
    const response = await getAlerts({ page: 1, page_size: 20 });
    setAlerts(response.list);
    setAlertStatusDrafts((prev) => {
      const next = { ...prev };
      response.list.forEach((item) => {
        if (!next[item.alert_id]) {
          next[item.alert_id] = item.status;
        }
      });
      return next;
    });
  };

  const loadMessages = async () => {
    const response = await getMessages({ page: 1, page_size: 20 });
    setMessages(response.list);
  };

  const loadAll = async () => {
    try {
      await Promise.all([loadAlerts(), loadMessages()]);
      setMessage('');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '加载提醒与消息失败';
      setMessage(reason);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const handleCreateAlert = async () => {
    if (!objectName.trim()) {
      setMessage('请先填写监控对象名称。');
      return;
    }
    try {
      setSubmitting(true);
      const response = await createAlert({
        object_name: objectName.trim(),
        object_type: objectType,
        push_in_app: pushInApp,
        push_email: pushEmail,
        schedule_rule: scheduleRule,
      });
      setMessage(`提醒创建成功：${response.alert_id}`);
      setObjectName('');
      await loadAlerts();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '创建提醒失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAlertStatus = async (alertId: string, nextStatus: AlertStatus) => {
    try {
      setSubmitting(true);
      const response = await updateAlert(alertId, { status: nextStatus });
      setMessage(`提醒已更新：${response.updated_fields.join(', ') || '无字段变化'}`);
      await loadAlerts();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '更新提醒失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      setSubmitting(true);
      const response = await deleteAlert(alertId);
      setMessage(`删除提醒结果：${response.result}`);
      await loadAlerts();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '删除提醒失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkMessageRead = async (messageId: string) => {
    try {
      setSubmitting(true);
      const response = await markMessageRead(messageId);
      setMessage(`消息已读：${response.message_id}`);
      await loadMessages();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '标记消息已读失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAllMessagesRead = async () => {
    try {
      setSubmitting(true);
      const response = await markAllMessagesRead();
      setMessage(`全部已读完成，数量：${response.affected_count}`);
      await loadMessages();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '全部标记已读失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="提醒消息"
      subtitle="配置对象提醒，查看站内消息和已读状态。"
    >
      {message ? <div className="message-strip mb-6">{message}</div> : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <Card className="space-y-6">
          <div className="flex items-center gap-2">
            <Radar size={16} className="text-[#63cab7]" />
            <h2 className="text-2xl font-semibold text-slate-100">提醒配置</h2>
          </div>
          <p className="text-sm text-slate-400">支持对象监控、推送频率、站内通知和邮件通知。</p>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="alert-object-name">监控对象</Label>
              <Input id="alert-object-name" value={objectName} onChange={(event) => setObjectName(event.target.value)} placeholder="例如：腾讯控股" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="alert-object-type">对象类型</Label>
                <Select id="alert-object-type" value={objectType} onChange={(event) => setObjectType(event.target.value as ObjectType)}>
                  <option value="company">公司</option>
                  <option value="stock">股票</option>
                  <option value="commodity">商品</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="alert-schedule-rule">推送频率</Label>
                <Select id="alert-schedule-rule" value={scheduleRule} onChange={(event) => setScheduleRule(event.target.value)}>
                  <option value="daily">每日</option>
                  <option value="weekly">每周</option>
                  <option value="realtime">实时</option>
                </Select>
              </div>
            </div>
            <div className="panel-subtle flex flex-wrap gap-6 p-4">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={pushInApp} onChange={(event) => setPushInApp(event.target.checked)} className="h-4 w-4 rounded border-[rgba(99,202,183,0.3)] accent-[#63cab7]" />
                站内推送
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={pushEmail} onChange={(event) => setPushEmail(event.target.checked)} className="h-4 w-4 rounded border-[rgba(99,202,183,0.3)] accent-[#63cab7]" />
                邮件推送
              </label>
            </div>
            <Button onClick={handleCreateAlert} disabled={submitting}>创建提醒</Button>
          </div>

          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => {
                const nextStatus = alertStatusDrafts[alert.alert_id] ?? alert.status;
                return (
                  <div key={alert.alert_id} className="panel-subtle p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{alert.object_name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {alert.object_type === 'company' ? '公司' : alert.object_type === 'stock' ? '股票' : '商品'} ·
                          {alert.schedule_rule === 'daily' ? ' 每日' : alert.schedule_rule === 'weekly' ? ' 每周' : ' 实时'} 推送
                        </p>
                      </div>
                      <StatusBadge status={alert.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Select value={nextStatus} onChange={(event) => setAlertStatusDrafts((prev) => ({ ...prev, [alert.alert_id]: event.target.value as AlertStatus }))} className="max-w-[150px]" size="sm">
                        <option value="enabled">启用</option>
                        <option value="disabled">禁用</option>
                      </Select>
                      <Button size="sm" variant="secondary" onClick={() => handleToggleAlertStatus(alert.alert_id, nextStatus)} disabled={submitting}>更新状态</Button>
                      <Button size="sm" variant="secondary" onClick={() => handleDeleteAlert(alert.alert_id)} disabled={submitting}>删除</Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="panel-subtle p-4 text-sm text-slate-500">还没有提醒策略。</div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card variant="glow" className="space-y-5">
            <div className="flex items-center gap-2">
              <BellRing size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">站内消息</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="data-pill">消息总数 {messages.length}</span>
              <span className="data-pill">未读 {messages.filter((item) => !item.read_status).length}</span>
            </div>
            <Button variant="secondary" onClick={handleMarkAllMessagesRead} disabled={submitting}>
              <MailOpen size={14} />
              全部标记已读
            </Button>
            <div className="space-y-3">
              {messages.length > 0 ? (
                messages.map((item) => (
                  <div key={item.message_id} className="panel-subtle p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{item.content}</p>
                      </div>
                      <StatusBadge status={item.read_status ? 'read' : 'unread'} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">{item.created_at}</span>
                      {!item.read_status ? (
                        <Button size="sm" variant="secondary" onClick={() => handleMarkMessageRead(item.message_id)} disabled={submitting}>
                          标记已读
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="panel-subtle p-4 text-sm text-slate-500">当前没有站内消息。</div>
              )}
            </div>
          </Card>


        </div>
      </div>
    </PageShell>
  );
}
